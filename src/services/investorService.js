// services/investorService.js
// Standalone simulated service layer for investor profile + corporate analytics.

import investors from "../data/investors.json" with { type: "json" };
import deals from "../data/deals.json" with { type: "json" };
import corporateAnalyticsData from "../data/corporateAnalytics.json" with { type: "json" };
import userProfileData from "../data/userProfile.json" with { type: "json" };
import { simulateRequest } from "./apiClient.js";

const CURRENT_INVESTOR_ID = "inv-001";

export const investorService = {
  /** GET current investor profile */
  getCurrentInvestor() {
    return simulateRequest(
      () => {
        const inv = investors.find((i) => i.id === CURRENT_INVESTOR_ID) || userProfileData;
        return { ...inv, ...userProfileData };
      },
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
      const investorCount = deals.reduce((s, d) => s + d.investorCount, 0);
      const conversionRate = Math.round((totalFundingRaised / totalTarget) * 100);

      const fundingTrend = corporateAnalyticsData.monthlyTrends.map((t) => ({
        month: t.month,
        value: t.fundingRaised,
      }));

      return { totalFundingRaised, investorCount, conversionRate, fundingTrend };
    });
  },
};
