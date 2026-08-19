// Next.js Service Layer connected to Express 5 Backend API (http://localhost:5000/api)
import dealsData from "@/data/deals.json";
import { simulateRequest } from "./apiClient";

const API_BASE_URL = "http://localhost:5000/api";

export const dealService = {
  /** GET /api/deals */
  async getDeals({ search = "", filters = {}, sort = "date-desc", page = 1, pageSize = 12 } = {}) {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filters.industries?.length) params.append("industries", filters.industries.join(","));
      if (filters.riskLevels?.length) params.append("riskLevels", filters.riskLevels.join(","));
      if (filters.roiMin) params.append("roiMin", filters.roiMin);
      if (sort) params.append("sort", sort);
      params.append("page", page);
      params.append("pageSize", pageSize);

      const res = await fetch(`${API_BASE_URL}/deals?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Express backend unavailable, using simulated service layer fallback.");
    }

    // Fallback to simulated client service
    return simulateRequest(() => {
      let list = dealsData;
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(
          (d) =>
            d.projectName.toLowerCase().includes(q) ||
            d.company.toLowerCase().includes(q) ||
            d.location.toLowerCase().includes(q)
        );
      }
      if (filters.industries?.length) {
        list = list.filter((d) => filters.industries.includes(d.industry));
      }
      if (filters.riskLevels?.length) {
        list = list.filter((d) => filters.riskLevels.includes(d.riskLevel));
      }
      if (filters.roiMin) {
        list = list.filter((d) => d.roi >= filters.roiMin);
      }

      const start = (page - 1) * pageSize;
      const data = list.slice(start, start + pageSize);

      return {
        data,
        total: list.length,
        page,
        pageSize,
        totalPages: Math.ceil(list.length / pageSize),
        hasMore: start + pageSize < list.length,
      };
    });
  },

  /** GET /api/deals/:id */
  async getDealById(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/deals/${id}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Fallback
    }

    return simulateRequest(
      () => {
        const deal = dealsData.find((d) => d.id === id);
        if (!deal) throw new Error(`Deal ${id} not found`);
        return deal;
      },
      { failable: false }
    );
  },

  /** GET /api/deals/summary */
  async getDashboardSummary() {
    try {
      const res = await fetch(`${API_BASE_URL}/deals/summary`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Fallback
    }

    return simulateRequest(() => {
      const totalInvestment = dealsData.reduce((s, d) => s + d.fundingRaised, 0);
      const activeDeals = dealsData.filter((d) => d.stage === "In Progress").length;
      const avgRoi =
        Math.round((dealsData.reduce((s, d) => s + d.roi, 0) / dealsData.length) * 10) / 10;

      const riskDistribution = ["Low", "Medium", "High"].map((level) => ({
        level,
        count: dealsData.filter((d) => d.riskLevel === level).length,
      }));

      const industryDistribution = Object.entries(
        dealsData.reduce((acc, d) => {
          acc[d.industry] = (acc[d.industry] || 0) + d.fundingRaised;
          return acc;
        }, {})
      ).map(([industry, value]) => ({ industry, value }));

      const riskVsRoi = dealsData.map((d) => ({
        id: d.id,
        name: d.projectName,
        risk: ["Low", "Medium", "High"].indexOf(d.riskLevel) + 1,
        roi: d.roi,
        funding: d.fundingRaised,
      }));

      return { totalInvestment, activeDeals, avgRoi, riskDistribution, industryDistribution, riskVsRoi };
    });
  },
};
