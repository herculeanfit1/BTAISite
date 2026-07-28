import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import nextConfig from "../next.config.js";

/**
 * Keeps the published privacy policy honest about which third parties actually
 * receive visitor data.
 *
 * This exists because the policy was wrong in both directions at once
 * (found 2026-07-28):
 *
 *  - It stated "We use Google Analytics to understand how visitors use our
 *    site" and listed Google Analytics as a third-party service. **No code has
 *    loaded Google Analytics for some time.** Over-disclosure, so low risk, but
 *    a published legal document asserting something untrue.
 *  - It said nothing about Cloudflare, which serves every request to the apex
 *    and injects a Web Analytics beacon. Under-disclosure, which is the half
 *    that actually matters.
 *
 * A CSP allowlist is the closest machine-readable statement of "who may receive
 * data from this page", so these tests use it as the source of truth and
 * require the prose to agree.
 */

const privacy = readFileSync(
  "app/components/legal/PrivacyContent.tsx",
  "utf8",
);

async function cspString(): Promise<string> {
  const rules = await nextConfig.headers!();
  const headers = Object.fromEntries(
    rules[0].headers.map((h: { key: string; value: string }) => [h.key, h.value]),
  );
  return headers["Content-Security-Policy"] as string;
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((e) => {
    const full = join(dir, e);
    if (e === "node_modules" || e === ".next") return [];
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const sourceText = [...walk("app"), ...walk("src"), ...walk("lib")]
  .filter((f) => /\.(ts|tsx|js|mjs)$/.test(f))
  .filter((f) => !f.includes("legal/")) // the policy itself is prose, not code
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");

describe("privacy policy discloses what actually runs", () => {
  it("scans real files (guard against a vacuous pass)", () => {
    expect(privacy.length).toBeGreaterThan(2000);
    expect(sourceText.length).toBeGreaterThan(50_000);
  });

  it("names Cloudflare, because the CSP lets its beacon collect data", async () => {
    const allowed = (await cspString()).includes("cloudflareinsights.com");
    expect(
      allowed,
      "test assumes the beacon is allowed; if it was deliberately removed, update this test",
    ).toBe(true);
    expect(
      privacy,
      "CSP permits the Cloudflare beacon but the privacy policy never mentions Cloudflare",
    ).toMatch(/Cloudflare/);
  });

  it("does not claim Google Analytics while nothing loads it", () => {
    // gtag/dataLayer are what an actual GA integration would add. The GA hosts
    // remain in the CSP as pre-approval for deferred work; a CSP allowance is
    // permission, not usage, so it is not evidence either way.
    const gaActuallyLoads =
      /gtag\(/.test(sourceText) ||
      /googletagmanager\.com\/gtag/.test(sourceText) ||
      /dataLayer\.push/.test(sourceText);

    if (!gaActuallyLoads) {
      expect(
        privacy,
        "privacy policy claims Google Analytics, but no code loads it",
      ).not.toMatch(/Google Analytics/);
    }
  });

  it("proves those patterns can match", () => {
    expect(/Cloudflare/.test("We use Cloudflare Web Analytics")).toBe(true);
    expect(/Google Analytics/.test("We use Google Analytics to understand")).toBe(
      true,
    );
    expect(/gtag\(/.test("window.gtag('config', 'G-XXXX')")).toBe(true);
  });
});
