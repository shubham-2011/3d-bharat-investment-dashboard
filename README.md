# 3D Bharat — Investor & Corporate Web Dashboard

A full-stack infrastructure construction monitoring dashboard built with **Next.js 15 (App Router)**, **Redux Toolkit**, **Tailwind CSS**, and **Recharts**.

---

## 🛡️ Data Layer Certification

> **Certified Data Layer**: `Data layer certified by scripts/audit-data.mjs — schema, ranges, referential integrity, and distribution checks across 80 deals / 15 investors.`

Run automated audit verification:
```bash
npm run audit:data
# Output: PASS — data layer certified: 80 deals, 15 investors, all cases green
```

---

## 🏗️ System Architecture & Data Flow

```
┌──────────────────────────  NEXT.JS FRONTEND (Port 3000)  ──────────────────────────┐
│                                                                                     │
│  UI Components (`src/app/`, `src/components/`)                                       │
│   • Institutional Zerodha/screener.in design standard (#1a56db, #fafaf9)            │
│   • Tabular figures (`tnum`), zero AI emojis, clean density                         │
│        │ dispatch(fetchDeals(params))          ▲ state updates                      │
│        ▼                                       │                                    │
│  Redux Store (`src/store/`)                                                         │
│   • dealsSlice / interestsSlice / investorSlice                                     │
│   • enums: idle → loading → succeeded → failed                                      │
│        │ createAsyncThunk calls service        │ resolves payload                   │
│        ▼                                       │                                    │
│  Simulated Service Layer (`src/services/`)                                          │
│   • dealService.js, investorService.js                                              │
│   • In-memory dataset (80 deals, 15 investors) with 300–800ms simulated latency     │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features & Pages

1. **Overview Dashboard (`/`)**:
   - 4 thin metric strip cards with Bloomberg/Zerodha **Label ABOVE Value** formatting.
   - 2/3 12-Month Portfolio Value Line Chart + 1/3 Sector Split Pie Chart (with donut center total).
   - Full-width Risk vs. Return Scatter Matrix with risk-colored dots.

2. **Deal Explorer (`/deals`)**:
   - Search bar with 400ms `useDebounce` hook.
   - Single-row filter controls for Industry, Risk level, ROI range, and Entry capital range.
   - Dense Zerodha-style **Deal Table** (`DealTable.jsx`) with right-aligned numeric columns, dot+text risk indicators (`● Low`), plain % match indicators, and bottom pager.

3. **Deal Details (`/deals/[id]`)**:
   - Header with project metadata, company, location, and stage.
   - Plain tabs (`Overview | Financials | ROI Projection`) featuring 5-year yield area chart.
   - 1/3 sticky summary card with a thin 4px funding progress bar and AI match score breakdown.

4. **Watchlist (`/investments`)**:
   - Saved deals persisted locally in browser `localStorage` and synchronized via Redux `interestsSlice`.

5. **Corporate Analytics (`/corporate`)**:
   - Corporate issuer metrics: Total Raised Capital, Registered Investor Count, Target Conversion Rate (%), and Monthly Funding Trend Bar Chart.

---

## ⚙️ Setup & Running

```bash
cd 3d-bharat-dashboard
npm install
npm run dev
# Dashboard live on http://localhost:3000

# Run automated tests
npm test

# Run data layer audit certification
npm run audit:data
```
