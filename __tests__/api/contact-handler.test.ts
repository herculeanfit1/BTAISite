import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the side-effecting collaborators; exercise the real orchestration and its
// response contracts. The pure modules (schema, cors, rate-limit, correlation,
// classify-queue) run for real.
vi.mock("@/src/lib/api/email/send-contact-email", () => ({
  sendContactEmail: vi.fn(),
}));
vi.mock("@/src/lib/api/hubspot", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/src/lib/api/hubspot")>();
  return { ...actual, upsertContactAndLogInquiry: vi.fn() };
});
vi.mock("@/src/lib/api/queue-client", () => ({
  enqueueClassify: vi.fn(),
}));

import { handleContact } from "@/src/lib/api/contact-handler";
import { sendContactEmail } from "@/src/lib/api/email/send-contact-email";
import { upsertContactAndLogInquiry } from "@/src/lib/api/hubspot";
import { enqueueClassify } from "@/src/lib/api/queue-client";

const mockSend = vi.mocked(sendContactEmail);
const mockUpsert = vi.mocked(upsertContactAndLogInquiry);
const mockEnqueue = vi.mocked(enqueueClassify);

const validBody = {
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  company: "Acme",
  interest: "general",
  message: "This is a valid test message over ten characters.",
  _gotcha: "",
};

function input(
  method: string,
  body: unknown,
  headers: Record<string, string> = {},
) {
  return {
    method,
    headers: new Headers({ origin: "https://bridgingtrust.ai", ...headers }),
    readBody: async () => body,
  };
}

type Body = {
  success?: boolean;
  message?: string;
  serviceUnavailable?: boolean;
  rateLimited?: boolean;
};

beforeEach(() => {
  vi.clearAllMocks();
  mockSend.mockResolvedValue({ success: true, message: "ok" });
  mockUpsert.mockResolvedValue({
    success: true,
    contactId: "123",
    noteId: "n1",
  });
  mockEnqueue.mockResolvedValue(undefined);
});

describe("handleContact", () => {
  it("returns 200 for OPTIONS without reading the body", async () => {
    const r = await handleContact(input("OPTIONS", null));
    expect(r.status).toBe(200);
    expect(r.corsOrigin).toBe("https://bridgingtrust.ai");
  });

  it("returns 400 'Invalid submission' when the honeypot is filled", async () => {
    const r = await handleContact(
      input("POST", { ...validBody, _gotcha: "i-am-a-bot" }),
    );
    expect(r.status).toBe(400);
    expect(r.body).toEqual({ success: false, message: "Invalid submission" });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns 400 'Validation failed' for an invalid payload", async () => {
    const r = await handleContact(
      input("POST", { email: "not-an-email", message: "" }),
    );
    expect(r.status).toBe(400);
    expect((r.body as Body).message).toBe("Validation failed");
  });

  it("returns 200 and drives HubSpot + enqueue on success", async () => {
    const r = await handleContact(input("POST", validBody));
    expect(r.status).toBe(200);
    expect(r.body).toEqual({
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
    });
    expect(mockUpsert).toHaveBeenCalledTimes(1);
    expect(mockEnqueue).toHaveBeenCalledTimes(1);
  });

  it("returns 429 when rate limited", async () => {
    mockSend.mockResolvedValue({
      success: false,
      message: "x",
      rateLimited: true,
    });
    const r = await handleContact(input("POST", validBody));
    expect(r.status).toBe(429);
    expect((r.body as Body).rateLimited).toBe(true);
  });

  it("returns 503 when the circuit breaker is open", async () => {
    mockSend.mockResolvedValue({
      success: false,
      message: "x",
      circuitBreakerOpen: true,
    });
    const r = await handleContact(input("POST", validBody));
    expect(r.status).toBe(503);
    expect((r.body as Body).serviceUnavailable).toBe(true);
  });

  it("returns 500 when email sending fails", async () => {
    mockSend.mockResolvedValue({ success: false, message: "x" });
    const r = await handleContact(input("POST", validBody));
    expect(r.status).toBe(500);
  });

  it("still returns 200 and skips enqueue when HubSpot fails (non-blocking)", async () => {
    mockUpsert.mockResolvedValue({ success: false, error: "boom" });
    const r = await handleContact(input("POST", validBody));
    expect(r.status).toBe(200);
    expect(mockEnqueue).not.toHaveBeenCalled();
  });

  it("still returns 200 when the enqueue throws (non-blocking, A1)", async () => {
    mockEnqueue.mockRejectedValue(new Error("queue down"));
    const r = await handleContact(input("POST", validBody));
    expect(r.status).toBe(200);
    expect(mockEnqueue).toHaveBeenCalledTimes(1);
  });

  it("skips all real side effects in a preview environment (host-based)", async () => {
    const r = await handleContact(
      input("POST", validBody, {
        host: "wonderful-bush-0e888f30f-55.eastus2.6.azurestaticapps.net",
      }),
    );
    expect(r.status).toBe(200);
    expect(r.body).toEqual({
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
    });
    expect(mockSend).not.toHaveBeenCalled();
    expect(mockUpsert).not.toHaveBeenCalled();
    expect(mockEnqueue).not.toHaveBeenCalled();
  });

  it("still validates in a preview (invalid payload → 400, no side effects)", async () => {
    const r = await handleContact(
      input(
        "POST",
        { email: "bad", message: "" },
        { host: "wonderful-bush-0e888f30f-55.eastus2.6.azurestaticapps.net" },
      ),
    );
    expect(r.status).toBe(400);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("sends normally on the production apex host", async () => {
    const r = await handleContact(
      input("POST", validBody, { host: "bridgingtrust.ai" }),
    );
    expect(r.status).toBe(200);
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockUpsert).toHaveBeenCalledTimes(1);
  });
});
