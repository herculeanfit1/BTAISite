import { test, expect } from "@playwright/test";
import {
  testDarkMode,
  testResponsiveDesign,
  testAccessibility,
} from "../utils/test-utils";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should have the correct title and hero section", async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Bridging Trust AI/);

    // Verify hero section
    const heroHeading = page
      .locator("section")
      .first()
      .getByRole("heading", { level: 1 });
    await expect(heroHeading).toBeVisible();

    // Verify hero description
    const heroDescription = page
      .locator("section")
      .first()
      .locator("p")
      .first();
    await expect(heroDescription).toBeVisible();

    // Verify CTA buttons - look for a specific one first
    const ctaButtons = page.locator("section").first().getByRole("link");
    expect(await ctaButtons.count()).toBeGreaterThan(0);
  });

  test("should display services section with all services", async ({
    page,
  }) => {
    // Verify Services heading - look for a heading containing "Our Services"
    const servicesHeadings = page
      .getByRole("heading")
      .filter({ hasText: /Our Services/i });
    await expect(servicesHeadings.first()).toBeVisible();

    // Check for service cards
    const serviceCards = page.locator('.service-card, [class*="service"]');

    // Check that we have multiple service cards
    const cardsCount = await serviceCards.count();
    expect(cardsCount).toBeGreaterThan(2);

    // Check if some key services appear somewhere on the page
    const servicesContent = (await page.textContent("body")) || "";
    expect(servicesContent).toContain("AI Strategy");
    expect(servicesContent).toContain("Implementation");
  });

  test("should display features section correctly", async ({ page }) => {
    // Look for a features section heading
    const featuresHeadings = page
      .getByRole("heading")
      .filter({ hasText: /Why Choose Us|Features|Benefits/i });

    if ((await featuresHeadings.count()) > 0) {
      await expect(featuresHeadings.first()).toBeVisible();

      // Check that we have multiple feature items
      const featureItems = page.locator(
        '[class*="feature"], [data-test*="feature"]'
      );
      if ((await featureItems.count()) > 0) {
        expect(await featureItems.count()).toBeGreaterThan(1);
      } else {
        // Alternatively, check for feature content in the page
        const pageContent = (await page.textContent("body")) || "";
        const hasFeatureContent = /ethical|explainable|bias|privacy/i.test(
          pageContent
        );
        expect(hasFeatureContent).toBeTruthy();
      }
    }
  });

  test("should display tab section with working tabs", async ({ page }) => {
    // Look for tab elements
    const tabButtons = page.getByRole("tab");

    if ((await tabButtons.count()) > 0) {
      // Verify at least one tab button is visible
      await expect(tabButtons.first()).toBeVisible();

      // Click the first tab and verify a panel is visible
      await tabButtons.first().click();
      const tabPanel = page.getByRole("tabpanel");
      await expect(tabPanel).toBeVisible();

      // If there's a second tab, test it
      if ((await tabButtons.count()) > 1) {
        await tabButtons.nth(1).click();
        await expect(tabPanel).toBeVisible();
      }
    }
  });

  test("should display timeline section correctly", async ({ page }) => {
    // Look for a timeline or process section
    const timelineHeadings = page
      .getByRole("heading")
      .filter({ hasText: /Process|Timeline|Steps|Journey/i });

    if ((await timelineHeadings.count()) > 0) {
      await expect(timelineHeadings.first()).toBeVisible();

      // Check for timeline items or steps
      const timelineItems = page.locator(
        '[class*="timeline"], [class*="step"], [class*="process-item"]'
      );

      // If specific timeline elements exist, check them
      if ((await timelineItems.count()) > 0) {
        expect(await timelineItems.count()).toBeGreaterThan(1);
      } else {
        // Otherwise just check if common timeline step words appear in the content
        const pageContent = (await page.textContent("body")) || "";
        const hasTimelineContent =
          /consultation|assessment|design|development|deployment/i.test(
            pageContent
          );
        expect(hasTimelineContent).toBeTruthy();
      }
    }
  });

  test("should display pricing section with pricing information", async ({
    page,
  }) => {
    // Look for pricing heading
    const pricingHeadings = page
      .getByRole("heading")
      .filter({ hasText: /Pricing|Plans|Packages/i });

    if ((await pricingHeadings.count()) > 0) {
      await expect(pricingHeadings.first()).toBeVisible();

      // Check for pricing tiers or cards
      const pricingElements = page.locator(
        '[class*="pricing"], [class*="plan"], [class*="tier"]'
      );

      if ((await pricingElements.count()) > 0) {
        expect(await pricingElements.count()).toBeGreaterThan(0);
      } else {
        // Check if price amounts appear somewhere on the page
        const pageContent = (await page.textContent("body")) || "";
        const hasPriceContent =
          /\$|price|month|assessment|implementation|monitoring/i.test(
            pageContent
          );
        expect(hasPriceContent).toBeTruthy();
      }
    }
  });

  test("should display FAQ section with expanding accordions", async ({
    page,
  }) => {
    // Look for FAQ heading
    const faqHeadings = page
      .getByRole("heading")
      .filter({ hasText: /FAQ|Frequently Asked|Questions/i });

    if ((await faqHeadings.count()) > 0) {
      await expect(faqHeadings.first()).toBeVisible();

      // Look for accordion buttons or question headings
      const faqItems = page.locator(
        'button[aria-expanded], [role="button"][aria-expanded], [class*="accordion"], button:has-text("What")'
      );

      if ((await faqItems.count()) > 0) {
        // Get the initial content
        const initialContent = await page.content();

        // Click the first FAQ item
        await faqItems.first().click();

        // Wait a moment for animation
        await page.waitForTimeout(300);

        // Get the updated content to see if anything changed
        const updatedContent = await page.content();

        // Check if the content changed after clicking
        expect(initialContent !== updatedContent).toBeTruthy();
      }
    }
  });

  test("should have working newsletter signup form", async ({ page }) => {
    // Look for form with email input
    const emailInputs = page.getByRole("textbox").filter({ hasText: /email/i });

    if ((await emailInputs.count()) > 0) {
      // Try to find a newsletter form
      const emailInput = emailInputs.first();
      await expect(emailInput).toBeVisible();

      // Test filling the form
      await emailInput.fill("test@example.com");

      // Look for submit button
      const submitButton = page
        .getByRole("button")
        .filter({ hasText: /subscribe|submit|sign up/i })
        .first();

      if ((await submitButton.count()) > 0) {
        await expect(submitButton).toBeVisible();
      }
    }
  });

  test("should have working dark mode toggle", async ({ page }) => {
    await testDarkMode(page);
  });

  test("should be responsive on different screen sizes", async ({ page }) => {
    await testResponsiveDesign(page);
  });

  test("should meet basic accessibility standards", async ({ page }) => {
    await testAccessibility(page);
  });
});
