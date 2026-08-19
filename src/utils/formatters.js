// utils/formatters.js
// Pure display helpers — keep formatting out of components.

/** ₹ lakhs → readable: 2480 → "₹24.8 Cr", 150 → "₹1.5 Cr", 45 → "₹45 L" */
export function formatLakhs(lakhs) {
  if (lakhs == null) return "₹0 L";
  if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(1).replace(/\.0$/, "")} Cr`;
  return `₹${lakhs} L`;
}

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
};
