"use client";

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`rounded-md bg-slate-200 dark:bg-slate-800/80 animate-shimmer ${className}`}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-36 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function ChartSkeleton({ height = "h-72" }) {
  return (
    <div className={`p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col gap-4 ${height}`}>
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex-1 flex items-end gap-3 pt-4">
        {[40, 65, 30, 85, 50, 75, 60, 90, 45, 70, 55, 80].map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-sm"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function DealCardSkeleton() {
  return (
    <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}
