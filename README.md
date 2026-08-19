# 3D Bharat — Investor & Corporate Web Dashboard

A full-stack infrastructure construction monitoring dashboard built with **Next.js 15 (App Router)**, **Redux Toolkit**, **Tailwind CSS**, **Recharts**, and an **Express 5 + MongoDB Backend API**.

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
│  Service Layer (`src/services/`)                                                    │
│   • dealService.js, investorService.js                                              │
│   • fetches REST API endpoints on http://localhost:5000/api                          │
│                                                                                     │
└───────────────────────────────────┬─────────────────────────────────────────────────┘
                                    │ HTTP REST API Calls
                                    ▼
┌──────────────────────────  EXPRESS BACKEND (Port 5000)  ───────────────────────────┐
│                                                                                     │
│  Express 5 REST API Server (`3d-bharat-server/server.js`)                            │
│   • Controllers: dealController, investorController, authController                 │
│   • REST Query Params: search, industry, riskLevel, roiMin, sort, page, pageSize    │
│   • JWT Authentication (`middleware/auth.js`)                                       │
│        │ Mongoose Queries (`.find()`, `.aggregate()`)                               │
│        ▼                                                                            │
│  Database Layer (MongoDB / Mongoose)                                                │
│   • Collections: `deals` (80 infrastructure deals), `investors` (15 profiles)      │
│   • DB Indexes: `industry`, `riskLevel`, `roi`, `projectName`                       │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features & Pages

1. **Overview Dashboard (`/`)**:
   - 4 thin metric strip cards with Bloomberg/Zerodha **Label ABOVE Value** formatting.
   - 2/3 12-Month Portfolio Value Line Chart + 1/3 Sector Split Pie Chart.
   - Full-width Risk vs. Return Scatter Matrix with risk-colored dots.

2. **Deal Explorer (`/deals`)**:
   - Search bar with 400ms `useDebounce` hook.
   - Single-row filter controls for Industry and Risk level.
   - Dense Zerodha-style **Deal Table** (`DealTable.jsx`) with right-aligned numeric columns, dot+text risk indicators (`● Low`), match score badges, and bottom-right pager.

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

### Frontend (Next.js)
```bash
cd 3d-bharat-dashboard
npm install
npm run dev
# Dashboard live on http://localhost:3000
```

### Backend (Express 5 + MongoDB)
```bash
cd 3d-bharat-server
npm install
npm run seed  # Seed 80 deals and 15 investors into MongoDB
npm start     # API server running on http://localhost:5000
```
