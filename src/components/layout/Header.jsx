"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "@/context/ThemeContext";
import { fetchCurrentInvestor, selectInvestorProfile } from "@/store/slices/investorSlice";
import { Sun, Moon, Menu } from "lucide-react";

export function Header({ onMenuClick }) {
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const investor = useSelector(selectInvestorProfile);

  useEffect(() => {
    dispatch(fetchCurrentInvestor());
  }, [dispatch]);

  return (
    <header className="sticky top-0 z-20 h-12 bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 px-3 sm:px-6 flex items-center justify-between gap-3">
      {/* Mobile Menu Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Right Controls: Theme Toggle & User Name */}
      <div className="flex items-center gap-3 text-xs">
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer flex items-center gap-1.5"
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

        <div className="text-stone-700 dark:text-stone-300 font-medium truncate">
          {investor?.name || "Meera Nair"}
        </div>
      </div>
    </header>
  );
}
