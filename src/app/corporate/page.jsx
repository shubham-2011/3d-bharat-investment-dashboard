"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCorporateAnalytics, selectCorporate } from "@/store/slices/investorSlice";
import { StatCard } from "@/components/ui/StatCard";
import { StatCardSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatLakhs } from "@/utils/formatters";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function CorporatePage() {
  const dispatch = useDispatch();
  const { data, status, error } = useSelector(selectCorporate);

  useEffect(() => {
    dispatch(fetchCorporateAnalytics());
  }, [dispatch]);

  const handleRetry = () => {
    dispatch(fetchCorporateAnalytics());
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2.5 rounded-md bg-stone-900 text-white text-xs border border-stone-800 space-y-0.5 font-mono shadow-md">
          <p className="font-sans text-stone-400">{label}</p>
          <p className="font-semibold text-blue-400">
            {formatLakhs(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Corporate
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Issuer Metrics & Funding Analytics
          </p>
        </div>
      </div>

      {/* Single-Source State Management: Error OR Skeletons OR Data */}
      {status === "failed" && (
        <ErrorState message={error || "Couldn't load corporate metrics."} onRetry={handleRetry} />
      )}

      {status === "loading" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          <ChartSkeleton height="h-72" />
        </div>
      )}

      {status === "succeeded" && data && (
        <>
          {/* Thin Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard
              label="TOTAL RAISED"
              value={formatLakhs(data.totalFundingRaised)}
            />
            <StatCard
              label="INVESTORS"
              value={data.investorCount}
            />
            <StatCard
              label="CONVERSION"
              value={`${data.conversionRate}%`}
            />
          </div>

          {/* Monthly Funding Trend Chart */}
          <div className="p-4 rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3 shadow-xs">
            <div className="border-b border-stone-100 dark:border-stone-800 pb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                Monthly funding trend
              </h3>
            </div>

            <div className="h-64 w-full pt-1" role="img" aria-label="Monthly corporate funding trend bar chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.fundingTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#44403c" opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fill: "#a8a29e", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#a8a29e", fontSize: 11 }} tickFormatter={(v) => `₹${v}L`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#1a56db" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
