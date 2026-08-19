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

export function Sidebar({ mobileOpen, onClose }) {
  const pathname = usePathname();

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-stone-950 border-r border-stone-200 dark:border-stone-800">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-blue-600 rounded-sm inline-block" />
          <span className="text-sm font-bold tracking-tight text-stone-900 dark:text-stone-100">
            3D Bharat
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-3">
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
              onClick={onClose}
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

      {/* Footer Info */}
      <div className="p-4 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-400 dark:text-stone-500">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <span>Monitoring active</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-[220px] fixed inset-y-0 left-0 z-30">
        {content}
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-[220px] z-50 transform transition-transform duration-200 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {content}
      </aside>
    </>
  );
}
