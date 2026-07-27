import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// resend-provider is the only file permitted to import the Resend SDK. The
// behaviour worth locking is the error check: the SDK reports API failures in
// `error` rather than throwing, and the original Functions code awaited send()
// without checking it — reporting success on rejected sends, a silent
// lead-loss path.

const send = vi.fn();
const ctor = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    constructor(key: string) {
      ctor(key);
    }
    emails = { send };
  },
}));

const message = {
  from: "hello@bridgingtrust.ai",
  to: "ada@example.com",
  subject: "Subject",
  html: "<p>Body</p>",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules(); // the SDK client is memoised at module scope
  process.env.RESEND_API_KEY = "test-key";
});

afterEach(() => {
  delete process.env.RESEND_API_KEY;
});

describe("resend provider", () => {
  it("returns the message id on success", async () => {
    send.mockResolvedValueOnce({ data: { id: "m1" }, error: null });
    const { getResendProvider } = await import(
      "@/src/lib/api/email/resend-provider"
    );

    await expect(getResendProvider().send(message)).resolves.toEqual({
      id: "m1",
    });
  });

  it("throws when the SDK reports an error instead of throwing one", async () => {
    send.mockResolvedValueOnce({
      data: null,
      error: { message: "domain not verified" },
    });
    const { getResendProvider } = await import(
      "@/src/lib/api/email/resend-provider"
    );

    await expect(getResendProvider().send(message)).rejects.toThrow(
      /domain not verified/,
    );
  });

  it("falls back to 'unknown' when a success carries no id", async () => {
    send.mockResolvedValueOnce({ data: null, error: null });
    const { getResendProvider } = await import(
      "@/src/lib/api/email/resend-provider"
    );

    await expect(getResendProvider().send(message)).resolves.toEqual({
      id: "unknown",
    });
  });

  it("throws when the API key is missing, naming the variable", async () => {
    delete process.env.RESEND_API_KEY;
    const { getResendProvider } = await import(
      "@/src/lib/api/email/resend-provider"
    );

    await expect(getResendProvider().send(message)).rejects.toThrow(
      /RESEND_API_KEY/,
    );
  });

  it("forwards every field of the message, including cc and replyTo", async () => {
    send.mockResolvedValueOnce({ data: { id: "m1" }, error: null });
    const { getResendProvider } = await import(
      "@/src/lib/api/email/resend-provider"
    );

    await getResendProvider().send({
      ...message,
      cc: "admin@bridgingtrust.ai",
      replyTo: "sales@bridgingtrust.ai",
    });

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        cc: "admin@bridgingtrust.ai",
        replyTo: "sales@bridgingtrust.ai",
        html: "<p>Body</p>",
      }),
    );
  });

  it("constructs the client once and reuses it", async () => {
    send.mockResolvedValue({ data: { id: "m1" }, error: null });
    const { getResendProvider } = await import(
      "@/src/lib/api/email/resend-provider"
    );

    await getResendProvider().send(message);
    await getResendProvider().send(message);

    expect(ctor).toHaveBeenCalledTimes(1);
  });
});
