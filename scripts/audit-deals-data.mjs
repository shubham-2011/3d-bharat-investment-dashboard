// scripts/audit-deals-data.mjs
// Automated test harness certifying QA-DEAL-EXPLORER requirements at the service layer

import deals from "../src/data/deals.json" with { type: "json" };
import investors from "../src/data/investors.json" with { type: "json" };
import { dealService } from "../src/services/dealService.js";
import { rankDeals, scoreDeal } from "../src/utils/scoring.js";

const errors = [];
const check = (cond, id, msg) => {
  if (!cond) errors.push(`[${id}] ${msg}`);
};

// Resilient wrapper against simulated network drops during automated audit
async function fetchSafe(fn, retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
    }
  }
}

console.log("Starting QA-DEAL-EXPLORER service & data layer audit...");

// -------------------------------------------------------------
// DE-T01: ROI & Investment Range Filters
// -------------------------------------------------------------
{
  // Test ROI >= 15% filter
  const roi15Filtered = await fetchSafe(() => dealService.getDeals({ filters: { roiMin: 15 }, pageSize: 100 }));
  check(roi15Filtered.total > 0, "DE-T01", "ROI >= 15% should return matching deals");
  check(
    roi15Filtered.data.every((d) => d.roi >= 15),
    "DE-T01",
    "Every deal returned under roiMin=15 must have roi >= 15"
  );

  // Test Entry < 1 Cr (minInvestment <= 100 Lakhs)
  const entryLt1Cr = await fetchSafe(() => dealService.getDeals({ filters: { investmentMax: 100 }, pageSize: 100 }));
  check(entryLt1Cr.total > 0, "DE-T01", "Entry < 1 Cr should return deals");
  check(
    entryLt1Cr.data.every((d) => d.minInvestment <= 100),
    "DE-T01",
    "Every deal returned under investmentMax=100 must have minInvestment <= 100"
  );

  // Combined DE-T01: roiMin=15 AND investmentMax=100
  const combinedT01 = await fetchSafe(() =>
    dealService.getDeals({
      filters: { roiMin: 15, investmentMax: 100 },
      pageSize: 100,
    })
  );
  check(
    combinedT01.data.every((d) => d.roi >= 15 && d.minInvestment <= 100),
    "DE-T01",
    "Combined ROI >= 15% and Entry < 1 Cr must satisfy both conditions"
  );
}

// -------------------------------------------------------------
// DE-F02: Search scope (name, company, industry, location, case-insensitive)
// -------------------------------------------------------------
{
  const searchMumbai = await fetchSafe(() => dealService.getDeals({ search: "MUMBAI", pageSize: 100 }));
  check(
    searchMumbai.total > 0 &&
      searchMumbai.data.every((d) =>
        d.projectName.toLowerCase().includes("mumbai") ||
        d.company.toLowerCase().includes("mumbai") ||
        d.industry.toLowerCase().includes("mumbai") ||
        d.location.toLowerCase().includes("mumbai")
      ),
    "DE-F02",
    "Uppercase search MUMBAI matches case-insensitively across name, company, industry, location"
  );

  const searchSolar = await fetchSafe(() => dealService.getDeals({ search: "solar", pageSize: 100 }));
  check(
    searchSolar.total > 0 &&
      searchSolar.data.every((d) =>
        d.projectName.toLowerCase().includes("solar") ||
        d.company.toLowerCase().includes("solar") ||
        d.industry.toLowerCase().includes("solar") ||
        d.location.toLowerCase().includes("solar")
      ),
    "DE-F02",
    "Search solar matches relevant deals"
  );
}

// -------------------------------------------------------------
// DE-F03: Filters combine with AND across groups
// -------------------------------------------------------------
{
  const andGroup = await fetchSafe(() =>
    dealService.getDeals({
      filters: { industries: ["Bridges"], riskLevels: ["High"], roiMin: 20 },
      pageSize: 100,
    })
  );
  check(
    andGroup.data.every((d) => d.industry === "Bridges" && d.riskLevel === "High" && d.roi >= 20),
    "DE-F03",
    "Filters combine with AND across Industry, Risk, and ROI groups"
  );
}

// -------------------------------------------------------------
// DE-F04: Multi-select within a group is OR
// -------------------------------------------------------------
{
  const orGroup = await fetchSafe(() =>
    dealService.getDeals({
      filters: { industries: ["Roads", "Metro"] },
      pageSize: 100,
    })
  );
  check(
    orGroup.total > 0 &&
      orGroup.data.every((d) => d.industry === "Roads" || d.industry === "Metro"),
    "DE-F04",
    "Multiple industries in filter behave as union (OR)"
  );
  check(
    orGroup.data.some((d) => d.industry === "Roads") && orGroup.data.some((d) => d.industry === "Metro"),
    "DE-F04",
    "Multi-select union contains both Roads and Metro deals"
  );
}

// -------------------------------------------------------------
// DE-F06: Sort correctness per mode
// -------------------------------------------------------------
{
  // roi-desc
  const sortRoiDesc = await fetchSafe(() => dealService.getDeals({ sort: "roi-desc", pageSize: 100 }));
  for (let i = 0; i < sortRoiDesc.data.length - 1; i++) {
    check(
      sortRoiDesc.data[i].roi >= sortRoiDesc.data[i + 1].roi,
      "DE-F06",
      `ROI desc strictly non-increasing at index ${i}`
    );
  }

  // roi-asc
  const sortRoiAsc = await fetchSafe(() => dealService.getDeals({ sort: "roi-asc", pageSize: 100 }));
  for (let i = 0; i < sortRoiAsc.data.length - 1; i++) {
    check(
      sortRoiAsc.data[i].roi <= sortRoiAsc.data[i + 1].roi,
      "DE-F06",
      `ROI asc strictly non-decreasing at index ${i}`
    );
  }

  // funding-desc
  const sortFunding = await fetchSafe(() => dealService.getDeals({ sort: "funding-desc", pageSize: 100 }));
  for (let i = 0; i < sortFunding.data.length - 1; i++) {
    check(
      sortFunding.data[i].fundingRaised >= sortFunding.data[i + 1].fundingRaised,
      "DE-F06",
      `Funding desc strictly non-increasing at index ${i}`
    );
  }

  // risk-asc (Low -> Medium -> High)
  const sortRisk = await fetchSafe(() => dealService.getDeals({ sort: "risk-asc", pageSize: 100 }));
  const riskRanks = { Low: 0, Medium: 1, High: 2 };
  for (let i = 0; i < sortRisk.data.length - 1; i++) {
    check(
      riskRanks[sortRisk.data[i].riskLevel] <= riskRanks[sortRisk.data[i + 1].riskLevel],
      "DE-F06",
      `Risk asc Low -> Med -> High at index ${i}`
    );
  }
}

// -------------------------------------------------------------
// DE-F07: Pagination integrity (12 per page, 80 total -> page 7 has 8)
// -------------------------------------------------------------
{
  const page1 = await fetchSafe(() => dealService.getDeals({ page: 1, pageSize: 12 }));
  const page2 = await fetchSafe(() => dealService.getDeals({ page: 2, pageSize: 12 }));
  const page7 = await fetchSafe(() => dealService.getDeals({ page: 7, pageSize: 12 }));

  check(page1.data.length === 12, "DE-F07", "Page 1 has 12 items");
  check(page2.data.length === 12, "DE-F07", "Page 2 has 12 items");
  check(page7.data.length === 8, "DE-F07", "Page 7 has 8 remainder items (80 total)");
  check(page1.totalPages === 7, "DE-F07", "Total pages is 7 for 80 deals / 12 per page");

  const page1Ids = new Set(page1.data.map((d) => d.id));
  const page2Ids = new Set(page2.data.map((d) => d.id));
  const intersection = [...page1Ids].filter((id) => page2Ids.has(id));
  check(intersection.length === 0, "DE-F07", "No overlap of deal IDs between page 1 and page 2");
}

// -------------------------------------------------------------
// DE-F10: Match % computation & null guards
// -------------------------------------------------------------
{
  const me = investors.find((i) => i.id === "inv-001");
  const ranked = rankDeals(deals, me);
  check(ranked.length === deals.length, "DE-F10", "rankDeals preserves length");
  check(
    ranked.every((d) => typeof d.matchScore === "number" && !isNaN(d.matchScore)),
    "DE-F10",
    "Every deal has a valid numeric matchScore"
  );

  // Null guard: investor is null/undefined
  const rankNullInvestor = rankDeals(deals, null);
  check(
    rankNullInvestor.every((d) => d.matchScore === undefined),
    "DE-F10",
    "rankDeals without investor profile returns deals with undefined matchScore (never NaN)"
  );
}

// -------------------------------------------------------------
// DE-N01: Empty search & DE-N06: Whitespace-only search
// -------------------------------------------------------------
{
  const emptyRes = await fetchSafe(() => dealService.getDeals({ search: "zzzznonexistentquery999" }));
  check(emptyRes.total === 0 && emptyRes.data.length === 0, "DE-N01", "Non-existent search returns 0 deals");

  const whitespaceRes = await fetchSafe(() => dealService.getDeals({ search: "    " }));
  check(whitespaceRes.total === deals.length, "DE-N06", "Whitespace-only search returns full dataset (80 deals)");
}

// -------------------------------------------------------------
// DE-E01: Boundary test: exact ROI boundary check (inclusive)
// -------------------------------------------------------------
{
  const knownDeal = deals[0]; // e.g. roi: 17.8
  const exactRoi = knownDeal.roi;
  const boundaryRes = await fetchSafe(() => dealService.getDeals({ filters: { roiMin: exactRoi }, pageSize: 100 }));
  check(
    boundaryRes.data.some((d) => d.id === knownDeal.id),
    "DE-E01",
    `Exact ROI filter roiMin=${exactRoi} inclusively includes deal ${knownDeal.id}`
  );
}

console.log("-------------------------------------------------------------");
if (errors.length > 0) {
  console.error(`FAIL — ${errors.length} service audit errors found:\n` + errors.join("\n"));
  process.exit(1);
} else {
  console.log(`PASS — All QA-DEAL-EXPLORER service & data layer audits green (${deals.length} deals certified).`);
}
