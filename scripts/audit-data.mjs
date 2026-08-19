import deals from "../src/data/deals.json" with { type: "json" };
import investors from "../src/data/investors.json" with { type: "json" };

const errors = [];
const check = (cond, id, msg) => { if (!cond) errors.push(`${id}: ${msg}`); };

const INDUSTRIES = ["Fintech", "HealthTech", "AgriTech", "EV/CleanEnergy", "SaaS", "E-commerce", "Manufacturing", "EdTech", "Logistics", "DeepTech", "Roads", "Bridges", "Railway", "Metro", "Solar", "Smart City"];
const RISKS = ["Low", "Medium", "High"];
const STAGES = ["Seed", "Series A", "Series B", "Growth", "Pre-IPO", "Planning", "Approved", "In Progress", "Expansion"];

// TC-D01/02 counts
check(deals.length >= 50 && deals.length <= 100, "TC-D01", `deals=${deals.length}, need 50–100`);
check(investors.length >= 10 && investors.length <= 20, "TC-I01", `investors=${investors.length}, need 10–20`);

// TC-D03 unique ids
check(new Set(deals.map(d=>d.id)).size === deals.length, "TC-D03", "duplicate deal ids");
check(new Set(investors.map(i=>i.id)).size === investors.length, "TC-I03", "duplicate investor ids");

const REQ = ["id","projectName","company","industry","riskLevel","roi","minInvestment",
  "maxInvestment","fundingTarget","fundingRaised","stage","location","createdAt",
  "description","financials","roiProjections","investorCount"];

for (const d of deals) {
  for (const f of REQ) check(d[f] !== undefined && d[f] !== null, "TC-D04", `${d.id} missing ${f}`);
  check(typeof d.roi === "number", "TC-D05", `${d.id} roi not number`);
  check(INDUSTRIES.includes(d.industry), "TC-D06", `${d.id} bad industry ${d.industry}`);
  check(RISKS.includes(d.riskLevel), "TC-D06", `${d.id} bad risk ${d.riskLevel}`);
  check(STAGES.includes(d.stage), "TC-D06", `${d.id} bad stage ${d.stage}`);
  check(d.roi > 0 && d.roi <= 40, "TC-D07", `${d.id} roi out of range: ${d.roi}`);
  check(d.minInvestment < d.maxInvestment, "TC-D08", `${d.id} inverted investment range`);
  check(d.fundingRaised >= 0 && d.fundingRaised <= d.fundingTarget, "TC-D09", `${d.id} raised>target`);
  check(!Number.isNaN(Date.parse(d.createdAt)) && new Date(d.createdAt) <= new Date(), "TC-D10", `${d.id} bad date`);
  check(Array.isArray(d.roiProjections) && d.roiProjections.length === 5 &&
    d.roiProjections.every(p => typeof p.year==="number" && (typeof p.projectedRoi==="number" || typeof p.roi==="number")),
    "TC-D11", `${d.id} bad roiProjections`);
}

// TC-D12 realism: risk-ROI correlation
const avg = lvl => { const s = deals.filter(d=>d.riskLevel===lvl); return s.reduce((a,d)=>a+d.roi,0)/s.length; };
check(avg("High") > avg("Medium") && avg("Medium") > avg("Low"), "TC-D12",
  `risk-ROI correlation broken: L=${avg("Low").toFixed(1)} M=${avg("Medium").toFixed(1)} H=${avg("High").toFixed(1)}`);

for (const i of investors) {
  check(RISKS.includes(i.riskAppetite), "TC-I04", `${i.id} bad riskAppetite`);
  check(i.preferredIndustries?.length >= 1 && i.preferredIndustries.every(p=>INDUSTRIES.includes(p)),
    "TC-I04", `${i.id} bad preferredIndustries`);
  check(i.budget > 0, "TC-I06", `${i.id} bad budget`);
  check(Array.isArray(i.investmentGrowth) && i.investmentGrowth.length === 12, "TC-I07", `${i.id} growth != 12 months`);
}
check(investors.some(i=>i.id==="inv-001"), "TC-I08", "current user inv-001 missing");

// TC-X01/02/03 distribution
for (const ind of INDUSTRIES)
  check(deals.filter(d=>d.industry===ind).length >= 5, "TC-X01", `industry ${ind} has <5 deals`);
for (const r of RISKS)
  check(deals.filter(d=>d.riskLevel===r).length >= 10, "TC-X02", `risk ${r} has <10 deals`);
check(Math.ceil(deals.length/12) >= 3, "TC-X03", "not enough deals for multi-page demo");

// TC-I06 deeper: current user's budget matches some deals
const me = investors.find(i=>i.id==="inv-001");
check(deals.some(d=>me.budget >= d.minInvestment), "TC-I06", "inv-001 budget below every deal's entry");

console.log(errors.length
  ? `FAIL — ${errors.length} defect(s):\n` + errors.join("\n")
  : `PASS — data layer certified: ${deals.length} deals, ${investors.length} investors, all cases green`);
process.exit(errors.length ? 1 : 0);
