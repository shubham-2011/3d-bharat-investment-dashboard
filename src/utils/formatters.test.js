import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatLakhs, formatPercent } from "./formatters.js";

describe("Formatters Utility", () => {
  it("formats lakhs to Cr for values >= 100", () => {
    assert.equal(formatLakhs(2480), "₹24.8 Cr");
    assert.equal(formatLakhs(100), "₹1 Cr");
    assert.equal(formatLakhs(150), "₹1.5 Cr");
  });

  it("formats lakhs to L for values < 100", () => {
    assert.equal(formatLakhs(45), "₹45 L");
    assert.equal(formatLakhs(99), "₹99 L");
  });

  it("formats percentages correctly", () => {
    assert.equal(formatPercent(18.5), "18.5%");
  });
});
