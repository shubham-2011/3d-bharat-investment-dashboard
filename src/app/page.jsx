"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardSummary, selectDashboardSummary } from "@/store/slices/dealsSlice";
import { fetchCurrentInvestor, selectInvestorProfile } from "@/store/slices/investorSlice";
import { selectInterestIds } from "@/store/slices/interestsSlice";
import { StatCard } from "@/components/ui/StatCard";
import { StatCardSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { InvestmentGrowthChart } from "@/components/dashboard/InvestmentGrowthChart";
import { IndustryDistributionChart } from "@/components/dashboard/IndustryDistributionChart";
import { RiskVsRoiScatterChart } from "@/components/dashboard/RiskVsRoiScatterChart";
import { formatLakhs } from "@/utils/formatters";

export default function OverviewPage() {
  const dispatch = useDispatch();
  const { summary, status, error } = useSelector(selectDashboardSummary);
  const investor = useSelector(selectInvestorProfile);
  const watchlistIds = useSelector(selectInterestIds);

  useEffect(() => {
    dispatch(fetchDashboardSummary());
    dispatch(fetchCurrentInvestor());
  }, [dispatch]);

  const handleRetry = () => {
    dispatch(fetchDashboardSummary());
    dispatch(fetchCurrentInvestor());
  };

  const getRiskCount = (level) => {
    if (!summary || !summary.riskDistribution) return 0;
    const item = summary.riskDistribution.find((r) => r.level === level);
    return item ? item.count : 0;
  };

  return (
    <div className="space-y-5">
      {/* Title & Portfolio Header */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            {investor?.name ? `${investor.name.split(" ")[0]}'s portfolio` : "Overview"}
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Infrastructure Monitoring & Capital Allocation
          </p>
        </div>
      </div>

      {/* Error state */}
      {status === "failed" && (
        <ErrorState message={error || "Couldn't load overview."} onRetry={handleRetry} />
      )}

      {/* Loading state: Unified 5-Card Skeleton Strip + Chart Skeletons */}
      {status === "loading" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ChartSkeleton height="h-64" />
            </div>
            <ChartSkeleton height="h-64" />
          </div>
          <ChartSkeleton height="h-60" />
        </div>
      )}

      {/* Success state: 5 Hydrated Metric Cards + 3 Recharts Visualizations */}
      {status === "succeeded" && summary && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard
              label="PORTFOLIO VALUE"
              value={formatLakhs(summary.totalInvestment)}
            />
            <StatCard
              label="ACTIVE DEALS"
              value={summary.activeDeals}
            />
            <StatCard
              label="AVG. TARGET ROI"
              value={`${summary.avgRoi}%`}
            />
            <StatCard label="RISK DISTRIBUTION">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-stone-900 dark:text-stone-100">
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                  {getRiskCount("Low")}
                </span>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                  {getRiskCount("Medium")}
                </span>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 inline-block" />
                  {getRiskCount("High")}
                </span>
              </div>
            </StatCard>
            <StatCard
              label="WATCHLISTED"
              value={watchlistIds.length}
            />
          </div>

          {/* 2/3 Line Chart + 1/3 Sector Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <InvestmentGrowthChart data={investor?.investmentGrowth || []} />
            </div>
            <IndustryDistributionChart data={summary.industryDistribution} />
          </div>

          {/* Full-Width Risk vs Return Scatter Plot */}
          <div className="w-full">
            <RiskVsRoiScatterChart data={summary.riskVsRoi} />
          </div>
        </>
      )}
    </div>
  );
}
