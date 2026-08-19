"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { toggleInterest, selectIsInterested } from "@/store/slices/interestsSlice";
import { RiskBadge, MatchBadge, IndustryTag } from "@/components/ui/Badge";
import { formatLakhs } from "@/utils/formatters";
import { Bookmark, ArrowRight, MapPin, Building, Info } from "lucide-react";

export function DealCard({ deal, matchScore, onOpenMatchBreakdown }) {
  const dispatch = useDispatch();
  const isInterested = useSelector(selectIsInterested(deal.id));

  const percentFunded = Math.round(
    (deal.fundingRaised / (deal.fundingTarget || deal.fundingRaised * 1.25)) * 100
  );

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header: Industry Tag, Match Score, Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <IndustryTag industry={deal.industry} />
            {matchScore != null && (
              <button
                onClick={() => onOpenMatchBreakdown?.(deal)}
                className="hover:scale-105 transition-transform cursor-pointer"
                title="Click to view recommendation score breakdown"
              >
                <MatchBadge score={matchScore} />
              </button>
            )}
          </div>

          <button
            onClick={() => dispatch(toggleInterest(deal.id))}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isInterested
                ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                : "border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title={isInterested ? "Remove from saved interests" : "Save to my interests"}
          >
            <Bookmark className={`w-4 h-4 ${isInterested ? "fill-amber-500" : ""}`} />
          </button>
        </div>

        {/* Project Name & Company */}
        <Link href={`/deals/${deal.id}`} className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
            {deal.projectName}
          </h3>
        </Link>
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
          <span className="flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            {deal.company}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {deal.location}
          </span>
        </div>

        {/* Key Financial Metrics */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Projected ROI
            </span>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {deal.roi}%
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Funding Raised
            </span>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {formatLakhs(deal.fundingRaised)}
            </p>
          </div>
        </div>

        {/* Funding Progress Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400">Funding Progress</span>
            <span className="text-slate-700 dark:text-slate-300">{percentFunded}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, percentFunded)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Footer: Risk Badge & View Button */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <RiskBadge level={deal.riskLevel} />

        <Link
          href={`/deals/${deal.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 hover:text-white dark:hover:text-white text-xs font-bold transition-all group/btn"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
