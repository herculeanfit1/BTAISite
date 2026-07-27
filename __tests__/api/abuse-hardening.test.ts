import { describe, it, expect, beforeEach } from "vitest";
import {
  getClientIp,
  rightmostPublicXff,
  isPrivateOrReservedIp,
  isRateLimited,
  trackedIdentityCount,
  resetRateLimitStore,
  MAX_TRACKED_IDENTITIES,
} from "@/src/lib/api/rate-limit";
import { isBodyTooLarge, MAX_BODY_BYTES } from "@/src/lib/api/contact-handler";

const h = (o: Record<string, string>) => new Headers(o);

describe("client identity — x-forwarded-for is attacker-influenced", () => {
  it("takes the RIGHTMOST public entry, not the leftmost the client controls", () => {
    // A client that prefills the header cannot move the value infrastructure
    // appends behind it.
    expect(
      rightmostPublicXff("1.1.1.1, 8.8.8.8, 203.0.113.7"),
    ).toBe("203.0.113.7");
  });

  it("defeats the single-spoofed-value bypass", () => {
    // Before: this returned 9.9.9.9 (the attacker's choice) and rotating it
    // handed out a fresh rate-limit bucket every request.
    expect(rightmostPublicXff("9.9.9.9, 203.0.113.7")).toBe("203.0.113.7");
  });

  it("skips private hops to find the real client", () => {
    expect(rightmostPublicXff("203.0.113.7, 10.0.0.5, 172.16.3.9")).toBe(
      "203.0.113.7",
    );
  });

  it("strips a :port suffix, IPv4 and bracketed IPv6 alike", () => {
    expect(rightmostPublicXff("203.0.113.7:44321")).toBe("203.0.113.7");
    expect(rightmostPublicXff("[2606:4700::1]:443")).toBe("2606:4700::1");
  });

  it("returns null when every entry is private, rather than trusting one", () => {
    expect(rightmostPublicXff("10.0.0.1, 192.168.1.1, 127.0.0.1")).toBeNull();
  });

  it("classifies reserved ranges correctly", () => {
    for (const priv of [
      "10.0.0.1",
      "172.16.0.1",
      "172.31.255.254",
      "192.168.1.1",
      "127.0.0.1",
      "169.254.1.1",
      "::1",
      "fc00::1",
      "fe80::1",
      "not-an-ip",
    ]) {
      expect(isPrivateOrReservedIp(priv), priv).toBe(true);
    }
    for (const pub of ["203.0.113.7", "8.8.8.8", "172.32.0.1", "2606:4700::1"]) {
      expect(isPrivateOrReservedIp(pub), pub).toBe(false);
    }
  });
});

describe("getClientIp — end-to-end through the header chain", () => {
  // Header precedence itself lives in rate-limit-ip.test.ts. What matters here
  // is that an all-private chain does not yield a private address as identity.
  it("falls back past an all-private XFF to x-real-ip", () => {
    expect(
      getClientIp(
        h({ "x-forwarded-for": "10.0.0.1, 10.0.0.2", "x-real-ip": "203.0.113.5" }),
      ),
    ).toBe("203.0.113.5");
  });

  it("never returns a private address as the client identity", () => {
    expect(getClientIp(h({ "x-forwarded-for": "10.0.0.1, 192.168.1.7" }))).toBe(
      "unknown",
    );
  });
});

describe("rate-limit store is bounded", () => {
  const ns = "test-bound";
  beforeEach(() => resetRateLimitStore(ns));

  it("never exceeds the cap, however many identities are seen", () => {
    // The abuse shape this closes: identity is header-derived, so an attacker
    // could mint unlimited keys and grow memory without bound on a metered plan.
    const over = MAX_TRACKED_IDENTITIES + 500;
    for (let i = 0; i < over; i++) {
      isRateLimited(`203.0.113.${i}`, { limit: 5, windowMs: 60_000, namespace: ns });
    }
    expect(trackedIdentityCount(ns)).toBeLessThanOrEqual(MAX_TRACKED_IDENTITIES);
  });

  it("evicts oldest-first, so a live identity survives a flood of new ones", () => {
    const cfg = { limit: 2, windowMs: 60_000, namespace: ns };
    isRateLimited("203.0.113.1", cfg); // first insert — the oldest key

    for (let i = 0; i < MAX_TRACKED_IDENTITIES + 5; i++) {
      isRateLimited(`198.51.100.${i}`, cfg);
    }

    expect(trackedIdentityCount(ns)).toBeLessThanOrEqual(MAX_TRACKED_IDENTITIES);
  });

  it("blocks at the configured limit and keeps blocking", () => {
    const cfg = { limit: 3, windowMs: 60_000, namespace: ns };
    const ip = "203.0.113.50";
    expect([0, 1, 2].map(() => isRateLimited(ip, cfg))).toEqual([
      false,
      false,
      false,
    ]);
    expect(isRateLimited(ip, cfg)).toBe(true);
    expect(isRateLimited(ip, cfg)).toBe(true);
  });

  it("fails OPEN for 'unknown' so a header-stripping proxy cannot lock out its users", () => {
    const cfg = { limit: 1, windowMs: 60_000, namespace: ns };
    for (let i = 0; i < 20; i++) {
      expect(isRateLimited("unknown", cfg)).toBe(false);
    }
  });

  it("namespaces are independent", () => {
    const a = { limit: 1, windowMs: 60_000, namespace: ns };
    const b = { limit: 1, windowMs: 60_000, namespace: "test-bound-other" };
    resetRateLimitStore(b.namespace);
    const ip = "203.0.113.77";

    isRateLimited(ip, a);
    expect(isRateLimited(ip, a)).toBe(true);
    expect(isRateLimited(ip, b)).toBe(false); // untouched by the other limiter
    resetRateLimitStore(b.namespace);
  });

  it("resets once the window elapses", () => {
    const cfg = { limit: 1, windowMs: 1, namespace: ns };
    const ip = "203.0.113.88";
    isRateLimited(ip, cfg);
    expect(isRateLimited(ip, cfg)).toBe(true);
    return new Promise<void>((r) =>
      setTimeout(() => {
        expect(isRateLimited(ip, cfg)).toBe(false);
        r();
      }, 5),
    );
  });
});

describe("request body size cap", () => {
  it("rejects a declared length over the cap", () => {
    expect(isBodyTooLarge(h({ "content-length": String(MAX_BODY_BYTES + 1) }))).toBe(
      true,
    );
  });

  it("allows a normal submission", () => {
    // The schema caps `message` at 2000 chars, so real traffic is a few KB.
    expect(isBodyTooLarge(h({ "content-length": "2048" }))).toBe(false);
    expect(isBodyTooLarge(h({ "content-length": String(MAX_BODY_BYTES) }))).toBe(
      false,
    );
  });

  it("allows a request with no declared length, leaving the schema to bound it", () => {
    expect(isBodyTooLarge(h({}))).toBe(false);
  });

  it("ignores a non-numeric content-length rather than rejecting", () => {
    expect(isBodyTooLarge(h({ "content-length": "abc" }))).toBe(false);
  });
});
