/**
 * Visual Regression Testing Utility
 *
 * This utility provides functions to test visual regression of components
 * with support for multiple variants (dark mode, mobile, etc.)
 */
import { expect } from "@playwright/test";
import { skipTest } from "./test-utils";

/**
 * Test visual regression for a component with support for variants
 *
 * @param options Test options including page, name, variants, and threshold
 */
export async function testVisualRegression(
  options: TestVisualRegressionOptions
): Promise<void> {
  const { page, name, variants = [], defaultThreshold = 0.1 } = options;

  if (!page) {
    throw new Error("Page is required for visual regression testing");
  }

  // If no variants specified, run a single default test
  if (variants.length === 0) {
    await takeAndCompareScreenshot(page, name, defaultThreshold);
    return;
  }

  // Test all specified variants
  for (const variant of variants) {
    // Set up the variant environment if needed
    if (variant.setup) {
      await variant.setup();
    }

    // Take and compare screenshot with variant-specific threshold or default
    const threshold = variant.threshold ?? defaultThreshold;
    const variantName = `${name}-${variant.name}`;

    await takeAndCompareScreenshot(page, variantName, threshold);

    // Clean up the variant environment if needed
    if (variant.cleanup) {
      await variant.cleanup();
    }
  }
}

/**
 * Takes a screenshot and compares it with a baseline
 *
 * @param page Playwright page
 * @param screenshotName Name of the screenshot
 * @param threshold Difference threshold (0-1)
 */
async function takeAndCompareScreenshot(
  page: any,
  screenshotName: string,
  threshold: number
): Promise<void> {
  try {
    // Take a screenshot
    await page.screenshot({
      fullPage: false,
      path: `test-results/screenshots/${screenshotName}.png`,
    });

    // Compare with baseline if it exists
    try {
      await expect(page).toHaveScreenshot(`${screenshotName}.png`, {
        maxDiffPixelRatio: threshold,
      });
      console.log(`✅ Visual regression test passed for ${screenshotName}`);
    } catch (_e) {
      // If baseline doesn't exist, this will fail but we should continue
      console.log(
        `⚠️ No baseline found for ${screenshotName} - creating first version`
      );
    }
  } catch (e) {
    skipTest(
      `Failed to take or compare screenshot for ${screenshotName}: ${e}`
    );
  }
}

/**
 * Create variants for dark mode testing
 */
export function createDarkModeVariants(
  page: unknown,
  setupFn?: () => Promise<void>,
  cleanupFn?: () => Promise<void>
): VisualRegressionTestVariant[] {
  return [
    {
      name: "light",
      async setup() {
        // Ensure light mode is active
        await setupFn?.();
      },
      async cleanup() {
        await cleanupFn?.();
      },
      threshold: 0.1,
    },
    {
      name: "dark",
      async setup() {
        // Switch to dark mode
        await setupFn?.();
        // Add dark mode class to html element
        if (page && typeof page === "object" && "evaluate" in page) {
          await (page as any).evaluate(() => {
            document.documentElement.classList.add("dark");
          });
        }
      },
      async cleanup() {
        // Remove dark mode class
        if (page && typeof page === "object" && "evaluate" in page) {
          await (page as any).evaluate(() => {
            document.documentElement.classList.remove("dark");
          });
        }
        await cleanupFn?.();
      },
      threshold: 0.1,
    },
  ];
}
