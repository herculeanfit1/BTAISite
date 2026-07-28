import { test, expect } from "@playwright/test";

/**
 * Homepage and navigation coverage.
 *
 * Some assertions here were ported from the deleted `vercel-safari.spec.ts`
 * (responsive rendering, contact-form interaction). That spec targeted
 * `/vercel-safari`, a page removed with the Vercel deployment target, so its
 * 20 tests could only ever fail; the behaviours worth keeping now run against
 * the real homepage instead.
 *
 * Not tested here: the `/about`, `/solutions`, `/contact` and locale 301s.
 * Those live in `staticwebapp.config.json` and are applied by the Azure Static
 * Web Apps edge, not by Next.js, so they do not exist in front of a dev server.
 * `__tests__/routing/redirect-map.test.ts` covers that config offline.
 */

test.describe("Target identity", () => {
  // Runs first in file order and guards every other test in the suite.
  //
  // Playwright's webServer waits for *something* to answer on the port. If the
  // port is held by an unrelated app -- which is the normal state of port 3000
  // on a developer machine running other services -- the whole suite silently
  // runs against that app and every failure reads as a DOM regression here.
  // This test makes that misconfiguration say what it actually is.
  test("the origin under test is actually this site", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status(), "homepage did not return 2xx").toBeLessThan(300);

    await expect(
      page,
      "wrong application under test -- check E2E_BASE_URL / E2E_PORT",
    ).toHaveTitle(/Bridging Trust AI/);

    await expect(
      page.locator("#contact"),
      "served an app without this site's #contact section",
    ).toBeAttached();
  });
});

test.describe("Homepage", () => {
  test("loads with the hero heading", async ({ page }) => {
    await page.goto("/");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();

    // The hero animates in word by word, so each word is its own element and
    // the DOM carries no whitespace between them -- textContent reads
    // "MostAIpilots...". Compare with spaces removed on both sides rather than
    // asserting a sentence that only exists visually.
    const text = (await h1.textContent()) ?? "";
    expect(text.replace(/\s+/g, "")).toContain(
      "MostAIpilotsneverreachproduction",
    );
  });

  test("renders every anchor-nav section", async ({ page }) => {
    await page.goto("/");
    // The single-page marketing site is anchor-navigated; a missing section id
    // silently turns a nav link into a no-op.
    for (const id of ["solutions", "about", "contact", "who-we-help"]) {
      await expect(page.locator(`#${id}`), `#${id} missing`).toBeAttached();
    }
  });

  test("navigates to the contact section from the nav", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#contact")).not.toBeInViewport();

    // Below the md breakpoint the links live behind a hamburger, so the desktop
    // nav is not merely off-screen -- it is not rendered. Open the menu when
    // that is the layout in play; this test runs on mobile projects too.
    const menuButton = page.getByRole("button", { name: "Toggle menu" });
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }

    await page.getByRole("link", { name: "Contact" }).first().click();

    // No URL assertion: NavBar's handler calls preventDefault() and scrolls
    // itself, so the fragment is never written to the address bar. Scrolling
    // is the behaviour that matters here.
    await expect(page.locator("#contact")).toBeInViewport({ timeout: 10_000 });
  });
});

test.describe("Legal pages", () => {
  // These are the canonical top-level routes. They must be reachable directly:
  // they are linked from the footer of every page and cited in the terms.
  for (const path of [
    "/privacy",
    "/terms",
    "/product-terms",
    "/engagement-terms",
  ]) {
    test(`${path} loads`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status(), `${path} did not return 2xx`).toBeLessThan(300);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }
});

test.describe("Contact form", () => {
  test("accepts input in every visible field", async ({ page }) => {
    await page.goto("/#contact");

    const fields: Array<[string, string]> = [
      ["#firstName", "Ada"],
      ["#lastName", "Lovelace"],
      ["#company", "Analytical Engines"],
      ["#email", "ada@example.com"],
      ["#message", "Testing the form renders and accepts input."],
    ];

    for (const [selector, value] of fields) {
      const field = page.locator(selector);
      await expect(field, `${selector} not visible`).toBeVisible();
      await field.fill(value);
      await expect(field).toHaveValue(value);
    }

    // `interest` is a select, so it is set rather than typed into.
    await expect(page.locator("#interest")).toBeVisible();
  });

  test("labels every field for assistive technology", async ({ page }) => {
    await page.goto("/#contact");
    for (const id of [
      "firstName",
      "lastName",
      "company",
      "email",
      "interest",
      "message",
    ]) {
      await expect(
        page.locator(`label[for="${id}"]`),
        `#${id} has no associated label`,
      ).toBeAttached();
    }
  });

  // Deliberately does NOT submit. A real submission on a preview build is a
  // no-op, but against a local dev server with .env.local populated it would
  // send mail and write a CRM record.
});

test.describe("Responsive rendering", () => {
  const viewports = [
    { name: "mobile", width: 375, height: 667 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1280, height: 800 },
  ];

  for (const vp of viewports) {
    test(`hero renders at ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");

      const heading = page.getByRole("heading", { level: 1 });
      await expect(heading).toBeVisible();

      // Catches the Tailwind-layer failure mode this repo has hit before:
      // when utilities lose the cascade, content overflows the viewport
      // horizontally instead of wrapping.
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(overflows, `page scrolls horizontally at ${vp.width}px`).toBe(
        false,
      );
    });
  }
});
