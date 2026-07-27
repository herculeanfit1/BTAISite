import { describe, it, expect } from "vitest";
import { generateAdminNotificationEmail } from "@/src/lib/api/email/templates/admin-notification";
import { generateConfirmationEmail } from "@/src/lib/api/email/templates/contact-confirmation";
import type { ContactFormData } from "@/src/lib/api/email/send-contact-email";

const XSS = "<script>alert(1)</script>";
const BREAKOUT = '"><img src=x onerror=alert(1)>';

/** A benign baseline, so a single-field test isolates that field. */
const clean: ContactFormData = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines",
  interest: "general",
  message: "I would like to discuss an engagement.",
  ipAddress: "203.0.113.10",
  userAgent: "Mozilla/5.0",
};

/** Every user-controlled field hostile at once. */
const hostile: ContactFormData = {
  firstName: XSS,
  lastName: BREAKOUT,
  email: `${BREAKOUT}@example.com`,
  company: XSS,
  interest: BREAKOUT,
  message: `${XSS}\n${BREAKOUT}`,
  ipAddress: BREAKOUT,
  userAgent: XSS,
};

/**
 * Assert structurally, by parsing, rather than by substring.
 *
 * Substring checks are wrong in both directions here. `not.toContain("onerror=")`
 * FAILS against a correct implementation, because the escaped payload survives
 * as inert text — and it also matches harmlessly inside a quoted href. What
 * actually matters is what an HTML parser builds: no script elements, no
 * injected images, no event-handler attributes anywhere in the tree.
 */
function expectNoExecutableMarkup(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");

  expect(doc.querySelectorAll("script")).toHaveLength(0);
  expect(doc.querySelectorAll("img")).toHaveLength(0);

  const handlers = Array.from(doc.querySelectorAll("*")).flatMap((el) =>
    Array.from(el.attributes)
      .filter((a) => a.name.toLowerCase().startsWith("on"))
      .map((a) => `<${el.tagName.toLowerCase()} ${a.name}>`),
  );
  expect(handlers).toEqual([]);
}

describe("admin notification template — stored HTML injection", () => {
  const html = generateAdminNotificationEmail(hostile);

  it("emits no executable markup from any field", () => {
    expectNoExecutableMarkup(html);
  });

  it("renders the payload as escaped text instead", () => {
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("&quot;&gt;&lt;img src=x onerror=alert(1)&gt;");
  });

  it("escapes every user-controlled field, including the header-derived ones", () => {
    for (const field of ["firstName", "lastName", "email", "company", "interest", "message", "ipAddress", "userAgent"] as const) {
      const only = { ...clean, [field]: XSS } as ContactFormData;
      expect(
        generateAdminNotificationEmail(only),
        `${field} reached the HTML unescaped`,
      ).not.toContain("<script>");
    }
  });

  it("does not let the email break out of the mailto: href attributes", () => {
    // Both the address link and the reply button interpolate `email` into an
    // href. A raw `"` there ends the attribute early, so the surviving href is
    // truncated to "mailto:" and the remainder becomes markup — which is
    // exactly what makes the truncation a usable detector here.
    const doc = new DOMParser().parseFromString(html, "text/html");
    const mailtos = Array.from(doc.querySelectorAll("a[href^='mailto:']"));
    expect(mailtos.length).toBe(2);

    for (const a of mailtos) {
      const href = a.getAttribute("href") ?? "";
      expect(href).toContain("@example.com");
      expect(a.attributes.length).toBeLessThanOrEqual(3); // href + style/class
    }
  });

  it("omits the company row entirely when company is absent", () => {
    const without = generateAdminNotificationEmail({ ...clean, company: undefined });
    expect(without).not.toContain("Company:");
    expect(generateAdminNotificationEmail(clean)).toContain("Company:");
  });

  it("escapes the interest label on both the mapped and fallback paths", () => {
    // The map lookup falls through to the raw slug when unmapped, and to
    // "Not specified" when absent — three paths, one of which echoes input.
    expect(generateAdminNotificationEmail({ ...clean, interest: "general" })).toContain(
      "General Inquiry",
    );
    expect(generateAdminNotificationEmail({ ...clean, interest: undefined })).toContain(
      "Not specified",
    );
    expect(
      generateAdminNotificationEmail({ ...clean, interest: XSS }),
    ).not.toContain("<script>");
  });

  it("preserves newlines via pre-wrap rather than <br />", () => {
    // .message-content is white-space: pre-wrap, so inserting <br /> would
    // double every line break. Guard the CSS contract the choice depends on.
    expect(html).toContain("white-space: pre-wrap");
    const body = generateAdminNotificationEmail({ ...clean, message: "line1\nline2" });
    expect(body).toContain("line1\nline2");
    expect(body).not.toContain("line1<br />line2");
  });
});

describe("confirmation template — stored HTML injection", () => {
  const html = generateConfirmationEmail(hostile);

  it("emits no executable markup from any field", () => {
    expectNoExecutableMarkup(html);
  });

  it("renders the payload as escaped text instead", () => {
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("converts newlines to <br />, since its container is not pre-wrap", () => {
    const body = generateConfirmationEmail({ ...clean, message: "line1\nline2" });
    expect(body).toContain("line1<br />line2");
  });
});

describe("both templates — legitimate input is not mangled", () => {
  // `message` is the only user field both templates render — the confirmation
  // email never shows company, interest, IP or user agent.
  const ordinary: ContactFormData = {
    ...clean,
    message: "We use R&D budget > $1M.",
  };

  it("escapes exactly once, so the recipient reads the original characters", () => {
    for (const html of [
      generateAdminNotificationEmail(ordinary),
      generateConfirmationEmail(ordinary),
    ]) {
      expect(html).toContain("R&amp;D budget &gt; $1M.");
      // Double-escaping would render a literal "&amp;" to the recipient.
      expect(html).not.toContain("&amp;amp;");
    }
  });
});
