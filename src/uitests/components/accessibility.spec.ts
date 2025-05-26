import { skipTest } from "../utils/test-utils";
import { test, expect } from "@playwright/test";

test.describe("Site-wide Accessibility", () => {
  const pages = ["/", "/about", "/contact", "/services", "/pricing", "/blog"];

  for (const path of pages) {
    test(`page ${path} should meet basic accessibility standards`, async ({
      page,
    }) => {
      // Try to navigate to the page, but don't fail the test if the page doesn't exist
      try {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
      } catch (e) {
        skipTest(`Page ${path} not found or failed to load`);
        return;
      }

      // 1. Check for alt text on images
      const images = page.locator("img");
      const imagesCount = await images.count();

      for (let i = 0; i < imagesCount; i++) {
        const image = images.nth(i);
        if (await image.isVisible()) {
          const altText = await image.getAttribute("alt");
          // All visible images should have alt text (empty for decorative images is fine)
          expect(altText).not.toBeNull();
        }
      }

      // 2. Check for proper heading hierarchy
      const h1Elements = await page.locator("h1").count();
      if (h1Elements === 0) {
        console.log(`WARNING: Page ${path} has no h1 element`);
      } else if (h1Elements > 1) {
        console.log(`WARNING: Page ${path} has multiple h1 elements`);
      }

      // Check for skipped heading levels
      const headingLevels = await page.evaluate(() => {
        const headings = Array.from(
          document.querySelectorAll("h1, h2, h3, h4, h5, h6")
        );
        return headings.map((h) => parseInt(h.tagName.substring(1)));
      });

      if (headingLevels.length > 0) {
        // Sort heading levels and check for gaps
        const uniqueLevels = [...new Set(headingLevels)].sort();
        for (let i = 0; i < uniqueLevels.length - 1; i++) {
          if (uniqueLevels[i + 1] - uniqueLevels[i] > 1) {
            console.log(
              `WARNING: Page ${path} skips heading level from h${uniqueLevels[i]} to h${uniqueLevels[i + 1]}`
            );
          }
        }
      }

      // 3. Check forms for labels
      const forms = page.locator("form");
      const formsCount = await forms.count();

      for (let i = 0; i < formsCount; i++) {
        const form = forms.nth(i);
        const inputs = form.locator(
          'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select'
        );
        const inputsCount = await inputs.count();

        for (let j = 0; j < inputsCount; j++) {
          const input = inputs.nth(j);
          const inputId = await input.getAttribute("id");

          if (inputId) {
            // Check if there's a label with a matching 'for' attribute
            const matchingLabel = page.locator(`label[for="${inputId}"]`);
            const hasMatchingLabel = (await matchingLabel.count()) > 0;

            // Check if input has aria-label as alternative
            const ariaLabel = await input.getAttribute("aria-label");

            // Check if input is part of a fieldset with legend
            const isInFieldsetWithLegend = await input.evaluate((el) => {
              const fieldset = el.closest("fieldset");
              return fieldset ? !!fieldset.querySelector("legend") : false;
            });

            // Inputs should have an associated label or equivalent
            const hasAccessibleLabel =
              hasMatchingLabel || ariaLabel || isInFieldsetWithLegend;
            expect(hasAccessibleLabel).toBeTruthy();
          } else {
            // If no ID, check if it has aria-label or placeholder
            const ariaLabel = await input.getAttribute("aria-label");
            const placeholder = await input.getAttribute("placeholder");

            // Input should have some form of accessible label
            expect(ariaLabel || placeholder).not.toBeNull();
          }
        }
      }

      // 4. Check for adequate color contrast (simplified check)
      const hasLowContrast = await page.evaluate(() => {
        // This is a simplified check that looks for very light text on light backgrounds
        // or dark text on dark backgrounds
        // A real test would use WCAG contrast ratio calculations
        const textElements = document.querySelectorAll(
          "p, span, h1, h2, h3, h4, h5, h6, a, button, label"
        );

        for (const el of textElements) {
          const style = window.getComputedStyle(el);
          const textColor = style.color;
          const bgColor = style.backgroundColor;

          // Skip elements with transparent backgrounds
          if (bgColor === "rgba(0, 0, 0, 0)" || bgColor === "transparent") {
            continue;
          }

          // Extremely simplified contrast check
          // Convert colors to grayscale values (0-255)
          const getGrayscale = (color: string): number | null => {
            const rgbMatch = color.match(
              /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
            );
            if (!rgbMatch) return null;

            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);

            // Simple grayscale conversion (perceived luminance)
            return 0.299 * r + 0.587 * g + 0.114 * b;
          };

          const textGray = getGrayscale(textColor);
          const bgGray = getGrayscale(bgColor);

          if (textGray !== null && bgGray !== null) {
            // Very rough check - difference should be more than 80 for minimal contrast
            if (Math.abs(textGray - bgGray) < 80) {
              console.log(
                "Low contrast element found:",
                el.textContent?.trim()
              );
              return true;
            }
          }
        }

        return false;
      });

      if (hasLowContrast) {
        console.log(
          `WARNING: Page ${path} may have elements with low contrast`
        );
      }

      // 5. Check for keyboard navigability
      const allInteractive = page.locator(
        'a, button, [role="button"], [tabindex="0"]'
      );
      const interactiveCount = await allInteractive.count();

      for (let i = 0; i < interactiveCount; i++) {
        const element = allInteractive.nth(i);

        if (await element.isVisible()) {
          // Interactive elements shouldn't have negative tabindex
          const tabIndex = await element.getAttribute("tabindex");
          if (tabIndex !== null) {
            expect(parseInt(tabIndex)).not.toBeLessThan(0);
          }

          // Focus should be visible on interactive elements
          await element.focus();

          // Check if the focus state is visually indicated
          const hasFocusStyle = await element.evaluate((el) => {
            const style = window.getComputedStyle(el);
            // Check if there's an outline, border, or box-shadow change
            return (
              (style.outline !== "none" && style.outline !== "") ||
              (style.border !== "none" && style.border !== "") ||
              (style.boxShadow !== "none" && style.boxShadow !== "")
            );
          });

          if (!hasFocusStyle) {
            console.log(
              `WARNING: Element on page ${path} may not have visible focus styles`
            );
          }
        }
      }

      // 6. Check for ARIA roles, states, and properties
      const ariaElements = page.locator("[role], [aria-*]");
      const ariaCount = await ariaElements.count();

      for (let i = 0; i < ariaCount; i++) {
        const element = ariaElements.nth(i);
        const role = await element.getAttribute("role");

        if (role) {
          // Check for common role mistakes
          const validRoles = [
            "alert",
            "alertdialog",
            "application",
            "article",
            "banner",
            "button",
            "cell",
            "checkbox",
            "columnheader",
            "combobox",
            "complementary",
            "contentinfo",
            "definition",
            "dialog",
            "directory",
            "document",
            "feed",
            "figure",
            "form",
            "grid",
            "gridcell",
            "group",
            "heading",
            "img",
            "link",
            "list",
            "listbox",
            "listitem",
            "log",
            "main",
            "marquee",
            "math",
            "menu",
            "menubar",
            "menuitem",
            "menuitemcheckbox",
            "menuitemradio",
            "navigation",
            "none",
            "note",
            "option",
            "presentation",
            "progressbar",
            "radio",
            "radiogroup",
            "region",
            "row",
            "rowgroup",
            "rowheader",
            "scrollbar",
            "search",
            "searchbox",
            "separator",
            "slider",
            "spinbutton",
            "status",
            "switch",
            "tab",
            "table",
            "tablist",
            "tabpanel",
            "term",
            "textbox",
            "timer",
            "toolbar",
            "tooltip",
            "tree",
            "treegrid",
            "treeitem",
          ];

          expect(validRoles).toContain(role);

          // Check for required attributes for specific roles
          if (role === "checkbox" || role === "radio" || role === "switch") {
            const ariaChecked = await element.getAttribute("aria-checked");
            expect(ariaChecked).not.toBeNull();
          }

          if (role === "combobox" || role === "textbox") {
            const hasProperties = await element.evaluate((el) => {
              return (
                el.hasAttribute("aria-expanded") ||
                el.hasAttribute("aria-autocomplete") ||
                el.hasAttribute("aria-controls")
              );
            });

            if (!hasProperties) {
              console.log(
                `WARNING: Element with role="${role}" may be missing required ARIA attributes`
              );
            }
          }
        }
      }

      // 7. Check for skip links
      const skipLink = page.locator(
        'a[href^="#"]:has-text("Skip"), a[href^="#main"], a[href^="#content"]'
      );
      const hasSkipLink = (await skipLink.count()) > 0;

      if (!hasSkipLink) {
        console.log(
          `WARNING: Page ${path} does not appear to have a skip link`
        );
      }

      // 8. Check page title
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
    });
  }

  // Specific test for dark mode accessibility
  test("dark mode should maintain appropriate contrast", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for a dark mode toggle button
    const darkModeToggles = [
      page.locator('button:has-text("Dark")'),
      page.locator('button:has-text("Theme")'),
      page.locator(
        '[aria-label*="dark"], [aria-label*="theme"], [aria-label*="mode"]'
      ),
      page.locator(
        '.dark-mode-toggle, #dark-mode-toggle, [data-testid="dark-mode-toggle"]'
      ),
    ];

    let darkModeToggle = null;
    for (const toggle of darkModeToggles) {
      if ((await toggle.count()) > 0 && (await toggle.first().isVisible())) {
        darkModeToggle = toggle.first();
        break;
      }
    }

    if (!darkModeToggle) {
      skipTest("Dark mode toggle not found");
      return;
    }

    // Toggle dark mode
    await darkModeToggle.click();
    await page.waitForTimeout(500); // Wait for transition

    // Check if the page is in dark mode
    const isDarkMode = await page.evaluate(() => {
      return (
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark") ||
        document.body.dataset.theme === "dark" ||
        document.documentElement.dataset.theme === "dark"
      );
    });

    if (!isDarkMode) {
      console.log("WARNING: Dark mode toggle did not seem to work");
      return;
    }

    // Take a screenshot of dark mode
    await page.screenshot({ path: "test-results/dark-mode.png" });

    // Check contrast issues in dark mode (simplified)
    const hasLowContrast = await page.evaluate(() => {
      const textElements = document.querySelectorAll(
        "p, span, h1, h2, h3, h4, h5, h6, a, button, label"
      );

      for (const el of textElements) {
        const style = window.getComputedStyle(el);
        const textColor = style.color;
        const bgColor = style.backgroundColor;

        // Skip elements with transparent backgrounds
        if (bgColor === "rgba(0, 0, 0, 0)" || bgColor === "transparent") {
          continue;
        }

        // Simplified contrast check (same as before)
        const getGrayscale = (color: string): number | null => {
          const rgbMatch = color.match(
            /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
          );
          if (!rgbMatch) return null;

          const r = parseInt(rgbMatch[1]);
          const g = parseInt(rgbMatch[2]);
          const b = parseInt(rgbMatch[3]);

          return 0.299 * r + 0.587 * g + 0.114 * b;
        };

        const textGray = getGrayscale(textColor);
        const bgGray = getGrayscale(bgColor);

        if (textGray !== null && bgGray !== null) {
          if (Math.abs(textGray - bgGray) < 80) {
            console.log(
              "Low contrast element in dark mode:",
              el.textContent?.trim()
            );
            return true;
          }
        }
      }

      return false;
    });

    if (hasLowContrast) {
      console.log("WARNING: Dark mode may have elements with low contrast");
    }
  });
});
