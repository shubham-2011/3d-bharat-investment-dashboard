"use client";

export function StatCard({ label, value, subtext }) {
  return (
    <div className="p-3.5 rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col justify-between h-[76px]">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block truncate">
        {label}
      </span>

      <div className="flex items-baseline justify-between gap-2 overflow-hidden">
        <span className="text-xl sm:text-2xl font-semibold text-stone-900 dark:text-stone-100 font-mono tracking-tight whitespace-nowrap truncate">
          {value}
        </span>
        {subtext && (
          <span className="text-[11px] text-stone-500 dark:text-stone-400 whitespace-nowrap truncate">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}
