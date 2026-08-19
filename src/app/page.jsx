"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardSummary, selectDashboardSummary } from "@/store/slices/dealsSlice";
import { fetchCurrentInvestor, selectInvestorProfile } from "@/store/slices/investorSlice";
import { selectInterestIds } from "@/store/slices/interestsSlice";
import { StatCard } from "@/components/ui/StatCard";
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

      {/* Thin Metric Strip: 4 cards in one row, label ABOVE value */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="PORTFOLIO VALUE"
          value={summary ? formatLakhs(summary.totalInvestment) : "—"}
        />
        <StatCard
          label="ACTIVE DEALS"
          value={summary ? summary.activeDeals : "—"}
        />
        <StatCard
          label="AVG. TARGET ROI"
          value={summary ? `${summary.avgRoi}%` : "—"}
        />
        <StatCard
          label="WATCHLISTED"
          value={watchlistIds.length}
        />
      </div>

      {/* 2/3 Line Chart + 1/3 Risk Donut */}
      {status === "succeeded" && summary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <InvestmentGrowthChart data={investor?.investmentGrowth || []} />
          </div>
          <IndustryDistributionChart data={summary.industryDistribution} />
        </div>
      )}

      {/* Full-Width Risk vs Return Scatter Plot */}
      {status === "succeeded" && summary && (
        <div className="w-full">
          <RiskVsRoiScatterChart data={summary.riskVsRoi} />
        </div>
      )}
    </div>
  );
}
