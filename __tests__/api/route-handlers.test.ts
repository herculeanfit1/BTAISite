import { describe, it, expect, vi, beforeEach } from "vitest";

// The three route handlers are thin adapters, but two of their response shapes
// are a DEPLOY CONTRACT: cost-optimized-ci.yml's post-deployment verification
// polls /api/health for `"status"` and expects a JSON 400 from an invalid POST
// to /api/contact. Changing either shape fails the deploy gate and the incident
// tooling that greps for them — with nothing in the test suite to warn first.

vi.mock("@/src/lib/api/contact-handler", () => ({
  handleContact: vi.fn(),
}));

import { GET as healthGET } from "@/app/api/health/route";
import { GET as statusGET } from "@/app/api/status/route";
import { OPTIONS as contactOPTIONS, POST as contactPOST } from "@/app/api/contact/route";
import { handleContact } from "@/src/lib/api/contact-handler";

const mockHandle = vi.mocked(handleContact);

/**
 * Request stub rather than `new Request(...)`: `origin` is a forbidden header
 * name, so the real constructor silently drops it and every CORS assertion
 * would read null regardless of the handler's behaviour. The route handlers use
 * only `.headers` and `.json()`, so this is faithful to what they touch.
 */
function req(method: string, body: unknown, origin = "https://bridgingtrust.ai") {
  return {
    method,
    headers: new Headers({ origin, "content-type": "application/json" }),
    json: async () => body,
  } as never;
}

const post = (body: unknown, origin?: string) => req("POST", body, origin);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("/api/health — deploy contract", () => {
  it('returns 200 with a "status" key the CI poll greps for', async () => {
    const res = healthGET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("status");
    expect(body.status).toBe("ok");
  });

  it("is uncacheable, so a cached 200 cannot masquerade as a live handler", async () => {
    expect(healthGET().headers.get("cache-control")).toBe("no-store");
  });
});

describe("/api/status", () => {
  it("reports the documented fields", async () => {
    const body = await statusGET().json();

    expect(body.status).toBe("online");
    expect(body).toHaveProperty("environment");
    expect(body).toHaveProperty("version");
    expect(typeof body.uptime).toBe("number");
    expect(() => new Date(body.timestamp).toISOString()).not.toThrow();
  });

  it("is uncacheable", async () => {
    expect(statusGET().headers.get("cache-control")).toBe("no-store");
  });
});

describe("/api/contact — deploy contract", () => {
  it("returns a JSON 400 for an invalid payload", async () => {
    // The exact pair the deploy gate asserts: status 400 AND application/json.
    mockHandle.mockResolvedValue({
      status: 400,
      body: { success: false, errors: [{ path: "email", message: "Invalid" }] },
      corsOrigin: "https://bridgingtrust.ai",
    } as never);

    const res = await contactPOST(post({ email: "not-an-email", message: "" }));

    expect(res.status).toBe(400);
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
    await expect(res.json()).resolves.toHaveProperty("success", false);
  });

  it("passes the request method, headers and body reader through", async () => {
    mockHandle.mockResolvedValue({
      status: 200,
      body: { success: true },
      corsOrigin: "https://bridgingtrust.ai",
    } as never);

    await contactPOST(post({ firstName: "Ada" }));

    const input = mockHandle.mock.calls[0][0];
    expect(input.method).toBe("POST");
    expect(input.headers.get("origin")).toBe("https://bridgingtrust.ai");
    await expect(input.readBody()).resolves.toEqual({ firstName: "Ada" });
  });

  it("echoes the CORS origin the handler resolved", async () => {
    mockHandle.mockResolvedValue({
      status: 200,
      body: { success: true },
      corsOrigin: "https://bridgingtrust.ai",
    } as never);

    const res = await contactPOST(post({}));

    expect(res.headers.get("access-control-allow-origin")).toBe(
      "https://bridgingtrust.ai",
    );
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("never echoes an origin the handler did not authorise", async () => {
    // resolveCorsOrigin falls back to the canonical origin rather than
    // returning null, so the route's job is verbatim pass-through — it must not
    // substitute the request's own Origin header for the resolved value.
    mockHandle.mockResolvedValue({
      status: 200,
      body: { success: true },
      corsOrigin: "https://bridgingtrust.ai",
    } as never);

    const res = await contactPOST(post({}, "https://evil.example"));

    expect(res.headers.get("access-control-allow-origin")).toBe(
      "https://bridgingtrust.ai",
    );
    expect(res.headers.get("access-control-allow-origin")).not.toContain(
      "evil.example",
    );
    expect(res.headers.get("vary")).toBe("Origin");
  });

  it("answers preflight with no body", async () => {
    mockHandle.mockResolvedValue({
      status: 204,
      body: null,
      corsOrigin: "https://bridgingtrust.ai",
    } as never);

    const res = await contactOPTIONS(req("OPTIONS", null));

    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");
    expect(mockHandle.mock.calls[0][0].method).toBe("OPTIONS");
  });

  it("returns the handler's status verbatim for rate limit and outage", async () => {
    for (const status of [429, 503]) {
      mockHandle.mockResolvedValue({
        status,
        body: { success: false },
        corsOrigin: "https://bridgingtrust.ai",
      } as never);

      const res = await contactPOST(post({}));
      expect(res.status).toBe(status);
    }
  });
});
