// services/dealService.js
// Standalone simulated service layer — zero external HTTP calls, 100% in-memory simulation.

import deals from "../data/deals.json" with { type: "json" };
import industryDistributionData from "../data/industryDistribution.json" with { type: "json" };
import { simulateRequest } from "./apiClient.js";

/* ---------------- internal helpers (simulated server logic) ---------------- */

function applySearch(list, search) {
  if (!search) return list;
  const q = search.toLowerCase().trim();
  return list.filter(
    (d) =>
      (d.projectName && d.projectName.toLowerCase().includes(q)) ||
      (d.companyName && d.companyName.toLowerCase().includes(q)) ||
      (d.company && d.company.toLowerCase().includes(q)) ||
      d.industry.toLowerCase().includes(q) ||
      (d.location && d.location.toLowerCase().includes(q)) ||
      (d.city && d.city.toLowerCase().includes(q))
  );
}

function applyFilters(list, filters = {}) {
  const { industries, riskLevels, roiMin, roiMax, investmentMin, investmentMax } = filters;

  return list.filter((d) => {
    if (industries?.length && !industries.includes(d.industry)) return false;
    if (riskLevels?.length && !riskLevels.includes(d.riskLevel)) return false;
    if (roiMin != null && d.roi < roiMin) return false;
    if (roiMax != null && d.roi > roiMax) return false;
    if (investmentMin != null && d.maxInvestment < investmentMin) return false;
    if (investmentMax != null && d.minInvestment > investmentMax) return false;
    return true;
  });
}

const SORTERS = {
  "roi-desc": (a, b) => b.roi - a.roi,
  "roi-asc": (a, b) => a.roi - b.roi,
  "date-desc": (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  "date-asc": (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  "funding-desc": (a, b) => b.fundingRaised - a.fundingRaised,
  "risk-asc": (a, b) =>
    ["Low", "Medium", "High"].indexOf(a.riskLevel) -
    ["Low", "Medium", "High"].indexOf(b.riskLevel),
};

function applySort(list, sort) {
  const sorter = SORTERS[sort];
  return sorter ? [...list].sort(sorter) : list;
}

function paginate(list, page = 1, pageSize = 12) {
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
}

/* --------------------------- public API methods --------------------------- */

export const dealService = {
  /** Search + filter + sort + paginate */
  getDeals({ search = "", filters = {}, sort = "date-desc", page = 1, pageSize = 12 } = {}) {
    return simulateRequest(() => {
      let result = applySearch(deals, search);
      result = applyFilters(result, filters);
      result = applySort(result, sort);
      return paginate(result, page, pageSize);
    });
  },

  /** GET deal by ID */
  getDealById(id) {
    return simulateRequest(() => {
      const deal = deals.find((d) => d.id.toLowerCase() === String(id).toLowerCase());
      if (!deal) throw new Error(`Deal ${id} not found`);
      return deal;
    }, { failable: false });
  },

  /** GET dashboard summary stats */
  getDashboardSummary() {
    return simulateRequest(() => {
      const totalInvestment = deals.reduce((s, d) => s + d.fundingRaised, 0);
      const activeDeals = deals.filter((d) => d.stage === "In Progress").length;
      const avgRoi =
        Math.round((deals.reduce((s, d) => s + d.roi, 0) / deals.length) * 10) / 10;

      const riskDistribution = ["Low", "Medium", "High"].map((level) => ({
        level,
        count: deals.filter((d) => d.riskLevel === level).length,
      }));

      const industryDistribution = industryDistributionData.map((d) => ({
        industry: d.industry,
        value: d.value ?? d.totalValue ?? 0,
      }));

      const riskVsRoi = deals.map((d) => ({
        id: d.id,
        name: d.projectName || d.companyName || d.company,
        risk: ["Low", "Medium", "High"].indexOf(d.riskLevel) + 1,
        roi: d.roi,
        funding: d.fundingRaised,
        size: d.dealSize,
      }));

      return { totalInvestment, activeDeals, avgRoi, riskDistribution, industryDistribution, riskVsRoi };
    });
  },
};
