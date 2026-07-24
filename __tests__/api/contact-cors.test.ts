import { describe, it, expect } from "vitest";
import { resolveCorsOrigin } from "@/src/lib/api/cors";

// Exercises the real CORS resolver used by app/api/contact/route.ts.

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

  it("returns default origin for disallowed origin", () => {
    expect(resolveCorsOrigin("https://evil-site.com")).toBe(
      "https://bridgingtrust.ai",
    );
  });

  it("returns default origin for empty string", () => {
    expect(resolveCorsOrigin("")).toBe("https://bridgingtrust.ai");
  });

  it("allows Azure SWA preview URLs", () => {
    expect(
      resolveCorsOrigin("https://lively-bush-123abc.azurestaticapps.net"),
    ).toBe("https://lively-bush-123abc.azurestaticapps.net");
  });

  it("allows Azure SWA URLs with only lowercase and hyphens", () => {
    expect(
      resolveCorsOrigin("https://my-preview-app.azurestaticapps.net"),
    ).toBe("https://my-preview-app.azurestaticapps.net");
  });

  it("rejects Azure SWA URLs with subdomain traversal", () => {
    expect(
      resolveCorsOrigin("https://evil.azurestaticapps.net.attacker.com"),
    ).toBe("https://bridgingtrust.ai");
  });

  it("rejects Azure SWA URLs with uppercase", () => {
    expect(resolveCorsOrigin("https://EVIL.azurestaticapps.net")).toBe(
      "https://bridgingtrust.ai",
    );
  });

  it("rejects Azure SWA URLs with path injection", () => {
    expect(resolveCorsOrigin("https://foo.azurestaticapps.net/evil")).toBe(
      "https://bridgingtrust.ai",
    );
  });

  it("rejects http scheme for production domain", () => {
    expect(resolveCorsOrigin("http://bridgingtrust.ai")).toBe(
      "https://bridgingtrust.ai",
    );
  });

  it("rejects null/undefined-like origins", () => {
    expect(resolveCorsOrigin("null")).toBe("https://bridgingtrust.ai");
  });
});
