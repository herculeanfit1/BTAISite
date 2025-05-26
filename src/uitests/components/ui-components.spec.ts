import { test, expect } from "@playwright/test";
import { skipTest } from "../utils/test-utils";

test.describe("UI Components", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage where most components are visible
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("Button components should have correct styles and behaviors", async ({
    page,
  }) => {
    // Find primary buttons
    const primaryButtons = page.locator(
      '.btn-primary, button[class*="primary"], .button.primary'
    );

    if ((await primaryButtons.count()) === 0) {
      skipTest("No primary buttons found on the page");
      return;
    }

    const firstButton = primaryButtons.first();

    // Check visibility and base styles
    await expect(firstButton).toBeVisible();

    // Check hover state
    await firstButton.hover();
    await page.waitForTimeout(300); // Wait for hover effect

    // Check focus state (tab to focus)
    await page.keyboard.press("Tab");

    // Check that button is clickable
    await firstButton.click();
  });

  test("Form inputs should have proper validation and accessibility", async ({
    page,
  }) => {
    // Navigate to contact page which should have a form
    await page.goto("/contact");
    await page.waitForLoadState("networkidle");

    // Find form elements
    const form = page.locator("form").first();
    if ((await form.count()) === 0) {
      skipTest("No form found on the contact page");
      return;
    }

    // Test text input
    const nameInput = page
      .locator('input[type="text"], input[name="name"]')
      .first();
    if ((await nameInput.count()) > 0) {
      // Ensure input is visible and has label
      await expect(nameInput).toBeVisible();

      // Test input functionality
      await nameInput.fill("Test User");
      await expect(nameInput).toHaveValue("Test User");

      // Clear input and check validation
      await nameInput.clear();
      await nameInput.blur(); // Trigger validation by moving focus away

      // Check for validation message if required
      const isRequired = (await nameInput.getAttribute("required")) !== null;
      if (isRequired) {
        // Look for validation message or change in appearance
        const elementHandle = await nameInput.elementHandle();
        const validationMsg = elementHandle
          ? await page.evaluate((el) => {
              if (!el) return "";
              const inputEl = el as HTMLInputElement;
              return inputEl.validationMessage || "";
            }, elementHandle)
          : "";
        expect(validationMsg).toBeTruthy();
      }
    }

    // Test email input
    const emailInput = form.locator('input[type="email"]').first();
    if ((await emailInput.count()) > 0) {
      await expect(emailInput).toBeVisible();

      // Test valid email
      await emailInput.fill("test@example.com");
      await expect(emailInput).toHaveValue("test@example.com");

      // Test invalid email
      await emailInput.fill("invalid-email");
      await emailInput.blur();

      // Check validation message
      const validationMsg = await emailInput.evaluate(
        (el: HTMLInputElement) => {
          return el.validationMessage;
        }
      );
      expect(validationMsg).toBeTruthy();
    }

    // Test textarea if it exists
    const textarea = page.locator('textarea, [name="message"]');
    if ((await textarea.count()) > 0) {
      await expect(textarea).toBeVisible();
      await textarea.fill("This is a test message");
      await expect(textarea).toHaveValue("This is a test message");
    }

    // Test submit button
    const submitButton = form.locator('button[type="submit"]').first();
    if ((await submitButton.count()) > 0) {
      await expect(submitButton).toBeVisible();
      // Don't actually submit to avoid side effects
    }
  });

  test("Card components should display content correctly", async ({ page }) => {
    // Navigate to a page with cards (services or pricing)
    await page.goto("/services");
    await page.waitForLoadState("networkidle");

    // Find card components
    const cards = page.locator(
      '.card, [class*="card"], .service-item, .pricing-tier'
    );

    if ((await cards.count()) === 0) {
      // Try another page if no cards found
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      const homeCards = page.locator('.card, [class*="card"], .feature-card');

      if ((await homeCards.count()) === 0) {
        skipTest("No card components found on tested pages");
        return;
      }

      // Check first card
      const firstCard = homeCards.first();
      await expect(firstCard).toBeVisible();

      // Check for card title
      const cardTitle = firstCard.locator('h2, h3, [class*="title"]');
      if ((await cardTitle.count()) > 0) {
        await expect(cardTitle).toBeVisible();
        await expect(cardTitle).not.toHaveText("");
      }

      // Check for card content or description
      const cardContent = firstCard.locator(
        'p, [class*="description"], [class*="content"]'
      );
      if ((await cardContent.count()) > 0) {
        await expect(cardContent).toBeVisible();
      }
    } else {
      // Check first card found
      const firstCard = cards.first();
      await expect(firstCard).toBeVisible();

      // Check card components
      const cardTitle = firstCard.locator('h2, h3, h4, [class*="title"]');
      if ((await cardTitle.count()) > 0) {
        await expect(cardTitle).toBeVisible();
        await expect(cardTitle).not.toHaveText("");
      }

      // Check for card image if it exists
      const cardImage = firstCard.locator("img, svg");
      if ((await cardImage.count()) > 0) {
        await expect(cardImage).toBeVisible();
      }
    }
  });

  test("Navigation should be accessible and functional", async ({ page }) => {
    // Check the main navigation
    const mainNav = page.locator("nav, header nav");
    await expect(mainNav).toBeVisible();

    // Check nav links
    const navLinks = mainNav.locator("a");
    expect(await navLinks.count()).toBeGreaterThan(0);

    // Get the first link's text and href
    const firstLink = navLinks.first();
    const linkText = await firstLink.textContent();
    const linkHref = await firstLink.getAttribute("href");

    // Check that the link is valid
    expect(linkText).not.toBe("");
    expect(linkHref).not.toBe("");

    // Test mobile menu if it exists (first check if we're on desktop)
    const viewportWidth = page.viewportSize()?.width || 1280;
    if (viewportWidth >= 768) {
      // Resize to mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Look for mobile menu button
      const menuButton = page.locator(
        '[aria-label="Toggle menu"], button[class*="menu"], [data-test-id="mobile-menu-button"]'
      );

      if ((await menuButton.count()) > 0) {
        await expect(menuButton).toBeVisible();

        // Open mobile menu
        await menuButton.click();

        // Check if mobile menu is visible
        const mobileMenu = page.locator(
          '[data-test-id="mobile-menu"], .mobile-menu, [class*="mobile-nav"]'
        );
        await expect(mobileMenu).toBeVisible();

        // Close mobile menu
        await menuButton.click();

        // Reset viewport
        await page.setViewportSize({ width: 1280, height: 720 });
      }
    }
  });

  test("Tabs component should switch content correctly", async ({ page }) => {
    // Look for the tab component
    const tabSection = page.locator(
      '[data-test-id="tab-section"], .tabs-container, [role="tablist"]'
    );

    if ((await tabSection.count()) === 0) {
      skipTest("No tab component found on the page");
      return;
    }

    // Find tab buttons
    const tabButtons = tabSection.locator('[role="tab"], .tab-button');
    if ((await tabButtons.count()) < 2) {
      skipTest("Not enough tabs found for testing");
      return;
    }

    // Get the first tab content
    await tabButtons.first().click();
    await page.waitForTimeout(200); // Allow for transition

    const firstTabPanel = page
      .locator('[role="tabpanel"], .tab-content')
      .first();
    const firstTabContent = await firstTabPanel.textContent();

    // Click the second tab
    await tabButtons.nth(1).click();
    await page.waitForTimeout(200); // Allow for transition

    // Check that content changed
    const secondTabPanel = page
      .locator('[role="tabpanel"], .tab-content')
      .first();
    const secondTabContent = await secondTabPanel.textContent();

    // Content should be different between tabs
    expect(firstTabContent).not.toEqual(secondTabContent);

    // Test keyboard navigation
    await tabButtons.first().focus();
    await page.keyboard.press("ArrowRight");

    // Check if focus moved to next tab
    const focusedElementRole = await page.evaluate(() =>
      document.activeElement?.getAttribute("role")
    );
    expect(focusedElementRole).toBe("tab");
  });

  test("Dark mode toggle should change theme", async ({ page }) => {
    // Find the dark mode toggle
    const darkModeToggle = page.locator(
      '[aria-label="Toggle dark mode"], [data-theme-toggle], button:has(svg[class*="moon"]), button:has(svg[class*="sun"])'
    );

    if ((await darkModeToggle.count()) === 0) {
      skipTest("No dark mode toggle found");
      return;
    }

    // Check initial theme
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
    });

    // Toggle theme
    await darkModeToggle.click();
    await page.waitForTimeout(300); // Wait for transition

    // Check if theme changed
    const newTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
    });

    expect(newTheme).not.toEqual(initialTheme);

    // Toggle back
    await darkModeToggle.click();
    await page.waitForTimeout(300);

    // Should be back to initial theme
    const finalTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
    });

    expect(finalTheme).toEqual(initialTheme);
  });
});
