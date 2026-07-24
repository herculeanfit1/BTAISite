import { describe, it, expect } from "vitest";
import { getClientIp } from "@/src/lib/api/rate-limit";

const h = (o: Record<string, string>) => new Headers(o);

describe("getClientIp", () => {
  it("prefers the trusted cf-connecting-ip over x-forwarded-for", () => {
    expect(
      getClientIp(h({ "cf-connecting-ip": "1.2.3.4", "x-forwarded-for": "9.9.9.9" })),
    ).toBe("1.2.3.4");
  });

  it("falls back to the first x-forwarded-for entry, stripping the port", () => {
    expect(
      getClientIp(h({ "x-forwarded-for": "50.249.109.195:56302, 40.70.146.136:53724" })),
    ).toBe("50.249.109.195");
  });

  it("keeps a clean (port-less) x-forwarded-for ip", () => {
    expect(
      getClientIp(h({ "x-forwarded-for": "50.249.109.195, 104.22.64.69" })),
    ).toBe("50.249.109.195");
  });

  it("falls back to x-real-ip", () => {
    expect(getClientIp(h({ "x-real-ip": "8.8.8.8" }))).toBe("8.8.8.8");
  });

  it("returns 'unknown' when no client-ip headers are present", () => {
    expect(getClientIp(h({}))).toBe("unknown");
  });
});
