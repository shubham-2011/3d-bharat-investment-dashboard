"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { fetchDeals, selectDealsList, selectDealsListState } from "@/store/slices/dealsSlice";
import { fetchCurrentInvestor, selectInvestorProfile } from "@/store/slices/investorSlice";
import { useDebounce } from "@/hooks/useDebounce";
import { rankDeals } from "@/utils/scoring";

import { DealTable } from "@/components/deals/DealTable";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";

const INDUSTRIES = ["Roads", "Bridges", "Railway", "Metro", "Solar", "Smart City"];
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

  const [filters, setFilters] = useState({
    industries: [],
    riskLevels: [],
  });

  const [sort, setSort] = useState("date-desc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchCurrentInvestor());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchDeals({
        search: debouncedSearch,
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

  const toggleIndustry = (ind) => {
    const updated = filters.industries.includes(ind)
      ? filters.industries.filter((i) => i !== ind)
      : [...filters.industries, ind];
    setFilters({ ...filters, industries: updated });
    setCurrentPage(1);
  };

  const toggleRisk = (risk) => {
    const updated = filters.riskLevels.includes(risk)
      ? filters.riskLevels.filter((r) => r !== risk)
      : [...filters.riskLevels, risk];
    setFilters({ ...filters, riskLevels: updated });
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearch("");
    setFilters({ industries: [], riskLevels: [] });
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Deals
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {total} deals monitored
          </p>
        </div>

        {/* Search Left, Sort Right */}
        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, company..."
              className="w-full pl-8 pr-3 py-1 text-xs rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-blue-600"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-2 py-1 text-xs rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer"
          >
            <option value="date-desc">Newest first</option>
            <option value="roi-desc">Highest ROI</option>
            <option value="roi-asc">Lowest ROI</option>
            <option value="funding-desc">Most raised</option>
            <option value="risk-asc">Lowest risk</option>
          </select>
        </div>
      </div>

      {/* Single Row Filter Controls */}
      <div className="flex items-center gap-2 flex-wrap text-xs py-1">
        <span className="text-stone-400 text-[11px]">Filter:</span>

        {INDUSTRIES.map((ind) => {
          const active = filters.industries.includes(ind);
          return (
            <button
              key={ind}
              onClick={() => toggleIndustry(ind)}
              className={`px-2 py-0.5 rounded border text-[11px] font-medium transition-colors cursor-pointer ${
                active
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-300"
              }`}
            >
              {ind}
            </button>
          );
        })}

        <span className="text-stone-300 dark:text-stone-700">|</span>

        {RISK_LEVELS.map((risk) => {
          const active = filters.riskLevels.includes(risk);
          return (
            <button
              key={risk}
              onClick={() => toggleRisk(risk)}
              className={`px-2 py-0.5 rounded border text-[11px] font-medium transition-colors cursor-pointer ${
                active
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-300"
              }`}
            >
              {risk} risk
            </button>
          );
        })}

        {(filters.industries.length > 0 || filters.riskLevels.length > 0 || search) && (
          <button
            onClick={clearAllFilters}
            className="text-rose-600 dark:text-rose-400 hover:underline text-[11px] ml-2 cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Error state */}
      {status === "failed" && (
        <ErrorState
          title="Couldn't load deals"
          message={error}
          onRetry={() =>
            dispatch(
              fetchDeals({
                search: debouncedSearch,
                filters,
                sort,
                page: currentPage,
                pageSize: 12,
              })
            )
          }
        />
      )}

      {/* Main Dense Table */}
      {status === "succeeded" && rankedDeals.length > 0 && (
        <div className="space-y-3">
          <DealTable deals={rankedDeals} />

          {/* Table Footer: 'Showing 12 of 34' bottom-left; pager bottom-right */}
          <div className="flex items-center justify-between text-xs text-stone-500 pt-2 font-mono">
            <span>
              Showing {rankedDeals.length} of {total} deals
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded border border-stone-200 dark:border-stone-800 disabled:opacity-30 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded border border-stone-200 dark:border-stone-800 disabled:opacity-30 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {status === "succeeded" && rankedDeals.length === 0 && (
        <EmptyState
          title="No deals match these filters"
          message="Try adjusting search or risk parameters."
          onResetFilters={clearAllFilters}
        />
      )}
    </div>
  );
}

export default function DealsPage() {
  return (
    <Suspense fallback={<div className="text-xs text-stone-400 p-4">Loading deals table...</div>}>
      <DealsContent />
    </Suspense>
  );
}
