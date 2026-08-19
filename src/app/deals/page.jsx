"use client";

import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { fetchDeals, selectDealsList, selectDealsListState } from "@/store/slices/dealsSlice";
import { fetchCurrentInvestor, selectInvestorProfile } from "@/store/slices/investorSlice";
import { useDebounce } from "@/hooks/useDebounce";
import { rankDeals } from "@/utils/scoring";

import { DealTable } from "@/components/deals/DealTable";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search, ChevronLeft, ChevronRight, Loader2, X, Filter } from "lucide-react";

const INDUSTRIES = [
  "Roads",
  "Metro",
  "Railway",
  "Solar",
  "Bridges",
  "Smart City",
  "Water",
  "Ports",
  "Airports",
];
const RISK_LEVELS = ["Low", "Medium", "High"];

function DealsContent() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const deals = useSelector(selectDealsList);
  const { status, error, total, page, totalPages } = useSelector(selectDealsListState);
  const investor = useSelector(selectInvestorProfile);

  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(search, 400);

  const isDebouncing = search !== debouncedSearch;

  const [filters, setFilters] = useState({
    industries: [],
    riskLevels: [],
    roiMin: undefined,
    investmentMin: undefined,
    investmentMax: undefined,
  });

  const [sort, setSort] = useState("date-desc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchCurrentInvestor());
  }, [dispatch]);

  // Reset page to 1 whenever search, filters, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filters, sort]);

  useEffect(() => {
    dispatch(
      fetchDeals({
        search: debouncedSearch.trim(),
        filters,
        sort,
        page: currentPage,
        pageSize: 12,
      })
    );
  }, [dispatch, debouncedSearch, filters, sort, currentPage]);

  const rankedDeals = useMemo(() => {
    return rankDeals(deals, investor);
  }, [deals, investor]);

  const toggleIndustry = useCallback((ind) => {
    setFilters((prev) => {
      const updated = prev.industries.includes(ind)
        ? prev.industries.filter((i) => i !== ind)
        : [...prev.industries, ind];
      return { ...prev, industries: updated };
    });
  }, []);

  const toggleRisk = useCallback((risk) => {
    setFilters((prev) => {
      const updated = prev.riskLevels.includes(risk)
        ? prev.riskLevels.filter((r) => r !== risk)
        : [...prev.riskLevels, risk];
      return { ...prev, riskLevels: updated };
    });
  }, []);

  const handleRoiSelect = useCallback((val) => {
    setFilters((prev) => ({
      ...prev,
      roiMin: val ? Number(val) : undefined,
    }));
  }, []);

  const handleEntrySelect = useCallback((val) => {
    setFilters((prev) => {
      if (!val) {
        return { ...prev, investmentMin: undefined, investmentMax: undefined };
      } else if (val === "lt1") {
        return { ...prev, investmentMin: undefined, investmentMax: 100 };
      } else if (val === "1to2") {
        return { ...prev, investmentMin: 100, investmentMax: 200 };
      } else if (val === "gt2") {
        return { ...prev, investmentMin: 200, investmentMax: undefined };
      }
      return prev;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearch("");
    setFilters({
      industries: [],
      riskLevels: [],
      roiMin: undefined,
      investmentMin: undefined,
      investmentMax: undefined,
    });
    setCurrentPage(1);
  }, []);

  const hasActiveFilters =
    filters.industries.length > 0 ||
    filters.riskLevels.length > 0 ||
    filters.roiMin != null ||
    filters.investmentMin != null ||
    filters.investmentMax != null ||
    search.trim().length > 0;

  const startRow = total === 0 ? 0 : (currentPage - 1) * 12 + 1;
  const endRow = Math.min(currentPage * 12, total);

  const getEntryLabel = () => {
    if (filters.investmentMax === 100) return "< ₹1 Cr";
    if (filters.investmentMin === 100 && filters.investmentMax === 200) return "₹1–2 Cr";
    if (filters.investmentMin === 200) return "> ₹2 Cr";
    return "";
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3 gap-3">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Deals
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400" aria-live="polite">
            {total} deals monitored
          </p>
        </div>

        {/* Page Search Left, Sort Right */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, company, industry..."
              aria-label="Search deals"
              className="w-full pl-8 pr-8 py-1.5 text-xs rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
            />
            {isDebouncing || status === "loading" ? (
              <Loader2 className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-600 dark:text-blue-400 animate-spin" />
            ) : search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search input"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            ) : null}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort deals"
            className="px-2.5 py-1.5 text-xs rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 focus:outline-hidden focus:border-blue-600 cursor-pointer transition-colors"
          >
            <option value="date-desc">Newest first</option>
            <option value="roi-desc">Highest ROI</option>
            <option value="roi-asc">Lowest ROI</option>
            <option value="funding-desc">Most raised</option>
            <option value="risk-asc">Lowest risk</option>
          </select>
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="flex items-center gap-1.5 flex-wrap text-xs py-1">
        <span className="text-stone-500 dark:text-stone-400 text-[11px] font-semibold flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3" /> Filter:
        </span>

        {/* Industry Filter Chips */}
        {INDUSTRIES.map((ind) => {
          const active = filters.industries.includes(ind);
          return (
            <button
              key={ind}
              type="button"
              onClick={() => toggleIndustry(ind)}
              aria-pressed={active}
              className={`px-2.5 py-1 rounded-sm border text-[11px] font-medium transition-colors cursor-pointer ${
                active
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 font-semibold ring-1 ring-blue-600/30"
                  : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700"
              }`}
            >
              {ind}
            </button>
          );
        })}

        <div className="h-4 w-px bg-stone-200 dark:bg-stone-800 mx-1 hidden sm:block" />

        {/* Risk Level Filter Chips */}
        {RISK_LEVELS.map((risk) => {
          const active = filters.riskLevels.includes(risk);
          return (
            <button
              key={risk}
              type="button"
              onClick={() => toggleRisk(risk)}
              aria-pressed={active}
              className={`px-2.5 py-1 rounded-sm border text-[11px] font-medium transition-colors cursor-pointer ${
                active
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 font-semibold ring-1 ring-blue-600/30"
                  : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700"
              }`}
            >
              {risk} risk
            </button>
          );
        })}

        <div className="h-4 w-px bg-stone-200 dark:bg-stone-800 mx-1 hidden sm:block" />

        {/* ROI Select Dropdown */}
        <select
          value={filters.roiMin || ""}
          onChange={(e) => handleRoiSelect(e.target.value)}
          aria-label="Filter by minimum ROI"
          className={`px-2.5 py-1 rounded-sm border text-[11px] font-medium cursor-pointer transition-colors ${
            filters.roiMin != null
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 font-semibold"
              : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 bg-white dark:bg-stone-900"
          }`}
        >
          <option value="">ROI: Any</option>
          <option value="10">10%+</option>
          <option value="15">15%+</option>
          <option value="20">20%+</option>
          <option value="25">25%+</option>
        </select>

        {/* Entry Range Select Dropdown */}
        <select
          value={
            filters.investmentMax === 100
              ? "lt1"
              : filters.investmentMin === 100 && filters.investmentMax === 200
              ? "1to2"
              : filters.investmentMin === 200
              ? "gt2"
              : ""
          }
          onChange={(e) => handleEntrySelect(e.target.value)}
          aria-label="Filter by investment entry range"
          className={`px-2.5 py-1 rounded-sm border text-[11px] font-medium cursor-pointer transition-colors ${
            filters.investmentMin != null || filters.investmentMax != null
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 font-semibold"
              : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 bg-white dark:bg-stone-900"
          }`}
        >
          <option value="">Entry: Any</option>
          <option value="lt1">&lt;₹1 Cr</option>
          <option value="1to2">₹1–2 Cr</option>
          <option value="gt2">&gt;₹2 Cr</option>
        </select>
      </div>

      {/* Active Filter Badges Bar */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1 pb-1">
          <span className="text-[11px] text-stone-400 dark:text-stone-500 font-medium mr-1">Active:</span>

          {search.trim() && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-[11px]">
              Search: &quot;{search.trim()}&quot;
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Remove search filter"
                className="hover:text-rose-600 dark:hover:text-rose-400 ml-0.5 cursor-pointer font-bold"
              >
                ×
              </button>
            </span>
          )}

          {filters.industries.map((ind) => (
            <span
              key={`active-${ind}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px]"
            >
              {ind}
              <button
                type="button"
                onClick={() => toggleIndustry(ind)}
                aria-label={`Remove ${ind} filter`}
                className="hover:text-rose-600 dark:hover:text-rose-400 ml-0.5 cursor-pointer font-bold"
              >
                ×
              </button>
            </span>
          ))}

          {filters.riskLevels.map((risk) => (
            <span
              key={`active-${risk}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px]"
            >
              {risk} risk
              <button
                type="button"
                onClick={() => toggleRisk(risk)}
                aria-label={`Remove ${risk} risk filter`}
                className="hover:text-rose-600 dark:hover:text-rose-400 ml-0.5 cursor-pointer font-bold"
              >
                ×
              </button>
            </span>
          ))}

          {filters.roiMin != null && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px]">
              ROI ≥ {filters.roiMin}%
              <button
                type="button"
                onClick={() => handleRoiSelect("")}
                aria-label="Remove ROI filter"
                className="hover:text-rose-600 dark:hover:text-rose-400 ml-0.5 cursor-pointer font-bold"
              >
                ×
              </button>
            </span>
          )}

          {(filters.investmentMin != null || filters.investmentMax != null) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px]">
              Entry: {getEntryLabel()}
              <button
                type="button"
                onClick={() => handleEntrySelect("")}
                aria-label="Remove entry range filter"
                className="hover:text-rose-600 dark:hover:text-rose-400 ml-0.5 cursor-pointer font-bold"
              >
                ×
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={clearAllFilters}
            className="text-rose-600 dark:text-rose-400 hover:underline text-[11px] ml-2 font-semibold cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Error state */}
      {status === "failed" && (
        <ErrorState
          message={error || "Couldn't load deals."}
          onRetry={() =>
            dispatch(
              fetchDeals({
                search: debouncedSearch.trim(),
                filters,
                sort,
                page: currentPage,
                pageSize: 12,
              })
            )
          }
        />
      )}

      {/* Loading Skeleton Rows */}
      {status === "loading" && (
        <div className="space-y-3">
          <DealTable isLoading={true} />
        </div>
      )}

      {/* Main Dense Table */}
      {status === "succeeded" && rankedDeals.length > 0 && (
        <div className="space-y-3">
          <DealTable deals={rankedDeals} />

          {/* Table Footer: 'Showing 1–12 of 80 deals' bottom-left; pager bottom-right */}
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-2 font-mono">
            <span aria-live="polite">
              Showing {startRow}–{endRow} of {total} deals
            </span>

            {totalPages > 1 && (
              <nav aria-label="Pagination" className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                  className="p-1 rounded border border-stone-200 dark:border-stone-800 disabled:opacity-30 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-1 font-medium text-stone-700 dark:text-stone-300">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                  className="p-1 rounded border border-stone-200 dark:border-stone-800 disabled:opacity-30 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            )}
          </div>
        </div>
      )}

      {status === "succeeded" && rankedDeals.length === 0 && (
        <EmptyState
          title="No deals match these filters"
          message="Try adjusting search keywords, ROI targets, or risk parameters."
          onResetFilters={clearAllFilters}
        />
      )}
    </div>
  );
}

function DealsPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Deals
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Live infrastructure assets seeking capital allocation
          </p>
        </div>
      </div>
      <DealTable deals={[]} isLoading={true} />
    </div>
  );
}

export default function DealsPage() {
  return (
    <Suspense fallback={<DealsPageSkeleton />}>
      <DealsContent />
    </Suspense>
  );
}
