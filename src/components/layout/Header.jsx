"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { fetchCurrentInvestor, selectInvestorProfile } from "@/store/slices/investorSlice";
import { Sun, Moon, Search, Menu } from "lucide-react";

export function Header({ onMenuClick }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const investor = useSelector(selectInvestorProfile);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchCurrentInvestor());
  }, [dispatch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/deals?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 h-12 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-3 sm:px-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 flex-1 max-w-sm">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals..."
            className="w-full pl-8 pr-3 py-1 text-xs rounded bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-blue-600"
          />
        </form>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer flex items-center gap-1.5"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline text-[11px]">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-700" />
              <span className="hidden sm:inline text-[11px]">Dark</span>
            </>
          )}
        </button>

        <div className="text-stone-700 dark:text-stone-300 font-medium truncate max-w-[120px] sm:max-w-none">
          {investor?.name || "Meera Nair"}
        </div>
      </div>
    </header>
  );
}
