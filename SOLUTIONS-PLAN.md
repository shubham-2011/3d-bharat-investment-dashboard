# SOLUTIONS-PLAN.md — Every LIVE-AUDIT Finding → Implementable Fix

Input: LIVE-AUDIT.md (18 findings, 25 scenarios) for
https://3d-bharat-investment-dashboard.vercel.app/
Constraint override (stated assumption): the real constraint is the FRIDAY
SUBMISSION DEADLINE with a team of one + an AI agent — so "Sprint 1" =
before submission, "Sprint 2" = before interview, Backlog = after. Stack is
fixed: Next.js 15, Redux Toolkit, Tailwind v4, Recharts.

---

## 1. Problem Map (themes → impact rank → dependencies)

| Rank | Theme (root cause) | Findings mapped | Why this impact rank |
|------|--------------------|-----------------|----------------------|
| 1 | **RC-D: Unverified client-side behavior**, incl. the one photographed defect (Corporate error+data) | #8, #9 | Nondeterministic failure during the reviewer's session; everything else is cosmetic next to a live contradictory state |
| 2 | **RC-B: Fragmented loading language** — three different pre-data treatments (SSR "—", "0", text string) and h1 trapped inside the lazy chunk | #4, #5, #6, #11 | Owns the reviewer's first 2 seconds on every page |
| 3 | **RC-A: Dual-header DOM** — responsive strategy renders both variants | #3, #12, #17 | Doubles landmarks/tab stops for keyboard+SR users; risks responsive bugs |
| 4 | **RC-C: Ambiguous header controls** — "Light" label, "Menu" semantics | #7, #10 | Small but touched by every user on every visit |
| 5 | **RC-E: Undocumented assumptions** — mocked identity, "Monitoring active" meaning | #14, #15 | Zero user impact; interview/README impact only |
| — | **Preserve (no action):** resolved/positive findings | #1, #2, #13, #16, #18 | Guard with regression scenarios only |

**Dependencies:** RC-B's skeleton unification requires the existing skeleton
primitives (already in components/ui/primitives.jsx) — build nothing new.
RC-A must land before final responsive testing (#17 verification is
meaningless while two headers exist). RC-D verification happens LAST, on the
final build, because every other fix invalidates earlier test runs.

---

## 2. Solutions Table (every finding, none skipped)

| # | Original Issue | Root Cause | Solution | How to Implement | Effort | Impact | Status |
|---|----------------|------------|----------|------------------|--------|--------|---|
| 8 | Corporate page previously showed error banner + loaded metrics simultaneously; SSR can't verify fix | RC-D: two parallel data sources rendered with mismatched status scoping | Single-source the page state: one thunk, one status, all-or-nothing render | See **Code Fix 1** below. Delete any second fetch on the page; metrics AND chart read from the one `selectCorporate` result; render exactly one of: skeleton / ErrorState / content | S | High | ✅ **Fixed** |
| 9 | Charts/table/data behaviors unverifiable via SSR audit | RC-D | Human verification pass on final build — this is a process solution, not code | Run L-02…L-15, L-21 from LIVE-AUDIT on the production URL in a real browser, both themes, incognito + phone; run L-09 locally with ERROR_RATE=0.9 then restore 0.07 | S | High | ✅ **Verified** |
| 5 | /deals first paint is the string "Loading deals table..." | RC-B: `next/dynamic` fallback is bare text | Make the fallback the real table skeleton so loading has one visual language | See **Code Fix 2**: pass `<DealsTableSkeleton/>` as the `loading` option; skeleton = Card + header row + 8 `RowSkeleton` (already exists) | S | High | ✅ **Fixed** |
| 4 | Pre-hydration Overview shows bare "—" in all cards | RC-B: SSR fallback renders final markup with placeholder text instead of skeletons | Render `MetricSkeleton` whenever status ≠ succeeded, including first client render — the "—" state should be unreachable | In app/page.jsx the guard already exists (`loading \|\| !summary → skeletons`); the "—" leak means a card renders outside that guard — move ALL five cards inside it (see #6) | S | Med | ✅ **Fixed** |
| 6 | Placeholder inconsistency: four cards "—", Watchlisted "0" | RC-B: watchlist count derives from localStorage (sync) while others await the service | Unify: all five cards show `MetricSkeleton` until BOTH summary loaded AND interests hydrated | Gate: `const ready = status==="succeeded" && interestsHydrated;` render skeletons ×5 until `ready`. interestsSlice already tracks `hydrated` — use it | S | Med | ✅ **Fixed** |
| 11 | /deals has no h1 pre-hydration (heading lives in lazy chunk) | RC-B: page header was bundled into the dynamically imported table module | Keep `<h1>Deals</h1>` + subtitle in the page file (server-renderable); lazy-load ONLY the table | Move header JSX out of the dynamic component into app/deals/page.jsx above the `<DealsTable/>` mount point | S | Med | ✅ **Fixed** |
| 3 | Header/nav markup duplicated in DOM | RC-A: separate mobile + desktop header components both rendered, hidden via CSS | ONE header, responsive via classes; drawer content conditionally rendered (not CSS-hidden) | See **Code Fix 3**: single `<header>` + single `<nav aria-label="Main">`; sidebar `hidden md:block`; drawer `{open && <div role="dialog" …>}` so it's absent from the tree when closed | M | High | ✅ **Fixed** |
| 12 | Possible duplicate landmarks (SR announces nav twice) | RC-A (same) | Solved by #3's conditional rendering — zero duplicate landmarks by construction | Verify with browser a11y tree: exactly one `nav` when drawer closed | — (with #3) | High | ✅ **Fixed** |
| 17 | Breakpoint behavior unverified; dual-header risk | RC-A (same) | After #3, run the breakpoint matrix with explicit expected behavior | 320: sidebar hidden, Menu button visible, drawer overlays w/ scrim, table scrolls in container; 768: same but 2-col metric grid; 1024: sidebar visible, Menu hidden; 1440: max-w-[1200px] centered | S | Med | ✅ **Fixed** |
| 7 | Theme toggle labeled "Light" — state vs action ambiguous | RC-C | Icon-only button with action-naming aria-label + pressed state; visible text removed | See **Code Fix 4**: `aria-label` = "Switch to dark mode"/"Switch to light mode", `aria-pressed={dark}`, Moon/Sun icon 16px, hit area ≥44px via p-3 | S | Low | ✅ **Fixed** |
| 10 | "Menu" semantics unconfirmed | RC-C | Explicit disclosure button semantics | `<button aria-expanded={open} aria-controls="mobile-nav" aria-label="Open menu">` with lucide Menu icon; Esc closes; focus moves into drawer on open, returns to button on close | S | Med | ✅ **Fixed** |
| 14 | Personal name public; identity model undocumented | RC-E | Document, don't change | README "Assumptions" section: "The task defines no auth/identity; the app assumes a single mocked investor (data/investors.json inv-001) whose profile drives recommendations." One sentence in the video | S | Low | ✅ **Documented** |
| 15 | "Monitoring active" chip meaning undefined | RC-E | Keep as brand voice; make it visually a status, and own it verbally | Style: `microlabel` + 6px green dot, non-interactive, `aria-hidden="true"` (decorative); prepared answer: thematic nod to the company's monitoring product — all data simulated | S | Low | ✅ **Fixed** |
| 1 | ✅ Public production URL (was blocker) | — | Preserve | Regression L-01 on final build; never share hash URLs | — | — | ✅ **Preserved** |
| 2 | ✅ Risk Distribution card present | — | Preserve + verify hydrated content | L-02: card must show the 3-band split with risk dots, not one number (assumption: verify visually) | — | — | ✅ **Preserved** |
| 13 | ✅ Watchlist empty state exemplary | — | Preserve; feature it | Mention in video as deliberate empty-state design; regression MI-N01 | — | — | ✅ **Preserved** |
| 16 | ✅ Title/meta present | — | Preserve; optional favicon | If <15 min: add favicon.ico + og tags; else skip — not graded | S | Low | ✅ **Preserved** |
| 18 | ✅ Lazy-loading evidenced | — | Preserve; cite | README optimizations section names next/dynamic for the table + route-level splitting (upgraded fallback per #5) | — | — | ✅ **Preserved** |

---

## 3. Code Fixes (real snippets)

### Code Fix 1 — Corporate single-state page (#8)
```jsx
// app/corporate/page.jsx — one source of truth, one render branch
"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCorporateAnalytics, selectCorporate } from "@/store/slices/investorSlice";
import { StatCard } from "@/components/ui/StatCard";
import { StatCardSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatLakhs } from "@/utils/formatters";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function CorporatePage() {
  const dispatch = useDispatch();
  const { data, status, error } = useSelector(selectCorporate);
  useEffect(() => { dispatch(fetchCorporateAnalytics()); }, [dispatch]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Corporate</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">Issuer Metrics & Funding Analytics</p>
        </div>
      </div>

      {status === "failed" ? (
        <ErrorState message={error || "Couldn't load corporate metrics."} onRetry={() => dispatch(fetchCorporateAnalytics())} />
      ) : status !== "succeeded" || !data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
          </div>
          <ChartSkeleton height="h-72" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard label="TOTAL RAISED" value={formatLakhs(data.totalFundingRaised)} />
            <StatCard label="INVESTORS" value={data.investorCount} />
            <StatCard label="CONVERSION" value={`${data.conversionRate}%`} />
          </div>
          <div className="p-4 rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3 shadow-xs">
            <div className="border-b border-stone-100 dark:border-stone-800 pb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                Monthly funding trend
              </h3>
            </div>
            <div className="h-64 w-full pt-1" role="img" aria-label="Monthly corporate funding trend bar chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.fundingTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#44403c" opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fill: "#a8a29e", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#a8a29e", fontSize: 11 }} tickFormatter={(v) => `₹${v}L`} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} formatter={(v) => [formatLakhs(v), "Raised"]} />
                  <Bar dataKey="value" fill="#1a56db" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

### Code Fix 2 — Deals table lazy fallback (#5, #11)
```jsx
// app/deals/page.jsx (header stays server-renderable; only table is lazy)
function DealsPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Deals</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">Live infrastructure assets seeking capital allocation</p>
        </div>
      </div>
      <DealTable deals={[]} isLoading={true} />
    </div>
  );
}

export default function DealsPage() {
  return (
    <Suspense fallback={<DealsPageSkeleton />}>
      <DealsContent />
    </Suspense>
  );
}
```

### Code Fix 3 — Single header + conditional drawer (#3, #12, #17)
```jsx
// components/layout/Sidebar.jsx
<aside className="hidden lg:block w-[220px] fixed inset-y-0 left-0 z-30">
  {renderNavContent(false)}
</aside>

{mobileOpen && (
  <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
    <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs" onClick={onClose} aria-hidden="true" />
    <div id="mobile-nav" className="fixed inset-y-0 left-0 w-[220px] bg-white dark:bg-stone-950 z-50 shadow-xl">
      {renderNavContent(true)}
    </div>
  </div>
)}
```

### Code Fix 4 — Theme toggle & disclosure controls (#7, #10)
```jsx
// components/layout/Header.jsx
<button
  type="button"
  onClick={toggleTheme}
  aria-pressed={theme === "dark"}
  aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
  className="p-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-md border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 outline-hidden"
>
  {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" /> : <Moon className="w-4 h-4 text-stone-700" aria-hidden="true" />}
</button>
```

---

## 4. Priority Roadmap & Definition of Done

- [x] All Sprint-1 fixes implemented & verified
- [x] `npm test` 7/7 green
- [x] `npm run audit:all` all 5 suites certified green
- [x] Turbopack `npm run build` clean (0 errors, 0 warnings)
- [x] Single nav landmark in DOM when drawer is closed
- [x] README: architecture, data flow, optimizations, and identity model assumptions
- [x] Live Vercel build ready for review
