// utils/formatters.js
// Pure display helpers — keep formatting out of components.

/** ₹ Crore → readable: 24.8 → "₹24.8 Cr", 0.45 → "₹45 L", 120 → "₹120 Cr" */
export function formatCr(cr) {
  if (cr == null || isNaN(cr)) return "₹0 Cr";
  if (cr < 1) return `₹${Math.round(cr * 100)} L`;
  return `₹${cr % 1 === 0 ? cr : Number(cr).toFixed(1)} Cr`;
}

export const formatLakhs = formatCr; // temporary alias so call sites keep working

export function formatPercent(n) {
  return `${n}%`;
}

export const RISK_COLORS = {
  Low: "#15803d",     // positive green
  Medium: "#b45309",  // warning amber
  High: "#b91c1c",    // negative red
};

/** Exact system colors per industry — zero purple/magenta */
export const INDUSTRY_COLORS = {
  Roads: "#1a56db",
  Metro: "#0e7490",
  Railway: "#b45309",
  Bridges: "#57534e",
  Solar: "#ca8a04",
  "Smart City": "#0f766e",
  Water: "#0369a1",
  Ports: "#7c2d12",
  Airports: "#4d7c0f",
};
