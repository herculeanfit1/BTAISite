import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  upsertContactAndLogInquiry,
  INTEREST_TO_INQUIRY_TOPIC,
  RETIRED_INQUIRY_TOPICS,
} from "@/src/lib/api/hubspot";

// The CRM leg of the lead path. It is non-blocking in the handler, which means
// every failure mode here is silent in production — the request still returns
// 200 and the only evidence is a log line. That is exactly why it needs tests.

const submission = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines",
  message: "I would like to discuss an engagement.",
  interest: "general",
};

const log = vi.fn();

/** Build a Response-alike; `json`/`text` are what the module actually calls. */
function res(
  status: number,
  body: unknown = {},
  { jsonThrows = false } = {},
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      if (jsonThrows) throw new Error("not json");
      return body;
    },
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
  } as unknown as Response;
}

/** Queue of responses returned in call order, so multi-leg flows are explicit. */
function fetchReturning(...responses: Array<Response | Error>) {
  const fn = vi.fn();
  for (const r of responses) {
    if (r instanceof Error) fn.mockRejectedValueOnce(r);
    else fn.mockResolvedValueOnce(r);
  }
  vi.stubGlobal("fetch", fn);
  return fn;
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.HUBSPOT_TOKEN = "test-token";
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.HUBSPOT_TOKEN;
});

describe("upsertContactAndLogInquiry — create path", () => {
  it("creates the contact and its note, returning both ids", async () => {
    const fetchMock = fetchReturning(
      res(201, { id: "c1" }), // create contact
      res(200, { id: "n1" }), // create note
    );

    const result = await upsertContactAndLogInquiry(submission, log);

    expect(result).toEqual({ success: true, contactId: "c1", noteId: "n1" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(log).toHaveBeenCalledWith("hubspot.contact.created", {
      contactId: "c1",
    });
  });

  it("still succeeds when the note fails, reporting noteId: null", async () => {
    // A lost note is not a lost lead — the contact is what matters.
    fetchReturning(res(201, { id: "c1" }), res(500, "boom"));

    const result = await upsertContactAndLogInquiry(submission, log);

    expect(result).toEqual({ success: true, contactId: "c1", noteId: null });
    expect(log).toHaveBeenCalledWith(
      "hubspot.note.failed",
      expect.objectContaining({ status: 500 }),
    );
  });

  it("escapes the message in the note body", async () => {
    const fetchMock = fetchReturning(res(201, { id: "c1" }), res(200, { id: "n1" }));

    await upsertContactAndLogInquiry(
      { ...submission, message: "<script>alert(1)</script>" },
      log,
    );

    const noteBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(noteBody.properties.hs_note_body).toContain("&lt;script&gt;");
    expect(noteBody.properties.hs_note_body).not.toContain("<script>");
  });
});

describe("upsertContactAndLogInquiry — 409 conflict path", () => {
  it("searches and patches when the contact already exists", async () => {
    const fetchMock = fetchReturning(
      res(409, { category: "CONFLICT", message: "exists" }), // create
      res(200, { results: [{ id: "existing-1" }] }), // search
      res(200, {}), // patch
      res(200, { id: "n1" }), // note
    );

    const result = await upsertContactAndLogInquiry(submission, log);

    expect(result).toEqual({
      success: true,
      contactId: "existing-1",
      noteId: "n1",
    });
    expect(fetchMock.mock.calls[2][1].method).toBe("PATCH");
    expect(log).toHaveBeenCalledWith("hubspot.contact.updated", {
      contactId: "existing-1",
    });
  });

  it("omits initial_message on update but includes it on create", async () => {
    // Re-sending initial_message on every submission would overwrite the
    // first-touch message, which is the one with attribution value.
    const createFetch = fetchReturning(res(201, { id: "c1" }), res(200, { id: "n1" }));
    await upsertContactAndLogInquiry(submission, log);
    const created = JSON.parse(createFetch.mock.calls[0][1].body);
    expect(created.properties.initial_message).toBe(submission.message);

    vi.unstubAllGlobals();
    const patchFetch = fetchReturning(
      res(409, { category: "CONFLICT" }),
      res(200, { results: [{ id: "e1" }] }),
      res(200, {}),
      res(200, { id: "n1" }),
    );
    await upsertContactAndLogInquiry(submission, log);
    const patched = JSON.parse(patchFetch.mock.calls[2][1].body);
    expect(patched.properties.initial_message).toBeUndefined();
  });

  it("fails on a 409 that is not a duplicate-contact conflict", async () => {
    fetchReturning(res(409, { category: "RATE_LIMIT", message: "slow down" }));

    const result = await upsertContactAndLogInquiry(submission, log);

    expect(result).toEqual({
      success: false,
      error: "unexpected 409: slow down",
    });
  });

  it("fails when the 409 search finds nothing", async () => {
    fetchReturning(
      res(409, { category: "CONFLICT" }),
      res(200, { results: [] }),
    );

    const result = await upsertContactAndLogInquiry(submission, log);

    expect(result).toEqual({
      success: false,
      error: "409 conflict but contact not found by email search",
    });
  });

  it("fails when the patch is rejected", async () => {
    fetchReturning(
      res(409, { category: "CONFLICT" }),
      res(200, { results: [{ id: "e1" }] }),
      res(400, "bad property"),
    );

    const result = await upsertContactAndLogInquiry(submission, log);

    expect(result).toEqual({ success: false, error: "patch failed (400)" });
  });
});

describe("upsertContactAndLogInquiry — failure handling", () => {
  it("returns a failure result, not a throw, when the token is absent", async () => {
    delete process.env.HUBSPOT_TOKEN;

    const result = await upsertContactAndLogInquiry(submission, log);

    expect(result).toEqual({ success: false, error: "missing token" });
    expect(log).toHaveBeenCalledWith("hubspot.token.missing");
  });

  it("returns a failure result on an unexpected create status", async () => {
    fetchReturning(res(500, "server error"));

    const result = await upsertContactAndLogInquiry(submission, log);

    expect(result).toEqual({ success: false, error: "create failed (500)" });
  });

  it("swallows a network rejection into a failure result", async () => {
    // The caller awaits-with-catch, but a throw escaping here would still be a
    // behaviour change; the module is contracted to resolve either way.
    fetchReturning(new Error("ECONNRESET"));

    const result = await upsertContactAndLogInquiry(submission, log);

    expect(result).toEqual({ success: false, error: "ECONNRESET" });
    expect(log).toHaveBeenCalledWith("hubspot.exception", {
      error: "ECONNRESET",
    });
  });

  it("survives an AbortError from the 10s timeout without throwing", async () => {
    const abort = new Error("The operation was aborted");
    abort.name = "AbortError";
    fetchReturning(abort);

    await expect(
      upsertContactAndLogInquiry(submission, log),
    ).resolves.toMatchObject({ success: false });
  });
});

describe("interest → inquiry_topic mapping", () => {
  it("maps every current and retired slug to a current topic", async () => {
    for (const [slug, topic] of Object.entries(INTEREST_TO_INQUIRY_TOPIC)) {
      const fetchMock = fetchReturning(res(201, { id: "c1" }), res(200, { id: "n1" }));
      await upsertContactAndLogInquiry({ ...submission, interest: slug }, log);
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.properties.inquiry_topic, `slug ${slug}`).toBe(topic);
      vi.unstubAllGlobals();
    }
  });

  it("never writes a retired topic — archived options accept writes silently", async () => {
    // Archiving sets hidden:true rather than removing the option, so a write of
    // a retired value SUCCEEDS and quietly repopulates the old taxonomy.
    const written = Object.values(INTEREST_TO_INQUIRY_TOPIC);
    for (const retired of RETIRED_INQUIRY_TOPICS) {
      expect(written).not.toContain(retired);
    }
  });

  it("defaults an unmapped interest to general_inquiry", async () => {
    const fetchMock = fetchReturning(res(201, { id: "c1" }), res(200, { id: "n1" }));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await upsertContactAndLogInquiry(
      { ...submission, interest: "not-a-real-slug" },
      log,
    );

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.properties.inquiry_topic).toBe("general_inquiry");
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("omits inquiry_topic entirely when no interest is given", async () => {
    const fetchMock = fetchReturning(res(201, { id: "c1" }), res(200, { id: "n1" }));

    await upsertContactAndLogInquiry({ ...submission, interest: "" }, log);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.properties.inquiry_topic).toBeUndefined();
  });

  it("includes optional attribution fields only when present", async () => {
    const fetchMock = fetchReturning(res(201, { id: "c1" }), res(200, { id: "n1" }));

    await upsertContactAndLogInquiry(
      {
        ...submission,
        company: undefined,
        submissionIp: "203.0.113.10",
        utmSource: "linkedin",
      },
      log,
    );

    const props = JSON.parse(fetchMock.mock.calls[0][1].body).properties;
    expect(props.submission_ip).toBe("203.0.113.10");
    expect(props.utm_source).toBe("linkedin");
    expect(props.company).toBeUndefined();
    expect(props.utm_medium).toBeUndefined();
    expect(props.website_source).toBe("btai");
  });
});
