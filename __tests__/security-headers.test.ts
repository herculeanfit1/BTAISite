import { describe, it, expect, vi } from "vitest";

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

/**
 * The dev-only 'unsafe-eval' relaxation (added 2026-07-28).
 *
 * Next's dev bundler wraps modules in eval(); under the shipped CSP the browser
 * refused every one, so `npm run dev` rendered its server HTML and then never
 * hydrated. The relaxation is gated on NODE_ENV === "development".
 *
 * This suite exists because the gate is the whole safety property. It re-imports
 * next.config.js under each NODE_ENV rather than trusting the constant, since the
 * value is computed once at module load.
 */
describe("the dev-only unsafe-eval relaxation", () => {
  const cspFor = async (nodeEnv: string) => {
    const previous = process.env.NODE_ENV;
    // NODE_ENV is a readonly string in @types/node; assignment is intentional.
    (process.env as Record<string, string>).NODE_ENV = nodeEnv;
    vi.resetModules();
    try {
      // Plain specifier: Vite cannot resolve a templated one. vi.resetModules()
      // above is what forces re-evaluation under the new NODE_ENV.
      const mod = await import("../next.config.js");
      const rules = await mod.default.headers();
      const headers = Object.fromEntries(
        rules[0].headers.map((h: { key: string; value: string }) => [
          h.key,
          h.value,
        ]),
      );
      return headers["Content-Security-Policy"] as string;
    } finally {
      (process.env as Record<string, string>).NODE_ENV = previous as string;
      vi.resetModules();
    }
  };

  it("grants unsafe-eval to the dev server, so local development hydrates", async () => {
    expect(await cspFor("development")).toContain("'unsafe-eval'");
  });

  it("withholds it from production builds", async () => {
    expect(await cspFor("production")).not.toContain("'unsafe-eval'");
  });

  it("withholds it under the test environment too", async () => {
    // The gate was first written as `!== "production"`, which would have handed
    // the relaxation to vitest and made every other assertion in this file pass
    // against a policy no browser ever sees.
    expect(await cspFor("test")).not.toContain("'unsafe-eval'");
  });

  it("changes nothing else about the policy between dev and production", async () => {
    const dev = await cspFor("development");
    const prod = await cspFor("production");
    expect(dev.replace(" 'unsafe-eval'", "")).toBe(prod);
  });
});
