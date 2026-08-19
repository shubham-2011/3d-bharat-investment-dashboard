"use client";

import { useEffect, useState, useMemo, use } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { fetchDealById } from "@/store/slices/dealsSlice";
import { fetchCurrentInvestor, selectInvestorProfile } from "@/store/slices/investorSlice";
import { toggleInterest, selectIsInterested } from "@/store/slices/interestsSlice";
import { scoreDeal } from "@/utils/scoring";
import { RiskBadge, IndustryTag, MatchBadge } from "@/components/ui/Badge";
import { formatLakhs } from "@/utils/formatters";
import { ErrorState } from "@/components/ui/ErrorState";

import { ArrowLeft, Star } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

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
      <div className="py-8 space-y-4 max-w-md mx-auto">
        <ErrorState
          message={detailError || `Could not find deal ${dealId}. It may have been archived or removed.`}
          onRetry={() => dispatch(fetchDealById(dealId))}
        />
        <div className="text-center">
          <Link
            href="/deals"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Return to Deal Explorer
          </Link>
        </div>
      </div>
    );
  }

  const percentFunded = Math.round(
    (currentDeal.fundingRaised / (currentDeal.fundingTarget || currentDeal.fundingRaised * 1.25)) * 100
  );

  return (
    <div className="space-y-5">
      {/* Top Back Link */}
      <Link
        href="/deals"
        className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Deals
      </Link>

      {/* Header Bar */}
      <div className="p-4 rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <IndustryTag industry={currentDeal.industry} />
            <RiskBadge level={currentDeal.riskLevel} />
            {scoreResult && <MatchBadge score={scoreResult.total} />}
          </div>

          <h1 className="text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            {currentDeal.projectName}
          </h1>

          <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            {currentDeal.company} • {currentDeal.location} • Stage: {currentDeal.stage}
          </div>
        </div>

        <button
          type="button"
          onClick={() => dispatch(toggleInterest(currentDeal.id))}
          aria-label={isInterested ? `Remove ${currentDeal.projectName} from watchlist` : `Add ${currentDeal.projectName} to watchlist`}
          aria-pressed={isInterested}
          className="p-2.5 rounded-full border border-stone-200 dark:border-stone-800 text-stone-400 hover:text-amber-500 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors self-start md:self-auto cursor-pointer min-w-[44px] min-h-[44px] inline-flex items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-600 outline-hidden"
          title={isInterested ? "Remove from watchlist" : "Add to watchlist"}
        >
          <Star className={`w-5 h-5 ${isInterested ? "fill-amber-400 text-amber-400" : ""}`} />
        </button>
      </div>

      {/* 2/3 Left (Tabs) + 1/3 Right (Sticky Summary & Score) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-4">
          {/* Accessible Semantic Tabs */}
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
                <div>Target Raise: {formatLakhs(currentDeal.fundingTarget || currentDeal.fundingRaised)}</div>
                <div>Location: {currentDeal.location}</div>
              </div>
            </div>
          )}

          {/* Tab Panel: Financials */}
          {activeTab === "financials" && (
            <div
              role="tabpanel"
              id="tabpanel-financials"
              aria-labelledby="tab-financials"
              className="p-4 rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs space-y-3 shadow-xs"
            >
              {currentDeal.financials ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="p-3 rounded bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                    <span className="text-[10px] text-stone-400 block uppercase tracking-wider font-sans">Annual Revenue</span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                      {formatLakhs(currentDeal.financials.revenue)}
                    </span>
                  </div>
                  <div className="p-3 rounded bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                    <span className="text-[10px] text-stone-400 block uppercase tracking-wider font-sans">Profit Margin</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                      {currentDeal.financials.profitMargin ?? currentDeal.financials.profit}%
                    </span>
                  </div>
                  <div className="p-3 rounded bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                    <span className="text-[10px] text-stone-400 block uppercase tracking-wider font-sans">YoY Growth</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm">
                      +{currentDeal.financials.growthRate ?? currentDeal.financials.growth ?? 18}%
                    </span>
                  </div>
                  <div className="p-3 rounded bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                    <span className="text-[10px] text-stone-400 block uppercase tracking-wider font-sans">Debt / Equity</span>
                    <span className="font-semibold text-stone-700 dark:text-stone-300 text-sm">
                      {currentDeal.financials.debtEquityRatio ?? 0.8}x
                    </span>
                  </div>
                </div>
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
                5-Year Yield Trajectory
              </span>
              <div className="h-64 w-full pt-1" role="img" aria-label="5-Year ROI Projection Trajectory Chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentDeal.roiProjections}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#44403c" opacity={0.15} />
                    <XAxis dataKey="year" tick={{ fill: "#a8a29e", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#a8a29e", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      formatter={(v) => [`${v}%`, "Projected ROI"]}
                      contentStyle={{
                        backgroundColor: "#1c1917",
                        borderColor: "#292524",
                        borderRadius: "6px",
                        fontSize: "11px",
                        color: "#fff",
                      }}
                    />
                    <Area type="monotone" dataKey="roi" stroke="#15803d" fill="#15803d" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* 1/3 Right: Sticky Summary Card & Score Breakdown */}
        <div className="space-y-4 lg:sticky lg:top-16">
          <div className="p-4 rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-4 text-xs shadow-xs">
            <h3 className="font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Deal Summary
            </h3>

            <div className="space-y-2 font-mono">
              <div className="flex justify-between border-b border-stone-100 dark:border-stone-800 pb-1.5">
                <span className="font-sans text-stone-500 dark:text-stone-400">Target ROI</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{currentDeal.roi}%</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 dark:border-stone-800 pb-1.5">
                <span className="font-sans text-stone-500 dark:text-stone-400">Min. Entry</span>
                <span className="text-stone-900 dark:text-stone-100">{formatLakhs(currentDeal.minInvestment)}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 dark:border-stone-800 pb-1.5">
                <span className="font-sans text-stone-500 dark:text-stone-400">Raised</span>
                <span className="text-stone-900 dark:text-stone-100">{formatLakhs(currentDeal.fundingRaised)}</span>
              </div>
            </div>

            {/* Thin 4px Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400">
                <span>Funding progress</span>
                <span>{percentFunded}%</span>
              </div>
              <div className="w-full h-1 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, percentFunded)}%` }}
                />
              </div>
            </div>
          </div>

          {scoreResult && investor && (
            <div className="p-4 rounded-md border border-stone-200 dark:border-stone-800 bg-stone-900 text-stone-100 space-y-3 text-xs shadow-xs">
              <div className="flex justify-between items-baseline border-b border-stone-800 pb-2">
                <span className="font-semibold uppercase text-stone-400 text-[11px] tracking-wider">
                  Match Breakdown
                </span>
                <span className="font-mono text-lg font-bold text-emerald-400">{scoreResult.total}%</span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px] text-stone-300">
                <div className="flex justify-between">
                  <span className="font-sans text-stone-400">Risk match</span>
                  <span>{scoreResult.breakdown.risk} / 30</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-stone-400">Industry fit</span>
                  <span>{scoreResult.breakdown.industry} / 25</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-stone-400">Budget fit</span>
                  <span>{scoreResult.breakdown.budget} / 25</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-stone-400">ROI score</span>
                  <span>{scoreResult.breakdown.roi} / 20</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
