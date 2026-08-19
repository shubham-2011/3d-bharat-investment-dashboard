// store/StoreProvider.jsx
// Wrap the app in this inside app/layout.js:
//   <StoreProvider>{children}</StoreProvider>
"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { hydrateInterests } from "./slices/interestsSlice";

export default function StoreProvider({ children }) {
  useEffect(() => {
    // hydrate saved interests from localStorage once, client-side only
    store.dispatch(hydrateInterests());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
