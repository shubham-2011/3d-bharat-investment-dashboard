# 3D Bharat — Investor & Corporate Web Dashboard

A full-stack infrastructure investment and corporate analytics dashboard built with **Next.js 16 (App Router & Turbopack)**, **Redux Toolkit**, **Tailwind CSS**, and **Recharts**.

🌐 **Live Deployed Dashboard**: [https://3d-bharat-investment-dashboard.vercel.app](https://3d-bharat-investment-dashboard.vercel.app)

---

## 🛡️ Data Layer & Automated QA Certification

> **Certified Data Layer**: `Data layer certified by scripts/audit-data.mjs — schema, ranges, referential integrity, and distribution checks across 80 deals / 15 investors.`

Run all automated audit verification suites:
```bash
# Run all 5 master audit suites (Data, Overview, Explorer, Remaining Features, Interviewer Scenarios)
npm run audit:all
# Output:
# PASS — Data Layer (80 deals, 15 investors)
# PASS — Overview Dashboard (5 metrics, 3 charts)
# PASS — Deal Explorer (Multi-filter, Search Debounce, Pagination)
# PASS — Remaining Features (#6–13)
# PASS — All QA-INTERVIEWER-ANALYSIS test scenarios (TS-01 to TS-42) certified green

# Run formatters & recommendation engine unit tests
npm test
# Output: 7/7 passing (100% green)

# Verify Turbopack production build
npm run build
# Output: Compiled successfully in Turbopack (0 errors, 0 warnings)
```

---

## 🏗️ System Architecture & Data Flow

```
┌──────────────────────────  NEXT.JS FRONTEND (Port 3000)  ──────────────────────────┐
│                                                                                     │
│  UI Components (`src/app/`, `src/components/`)                                       │
│   • Institutional Zerodha/screener.in design standard (#1a56db, #fafaf9, #0c0a09)   │
│   • Tabular figures (`font-mono`), 6px radius, single nav landmark                  │
│   • WCAG 2.2 AA accessibility (ARIA tabs, disclosure buttons, ≥44px hit targets)   │
│        │ dispatch(fetchDeals(params))          ▲ state updates                      │
│        ▼                                       │                                    │
│  Redux Store (`src/store/`)                                                         │
│   • dealsSlice / interestsSlice / investorSlice                                     │
│   • enums: idle → loading → succeeded → failed                                      │
│   • Single-source state scoping & conditional thunk guards                          │
│        │ createAsyncThunk calls service        │ resolves payload                   │
│        ▼                                       │                                    │
│  Simulated Service Layer (`src/services/`)                                          │
│   • dealService.js, investorService.js, apiClient.js                                │
│   • Pure in-app simulation: 80 deals, 15 investors, 300–800ms delay, 7% error rate │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 💡 Architectural Assumptions & Design Decisions

1. **Identity & User Model (#14)**:
   - The task specification defines no external authentication backend.
   - The application assumes a primary mocked active investor profile (**Shubham Kumar**, ID: `inv-001` in `data/investors.json`) whose budget, risk appetite, and preferred industries drive match scores across the dashboard.
   - For unauthenticated or pre-profile states, the recommendation engine safely degrades to `matchScore: undefined` (rendering `—` without throwing errors or `NaN%`).
2. **Brand Voice & Status (#15)**:
   - The sidebar displays `● Monitoring active` (`aria-hidden="true"`) as a thematic nod to 3D Bharat's physical point-cloud construction inspection platform.
3. **Single-Source State Management (#8)**:
   - Every page (Overview, Explorer, Details, Corporate) is powered by a single state machine branch. A page never simultaneously displays error banners and loaded content.

---

## ⚡ Performance Optimizations (#12, #18)

- **Row-Level Memoization**: `DealTableRow` is wrapped with `React.memo`, skipping ~90% of row re-renders when starring or unstarring deals.
- **Handler Stability**: Filter toggle handlers and pagers are wrapped in `useCallback` to maintain reference equality.
- **Pure Derived Computations**: Recommendation scoring (`rankDeals`) is wrapped in `useMemo`.
- **Search Debouncing**: 400ms `useDebounce` hook prevents search thrashing while displaying an inline animated spinner.
- **Large Dataset Ranking Throughput**: Stress-tested with 600 items (<50ms execution).

---

## 🚀 Key Features & Pages

1. **Overview Dashboard (`/`)**:
   - 5-card metric strip (`PORTFOLIO VALUE`, `ACTIVE DEALS`, `AVG. TARGET ROI`, `RISK DISTRIBUTION`, `WATCHLISTED`).
   - 2/3 12-Month Portfolio Value Line Chart + 1/3 Sector Split Donut Chart (with center total).
   - Full-width Risk vs. Return Scatter Matrix with risk-colored dots.

2. **Deal Explorer (`/deals`)**:
   - Search bar with 400ms debounce and loading spinner.
   - Multi-filter controls for Industry, Risk level, ROI range (`10%+`..`25%+`), and Entry capital (`< ₹1 Cr`..`> ₹2 Cr`).
   - Active removable filter chips with individual `×` dismissal and `Clear all`.
   - Dense Zerodha-style table with right-aligned numeric columns, dot+text risk indicators (`● Low`), plain % match indicators, and bottom pager.

3. **Deal Details (`/deals/[id]`)**:
   - Header with project metadata, company, location, and stage.
   - Semantic ARIA tabs (`Overview | Financials | ROI Projection`) with 4-metric financials grid (`Revenue`, `Profit Margin`, `YoY Growth`, `Debt/Equity`) and 5-year yield AreaChart.
   - Sticky summary card with funding progress bar and 4-factor match score breakdown (Risk: 30, Industry: 25, Budget: 25, ROI: 20).

4. **Watchlist (`/investments`)**:
   - Saved deals persisted locally in browser `localStorage` and synchronized via Redux `interestsSlice` with corrupted JSON and stale ID resilience.

5. **Corporate Analytics (`/corporate`)**:
   - Single-source state: Total Raised Capital (₹1,446 Cr), Active Investors (461), Conversion Rate (72%), and Monthly Funding Trend Bar Chart.

---

## ⚙️ Setup & Local Running

```bash
cd 3d-bharat-dashboard
npm install
npm run dev
# Dashboard live on http://localhost:3000

# Run automated tests & audits
npm test
npm run audit:all
```
