import { describe, it, expect } from "vitest";
import { encodeClassifyMessage } from "@/src/lib/api/queue-encoding";
import { buildClassifyMessage } from "@/src/lib/api/classify-queue";

const msg = buildClassifyMessage({
  submittedAt: "2026-07-24T00:00:00.000Z",
  contactId: "123",
  noteId: "n1",
  body: {
    firstName: "A",
    lastName: "B",
    email: "a@b.co",
    message: "hello world",
    interest: "general",
  },
  inquiryTopic: "general_inquiry",
  leadPriority: "p2_warm",
  ip: "1.2.3.4",
  userAgent: "ua",
  submissionUrl: null,
});

describe("classify queue wire format (Q5)", () => {
  it("is base64 of the exact JSON serialization and round-trips", () => {
    const enc = encodeClassifyMessage(msg);
    const decoded = Buffer.from(enc, "base64").toString("utf8");
    expect(decoded).toBe(JSON.stringify(msg));
    expect(JSON.parse(decoded)).toEqual(msg);
  });

  it("is base64, not raw JSON", () => {
    const enc = encodeClassifyMessage(msg);
    expect(enc).not.toContain("{");
    expect(/^[A-Za-z0-9+/]+={0,2}$/.test(enc)).toBe(true);
  });
});
