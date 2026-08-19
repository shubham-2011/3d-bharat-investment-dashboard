"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Overview" },
  { href: "/deals", label: "Deals" },
  { href: "/investments", label: "Watchlist" },
  { href: "/corporate", label: "Corporate" },
];

export function Sidebar({ mobileOpen = false, onClose }) {
  const pathname = usePathname();

  const renderNavContent = (isMobile = false) => (
    <div className="flex flex-col h-full bg-white dark:bg-stone-950 border-r border-stone-200 dark:border-stone-800">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
        <Link href="/" onClick={isMobile ? onClose : undefined} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-blue-600 rounded-xs inline-block" aria-hidden="true" />
          <span className="text-sm font-bold tracking-tight text-stone-900 dark:text-stone-100">
            3D Bharat
          </span>
        </Link>
        {isMobile && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="lg:hidden text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer p-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-md focus-visible:ring-2 focus-visible:ring-blue-600 outline-hidden"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-3" aria-label="Main navigation">
        <div className="px-5 pb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          Menu
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={isMobile ? onClose : undefined}
              className={`flex items-center px-5 py-2 text-xs font-medium transition-colors border-l-2 ${
                isActive
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-stone-50 dark:bg-stone-900 font-semibold"
                  : "border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50/60 dark:hover:bg-stone-900/50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info / Monitoring Status */}
      <div className="p-4 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-400 dark:text-stone-500">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" aria-hidden="true" />
          <span>Monitoring active</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar - exactly 1 nav landmark when drawer closed */}
      <aside className="hidden lg:block w-[220px] fixed inset-y-0 left-0 z-30">
        {renderNavContent(false)}
      </aside>

      {/* Mobile Drawer - Conditionally rendered to prevent duplicate landmark trees */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />
          <div
            id="mobile-nav"
            className="fixed inset-y-0 left-0 w-[220px] bg-white dark:bg-stone-950 z-50 shadow-xl"
          >
            {renderNavContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
