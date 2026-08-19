"use client";

export function ErrorState({ message = "Couldn't load metrics.", onRetry }) {
  return (
    <div className="p-4 rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-center max-w-md mx-auto my-4 space-y-3">
      <p className="text-xs text-stone-600 dark:text-stone-400 font-sans">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1 text-xs border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded font-medium cursor-pointer transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
