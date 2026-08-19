// scripts/audit-deals-e2e.mjs
// Automated End-to-End Playwright test suite for Deal Explorer (/deals)

import { chromium } from "playwright";

async function runE2E() {
  console.log("🚀 Launching Playwright Chromium browser for Deal Explorer E2E testing...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  const results = [];
  const assert = (cond, id, msg) => {
    if (cond) {
      console.log(`✅ [${id}] PASS: ${msg}`);
      results.push({ id, status: "PASS", msg });
    } else {
      console.error(`❌ [${id}] FAIL: ${msg}`);
      results.push({ id, status: "FAIL", msg });
    }
  };

  try {
    // 1. Navigation & Initial Load
    console.log("\n--- Testing Navigation & Initial Load (DE-F07, DE-X02) ---");
    await page.goto("http://localhost:3000/deals", { waitUntil: "networkidle" });
    await page.waitForSelector("table", { timeout: 10000 });

    const headerText = await page.locator("h1").innerText();
    assert(headerText.includes("Deals"), "DE-U01", "Page header renders Deals title");

    // Check count text
    await page.waitForSelector("text=Showing 1–12 of 80 deals", { timeout: 5000 });
    const countText = await page.locator("text=Showing 1–12 of 80 deals").isVisible();
    assert(countText, "DE-F07", "Initial pagination text displays 'Showing 1–12 of 80 deals'");

    // 2. Debounced Search (DE-F01, DE-F02, DE-X01)
    console.log("\n--- Testing Debounced Search (DE-F01, DE-F02, DE-X01) ---");
    const searchInput = page.locator('input[placeholder*="Search by name"]');
    await searchInput.fill("Solar");
    await page.waitForTimeout(600); // allow 400ms debounce to settle
    await page.waitForSelector("table tbody tr", { timeout: 5000 });

    const activeChips = page.locator("text=Search: \"Solar\"");
    assert(await activeChips.isVisible(), "DE-F11", "Active search badge renders with remove button");

    const rows = await page.locator("table tbody tr").count();
    assert(rows > 0, "DE-F02", `Search 'Solar' returned ${rows} deals`);

    // 3. Clear Search & Filter Chips (DE-F11)
    console.log("\n--- Testing Clear All Filters (DE-F11) ---");
    await page.locator("button:has-text('Clear all')").click();
    await page.waitForTimeout(600);
    await page.waitForSelector("text=Showing 1–12 of 80 deals", { timeout: 5000 });
    assert(await page.locator("text=Showing 1–12 of 80 deals").isVisible(), "DE-F11", "Clear all restores full 80 deals");

    // 4. DE-T01: ROI & Investment Range Filters
    console.log("\n--- Testing ROI & Investment Range Filters (DE-T01) ---");
    // Select ROI 15%+
    const roiSelect = page.locator('select[aria-label="Filter by minimum ROI"]');
    await roiSelect.selectOption("15");
    await page.waitForTimeout(600);

    // Select Entry <₹1 Cr
    const entrySelect = page.locator('select[aria-label="Filter by investment entry range"]');
    await entrySelect.selectOption("lt1");
    await page.waitForTimeout(600);

    const activeRoiBadge = page.locator("text=ROI ≥ 15%");
    const activeEntryBadge = page.locator("text=Entry: < ₹1 Cr");
    assert(await activeRoiBadge.isVisible() && await activeEntryBadge.isVisible(), "DE-T01", "Both ROI ≥ 15% and Entry < ₹1 Cr active badges render");

    // Clear filters
    await page.locator("button:has-text('Clear all')").click();
    await page.waitForTimeout(600);

    // 5. Industry & Risk Filter Combinations (DE-F03, DE-F04)
    console.log("\n--- Testing Industry & Risk Filters (DE-F03, DE-F04) ---");
    await page.locator("button:has-text('Roads')").first().click();
    await page.locator("button:has-text('Metro')").first().click();
    await page.waitForTimeout(600);
    const roadsActive = page.locator("button:has-text('Roads')").first();
    assert((await roadsActive.getAttribute("aria-pressed")) === "true", "DE-U02", "Roads filter chip shows active aria-pressed state");

    // Clear filters
    await page.locator("button:has-text('Clear all')").click();
    await page.waitForTimeout(600);

    // 6. Pagination & Reset (DE-F05, DE-F07)
    console.log("\n--- Testing Pagination & Page Reset (DE-F05, DE-F07) ---");
    const nextBtn = page.locator('button[aria-label="Next page"]');
    await nextBtn.click();
    await page.waitForTimeout(600);
    await page.waitForSelector("text=Showing 13–24 of 80 deals", { timeout: 5000 });
    assert(await page.locator("text=Showing 13–24 of 80 deals").isVisible(), "DE-F07", "Page 2 displays 'Showing 13–24 of 80 deals'");

    // Toggle filter while on page 2 -> should reset to page 1
    await page.locator("button:has-text('Solar')").first().click();
    await page.waitForTimeout(600);
    const page1AfterFilter = await page.locator("text=1 /").isVisible();
    assert(page1AfterFilter, "DE-F05", "Applying filter on page 2 resets to page 1");

    await page.locator("button:has-text('Clear all')").click();
    await page.waitForTimeout(600);

    // 7. Watchlist Star & Row Click Navigation (DE-F08, DE-F09)
    console.log("\n--- Testing Star Button & Row Navigation (DE-F08, DE-F09) ---");
    const starBtn = page.locator("table tbody tr button[aria-label*='watchlist']").first();
    const initialStarPressed = await starBtn.getAttribute("aria-pressed");
    await starBtn.click();
    await page.waitForTimeout(300);

    // URL must NOT have changed (no navigation)
    assert(page.url().includes("/deals") && !page.url().includes("/deals/deal-"), "DE-F08", "Clicking star toggles watchlist without triggering row navigation");
    const newStarPressed = await starBtn.getAttribute("aria-pressed");
    assert(initialStarPressed !== newStarPressed, "DE-F08", "Star aria-pressed toggles state accurately");

    // Click row body (not star) -> should navigate to deal detail
    const firstRow = page.locator("table tbody tr").first();
    await firstRow.click();
    await page.waitForURL(/\/deals\/deal-/, { timeout: 5000 });
    assert(page.url().includes("/deals/deal-"), "DE-F09", "Clicking row body navigates to Deal Details screen");

    // Navigate back to /deals
    await page.goto("http://localhost:3000/deals", { waitUntil: "networkidle" });
    await page.waitForSelector("table", { timeout: 5000 });

    // 8. Empty Search State (DE-N01)
    console.log("\n--- Testing Empty Search State (DE-N01) ---");
    await searchInput.fill("zzzznonexistent");
    await page.waitForTimeout(600);
    const emptyHeading = page.locator("text=No deals match these filters");
    assert(await emptyHeading.isVisible(), "DE-N01", "In-card empty state renders with 'No deals match these filters'");

    await page.locator("button:has-text('Clear filters')").click();
    await page.waitForTimeout(600);
    assert(await page.locator("text=Showing 1–12 of 80 deals").isVisible(), "DE-N01", "Empty state 'Clear filters' button resets search");

    // 9. Accessibility Semantics & Touch Targets (DE-A01, DE-A02, DE-A03, DE-A05)
    console.log("\n--- Testing Accessibility Semantics (DE-A01-A05) ---");
    const tableEl = page.locator("table[aria-label='Deal Explorer Table']");
    assert(await tableEl.isVisible(), "DE-A03", "Table has aria-label='Deal Explorer Table'");

    const thCount = await page.locator("table thead th[scope='col']").count();
    assert(thCount >= 7, "DE-A03", "Table headers have scope='col'");

    // 10. Dark Mode Parity (DE-U07)
    console.log("\n--- Testing Dark Mode Parity (DE-U07) ---");
    const themeBtn = page.locator("button[title*='Switch to']");
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(300);
      const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
      assert(isDark, "DE-U07", "Dark mode toggles and applies .dark class to root document");
    }

    // 11. Responsive Viewport 320px (DE-R01)
    console.log("\n--- Testing Mobile Viewport 320px (DE-R01) ---");
    await page.setViewportSize({ width: 320, height: 568 });
    await page.waitForTimeout(300);
    const tableContainer = page.locator("div.overflow-x-auto");
    assert(await tableContainer.isVisible(), "DE-R01", "Table container maintains horizontal scroll capability on 320px mobile");

  } catch (err) {
    console.error("E2E Test Execution Error:", err);
    assert(false, "E2E-RUNNER", `Execution failed: ${err.message}`);
  } finally {
    await browser.close();
  }

  console.log("\n=============================================================");
  const failures = results.filter((r) => r.status === "FAIL");
  if (failures.length > 0) {
    console.error(`💥 E2E Test Suite Finished with ${failures.length} Failure(s).`);
    process.exit(1);
  } else {
    console.log(`🎉 E2E Test Suite Passed! All ${results.length} checks certified green.`);
  }
}

runE2E();
