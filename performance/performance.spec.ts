import { test, expect } from "@playwright/test";

test.describe("Performance tests", () => {
  test("home page loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    const loadTime = Date.now() - startTime;

    console.log(`Page load time: ${loadTime}ms`);

    // Page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
});
