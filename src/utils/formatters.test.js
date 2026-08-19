import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatCr, formatLakhs, formatPercent } from "./formatters.js";

describe("Formatters Utility", () => {
  it("formats Cr to Cr for values >= 1", () => {
    assert.equal(formatCr(24.8), "₹24.8 Cr");
    assert.equal(formatCr(1), "₹1 Cr");
    assert.equal(formatCr(1.5), "₹1.5 Cr");
    assert.equal(formatLakhs(120), "₹120 Cr");
  });

  it("formats Cr < 1 to Lakhs", () => {
    assert.equal(formatCr(0.45), "₹45 L");
    assert.equal(formatCr(0.99), "₹99 L");
  });

  it("formats percentages correctly", () => {
    assert.equal(formatPercent(18.5), "18.5%");
  });
});
