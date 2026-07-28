import { test, expect, type Page } from "@playwright/test";

/**
 * Theme toggle behaviour.
 *
 * Rewritten 2026-07-28, on the suite's first actual execution. The previous
 * version had never run -- Playwright's webServer could not reach the app --
 * and it had drifted in two directions at once:
 *
 *   - Five tests ended in `expect(typeof isDark).toBe("boolean")`, which is
 *     true for every possible value. They asserted nothing and would have
 *     reported green against a toggle that did nothing at all.
 *   - Others asserted Tailwind class strings (`dark:bg-gray-900/98`,
 *     `transition-all`, `duration-200`, `opacity-100`) and a two-icon DOM that
 *     `ThemeToggle` does not render -- it swaps a single `<svg>` via a ternary.
 *     Those assert the implementation, break on any refactor, and still do not
 *     tell you whether the page went dark.
 *
 * These test what a visitor experiences: the rendered colours change, the
 * choice survives a reload, and the control is operable by keyboard.
 *
 * `defaultTheme` is "system" with `enableSystem`, so every test pins the
 * colour scheme and clears persisted state first. Without that the starting
 * theme depends on the machine running the tests.
 */

const TOGGLE = "dark-mode-toggle";

async function startInLightMode(page: Page) {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await page.waitForLoadState("networkidle");
  // ThemeToggle renders a placeholder div until mounted; wait for the real one.
  await expect(page.getByTestId(TOGGLE)).toBeVisible();
  await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
}

test.describe("Theme toggle", () => {
  test.beforeEach(async ({ page }) => {
    await startInLightMode(page);
  });

  test("switches to dark and back", async ({ page }) => {
    const toggle = page.getByTestId(TOGGLE);

    await toggle.click();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    await toggle.click();
    await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
  });

  test("actually changes the rendered page colours", async ({ page }) => {
    // The point of the feature. A class on <html> that no stylesheet responds
    // to would satisfy every other test in this file.
    const body = page.locator("body");
    const before = await body.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );

    await page.getByTestId(TOGGLE).click();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    const after = await body.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(after, "body background did not change with the theme").not.toBe(
      before,
    );
  });

  test("swaps the icon", async ({ page }) => {
    const toggle = page.getByTestId(TOGGLE);
    // One <svg> at a time, chosen by a ternary -- so identity is the path data.
    const pathBefore = await toggle.locator("svg path").first().getAttribute("d");

    await toggle.click();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    const pathAfter = await toggle.locator("svg path").first().getAttribute("d");
    expect(pathAfter, "icon did not change with the theme").not.toBe(pathBefore);
  });

  test("keeps its accessible name in step with the current state", async ({
    page,
  }) => {
    const toggle = page.getByTestId(TOGGLE);
    await expect(toggle).toHaveAttribute("aria-label", "Switch to dark mode");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-label", "Switch to light mode");
  });

  test("persists the choice across a reload", async ({ page }) => {
    await page.getByTestId(TOGGLE).click();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(
      page.locator("html"),
      "theme did not survive a reload",
    ).toHaveClass(/\bdark\b/);
  });

  test("is operable by keyboard", async ({ page }) => {
    const toggle = page.getByTestId(TOGGLE);
    await toggle.focus();
    await expect(toggle).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(
      page.locator("html"),
      "Enter on the focused toggle did not change the theme",
    ).toHaveClass(/\bdark\b/);

    await page.keyboard.press("Space");
    await expect(
      page.locator("html"),
      "Space on the focused toggle did not change the theme",
    ).not.toHaveClass(/\bdark\b/);
  });

  test("settles deterministically after rapid clicks", async ({ page }) => {
    const toggle = page.getByTestId(TOGGLE);
    // An even number of clicks from light must end light. The old version
    // clicked four times and then asserted the result was a boolean.
    for (let i = 0; i < 4; i++) {
      await toggle.click();
    }
    await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);

    await toggle.click();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  });

  test("does not shift layout when toggled", async ({ page }) => {
    const toggle = page.getByTestId(TOGGLE);
    const before = await toggle.boundingBox();

    await toggle.click();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    const after = await toggle.boundingBox();
    expect(after).toEqual(before);
  });

  test("works on a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const toggle = page.getByTestId(TOGGLE).first();
    await expect(toggle).toBeVisible();

    await toggle.click();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  });
});

test.describe("System colour-scheme preference", () => {
  // `defaultTheme="system"` + `enableSystem`, so with nothing persisted the OS
  // preference decides. Emulated rather than mocked: the old version replaced
  // window.matchMedia wholesale, which next-themes reads before the init script
  // could see it, and then asserted only that the result was a boolean.
  test("starts dark when the browser prefers dark", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  });

  test("starts light when the browser prefers light", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
  });

  test("an explicit choice overrides the system preference", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    await page.getByTestId(TOGGLE).click();
    await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);

    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(
      page.locator("html"),
      "explicit light choice was lost to the system preference",
    ).not.toHaveClass(/\bdark\b/);
  });
});

test.describe("Toggle accessibility", () => {
  test("is a real button with an accessible name", async ({ page }) => {
    await startInLightMode(page);
    const toggle = page.getByTestId(TOGGLE);

    // The old version asserted `role="button"` as an *attribute*. <button>
    // carries that role implicitly and sets no such attribute, so the test
    // failed against correct markup. Query by role instead.
    await expect(
      page.getByRole("button", { name: "Switch to dark mode" }),
    ).toBeVisible();

    await expect(toggle).toBeEnabled();
    await toggle.focus();
    await expect(toggle).toBeFocused();
  });
});
