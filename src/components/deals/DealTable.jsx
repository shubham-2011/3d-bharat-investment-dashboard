"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { toggleInterest, selectIsInterested } from "@/store/slices/interestsSlice";
import { RiskBadge, MatchBadge, IndustryTag } from "@/components/ui/Badge";
import { formatLakhs } from "@/utils/formatters";
import { Star } from "lucide-react";

export function DealTable({ deals = [] }) {
  const dispatch = useDispatch();

  return (
    <div className="w-full overflow-x-auto border border-stone-200 dark:border-stone-800 rounded-md bg-white dark:bg-stone-900">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 text-stone-500 font-semibold">
            <th className="py-2.5 px-3">Project</th>
            <th className="py-2.5 px-3">Industry</th>
            <th className="py-2.5 px-3">Risk</th>
            <th className="py-2.5 px-3 text-right">Min. Entry</th>
            <th className="py-2.5 px-3 text-right">Target ROI</th>
            <th className="py-2.5 px-3 text-right">Raised</th>
            <th className="py-2.5 px-3 text-right">Match %</th>
            <th className="py-2.5 px-3 text-center">Watch</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 font-mono">
          {deals.map((deal) => (
            <DealTableRow key={deal.id} deal={deal} onToggle={() => dispatch(toggleInterest(deal.id))} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DealTableRow({ deal, onToggle }) {
  const isInterested = useSelector(selectIsInterested(deal.id));

  return (
    <tr className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors h-10">
      <td className="py-2 px-3 font-sans font-medium text-stone-900 dark:text-stone-100">
        <Link href={`/deals/${deal.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
          {deal.projectName}
        </Link>
        <span className="block text-[11px] font-sans text-stone-400">
          {deal.company} • {deal.location}
        </span>
      </td>
      <td className="py-2 px-3 font-sans">
        <IndustryTag industry={deal.industry} />
      </td>
      <td className="py-2 px-3 font-sans">
        <RiskBadge level={deal.riskLevel} />
      </td>
      <td className="py-2 px-3 text-right font-medium text-stone-700 dark:text-stone-300">
        {formatLakhs(deal.minInvestment)}
      </td>
      <td className="py-2 px-3 text-right font-semibold text-emerald-700 dark:text-emerald-400">
        {deal.roi}%
      </td>
      <td className="py-2 px-3 text-right text-stone-700 dark:text-stone-300">
        {formatLakhs(deal.fundingRaised)}
      </td>
      <td className="py-2 px-3 text-right font-sans">
        {deal.matchScore != null ? <MatchBadge score={deal.matchScore} /> : "—"}
      </td>
      <td className="py-2 px-3 text-center">
        <button
          onClick={onToggle}
          className="text-stone-300 dark:text-stone-600 hover:text-amber-500 transition-colors cursor-pointer"
          title={isInterested ? "Remove from watchlist" : "Add to watchlist"}
        >
          <Star className={`w-4 h-4 inline ${isInterested ? "fill-amber-400 text-amber-400" : ""}`} />
        </button>
      </td>
    </tr>
  );
}
