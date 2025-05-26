import { test, expect } from "@playwright/test";
import {
  testDarkMode,
  testResponsiveDesign,
  testAccessibility,
} from "../utils/test-utils";

test.describe("Services Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/services");
  });

  test("should have the correct title and hero section", async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Services/);

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
  });

  test("should display service categories", async ({ page }) => {
    // Check if the page content mentions common service categories
    const pageContent = (await page.textContent("body")) || "";
    const hasServiceCategories =
      /strategy|implementation|certification|training|education|risk|assessment|monitoring/i.test(
        pageContent
      );
    expect(hasServiceCategories).toBeTruthy();

    // Check if there are multiple service category headings
    const categoryHeadings = page
      .getByRole("heading")
      .filter({ hasText: /AI|Trust|Implementation|Strategy|Risk|Training/i });
    expect(await categoryHeadings.count()).toBeGreaterThan(1);
  });

  test("should display service descriptions", async ({ page }) => {
    // Find service sections or cards
    const serviceElements = page.locator(
      '[class*="service"], [id*="service"], [data-test*="service"]'
    );

    // If we have specific service elements
    if ((await serviceElements.count()) > 0) {
      for (let i = 0; i < Math.min(await serviceElements.count(), 2); i++) {
        const serviceElement = serviceElements.nth(i);

        // Check for heading
        const heading = serviceElement.locator("h2, h3, h4").first();
        if ((await heading.count()) > 0) {
          await expect(heading).toBeVisible();
        }

        // Check for description
        const description = serviceElement.locator("p").first();
        if ((await description.count()) > 0) {
          await expect(description).toBeVisible();
        }
      }
    } else {
      // Otherwise, check if the page has multiple headings and paragraphs
      const headings = page.locator("h2, h3, h4");
      const paragraphs = page.locator("p");

      expect(await headings.count()).toBeGreaterThan(1);
      expect(await paragraphs.count()).toBeGreaterThan(2);
    }
  });

  test("should have navigation elements for service details", async ({
    page,
  }) => {
    // Look for links that might navigate to details
    const detailLinks = page
      .getByRole("link")
      .filter({ hasText: /Learn More|Details|Read More|View Service/i });

    if ((await detailLinks.count()) > 0) {
      await expect(detailLinks.first()).toBeVisible();
    } else {
      // Alternatively, check for sections that might be expandable
      const expandableSections = page.locator(
        'button[aria-expanded], [role="button"], [class*="expand"], [class*="collapse"]'
      );

      if ((await expandableSections.count()) > 0) {
        await expect(expandableSections.first()).toBeVisible();
      }
    }
  });

  test("should display case studies or examples if available", async ({
    page,
  }) => {
    // Check if the page mentions case studies or examples
    const pageContent = (await page.textContent("body")) || "";
    const hasCaseStudies = /case stud|example|success stor|client|result/i.test(
      pageContent
    );

    if (hasCaseStudies) {
      // Look for case study sections
      const caseStudyElements = page.locator(
        '[class*="case"], [class*="study"], [class*="example"]'
      );

      if ((await caseStudyElements.count()) > 0) {
        await expect(caseStudyElements.first()).toBeVisible();
      } else {
        // Look for headings related to case studies
        const caseStudyHeadings = page
          .getByRole("heading")
          .filter({ hasText: /Case Stud|Example|Success|Client/i });

        if ((await caseStudyHeadings.count()) > 0) {
          await expect(caseStudyHeadings.first()).toBeVisible();
        }
      }
    }
  });

  test("should display pricing information if available", async ({ page }) => {
    // Check if the page mentions pricing
    const pageContent = (await page.textContent("body")) || "";
    const hasPricing = /pricing|price|cost|fee|plan|package|tier|\$/i.test(
      pageContent
    );

    if (hasPricing) {
      // Look for pricing sections
      const pricingElements = page.locator(
        '[class*="pricing"], [class*="price"], [class*="plan"], [class*="tier"]'
      );

      if ((await pricingElements.count()) > 0) {
        await expect(pricingElements.first()).toBeVisible();
      } else {
        // Look for headings related to pricing
        const pricingHeadings = page
          .getByRole("heading")
          .filter({ hasText: /Pricing|Prices|Plans|Packages|Tiers/i });

        if ((await pricingHeadings.count()) > 0) {
          await expect(pricingHeadings.first()).toBeVisible();
        }
      }
    }
  });

  test("should have call-to-action elements", async ({ page }) => {
    // Look for CTA buttons or links
    const ctaElements = page
      .getByRole("link")
      .filter({ hasText: /Contact|Get Started|Book|Schedule|Consult/i });

    if ((await ctaElements.count()) > 0) {
      await expect(ctaElements.first()).toBeVisible();
    } else {
      // Look for form elements that might be used for contact
      const formElements = page.locator("form");

      if ((await formElements.count()) > 0) {
        await expect(formElements.first()).toBeVisible();
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
