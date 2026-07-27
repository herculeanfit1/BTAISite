import { describe, it, expect } from "vitest";
import { escapeHtml, escapeHtmlMultiline } from "@/src/lib/api/html";

describe("escapeHtml", () => {
  it("escapes all five HTML-significant characters", () => {
    expect(escapeHtml("&")).toBe("&amp;");
    expect(escapeHtml("<")).toBe("&lt;");
    expect(escapeHtml(">")).toBe("&gt;");
    expect(escapeHtml('"')).toBe("&quot;");
    expect(escapeHtml("'")).toBe("&#39;");
  });

  it("escapes & first, so no escape sequence can be forged from input", () => {
    // If & were escaped last, the literal input "&lt;" would come out as "<".
    expect(escapeHtml("&lt;script&gt;")).toBe("&amp;lt;script&amp;gt;");
  });

  it("leaves ordinary text untouched", () => {
    expect(escapeHtml("R and D, 100% done")).toBe("R and D, 100% done");
  });

  it("is not idempotent, and is deliberately applied exactly once per sink", () => {
    // Documented, not a defect: escaping twice mangles legitimate text into
    // "&amp;lt;". Every call site escapes at the sink and only at the sink.
    expect(escapeHtml(escapeHtml("<"))).toBe("&amp;lt;");
  });
});

describe("escapeHtmlMultiline", () => {
  it("escapes, then renders newlines as <br />", () => {
    expect(escapeHtmlMultiline("line1\nline2")).toBe("line1<br />line2");
  });

  it("handles CRLF and lone CR without doubling", () => {
    expect(escapeHtmlMultiline("a\r\nb")).toBe("a<br />b");
    expect(escapeHtmlMultiline("a\rb")).toBe("a<br />b");
  });

  it("escapes markup before inserting its own", () => {
    expect(escapeHtmlMultiline("<b>x</b>\ny")).toBe(
      "&lt;b&gt;x&lt;/b&gt;<br />y",
    );
  });
});
