import { describe, it, expect } from "vitest";
import { contactFormSchema } from "@/src/lib/api/contact-schema";
import { INTEREST_TO_INQUIRY_TOPIC } from "@/src/lib/api/hubspot";

const base = {
  firstName: "A",
  lastName: "B",
  email: "a@b.co",
  message: "1234567890",
};

// The §7 Strategy / Build / Operate taxonomy — the only values the form emits.
const CURRENT_INTERESTS = [
  "strategy-design",
  "custom-development",
  "deployment-operations",
  "general",
];

// Retired pre-§7 slugs, still accepted so a visitor holding a pre-cutover JS
// bundle is not answered with a 400 and a silently lost lead.
const RETIRED_INTERESTS = [
  "governance-assessment",
  "data-readiness",
  "copilot-readiness",
];

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

  it("accepts every current interest value, including empty", () => {
    for (const interest of [...CURRENT_INTERESTS, ""]) {
      expect(
        contactFormSchema.safeParse({ ...base, interest }).success,
      ).toBe(true);
    }
  });

  it("still accepts the retired pre-cutover slugs", () => {
    for (const interest of RETIRED_INTERESTS) {
      expect(
        contactFormSchema.safeParse({ ...base, interest }).success,
      ).toBe(true);
    }
  });

  it("maps every accepted non-empty interest to a HubSpot inquiry_topic", () => {
    // An accepted form value with no mapping never sets inquiry_topic — the
    // exact defect class §7 was opened to fix. Derived from the schema rather
    // than a hand-written list so the two cannot drift apart.
    const accepted = contactFormSchema.shape.interest.unwrap()
      .options as readonly string[];
    // Guard against the loop below passing vacuously if introspection breaks.
    expect(accepted).toEqual(expect.arrayContaining(CURRENT_INTERESTS));
    for (const value of accepted.filter((v) => v !== "")) {
      expect(
        INTEREST_TO_INQUIRY_TOPIC[value],
        `no inquiry_topic mapping for "${value}"`,
      ).toBeTruthy();
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
