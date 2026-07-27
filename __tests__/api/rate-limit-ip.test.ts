import { describe, it, expect } from "vitest";
import { getClientIp } from "@/src/lib/api/rate-limit";

// Header precedence for client identity. The XFF expectations here were
// inverted deliberately by PLAN-009: this file used to assert that the FIRST
// entry wins, which is the entry a client can prefill. See
// abuse-hardening.test.ts for the parsing rules and the bypass they close.
//
// Fixtures use RFC 5737 documentation ranges (192.0.2.0/24, 198.51.100.0/24,
// 203.0.113.0/24). They previously used addresses captured from a production
// trace, including one in a residential range — real client IPs are personal
// data and this repo is public.

const h = (o: Record<string, string>) => new Headers(o);

describe("getClientIp", () => {
  it("prefers the trusted cf-connecting-ip over x-forwarded-for", () => {
    expect(
      getClientIp(
        h({ "cf-connecting-ip": "192.0.2.4", "x-forwarded-for": "203.0.113.9" }),
      ),
    ).toBe("192.0.2.4");
  });

  it("takes the LAST x-forwarded-for entry, stripping the port", () => {
    expect(
      getClientIp(h({ "x-forwarded-for": "192.0.2.10:56302, 198.51.100.20:53724" })),
    ).toBe("198.51.100.20");
  });

  it("keeps a clean (port-less) x-forwarded-for ip", () => {
    expect(
      getClientIp(h({ "x-forwarded-for": "192.0.2.10, 198.51.100.20" })),
    ).toBe("198.51.100.20");
  });

  it("handles a single-entry chain", () => {
    expect(getClientIp(h({ "x-forwarded-for": "198.51.100.20" }))).toBe(
      "198.51.100.20",
    );
  });

  it("falls back to x-real-ip", () => {
    expect(getClientIp(h({ "x-real-ip": "192.0.2.8" }))).toBe("192.0.2.8");
  });

  it("returns 'unknown' when no client-ip headers are present", () => {
    expect(getClientIp(h({}))).toBe("unknown");
  });
});
