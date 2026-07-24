import { describe, it, expect } from "vitest";
import { contactFormSchema } from "@/src/lib/api/contact-schema";

const base = {
  firstName: "A",
  lastName: "B",
  email: "a@b.co",
  message: "1234567890",
};

describe("contactFormSchema", () => {
  it("accepts a valid submission", () => {
    expect(contactFormSchema.safeParse(base).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(contactFormSchema.safeParse({ ...base, email: "nope" }).success).toBe(
      false,
    );
  });

  it("rejects a too-short message", () => {
    expect(
      contactFormSchema.safeParse({ ...base, message: "short" }).success,
    ).toBe(false);
  });

  it("accepts every allowed interest value, including empty", () => {
    for (const interest of [
      "governance-assessment",
      "data-readiness",
      "copilot-readiness",
      "general",
      "",
    ]) {
      expect(
        contactFormSchema.safeParse({ ...base, interest }).success,
      ).toBe(true);
    }
  });

  it("rejects an interest value outside the enum", () => {
    expect(
      contactFormSchema.safeParse({ ...base, interest: "training" }).success,
    ).toBe(false);
  });

  it("allows an empty honeypot field", () => {
    expect(
      contactFormSchema.safeParse({ ...base, _gotcha: "" }).success,
    ).toBe(true);
  });
});
