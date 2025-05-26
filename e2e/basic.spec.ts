import { test, expect } from "@playwright/test";

test.describe("Basic E2E test", () => {
  test("should load the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Bridging Trust AI/);
  });
});
