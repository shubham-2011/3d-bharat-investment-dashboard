// store/slices/interestsSlice.js
"use client";

import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "3db_interests";

// localStorage only exists in the browser; guard for Next.js SSR pass.
function loadFromStorage() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveToStorage(ids) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* storage full/blocked — interests just won't persist, app keeps working */
  }
}

const interestsSlice = createSlice({
  name: "interests",
  initialState: {
    dealIds: [],       // hydrated on client via hydrateInterests
    hydrated: false,
  },
  reducers: {
    hydrateInterests(state) {
      // dispatch once from a top-level useEffect to avoid SSR/client mismatch
      state.dealIds = loadFromStorage();
      state.hydrated = true;
    },
    toggleInterest(state, { payload: dealId }) {
      const i = state.dealIds.indexOf(dealId);
      if (i === -1) state.dealIds.push(dealId);
      else state.dealIds.splice(i, 1);
      saveToStorage(state.dealIds);
    },
    removeInterest(state, { payload: dealId }) {
      state.dealIds = state.dealIds.filter((id) => id !== dealId);
      saveToStorage(state.dealIds);
    },
  },
});

export const { hydrateInterests, toggleInterest, removeInterest } = interestsSlice.actions;
export default interestsSlice.reducer;

export const selectInterestIds = (s) => s.interests.dealIds;
export const selectIsInterested = (dealId) => (s) => s.interests.dealIds.includes(dealId);
