// store/slices/dealsSlice.js
"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dealService } from "@/services/dealService";

/* ------------------------------- thunks ------------------------------- */

export const fetchDeals = createAsyncThunk(
  "deals/fetchDeals",
  async (params, { rejectWithValue }) => {
    try {
      return await dealService.getDeals(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchDealById = createAsyncThunk(
  "deals/fetchDealById",
  async (id, { getState, rejectWithValue }) => {
    // simple cache: skip the "network" if we already have this deal
    const cached = getState().deals.detailsCache[id];
    if (cached) return cached;
    try {
      return await dealService.getDealById(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchDashboardSummary = createAsyncThunk(
  "deals/fetchDashboardSummary",
  async (_, { rejectWithValue }) => {
    try {
      return await dealService.getDashboardSummary();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
  {
    // cache: don't refetch if summary already loaded
    condition: (_, { getState }) => !getState().deals.summary,
  }
);

/* ------------------------------- slice ------------------------------- */

const initialState = {
  // Deal Explorer list
  list: [],
  total: 0,
  page: 1,
  totalPages: 0,
  listStatus: "idle",   // idle | loading | succeeded | failed
  listError: null,

  // Deal Details
  currentDeal: null,
  detailsCache: {},     // id -> deal
  detailStatus: "idle",
  detailError: null,

  // Dashboard summary
  summary: null,
  summaryStatus: "idle",
  summaryError: null,
};

const dealsSlice = createSlice({
  name: "deals",
  initialState,
  reducers: {
    clearCurrentDeal(state) {
      state.currentDeal = null;
      state.detailStatus = "idle";
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // list
      .addCase(fetchDeals.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchDeals.fulfilled, (state, { payload }) => {
        state.listStatus = "succeeded";
        state.list = payload.data;
        state.total = payload.total;
        state.page = payload.page;
        state.totalPages = payload.totalPages;
      })
      .addCase(fetchDeals.rejected, (state, { payload }) => {
        state.listStatus = "failed";
        state.listError = payload ?? "Something went wrong";
      })
      // details
      .addCase(fetchDealById.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = null;
      })
      .addCase(fetchDealById.fulfilled, (state, { payload }) => {
        state.detailStatus = "succeeded";
        state.currentDeal = payload;
        state.detailsCache[payload.id] = payload;
      })
      .addCase(fetchDealById.rejected, (state, { payload }) => {
        state.detailStatus = "failed";
        state.detailError = payload ?? "Deal not found";
      })
      // summary
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.summaryStatus = "loading";
        state.summaryError = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, { payload }) => {
        state.summaryStatus = "succeeded";
        state.summary = payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, { payload }) => {
        state.summaryStatus = "failed";
        state.summaryError = payload ?? "Failed to load dashboard";
      });
  },
});

export const { clearCurrentDeal } = dealsSlice.actions;
export default dealsSlice.reducer;

/* ----------------------------- selectors ----------------------------- */
export const selectDealsList = (s) => s.deals.list;
export const selectDealsListState = (s) => ({
  status: s.deals.listStatus,
  error: s.deals.listError,
  total: s.deals.total,
  page: s.deals.page,
  totalPages: s.deals.totalPages,
});
export const selectDashboardSummary = (s) => ({
  summary: s.deals.summary,
  status: s.deals.summaryStatus,
  error: s.deals.summaryError,
});
