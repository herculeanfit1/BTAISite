import { describe, it, expect } from "vitest";

// Replicate the CORS logic from app/api/contact/route.ts for unit testing
// (NextRequest/NextResponse aren't available in happy-dom)
const ALLOWED_ORIGINS = [
  "https://bridgingtrust.ai",
  "https://www.bridgingtrust.ai",
];

const SWA_PATTERN = /^https:\/\/[a-z0-9-]+\.azurestaticapps\.net$/;

function resolveOrigin(origin: string): string {
  const isAllowed =
    ALLOWED_ORIGINS.includes(origin) || SWA_PATTERN.test(origin);
  return isAllowed ? origin : ALLOWED_ORIGINS[0];
}

describe("Contact API CORS origin resolution", () => {
  it("allows production origin", () => {
    expect(resolveOrigin("https://bridgingtrust.ai")).toBe(
      "https://bridgingtrust.ai",
    );
  });

  it("allows www production origin", () => {
    expect(resolveOrigin("https://www.bridgingtrust.ai")).toBe(
      "https://www.bridgingtrust.ai",
    );
  });

  it("returns default origin for disallowed origin", () => {
    expect(resolveOrigin("https://evil-site.com")).toBe(
      "https://bridgingtrust.ai",
    );
  });

  it("returns default origin for empty string", () => {
    expect(resolveOrigin("")).toBe("https://bridgingtrust.ai");
  });

  it("allows Azure SWA preview URLs", () => {
    expect(
      resolveOrigin("https://lively-bush-123abc.azurestaticapps.net"),
    ).toBe("https://lively-bush-123abc.azurestaticapps.net");
  });

  it("allows Azure SWA URLs with only lowercase and hyphens", () => {
    expect(
      resolveOrigin("https://my-preview-app.azurestaticapps.net"),
    ).toBe("https://my-preview-app.azurestaticapps.net");
  });

  it("rejects Azure SWA URLs with subdomain traversal", () => {
    expect(
      resolveOrigin("https://evil.azurestaticapps.net.attacker.com"),
    ).toBe("https://bridgingtrust.ai");
  });

  it("rejects Azure SWA URLs with uppercase", () => {
    expect(
      resolveOrigin("https://EVIL.azurestaticapps.net"),
    ).toBe("https://bridgingtrust.ai");
  });

  it("rejects Azure SWA URLs with path injection", () => {
    expect(
      resolveOrigin("https://foo.azurestaticapps.net/evil"),
    ).toBe("https://bridgingtrust.ai");
  });

  it("rejects http scheme for production domain", () => {
    expect(resolveOrigin("http://bridgingtrust.ai")).toBe(
      "https://bridgingtrust.ai",
    );
  });

  it("rejects null/undefined-like origins", () => {
    expect(resolveOrigin("null")).toBe("https://bridgingtrust.ai");
  });
});
