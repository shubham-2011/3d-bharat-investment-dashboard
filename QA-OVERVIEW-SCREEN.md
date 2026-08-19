# QA-OVERVIEW-SCREEN.md — Test Suite: Overview Dashboard (/)

Author role: Senior UI/UX Designer & QA Analyst (WCAG 2.2 + functional QA). Screen under test: Overview (/) — personalized header, 4-card metric strip, 12-month portfolio line chart (2/3), sector donut (1/3), full-width risk-vs-return scatter, within AppShell (sidebar, topbar, theme toggle). Architecture invariant under test: components render only; data arrives via Redux thunks → services; no business logic in UI.

Legend: Priority = execution order importance. Severity = impact if failed.

---

## 1. FUNCTIONAL (ordered by priority)

| ID | Title | Category | Preconditions | Test Steps | Test Data | Expected Result | Priority | Severity |
|---|---|---|---|---|---|---|---|---|
| OV-F01 | Dashboard data loads via simulated service | Functional | App running; ERROR_RATE=0.07 | 1. Open / 2. Open DevTools Network 3. Observe render sequence | 80-deal dataset | Skeletons appear immediately; content replaces them after ~300–800ms; ZERO network requests to any API/localhost:5000; data via fetchDashboardSummary thunk | Critical | Blocker |
| OV-F02 | Metric values reconcile with dataset | Functional | Data loaded | 1. Note Invested, Active deals, Avg ROI 2. Independently compute from deals.json (Σ fundingRaised; count stage="In Progress"; mean roi) | deals.json | On-screen values exactly match computed values (formatting aside) | Critical | Critical |
| OV-F03 | Personalized title uses current investor | Functional | inv-001 exists | 1. Load / 2. Read H1 | investors.json | Title shows inv-001's first name ("<Name>'s portfolio"); falls back to "Overview" while profile loads — never "undefined's portfolio" | High | Major |
| OV-F04 | Watchlist metric syncs with interests | Functional | 0 starred | 1. Note Watchlisted=0 2. Go to /deals, star 2 deals 3. Return to / | 2 deal ids | Watchlisted shows 2 without page reload (Redux-driven) | High | Major |
| OV-F05 | Summary caching prevents refetch | Functional | Summary loaded once | 1. Navigate / → /deals → / 2. Observe delay on return | — | Second visit renders instantly (thunk condition skips "network"); no duplicate loading flash | Medium | Minor |
| OV-F06 | No business logic in component (code-level) | Functional | Repo access | 1. Open app/page.jsx 2. Search for .filter/.reduce/aggregation on raw deals | — | Aggregations (totals, distributions) computed in dealService.getDashboardSummary, not in the page; page only maps prepared arrays to charts | High | Major |
| OV-F07 | Theme toggle persists | Functional | Light mode | 1. Toggle dark 2. Hard refresh 3. Navigate all pages | — | Dark persists after refresh (localStorage); applies to every route | High | Major |

---

## 2. NEGATIVE / ERROR HANDLING

| ID | Title | Category | Preconditions | Test Steps | Test Data | Expected Result | Priority | Severity |
|---|---|---|---|---|---|---|---|---|
| OV-N01 | Summary fetch failure shows recoverable error | Negative | ERROR_RATE=0.9 (restore 0.07 after) | 1. Reload / repeatedly until failure 2. Inspect error UI 3. Click Retry until success | — | On-system ErrorState (plain card, "Retry" secondary button — NOT red filled panel); Retry refetches; success replaces error completely; no error+data shown together | Critical | Critical |
| OV-N02 | Profile fetch fails independently | Negative | Force investorService failure | 1. Load / with profile rejected, summary fulfilled | — | Metrics/charts render; title falls back to "Overview"; no crash; no NaN | High | Critical |
| OV-N03 | Empty dataset degrades gracefully | Negative | deals.json = [] (throwaway branch) | 1. Load / | [] | Metrics show 0 / ₹0; charts render empty axes or empty message; no crash, no NaN%, no division-by-zero (avgRoi guard) | High | Critical |
| OV-N04 | Slow simulated response keeps skeletons | Negative | Temporarily set delay 3000ms | 1. Reload / 2. Observe for 3s | — | Skeletons persist full duration without layout shift or flicker; no timeout crash | Medium | Major |
| OV-N05 | Rapid route thrash | Negative | — | 1. Quickly click Overview↔Deals 10× | — | No console errors, no duplicated fetch storm, no stale summary overwriting newer state | Medium | Major |

---

## 3. UI (visual consistency)

| ID | Title | Category | Preconditions | Test Steps | Test Data | Expected Result | Priority | Severity |
|---|---|---|---|---|---|---|---|---|
| OV-U01 | Dark mode themes the ENTIRE shell | UI | Dark on | 1. Toggle dark 2. Inspect sidebar, topbar, drawer | — | Sidebar+topbar bg stone-950 w/ stone-800 borders; zero white surfaces | Critical | Critical |
| OV-U02 | Metric card anatomy identical ×4 | UI | Data loaded | 1. Compare all 4 cards | — | Each: microlabel ABOVE mono value; value on ONE line (no "Cr" wrap); identical padding, radius 6px | High | Major |
| OV-U03 | All numerals are mono/tabular | UI | Data loaded | 1. Inspect metric values, axis ticks, donut legend counts | — | font-mono + tnum on every number incl. chart axes; digits align | High | Major |
| OV-U04 | Sector palette compliance | UI | Data loaded | 1. Inspect donut slice colors both modes | — | Only approved 6 sector colors; NO purple/magenta; same sector = same color as other charts | High | Major |
| OV-U05 | Chart readability in dark | UI | Dark on | 1. Hover line, donut, scatter tooltips 2. Read axes/gridlines | — | Tooltip bg dark w/ readable text; gridlines visible but subtle; scatter dots visible on stone-950 | High | Major |
| OV-U06 | Skeletons match final layout | UI | Throttled reload | 1. Reload, screenshot skeleton 2. Screenshot loaded 3. Overlay | — | Card/chart skeleton heights == final heights; zero cumulative layout shift on swap | Medium | Major |
| OV-U07 | Spacing rhythm | UI | — | 1. Measure gaps: strip→chart row→scatter; intra-grid gaps | — | Single rhythm (gap-3/12px); card padding identical; content max-width 1300 centered | Medium | Minor |
| OV-U08 | Axis label collision | UI | Data loaded | 1. Inspect line chart bottom-left | — | "₹0L" and first month tick don't overlap; months formatted Jan…Dec | Medium | Minor |
| OV-U09 | Accent discipline (squint test) | UI | — | 1. Zoom out page to thumbnail | — | Accent blue only: active nav, primary line series, links; not leaked into metrics/captions | Medium | Minor |

---

## 4. ACCESSIBILITY (WCAG 2.2)

| ID | Title | Category | Preconditions | Test Steps | Test Data | Expected Result | Priority | Severity |
|---|---|---|---|---|---|---|---|---|
| OV-A01 | Keyboard: full traversal | Accessibility | — | 1. From URL bar, Tab through page 2. Activate toggle+nav via Enter/Space | — | Order: logo→nav items→toggle→(content links); visible focus ring (2px accent) on EVERY stop; no trap; toggle operable by keyboard | Critical | Critical |
| OV-A02 | Theme toggle accessible name+state | Accessibility | SR or inspector | 1. Inspect button a11y tree | — | aria-label "Switch to light/dark mode"; icon-only button never unnamed | High | Major |
| OV-A03 | Text contrast ratios | Accessibility | Both modes | 1. Sample microlabels, values, captions with contrast checker | — | Body/values ≥4.5:1; 11px uppercase microlabels ≥4.5:1 | High | Major |
| OV-A04 | Charts have text alternative | Accessibility | SR | 1. SR reads chart region | — | Each chart wrapped with role="img"+aria-label summarizing data | Medium | Major |
| OV-A05 | Color not sole channel | Accessibility | — | 1. Grayscale the page (DevTools rendering) | — | Risk/sector distinctions retain text labels (legend text, dot+text pattern) | Medium | Major |
| OV-A06 | Touch target size | Accessibility | Mobile viewport | 1. Measure toggle, hamburger, nav rows | — | Interactive targets ≥44×44px effective (padding counts) | Medium | Major |
| OV-A07 | Reduced motion respected | Accessibility | OS "reduce motion" on | 1. Reload | — | Pulse/entrance/count-up animations disabled (prefers-reduced-motion block active) | Low | Minor |
| OV-A08 | Landmarks & heading order | Accessibility | Inspector | 1. Check landmarks 2. Heading outline | — | `<aside>` nav, `<header>`, `<main>` present; exactly one h1 | Low | Minor |

---

## 5. RESPONSIVE & EDGE CASES

| ID | Title | Category | Preconditions | Test Steps | Test Data | Expected Result | Priority | Severity |
|---|---|---|---|---|---|---|---|---|
| OV-R01 | 320px smallest supported | Responsive | DevTools 320×568 | 1. Load / 2. Scroll fully | — | No horizontal page scroll; metric cards stack/2-up without ₹ value overflow; charts shrink via ResponsiveContainer | Critical | Critical |
| OV-R02 | 768px tablet | Responsive | 768px | 1. Load / | — | Metric strip 2×2 or 4-up per breakpoint plan; chart row holds 2/3+1/3 | High | Major |
| OV-R03 | 1024px small laptop | Responsive | 1024px | 1. Load / | — | Full layout (sidebar + 2/3+1/3) engaged; no cramped tooltips | Medium | Minor |
| OV-R04 | 1440px+ wide | Responsive | 1440px & 1920px | 1. Load / | — | Content capped at max-width 1300, centered; charts don't stretch absurdly | Medium | Minor |
| OV-R05 | Drawer behavior on mobile | Responsive | ≤768px | 1. Open hamburger 2. Tap a route 3. Tap outside | — | Drawer slides in with scrim; closes on nav AND outside tap; dark-mode drawer surfaces correct | High | Major |
| OV-E02 | Hydration integrity | Edge Case | Prod build | 1. npm run build && start 2. Load / with console open | — | Zero hydration mismatch warnings | High | Critical |

---

## 6. Execution & Verification Script

Run `node scripts/audit-overview-data.mjs` to verify Overview dataset reconciliations and data assertions.
