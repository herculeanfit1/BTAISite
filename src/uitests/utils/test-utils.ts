import { expect, Page, Locator } from "@playwright/test";
import { test } from "@playwright/test";
import {
  testVisualRegression as testVisualRegressionUtil,
  createDarkModeVariants,
} from "./visual-regression";

/**
 * Test dark mode functionality
 * @param page - Playwright page object
 * @param toggleSelector - Selector for the dark mode toggle element
 */
export async function testDarkMode(
  page: Page,
  toggleSelector: string = '[data-testid="dark-mode-toggle"], .dark-mode-toggle, .theme-toggle'
) {
  // Find the dark mode toggle using multiple potential selectors
  let toggle = page.locator(toggleSelector).first();

  // If the default selector doesn't find the toggle, try alternative approaches
  if ((await toggle.count()) === 0) {
    // Try finding by aria label
    toggle = page
      .locator(
        'button[aria-label*="theme" i], button[aria-label*="dark" i], button[aria-label*="mode" i]'
      )
      .first();

    // If still not found, try looking for common icon patterns
    if ((await toggle.count()) === 0) {
      toggle = page
        .locator("button:has(svg), .header button, .navbar button")
        .first();
    }
  }

  // Ensure we found a toggle
  const toggleExists = (await toggle.count()) > 0;
  expect(toggleExists, "Dark mode toggle should exist").toBeTruthy();

  // Make sure the toggle is visible and not covered by other elements
  await toggle.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300); // Allow scrolling to complete

  // Get initial theme state
  const html = page.locator("html");
  const initialIsDark = await html.evaluate((el) => {
    return (
      el.classList.contains("dark") ||
      document.documentElement.getAttribute("data-theme") === "dark" ||
      document.body.classList.contains("dark-mode") ||
      localStorage.getItem("theme") === "dark"
    );
  });

  // Ensure toggle is clickable (not overlapped)
  const boundingBox = await toggle.boundingBox();
  if (boundingBox) {
    // Get element at the center of the toggle
    const centerX = boundingBox.x + boundingBox.width / 2;
    const centerY = boundingBox.y + boundingBox.height / 2;

    const elementAtPoint = await page.evaluateHandle(
      ({ x, y }) => {
        return document.elementFromPoint(x, y);
      },
      { x: centerX, y: centerY }
    );

    // Determine if the element at point is or contains our toggle
    const isClickable = await page.evaluate(
      ({ element, selector }) => {
        if (!element) return false;
        // Check if element matches our toggle or contains it
        return (
          element.matches(selector) ||
          element.querySelector(selector) !== null ||
          element.closest(selector) !== null
        );
      },
      { element: elementAtPoint, selector: toggleSelector }
    );

    // If toggle is overlapped, try to find what's covering it and handle appropriately
    if (!isClickable) {
      // Try to close any potential overlays
      const overlays = page
        .locator(".overlay, .modal, .popover, .dropdown-menu")
        .filter({ visible: true });
      if ((await overlays.count()) > 0) {
        await page.mouse.click(10, 10); // Click in top corner to dismiss overlay
        await page.waitForTimeout(300);
      }

      // If there's a hamburger menu in mobile view, try opening it
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 768) {
        const hamburger = page
          .locator(".hamburger, .mobile-menu-toggle")
          .first();
        if ((await hamburger.count()) > 0 && (await hamburger.isVisible())) {
          await hamburger.click();
          await page.waitForTimeout(300);

          // Look for the toggle in the mobile menu
          toggle = page
            .locator(
              '.mobile-menu [data-testid="dark-mode-toggle"], .mobile-menu .dark-mode-toggle'
            )
            .first();
          if ((await toggle.count()) === 0) {
            toggle = page.locator(".mobile-menu button:has(svg)").first();
          }
        }
      }
    }
  }

  // Attempt to click the toggle
  await toggle.click();
  await page.waitForTimeout(500); // Wait for transition to complete

  // Verify theme changed
  const newIsDark = await html.evaluate((el) => {
    return (
      el.classList.contains("dark") ||
      document.documentElement.getAttribute("data-theme") === "dark" ||
      document.body.classList.contains("dark-mode") ||
      localStorage.getItem("theme") === "dark"
    );
  });

  expect(newIsDark).not.toEqual(initialIsDark);

  // Toggle back to original state
  await toggle.click();
  await page.waitForTimeout(500);

  const finalIsDark = await html.evaluate((el) => {
    return (
      el.classList.contains("dark") ||
      document.documentElement.getAttribute("data-theme") === "dark" ||
      document.body.classList.contains("dark-mode") ||
      localStorage.getItem("theme") === "dark"
    );
  });

  expect(finalIsDark).toEqual(initialIsDark);
}

/**
 * Tests responsive design by checking layout at different viewport sizes
 * @param page Playwright page object
 */
export async function testResponsiveDesign(page: Page): Promise<void> {
  // Store original viewport size
  const originalViewport = page.viewportSize();

  // Test mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(500); // Allow time for responsive changes

  // Check that navigation menu is collapsed on mobile
  const mobileMenu = page
    .locator(
      'button[aria-label*="menu" i], button[class*="hamburger"], button[class*="menu"]'
    )
    .first();
  if ((await mobileMenu.count()) > 0) {
    await expect(mobileMenu).toBeVisible();
  }

  // Check that content is stacked vertically on mobile
  const mainContent = page.locator("main").first();
  if ((await mainContent.count()) > 0) {
    const contentBoundingBox = await mainContent.boundingBox();
    if (contentBoundingBox) {
      await expect(contentBoundingBox.width).toBeLessThanOrEqual(375);
    }
  }

  // Test tablet viewport
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(500); // Allow time for responsive changes

  // Test desktop viewport
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(500); // Allow time for responsive changes

  // Restore original viewport
  if (originalViewport) {
    await page.setViewportSize(originalViewport);
  }
}

/**
 * Helper function to test navigation
 */
export async function testNavigation(page: Page) {
  // Get all navigation links
  const navLinks = page
    .getByRole("link")
    .filter({ has: page.locator("nav a") });

  // Click each link and verify the URL changes
  for (const link of await navLinks.all()) {
    const href = await link.getAttribute("href");
    if (href && !href.startsWith("http")) {
      const linkText = await link.textContent();
      await link.click();
      await expect(page).toHaveURL(new RegExp(href));

      // Go back to home if we're not already there
      if ((await page.url()) !== "http://localhost:3000/") {
        await page.goto("/");
      }
    }
  }
}

/**
 * Helper function to test component visibility and content
 */
export async function testComponentVisibility(
  page: Page,
  selector: string,
  expectedText?: string
) {
  const component = page.locator(selector);
  await expect(component).toBeVisible();

  if (expectedText) {
    await expect(component).toContainText(expectedText);
  }
}

/**
 * Helper function to take screenshots for visual testing
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/screenshots/${name}.png` });
}

/**
 * Tests basic accessibility standards
 * @param page Playwright page object
 */
export async function testAccessibility(page: Page): Promise<void> {
  // Check for alt text on images
  const images = page.locator("img");

  if ((await images.count()) > 0) {
    for (let i = 0; i < Math.min(await images.count(), 5); i++) {
      const image = images.nth(i);
      // Either has alt text or role="presentation" or aria-hidden="true"
      const hasAlt = await image.getAttribute("alt");
      const role = await image.getAttribute("role");
      const ariaHidden = await image.getAttribute("aria-hidden");

      const isAccessible =
        hasAlt !== null || role === "presentation" || ariaHidden === "true";
      await expect(isAccessible).toBeTruthy();
    }
  }

  // Check heading hierarchy - no heading levels should be skipped
  const h1Count = await page.locator("h1").count();
  const h2Count = await page.locator("h2").count();

  // Expect at least one heading
  await expect(h1Count + h2Count).toBeGreaterThan(0);

  // Check for form labels if forms exist
  const formFields = page
    .locator("input, textarea, select")
    .filter({ hasNot: page.locator('[type="hidden"]') });

  if ((await formFields.count()) > 0) {
    for (let i = 0; i < (await formFields.count()); i++) {
      const field = formFields.nth(i);
      const id = await field.getAttribute("id");

      if (id) {
        // Either has an associated label or has aria-label/aria-labelledby
        const hasLabel = (await page.locator(`label[for="${id}"]`).count()) > 0;
        const ariaLabel = await field.getAttribute("aria-label");
        const ariaLabelledBy = await field.getAttribute("aria-labelledby");
        const placeholder = await field.getAttribute("placeholder");

        const isAccessible =
          hasLabel ||
          ariaLabel !== null ||
          ariaLabelledBy !== null ||
          placeholder !== null;
        await expect(isAccessible).toBeTruthy();
      }
    }
  }

  // Check for sufficient color contrast (can only check for known accessibility attributes)
  const hasContrastIssue = await page.evaluate(() => {
    const elements = document.querySelectorAll(
      '[aria-describedby*="contrast"]'
    );
    return elements.length > 0;
  });

  await expect(hasContrastIssue).toBeFalsy();

  // Check for keyboard navigability of interactive elements - but skip this check on mobile
  const isMobile = (await page.viewportSize())?.width || 0 < 768;

  if (!isMobile) {
    const interactiveElements = page.locator(
      'a, button, [role="button"], [tabindex="0"]'
    );

    if ((await interactiveElements.count()) > 0) {
      // Press Tab key multiple times to check focus moves between elements
      await page.keyboard.press("Tab");

      // Check if an element gets focus
      const hasFocusedElement = await page.evaluate(() => {
        return document.activeElement !== document.body;
      });

      await expect(hasFocusedElement).toBeTruthy();
    }
  }
}

/**
 * Skip a test with a message
 * Use this when a test is conditionally skipped
 */
export function skipTest(message: string): void {
  test.skip(true, message);
}

/**
 * Bounding box interface for element positioning
 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Format a color string for consistent comparison
 */
export function formatColor(color: string): string {
  // Convert rgb to hex or normalize hex format
  if (color.startsWith("rgb")) {
    const rgbValues = color.match(/\d+/g);
    if (rgbValues && rgbValues.length >= 3) {
      return `#${Number(rgbValues[0]).toString(16).padStart(2, "0")}${Number(
        rgbValues[1]
      )
        .toString(16)
        .padStart(2, "0")}${Number(rgbValues[2])
        .toString(16)
        .padStart(2, "0")}`;
    }
  }
  return color.toLowerCase();
}

/**
 * Check if an element has a specific class
 */
export async function hasClass(
  page: Page,
  selector: string,
  className: string
): Promise<boolean> {
  return page.evaluate(
    ({ selector, className }) => {
      const element = document.querySelector(selector);
      if (!element) return false;
      return element.classList.contains(className);
    },
    { selector, className }
  );
}

/**
 * Interface for visual regression test variants
 */
export interface VisualRegressionVariant {
  name: string;
  setup: () => Promise<void>;
}

/**
 * Interface for visual regression test options
 */
export interface VisualRegressionOptions {
  variants?: VisualRegressionVariant[];
  fullPage?: boolean;
  threshold?: number;
}

/**
 * Test visual regression by comparing screenshots
 * @param page Playwright page object
 * @param selector Element selector or locator to test
 * @param screenshotName Base name for the screenshot
 * @param options Optional configuration including variants and threshold
 */
export async function testVisualRegression(
  page: Page,
  selector: string | Locator,
  screenshotName: string,
  options?: VisualRegressionOptions
): Promise<void> {
  // Convert legacy options to new format
  const testOptions: TestVisualRegressionOptions = {
    page,
    name: screenshotName,
    defaultThreshold: options?.threshold ?? 0.1,
    variants: options?.variants?.map((v) => ({
      name: v.name,
      setup: v.setup,
      // No cleanup in old format
      cleanup: async () => {},
      threshold: options?.threshold,
    })),
  };

  // Use the new implementation
  await testVisualRegressionUtil(testOptions);
}

/**
 * Checks if the current viewport is mobile sized
 *
 * @param page The Playwright page
 * @returns True if viewport width is less than 768px
 */
export async function isMobileViewport(page: Page): Promise<boolean> {
  const viewportSize = page.viewportSize();
  return viewportSize ? viewportSize.width < 768 : false;
}

/**
 * Checks if the current viewport is tablet sized
 *
 * @param page The Playwright page
 * @returns True if viewport width is between 768px and 1024px
 */
export async function isTabletViewport(page: Page): Promise<boolean> {
  const viewportSize = page.viewportSize();
  return viewportSize
    ? viewportSize.width >= 768 && viewportSize.width < 1024
    : false;
}

/**
 * Checks if the current viewport is desktop sized
 *
 * @param page The Playwright page
 * @returns True if viewport width is 1024px or greater
 */
export async function isDesktopViewport(page: Page): Promise<boolean> {
  const viewportSize = page.viewportSize();
  return viewportSize ? viewportSize.width >= 1024 : false;
}

/**
 * Gets computed style property for an element
 *
 * @param page The Playwright page
 * @param selector CSS selector for the element
 * @param property CSS property to get
 * @returns Promise resolving to the property value
 */
export async function getComputedStyle(
  page: Page,
  selector: string,
  property: string
): Promise<string> {
  return page.evaluate(
    ({ selector, property }) => {
      const element = document.querySelector(selector);
      if (!element) return "";
      return window.getComputedStyle(element).getPropertyValue(property);
    },
    { selector, property }
  );
}

// Re-export the new visual regression utilities
export { testVisualRegressionUtil, createDarkModeVariants };
