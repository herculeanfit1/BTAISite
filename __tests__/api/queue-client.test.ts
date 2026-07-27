import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// The queue is the handoff to the downstream lead-classification pipeline. It
// is reached with a queue-scoped, add-only SAS URL and its wire format is a
// cross-system contract, so both are asserted here.

const sendMessage = vi.fn();
const ctor = vi.fn();

vi.mock("@azure/storage-queue", () => ({
  QueueClient: class {
    constructor(url: string) {
      ctor(url);
    }
    sendMessage = sendMessage;
  },
}));

const msg = {
  schemaVersion: 1,
  submittedAt: "2026-07-27T00:00:00.000Z",
  contactId: "c1",
  noteId: "n1",
} as never;

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules(); // the client is memoised at module scope
  process.env.CLASSIFY_QUEUE_SAS_URL = "https://acct.queue.core.windows.net/q?sig=x";
});

afterEach(() => {
  delete process.env.CLASSIFY_QUEUE_SAS_URL;
});

describe("enqueueClassify", () => {
  it("sends the base64-encoded message the consumer expects", async () => {
    const { enqueueClassify } = await import("@/src/lib/api/queue-client");

    await enqueueClassify(msg);

    expect(sendMessage).toHaveBeenCalledTimes(1);
    const sent = sendMessage.mock.calls[0][0];
    // Byte-for-byte reproduction of the Functions Queues v5 default encoding.
    expect(Buffer.from(sent, "base64").toString("utf8")).toBe(
      JSON.stringify(msg),
    );
  });

  it("builds the client from the SAS URL", async () => {
    const { enqueueClassify } = await import("@/src/lib/api/queue-client");

    await enqueueClassify(msg);

    expect(ctor).toHaveBeenCalledWith(
      "https://acct.queue.core.windows.net/q?sig=x",
    );
  });

  it("memoises the client across calls", async () => {
    const { enqueueClassify } = await import("@/src/lib/api/queue-client");

    await enqueueClassify(msg);
    await enqueueClassify(msg);

    expect(ctor).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledTimes(2);
  });

  it("throws when the SAS URL is missing, naming the variable", async () => {
    delete process.env.CLASSIFY_QUEUE_SAS_URL;
    const { enqueueClassify } = await import("@/src/lib/api/queue-client");

    await expect(enqueueClassify(msg)).rejects.toThrow(
      /CLASSIFY_QUEUE_SAS_URL/,
    );
  });

  it("propagates a send failure to the caller, which swallows it", async () => {
    // Deliberate: enqueue is non-blocking in the handler. This test documents
    // that the throw is real and the swallowing happens upstream, not here.
    sendMessage.mockRejectedValueOnce(new Error("403 AuthorizationFailure"));
    const { enqueueClassify } = await import("@/src/lib/api/queue-client");

    await expect(enqueueClassify(msg)).rejects.toThrow("403");
  });
});
