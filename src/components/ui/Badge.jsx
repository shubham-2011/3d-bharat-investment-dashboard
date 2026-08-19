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

/** Plain num text per D7 — zero pill background fills, zero borders, zero word "match" */
export function MatchBadge({ score }) {
  if (score == null) return <span className="text-stone-400">—</span>;

  let colorClass = "text-emerald-700 dark:text-emerald-400 font-semibold";
  if (score < 70 && score >= 40) {
    colorClass = "text-stone-700 dark:text-stone-300 font-semibold";
  } else if (score < 40) {
    colorClass = "text-stone-400 dark:text-stone-500 font-medium";
  }

  return (
    <span className={`font-mono text-xs ${colorClass}`}>
      {score}%
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
