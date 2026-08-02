import { test, expect } from "@playwright/test";

// Motion smoke: the app must load and respect prefers-reduced-motion.
// Full animation assertions (GSAP reveals, POS transitions) land here as
// components are built — extend per the motion-orchestration skill.
test("home page renders under reduced-motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
  expect(errors).toEqual([]);
});
