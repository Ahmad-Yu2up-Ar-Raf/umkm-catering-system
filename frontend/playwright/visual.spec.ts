import { test, expect } from "@playwright/test";

// Visual regression scaffold: screenshots act as the token/design gate's
// human-checkable artifact. Wire `toHaveScreenshot()` baselines once the
// catalog + admin pages are content-complete (see docs/design.md §7 anti-patterns).
test("home page layout snapshot", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("body")).toBeVisible();
  await page.screenshot({ path: "test-results/home.png", fullPage: true });
});
