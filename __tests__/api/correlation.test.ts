import { describe, it, expect, vi, afterEach } from "vitest";
import { newCorrelationId } from "@/src/lib/api/correlation";

// Not security material — it exists so one lead's path is traceable across the
// validated -> emailed -> hubspot -> enqueued log lines. The fallback matters
// because the managed backend is the only place these logs land.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("newCorrelationId", () => {
  it("returns a short id", () => {
    expect(newCorrelationId()).toHaveLength(8);
  });

  it("varies between calls", () => {
    const ids = new Set(Array.from({ length: 50 }, () => newCorrelationId()));
    expect(ids.size).toBeGreaterThan(45);
  });

  it("falls back rather than throwing when crypto is unavailable", () => {
    vi.stubGlobal("crypto", {
      randomUUID: () => {
        throw new Error("not available");
      },
    });

    const id = newCorrelationId();

    expect(id).toHaveLength(8);
    expect(id).toMatch(/^[a-z0-9]{8}$/);
  });
});
