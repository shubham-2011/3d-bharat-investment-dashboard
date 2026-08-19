// utils/scoring.js
// Pure functions only — no imports of data or services, fully testable.
// Weights: risk 30 + industry 25 + budget 25 + ROI 20 = 100

const RISK_ORDER = ["Low", "Medium", "High"];

/** 30 pts — exact risk match, 15 for adjacent, 0 for opposite */
function riskScore(deal, investor) {
  const gap = Math.abs(
    RISK_ORDER.indexOf(deal.riskLevel) - RISK_ORDER.indexOf(investor.riskAppetite)
  );
  return gap === 0 ? 30 : gap === 1 ? 15 : 0;
}

/** 25 pts — deal industry in investor's preferred list */
function industryScore(deal, investor) {
  return investor.preferredIndustries.includes(deal.industry) ? 25 : 0;
}

/** 25 pts — investor's budget fits inside the deal's investment range */
function budgetScore(deal, investor) {
  const { budget } = investor;
  if (budget >= deal.minInvestment && budget <= deal.maxInvestment) return 25;
  if (budget >= deal.minInvestment) return 15; // can afford entry, above range cap
  return 0; // can't meet minimum
}

/** 20 pts — ROI scaled: 8% → ~0, 30%+ → 20 */
function roiScore(deal) {
  const clamped = Math.max(8, Math.min(deal.roi, 30));
  return Math.round(((clamped - 8) / 22) * 20);
}

/**
 * Score one deal against an investor profile. Returns 0–100 with a breakdown
 * (breakdown is handy for tooltips: "why is this recommended?").
 */
export function scoreDeal(deal, investor) {
  const breakdown = {
    risk: riskScore(deal, investor),
    industry: industryScore(deal, investor),
    budget: budgetScore(deal, investor),
    roi: roiScore(deal),
  };
  const total = breakdown.risk + breakdown.industry + breakdown.budget + breakdown.roi;
  return { total, breakdown };
}

/**
 * Rank a list of deals for an investor, best match first.
 * Call inside useMemo — this touches every deal:
 *   const ranked = useMemo(() => rankDeals(deals, investor), [deals, investor]);
 */
export function rankDeals(deals, investor) {
  if (!investor) return deals.map((deal) => ({ ...deal, matchScore: 0 }));
  return deals
    .map((deal) => ({ ...deal, matchScore: scoreDeal(deal, investor).total }))
    .sort((a, b) => b.matchScore - a.matchScore);
}
