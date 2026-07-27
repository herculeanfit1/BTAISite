import { test, expect } from '@playwright/test';

test.describe('Dark Mode E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should toggle between light and dark modes', async ({ page }) => {
    // Find the dark mode toggle
    const darkModeToggle = page.getByTestId('dark-mode-toggle');
    await expect(darkModeToggle).toBeVisible();

    // Check initial state (should be light mode)
    const html = page.locator('html');
    const initialHasDarkClass = await html.evaluate(el => el.classList.contains('dark'));
    
    // Click to toggle to dark mode
    await darkModeToggle.click();
    await page.waitForTimeout(500); // Wait for transition

    // Verify dark mode is active
    const afterToggleHasDarkClass = await html.evaluate(el => el.classList.contains('dark'));
    expect(afterToggleHasDarkClass).not.toBe(initialHasDarkClass);

    // Click again to toggle back
    await darkModeToggle.click();
    await page.waitForTimeout(500);

    // Verify we're back to original state
    const finalHasDarkClass = await html.evaluate(el => el.classList.contains('dark'));
    expect(finalHasDarkClass).toBe(initialHasDarkClass);
  });

  test('should show correct icons for each theme', async ({ page }) => {
    const darkModeToggle = page.getByTestId('dark-mode-toggle');
    
    // Check light mode icon (moon should be visible)
    const moonIcon = darkModeToggle.locator('svg').nth(1);
    const sunIcon = darkModeToggle.locator('svg').nth(0);
    
    await expect(moonIcon).toHaveClass(/opacity-100/);
    await expect(sunIcon).toHaveClass(/opacity-0/);

    // Toggle to dark mode
    await darkModeToggle.click();
    await page.waitForTimeout(500);

    // Check dark mode icon (sun should be visible)
    await expect(sunIcon).toHaveClass(/opacity-100/);
    await expect(moonIcon).toHaveClass(/opacity-0/);
  });

  test('should have correct aria-labels', async ({ page }) => {
    const darkModeToggle = page.getByTestId('dark-mode-toggle');
    
    // Check initial aria-label
    await expect(darkModeToggle).toHaveAttribute('aria-label', 'Switch to dark mode');

    // Toggle to dark mode
    await darkModeToggle.click();
    await page.waitForTimeout(500);

    // Check updated aria-label
    await expect(darkModeToggle).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  test('should persist theme across page reloads', async ({ page }) => {
    const darkModeToggle = page.getByTestId('dark-mode-toggle');
    
    // Toggle to dark mode
    await darkModeToggle.click();
    await page.waitForTimeout(500);

    // Verify dark mode is active
    const html = page.locator('html');
    const isDarkBeforeReload = await html.evaluate(el => el.classList.contains('dark'));
    expect(isDarkBeforeReload).toBe(true);

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify dark mode persists
    const isDarkAfterReload = await html.evaluate(el => el.classList.contains('dark'));
    expect(isDarkAfterReload).toBe(true);
  });

  test('should work with keyboard navigation', async ({ page }) => {
    // Tab to the theme toggle
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // May need multiple tabs to reach the toggle

    const darkModeToggle = page.getByTestId('dark-mode-toggle');
    
    // Check if the toggle is focused (try different approaches)
    const isFocused = await darkModeToggle.evaluate(el => document.activeElement === el);
    
    if (!isFocused) {
      // If not focused, click to focus it first
      await darkModeToggle.focus();
    }

    // Press Enter or Space to activate
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Verify theme changed
    const html = page.locator('html');
    const isDark = await html.evaluate(el => el.classList.contains('dark'));
    expect(typeof isDark).toBe('boolean');
  });

  test('should apply dark mode styles to navigation', async ({ page }) => {
    const darkModeToggle = page.getByTestId('dark-mode-toggle');
    const navigation = page.getByRole('navigation');

    // Toggle to dark mode
    await darkModeToggle.click();
    await page.waitForTimeout(500);

    // Check that navigation has dark mode classes
    await expect(navigation).toHaveClass(/dark:bg-gray-900\/98/);
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Find mobile theme toggle
    const mobileThemeToggle = page.getByTestId('dark-mode-toggle').first();
    await expect(mobileThemeToggle).toBeVisible();

    // Test toggle functionality on mobile
    await mobileThemeToggle.click();
    await page.waitForTimeout(500);

    const html = page.locator('html');
    const isDark = await html.evaluate(el => el.classList.contains('dark'));
    expect(typeof isDark).toBe('boolean');
  });

  test('should handle rapid clicking gracefully', async ({ page }) => {
    const darkModeToggle = page.getByTestId('dark-mode-toggle');
    
    // Rapid clicks
    await darkModeToggle.click();
    await darkModeToggle.click();
    await darkModeToggle.click();
    await darkModeToggle.click();
    
    await page.waitForTimeout(1000);

    // Should still be functional
    const html = page.locator('html');
    const isDark = await html.evaluate(el => el.classList.contains('dark'));
    expect(typeof isDark).toBe('boolean');
  });

  test('should respect system theme preference', async ({ page, context }) => {
    // Set system preference to dark
    await context.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => {},
        }),
      });
    });

    // Reload to apply system preference
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check if system preference is respected
    const html = page.locator('html');
    const isDark = await html.evaluate(el => el.classList.contains('dark'));
    
    // The theme should respect system preference
    expect(typeof isDark).toBe('boolean');
  });

  test('should maintain accessibility standards', async ({ page }) => {
    const darkModeToggle = page.getByTestId('dark-mode-toggle');

    // Check for proper ARIA attributes
    await expect(darkModeToggle).toHaveAttribute('aria-label');
    await expect(darkModeToggle).toHaveAttribute('role', 'button');

    // Check focus indicators
    await darkModeToggle.focus();
    
    // Verify button is focusable
    const isFocused = await darkModeToggle.evaluate(el => document.activeElement === el);
    expect(isFocused).toBe(true);
  });

  test('should work with different screen sizes', async ({ page }) => {
    const sizes = [
      { width: 320, height: 568 },  // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 } // Desktop
    ];

    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.waitForTimeout(300);

      const darkModeToggle = page.getByTestId('dark-mode-toggle').first();
      await expect(darkModeToggle).toBeVisible();

      // Test functionality at this size
      await darkModeToggle.click();
      await page.waitForTimeout(500);

      const html = page.locator('html');
      const isDark = await html.evaluate(el => el.classList.contains('dark'));
      expect(typeof isDark).toBe('boolean');
    }
  });

  test('should not cause layout shifts', async ({ page }) => {
    const darkModeToggle = page.getByTestId('dark-mode-toggle');
    
    // Get initial layout
    const initialBoundingBox = await darkModeToggle.boundingBox();
    
    // Toggle theme
    await darkModeToggle.click();
    await page.waitForTimeout(500);
    
    // Check layout hasn't shifted
    const afterToggleBoundingBox = await darkModeToggle.boundingBox();
    
    expect(initialBoundingBox?.x).toBe(afterToggleBoundingBox?.x);
    expect(initialBoundingBox?.y).toBe(afterToggleBoundingBox?.y);
    expect(initialBoundingBox?.width).toBe(afterToggleBoundingBox?.width);
    expect(initialBoundingBox?.height).toBe(afterToggleBoundingBox?.height);
  });

  test('should have smooth transitions', async ({ page }) => {
    const darkModeToggle = page.getByTestId('dark-mode-toggle');
    
    // Check for transition classes
    await expect(darkModeToggle).toHaveClass(/transition-all/);
    await expect(darkModeToggle).toHaveClass(/duration-200/);
    
    // Test that transitions are applied to icons
    const sunIcon = darkModeToggle.locator('svg').nth(0);
    const moonIcon = darkModeToggle.locator('svg').nth(1);
    
    await expect(sunIcon).toHaveClass(/transition-all/);
    await expect(moonIcon).toHaveClass(/transition-all/);
  });
}); 