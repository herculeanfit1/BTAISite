import { skipTest } from "../utils/test-utils";
import { test, expect } from "@playwright/test";

// Performance thresholds in milliseconds
const THRESHOLDS = {
  LOAD_TIME: 3000, // 3 seconds
  FIRST_PAINT: 1000, // 1 second
  LCP: 2500, // 2.5 seconds (Core Web Vital)
  FID: 100, // 100ms (Core Web Vital - approximated with first input delay)
  CLS: 0.1, // 0.1 (Core Web Vital - layout shift score)
};

// Pages to test
const PAGES_TO_TEST = [
  { path: "/", name: "Home" },
  { path: "/about", name: "About" },
  { path: "/contact", name: "Contact" },
  { path: "/services", name: "Services" },
  { path: "/pricing", name: "Pricing" },
];

test.describe("Performance Tests", () => {
  for (const page of PAGES_TO_TEST) {
    test(`Performance metrics for ${page.name} page`, async ({
      page: pageObj,
    }) => {
      // Clear cache and cookies
      await pageObj.context().clearCookies();

      // Enable performance metrics
      const client = await pageObj.context().newCDPSession(pageObj);
      await client.send("Performance.enable");

      // Navigate to the page and collect metrics
      const navigationStart = Date.now();

      // We're measuring navigation performance
      const navigationPromise = pageObj.goto(page.path, {
        waitUntil: "networkidle", // Wait until network is idle
      });

      // This collects JavaScript performance entries
      const performanceEntries = await pageObj.evaluate(() => {
        return new Promise((resolve) => {
          // Wait for LCP to happen before resolving
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            if (entries.length > 0) {
              resolve(
                performance
                  .getEntriesByType("navigation")
                  .concat(
                    performance.getEntriesByType("paint"),
                    performance.getEntriesByType("largest-contentful-paint")
                  )
              );
            }
          }).observe({ type: "largest-contentful-paint", buffered: true });

          // Fallback if LCP doesn't fire
          setTimeout(() => {
            resolve(
              performance
                .getEntriesByType("navigation")
                .concat(performance.getEntriesByType("paint"))
            );
          }, 5000);
        });
      });

      // Wait for navigation to complete
      await navigationPromise;
      const navigationEnd = Date.now();

      // Calculate overall page load time
      const pageLoadTime = navigationEnd - navigationStart;

      // Parse gathered metrics
      const firstPaint = (performanceEntries as PerformanceEntry[]).find(
        (entry: PerformanceEntry) => entry.name === "first-paint"
      )?.startTime;

      const firstContentfulPaint = (
        performanceEntries as PerformanceEntry[]
      ).find(
        (entry: PerformanceEntry) => entry.name === "first-contentful-paint"
      )?.startTime;

      const largestContentfulPaint = (
        performanceEntries as PerformanceEntry[]
      ).find(
        (entry: PerformanceEntry) =>
          entry.entryType === "largest-contentful-paint"
      )?.startTime;

      // Measure interaction delay
      const interactionStart = Date.now();
      // Find a clickable element
      const clickableElement = pageObj
        .locator('button, a, [role="button"]')
        .first();
      if ((await clickableElement.count()) > 0) {
        await clickableElement.click();
      }
      const interactionEnd = Date.now();
      const interactionDelay = interactionEnd - interactionStart;

      // Measure Layout Shifts
      const cumulativeLayoutShift = await pageObj.evaluate(() => {
        return new Promise<number>((resolve) => {
          let clsValue = 0;

          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              // Cast entry to access hadRecentInput and value properties
              const layoutShift = entry as unknown as {
                hadRecentInput: boolean;
                value: number;
              };

              if (!layoutShift.hadRecentInput) {
                clsValue += layoutShift.value;
              }
            }
          }).observe({ type: "layout-shift", buffered: true });

          // Report CLS after a short delay
          setTimeout(() => resolve(clsValue), 1000);
        });
      });

      // Log all metrics for CI reporting
      console.log(`\n--- Performance metrics for ${page.name} page ---`);
      console.log(`Page Load Time: ${pageLoadTime}ms`);
      console.log(
        `First Paint: ${firstPaint ? Math.round(firstPaint) : "Not available"}ms`
      );
      console.log(
        `First Contentful Paint: ${firstContentfulPaint ? Math.round(firstContentfulPaint) : "Not available"}ms`
      );
      console.log(
        `Largest Contentful Paint: ${largestContentfulPaint ? Math.round(largestContentfulPaint) : "Not available"}ms`
      );
      console.log(`First Input Delay (approximated): ${interactionDelay}ms`);
      console.log(`Cumulative Layout Shift: ${cumulativeLayoutShift}`);
      console.log("----------------------------------------------\n");

      // Assert metrics are within thresholds
      expect(pageLoadTime).toBeLessThan(THRESHOLDS.LOAD_TIME);

      if (firstContentfulPaint) {
        expect(firstContentfulPaint).toBeLessThan(THRESHOLDS.FIRST_PAINT);
      }

      if (largestContentfulPaint) {
        expect(largestContentfulPaint).toBeLessThan(THRESHOLDS.LCP);
      }

      expect(interactionDelay).toBeLessThan(THRESHOLDS.FID);
      expect(Number(cumulativeLayoutShift)).toBeLessThan(THRESHOLDS.CLS);
    });
  }
});

test.describe("Resource Loading Performance", () => {
  test("CSS and JS resources should load efficiently", async ({ page }) => {
    // Enable request interception to measure resource loading
    await page.route("**/*", (route) => {
      route.continue();
    });

    const resourceTimings: Record<string, number> = {};

    page.on("request", (request) => {
      const url = request.url();
      resourceTimings[url] = Date.now();
    });

    page.on("response", (response) => {
      const request = response.request();
      const url = request.url();
      const startTime = resourceTimings[url] || 0;
      const endTime = Date.now();
      const duration = endTime - startTime;

      const resourceType = request.resourceType();
      if (resourceType === "script" || resourceType === "stylesheet") {
        console.log(`Resource ${resourceType}: ${url} - ${duration}ms`);
        // Critical resources should load quickly
        if (
          url.includes("main") ||
          url.includes("chunk") ||
          url.includes("critical")
        ) {
          expect(duration).toBeLessThan(1000); // Critical resources should load in under 1 second
        }
      }
    });

    // Navigate to the homepage
    await page.goto("/", { waitUntil: "networkidle" });

    // Check total CSS and JS resource count for bloat
    const scriptCount = await page.locator("script[src]").count();
    const cssCount = await page.locator('link[rel="stylesheet"]').count();

    console.log(`Total script tags: ${scriptCount}`);
    console.log(`Total CSS files: ${cssCount}`);

    // These thresholds may need adjustment based on your application
    expect(scriptCount).toBeLessThan(15); // Adjust based on your expected script count
    expect(cssCount).toBeLessThan(5); // Adjust based on your expected CSS count
  });

  test("Images should be optimized and responsive", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Check if images are using modern formats and Next.js Image component
    const images = page.locator("img");
    const imageCount = await images.count();

    if (imageCount === 0) {
      skipTest("No images found on the page");
      return;
    }

    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      // Check up to 5 images
      const img = images.nth(i);

      // Check if using Next.js Image (which adds data-nimg attribute)
      const isNextImage = (await img.getAttribute("data-nimg")) !== null;

      // Check if image has dimensions and alt text
      const hasWidth = (await img.getAttribute("width")) !== null;
      const hasHeight = (await img.getAttribute("height")) !== null;
      const hasAlt =
        (await img.getAttribute("alt")) !== null &&
        (await img.getAttribute("alt")) !== "";

      // Check if image is lazy loaded
      const isLazy = (await img.getAttribute("loading")) === "lazy";

      // Modern images should use Next.js Image or at least have proper attributes
      expect(isNextImage || (hasWidth && hasHeight)).toBeTruthy();
      expect(hasAlt).toBeTruthy();

      // Get image dimensions
      const imgWidth = await img.evaluate((el) => el.clientWidth);
      const imgHeight = await img.evaluate((el) => el.clientHeight);

      // Image should have some size (not broken)
      expect(imgWidth).toBeGreaterThan(0);
      expect(imgHeight).toBeGreaterThan(0);

      console.log(
        `Image ${i + 1}: Next.js Image: ${isNextImage}, Width: ${imgWidth}, Height: ${imgHeight}, Lazy: ${isLazy}`
      );
    }
  });
});

test.describe("Bundle Size Analysis", () => {
  test("Main JS bundle should be reasonably sized", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Collect metrics about loaded scripts
    const scriptSizes = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll("script[src]"));
      return Promise.all(
        scripts.map(async (script) => {
          const src = script.getAttribute("src");
          if (!src) return null;

          try {
            const response = await fetch(src);
            const text = await response.text();
            return {
              src,
              size: text.length,
              isModule: script.getAttribute("type") === "module",
            };
          } catch (e) {
            return {
              src,
              size: 0,
              error: true,
            };
          }
        })
      );
    });

    const validScripts = scriptSizes.filter((s) => s !== null);

    if (validScripts.length === 0) {
      skipTest("No scripts found to analyze");
      return;
    }

    console.log("Bundle size analysis:");
    for (const script of validScripts) {
      if (script && script.src) {
        console.log(`${script.src}: ${Math.round(script.size / 1024)}KB`);

        // Main chunks should be reasonably sized
        if (
          script.src.includes("chunk") ||
          script.src.includes("main") ||
          script.src.includes("bundle")
        ) {
          const sizeInKB = script.size / 1024;
          expect(sizeInKB).toBeLessThan(500); // 500KB is a reasonable size for modern web apps
        }
      }
    }

    // Calculate total JS size
    const totalJSSize = validScripts.reduce(
      (total, script) => total + (script?.size || 0),
      0
    );
    const totalJSSizeKB = Math.round(totalJSSize / 1024);

    console.log(`Total JS size: ${totalJSSizeKB}KB`);
    expect(totalJSSizeKB).toBeLessThan(1000); // 1MB total JS is a reasonable threshold
  });
});
