import { test, expect } from "@playwright/test";
import {
  testDarkMode,
  testResponsiveDesign,
  testAccessibility,
  testVisualRegression,
} from "../utils/test-utils";

test.describe("Contact Page", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the contact page before each test
    await page.goto("/contact");
  });

  test("should have the correct title and hero section", async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Contact/);

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

  test("should display contact form with all required fields", async ({
    page,
  }) => {
    // Find contact form
    const contactForm = page.locator("form");
    await expect(contactForm).toBeVisible();

    // Check for name field
    const nameInput = contactForm
      .getByRole("textbox")
      .filter({ hasText: /name/i })
      .first();
    await expect(nameInput).toBeVisible();

    // Check for email field
    const emailInput = contactForm
      .getByRole("textbox")
      .filter({ hasText: /email/i })
      .first();
    await expect(emailInput).toBeVisible();

    // Check for message field
    const messageField = contactForm.locator("textarea");
    await expect(messageField).toBeVisible();

    // Check for submit button
    const submitButton = contactForm
      .getByRole("button")
      .filter({ hasText: /send|submit|contact/i });
    await expect(submitButton).toBeVisible();
  });

  test("should validate form inputs correctly", async ({ page }) => {
    const contactForm = page.locator("form");

    // Find form elements
    const emailInput = contactForm.locator('input[type="email"]');
    const submitButton = contactForm
      .getByRole("button")
      .filter({ hasText: /send|submit|contact/i });

    // Try submitting without filling required fields
    await submitButton.click();

    // Check if validation messages appear (either built-in or custom)
    const isFormSubmitted = await page.evaluate(() => {
      // Check if form was actually submitted
      const form = document.querySelector("form");
      return form ? form.checkValidity() : false;
    });

    // Form should not be valid/submitted without required fields
    expect(isFormSubmitted).toBeFalsy();

    // Test email validation
    if ((await emailInput.count()) > 0) {
      // Enter invalid email format
      await emailInput.fill("invalid-email");
      await emailInput.blur();

      // Check validation state
      const isEmailValid = await page.evaluate(() => {
        const emailInput = document.querySelector(
          'input[type="email"]'
        ) as HTMLInputElement | null;
        return emailInput ? emailInput.validity.valid : true;
      });

      expect(isEmailValid).toBeFalsy();

      // Enter valid email
      await emailInput.fill("test@example.com");
      await emailInput.blur();

      // Check that validation passes
      const isEmailValidNow = await page.evaluate(() => {
        const emailInput = document.querySelector(
          'input[type="email"]'
        ) as HTMLInputElement | null;
        return emailInput ? emailInput.validity.valid : false;
      });

      expect(isEmailValidNow).toBeTruthy();
    }
  });

  test("should show alternative contact methods", async ({ page }) => {
    // Check for contact information section (email, phone, address, etc.)
    const contactInfo = page.locator(
      '[class*="contact-info"], [class*="contact-details"]'
    );

    // If specific contact info section exists
    if ((await contactInfo.count()) > 0) {
      await expect(contactInfo).toBeVisible();

      // Should have some contact method visible
      const hasContactMethod = await page.evaluate(() => {
        const content = document.body.textContent || "";
        return /email|phone|call|address|location/i.test(content);
      });

      expect(hasContactMethod).toBeTruthy();
    } else {
      // Otherwise check that contact methods appear somewhere on the page
      const pageContent = (await page.textContent("body")) || "";
      const hasContactMethod = /email|phone|call|address|location/i.test(
        pageContent
      );
      expect(hasContactMethod).toBeTruthy();
    }
  });

  test("should display location or map if available", async ({ page }) => {
    // Check for a map or location section
    const mapElement = page.locator(
      '[class*="map"], iframe[src*="map"], [class*="location"]'
    );

    if ((await mapElement.count()) > 0) {
      await expect(mapElement).toBeVisible();
    }
  });

  test("should have social media links if available", async ({ page }) => {
    // Look for social media links
    const socialLinks = page.locator(
      'a[href*="linkedin"], a[href*="twitter"], a[href*="facebook"], a[href*="instagram"]'
    );

    if ((await socialLinks.count()) > 0) {
      // At least one social link should be visible
      await expect(socialLinks.first()).toBeVisible();
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

  test("should match visual baseline", async ({ page }) => {
    await testVisualRegression(page, "form", "contact-form", {
      threshold: 0.2,
      variants: [
        {
          name: "filled",
          setup: async () => {
            // Fill out the form for a variant
            const nameInput = page
              .locator('input[name="name"], input[placeholder*="name" i]')
              .first();
            const emailInput = page
              .locator('input[name="email"], input[type="email"]')
              .first();
            const messageInput = page.locator("textarea").first();

            if ((await nameInput.count()) > 0) {
              await nameInput.fill("John Doe");
            }

            if ((await emailInput.count()) > 0) {
              await emailInput.fill("test@example.com");
            }

            if ((await messageInput.count()) > 0) {
              await messageInput.fill(
                "This is a test message for visual testing."
              );
            }
          },
        },
      ],
    });
  });
});
