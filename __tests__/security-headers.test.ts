import { describe, it, expect } from "vitest";

import nextConfig from "../next.config.js";

/**
 * Security headers used to be the middleware's job. They never actually
 * shipped: the middleware did not execute in the Azure Static Web Apps
 * Next.js hybrid runtime, and staticwebapp.config.json's globalHeaders were
 * silently ignored by the same adapter, so production served no CSP at all.
 *
 * They are now declared in next.config.js headers(). This suite guards that
 * declaration so the headers cannot be silently dropped or quietly widened
 * again.
 */
describe("security headers", () => {
  const getHeaders = async () => {
    const rules = await nextConfig.headers!();
    expect(rules).toHaveLength(1);
    expect(rules[0].source).toBe("/(.*)");
    return Object.fromEntries(
      rules[0].headers.map((h: { key: string; value: string }) => [
        h.key,
        h.value,
      ]),
    );
  };

  it("declares a Content-Security-Policy", async () => {
    const headers = await getHeaders();
    expect(headers["Content-Security-Policy"]).toBeDefined();
  });

  it("carries the companion security headers", async () => {
    const headers = await getHeaders();
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Permissions-Policy"]).toContain("geolocation=()");
  });

  it("locks down the directives that should never be loosened", async () => {
    const csp = (await getHeaders())["Content-Security-Policy"];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
  });

  it("never allows unsafe-eval, and keeps unsafe-inline out of default-src", async () => {
    const csp = (await getHeaders())["Content-Security-Policy"];
    expect(csp).not.toContain("'unsafe-eval'");
    // 'unsafe-inline' is a known, documented relaxation on script-src and
    // style-src only — it must not leak into default-src.
    const defaultSrc = csp.split(";").find((d) => d.trim().startsWith("default-src"));
    expect(defaultSrc).not.toContain("'unsafe-inline'");
  });

  it("does not emit HSTS, which the hosting platform already sets", async () => {
    const headers = await getHeaders();
    expect(headers["Strict-Transport-Security"]).toBeUndefined();
  });
});
