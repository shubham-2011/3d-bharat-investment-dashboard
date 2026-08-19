import investorsData from "@/data/investors.json";
import dealsData from "@/data/deals.json";
import { simulateRequest } from "./apiClient";

const API_BASE_URL = "http://localhost:5000/api";

export const investorService = {
  /** GET /api/investors/me */
  async getCurrentInvestor() {
    try {
      const res = await fetch(`${API_BASE_URL}/investors/me`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Fallback
    }

    return simulateRequest(
      () => investorsData.find((i) => i.id === "inv-001"),
      { failable: false }
    );
  },

  /** GET /api/corporate/analytics */
  async getCorporateAnalytics() {
    try {
      const res = await fetch(`${API_BASE_URL}/corporate/analytics`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Fallback
    }

    return simulateRequest(() => {
      const totalFundingRaised = dealsData.reduce((s, d) => s + d.fundingRaised, 0);
      const totalTarget = dealsData.reduce((s, d) => s + d.fundingTarget, 0);
      const investorCount = new Set(
        dealsData.flatMap((d) => Array.from({ length: d.investorCount }, (_, i) => `${d.id}-${i}`))
      ).size;

      const conversionRate = Math.round((totalFundingRaised / totalTarget) * 100);

      const fundingTrend = Array.from({ length: 12 }, (_, m) => {
        const month = `2025-${String(m + 1).padStart(2, "0")}`;
        const value = dealsData
          .filter((d) => d.createdAt.startsWith(month))
          .reduce((s, d) => s + d.fundingRaised, 0);
        return { month, value };
      });

      return { totalFundingRaised, investorCount, conversionRate, fundingTrend };
    });
  },
};
