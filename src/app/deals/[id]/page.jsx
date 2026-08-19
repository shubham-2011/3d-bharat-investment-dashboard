"use client";

import { useEffect, useState, useMemo, use } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { fetchDealById } from "@/store/slices/dealsSlice";
import { fetchCurrentInvestor, selectInvestorProfile } from "@/store/slices/investorSlice";
import { toggleInterest, selectIsInterested } from "@/store/slices/interestsSlice";
import { scoreDeal } from "@/utils/scoring";
import { RiskBadge, IndustryTag, MatchBadge } from "@/components/ui/Badge";
import { formatCr } from "@/utils/formatters";
import { ErrorState } from "@/components/ui/ErrorState";

import { ArrowLeft, Star } from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "financials", label: "Financials" },
  { id: "projection", label: "ROI Projection" },
];

export default function DealDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const dealId = params.id;
  const dispatch = useDispatch();

  const currentDeal = useSelector((state) => state.deals.currentDeal);
  const detailStatus = useSelector((state) => state.deals.detailStatus);
  const detailError = useSelector((state) => state.deals.detailError);

  const investor = useSelector(selectInvestorProfile);
  const isInterested = useSelector(selectIsInterested(dealId));

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    dispatch(fetchDealById(dealId));
    dispatch(fetchCurrentInvestor());
  }, [dispatch, dealId]);

  const scoreResult = useMemo(() => {
    if (!currentDeal || !investor) return null;
    return scoreDeal(currentDeal, investor);
  }, [currentDeal, investor]);

  if (detailStatus === "loading" || (!currentDeal && detailStatus !== "failed")) {
    return (
      <div className="space-y-4 py-4 animate-pulse">
        <div className="h-4 w-20 bg-stone-200 dark:bg-stone-800 rounded" />
        <div className="h-24 bg-stone-100 dark:bg-stone-900 rounded-md border border-stone-200 dark:border-stone-800" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-72 bg-stone-100 dark:bg-stone-900 rounded-md border border-stone-200 dark:border-stone-800" />
          <div className="h-72 bg-stone-100 dark:bg-stone-900 rounded-md border border-stone-200 dark:border-stone-800" />
        </div>
      </div>
    );
  }

  if (detailStatus === "failed" || !currentDeal) {
    return (
      <div className="space-y-4">
        <Link
          href="/deals"
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Deals
        </Link>
        <ErrorState
          message={detailError || `Deal ${dealId} could not be loaded.`}
          onRetry={() => dispatch(fetchDealById(dealId))}
        />
      </div>
    );
  }

  const revenueHistory = currentDeal.financials?.revenue3y || [
    { year: 2023, revenue: parseFloat((currentDeal.financials?.revenue * 0.75).toFixed(1)) || 1.2 },
    { year: 2024, revenue: parseFloat((currentDeal.financials?.revenue * 0.88).toFixed(1)) || 1.5 },
    { year: 2025, revenue: currentDeal.financials?.revenue || 1.8 },
  ];

  return (
    <div className="space-y-5">
      {/* Back button */}
      <Link
        href="/deals"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Deals
      </Link>

      {/* Header Info */}
      <div className="p-4 rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              {currentDeal.projectName || currentDeal.companyName || currentDeal.company}
            </h1>
            <RiskBadge level={currentDeal.riskLevel} />
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
            <span>{currentDeal.companyName || currentDeal.company}</span>
            <span>•</span>
            <IndustryTag industry={currentDeal.industry} />
            <span>•</span>
            <span>{currentDeal.location || currentDeal.city}</span>
          </p>
        </div>

        <button
          onClick={() => dispatch(toggleInterest(currentDeal.id))}
          aria-label={isInterested ? "Remove from Watchlist" : "Add to Watchlist"}
          aria-pressed={isInterested}
          className={`p-2.5 rounded-md border text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            isInterested
              ? "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400"
              : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700"
          }`}
        >
          <Star className={`w-5 h-5 ${isInterested ? "fill-amber-400 text-amber-400" : ""}`} />
          <span>{isInterested ? "Saved" : "Save Deal"}</span>
        </button>
      </div>

      {/* 2/3 Left (Tabs) + 1/3 Right (Sticky Summary & Score) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Deal Details Sections"
            className="flex border-b border-stone-200 dark:border-stone-800 gap-4 text-xs font-semibold"
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={activeTab === t.id}
                aria-controls={`tabpanel-${t.id}`}
                tabIndex={activeTab === t.id ? 0 : -1}
                onClick={() => setActiveTab(t.id)}
                className={`pb-2.5 transition-colors border-b-2 cursor-pointer outline-hidden focus-visible:text-blue-600 ${
                  activeTab === t.id
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Panel: Overview */}
          {activeTab === "overview" && (
            <div
              role="tabpanel"
              id="tabpanel-overview"
              aria-labelledby="tab-overview"
              className="p-4 rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-700 dark:text-stone-300 space-y-3 leading-relaxed shadow-xs"
            >
              <p>
                {currentDeal.description ||
                  `The ${currentDeal.projectName} project is an infrastructure monitoring asset under ${currentDeal.company}. Verified using 3D point-cloud scans and drone telemetry.`}
              </p>
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 text-stone-500 dark:text-stone-400 grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                <div>Created: {new Date(currentDeal.createdAt).toLocaleDateString()}</div>
                <div>Stage: {currentDeal.stage}</div>
                <div>Target Raise: {formatCr(currentDeal.dealSize || currentDeal.fundingTarget)}</div>
                <div>Location: {currentDeal.location || `${currentDeal.city}, ${currentDeal.state}`}</div>
              </div>
            </div>
          )}

          {/* Tab Panel: Financials */}
          {activeTab === "financials" && (
            <div
              role="tabpanel"
              id="tabpanel-financials"
              aria-labelledby="tab-financials"
              className="p-4 rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs space-y-4 shadow-xs"
            >
              {currentDeal.financials ? (
                <>
                  {/* 3-Bar Revenue History Chart */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-sans">
                      3-Year Annual Revenue (₹ Cr)
                    </span>
                    <div className="h-40 w-full pt-1" role="img" aria-label="3-Year Annual Revenue Bar Chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueHistory} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="2 4" stroke="#44403c" opacity={0.15} vertical={false} />
                          <XAxis dataKey="year" tick={{ fill: "#a8a29e", fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "#a8a29e", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}Cr`} />
                          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, backgroundColor: "#1c1917", color: "#fff" }} formatter={(v) => [formatCr(v), "Revenue"]} />
                          <Bar dataKey="revenue" fill="#1a56db" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 3 Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono pt-2 border-t border-stone-100 dark:border-stone-800">
                    <div className="p-3 rounded bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                      <span className="text-[10px] text-stone-400 block uppercase tracking-wider font-sans">Profit Margin</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                        {currentDeal.financials.profitMargin}%
                      </span>
                    </div>
                    <div className="p-3 rounded bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                      <span className="text-[10px] text-stone-400 block uppercase tracking-wider font-sans">YoY Growth</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm">
                        +{currentDeal.financials.growthRate}%
                      </span>
                    </div>
                    <div className="p-3 rounded bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                      <span className="text-[10px] text-stone-400 block uppercase tracking-wider font-sans">Debt / Equity</span>
                      <span className="font-semibold text-stone-700 dark:text-stone-300 text-sm">
                        {currentDeal.financials.debtEquityRatio}x
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-stone-400">Financial audits in progress.</p>
              )}
            </div>
          )}

          {/* Tab Panel: ROI Projection */}
          {activeTab === "projection" && (
            <div
              role="tabpanel"
              id="tabpanel-projection"
              aria-labelledby="tab-projection"
              className="p-4 rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3 shadow-xs"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                5-Year Yield Trajectory (3-Series Band)
              </span>
              <div className="h-64 w-full pt-1" role="img" aria-label="5-Year ROI Projection 3-Series Trajectory Chart">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={currentDeal.roiProjections || []} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#44403c" opacity={0.15} vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: "#a8a29e", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#a8a29e", fontSize: 11 }} unit="%" axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, backgroundColor: "#1c1917", color: "#fff" }} />
                    <Area dataKey="optimistic" stroke="none" fill="#15803d" fillOpacity={0.07} />
                    <Area dataKey="conservative" stroke="none" fill="#ffffff" fillOpacity={1} />
                    <Line dataKey="conservative" stroke="#a8a29e" strokeDasharray="4 3" strokeWidth={1.25} dot={false} />
                    <Line dataKey="projected" stroke="#15803d" strokeWidth={1.75} dot={false} />
                    <Line dataKey="optimistic" stroke="#a8a29e" strokeDasharray="4 3" strokeWidth={1.25} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[11px] font-mono text-center text-stone-400 dark:text-stone-500 pt-1">
                conservative · projected · optimistic
              </div>
            </div>
          )}
        </div>

        {/* 1/3 Right: Sticky Summary Card & Score Breakdown */}
        <div className="space-y-4 lg:sticky lg:top-20">
          <div className="p-4 rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 border-b border-stone-100 dark:border-stone-800 pb-2">
              Investment Terms
            </h2>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-stone-500">Deal Size:</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  {formatCr(currentDeal.dealSize || currentDeal.fundingTarget)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Raised:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {formatCr(currentDeal.fundingRaised)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Min Check:</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  {formatCr(currentDeal.minInvestment)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Max Check:</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  {formatCr(currentDeal.maxInvestment)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Equity Offered:</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  {currentDeal.equityOffered}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Expected ROI:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {currentDeal.expectedROI || currentDeal.roi}%
                </span>
              </div>
            </div>
          </div>

          {/* Match Score Breakdown Card */}
          {scoreResult && (
            <div className="p-4 rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Investor Match
                </span>
                <MatchBadge score={scoreResult.total} />
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 font-sans">Risk Alignment (30pt):</span>
                  <span>{scoreResult.breakdown.risk} pts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 font-sans">Industry Match (25pt):</span>
                  <span>{scoreResult.breakdown.industry} pts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 font-sans">Budget Fit (25pt):</span>
                  <span>{scoreResult.breakdown.budget} pts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 font-sans">ROI Appeal (20pt):</span>
                  <span>{scoreResult.breakdown.roi} pts</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
