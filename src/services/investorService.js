// services/investorService.js
// Standalone simulated service layer for investor profile + corporate analytics.

import investors from "../data/investors.json" with { type: "json" };
import deals from "../data/deals.json" with { type: "json" };
import { simulateRequest } from "./apiClient.js";

const CURRENT_INVESTOR_ID = "inv-001";

export const investorService = {
  /** GET investor profile */
  getCurrentInvestor() {
    return simulateRequest(
      () => investors.find((i) => i.id === CURRENT_INVESTOR_ID),
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
      const totalTarget = deals.reduce((s, d) => s + d.fundingTarget, 0);
      const investorCount = new Set(
        deals.flatMap((d) => Array.from({ length: d.investorCount }, (_, i) => `${d.id}-${i}`))
      ).size;

      const conversionRate = Math.round((totalFundingRaised / totalTarget) * 100);

      const fundingTrend = Array.from({ length: 12 }, (_, m) => {
        const month = `2025-${String(m + 1).padStart(2, "0")}`;
        const value = deals
          .filter((d) => d.createdAt.startsWith(month))
          .reduce((s, d) => s + d.fundingRaised, 0);
        return { month, value };
      });

      return { totalFundingRaised, investorCount, conversionRate, fundingTrend };
    });
  },
};
