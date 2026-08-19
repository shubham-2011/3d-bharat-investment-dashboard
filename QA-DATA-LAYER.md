# QA-DATA-LAYER.md — Test Plan: Requirement #1 (Data Layer, Mandatory)

Role: Senior QA. Scope: ONLY requirement #1 — "Create mock datasets: 50–100 deals, 10–20 investors. Store in JSON or local files."

The data layer is the foundation: every service test, every chart, every filter sits on it. A defect here (bad range, broken shape, inconsistent values) propagates into every screen and silently corrupts demo credibility. Hence: mandatory = zero-tolerance.

---

## 1. Test Strategy

| Layer | What we verify | How |
|---|---|---|
| Compliance | Counts, storage medium match the requirement text | Automated script |
| Schema | Every record has every field, correct type | Automated script |
| Referential integrity | IDs unique; enums valid; cross-field math holds | Automated script |
| Semantic realism | Values plausible for the fintech domain | Script + manual review |
| Distribution | Data exercises ALL UI states (filters, risk mix, pagination) | Automated script |
| Consumption | JSON imports statically; no runtime fetch of data files | Grep + build |

- **Entry criteria**: `src/data/deals.json`, `src/data/investors.json` exist.
- **Exit criteria**: all TC-D/TC-I/TC-X cases PASS; audit script exits 0.

---

## 2. Test Cases — Deals Dataset (TC-D)

| ID | Test case | Steps | Expected | Severity |
|---|---|---|---|---|
| TC-D01 | Count compliance | length of deals.json | ≥50 and ≤100 (ours: 80) | Blocker |
| TC-D02 | Storage compliance | Locate dataset | Static .json under `src/data/`, imported — not fetched, not hardcoded in components, not in a DB | Blocker |
| TC-D03 | ID uniqueness | Collect all id | 0 duplicates; stable format deal-NNN | Blocker |
| TC-D04 | Schema completeness | Every record has: id, projectName, company, industry, riskLevel, roi, minInvestment, maxInvestment, fundingTarget, fundingRaised, stage, location, createdAt, description, financials{revenue, profitMargin, growthRate, debtEquityRatio}, roiProjections[], investorCount | No missing/null/undefined field in ANY record | Blocker |
| TC-D05 | Type safety | Type-check each field | Numbers are numbers (not "12.5" strings), dates are parseable, arrays are arrays | Critical |
| TC-D06 | Enum validity | industry ∈ {Roads, Bridges, Railway, Metro, Solar, Smart City}; riskLevel ∈ {Low, Medium, High}; stage ∈ {Planning, Approved, In Progress, Expansion} | No stray values, no casing drift ("low" vs "Low") | Critical |
| TC-D07 | Range: ROI | 0 < roi ≤ 40 (%) | No 0%, no 300%, no negatives | Critical |
| TC-D08 | Cross-field: investment range | minInvestment < maxInvestment for every deal | No inverted ranges | Critical |
| TC-D09 | Cross-field: funding math | 0 ≤ fundingRaised ≤ fundingTarget | Raised never exceeds target (breaks progress bars >100%) | Critical |
| TC-D10 | Date sanity | createdAt parses; date ≤ today; year plausible (2024–2026) | No future dates, no invalid "2025-02-30" | Major |
| TC-D11 | roiProjections shape | Each: 5 entries {year:number, projectedRoi:number}, years sequential | Charts never get ragged arrays | Major |
| TC-D12 | Realism: risk-ROI correlation | avg roi(High) > avg roi(Medium) > avg roi(Low) | Domain-plausible data (reviewers notice random nonsense) | Major |
| TC-D13 | Realism: names | projectName + location read as Indian infrastructure; no "Test 1", no lorem, no duplicate name+company pairs en masse | Spot-check 10 random records | Major |
| TC-D14 | No sensitive/real data | Scan text fields | No real PII, phone numbers, emails, real company financials | Major |

---

## 3. Test Cases — Investors Dataset (TC-I)

| ID | Test case | Expected | Severity |
|---|---|---|---|
| TC-I01 | Count compliance | ≥10 and ≤20 (ours: 15) | Blocker |
| TC-I02 | Schema completeness | Every record: id, name, budget, preferredIndustries[], riskAppetite, portfolioValue, activeDeals, investmentGrowth[] | Blocker |
| TC-I03 | ID uniqueness + format inv-NNN | 0 duplicates | Blocker |
| TC-I04 | Enum validity | riskAppetite ∈ {Low, Medium, High}; every preferredIndustries entry is a valid industry enum | Critical |
| TC-I05 | preferredIndustries size | 1–4 entries, no duplicates within a record | Critical |
| TC-I06 | Budget sanity | budget > 0 and within a range that matches SOME deals' entry ranges (else recommendation engine returns all-zero budget scores) | Critical |
| TC-I07 | investmentGrowth shape | 12 entries {month:"YYYY-MM", value:number}, months sequential, values > 0 | Major — feeds the Overview line chart |
| TC-I08 | Current-user record exists | inv-001 present (investorService.getCurrentInvestor depends on it) | Blocker |
| TC-I09 | Name realism | Plausible names, no "Investor 7" | Minor |

---

## 4. Cross-Dataset & Consumption Scenarios (TC-X)

| ID | Scenario | Expected | Severity |
|---|---|---|---|
| TC-X01 | Filter coverage | Every industry enum has ≥5 deals | Major |
| TC-X02 | Risk coverage | Each risk level has ≥10 deals | Major |
| TC-X03 | Pagination coverage | 80 deals @ pageSize 12 → 7 pages (multi-page behavior demonstrable) | Major |
| TC-X04 | Recommendation spread | score inv-001 against all deals spans wide range (<30 to >70) | Major |
| TC-X05 | Search coverage | "metro" returns 5–20 hits | Minor |
| TC-X06 | Dashboard aggregates | Σ fundingRaised > 0; every industry appears in industryDistribution | Major |
| TC-X07 | Static import only | `grep -rn "fetch(.*data/|fs.readFile" src/` → 0 hits | Blocker |
| TC-X08 | Immutability in practice | Services never mutate source arrays (sort on copies only) | Major |
| TC-X09 | Regeneration determinism | generate-data.js reruns without error; output passes all cases | Major |
| TC-X10 | Size budget | Both JSON files combined < 500KB | Minor |

---

## 5. Negative / Destructive Scenarios (TC-N)

| ID | Sabotage | Expected app behavior | Severity |
|---|---|---|---|
| TC-N01 | Delete one deal's roiProjections | Details page ROI tab shows empty chart or guard — no crash | Major |
| TC-N02 | Set one fundingTarget: 0 | Progress bar clamps (no Infinity%, no NaN) | Major |
| TC-N03 | Empty deals.json ([]) | All pages render empty states; dashboard shows zeros; no crash | Critical |
| TC-N04 | Remove inv-001 | Overview degrades: generic title, match column "—"; no crash | Critical |
| TC-N05 | One roi as string "12.5" | Sorted correctly or flagged | Minor |

---

## 6. Automated Audit Script

Save as `scripts/audit-data.mjs`; run `node scripts/audit-data.mjs`. Exit code 0 = data layer certified.

```js
import deals from "../src/data/deals.json" with { type: "json" };
import investors from "../src/data/investors.json" with { type: "json" };

const errors = [];
const check = (cond, id, msg) => { if (!cond) errors.push(`${id}: ${msg}`); };

const INDUSTRIES = ["Roads","Bridges","Railway","Metro","Solar","Smart City"];
const RISKS = ["Low","Medium","High"];
const STAGES = ["Planning","Approved","In Progress","Expansion"];

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
    d.roiProjections.every(p => typeof p.year==="number" && typeof p.projectedRoi==="number"),
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
```

---

## 7. Sign-off Checklist
- [x] `node scripts/audit-data.mjs` → PASS, exit 0
- [x] TC-D13/D14 manual spot-check of 10 random records done
- [x] TC-X07 grep clean (static imports only)
- [x] Script committed; README references it
