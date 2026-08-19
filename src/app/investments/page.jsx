"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectInterestIds } from "@/store/slices/interestsSlice";
import { fetchDeals, selectDealsList, selectDealsListState } from "@/store/slices/dealsSlice";
import { DealTable } from "@/components/deals/DealTable";
import { StatCard } from "@/components/ui/StatCard";
import { formatLakhs } from "@/utils/formatters";
import Link from "next/link";

export default function WatchlistPage() {
  const dispatch = useDispatch();
  const interestIds = useSelector(selectInterestIds);
  const allDeals = useSelector(selectDealsList);
  const { status } = useSelector(selectDealsListState);

  useEffect(() => {
    dispatch(fetchDeals({ pageSize: 100 }));
  }, [dispatch]);

  const savedDeals = useMemo(() => {
    return allDeals.filter((deal) => interestIds.includes(deal.id));
  }, [allDeals, interestIds]);

  const totalMinEntry = useMemo(() => {
    return savedDeals.reduce((sum, deal) => sum + deal.minInvestment, 0);
  }, [savedDeals]);

  const avgRoi = useMemo(() => {
    if (!savedDeals.length) return 0;
    return Math.round((savedDeals.reduce((sum, deal) => sum + deal.roi, 0) / savedDeals.length) * 10) / 10;
  }, [savedDeals]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Watchlist
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {savedDeals.length} watchlisted deals
          </p>
        </div>
      </div>

      {savedDeals.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard label="WATCHLISTED" value={savedDeals.length} />
            <StatCard label="TOTAL MIN. ENTRY" value={formatLakhs(totalMinEntry)} />
            <StatCard label="AVG. TARGET ROI" value={`${avgRoi}%`} />
          </div>

          <DealTable deals={savedDeals} />
        </>
      )}

      {status !== "loading" && savedDeals.length === 0 && (
        <div className="p-8 text-center text-xs text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-800 rounded-md bg-white dark:bg-stone-900 space-y-1">
          <p className="font-medium text-stone-700 dark:text-stone-300">Nothing watchlisted yet.</p>
          <p className="text-stone-500 dark:text-stone-400">
            Star any deal to track it here.{" "}
            <Link href="/deals" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Browse deals →
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
