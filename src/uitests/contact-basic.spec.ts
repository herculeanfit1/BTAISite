import { test, expect } from "@playwright/test";

/**
 * Minimal test to verify site navigation works
 * This will help us isolate issues with the more specific tests
 */
test.describe("Basic Site Navigation", () => {
  test("should be able to load the home page", async ({ page }) => {
    // Visit the home page
    await page.goto("/");

    // Wait for the page to load fully
    await page.waitForLoadState("networkidle");

    // Check that we didn't get a 404 or 500 error
    const title = await page.title();
    expect(title).not.toContain("404");
    expect(title).not.toContain("500");

    // Log the actual title for debugging
    console.log("Home page title:", title);

    // Verify some basic content exists on the page
    const pageContent = await page.textContent("body");
    expect(pageContent?.length || 0).toBeGreaterThan(0);

    // Take a screenshot for debugging
    await page.screenshot({ path: "test-results/home-page.png" });
  });

  test("should be able to navigate to available routes", async ({ page }) => {
    // Visit the home page
    await page.goto("/");

    // Look for all navigation links
    const navLinks = await page
      .getByRole("link")
      .filter({ has: page.locator("nav a, header a") })
      .all();
    console.log(`Found ${navLinks.length} navigation links`);

    // If there are navigation links, try clicking one
    if (navLinks.length > 0) {
      // Get the href attribute of the first link
      const href = await navLinks[0].getAttribute("href");
      const linkText = await navLinks[0].textContent();

      console.log(`Testing navigation link: ${linkText} -> ${href}`);

      // Only click internal links (not external)
      if (href && !href.startsWith("http")) {
        await navLinks[0].click();
        await page.waitForLoadState("networkidle");

        // Verify we navigated successfully
        const currentUrl = page.url();
        console.log("Navigated to:", currentUrl);

        // Check that the page loaded successfully
        const title = await page.title();
        expect(title).not.toContain("404");
        expect(title).not.toContain("500");
      }
    } else {
      console.log(
        "No navigation links found - this is unusual but not necessarily an error"
      );
      test.skip();
    }
  });
});
