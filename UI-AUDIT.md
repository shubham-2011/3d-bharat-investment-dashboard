# UI-AUDIT.md — Screenshot Audit Findings & Fix Orders

Companion to AGENTS.md and TESTING.md. Place in repo root. These defects were found by visual audit of the running app (light + dark, all pages). Execute fixes in priority order. Do not restyle anything not listed here — the design system in AGENTS.md §5 remains law; several defects below are violations OF it, so the fix is always "return to the system," never "invent a new style."

---

## 🔴 P0 — Blocking (fix first, in order)

### D1. Dark mode does not theme the sidebar and topbar
- **Observed**: In dark mode, the content area goes dark but the sidebar and the topbar (search, theme toggle, user name) stay white. Every dark screenshot shows a white frame around dark content.
- **Cause**: AppShell surfaces have bg-white / border-stone-200 without dark: counterparts, or the shell renders outside the element receiving the `.dark` class.
- **Fix**: Sidebar and topbar containers must carry `bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800`, nav item text `text-stone-600 dark:text-stone-400`, logo text inherits. `.dark` class must be applied to `document.documentElement` so it wraps everything.
- **Verify**: Toggle dark → zero white surfaces anywhere; check hamburger drawer on mobile dark too.

### D2. Corporate page shows error AND loaded data simultaneously
- **Observed**: "Couldn't load corporate metrics" card with Retry sits above three fully-populated metric cards (Total raised, Investors, Conversion). Contradictory state.
- **Cause**: Two parallel fetches (metrics + funding trend); one failed; the error rendered page-scoped while the other's data rendered anyway.
- **Fix**: Single source: drive the whole page from `fetchCorporateAnalytics` only — one status, one error, all-or-nothing render.
- **Verify**: With `ERROR_RATE=0.9` temporarily, the page NEVER shows error text and data for the same resource at once. Restore `0.07` after.

---

## 🟠 P1 — Design-System Violations & UX Defects

### D3. Error card is off-system
- **Observed**: Large pink/red tinted panel, alert icon inside a colored circle, filled bright-red "Retry Request" button.
- **Fix**: Use the ErrorState primitive style: plain Card (standard border, no tint), one line of stone-600 text ("Couldn't load corporate metrics."), secondary bordered button labeled exactly "Retry" (not "Retry Request"). No icon circle. Red is reserved for financial negatives and small inline error text — never card backgrounds or filled buttons.

### D4. Purple/magenta leaked into the sector donut
- **Observed**: "Capital split by sector" uses purple and pink slices — violates the no-purple rule and visually dominates the page.
- **Fix**: Replace `INDUSTRY_COLORS` with:
  ```js
  Roads: "#1a56db", Metro: "#0e7490", Railway: "#b45309",
  Bridges: "#57534e", Solar: "#ca8a04", "Smart City": "#0f766e"
  ```
  Rules: accent blue in charts marks only the primary series (portfolio line); green/red never appear in the donut (they carry financial meaning only). Same color per sector across ALL charts.

### D5. First metric card breaks card anatomy
- **Observed**: "₹1018.9 Cr" wraps to two lines; card lacks the uppercase microlabel above the value (other three have it); caption truncates mid-word ("Active infrastructure portfo…").
- **Fix**: Same structure as siblings — microlabel "PORTFOLIO VALUE" above, value in one line (`whitespace-nowrap`, if too long use `formatLakhs` formatted nicely e.g., ₹1,019 Cr), caption shortened to fit or removed.

### D6. Duplicate search inputs on /deals
- **Observed**: Global topbar "Search deals…" AND page-level "Search by name, company…" — ambiguous which filters the table.
- **Fix**: Remove the topbar search input entirely (keep the topbar for theme toggle + user). The page-level search is the only search.

### D7. Match % pills are off-system + repeated word
- **Observed**: Filled green/amber pills reading "75% match" ×12 rows under a column already titled "Match %".
- **Fix**: Render plain right-aligned num text: `75%`. Optional: text color by band (≥70 green-700/emerald-400, 40–69 default ink, <40 stone-400). No background fills, no borders, no word "match" in cells.

### D8. Filter chips: no visible selected state + missing doc-required filters
- **Observed**: Industry/risk filter buttons look identical whether active or not; stray "|" divider; no ROI range or investment range filters (task doc requirement #5 explicitly lists them).
- **Fix**: Selected chip = `border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50`; unselected = stone border/text. Remove the "|". Add two compact selects: "ROI: Any / 10%+ / 15%+ / 20%+" and "Entry: Any / <₹1 Cr / ₹1–2 Cr / >₹2 Cr" wired to the service's `roiMin`/`investmentMax`/`investmentMin` params. Both reset page to 1.

### D9. Blue ROI column creates false link affordance
- **Observed**: Target ROI values render in accent blue; blue = interactive in this system.
- **Fix**: ROI values in `text-emerald-700 dark:text-emerald-400` or default ink. Accent blue in the table is allowed only for the active sort indicator or project name link.

---

## 🟡 P2 — Polish (execute after all P0/P1)

### D10. Terminology drift
- **Fix**: One word family everywhere: nav "Watchlist", subtitle "0 watchlisted deals", metric label "WATCHLISTED", column header "Watch" → star icon only (no header text needed). Remove "bookmarked opportunities" and "Saved deal opportunities".

### D11. Metric captions are filler
- **Fix**: "3D point cloud verified" under Active Deals conveys nothing. Either make captions informative or delete them — label+value alone is valid per the design system. Do not invent marketing captions.

### D12. Line chart axis crowding
- **Fix**: "₹0L" and "2025-01" collide bottom-left. Add chart bottom margin; format x-ticks "Jan"…"Dec" instead of "2025-01".

### D13. Donut center is empty
- **Fix**: Render the total in the center of the donut chart: value num 18px + microlabel "TOTAL" under it. Free hierarchy win.

### D14. Star icons near-invisible in dark table
- **Fix**: Raise idle contrast one step (`text-stone-500` in dark), filled state stays `fill-amber-400 text-amber-400`.

### D15. Empty watchlist page is bare
- **Fix**: Keep minimal, add one secondary line under the existing text: "Star any deal to track it here." Nothing else.

---

## 📦 Verification Checklist
- Re-screenshot / inspect: Overview + Deals in dark mode, Corporate page with ERROR_RATE 0.9 (then restore 0.07).
- `npm test` still passing (6 tests pass).
- `npm run build` clean (0 errors).
