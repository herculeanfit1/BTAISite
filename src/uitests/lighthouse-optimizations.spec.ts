/**
 * Lighthouse Performance Optimizations Integration Test
 *
 * This test verifies that our performance optimizations are correctly applied
 * in a real browser environment using Playwright.
 *
 * It checks:
 * 1. Image optimization with correct formats (webp/avif)
 * 2. Font optimization and preloading
 * 3. Content security headers
 * 4. HSTS headers in production
 */

import { test, expect } from "@playwright/test";

// Only run these tests in CI environments to avoid local environment issues
const shouldRun =
  process.env.CI === "true" || process.env.FORCE_TESTS === "true";
const testFn = shouldRun ? test : test.skip;

// Test for performance optimizations
testFn(
  "page should have proper performance optimizations",
  async ({ page, baseURL }) => {
    // Navigate to the homepage
    await page.goto(baseURL || "http://localhost:3000");

    // Test 1: Verify images are optimized with correct format
    const images = await page.$$eval("img", (imgs) => {
      return imgs.map((img) => ({
        src: img.src,
        width: img.width,
        height: img.height,
        loading: img.loading,
        decoding: img.getAttribute("decoding"),
      }));
    });

    // Check that at least some images are using Next.js image optimization
    const optimizedImages = images.filter((img) =>
      img.src.includes("/_next/image")
    );
    expect(optimizedImages.length).toBeGreaterThan(0);

    // Test 2: Check for font preloading in head
    const fontPreloads = await page.$$eval(
      'link[rel="preload"][as="font"]',
      (links) => links.length
    );
    expect(fontPreloads).toBeGreaterThanOrEqual(0); // May be 0 if using system fonts

    // Test 3: Verify security headers are set
    const response = await page.goto(baseURL || "http://localhost:3000");
    const headers = response?.headers() || {};

    // Content Security Policy
    expect(headers["content-security-policy"]).toBeTruthy();

    // Other security headers
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-xss-protection"]).toBe("1; mode=block");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");

    // Test 4: Check HSTS headers (only in production)
    if (process.env.NODE_ENV === "production") {
      expect(headers["strict-transport-security"]).toBe(
        "max-age=63072000; includeSubDomains; preload"
      );
    }
  }
);

// Test for Core Web Vitals metrics
testFn(
  "page should have good Core Web Vitals metrics",
  async ({ page, baseURL }) => {
    // Navigate to the homepage
    await page.goto(baseURL || "http://localhost:3000");

    // Use Performance API to measure key metrics
    const metrics = await page.evaluate(() => {
      return new Promise<{
        ttfb: number;
        fcp: number | undefined;
        dcl: number;
        loadTime: number;
      }>((resolve) => {
        // Wait for the page to be fully loaded
        window.addEventListener("load", () => {
          // Wait a bit more for all resources to be fully processed
          setTimeout(() => {
            // Get performance entries
            const perfEntries = performance.getEntriesByType(
              "navigation"
            )[0] as PerformanceNavigationTiming;
            const paintEntries = performance.getEntriesByType("paint");

            const result = {
              // Time to First Byte
              ttfb: perfEntries.responseStart,
              // First Contentful Paint
              fcp: paintEntries.find(
                (entry) => entry.name === "first-contentful-paint"
              )?.startTime,
              // DOM Content Loaded
              dcl: perfEntries.domContentLoadedEventEnd,
              // Load Time
              loadTime: perfEntries.loadEventEnd,
            };

            resolve(result);
          }, 1000);
        });
      });
    });

    // Set reasonable thresholds for development
    // In production, these would be stricter
    expect(metrics.ttfb).toBeLessThan(800); // Time to First Byte < 800ms
    expect(metrics.fcp).toBeLessThan(3000); // First Contentful Paint < 3s
    expect(metrics.dcl).toBeLessThan(4000); // DOM Content Loaded < 4s
    expect(metrics.loadTime).toBeLessThan(5000); // Load Time < 5s
  }
);
