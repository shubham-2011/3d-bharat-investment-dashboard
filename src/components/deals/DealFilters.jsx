"use client";

import { Filter, RotateCcw, X } from "lucide-react";

const INDUSTRIES = ["Roads", "Bridges", "Railway", "Metro", "Solar", "Smart City"];
const RISK_LEVELS = ["Low", "Medium", "High"];

export function DealFilters({ filters, onChange, onReset }) {
  const toggleIndustry = (ind) => {
    const current = filters.industries || [];
    const updated = current.includes(ind)
      ? current.filter((i) => i !== ind)
      : [...current, ind];
    onChange({ ...filters, industries: updated });
  };

  const toggleRisk = (risk) => {
    const current = filters.riskLevels || [];
    const updated = current.includes(risk)
      ? current.filter((r) => r !== risk)
      : [...current, risk];
    onChange({ ...filters, riskLevels: updated });
  };

  const handleRoiChange = (min) => {
    onChange({ ...filters, roiMin: min ? Number(min) : undefined });
  };

  const hasActiveFilters =
    (filters.industries?.length || 0) > 0 ||
    (filters.riskLevels?.length || 0) > 0 ||
    filters.roiMin != null;

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Filter Deals
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Industry Filter */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Industry Sector
        </label>
        <div className="space-y-1.5">
          {INDUSTRIES.map((ind) => {
            const isChecked = filters.industries?.includes(ind);
            return (
              <label
                key={ind}
                className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <input
                  type="checkbox"
                  checked={!!isChecked}
                  onChange={() => toggleIndustry(ind)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 dark:bg-slate-800 cursor-pointer"
                />
                {ind}
              </label>
            );
          })}
        </div>
      </div>

      {/* Risk Level Filter */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Risk Appetite
        </label>
        <div className="space-y-1.5">
          {RISK_LEVELS.map((risk) => {
            const isChecked = filters.riskLevels?.includes(risk);
            return (
              <label
                key={risk}
                className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <input
                  type="checkbox"
                  checked={!!isChecked}
                  onChange={() => toggleRisk(risk)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 dark:bg-slate-800 cursor-pointer"
                />
                {risk} Risk
              </label>
            );
          })}
        </div>
      </div>

      {/* Min ROI Slider / Selector */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Min ROI Target
          </span>
          <span className="text-blue-600 dark:text-blue-400">
            {filters.roiMin ? `${filters.roiMin}%+` : "Any"}
          </span>
        </div>
        <input
          type="range"
          min="8"
          max="30"
          step="1"
          value={filters.roiMin || 8}
          onChange={(e) => handleRoiChange(e.target.value)}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>8%</span>
          <span>18%</span>
          <span>30%</span>
        </div>
      </div>
    </div>
  );
}
