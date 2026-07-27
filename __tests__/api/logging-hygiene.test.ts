import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { ipClass } from "@/src/lib/api/contact-handler";

// Logs from the API layer land in the managed backend's stdout and are retained
// for 30 days. Two things must hold: everything goes through the one sanctioned
// wrapper, and nothing personally identifying is written.

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

describe("logging hygiene — static guards", () => {
  const apiFiles = walk("src/lib/api").filter((f) => f.endsWith(".ts"));

  it("scans a non-trivial number of files (guard against a vacuous pass)", () => {
    expect(apiFiles.length).toBeGreaterThan(10);
  });

  it("routes every API log through apiLog, never a bare console", () => {
    // log.ts is the single sanctioned wrapper and is exempt by definition.
    const offenders = apiFiles
      .filter((f) => !f.endsWith("log.ts"))
      .filter((f) => /(^|[^.\w])console\.(log|warn|error|info|debug)\s*\(/.test(
        readFileSync(f, "utf8"),
      ));

    expect(offenders, `bare console.* found in: ${offenders.join(", ")}`).toEqual(
      [],
    );
  });

  it("proves the console pattern can actually match", () => {
    // Without this, a broken regex would make the guard above pass vacuously.
    expect(/(^|[^.\w])console\.(log|warn|error|info|debug)\s*\(/.test(
      'console.error("boom");',
    )).toBe(true);
  });
});

describe("ipClass", () => {
  it("reduces an address to whether one was resolvable", () => {
    expect(ipClass("203.0.113.7")).toBe("resolved");
    expect(ipClass("unknown")).toBe("unknown");
  });

  it("never returns the address itself", () => {
    expect(ipClass("203.0.113.7")).not.toContain("203");
  });
});

describe("no personal data reaches the logs", () => {
  const spies: Array<{ restore: () => void }> = [];
  let written: string[] = [];

  beforeEach(() => {
    written = [];
    for (const level of ["log", "warn", "error"] as const) {
      const s = vi.spyOn(console, level).mockImplementation((...args) => {
        written.push(args.map((a) => JSON.stringify(a) ?? String(a)).join(" "));
      });
      spies.push({ restore: () => s.mockRestore() });
    }
  });

  afterEach(() => {
    spies.splice(0).forEach((s) => s.restore());
  });

  it("logs neither the submitter's email nor their raw IP on a honeypot hit", async () => {
    const { handleContact } = await import("@/src/lib/api/contact-handler");

    await handleContact({
      method: "POST",
      headers: new Headers({
        origin: "https://bridgingtrust.ai",
        "x-forwarded-for": "203.0.113.77",
      }),
      readBody: async () => ({
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        message: "This is a valid test message over ten characters.",
        _gotcha: "i-am-a-bot",
      }),
    });

    const all = written.join("\n");
    expect(all, "logged output was empty — the assertion would pass vacuously")
      .not.toBe("");
    expect(all).not.toContain("ada@example.com");
    expect(all).not.toContain("203.0.113.77");
    expect(all).toContain("honeypot");
  });
});
