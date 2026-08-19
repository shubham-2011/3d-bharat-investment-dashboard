"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export function ErrorState({ title = "Failed to load data", message, onRetry }) {
  return (
    <div className="p-8 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-center max-w-lg mx-auto my-6 space-y-4 shadow-sm">
      <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {message || "An unexpected network error occurred while fetching data."}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-medium text-sm transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Request
        </button>
      )}
    </div>
  );
}
