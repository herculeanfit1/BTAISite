import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// Cross-checks infra/swa-settings.contract.json against what the code actually
// reads, in BOTH directions:
//
//   - a variable the code reads that nobody provisions → a silent production
//     failure waiting for the first request that needs it;
//   - a setting provisioned that no code reads → drift nobody will notice,
//     and in the case of a secret, an unnecessary credential kept alive.
//
// Runs entirely offline. scripts/check-swa-settings.sh does the live diff.

const contract = JSON.parse(
  readFileSync("infra/swa-settings.contract.json", "utf8"),
);

const runtimeNames: string[] = contract.settings.map(
  (s: { name: string }) => s.name,
);
const elsewhere = new Set<string>([
  ...contract.notRuntimeSettings.buildTime,
  ...contract.notRuntimeSettings.localDevServerOnly,
  ...contract.notRuntimeSettings.optionalUnset,
]);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((e) => {
    const full = join(dir, e);
    if (e === "node_modules" || e === ".next") return [];
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const sources = [
  ...walk("app"),
  ...walk("src"),
  ...walk("lib"),
  "next.config.js",
  "server.js",
].filter((f) => /\.(ts|tsx|js|mjs)$/.test(f));

const readVars = new Set<string>();
for (const f of sources) {
  for (const m of readFileSync(f, "utf8").matchAll(/process\.env\.([A-Z_0-9]+)/g)) {
    readVars.add(m[1]);
  }
}

describe("SWA settings contract", () => {
  it("scans a non-trivial number of sources and vars (guard against a vacuous pass)", () => {
    expect(sources.length).toBeGreaterThan(20);
    expect(readVars.size).toBeGreaterThan(10);
  });

  it("provisions every variable the code reads at runtime", () => {
    const declared = new Set([...runtimeNames, ...elsewhere]);
    const unprovisioned = [...readVars].filter((v) => !declared.has(v)).sort();
    expect(
      unprovisioned,
      `read by code but in neither the contract nor notRuntimeSettings: ${unprovisioned.join(", ")}`,
    ).toEqual([]);
  });

  it("has no orphan settings that nothing reads", () => {
    const orphans = runtimeNames.filter((n) => !readVars.has(n)).sort();
    expect(
      orphans,
      `provisioned but read by no code: ${orphans.join(", ")}`,
    ).toEqual([]);
  });

  it("names a real consumer file for every setting", () => {
    for (const s of contract.settings) {
      expect(sources, `${s.name} names a consumer that does not exist`).toContain(
        s.consumedBy,
      );
    }
  });

  it("classifies each setting as secret or config", () => {
    for (const s of contract.settings) {
      expect(["secret", "config"], s.name).toContain(s.classification);
    }
    // The three that must never appear as literals in this public repo.
    const secrets = contract.settings
      .filter((s: { classification: string }) => s.classification === "secret")
      .map((s: { name: string }) => s.name);
    expect(secrets.sort()).toEqual([
      "CLASSIFY_QUEUE_SAS_URL",
      "HUBSPOT_TOKEN",
      "RESEND_API_KEY",
    ]);
  });

  it("carries no secret values, only names", () => {
    const raw = readFileSync("infra/swa-settings.contract.json", "utf8");
    expect(raw).not.toMatch(/re_[A-Za-z0-9]{20,}/); // Resend key shape
    expect(raw).not.toMatch(/pat-[a-z0-9-]{20,}/i); // HubSpot token shape
    expect(raw).not.toMatch(/sig=[A-Za-z0-9%]{10,}/); // SAS signature
  });

  it("proves those secret-shape patterns can match", () => {
    expect(/sig=[A-Za-z0-9%]{10,}/.test("?sv=2021&sig=abcdef0123456789")).toBe(true);
  });
});

describe("the settings resource is deliberately absent from Bicep", () => {
  const bicep = readFileSync("infra/main.bicep", "utf8");

  // Match the DECLARATION form, not the bare type string. The template's
  // comment block names the type while explaining why it is absent, and a
  // naive substring check flags that explanation as the violation. This is the
  // second guard in this repo to hit that — see also the Http5xx check in
  // alerting.test.ts.
  const DECL = /resource\s+\w+\s+'Microsoft\.Web\/staticSites\/config@/;

  it("declares no staticSites config resource", () => {
    // Declaring it REPLACES the whole settings collection, deleting any secret
    // the template does not carry — and this repo is public, so it cannot
    // carry them. See the contract file for the full reasoning.
    expect(DECL.test(bicep)).toBe(false);
  });

  it("proves that pattern could match a real declaration", () => {
    expect(
      DECL.test("resource cfg 'Microsoft.Web/staticSites/config@2024-04-01' = {"),
    ).toBe(true);
  });
});
