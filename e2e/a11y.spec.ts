import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Result } from "axe-core";

/**
 * Automated accessibility checks (PLAN-013 Part 3).
 *
 * Scope honestly stated: axe finds roughly a third of WCAG issues. A green run
 * here means "no machine-detectable critical or serious violation", not "this
 * site is accessible". Keyboard traps, focus order, and whether alt text is
 * *meaningful* rather than merely present all need a human.
 *
 * The bar is zero `critical` and zero `serious`. `moderate` and `minor` are
 * reported in the failure message when a test fails but do not fail the run on
 * their own -- a gate nobody can get to green gets deleted, and this is the
 * first accessibility gate this repo has ever had.
 */

const PAGES = [
  { path: "/", name: "homepage" },
  { path: "/privacy", name: "privacy policy" },
  { path: "/terms", name: "terms" },
  { path: "/product-terms", name: "product terms" },
  { path: "/engagement-terms", name: "engagement terms" },
];

const BLOCKING = new Set(["critical", "serious"]);

/**
 * Wait for entrance animations to finish, then freeze what remains.
 *
 * Necessary, not tidiness. Scanning mid-fade reproduced about one run in three,
 * on a different browser each time, and passed on every re-run in isolation.
 * The captured failure was the hero CTA at
 * `foreground #192736 on background #1a2937 -- 1.02:1`: two near-identical
 * darks, because at partial opacity both the element's text and its background
 * resolve to blends of the page behind it. That pair is shown to nobody.
 *
 * Two mechanisms, so two fixes:
 *
 *  - **Framer Motion writes inline `style="opacity: …"` from rAF.** CSS cannot
 *    stop it and `emulateMedia({ reducedMotion })` does not either -- Motion's
 *    `reducedMotion="user"` suppresses transform and layout animations but
 *    deliberately keeps opacity fades, which are considered vestibular-safe.
 *    So wait for every inline opacity to reach a settled 0 or 1.
 *  - **CSS `transition-*` utilities** on theme change, which the stylesheet
 *    below kills.
 *
 * Only *inline* opacity is polled. A permanent fractional opacity set by a
 * utility class -- the contact form's disabled submit is `opacity-85` -- must
 * not be mistaken for an animation in flight.
 */
async function settleAndFreeze(page: Page) {
  await page.waitForFunction(
    () =>
      Array.from(document.querySelectorAll<HTMLElement>('[style*="opacity"]')).every(
        (el) => {
          const v = el.style.opacity;
          return v === "" || v === "1" || v === "0";
        },
      ),
    undefined,
    { timeout: 15_000 },
  );

  await page.addStyleTag({
    content: `*, *::before, *::after {
      transition: none !important;
      animation: none !important;
      scroll-behavior: auto !important;
    }`,
  });
}

function summarise(violations: Result[]): string {
  if (violations.length === 0) return "none";
  return violations
    .map((v) => {
      // Include each node's own message, not just its selector. Without it a
      // contrast failure tells you *where* but not which two colours, which is
      // the only part you can act on.
      const where = v.nodes
        .slice(0, 5)
        .map(
          (n) =>
            `${n.target.join(" ")}\n        ${(n.any?.[0]?.message ?? n.failureSummary ?? "")
              .replace(/\s+/g, " ")
              .slice(0, 200)}\n        ${n.html.replace(/\s+/g, " ").slice(0, 160)}`,
        )
        .join("\n      ");
      return `  [${v.impact}] ${v.id} — ${v.help} (${v.nodes.length} node${
        v.nodes.length === 1 ? "" : "s"
      })\n      ${where}\n      ${v.helpUrl}`;
    })
    .join("\n");
}

for (const { path, name } of PAGES) {
  test(`${name} (${path}) has no critical or serious violations`, async ({
    page,
  }) => {
    // reducedMotion is set for fidelity with how a motion-sensitive visitor
    // sees the page; it is NOT what makes this deterministic. See
    // settleAndFreeze -- `networkidle` does not wait for animations, and
    // Framer Motion's opacity fades ignore the reduced-motion preference.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await settleAndFreeze(page);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    // Guard against a vacuous pass: axe must actually have examined something.
    // A misconfigured builder returns zero violations and zero passes, which is
    // indistinguishable from a clean page.
    expect(
      results.passes.length,
      "axe reported no passing checks either — it scanned nothing",
    ).toBeGreaterThan(0);

    const blocking = results.violations.filter((v) =>
      BLOCKING.has(v.impact ?? ""),
    );
    const advisory = results.violations.filter(
      (v) => !BLOCKING.has(v.impact ?? ""),
    );

    // Compare rule IDs, not the violation objects: `toEqual([])` against the
    // raw axe output prints a multi-hundred-line diff that buries the message.
    expect(
      blocking.map((v) => v.id),
      `\n${blocking.length} blocking violation(s) on ${path}:\n${summarise(
        blocking,
      )}\n\nAdvisory (not failing this test):\n${summarise(advisory)}\n`,
    ).toEqual([]);
  });
}

test("dark mode has no critical or serious violations", async ({ page }) => {
  // Dark mode is a separate colour system, so it is a separate contrast
  // surface. Testing only the light theme leaves half the site unchecked.
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  // After the reload, so the injected stylesheet survives into the scan.
  await settleAndFreeze(page);

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(results.passes.length).toBeGreaterThan(0);

  const blocking = results.violations.filter((v) =>
    BLOCKING.has(v.impact ?? ""),
  );
  expect(
    blocking.map((v) => v.id),
    `\n${blocking.length} blocking violation(s) in dark mode:\n${summarise(
      blocking,
    )}\n`,
  ).toEqual([]);
});
