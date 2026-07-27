import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Dual delivery plus the two protective mechanisms in front of it. Both keep
// module-level state, so every test re-imports the module through
// vi.resetModules() to get a fresh store.
//
// NOTE: no threshold, window or cooldown value is written down in this file.
// The repo is public and those are anti-abuse tunables; a test that asserts
// "the 6th request is blocked" publishes the number to stay under. These tests
// drive the behaviour until it flips instead, so they keep passing if the
// tunables change and never restate them.

const send = vi.fn();
const isEmailTestMode = vi.fn(() => false);

vi.mock("@/src/lib/api/email/provider", () => ({
  getEmailProvider: () => ({ send }),
  isEmailTestMode,
}));

const data = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  message: "I would like to discuss an engagement.",
  ipAddress: "203.0.113.10",
};

/** Fresh module instance — resets rateLimitStore and circuitBreakerState. */
async function freshModule() {
  vi.resetModules();
  return import("@/src/lib/api/email/send-contact-email");
}

/** Guard so a behaviour change can never turn these loops into infinite ones. */
const MAX_ATTEMPTS = 50;

beforeEach(() => {
  vi.clearAllMocks();
  send.mockResolvedValue({ id: "m1" });
  isEmailTestMode.mockReturnValue(false);
  process.env.RESEND_API_KEY = "test-key";
});

afterEach(() => {
  delete process.env.RESEND_API_KEY;
});

describe("sendContactEmail — dual delivery", () => {
  it("sends the confirmation first, then the admin notification", async () => {
    const { sendContactEmail } = await freshModule();

    const result = await sendContactEmail(data);

    expect(result.success).toBe(true);
    expect(send).toHaveBeenCalledTimes(2);

    const [confirmation, adminNotification] = send.mock.calls.map((c) => c[0]);
    expect(confirmation.to).toBe(data.email);
    expect(adminNotification.to).not.toBe(data.email);
    expect(adminNotification.cc).toBeTruthy();
    expect(adminNotification.subject).toContain("Ada Lovelace");
  });

  it("does not send the admin notification if the confirmation fails", async () => {
    // Sequential, not parallel. Locking current behaviour: a submitter whose
    // confirmation bounces produces no admin copy either, so the lead is lost
    // silently rather than half-delivered.
    send.mockRejectedValueOnce(new Error("provider down"));
    const { sendContactEmail } = await freshModule();

    const result = await sendContactEmail(data);

    expect(result.success).toBe(false);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("reports failure without throwing when the provider rejects", async () => {
    send.mockRejectedValue(new Error("provider down"));
    const { sendContactEmail } = await freshModule();

    await expect(sendContactEmail(data)).resolves.toMatchObject({
      success: false,
    });
  });
});

describe("sendContactEmail — rate limiting", () => {
  it("eventually blocks repeated submissions from one IP", async () => {
    const { sendContactEmail } = await freshModule();

    let blocked = null;
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const r = await sendContactEmail(data);
      if (r.rateLimited) {
        blocked = r;
        break;
      }
    }

    expect(blocked, "never rate limited within a sane bound").not.toBeNull();
    expect(blocked!.success).toBe(false);
    expect(blocked!.message).toMatch(/rate limit/i);
  });

  it("keys the limit per IP, so one sender cannot block another", async () => {
    const { sendContactEmail } = await freshModule();

    let i = 0;
    for (; i < MAX_ATTEMPTS; i++) {
      const r = await sendContactEmail(data);
      if (r.rateLimited) break;
    }
    expect(i).toBeLessThan(MAX_ATTEMPTS);

    const other = await sendContactEmail({ ...data, ipAddress: "203.0.113.99" });
    expect(other.rateLimited).toBeFalsy();
  });

  it("does not rate limit when no IP could be determined", async () => {
    const { sendContactEmail } = await freshModule();

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const r = await sendContactEmail({ ...data, ipAddress: undefined });
      expect(r.rateLimited).toBeFalsy();
    }
  });
});

describe("sendContactEmail — circuit breaker", () => {
  it("opens after sustained provider failure and stops calling the provider", async () => {
    send.mockRejectedValue(new Error("provider down"));
    const { sendContactEmail } = await freshModule();

    let opened = null;
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      // Vary the IP so the rate limiter cannot mask the breaker.
      const r = await sendContactEmail({ ...data, ipAddress: `203.0.113.${i}` });
      if (r.circuitBreakerOpen) {
        opened = r;
        break;
      }
    }

    expect(opened, "breaker never opened within a sane bound").not.toBeNull();
    expect(opened!.success).toBe(false);

    // Once open it must short-circuit rather than hammer a failing provider.
    const callsBefore = send.mock.calls.length;
    await sendContactEmail({ ...data, ipAddress: "203.0.113.200" });
    expect(send.mock.calls.length).toBe(callsBefore);
  });

  it("stays closed while sends succeed", async () => {
    const { sendContactEmail } = await freshModule();

    for (let i = 0; i < 10; i++) {
      const r = await sendContactEmail({ ...data, ipAddress: `203.0.113.${i}` });
      expect(r.circuitBreakerOpen).toBeFalsy();
    }
  });
});

describe("isEmailConfigured", () => {
  it("is false with no API key and no test mode — the preview case", async () => {
    delete process.env.RESEND_API_KEY;
    const { isEmailConfigured } = await freshModule();

    expect(isEmailConfigured()).toBe(false);
  });

  it("is true in test mode even without an API key", async () => {
    delete process.env.RESEND_API_KEY;
    isEmailTestMode.mockReturnValue(true);
    const { isEmailConfigured } = await freshModule();

    expect(isEmailConfigured()).toBe(true);
  });

  it("returns the service-unavailable shape rather than throwing in previews", async () => {
    // Key Vault references do not resolve in preview environments, so the key
    // is absent there. This must surface as the existing 503 shape.
    delete process.env.RESEND_API_KEY;
    const { sendContactEmail } = await freshModule();

    const result = await sendContactEmail(data);

    expect(result.success).toBe(false);
    expect(result.circuitBreakerOpen).toBe(true);
    expect(send).not.toHaveBeenCalled();
  });
});
