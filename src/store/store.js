// store/store.js
"use client";

import { configureStore } from "@reduxjs/toolkit";
import dealsReducer from "./slices/dealsSlice";
import interestsReducer from "./slices/interestsSlice";
import investorReducer from "./slices/investorSlice";

export const store = configureStore({
  reducer: {
    deals: dealsReducer,
    interests: interestsReducer,
    investor: investorReducer,
  },
});
