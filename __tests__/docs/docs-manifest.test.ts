import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";

// Documentation drift is this repo's most repeated failure: docs that describe a
// system that no longer exists, read by sessions that then act on them. Two
// mechanisms guard against a relapse — a manifest that cannot silently grow, and
// a check that living docs do not assert things known to be false.

const LIVING = readdirSync("docs")
  .filter((f) => f.endsWith(".md") && f !== "README.md")
  .sort();

const readme = readFileSync("docs/README.md", "utf8");

describe("docs manifest", () => {
  it("finds a non-trivial number of living docs (guard against a vacuous pass)", () => {
    expect(LIVING.length).toBeGreaterThan(3);
  });

  it("lists every living doc in docs/README.md", () => {
    const unlisted = LIVING.filter((f) => !readme.includes(f));
    expect(
      unlisted,
      `not listed in docs/README.md: ${unlisted.join(", ")}. Add it to the table, ` +
        `or put it in docs/archive/ if it is a point-in-time record.`,
    ).toEqual([]);
  });

  it("lists nothing that no longer exists", () => {
    // Tolerate Prettier's column padding — it realigns these tables on write.
    const rows = [...readme.matchAll(/^\|\s*`([a-z0-9-]+\.md)`\s*\|/gm)].map((m) => m[1]);
    expect(rows.length).toBeGreaterThan(3);
    const phantom = rows.filter((f) => !existsSync(`docs/${f}`));
    expect(phantom, `listed but missing: ${phantom.join(", ")}`).toEqual([]);
  });

  it("keeps the archive disclaimer in place", () => {
    const archive = readFileSync("docs/archive/README.md", "utf8");
    expect(archive.toLowerCase()).toContain("not current guidance");
  });
});

describe("living docs do not restate retired architecture", () => {
  // Each pattern below describes something that was true once and is now false.
  // A living doc asserting any of them actively misleads the next session.
  const FALSEHOODS: Array<{ pattern: RegExp; why: string }> = [
    {
      pattern: /security headers.{0,40}via Next\.js middleware/i,
      why: "there is no middleware; headers come from next.config.js headers()",
    },
    {
      pattern: /linked (Azure Functions )?backend is|api_location:\s*["']api["']/i,
      why: "the linked Functions backend was retired 2026-07-24",
    },
  ];

  it("proves each pattern can match (guard against a dead regex)", () => {
    expect(
      FALSEHOODS[0].pattern.test(
        "The security headers are implemented via Next.js middleware (`middleware.ts`)",
      ),
    ).toBe(true);
    expect(FALSEHOODS[1].pattern.test('api_location: "api"')).toBe(true);
  });

  it("finds no retired-architecture claims in living docs", () => {
    const offenders: string[] = [];
    for (const file of LIVING) {
      const text = readFileSync(`docs/${file}`, "utf8");
      for (const { pattern, why } of FALSEHOODS) {
        if (pattern.test(text)) offenders.push(`docs/${file}: ${why}`);
      }
    }
    expect(offenders, offenders.join("; ")).toEqual([]);
  });

  // CLAUDE.md is loaded into every session, so a false claim there is read far
  // more widely than one in docs/. This specific claim asserted a security
  // control that does not exist, and acting on it would have broken the contact
  // form — the strongest reason to keep it from coming back.
  it("does not reassert that production secrets come from Key Vault", () => {
    const claim =
      /secrets[^.]{0,60}Key Vault[^.]{0,80}(managed identity|@Microsoft\.KeyVault)[^.]{0,60}never plain-?text/i;
    const text = readFileSync("CLAUDE.md", "utf8");
    expect(
      claim.test(text),
      "CLAUDE.md claims prod secrets come from Key Vault. They do not: SWA's " +
        "managed backend cannot resolve Key Vault references at all. See " +
        "infra/swa-settings.contract.json.",
    ).toBe(false);
  });

  it("proves that claim pattern matches the wording it guards against", () => {
    const claim =
      /secrets[^.]{0,60}Key Vault[^.]{0,80}(managed identity|@Microsoft\.KeyVault)[^.]{0,60}never plain-?text/i;
    expect(
      claim.test(
        "Prod secrets: Azure Key Vault via system-assigned managed identity, referenced with @Microsoft.KeyVault() — never plain-text in app settings",
      ),
    ).toBe(true);
  });
});

describe("ADRs", () => {
  const adrs = readdirSync("docs/adr").filter((f) => /^\d{4}-.*\.md$/.test(f)).sort();

  it("are numbered contiguously from 0001", () => {
    expect(adrs.length).toBeGreaterThan(0);
    adrs.forEach((f, i) => {
      expect(f.slice(0, 4)).toBe(String(i + 1).padStart(4, "0"));
    });
  });

  it("each declares a Status and a Date", () => {
    // Two syntaxes are in use and both are fine: 0001 predates the current house
    // style and uses `## Status` / `Date:`. The requirement is that the fields
    // are declared, not that one spelling won.
    const hasStatus = /(\*\*Status\*\*:|^##\s+Status\s*$)/m;
    const hasDate = /(\*\*Date\*\*:|^Date:\s*\d{4}-\d{2}-\d{2})/m;

    for (const f of adrs) {
      const text = readFileSync(`docs/adr/${f}`, "utf8");
      expect(text, `${f} has no Status`).toMatch(hasStatus);
      expect(text, `${f} has no Date`).toMatch(hasDate);
    }
  });

  it("proves those patterns can fail (guard against an always-true regex)", () => {
    expect(/(\*\*Status\*\*:|^##\s+Status\s*$)/m.test("# Just a title\n")).toBe(false);
  });
});
