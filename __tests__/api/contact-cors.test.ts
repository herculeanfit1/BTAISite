import { describe, it, expect } from "vitest";
import { resolveCorsOrigin, corsHeaders } from "@/src/lib/api/cors";

// Exercises the real CORS resolver used by app/api/contact/route.ts.
//
// These assertions were rewritten deliberately by PLAN-009. They previously
// locked two behaviours that have now changed:
//
//   1. A disallowed origin used to resolve to "https://bridgingtrust.ai" — a
//      header asserting an origin that was not the caller's. It now resolves to
//      null and the header is omitted.
//   2. Any `*.azurestaticapps.net` origin used to be allowed. That wildcard is
//      gone; the tests below pin down why it was never load-bearing.

describe("Contact API CORS origin resolution", () => {
  it("allows production origin", () => {
    expect(resolveCorsOrigin("https://bridgingtrust.ai")).toBe(
      "https://bridgingtrust.ai",
    );
  });

  it("allows www production origin", () => {
    expect(resolveCorsOrigin("https://www.bridgingtrust.ai")).toBe(
      "https://www.bridgingtrust.ai",
    );
  });

  it("returns null for a disallowed origin rather than asserting our own", () => {
    expect(resolveCorsOrigin("https://evil-site.com")).toBeNull();
  });

  it("returns null for an empty origin", () => {
    expect(resolveCorsOrigin("")).toBeNull();
  });

  it("no longer allows an arbitrary tenant's Static Web App", () => {
    // The removed wildcard admitted every other tenant's SWA. Any stranger who
    // could deploy a static site got cross-origin access to this API.
    expect(
      resolveCorsOrigin("https://evil-attacker-site.azurestaticapps.net"),
    ).toBeNull();
    expect(
      resolveCorsOrigin("https://lively-bush-123abc.azurestaticapps.net"),
    ).toBeNull();
  });

  it("did not match even this project's own origin, which is why removing it broke nothing", () => {
    // The real hostname carries a dot the old character class excluded, so the
    // rule never once admitted the site it was written for.
    expect(
      resolveCorsOrigin("https://wonderful-bush-0e888f30f.6.azurestaticapps.net"),
    ).toBeNull();
  });

  it("rejects lookalike hosts, scheme downgrades and path injection", () => {
    for (const bad of [
      "https://evil.azurestaticapps.net.attacker.com",
      "https://EVIL.azurestaticapps.net",
      "https://foo.azurestaticapps.net/evil",
      "http://bridgingtrust.ai",
      "https://bridgingtrust.ai.attacker.com",
      "null",
    ]) {
      expect(resolveCorsOrigin(bad), bad).toBeNull();
    }
  });
});

describe("corsHeaders", () => {
  it("emits the allow-origin header only for an allowed origin", () => {
    const allowed = corsHeaders("https://bridgingtrust.ai");
    expect(allowed["Access-Control-Allow-Origin"]).toBe(
      "https://bridgingtrust.ai",
    );
  });

  it("omits the allow-origin header entirely when the origin is null", () => {
    const denied = corsHeaders(null);
    expect(denied).not.toHaveProperty("Access-Control-Allow-Origin");
  });

  it("always varies on Origin, so a denial is never cached for another caller", () => {
    for (const h of [corsHeaders("https://bridgingtrust.ai"), corsHeaders(null)]) {
      expect(h["Vary"]).toBe("Origin");
      expect(h["Access-Control-Allow-Methods"]).toBe("POST, OPTIONS");
    }
  });
});
