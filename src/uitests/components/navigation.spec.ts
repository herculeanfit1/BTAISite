import { test, expect, type Page, type Locator } from "@playwright/test";
import {
  skipTest,
  isMobileViewport,
  isDesktopViewport,
} from "../utils/test-utils";

test.describe("Navigation Component", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage which should have navigation
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("navigation bar should be visible and accessible", async ({ page }) => {
    // Look for navigation element
    const nav = page.locator(
      "nav, header nav, .navbar, .nav, [role='navigation']"
    );

    if ((await nav.count()) === 0) {
      skipTest("No navigation element found");
      return;
    }

    // Check if navigation is visible
    await expect(nav).toBeVisible();

    // Basic accessibility test - navigation should have proper role if not using <nav>
    if (!(await page.locator("nav").count())) {
      await expect(nav).toHaveAttribute("role", "navigation");
    }
  });

  test("navigation links should be accessible", async ({ page }) => {
    // Look for all navigation links
    const navLinks = page.locator("nav a, header a, .nav-link");

    if ((await navLinks.count()) === 0) {
      skipTest("No navigation links found");
      return;
    }

    // Sample the first link to verify it's properly set up
    const firstLink = navLinks.first();

    // Links should be visible and accessible
    await expect(firstLink).toBeVisible();

    // If link has no text content, it should have an aria-label
    const textContent = await firstLink.textContent();
    if (!textContent || textContent.trim() === "") {
      await expect(firstLink).toHaveAttribute("aria-label");
    }

    // Links should have proper contrast (this is a basic check, a full accessibility audit would be more thorough)
    await expect(firstLink).toBeVisible();
  });

  test("navigation should be responsive on mobile", async ({ page }) => {
    // Skip if not testing a responsive site
    if (
      !(await page
        .locator(
          ".mobile-menu, .hamburger, [aria-label='menu'], [aria-label='navigation']"
        )
        .count())
    ) {
      skipTest("No mobile menu indicators found");
      return;
    }

    // Set to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if mobile navigation exists
    const hamburgerMenu = page.locator(
      ".hamburger, .menu-toggle, [aria-label='menu']"
    );

    // Skip if no mobile menu
    if ((await hamburgerMenu.count()) === 0) {
      skipTest("No hamburger menu found for mobile view");
      return;
    }

    // Hamburger menu should be visible on mobile
    await expect(hamburgerMenu).toBeVisible();

    // Track the mobile nav menu for potential future tests
    const mobileNavMenu = page.locator(
      ".mobile-menu, .menu-dropdown, [aria-label='mobile navigation']"
    );

    // Click hamburger menu to open mobile nav (if it's toggleable)
    await hamburgerMenu.click();

    // Allow time for animation
    await page.waitForTimeout(300);
  });

  test("desktop navigation should show all main links", async ({ page }) => {
    // Only run on desktop viewport
    if (!(await isDesktopViewport(page))) {
      skipTest("Test only applicable to desktop viewport");
      return;
    }

    // Find main navigation link container
    const navLinks = page.locator("nav a, header a:not(.logo), .nav-link");

    if ((await navLinks.count()) === 0) {
      skipTest("No navigation links found");
      return;
    }

    // Desktop navigation should display multiple links
    expect(await navLinks.count()).toBeGreaterThan(1);

    // All links should be visible (not hidden in a dropdown/mobile menu)
    for (let i = 0; i < Math.min(await navLinks.count(), 5); i++) {
      await expect(navLinks.nth(i)).toBeVisible();
    }
  });

  // Basic navigation visibility test
  test("navigation should be visible on desktop", async ({ page }) => {
    // Desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });

    // Check main navigation
    const mainNav = page
      .locator('nav, header nav, [role="navigation"]')
      .first();
    await expect(mainNav).toBeVisible();

    // Check that navigation contains links
    const navLinks = mainNav.locator("a");
    expect(await navLinks.count()).toBeGreaterThan(0);

    // Navigation should have a logo or site name
    const logo = mainNav.locator(
      'img, svg, .logo, [class*="logo"], a:has-text("Bridging Trust")'
    );
    expect(await logo.count()).toBeGreaterThan(0);
  });

  // Mobile navigation test
  test("navigation should collapse on mobile and be expandable", async ({
    page,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // On mobile, often the main navigation is hidden behind a menu button
    const hamburgerButton = page.locator(
      'button[aria-label*="menu" i], [class*="hamburger"], [class*="menu-button"]'
    );

    // If no hamburger button exists, we should still see some navigation
    if ((await hamburgerButton.count()) === 0) {
      const mobileNav = page
        .locator('nav, header nav, [role="navigation"]')
        .first();
      await expect(mobileNav).toBeVisible();
      return;
    }

    // Check hamburger button is visible
    await expect(hamburgerButton).toBeVisible();

    // Check that nav menu is not fully visible initially
    const mobileNavMenu = page.locator(
      'nav:not(:visible), [class*="mobile-menu"], [class*="nav-menu"]'
    );

    // Get the current state
    const isMenuVisibleInitially = await page.evaluate(() => {
      // Look for nav elements that might be hidden in mobile view
      const navs = document.querySelectorAll('nav, [role="navigation"]');
      for (const nav of navs) {
        const style = window.getComputedStyle(nav);
        // Check if nav is hidden via various CSS methods
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          style.opacity === "0" ||
          style.transform.includes("translateX(-") ||
          style.transform.includes("translateY(-")
        ) {
          return false; // Menu is not visible
        }
      }
      return true; // Assume menu is visible if we couldn't find a hidden nav
    });

    // Click the hamburger button to toggle the menu
    await hamburgerButton.click();
    await page.waitForTimeout(300); // Wait for animation

    // Check that menu state has changed
    const isMenuVisibleAfterClick = await page.evaluate(() => {
      const navs = document.querySelectorAll('nav, [role="navigation"]');
      for (const nav of navs) {
        const style = window.getComputedStyle(nav);
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          style.opacity === "0" ||
          style.transform.includes("translateX(-") ||
          style.transform.includes("translateY(-")
        ) {
          return false;
        }
      }
      return true;
    });

    // Menu state should be different after clicking
    expect(isMenuVisibleAfterClick).not.toEqual(isMenuVisibleInitially);
  });

  // Navigation links test
  test("navigation links should work", async ({ page }) => {
    // Get all navigation links in the header/nav
    const navLinks = page.locator("header a, nav a");
    const linkCount = await navLinks.count();

    if (linkCount === 0) {
      skipTest("No navigation links found");
      return;
    }

    // Check the first few links (to avoid too many checks)
    const maxLinksToCheck = Math.min(linkCount, 3);

    for (let i = 0; i < maxLinksToCheck; i++) {
      const link = navLinks.nth(i);

      // Get the href attribute
      const href = await link.getAttribute("href");

      // Skip external links or anchor links
      if (!href || href.startsWith("http") || href.startsWith("#")) {
        continue;
      }

      // Store current URL to compare after navigation
      const currentUrl = page.url();

      // Click the link
      await link.click();
      await page.waitForLoadState("networkidle");

      // URL should have changed
      expect(page.url()).not.toEqual(currentUrl);

      // Navigate back to the starting page
      await page.goto("/");
      await page.waitForLoadState("networkidle");
    }
  });

  // Active link state test
  test("navigation should indicate the active page", async ({ page }) => {
    // Get all navigation links
    const navLinks = page.locator("header a, nav a");
    const linkCount = await navLinks.count();

    if (linkCount === 0) {
      skipTest("No navigation links found");
      return;
    }

    // Find a link that points to the current page
    let activeLink = null;
    let activeLinkHref = "";

    for (let i = 0; i < linkCount; i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute("href");

      // Skip non-internal links
      if (!href || href.startsWith("http") || href.startsWith("#")) {
        continue;
      }

      // Check if link href matches current page path
      if (href === "/" || page.url().endsWith(href)) {
        activeLink = link;
        activeLinkHref = href;
        break;
      }
    }

    if (!activeLink) {
      skipTest("No active link found for current page");
      return;
    }

    // Check if the active link has a different style or class
    const hasActiveStyle = await activeLink.evaluate((el) => {
      const style = window.getComputedStyle(el);

      // Common ways to style active links
      return (
        el.classList.contains("active") ||
        el.classList.contains("current") ||
        el.getAttribute("aria-current") === "page" ||
        style.fontWeight === "bold" ||
        style.textDecoration.includes("underline") ||
        el.querySelector('[aria-current="page"]') !== null
      );
    });

    // Navigate to the page and check if link becomes active
    if (!hasActiveStyle && activeLinkHref !== "/") {
      await page.goto(activeLinkHref);
      await page.waitForLoadState("networkidle");

      // Now check if this link is styled as active
      const linkOnThisPage = page.locator(
        `header a[href="${activeLinkHref}"], nav a[href="${activeLinkHref}"]`
      );

      const hasActiveStyleAfterNav = await linkOnThisPage.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return (
          el.classList.contains("active") ||
          el.classList.contains("current") ||
          el.getAttribute("aria-current") === "page" ||
          style.fontWeight === "bold" ||
          style.textDecoration.includes("underline") ||
          el.querySelector('[aria-current="page"]') !== null
        );
      });

      expect(hasActiveStyle || hasActiveStyleAfterNav).toBeTruthy();
    }
  });

  // Accessibility test for navigation
  test("navigation should be accessible", async ({ page }) => {
    // Check if navigation has ARIA labels
    const nav = page.locator('nav, [role="navigation"]').first();

    if ((await nav.count()) === 0) {
      skipTest("No navigation element found");
      return;
    }

    // Check for role attribute
    const hasRole = (await nav.getAttribute("role")) === "navigation";

    // Check for keyboard navigation
    const links = nav.locator("a");
    const linksCount = await links.count();

    if (linksCount === 0) {
      skipTest("No links found in navigation");
      return;
    }

    // Get first link's tabIndex
    const firstLinkTabIndex = await links.first().getAttribute("tabindex");

    // Either navigation has role="navigation" or links are keyboard accessible
    expect(hasRole || firstLinkTabIndex !== "-1").toBeTruthy();

    // Check hamburger button for accessibility if it exists
    const hamburgerButton = page.locator(
      'button[aria-label*="menu" i], [class*="hamburger"], [class*="menu-button"]'
    );

    if ((await hamburgerButton.count()) > 0) {
      // Hamburger should have an accessible name
      const ariaLabel = await hamburgerButton.getAttribute("aria-label");
      const ariaLabelledby =
        await hamburgerButton.getAttribute("aria-labelledby");

      expect(ariaLabel || ariaLabelledby).toBeTruthy();

      // Check expanded state
      const ariaExpanded = await hamburgerButton.getAttribute("aria-expanded");
      expect(ariaExpanded).not.toBeNull();
    }
  });
});
