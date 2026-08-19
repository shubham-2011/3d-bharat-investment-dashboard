// utils/formatters.js
// Pure display helpers — keep formatting out of components.

/** ₹ lakhs → readable: 2480 → "₹24.8 Cr", 150 → "₹1.5 Cr", 45 → "₹45 L" */
export function formatLakhs(lakhs) {
  if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(1).replace(/\.0$/, "")} Cr`;
  return `₹${lakhs} L`;
}

export function formatPercent(n) {
  return `${n}%`;
}

export const RISK_COLORS = {
  Low: "#22c55e",     // green
  Medium: "#f59e0b",  // amber
  High: "#ef4444",    // red
};

/** stable color per industry — SAME color in every chart */
export const INDUSTRY_COLORS = {
  Roads: "#3b82f6",
  Bridges: "#8b5cf6",
  Railway: "#f97316",
  Metro: "#06b6d4",
  Solar: "#eab308",
  "Smart City": "#ec4899",
};
