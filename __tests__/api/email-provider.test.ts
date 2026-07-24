import { describe, it, expect, afterEach } from "vitest";
import { getEmailProvider, isEmailTestMode } from "@/src/lib/api/email/provider";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("EmailProvider seam", () => {
  it("is in test mode when EMAIL_TEST_MODE=true", () => {
    process.env.EMAIL_TEST_MODE = "true";
    expect(isEmailTestMode()).toBe(true);
  });

  it("honours the legacy RESEND_TEST_MODE flag", () => {
    delete process.env.EMAIL_TEST_MODE;
    process.env.RESEND_TEST_MODE = "true";
    expect(isEmailTestMode()).toBe(true);
  });

  it("is not in test mode when neither flag is set", () => {
    delete process.env.EMAIL_TEST_MODE;
    delete process.env.RESEND_TEST_MODE;
    expect(isEmailTestMode()).toBe(false);
  });

  it("returns a logging no-op provider in test mode (survives provider swaps)", async () => {
    process.env.EMAIL_TEST_MODE = "true";
    const provider = getEmailProvider();
    const res = await provider.send({
      from: "a@b.co",
      to: "c@d.co",
      subject: "s",
      html: "<p>x</p>",
    });
    expect(res.id).toBe("test-mode");
  });
});
