import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Bridging Trust AI/);
  });

  test("navigation works", async ({ page }) => {
    await page.goto("/");

    // Check that navigation links exist
    const navLinks = await page.locator("nav a");
    expect(await navLinks.count()).toBeGreaterThan(0);
  });
});
