import { describe, it, expect } from "vitest";

import nextConfig from "../next.config.js";

/**
 * app/[locale] was scaffolding for an internationalisation that never
 * happened — /en, /es and /fr all render identical English, on URLs nothing
 * links to. These redirects collapse them onto the canonical paths.
 *
 * This suite guards the shape of that declaration. It cannot prove the Azure
 * Static Web Apps hybrid adapter honours redirects() — that is only knowable
 * from production, and the post-deployment step in cost-optimized-ci.yml
 * asserts it there.
 */
describe("locale redirects", () => {
  const getRedirects = async () => nextConfig.redirects!();

  it("declares exactly two rules, covering the bare locale and everything under it", async () => {
    const redirects = await getRedirects();
    expect(redirects).toHaveLength(2);
    expect(redirects.map((r: { source: string }) => r.source)).toEqual([
      "/:locale(en|es|fr)",
      "/:locale(en|es|fr)/:path*",
    ]);
  });

  it("sends the bare locale to the site root", async () => {
    const [bare] = await getRedirects();
    expect(bare.destination).toBe("/");
  });

  it("preserves the sub-path when stripping the locale", async () => {
    const [, nested] = await getRedirects();
    expect(nested.destination).toBe("/:path*");
  });

  it("uses 301 everywhere, matching the redirects in staticwebapp.config.json", async () => {
    const redirects = await getRedirects();
    for (const rule of redirects) {
      expect(rule.statusCode).toBe(301);
      // `permanent` would emit 308 and disagree with the SWA-level redirects.
      // Read through an index signature: the config declares statusCode only,
      // so `permanent` is absent from the inferred type and tsc rejects a
      // direct property access here.
      expect((rule as Record<string, unknown>).permanent).toBeUndefined();
    }
  });

  it("only matches the three supported locales", async () => {
    const redirects = await getRedirects();
    for (const rule of redirects) {
      expect(rule.source).toContain("(en|es|fr)");
    }

    // A bare :locale with no pattern would swallow every top-level path,
    // which is the bug that made /banana return the homepage.
    for (const rule of redirects) {
      expect(rule.source).not.toMatch(/^\/:locale(\/|$)/);
    }
  });

  it("does not disturb the security headers declared alongside it", async () => {
    const rules = await nextConfig.headers!();
    expect(rules).toHaveLength(1);
    expect(rules[0].source).toBe("/(.*)");
  });
});
