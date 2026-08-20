import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "../src/data");

const errors = [];
const check = (cond, msg) => {
  if (!cond) errors.push(msg);
};

const VALID_INDUSTRIES = [
  "Roads",
  "Metro",
  "Railway",
  "Solar",
  "Bridges",
  "Smart City",
  "Water",
  "Ports",
  "Airports",
];

const VALID_RISKS = ["Low", "Medium", "High"];
const VALID_STAGES = ["Planning", "Approved", "In Progress", "Expansion"];
const VALID_REVENUE_PATTERNS = ["growing", "flat", "declining"];

try {
  const growthPath = path.join(dataDir, "investmentGrowth.json");
  const industryPath = path.join(dataDir, "industryDistribution.json");
  const dealsPath = path.join(dataDir, "deals.json");
  const investorsPath = path.join(dataDir, "investors.json");
  const analyticsPath = path.join(dataDir, "corporateAnalytics.json");

  check(fs.existsSync(growthPath), "R1: investmentGrowth.json does not exist");
  check(fs.existsSync(industryPath), "R2: industryDistribution.json does not exist");
  check(fs.existsSync(dealsPath), "R3: deals.json does not exist");
  check(fs.existsSync(investorsPath), "R4: investors.json does not exist");
  check(fs.existsSync(analyticsPath), "R5: corporateAnalytics.json does not exist");

  const investmentGrowth = JSON.parse(fs.readFileSync(growthPath, "utf8"));
  const industryDistribution = JSON.parse(fs.readFileSync(industryPath, "utf8"));
  const deals = JSON.parse(fs.readFileSync(dealsPath, "utf8"));
  const investors = JSON.parse(fs.readFileSync(investorsPath, "utf8"));
  const corporateAnalytics = JSON.parse(fs.readFileSync(analyticsPath, "utf8"));

  // ==========================================
  // File 1 — investmentGrowth.json
  // ==========================================
  check(Array.isArray(investmentGrowth), "R1: investmentGrowth must be an array");
  check(investmentGrowth.length === 24, `R1: investmentGrowth must have exactly 24 points, got ${investmentGrowth.length}`);

  if (Array.isArray(investmentGrowth) && investmentGrowth.length === 24) {
    // Check consecutive ISO months
    for (let i = 0; i < 24; i++) {
      const p = investmentGrowth[i];
      check(p && typeof p.month === "string" && /^\d{4}-\d{2}$/.test(p.month), `R1: Point ${i} invalid month format: ${p?.month}`);
      check(typeof p?.value === "number" && !isNaN(p.value), `R1: Point ${i} invalid value: ${p?.value}`);
      if (i > 0) {
        const [prevY, prevM] = investmentGrowth[i - 1].month.split("-").map(Number);
        const [currY, currM] = p.month.split("-").map(Number);
        const expectedM = prevM === 12 ? 1 : prevM + 1;
        const expectedY = prevM === 12 ? prevY + 1 : prevY;
        check(
          currY === expectedY && currM === expectedM,
          `R1: Months not consecutive at point ${i}: ${investmentGrowth[i - 1].month} -> ${p.month}`
        );
      }
    }

    const v0 = investmentGrowth[0].value;
    const v23 = investmentGrowth[23].value;
    check(v0 >= 1.6 && v0 <= 2.6, `R1: Start value must be in [1.6, 2.6], got ${v0}`);
    check(v23 >= 15.0 && v23 <= 21.0, `R1: End value must be in [15, 21], got ${v23}`);

    // Check MoM changes
    const dipIndices = [];
    for (let i = 1; i < 24; i++) {
      const prev = investmentGrowth[i - 1].value;
      const curr = investmentGrowth[i].value;
      const change = (curr - prev) / prev;
      check(Math.abs(change) <= 0.35 + 1e-4, `R1: Absolute MoM change at index ${i} exceeds 35%: ${(change * 100).toFixed(2)}%`);

      if (change >= -0.17 - 1e-4 && change <= -0.13 + 1e-4) {
        dipIndices.push(i);
      }
    }

    check(dipIndices.length === 3, `R1: Must have exactly 3 dip months in [-17%, -13%], got ${dipIndices.length} (indices: ${dipIndices.join(", ")})`);

    if (dipIndices.length === 3) {
      // Never consecutive
      check(dipIndices[1] > dipIndices[0] + 1 && dipIndices[2] > dipIndices[1] + 1, `R1: Dip months must not be consecutive: ${dipIndices.join(", ")}`);
      // Spread across thirds: 1 in 1..7, 1 in 8..15, 1 in 16..22
      check(dipIndices[0] >= 1 && dipIndices[0] <= 7, `R1: First dip must be in third 1 (1..7), got index ${dipIndices[0]}`);
      check(dipIndices[1] >= 8 && dipIndices[1] <= 15, `R1: Second dip must be in third 2 (8..15), got index ${dipIndices[1]}`);
      check(dipIndices[2] >= 16 && dipIndices[2] <= 22, `R1: Third dip must be in third 3 (16..22), got index ${dipIndices[2]}`);

      // Recoveries
      for (const d of dipIndices) {
        if (d + 1 < 24) {
          const prev = investmentGrowth[d].value;
          const curr = investmentGrowth[d + 1].value;
          const recChange = (curr - prev) / prev;
          check(
            recChange >= 0.16 - 1e-4 && recChange <= 0.20 + 1e-4,
            `R1: Month after dip at ${d} (index ${d + 1}) must recover [+16%, +20%], got ${(recChange * 100).toFixed(2)}%`
          );
        }
      }

      // Normal months
      const dipAndRec = new Set([...dipIndices, ...dipIndices.map((d) => d + 1)]);
      for (let i = 1; i < 24; i++) {
        if (!dipAndRec.has(i)) {
          const prev = investmentGrowth[i - 1].value;
          const curr = investmentGrowth[i].value;
          const normChange = (curr - prev) / prev;
          check(
            normChange >= 0.08 - 1e-4 && normChange <= 0.12 + 1e-4,
            `R1: Normal month at index ${i} must have +8%–12% growth, got ${(normChange * 100).toFixed(2)}%`
          );
        }
      }
    }
  }

  // ==========================================
  // File 3 — deals.json
  // ==========================================
  check(Array.isArray(deals), "R3: deals must be an array");
  check(deals.length === 80, `R3: deals must have exactly 80 items, got ${deals.length}`);

  const projectNames = new Set();
  const companies = new Set();
  const cities = new Set();
  const firstYearRevenues = new Set();
  const projRoiRatios = [];
  const personalities = new Set();

  let lowCount = 0;
  let medCount = 0;
  let highCount = 0;
  let outlierCount = 0;
  let growingCount = 0;
  let flatCount = 0;
  let decliningCount = 0;
  let decliningHighCount = 0;

  let minDealSize = Infinity;
  let maxDealSize = -Infinity;

  if (Array.isArray(deals) && deals.length === 80) {
    let prevCreatedAt = null;

    deals.forEach((d, idx) => {
      const idNum = idx + 1;
      const expectedId = `deal-${String(idNum).padStart(3, "0")}`;
      check(d.id === expectedId, `R3: Deal at index ${idx} has id ${d.id}, expected ${expectedId}`);

      // Basic fields
      check(typeof d.projectName === "string" && d.projectName.trim().length > 0, `R3: ${d.id} missing valid projectName`);
      projectNames.add(d.projectName);

      check(typeof d.company === "string" && d.company.trim().length > 0, `R3: ${d.id} missing valid company`);
      companies.add(d.company);

      check(VALID_INDUSTRIES.includes(d.industry), `R3: ${d.id} invalid industry ${d.industry}`);
      check(VALID_RISKS.includes(d.riskLevel), `R3: ${d.id} invalid riskLevel ${d.riskLevel}`);
      check(typeof d.roi === "number" && !isNaN(d.roi), `R3: ${d.id} invalid roi`);
      check(typeof d.isOutlier === "boolean", `R3: ${d.id} isOutlier must be boolean`);

      check(VALID_STAGES.includes(d.stage), `R3: ${d.id} invalid stage ${d.stage}`);
      check(typeof d.location === "string" && d.location.includes(", "), `R3: ${d.id} invalid location format: ${d.location}`);
      if (d.location) cities.add(d.location.split(",")[0].trim());

      // Date order
      check(typeof d.createdAt === "string" && !isNaN(Date.parse(d.createdAt)), `R3: ${d.id} invalid createdAt`);
      const dt = new Date(d.createdAt);
      const yr = dt.getUTCFullYear();
      check(yr === 2025 || yr === 2026, `R3: ${d.id} createdAt year must be 2025 or 2026, got ${yr}`);
      if (prevCreatedAt !== null) {
        check(new Date(d.createdAt) >= new Date(prevCreatedAt), `R3: ${d.id} createdAt not in ascending order: ${prevCreatedAt} -> ${d.createdAt}`);
      }
      prevCreatedAt = d.createdAt;

      // Description
      check(
        typeof d.description === "string" && d.description.includes("3D point-cloud monitoring"),
        `R3: ${d.id} description must mention '3D point-cloud monitoring'`
      );

      // Deal size & investments
      check(typeof d.dealSize === "number" && d.dealSize > 0, `R3: ${d.id} invalid dealSize`);
      check(d.fundingTarget === d.dealSize, `R3: ${d.id} fundingTarget (${d.fundingTarget}) !== dealSize (${d.dealSize})`);
      check(typeof d.minInvestment === "number" && d.minInvestment > 0, `R3: ${d.id} invalid minInvestment`);
      check(typeof d.maxInvestment === "number" && d.maxInvestment > d.minInvestment, `R3: ${d.id} maxInvestment must be > minInvestment`);
      check(d.maxInvestment < d.dealSize, `R3: ${d.id} maxInvestment (${d.maxInvestment}) must be < dealSize (${d.dealSize})`);
      check(d.minInvestment < d.dealSize, `R3: ${d.id} minInvestment (${d.minInvestment}) must be < dealSize (${d.dealSize})`);

      // Funding raised
      check(typeof d.fundingRaised === "number", `R3: ${d.id} invalid fundingRaised`);
      const raisedPct = d.fundingRaised / d.fundingTarget;
      check(
        raisedPct >= 0.15 - 1e-4 && raisedPct <= 0.90 + 1e-4,
        `R3: ${d.id} fundingRaised must be 15–90% of target, got ${(raisedPct * 100).toFixed(1)}%`
      );

      minDealSize = Math.min(minDealSize, d.dealSize);
      maxDealSize = Math.max(maxDealSize, d.dealSize);

      // Investor count
      check(Number.isInteger(d.investorCount) && d.investorCount >= 2 && d.investorCount <= 40, `R3: ${d.id} investorCount must be int 2–40, got ${d.investorCount}`);

      // Risk & Outlier clusters
      if (d.isOutlier) {
        outlierCount++;
        if (d.riskLevel === "Low") {
          check(d.roi < 8 || d.roi > 15, `R3: Outlier Low deal ${d.id} roi (${d.roi}) must break [8, 15]`);
        } else if (d.riskLevel === "Medium") {
          check(d.roi < 14 || d.roi > 28, `R3: Outlier Medium deal ${d.id} roi (${d.roi}) must break [14, 28]`);
        } else if (d.riskLevel === "High") {
          check(d.roi < 25 || d.roi > 45, `R3: Outlier High deal ${d.id} roi (${d.roi}) must break [25, 45]`);
        }
      } else {
        if (d.riskLevel === "Low") {
          lowCount++;
          check(d.roi >= 8 && d.roi <= 15, `R3: Non-outlier Low deal ${d.id} roi must be in [8, 15], got ${d.roi}`);
        } else if (d.riskLevel === "Medium") {
          medCount++;
          check(d.roi >= 14 && d.roi <= 28, `R3: Non-outlier Medium deal ${d.id} roi must be in [14, 28], got ${d.roi}`);
        } else if (d.riskLevel === "High") {
          highCount++;
          check(d.roi >= 25 && d.roi <= 45, `R3: Non-outlier High deal ${d.id} roi must be in [25, 45], got ${d.roi}`);
        }
      }

      // Revenue pattern & Financials
      check(VALID_REVENUE_PATTERNS.includes(d.revenuePattern), `R3: ${d.id} invalid revenuePattern ${d.revenuePattern}`);
      if (d.revenuePattern === "growing") growingCount++;
      if (d.revenuePattern === "flat") flatCount++;
      if (d.revenuePattern === "declining") {
        decliningCount++;
        if (d.riskLevel === "High") decliningHighCount++;
      }

      check(d.financials && typeof d.financials === "object", `R3: ${d.id} missing financials`);
      if (d.financials) {
        check(
          typeof d.financials.profitMargin === "number" && d.financials.profitMargin >= 8 && d.financials.profitMargin <= 28,
          `R3: ${d.id} profitMargin must be in [8, 28], got ${d.financials.profitMargin}`
        );
        check(
          typeof d.financials.debtEquityRatio === "number" && d.financials.debtEquityRatio >= 0.2 && d.financials.debtEquityRatio <= 1.8,
          `R3: ${d.id} debtEquityRatio must be in [0.2, 1.8], got ${d.financials.debtEquityRatio}`
        );

        if (d.revenuePattern === "growing") {
          check(d.financials.growthRate > 0, `R3: ${d.id} growing deal must have positive growthRate, got ${d.financials.growthRate}`);
        } else if (d.revenuePattern === "declining") {
          check(d.financials.growthRate < 0, `R3: ${d.id} declining deal must have negative growthRate, got ${d.financials.growthRate}`);
        }

        check(
          Array.isArray(d.financials.revenue3y) && d.financials.revenue3y.length === 3,
          `R3: ${d.id} financials.revenue3y must have 3 items`
        );
        if (Array.isArray(d.financials.revenue3y) && d.financials.revenue3y.length === 3) {
          const [r23, r24, r25] = d.financials.revenue3y;
          check(r23.year === 2023 && r24.year === 2024 && r25.year === 2025, `R3: ${d.id} revenue3y years must be 2023, 2024, 2025`);
          firstYearRevenues.add(r23.revenue);

          const y1YoY = (r24.revenue - r23.revenue) / r23.revenue;
          const y2YoY = (r25.revenue - r24.revenue) / r24.revenue;

          if (d.revenuePattern === "growing") {
            check(y1YoY >= 0.15 - 0.01 && y1YoY <= 0.45 + 0.01, `R3: ${d.id} growing 2023->2024 YoY must be +15–45%, got ${(y1YoY * 100).toFixed(1)}%`);
            check(y2YoY >= 0.15 - 0.01 && y2YoY <= 0.45 + 0.01, `R3: ${d.id} growing 2024->2025 YoY must be +15–45%, got ${(y2YoY * 100).toFixed(1)}%`);
          } else if (d.revenuePattern === "flat") {
            check(y1YoY >= -0.08 - 0.01 && y1YoY <= 0.08 + 0.01, `R3: ${d.id} flat 2023->2024 YoY must be -8–+8%, got ${(y1YoY * 100).toFixed(1)}%`);
            check(y2YoY >= -0.08 - 0.01 && y2YoY <= 0.08 + 0.01, `R3: ${d.id} flat 2024->2025 YoY must be -8–+8%, got ${(y2YoY * 100).toFixed(1)}%`);
          } else if (d.revenuePattern === "declining") {
            check(y1YoY >= -0.32 - 0.01 && y1YoY <= -0.12 + 0.01, `R3: ${d.id} declining 2023->2024 YoY must be -12–-32%, got ${(y1YoY * 100).toFixed(1)}%`);
            check(y2YoY >= -0.32 - 0.01 && y2YoY <= -0.12 + 0.01, `R3: ${d.id} declining 2024->2025 YoY must be -12–-32%, got ${(y2YoY * 100).toFixed(1)}%`);
          }
        }
      }

      // ROI Projections
      check(
        Array.isArray(d.roiProjections) && d.roiProjections.length === 5,
        `R3: ${d.id} roiProjections must have exactly 5 rows (2026–2030)`
      );

      if (Array.isArray(d.roiProjections) && d.roiProjections.length === 5) {
        let prevGap = -Infinity;
        let prevProj = null;
        const years = [2026, 2027, 2028, 2029, 2030];

        // Track trajectory personality
        const projGrowthDeltas = [];

        d.roiProjections.forEach((p, pIdx) => {
          check(p.year === years[pIdx], `R3: ${d.id} roiProjections row ${pIdx} year must be ${years[pIdx]}, got ${p?.year}`);
          check(p.conservative < p.projected, `R3: ${d.id} year ${p.year} conservative (${p.conservative}) must be < projected (${p.projected})`);
          check(p.projected < p.optimistic, `R3: ${d.id} year ${p.year} projected (${p.projected}) must be < optimistic (${p.optimistic})`);

          const currentGap = p.optimistic - p.conservative;
          check(currentGap > prevGap, `R3: ${d.id} year ${p.year} gap (${currentGap.toFixed(2)}) must strictly widen from prev gap (${prevGap.toFixed(2)})`);
          prevGap = currentGap;

          if (prevProj !== null) {
            const projChange = (p.projected - prevProj) / prevProj;
            check(
              Math.abs(projChange) <= 0.30 + 1e-4,
              `R3: ${d.id} year ${p.year} projected change exceeds ±30%: ${(projChange * 100).toFixed(1)}%`
            );
            projGrowthDeltas.push(projChange);
          }
          prevProj = p.projected;
        });

        // First year projected / roi ratio
        const firstProjRatio = d.roiProjections[0].projected / d.roi;
        projRoiRatios.push(firstProjRatio);

        // Personality categorization
        if (projGrowthDeltas[0] > 0.15 && projGrowthDeltas[projGrowthDeltas.length - 1] < 0.08) {
          personalities.add("front-loaded");
        } else if (projGrowthDeltas[0] < 0.08 && projGrowthDeltas[projGrowthDeltas.length - 1] > 0.15) {
          personalities.add("accelerating");
        } else {
          personalities.add("steady");
        }
      }
    });

    // Statistical assertions across deals
    check(outlierCount >= 3 && outlierCount <= 4, `R3: Exactly 3–4 outliers required, got ${outlierCount}`);
    check(lowCount >= 22 && lowCount <= 28, `R3: Low cluster non-outliers must be 22–28, got ${lowCount}`);
    check(medCount >= 31 && medCount <= 38, `R3: Medium cluster non-outliers must be 31–38, got ${medCount}`);
    check(highCount >= 17 && highCount <= 22, `R3: High cluster non-outliers must be 17–22, got ${highCount}`);

    const dealSizeSpan = maxDealSize / minDealSize;
    check(dealSizeSpan >= 8.0 && dealSizeSpan <= 12.0, `R3: dealSize max/min span must be 8–12x, got ${dealSizeSpan.toFixed(2)}x (${minDealSize} to ${maxDealSize})`);

    // Revenue pattern splits
    const growingPct = (growingCount / 80) * 100;
    const flatPct = (flatCount / 80) * 100;
    const decliningPct = (decliningCount / 80) * 100;

    check(growingPct >= 54 && growingPct <= 66, `R3: Growing deals must be 60%±6 (54–66%), got ${growingPct.toFixed(1)}% (${growingCount})`);
    check(flatPct >= 19 && flatPct <= 31, `R3: Flat deals must be 25%±6 (19–31%), got ${flatPct.toFixed(1)}% (${flatCount})`);
    check(decliningPct >= 10 && decliningPct <= 20, `R3: Declining deals must be 15%±5 (10–20%), got ${decliningPct.toFixed(1)}% (${decliningCount})`);

    const decliningHighPct = decliningCount > 0 ? (decliningHighCount / decliningCount) * 100 : 0;
    check(decliningHighPct >= 60, `R3: At least 60% of declining deals must be High risk, got ${decliningHighPct.toFixed(1)}% (${decliningHighCount}/${decliningCount})`);

    // Diversity rules
    check(projectNames.size === 80, `R3 Diversity: All 80 projectName values must be unique, got ${projectNames.size}`);
    check(companies.size >= 15, `R3 Diversity: Company pool must have ≥15 unique names, got ${companies.size}`);
    check(cities.size >= 10, `R3 Diversity: Location must span ≥10 unique cities, got ${cities.size}`);

    const uniqueFirstYearPct = (firstYearRevenues.size / 80) * 100;
    check(
      uniqueFirstYearPct >= 70,
      `R3 Diversity: First-year revenues must have ≥70% unique values, got ${uniqueFirstYearPct.toFixed(1)}% (${firstYearRevenues.size}/80)`
    );

    const minRatio = Math.min(...projRoiRatios);
    const maxRatio = Math.max(...projRoiRatios);
    const ratioSpread = maxRatio - minRatio;
    check(
      ratioSpread > 0.25,
      `R3 Diversity: (year-1 projected ÷ roi) ratio across deals must vary by >0.25, got ${ratioSpread.toFixed(3)} (min ${minRatio.toFixed(3)}, max ${maxRatio.toFixed(3)})`
    );

    check(personalities.size >= 3, `R3 Diversity: Trajectories must have ≥3 distinct growth personalities, found ${personalities.size} (${Array.from(personalities).join(", ")})`);
  }

  // ==========================================
  // File 2 — industryDistribution.json
  // ==========================================
  check(Array.isArray(industryDistribution), "R2: industryDistribution must be an array");
  check(industryDistribution.length === 9, `R2: industryDistribution must have exactly 9 industries, got ${industryDistribution.length}`);

  if (Array.isArray(industryDistribution) && industryDistribution.length === 9) {
    const presentIndustries = industryDistribution.map((x) => x.industry);
    const missingIndustries = VALID_INDUSTRIES.filter((x) => !presentIndustries.includes(x));
    check(missingIndustries.length === 0, `R2: Missing industries: ${missingIndustries.join(", ")}`);

    let totalDistValue = 0;
    const slices = [];

    industryDistribution.forEach((item) => {
      check(typeof item.value === "number" && !isNaN(item.value), `R2: Invalid value for ${item.industry}: ${item.value}`);
      // Cross-reconcile with deals.json
      const expectedFunding = deals
        .filter((d) => d.industry === item.industry)
        .reduce((sum, d) => sum + d.fundingRaised, 0);
      const expectedRounded = Number(expectedFunding.toFixed(1));
      const actualRounded = Number(item.value.toFixed(1));
      check(
        Math.abs(actualRounded - expectedRounded) < 0.15,
        `R2: Industry '${item.industry}' value (${actualRounded}) does not reconcile with deals sum (${expectedRounded})`
      );

      totalDistValue += item.value;
      slices.push(item.value);
    });

    // Check percentage split
    slices.sort((a, b) => b - a);
    const top2CombinedPct = ((slices[0] + slices[1]) / totalDistValue) * 100;
    check(
      top2CombinedPct >= 38 && top2CombinedPct <= 52,
      `R2: Top-2 combined percentage must be in [38%, 52%], got ${top2CombinedPct.toFixed(1)}%`
    );

    industryDistribution.forEach((item) => {
      const slicePct = (item.value / totalDistValue) * 100;
      check(
        slicePct >= 2.0 && slicePct <= 35.0,
        `R2: Industry '${item.industry}' slice percentage (${slicePct.toFixed(1)}%) must be in [2%, 35%]`
      );
    });
  }

  // ==========================================
  // File 4 — investors.json
  // ==========================================
  check(Array.isArray(investors), "R4: investors must be an array");
  check(investors.length === 15, `R4: investors must have exactly 15 records, got ${investors.length}`);

  if (Array.isArray(investors) && investors.length === 15) {
    const inv001 = investors.find((i) => i.id === "inv-001");
    check(Boolean(inv001), "R4: inv-001 must exist in investors.json");

    if (inv001) {
      // Byte/JSON identical to File 1
      const inv001GrowthStr = JSON.stringify(inv001.investmentGrowth);
      const file1Str = JSON.stringify(investmentGrowth);
      check(
        inv001GrowthStr === file1Str,
        "R4: inv-001 investmentGrowth must be byte/JSON identical to File 1 (investmentGrowth.json)"
      );

      // Afford at least 25% of deals' minInvestment
      const affordableDeals = deals.filter((d) => inv001.budget >= d.minInvestment).length;
      const affordablePct = (affordableDeals / deals.length) * 100;
      check(
        affordablePct >= 25,
        `R4: inv-001 budget (${inv001.budget}) must afford at least 25% of deals' minInvestment, got ${affordablePct.toFixed(1)}% (${affordableDeals}/${deals.length})`
      );
    }

    const normalizedCurves = new Set();
    const dipPatterns = new Set();

    investors.forEach((inv, idx) => {
      check(inv.id && typeof inv.id === "string", `R4: Investor ${idx} missing id`);
      check(typeof inv.name === "string" && inv.name.length > 0, `R4: ${inv.id} missing name`);
      check(typeof inv.budget === "number" && inv.budget > 0, `R4: ${inv.id} invalid budget`);
      check(
        Array.isArray(inv.preferredIndustries) && inv.preferredIndustries.length === 3,
        `R4: ${inv.id} preferredIndustries must have exactly 3 industries`
      );
      if (Array.isArray(inv.preferredIndustries)) {
        inv.preferredIndustries.forEach((ind) => {
          check(VALID_INDUSTRIES.includes(ind), `R4: ${inv.id} invalid preferredIndustry ${ind}`);
        });
      }
      check(VALID_RISKS.includes(inv.riskAppetite), `R4: ${inv.id} invalid riskAppetite ${inv.riskAppetite}`);
      check(typeof inv.portfolioValue === "number", `R4: ${inv.id} invalid portfolioValue`);
      check(Number.isInteger(inv.activeDeals), `R4: ${inv.id} activeDeals must be integer`);

      // investmentGrowth curve check
      check(
        Array.isArray(inv.investmentGrowth) && inv.investmentGrowth.length === 24,
        `R4: ${inv.id} investmentGrowth must have 24 points`
      );

      if (Array.isArray(inv.investmentGrowth) && inv.investmentGrowth.length === 24) {
        const startVal = inv.investmentGrowth[0].value;
        const endVal = inv.investmentGrowth[23].value;

        if (inv.id !== "inv-001") {
          check(startVal >= 0.8 && startVal <= 5.0, `R4: ${inv.id} start value must be in [0.8, 5.0], got ${startVal}`);
          check(endVal >= 6.0 && endVal <= 30.0, `R4: ${inv.id} end value must be in [6.0, 30.0], got ${endVal}`);
        }

        // Check dips
        const invDips = [];
        for (let i = 1; i < 24; i++) {
          const prev = inv.investmentGrowth[i - 1].value;
          const curr = inv.investmentGrowth[i].value;
          const ch = (curr - prev) / prev;
          check(Math.abs(ch) <= 0.35 + 1e-4, `R4: ${inv.id} absolute MoM change at index ${i} exceeds 35%: ${(ch * 100).toFixed(1)}%`);
          if (ch >= -0.17 - 1e-4 && ch <= -0.13 + 1e-4) {
            invDips.push(i);
          }
        }

        check(invDips.length === 3, `R4: ${inv.id} must have exactly 3 dips in [-17%, -13%], got ${invDips.length} (indices: ${invDips.join(", ")})`);

        if (invDips.length === 3) {
          dipPatterns.add(invDips.join("-"));
          check(invDips[0] >= 1 && invDips[0] <= 7, `R4: ${inv.id} 1st dip must be in 1..7, got ${invDips[0]}`);
          check(invDips[1] >= 8 && invDips[1] <= 15, `R4: ${inv.id} 2nd dip must be in 8..15, got ${invDips[1]}`);
          check(invDips[2] >= 16 && invDips[2] <= 22, `R4: ${inv.id} 3rd dip must be in 16..22, got ${invDips[2]}`);

          for (const d of invDips) {
            if (d + 1 < 24) {
              const prev = inv.investmentGrowth[d].value;
              const curr = inv.investmentGrowth[d + 1].value;
              const rec = (curr - prev) / prev;
              check(rec >= 0.16 - 1e-4 && rec <= 0.20 + 1e-4, `R4: ${inv.id} recovery at ${d + 1} must be +16–20%, got ${(rec * 100).toFixed(1)}%`);
            }
          }
        }

        // Normalized curve shape
        const maxVal = Math.max(...inv.investmentGrowth.map((p) => p.value));
        const normalized = inv.investmentGrowth.map((p) => (p.value / maxVal).toFixed(4)).join(",");
        normalizedCurves.add(normalized);
      }
    });

    check(
      normalizedCurves.size === 15,
      `R4 Diversity: All 15 investors must have distinct normalized curve shapes, got ${normalizedCurves.size} unique`
    );
    check(
      dipPatterns.size >= 6,
      `R4 Diversity: Must have ≥6 distinct dip-month patterns across 15 investors, got ${dipPatterns.size}`
    );
  }

  // ==========================================
  // File 5 — corporateAnalytics.json
  // ==========================================
  check(corporateAnalytics && typeof corporateAnalytics === "object", "R5: corporateAnalytics must be an object");

  if (corporateAnalytics && typeof corporateAnalytics === "object") {
    // Total funding raised reconciliation
    const dealsTotalFunding = Number(deals.reduce((s, d) => s + d.fundingRaised, 0).toFixed(1));
    const actualAnalyticsFunding = Number(corporateAnalytics.totalFundingRaised.toFixed(1));
    check(
      Math.abs(actualAnalyticsFunding - dealsTotalFunding) < 0.15,
      `R5: totalFundingRaised (${actualAnalyticsFunding}) does not match deals total (${dealsTotalFunding})`
    );

    // Investor count
    check(
      Number.isInteger(corporateAnalytics.investorCount) &&
        corporateAnalytics.investorCount >= 900 &&
        corporateAnalytics.investorCount <= 1800,
      `R5: investorCount must be integer in [900, 1800], got ${corporateAnalytics.investorCount}`
    );

    // Monthly trends
    check(
      Array.isArray(corporateAnalytics.monthlyTrends) && corporateAnalytics.monthlyTrends.length === 12,
      `R5: monthlyTrends must be an array of 12 rows, got ${corporateAnalytics.monthlyTrends?.length}`
    );

    if (Array.isArray(corporateAnalytics.monthlyTrends) && corporateAnalytics.monthlyTrends.length === 12) {
      let nonQ4FundingSum = 0;
      let q4FundingSum = 0;
      const conversionRates = [];

      corporateAnalytics.monthlyTrends.forEach((m, idx) => {
        check(typeof m.month === "string" && /^\d{4}-\d{2}$/.test(m.month), `R5: Month ${idx} invalid format: ${m?.month}`);
        check(typeof m.fundingRaised === "number" && m.fundingRaised > 0, `R5: Month ${idx} invalid fundingRaised`);
        check(Number.isInteger(m.investorInquiries) && m.investorInquiries > 0, `R5: Month ${idx} invalid investorInquiries`);
        check(Number.isInteger(m.dealsConverted) && m.dealsConverted > 0, `R5: Month ${idx} invalid dealsConverted`);

        const ratio = m.investorInquiries / m.dealsConverted;
        check(
          ratio >= 5.0 - 1e-4 && ratio <= 15.0 + 1e-4,
          `R5: Month ${m.month} inquiries/converted ratio must be in [5, 15], got ${ratio.toFixed(2)} (${m.investorInquiries}/${m.dealsConverted})`
        );

        const expectedConvRate = Number(((m.dealsConverted / m.investorInquiries) * 100).toFixed(1));
        check(
          Math.abs(m.conversionRate - expectedConvRate) < 0.15,
          `R5: Month ${m.month} conversionRate (${m.conversionRate}) !== calculated (${expectedConvRate})`
        );

        check(
          m.conversionRate >= 4.0 - 1e-4 && m.conversionRate <= 12.0 + 1e-4,
          `R5: Month ${m.month} conversionRate (${m.conversionRate}) must be in [4, 12]`
        );
        conversionRates.push(m.conversionRate);

        if (idx < 9) {
          nonQ4FundingSum += m.fundingRaised;
        } else {
          q4FundingSum += m.fundingRaised;
        }
      });

      const avgNonQ4 = nonQ4FundingSum / 9;
      const avgQ4 = q4FundingSum / 3;
      check(
        avgQ4 >= 1.2 * avgNonQ4 - 1e-4,
        `R5: Q4 average funding (${avgQ4.toFixed(2)}) must be ≥ 1.2× non-Q4 average (${avgNonQ4.toFixed(2)}) (ratio: ${(avgQ4 / avgNonQ4).toFixed(2)})`
      );

      const expectedAvgConv = Number((conversionRates.reduce((s, r) => s + r, 0) / 12).toFixed(1));
      check(
        Math.abs(corporateAnalytics.avgConversionRate - expectedAvgConv) < 0.15,
        `R5: avgConversionRate (${corporateAnalytics.avgConversionRate}) must equal mean of monthly conversion rates (${expectedAvgConv})`
      );
    }
  }

  // ==========================================
  // Report result
  // ==========================================
  if (errors.length > 0) {
    console.error(`FAIL — ${errors.length} violation(s):\n` + errors.join("\n"));
    process.exit(1);
  } else {
    console.log(
      `PASS — 5 files valid (80 deals, 15 investors, 9 industries, 24 growth months, 12 analytics months)`
    );
    process.exit(0);
  }
} catch (err) {
  console.error("FAIL — Unexpected validation error:\n" + err.stack);
  process.exit(1);
}
