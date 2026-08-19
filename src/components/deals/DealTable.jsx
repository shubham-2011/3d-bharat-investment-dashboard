"use client";

import React, { memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toggleInterest, selectIsInterested } from "@/store/slices/interestsSlice";
import { RiskBadge, MatchBadge, IndustryTag } from "@/components/ui/Badge";
import { formatLakhs } from "@/utils/formatters";
import { Star } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

export function DealTable({ deals = [], isLoading = false }) {
  const dispatch = useDispatch();

  return (
    <div className="w-full overflow-x-auto border border-stone-200 dark:border-stone-800 rounded-md bg-white dark:bg-stone-900 shadow-xs">
      <table className="w-full text-left border-collapse text-xs" aria-label="Deal Explorer Table">
        <thead>
          <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 font-semibold select-none">
            <th scope="col" className="py-2.5 px-3">Project</th>
            <th scope="col" className="py-2.5 px-3">Industry</th>
            <th scope="col" className="py-2.5 px-3">Risk</th>
            <th scope="col" className="py-2.5 px-3 text-right font-mono">Min. Entry</th>
            <th scope="col" className="py-2.5 px-3 text-right font-mono">Target ROI</th>
            <th scope="col" className="py-2.5 px-3 text-right font-mono">Raised</th>
            <th scope="col" className="py-2.5 px-3 text-right font-mono">Match %</th>
            <th scope="col" className="py-2.5 px-3 text-center">
              <span className="sr-only">Watchlist</span>
              <Star className="w-3.5 h-3.5 inline text-stone-400 dark:text-stone-500" aria-hidden="true" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 font-mono">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <tr key={`skeleton-${idx}`} className="h-11">
                <td className="py-2.5 px-3 font-sans">
                  <Skeleton className="h-3.5 w-44 mb-1" />
                  <Skeleton className="h-2.5 w-28" />
                </td>
                <td className="py-2.5 px-3"><Skeleton className="h-5 w-20 rounded" /></td>
                <td className="py-2.5 px-3"><Skeleton className="h-4 w-16 rounded" /></td>
                <td className="py-2.5 px-3 text-right"><Skeleton className="h-3.5 w-16 ml-auto" /></td>
                <td className="py-2.5 px-3 text-right"><Skeleton className="h-3.5 w-12 ml-auto" /></td>
                <td className="py-2.5 px-3 text-right"><Skeleton className="h-3.5 w-16 ml-auto" /></td>
                <td className="py-2.5 px-3 text-right"><Skeleton className="h-3.5 w-10 ml-auto" /></td>
                <td className="py-2.5 px-3 text-center"><Skeleton className="h-4 w-4 mx-auto rounded" /></td>
              </tr>
            ))
          ) : (
            deals.map((deal) => (
              <DealTableRow
                key={deal.id}
                deal={deal}
                onToggle={() => dispatch(toggleInterest(deal.id))}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const DealTableRow = memo(function DealTableRow({ deal, onToggle }) {
  const router = useRouter();
  const isInterested = useSelector(selectIsInterested(deal.id));

  const handleRowClick = () => {
    router.push(`/deals/${deal.id}`);
  };

  return (
    <tr
      onClick={handleRowClick}
      className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors h-11 cursor-pointer group"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleRowClick();
        }
      }}
    >
      <td className="py-2 px-3 font-sans font-medium text-stone-900 dark:text-stone-100">
        <Link
          href={`/deals/${deal.id}`}
          onClick={(e) => e.stopPropagation()}
          className="hover:text-blue-600 dark:hover:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors focus:outline-hidden focus-visible:underline"
        >
          {deal.projectName}
        </Link>
        <span className="block text-[11px] font-sans text-stone-500 dark:text-stone-400">
          {deal.company} • {deal.location}
        </span>
      </td>
      <td className="py-2 px-3 font-sans">
        <IndustryTag industry={deal.industry} />
      </td>
      <td className="py-2 px-3 font-sans">
        <RiskBadge level={deal.riskLevel} />
      </td>
      <td className="py-2 px-3 text-right font-medium text-stone-700 dark:text-stone-300 tabular-nums">
        {formatLakhs(deal.minInvestment)}
      </td>
      <td className="py-2 px-3 text-right font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
        {deal.roi}%
      </td>
      <td className="py-2 px-3 text-right text-stone-700 dark:text-stone-300 tabular-nums">
        {formatLakhs(deal.fundingRaised)}
      </td>
      <td className="py-2 px-3 text-right font-sans tabular-nums">
        {deal.matchScore != null ? <MatchBadge score={deal.matchScore} /> : <span className="text-stone-400 font-mono">—</span>}
      </td>
      <td className="py-2 px-3 text-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          aria-label={isInterested ? `Remove ${deal.projectName} from watchlist` : `Add ${deal.projectName} to watchlist`}
          aria-pressed={isInterested}
          className="text-stone-400 dark:text-stone-500 hover:text-amber-500 transition-colors cursor-pointer p-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-800/80 focus-visible:ring-2 focus-visible:ring-blue-600 outline-hidden"
          title={isInterested ? "Remove from watchlist" : "Add to watchlist"}
        >
          <Star className={`w-4 h-4 ${isInterested ? "fill-amber-400 text-amber-400" : ""}`} />
        </button>
      </td>
    </tr>
  );
});
