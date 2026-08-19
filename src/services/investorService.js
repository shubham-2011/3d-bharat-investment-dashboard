// services/investorService.js
// Standalone simulated service layer for investor profile + corporate analytics.

import investors from "../data/investors.json" with { type: "json" };
import deals from "../data/deals.json" with { type: "json" };
import corporate from "../data/corporateAnalytics.json" with { type: "json" };
import { simulateRequest } from "./apiClient.js";

const CURRENT_INVESTOR_ID = "inv-001";

export const investorService = {
  /** GET current investor profile */
  getCurrentInvestor() {
    return simulateRequest(
      () => investors.find((i) => i.id === CURRENT_INVESTOR_ID) || investors[0],
      { failable: false }
    );
  },

  /** GET all investors */
  getInvestors() {
    return simulateRequest(() => investors);
  },

  /** GET corporate analytics */
  getCorporateAnalytics() {
    return simulateRequest(() => {
      const totalFundingRaised = deals.reduce((s, d) => s + d.fundingRaised, 0);
      const totalTarget = deals.reduce((s, d) => s + (d.fundingTarget || d.dealSize), 0);
      const conversionRate = Math.round((totalFundingRaised / totalTarget) * 100);

      return {
        ...corporate,
        totalFundingRaised,
        conversionRate,
        avgConversionRate: conversionRate,
        investorCount: corporate.investorCount || 461,
        fundingTrend: (corporate.monthlyTrends || []).map((t) => ({
          month: t.month,
          value: t.fundingRaised,
        })),
      };
    });
  },
};
