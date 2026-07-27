import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

// Guards the production redirect map in staticwebapp.config.json.
//
// This file exists because PLAN-008 specified changes that would have made the
// privacy policy UNREACHABLE. It asked for `/privacy -> /en/privacy` while
// `/en/privacy -> /privacy` already shipped, which is an infinite redirect
// loop on a compliance-critical page — and nothing in the suite would have
// caught it before deploy.
//
// Redirects live here and ONLY here: the SWA hybrid adapter honours
// `routes[].redirect`, and next.config.js `redirects()` is ignored by it (and
// once broke the whole route map).

interface Route {
  route: string;
  redirect?: string;
  statusCode?: number;
}

const config = JSON.parse(readFileSync("staticwebapp.config.json", "utf8"));
const routes: Route[] = config.routes ?? [];
const redirects = routes.filter((r) => r.redirect);

/** Exact-match redirect lookup, mirroring how the edge resolves a literal path. */
function redirectFor(path: string): string | undefined {
  return redirects.find((r) => r.route === path)?.redirect;
}

/** Follow the chain from `start`, returning every hop visited. */
function followChain(start: string, maxHops = 10): string[] {
  const seen = [start];
  let current = start;
  for (let i = 0; i < maxHops; i++) {
    const next = redirectFor(current);
    if (!next) return seen;
    if (seen.includes(next)) {
      seen.push(next);
      return seen; // loop — caller asserts on the repeat
    }
    seen.push(next);
    current = next;
  }
  return seen;
}

describe("redirect map — structural integrity", () => {
  it("has a non-trivial number of redirects (guard against a vacuous pass)", () => {
    expect(redirects.length).toBeGreaterThan(10);
  });

  it("contains no redirect loops", () => {
    for (const r of redirects) {
      const chain = followChain(r.route);
      const unique = new Set(chain);
      expect(
        unique.size,
        `redirect loop: ${chain.join(" -> ")}`,
      ).toBe(chain.length);
    }
  });

  it("proves the loop detector actually detects a loop", () => {
    // Without this, a broken follower would make the test above pass blindly.
    const loopy = [
      { route: "/a", redirect: "/b" },
      { route: "/b", redirect: "/a" },
    ];
    const find = (p: string) => loopy.find((r) => r.route === p)?.redirect;
    const seen = ["/a"];
    let cur = "/a";
    for (let i = 0; i < 5; i++) {
      const next = find(cur);
      if (!next) break;
      if (seen.includes(next)) {
        seen.push(next);
        break;
      }
      seen.push(next);
      cur = next;
    }
    expect(new Set(seen).size).not.toBe(seen.length);
  });

  it("never redirects to a path that is itself redirected", () => {
    // Every hop costs a round trip, and chains are how loops start.
    for (const r of redirects) {
      expect(
        redirectFor(r.redirect!),
        `${r.route} -> ${r.redirect} -> ${redirectFor(r.redirect!)} is a chained redirect`,
      ).toBeUndefined();
    }
  });

  it("uses 301 for every redirect", () => {
    for (const r of redirects) {
      expect(r.statusCode, `${r.route} is not a 301`).toBe(301);
    }
  });
});

describe("canonical direction — top-level wins, locales redirect to it", () => {
  const legal = ["privacy", "terms", "product-terms", "engagement-terms"];

  it("redirects every locale legal page to its top-level canonical", () => {
    for (const locale of ["en", "es", "fr"]) {
      for (const page of legal) {
        const from = `/${locale}/${page}`;
        if (!redirectFor(from)) continue; // not all combinations are declared
        expect(redirectFor(from), from).toBe(`/${page}`);
      }
    }
  });

  it("does NOT redirect the canonical top-level legal pages anywhere", () => {
    // This is the assertion that fails if anyone re-implements PLAN-008 step 6.
    for (const page of legal) {
      expect(
        redirectFor(`/${page}`),
        `/${page} must serve content, not redirect — PLAN-008 proposed pointing it at ` +
          `/en/${page}, which already redirects back here, making the page unreachable`,
      ).toBeUndefined();
    }
  });

  it("sends bare locale roots to the homepage", () => {
    for (const locale of ["en", "es", "fr"]) {
      if (!redirectFor(`/${locale}`)) continue;
      expect(redirectFor(`/${locale}`)).toBe("/");
    }
  });
});

describe("internal links point at canonical paths", () => {
  // PLAN-008 step 7 asked for these to be rewritten to /en/privacy and
  // /en/terms. Those 301 straight back, so every internal click would have
  // cost a redirect — and with step 6 applied, would not have resolved at all.
  const files = [
    "app/components/Footer.tsx",
    "app/components/CookieConsent.tsx",
    "app/components/legal/ProductTermsContent.tsx",
    "app/components/legal/EngagementTermsContent.tsx",
  ];

  it("links to no path that the edge redirects", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      for (const m of src.matchAll(/href=["']([^"'#?]+)["']/g)) {
        const href = m[1];
        if (!href.startsWith("/")) continue;
        if (redirectFor(href)) offenders.push(`${file}: ${href} -> ${redirectFor(href)}`);
      }
    }
    expect(offenders, offenders.join("; ")).toEqual([]);
  });

  it("the cookie banner's privacy link resolves to real content", () => {
    // A broken privacy link is a compliance defect, not a cosmetic one.
    const src = readFileSync("app/components/CookieConsent.tsx", "utf8");
    expect(src).toContain('href="/privacy"');
    expect(redirectFor("/privacy")).toBeUndefined();
  });
});
