"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "@/context/ThemeContext";
import { fetchCurrentInvestor, selectInvestorProfile } from "@/store/slices/investorSlice";
import { Sun, Moon, Menu } from "lucide-react";

export function Header({ mobileOpen = false, onMenuToggle }) {
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const investor = useSelector(selectInvestorProfile);

  useEffect(() => {
    dispatch(fetchCurrentInvestor());
  }, [dispatch]);

  return (
    <header className="sticky top-0 z-20 h-14 bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 px-3 sm:px-6 flex items-center justify-between gap-3">
      {/* Mobile Menu Button with Explicit Disclosure Semantics */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          className="lg:hidden p-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-md text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-blue-600 outline-hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Right Controls: Icon-only Theme Toggle & User Name */}
      <div className="flex items-center gap-3 text-xs">
        <button
          type="button"
          onClick={toggleTheme}
          aria-pressed={theme === "dark"}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="p-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-md border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 outline-hidden"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
          ) : (
            <Moon className="w-4 h-4 text-stone-700" aria-hidden="true" />
          )}
        </button>

        <div className="text-stone-700 dark:text-stone-300 font-medium truncate">
          {investor?.name || "Shubham Kumar"}
        </div>
      </div>
    </header>
  );
}
