import { test, expect } from "@playwright/test";

/**
 * Smoke test to verify testing infrastructure
 * This test should be extremely fast and reliable
 */
test.describe("Smoke test", () => {
  test("Verify test environment is working", async ({ page }) => {
    // Simple test to verify page loading works
    await page.goto("/");

    // Simple check that the page loaded something
    await expect(page).toHaveTitle(/Bridging Trust/);

    // Log test environment information
    console.log("Test environment information:");
    console.log(`Browser: ${page.context().browser()?.version()}`);
    console.log(
      `Viewport: ${page.viewportSize()?.width}x${page.viewportSize()?.height}`
    );
    console.log(
      `User Agent: ${await page.evaluate(() => navigator.userAgent)}`
    );
  });

  test("API endpoints are accessible", async ({ request }) => {
    // Check status endpoint
    const response = await request.get("/api/status");
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe("online");
  });
});
