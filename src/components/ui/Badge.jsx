"use client";

import { RISK_COLORS, INDUSTRY_COLORS } from "@/utils/formatters";

export function RiskBadge({ level }) {
  const color = RISK_COLORS[level] || "#78716c";

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 dark:text-stone-300">
      <span
        className="w-2 h-2 rounded-full inline-block"
        style={{ backgroundColor: color }}
      />
      {level}
    </span>
  );
}

export function MatchBadge({ score }) {
  let textColor = "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900";
  if (score < 70 && score >= 45) {
    textColor = "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900";
  } else if (score < 45) {
    textColor = "text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700";
  }

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold border ${textColor}`}>
      {score}% match
    </span>
  );
}

export function IndustryTag({ industry }) {
  const dotColor = INDUSTRY_COLORS[industry] || "#1a56db";

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700/60">
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
      {industry}
    </span>
  );
}
