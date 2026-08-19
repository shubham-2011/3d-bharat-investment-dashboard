// hooks/useDebounce.js
"use client";

import { useEffect, useState } from "react";

/**
 * Returns `value` only after it has stopped changing for `delay` ms.
 * Usage in Deal Explorer:
 *   const [search, setSearch] = useState("");
 *   const debouncedSearch = useDebounce(search, 400);
 *   useEffect(() => { dispatch(fetchDeals({ search: debouncedSearch })); }, [debouncedSearch]);
 */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // reset the clock on every keystroke
  }, [value, delay]);

  return debounced;
}
