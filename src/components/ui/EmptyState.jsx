"use client";

import { SearchX, FilterX } from "lucide-react";

export function EmptyState({
  title = "No deals found",
  message = "No infrastructure deals match your current search terms or filter criteria.",
  onResetFilters,
}) {
  return (
    <div className="p-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-center max-w-md mx-auto my-8 space-y-4 shadow-sm">
      <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
        <SearchX className="w-7 h-7" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{message}</p>
      </div>
      {onResetFilters && (
        <button
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm transition-colors cursor-pointer"
        >
          <FilterX className="w-4 h-4" />
          Clear All Filters
        </button>
      )}
    </div>
  );
}
