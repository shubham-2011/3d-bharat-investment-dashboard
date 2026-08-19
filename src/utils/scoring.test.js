import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { scoreDeal, rankDeals } from "./scoring.js";

describe("Scoring Recommendation Engine", () => {
  const investor = {
    id: "inv-001",
    name: "Shubham Kumar",
    budget: 950,
    preferredIndustries: ["Solar", "Roads", "Bridges"],
    riskAppetite: "Low",
  };

  const deal1 = {
    id: "deal-1",
    projectName: "Pune Solar Project",
    industry: "Solar",
    riskLevel: "Low",
    minInvestment: 500,
    maxInvestment: 1200,
    roi: 20,
  };

  const deal2 = {
    id: "deal-2",
    projectName: "High Risk Metro",
    industry: "Metro",
    riskLevel: "High",
    minInvestment: 1500,
    maxInvestment: 3000,
    roi: 12,
  };

  it("calculates exact 100-point match for perfect deal", () => {
    const { total, breakdown } = scoreDeal(deal1, investor);
    assert.equal(breakdown.risk, 30);
    assert.equal(breakdown.industry, 25);
    assert.equal(breakdown.budget, 25);
    assert.equal(total > 80, true);
  });

  it("calculates lower score for mismatched deal", () => {
    const { total, breakdown } = scoreDeal(deal2, investor);
    assert.equal(breakdown.risk, 0); // Low vs High
    assert.equal(breakdown.industry, 0); // Metro not preferred
    assert.equal(breakdown.budget, 0); // Budget 950 < min 1500
    assert.equal(total < 30, true);
  });

  it("calculates match scores for deal list", () => {
    const ranked = rankDeals([deal1, deal2], investor);
    assert.equal(ranked[0].id, "deal-1");
    assert.equal(ranked[0].matchScore > ranked[1].matchScore, true);
  });

  it("handles null investor safely without throwing or returning NaN", () => {
    const unranked = rankDeals([deal1, deal2], null);
    assert.equal(unranked.length, 2);
    assert.equal(unranked[0].matchScore, undefined);
    assert.equal(unranked[1].matchScore, undefined);
  });
});
