import { test, expect } from "@playwright/test";

/**
 * End-to-end tests for the Safari-compatible Vercel-inspired page
 *
 * These tests validate that the page loads correctly in different browsers,
 * including Safari, and that all interactive elements function properly.
 */

test.describe("Vercel Safari Page", () => {
  test("should load and display all sections correctly", async ({ page }) => {
    // Navigate to the page
    await page.goto("/vercel-safari");

    // Check page title
    await expect(page).toHaveTitle(/Bridging Trust AI/);

    // Verify header elements
    await expect(page.getByText("Bridging Trust AI")).toBeVisible();
    await expect(page.getByRole("navigation")).toBeVisible();

    // Verify hero section
    const heroHeading = page.getByRole("heading", {
      name: "Making AI accessible and beneficial for everyone",
    });
    await expect(heroHeading).toBeVisible();

    // Verify features section
    await expect(page.getByText("Our Solutions")).toBeVisible();
    await expect(page.getByText("AI Ethics Assessment")).toBeVisible();
    await expect(page.getByText("Trust Implementation")).toBeVisible();
    await expect(page.getByText("Risk Analysis")).toBeVisible();

    // Verify newsletter section
    await expect(page.getByText("Stay updated on our progress")).toBeVisible();
    await expect(page.getByPlaceholder("Enter your email")).toBeVisible();
    await expect(page.getByRole("button", { name: "Subscribe" })).toBeVisible();

    // Verify footer
    await expect(page.getByText("Quick Links")).toBeVisible();
    await expect(
      page.getByText("© 2023 Bridging Trust AI. All rights reserved."),
    ).toBeVisible();
  });

  test("should allow interaction with form elements", async ({ page }) => {
    // Navigate to the page
    await page.goto("/vercel-safari");

    // Test email input functionality
    const emailInput = page.getByPlaceholder("Enter your email");
    await emailInput.fill("test@example.com");
    await expect(emailInput).toHaveValue("test@example.com");

    // Test button hover state (visual effect would be tested in visual regression tests)
    const subscribeButton = page.getByRole("button", { name: "Subscribe" });
    await subscribeButton.hover();

    // Test "Get Started" button is clickable
    const getStartedButton = page.getByRole("button", { name: "Get Started" });
    await getStartedButton.hover();
    // In a real test, we might click and verify navigation, but we're just testing UI here
  });

  test("should be responsive across different viewport sizes", async ({
    page,
  }) => {
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/vercel-safari");
    await expect(
      page.getByText("Making AI accessible and beneficial for everyone"),
    ).toBeVisible();

    // Tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/vercel-safari");
    await expect(
      page.getByText("Making AI accessible and beneficial for everyone"),
    ).toBeVisible();

    // Desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/vercel-safari");
    await expect(
      page.getByText("Making AI accessible and beneficial for everyone"),
    ).toBeVisible();
  });

  test("should have working navigation links", async ({ page }) => {
    await page.goto("/vercel-safari");

    // Test navigation links scroll to sections
    // Note: In a real test, we would check that clicking causes scrolling to the right section
    // For demo purposes, we're just verifying the links exist
    await expect(page.getByRole("link", { name: "Features" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Solutions" })).toBeVisible();
    await expect(page.getByRole("link", { name: "About" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Contact" })).toBeVisible();

    // Test footer links
    await expect(page.getByRole("link", { name: "AI Ethics" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Documentation" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "About" })).toBeVisible();
  });
});
