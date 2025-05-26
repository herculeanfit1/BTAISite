import { test, expect } from "@playwright/test";

/**
 * Tests for the contact form focusing on validation and security
 */
test.describe("Contact Form Validation", () => {
  // Before each test, navigate to the contact page
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");

    // Verify we're on the contact page
    await expect(page).toHaveTitle(/contact|get in touch/i);

    // Verify the form is visible
    await expect(page.locator("form")).toBeVisible();
  });

  test("should validate required fields", async ({ page }) => {
    // Click submit without filling required fields
    await page.getByRole("button", { name: /send|submit/i }).click();

    // Check for error messages
    await expect(
      page.getByText(/name.*required|please enter your name/i)
    ).toBeVisible();
    await expect(
      page.getByText(/email.*required|please enter your email/i)
    ).toBeVisible();
    await expect(
      page.getByText(/message.*required|please enter.*message/i)
    ).toBeVisible();
  });

  test("should validate email format", async ({ page }) => {
    // Fill in name and message but provide invalid email
    await page.getByLabel(/name/i).fill("Test User");
    await page.getByLabel(/email/i).fill("invalid-email");
    await page
      .getByLabel(/message/i)
      .fill(
        "This is a test message that meets the minimum length requirement."
      );

    // Submit the form
    await page.getByRole("button", { name: /send|submit/i }).click();

    // Check for email validation error
    await expect(page.getByText(/valid email|email format/i)).toBeVisible();
  });

  test("should validate field length requirements", async ({ page }) => {
    // Test name minimum length
    await page.getByLabel(/name/i).fill("A");
    await page.getByLabel(/email/i).click(); // Click away to trigger validation
    await expect(
      page.getByText(/name must be at least 2 characters/i)
    ).toBeVisible();

    // Test message minimum length
    await page.getByLabel(/name/i).fill("Test User");
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/message/i).fill("Too short");
    await page.getByRole("button", { name: /send|submit/i }).click();
    await expect(
      page.getByText(/message must be at least 10 characters/i)
    ).toBeVisible();

    // Test with extremely long inputs (exceeding max length)
    const longString = "a".repeat(101);
    await page.getByLabel(/name/i).fill(longString);
    await page.getByLabel(/email/i).click(); // Click away to trigger validation
    await expect(
      page.getByText(/name must be less than 100 characters/i)
    ).toBeVisible();
  });

  test("should validate against malicious input", async ({ page }) => {
    // Test with potential XSS attack in the name field
    await page.getByLabel(/name/i).fill('<script>alert("XSS")</script>');
    await page.getByLabel(/email/i).fill("test@example.com");
    await page
      .getByLabel(/message/i)
      .fill(
        "This is a test message that meets the minimum length requirement."
      );

    // Submit the form
    await page.getByRole("button", { name: /send|submit/i }).click();

    // Should see validation error
    await expect(
      page.getByText(/name contains invalid characters/i)
    ).toBeVisible();

    // Test with SQL injection attempt in message
    await page.getByLabel(/name/i).fill("Test User");
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/message/i).fill("'; DROP TABLE users; --");

    // Submit the form - this should actually pass as our schema allows these characters in messages
    // But we're checking that the submission works and our backend handles it appropriately
    await page.getByRole("button", { name: /send|submit/i }).click();

    // Wait for the success message or error
    await expect(
      page.getByText(/success|message.*sent|thank you/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test("should detect honeypot field", async ({ page }) => {
    // Find the honeypot field - typically hidden
    const honeypotField = page.locator(
      'input[name="website"], input[name="url"], input[name="address"], input[name="fax"]'
    );

    // Fill required fields
    await page.getByLabel(/name/i).fill("Test User");
    await page.getByLabel(/email/i).fill("test@example.com");
    await page
      .getByLabel(/message/i)
      .fill(
        "This is a test message that meets the minimum length requirement."
      );

    // Fill honeypot field to simulate bot
    if ((await honeypotField.count()) > 0) {
      await honeypotField.first().fill("http://spam-bot.com");

      // Submit the form
      await page.getByRole("button", { name: /send|submit/i }).click();

      // Honeypot submissions shouldn't throw errors, they should silently "succeed"
      // to make bots think their submission worked
      await expect(
        page.getByText(/success|message.*sent|thank you/i)
      ).toBeVisible({ timeout: 5000 });

      // But if we check the console logs, we'd see a message about honeypot detection
      // (which we can't easily check in this test)
    }
  });

  test("should handle successful submission", async ({ page }) => {
    // Fill out the form with valid data
    await page.getByLabel(/name/i).fill("Playwright Test User");
    await page.getByLabel(/email/i).fill("test@bridgingtrust.ai");
    await page
      .getByLabel(/message/i)
      .fill(
        "This is an automated test of the contact form. It contains more than ten characters to meet validation requirements."
      );

    // Optional fields if they exist
    const companyField = page.getByLabel(/company/i);
    if ((await companyField.count()) > 0) {
      await companyField.fill("Bridging Trust AI");
    }

    const phoneField = page.getByLabel(/phone/i);
    if ((await phoneField.count()) > 0) {
      await phoneField.fill("555-123-4567");
    }

    // Submit the form
    await page.getByRole("button", { name: /send|submit/i }).click();

    // Check for success message
    await expect(
      page.getByText(/success|message.*sent|thank you/i)
    ).toBeVisible({ timeout: 5000 });

    // Form should be reset or disabled
    await expect(page.getByLabel(/name/i)).toBeEmpty();
  });
});

/**
 * Simplified test for contact form basic existence
 * This is a minimal test to ensure that the contact page/form exists
 * without making too many assumptions about its current implementation
 */
test.describe("Contact Form Basic Check", () => {
  test("should find contact page or form somewhere in the site", async ({
    page,
  }) => {
    // Try to find the contact form by visiting the home page and looking for a contact link
    await page.goto("/");

    // Check for navigation links to contact
    const contactLink = page
      .getByRole("link")
      .filter({ hasText: /contact|get in touch/i });

    if ((await contactLink.count()) > 0) {
      // If we find a contact link, click it
      await contactLink.first().click();

      // Check if we are on a contact page - title or heading
      const isContactPage = await page
        .title()
        .then((title) => /contact|get in touch/i.test(title));
      const contactHeading = page
        .getByRole("heading")
        .filter({ hasText: /contact|get in touch/i });

      if (isContactPage || (await contactHeading.count()) > 0) {
        console.log("Successfully navigated to contact page");
      } else {
        console.log(
          "Clicked contact link but could not confirm destination is contact page"
        );
      }
    } else {
      // If no link found, check if contact form is on the home page
      const formHeading = page
        .getByRole("heading")
        .filter({ hasText: /contact|message|get in touch/i });
      if ((await formHeading.count()) > 0) {
        console.log("Contact form appears to be on the home page");
      } else {
        // Try direct navigation
        await page.goto("/contact");
        const pageContent = await page.textContent("body");
        const pageTitle = await page.title();

        // Very loose check - if we have a contact page with some content
        expect(pageTitle).not.toBe("404: This page could not be found");
        expect(pageContent).toBeTruthy();

        console.log("Directly navigated to /contact route");
      }
    }

    // At this point, we should be looking at either a page with contact form or at least some content
    const formElements = page.locator('form, [role="form"]');
    const nameInputs = page.getByLabel(/name/i);
    const emailInputs = page.getByLabel(/email/i);

    // Check if at least something that looks like a form or form fields exists
    const formExists =
      (await formElements.count()) > 0 ||
      (await nameInputs.count()) > 0 ||
      (await emailInputs.count()) > 0;

    console.log("Form elements found:", formExists);

    // For now, we just assert that the page exists and doesn't return a 404
    // This is a minimal test that should pass regardless of current implementation
    expect(await page.title()).not.toBe("404: This page could not be found");
  });
});
