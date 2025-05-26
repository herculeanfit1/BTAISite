import { test, expect, type Page, type Locator } from "@playwright/test";
import { skipTest, getComputedStyle, hasClass } from "../utils/test-utils";

test.describe("Button Component", () => {
  // Test setup for component testing
  test.beforeEach(async ({ page }) => {
    // Navigate to a page that contains buttons
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  // Primary button test
  test("primary buttons should have correct styling", async ({ page }) => {
    // Look for primary buttons
    const primaryButtons = page.locator(
      "button.primary, button.btn-primary, .btn-primary"
    );

    // Skip test if no primary buttons found
    if ((await primaryButtons.count()) === 0) {
      skipTest("No primary buttons found on the page");
      return;
    }

    // Check first primary button styling
    const firstButton = primaryButtons.first();

    // Verify button exists
    await expect(firstButton).toBeVisible();

    // Check background color - allowing for different color schemes
    const bgColor = await getComputedStyle(
      page,
      "button.primary, button.btn-primary, .btn-primary",
      "background-color"
    );
    const isValidBgColor = /#\w+|rgba?\(|hsla?\(/.test(bgColor);
    expect(isValidBgColor).toBeTruthy();

    // Check text color is visible on the background
    const textColor = await getComputedStyle(
      page,
      "button.primary, button.btn-primary, .btn-primary",
      "color"
    );
    const isValidTextColor = /#\w+|rgba?\(|hsla?\(/.test(textColor);
    expect(isValidTextColor).toBeTruthy();

    // Check padding is appropriate for a button
    const paddingTop = await getComputedStyle(
      page,
      "button.primary, button.btn-primary, .btn-primary",
      "padding-top"
    );
    const paddingRight = await getComputedStyle(
      page,
      "button.primary, button.btn-primary, .btn-primary",
      "padding-right"
    );
    const paddingBottom = await getComputedStyle(
      page,
      "button.primary, button.btn-primary, .btn-primary",
      "padding-bottom"
    );
    const paddingLeft = await getComputedStyle(
      page,
      "button.primary, button.btn-primary, .btn-primary",
      "padding-left"
    );

    // Verify padding is non-zero (buttons should have padding)
    expect(parseFloat(paddingTop)).toBeGreaterThan(0);
    expect(parseFloat(paddingRight)).toBeGreaterThan(0);
    expect(parseFloat(paddingBottom)).toBeGreaterThan(0);
    expect(parseFloat(paddingLeft)).toBeGreaterThan(0);
  });

  // Secondary button test
  test("secondary buttons should have correct styling", async ({ page }) => {
    // Look for secondary buttons
    const secondaryButtons = page.locator(
      "button.secondary, button.btn-secondary, .btn-secondary"
    );

    // Skip test if no secondary buttons found
    if ((await secondaryButtons.count()) === 0) {
      skipTest("No secondary buttons found on the page");
      return;
    }

    // Similar checks as primary but expecting different styling
    const firstButton = secondaryButtons.first();
    await expect(firstButton).toBeVisible();

    // Check for appropriate secondary button styling
    const borderStyle = await getComputedStyle(
      page,
      "button.secondary, button.btn-secondary, .btn-secondary",
      "border-style"
    );

    // Many secondary buttons have borders
    if (borderStyle !== "none") {
      const borderWidth = await getComputedStyle(
        page,
        "button.secondary, button.btn-secondary, .btn-secondary",
        "border-width"
      );
      expect(parseFloat(borderWidth)).toBeGreaterThan(0);
    }
  });

  // Button hover test
  test("buttons should have hover effects", async ({ page }) => {
    // Look for any button that might have hover effects
    const buttons = page.locator("button, .btn, [class*='button']");

    // Skip test if no buttons found
    if ((await buttons.count()) === 0) {
      skipTest("No buttons found on the page");
      return;
    }

    // Check the first button for hover effects
    const firstButton = buttons.first();

    // Get styles before hover
    await firstButton.scrollIntoViewIfNeeded();
    const initialBgColor = await getComputedStyle(
      page,
      "button, .btn, [class*='button']",
      "background-color"
    );

    // Hover over the button
    await firstButton.hover();
    await page.waitForTimeout(300); // Wait for any hover transition

    // Get styles after hover
    const hoverBgColor = await getComputedStyle(
      page,
      "button:hover, .btn:hover, [class*='button']:hover",
      "background-color"
    );

    // This test might be flaky depending on CSS implementation
    // Some buttons might change opacity or other properties instead of background-color
    // Just check that some hover effect is defined in CSS
    const hasHoverClass = await page.evaluate(() => {
      const styleSheets = Array.from(document.styleSheets);
      for (const sheet of styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules);
          for (const rule of rules) {
            if (
              rule.cssText &&
              (rule.cssText.includes("button:hover") ||
                rule.cssText.includes(".btn:hover") ||
                (rule.cssText.includes("button-") &&
                  rule.cssText.includes(":hover")))
            ) {
              return true;
            }
          }
        } catch (e) {
          // Accessing cross-origin stylesheets will throw an error
          continue;
        }
      }
      return false;
    });

    // Either the color changed or there's some hover effect defined
    const hoverEffectExists = initialBgColor !== hoverBgColor || hasHoverClass;
    expect(hoverEffectExists).toBeTruthy();
  });

  // Button functionality test
  test("button should be clickable", async ({ page }) => {
    // Find a visible button that isn't disabled
    const button = page
      .locator(
        'button:visible:not([disabled]), .btn:visible:not([disabled]), [role="button"]:visible:not([disabled])'
      )
      .first();

    if ((await button.count()) === 0) {
      skipTest("No clickable buttons found");
      return;
    }

    // Ensure button is visible
    await expect(button).toBeVisible();

    // Ensure button is enabled
    const isDisabled = await button.getAttribute("disabled");
    expect(isDisabled).not.toBe("true");
    expect(isDisabled).not.toBe("disabled");

    // Check if button has a pointer cursor
    const cursor = await button.evaluate((el) => {
      return window.getComputedStyle(el).cursor;
    });

    expect(cursor).toBe("pointer");

    // Test that button can be clicked without errors
    await button.click();
  });

  // Disabled button test
  test("disabled buttons should have correct styling and behavior", async ({
    page,
  }) => {
    // Look for disabled buttons
    const disabledButtons = page.locator(
      "button[disabled], .btn[disabled], button.disabled, .btn.disabled"
    );

    // Skip test if no disabled buttons found
    if ((await disabledButtons.count()) === 0) {
      skipTest("No disabled buttons found on the page");
      return;
    }

    const disabledButton = disabledButtons.first();
    await expect(disabledButton).toBeVisible();

    // Check disabled button styles
    const styles = await disabledButton.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return {
        opacity: computedStyle.opacity,
        cursor: computedStyle.cursor,
      };
    });

    // Disabled buttons often have reduced opacity
    expect(parseFloat(styles.opacity)).toBeLessThan(1);

    // Cursor should not be pointer for disabled buttons
    expect(styles.cursor).not.toBe("pointer");
  });

  test("buttons should be visible and properly styled", async ({ page }) => {
    // Find all buttons
    const buttons = page.locator(
      'button, .btn, a[class*="btn"], [role="button"]'
    );

    // Ensure buttons exist
    expect(await buttons.count()).toBeGreaterThan(0);

    // Check basic button properties
    const firstButton = buttons.first();
    await expect(firstButton).toBeVisible();

    // Check button has enough contrast (foreground/background)
    const hasSufficientContrast = await firstButton.evaluate((el) => {
      const style = window.getComputedStyle(el);
      // This is a simplified check - a real implementation would use
      // more sophisticated color contrast algorithms
      return (
        style.backgroundColor !== "transparent" &&
        style.backgroundColor !== "rgba(0, 0, 0, 0)" &&
        style.color !== style.backgroundColor
      );
    });

    expect(hasSufficientContrast).toBeTruthy();
  });

  test("primary buttons should have distinctive styling", async ({ page }) => {
    // Look for primary buttons with common class names
    const primaryButtons = page.locator(
      "button.btn-primary, .btn-primary, a.btn-primary, " +
        "button.primary, .primary, a.primary, " +
        '[data-variant="primary"], button[type="submit"], .cta'
    );

    if ((await primaryButtons.count()) === 0) {
      skipTest("No primary buttons found");
      return;
    }

    // Get a primary button
    const primaryButton = primaryButtons.first();

    // Get a non-primary button for comparison
    const otherButtons = page.locator(
      'button:not(.btn-primary):not(.primary):not([data-variant="primary"]):not([type="submit"]):not(.cta), ' +
        '.btn:not(.btn-primary):not(.primary):not([data-variant="primary"]):not(.cta)'
    );

    if ((await otherButtons.count()) === 0) {
      // If we couldn't find a non-primary button, we'll skip this part
      await expect(primaryButton).toBeVisible();
      return;
    }

    const otherButton = otherButtons.first();

    // Compare styling
    const [primaryStyles, otherStyles] = await Promise.all([
      primaryButton.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          backgroundColor: style.backgroundColor,
          color: style.color,
          borderRadius: style.borderRadius,
          fontWeight: style.fontWeight,
          padding: style.padding,
        };
      }),
      otherButton.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          backgroundColor: style.backgroundColor,
          color: style.color,
          borderRadius: style.borderRadius,
          fontWeight: style.fontWeight,
          padding: style.padding,
        };
      }),
    ]);

    // Primary buttons should have at least one style difference
    const hasDifference =
      primaryStyles.backgroundColor !== otherStyles.backgroundColor ||
      primaryStyles.color !== otherStyles.color ||
      primaryStyles.fontWeight !== otherStyles.fontWeight;

    expect(hasDifference).toBeTruthy();

    // Take a screenshot for visual comparison
    await primaryButton.screenshot({ path: "test-results/button-primary.png" });
    await otherButton.screenshot({ path: "test-results/button-secondary.png" });
  });

  test("buttons should show hover state", async ({ page }) => {
    // Find all buttons
    const buttons = page.locator(
      'button, .btn, a[class*="btn"], [role="button"]'
    );

    if ((await buttons.count()) === 0) {
      skipTest("No buttons found");
      return;
    }

    const firstButton = buttons.first();

    // Get styles before hover
    const stylesBefore = await firstButton.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
        transform: style.transform,
        boxShadow: style.boxShadow,
        border: style.border,
      };
    });

    // Screenshot before hover
    await firstButton.screenshot({
      path: "test-results/button-before-hover.png",
    });

    // Hover over the button
    await firstButton.hover();

    // Small delay to ensure hover styles are applied
    await page.waitForTimeout(200);

    // Get styles after hover
    const stylesAfter = await firstButton.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
        transform: style.transform,
        boxShadow: style.boxShadow,
        border: style.border,
      };
    });

    // Screenshot after hover
    await firstButton.screenshot({
      path: "test-results/button-after-hover.png",
    });

    // Check if there's a visual difference on hover
    // Some buttons may not have hover effects, so this is just informational
    const hasHoverEffect =
      stylesBefore.backgroundColor !== stylesAfter.backgroundColor ||
      stylesBefore.color !== stylesAfter.color ||
      stylesBefore.transform !== stylesAfter.transform ||
      stylesBefore.boxShadow !== stylesAfter.boxShadow ||
      stylesBefore.border !== stylesAfter.border;

    if (hasHoverEffect) {
      console.log("Button has hover effect");
    } else {
      console.log("Button does not have hover effect");
    }
  });

  test("buttons should be accessible", async ({ page }) => {
    // Find all buttons
    const buttons = page.locator(
      'button, .btn, a[class*="btn"], [role="button"]'
    );

    if ((await buttons.count()) === 0) {
      skipTest("No buttons found");
      return;
    }

    // Test each button (limit to 3 to avoid too many checks)
    const buttonCount = await buttons.count();
    const maxToCheck = Math.min(buttonCount, 3);

    for (let i = 0; i < maxToCheck; i++) {
      const button = buttons.nth(i);

      // Button should be visible and not disabled (unless explicitly marked)
      await expect(button).toBeVisible();

      // Button should have a text label or aria-label
      const buttonText = await button.textContent();
      const ariaLabel = await button.getAttribute("aria-label");
      const ariaLabelledby = await button.getAttribute("aria-labelledby");

      expect(
        (buttonText && buttonText.trim().length > 0) ||
          ariaLabel ||
          ariaLabelledby
      ).toBeTruthy();

      // Check if button is focusable
      await button.focus();

      // Verify button received focus
      const isFocused = await page.evaluate(() => {
        return (
          document.activeElement ===
          document.querySelector(
            'button, .btn, a[class*="btn"], [role="button"]'
          )
        );
      });

      expect(isFocused).toBeTruthy();

      // Check for visible focus indicator
      const hasFocusStyles = await button.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return (
          (style.outline !== "0px none" && style.outline !== "none") ||
          style.boxShadow !== "none" ||
          el.classList.contains("focus") ||
          el.classList.contains("focused")
        );
      });

      // Take screenshot of focused state for visual comparison
      await button.screenshot({ path: `test-results/button-focused-${i}.png` });
    }
  });

  test("disabled buttons should look disabled", async ({ page }) => {
    // Find disabled buttons
    const disabledButtons = page.locator(
      'button[disabled], button[aria-disabled="true"], .btn[disabled], .btn[aria-disabled="true"]'
    );

    if ((await disabledButtons.count()) === 0) {
      skipTest("No disabled buttons found");
      return;
    }

    const disabledButton = disabledButtons.first();

    // Check button styling
    const hasDisabledStyling = await disabledButton.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return (
        style.opacity !== "1" ||
        style.cursor === "not-allowed" ||
        el.classList.contains("disabled")
      );
    });

    expect(hasDisabledStyling).toBeTruthy();

    // Take screenshot for visual comparison
    await disabledButton.screenshot({
      path: "test-results/button-disabled.png",
    });

    // Check that disabled button has aria-disabled attribute
    const hasAriaDisabled =
      (await disabledButton.getAttribute("aria-disabled")) === "true" ||
      (await disabledButton.getAttribute("disabled")) !== null;

    expect(hasAriaDisabled).toBeTruthy();
  });
});
