// store/slices/investorSlice.js
"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { investorService } from "@/services/investorService";

export const fetchCurrentInvestor = createAsyncThunk(
  "investor/fetchCurrent",
  async (_, { rejectWithValue }) => {
    try {
      return await investorService.getCurrentInvestor();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
  { condition: (_, { getState }) => !getState().investor.profile }
);

export const fetchCorporateAnalytics = createAsyncThunk(
  "investor/fetchCorporateAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      return await investorService.getCorporateAnalytics();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
  { condition: (_, { getState }) => !getState().investor.corporate }
);

const investorSlice = createSlice({
  name: "investor",
  initialState: {
    profile: null,
    profileStatus: "idle",
    corporate: null,
    corporateStatus: "idle",
    corporateError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentInvestor.pending, (s) => { s.profileStatus = "loading"; })
      .addCase(fetchCurrentInvestor.fulfilled, (s, { payload }) => {
        s.profileStatus = "succeeded";
        s.profile = payload;
      })
      .addCase(fetchCurrentInvestor.rejected, (s) => { s.profileStatus = "failed"; })
      .addCase(fetchCorporateAnalytics.pending, (s) => {
        s.corporateStatus = "loading";
        s.corporateError = null;
      })
      .addCase(fetchCorporateAnalytics.fulfilled, (s, { payload }) => {
        s.corporateStatus = "succeeded";
        s.corporate = payload;
      })
      .addCase(fetchCorporateAnalytics.rejected, (s, { payload }) => {
        s.corporateStatus = "failed";
        s.corporateError = payload ?? "Failed to load analytics";
      });
  },
});

export default investorSlice.reducer;

export const selectInvestorProfile = (s) => s.investor.profile;
export const selectCorporate = (s) => ({
  data: s.investor.corporate,
  status: s.investor.corporateStatus,
  error: s.investor.corporateError,
});
