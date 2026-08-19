# Backend Architecture — 3D Bharat Dashboard

> Important: this task forbids real backend APIs. The "backend" is a **simulated
> service layer** inside the Next.js app. This document explains that architecture
> (use it as the base for your README's "Architecture" section — rewrite in your
> own words before submitting).

---

## 1. Data Flow (the whole system on one diagram)

```
┌─────────────────────────────  BROWSER  ─────────────────────────────┐
│                                                                     │
│  UI Components (app/, components/)                                  │
│   • render only — zero business logic                               │
│   • read state via useSelector, trigger via dispatch                │
│        │ dispatch(fetchDeals(params))          ▲ state updates      │
│        ▼                                       │                    │
│  Redux Store (store/)                          │                    │
│   • dealsSlice / interestsSlice / investorSlice                     │
│   • tracks status: idle → loading → succeeded/failed                │
│   • caches (deal details, dashboard summary)                        │
│        │ createAsyncThunk calls service        │ resolves/rejects   │
│        ▼                                       │                    │
│  Service Layer (services/)  ←── the "backend"                       │
│   • dealService, investorService                                    │
│   • filter / sort / paginate / aggregate                            │
│   • apiClient: 300–800ms delay + ~7% simulated errors               │
│        │ reads                                                      │
│        ▼                                                            │
│  Data Layer (data/*.json)   ←── the "database"                      │
│   • 80 deals, 15 investors (static, infrastructure-themed)          │
│                                                                     │
│  Persistence: localStorage (saved interests only)                   │
└─────────────────────────────────────────────────────────────────────┘
```

**The rule that holds it together:** each layer only talks to the layer directly
below it. Components never import JSON or services directly — everything flows
through Redux thunks → services → data.

---

## 2. File Map (what's in this package)

| File | Role | Real-backend equivalent |
|------|------|------------------------|
| `data/deals.json` | 80 infrastructure deals | Database table `deals` |
| `data/investors.json` | 15 investor profiles | Database table `investors` |
| `services/apiClient.js` | Delay + error simulation | Network + HTTP layer |
| `services/dealService.js` | List/detail/summary "endpoints" | `GET /deals`, `/deals/:id`, `/deals/summary` |
| `services/investorService.js` | Profile + corporate analytics | `GET /investors/me`, `/corporate/analytics` |
| `store/store.js` + `StoreProvider.jsx` | Store config + app wrapper | — (client state) |
| `store/slices/dealsSlice.js` | Deals state, thunks, caching | — |
| `store/slices/interestsSlice.js` | Interests + localStorage persistence | `POST/DELETE /interests` |
| `store/slices/investorSlice.js` | Investor profile + corporate state | — |
| `hooks/useDebounce.js` | Debounced search input | — |
| `utils/scoring.js` | Recommendation engine (pure functions) | Recommendation microservice |
| `utils/formatters.js` | ₹ formatting + stable chart colors | — |

---

## 3. Key Design Decisions (explain these in your video/interview)

**Why a single `apiClient`?** All services share one delay/error wrapper, so the
whole app behaves like it talks to one consistent server. Changing latency or
error rate is a one-line edit.

**Why is `getDealById` non-failable?** Random errors are great on list pages
(user can retry) but terrible right after navigation — the details page would
randomly break the demo. Deliberate choice; mention it, it shows judgment.

**Why cache in thunks (`condition`) instead of components?** The component
just asks for data; whether a "network" trip is needed is the data layer's
decision. This is exactly how RTK Query thinks, hand-rolled.

**Why is scoring in `utils/`, not a service?** It's pure computation on data
already in the store — no async, no delay. Pure functions are trivially
testable and safe to run inside `useMemo` on every profile/filter change.

**Why hydrate localStorage via a dispatched action?** Next.js renders on the
server first, where `localStorage` doesn't exist. Reading it during initial
state creation causes hydration mismatch. One `useEffect` dispatch after mount
avoids the entire class of bugs.

**Status enums (`idle/loading/succeeded/failed`) instead of booleans:** with
`isLoading`+`isError` you can reach contradictory states. One enum = one truth.

---

## 4. How the UI consumes this (wiring examples)

```jsx
// app/layout.js
import StoreProvider from "@/store/StoreProvider";
export default function RootLayout({ children }) {
  return (
    <html lang="en"><body>
      <StoreProvider>{children}</StoreProvider>
    </body></html>
  );
}
```

```jsx
// Deal Explorer (simplified)
"use client";
const [search, setSearch] = useState("");
const debouncedSearch = useDebounce(search, 400);
const dispatch = useDispatch();
const { status, error, total } = useSelector(selectDealsListState);
const deals = useSelector(selectDealsList);

useEffect(() => {
  dispatch(fetchDeals({ search: debouncedSearch, filters, sort, page }));
}, [debouncedSearch, filters, sort, page, dispatch]);

// render: status === "loading" → skeletons; "failed" → <ErrorState retry/>;
// deals.length === 0 → <EmptyState/>; else deal cards
```

```jsx
// Recommendations (simplified)
const investor = useSelector(selectInvestorProfile);
const ranked = useMemo(() => rankDeals(deals, investor), [deals, investor]);
```

---

## 5. Future Reference — Real Node.js Backend (NOT for this task)

If this were a real product, the service layer maps 1:1 to an Express API:

```
Client (Next.js) ──HTTP──▶ Express Server
                            ├── routes/deals.js        GET /api/deals, /api/deals/:id
                            ├── routes/investors.js    GET /api/investors/me
                            ├── middleware/auth.js     JWT verification
                            ├── controllers/           (what services/ do now)
                            ├── models/                Mongoose/Prisma schemas
                            └── MongoDB / PostgreSQL   (what data/*.json is now)
```

The beauty of the current architecture: swapping to a real backend later means
rewriting **only** the service files to use `fetch()` — components, Redux, and
hooks don't change at all. That's the payoff of layering, and a great closing
line for your README.

---

## 6. Verified Behavior (tested)

- `getDeals({search:"metro", filters:{riskLevels:["Low","Medium"]}, sort:"roi-desc", page:1, pageSize:5})`
  → 11 matches, 5 returned, `hasMore: true`, ~750ms delay ✅
- `getDashboardSummary()` → totals, risk distribution, industry distribution, scatter data ✅
- Error simulation → ~7% of failable calls reject with a message ✅
