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

try {
  const deals = JSON.parse(fs.readFileSync(path.join(dataDir, "deals.json"), "utf8"));
  const investors = JSON.parse(fs.readFileSync(path.join(dataDir, "investors.json"), "utf8"));
  const investmentGrowth = JSON.parse(fs.readFileSync(path.join(dataDir, "investmentGrowth.json"), "utf8"));
  const industryDistribution = JSON.parse(fs.readFileSync(path.join(dataDir, "industryDistribution.json"), "utf8"));
  const corporateAnalytics = JSON.parse(fs.readFileSync(path.join(dataDir, "corporateAnalytics.json"), "utf8"));

  check(deals.length === 80, `deals length ${deals.length} !== 80`);
  check(investors.length === 15, `investors length ${investors.length} !== 15`);
  check(investmentGrowth.length === 24, `investmentGrowth length ${investmentGrowth.length} !== 24`);
  check(industryDistribution.length === 9, `industryDistribution length ${industryDistribution.length} !== 9`);
  check(Array.isArray(corporateAnalytics.monthlyTrends) && corporateAnalytics.monthlyTrends.length === 12, "corporateAnalytics.monthlyTrends !== 12");

  // Validate deals schema
  for (const d of deals) {
    check(d.id && d.companyName && d.industry && d.dealSize != null, `${d.id} missing basic field`);
    check(Array.isArray(d.roiProjections) && d.roiProjections.length === 5, `${d.id} bad roiProjections`);
    check(d.roiProjections.every(p => p.year && p.conservative != null && p.projected != null && p.optimistic != null), `${d.id} roiProjections missing 3-series fields`);
    check(d.financials && Array.isArray(d.financials.revenue3y) && d.financials.revenue3y.length === 3, `${d.id} missing financials.revenue3y array`);
  }

  // Validate investors
  check(investors.some(i => i.id === "inv-001"), "investors missing inv-001");

  if (errors.length > 0) {
    console.error("FAIL — Validation errors:\n" + errors.join("\n"));
    process.exit(1);
  } else {
    console.log("PASS");
  }
} catch (err) {
  console.error("FAIL — Error reading data:", err.message);
  process.exit(1);
}
