import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 *
 * Two knobs, both off by default so CI and a clean laptop behave identically:
 *
 *   E2E_BASE_URL  Test an already-deployed origin (the PR preview) instead of a
 *                 local dev server. When set, no server is started.
 *   E2E_PORT      Port for the managed dev server. Default 3000.
 *
 * Why the port is configurable: 3000 is a popular default and is occupied on at
 * least one machine in this fleet by an unrelated container. A hard-coded 3000
 * is not a preference, it is a landmine -- see the reuseExistingServer note on
 * the webServer block below.
 */
const EXTERNAL_TARGET = process.env.E2E_BASE_URL;
const PORT = process.env.E2E_PORT ?? "3000";
const baseURL = EXTERNAL_TARGET ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Number of workers (parallel browsers) */
  workers: process.env.CI ? 2 : undefined,
  /* Reporter to use */
  reporter: [
    ["html", { open: "never" }],
    ["list", { printSteps: true }],
    process.env.CI
      ? ["github"]
      : ["json", { outputFile: "test-results/test-results.json" }],
  ],
  /* Timeout for each test */
  timeout: 30000,
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL,

    /* Collect trace when retrying the failed test */
    trace: "on-first-retry",

    /* Capture screenshot on failure */
    screenshot: "only-on-failure",

    /* Record video on failure */
    video: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1280, height: 800 },
      },
    },

    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1280, height: 800 },
      },
    },

    /* Test on mobile viewports */
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 5"],
      },
    },

    {
      name: "mobile-safari",
      use: {
        ...devices["iPhone 13"],
      },
    },

    // Removed 2026-07-28: `visual-regression` (testMatch /visual.*\.spec\.ts/)
    // and `performance` (testMatch /__tests__\/lighthouse.*\.test\.ts/, resolved
    // under testDir ./e2e). Neither pattern matched a single file, and a project
    // that matches zero tests reports exactly like a project that passes. They
    // were scaffolding for intentions never implemented. Re-add with real specs
    // if the intent returns; do not re-add a bare testMatch.
  ],

  /* Run your local dev server before starting the tests */
  webServer: EXTERNAL_TARGET
    ? undefined
    : {
        // CI builds and serves production; locally the dev server is used for
        // speed. They are not interchangeable and the difference is not
        // cosmetic -- the CSP carries a dev-only 'unsafe-eval', Next's dev
        // bundler emits unminified eval-wrapped modules, and this repo has
        // already shipped a bug (no security headers at all) that existed only
        // in the deployed artifact. CI tests what ships.
        //
        // `dev:http` (SSL_CERT_ENV=none), not `dev`. server.js picks HTTP vs
        // HTTPS from whether SSL certificates happen to be present on the
        // machine, so `npm run dev` is HTTP on a bare checkout and HTTPS on a
        // developer box with .cert/ populated. `dev:http` is unconditional.
        command: process.env.CI
          ? "npm run build && npm run start"
          : "npm run dev:http",
        // PORT is what server.js actually binds in the HTTP-only branch.
        // HTTP_PORT/HTTPS_PORT are set too because the dual-server branch reads
        // those instead, and one of them being wrong is not worth debugging.
        env: {
          PORT: PORT,
          HTTP_PORT: PORT,
          HTTPS_PORT: String(Number(PORT) + 1),
        },
        // `port`, not `url`: with `port` Playwright refuses to start when
        // something already holds it. With `url` it merely polls until
        // something answers 200 -- which on a machine where 3000 is taken by an
        // unrelated app means the whole suite silently runs against that app
        // and every failure reads as a regression in this one.
        port: Number(PORT),
        // Never inherit a server we did not start, for the same reason.
        // To test a running server deliberately, set E2E_BASE_URL.
        reuseExistingServer: false,
        stdout: "pipe",
        stderr: "pipe",
        // CI runs a full `next build` inside this window.
        timeout: process.env.CI ? 420_000 : 120_000,
      },
});
