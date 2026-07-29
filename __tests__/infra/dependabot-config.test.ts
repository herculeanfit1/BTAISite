import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { load } from "js-yaml";

/**
 * Guards `.github/dependabot.yml`.
 *
 * This config did not parse from the repository's first commit (2025-05-25)
 * until 2026-07-28 -- **fourteen months during which no Dependabot update ran
 * at all**: 0 Dependabot pull requests against 88 total. The cause was a single
 * unknown key:
 *
 *   The property '#/updates/0/' contains additional properties
 *   ["security-updates-only"] outside of the schema when none are allowed
 *
 * Two properties of that failure are what make a local guard worth having:
 *
 *  1. **A config that fails to parse is ignored entirely**, not partially. The
 *     `github-actions` and `docker` entries were individually valid and still
 *     never ran.
 *  2. **Validation is server-side and only runs on commits that CHANGE the
 *     file.** So a broken config shows one red check, once, on the PR that
 *     introduced it -- and every commit afterwards looks clean. It is invisible
 *     unless you go looking, which is why it survived fourteen months.
 *
 * These tests do not replace GitHub's validator; they catch the specific shape
 * that got through, on every run rather than once.
 */

const raw = readFileSync(".github/dependabot.yml", "utf8");
const config = load(raw) as {
  version: number;
  updates: Array<Record<string, unknown>>;
};

// Keys Dependabot accepts on an `updates` entry.
// https://docs.github.com/en/code-security/dependabot/working-with-dependabot/dependabot-options-reference
const ALLOWED_KEYS = new Set([
  "package-ecosystem",
  "directory",
  "directories",
  "schedule",
  "allow",
  "assignees",
  "commit-message",
  "cooldown",
  "groups",
  "ignore",
  "insecure-external-code-execution",
  "labels",
  "milestone",
  "open-pull-requests-limit",
  "patterns",
  "pull-request-branch-name",
  "rebase-strategy",
  "registries",
  "target-branch",
  "vendor",
  "versioning-strategy",
]);

// Accepted once, since removed. `reviewers` was the other stale key in this
// file; review assignment comes from .github/CODEOWNERS instead.
const REMOVED_KEYS = new Set(["reviewers"]);

describe("dependabot config", () => {
  it("is valid YAML with the expected shape", () => {
    expect(config.version).toBe(2);
    expect(Array.isArray(config.updates)).toBe(true);
    expect(config.updates.length).toBeGreaterThan(0);
  });

  it("uses no key outside Dependabot's schema", () => {
    // The exact failure that cost fourteen months.
    const offenders: string[] = [];
    config.updates.forEach((entry, i) => {
      for (const key of Object.keys(entry)) {
        if (!ALLOWED_KEYS.has(key)) {
          offenders.push(`updates[${i}].${key}`);
        }
      }
    });
    expect(
      offenders,
      `unknown keys will make Dependabot ignore the ENTIRE file: ${offenders.join(", ")}`,
    ).toEqual([]);
  });

  it("uses no key GitHub has removed", () => {
    const stale: string[] = [];
    config.updates.forEach((entry, i) => {
      for (const key of Object.keys(entry)) {
        if (REMOVED_KEYS.has(key)) stale.push(`updates[${i}].${key}`);
      }
    });
    expect(stale, `removed keys: ${stale.join(", ")}`).toEqual([]);
  });

  it("still covers every ecosystem this repo actually uses", () => {
    // Losing an ecosystem silently is the other way this file stops working.
    const ecosystems = config.updates.map((u) => u["package-ecosystem"]);
    expect(ecosystems).toContain("npm");
    expect(ecosystems).toContain("github-actions");
    expect(ecosystems).toContain("docker");
  });

  it("does not let the Docker base image drift past the pinned Node version", () => {
    // The first run after this config was repaired proposed
    // node 20.19-slim -> 26.5-slim (PR #96), across all three Dockerfiles.
    // package.json engines and .nvmrc both pin 20.19.1 and CLAUDE.md records
    // that 23.x breaks the build, so that is four majors past known-broken.
    // Cause: the major `ignore` had been applied to the npm entry only.
    const docker = config.updates.find(
      (u) => u["package-ecosystem"] === "docker",
    );
    expect(docker, "docker ecosystem entry missing").toBeDefined();

    const ignores = (docker!.ignore ?? []) as Array<{
      "dependency-name"?: string;
      "update-types"?: string[];
    }>;
    const blocksNodeMajors = ignores.some(
      (r) =>
        (r["dependency-name"] === "node" || r["dependency-name"] === "*") &&
        (r["update-types"] ?? []).includes("version-update:semver-major"),
    );
    expect(
      blocksNodeMajors,
      "docker entry must ignore node major bumps; the base image tracks the engines pin",
    ).toBe(true);
  });

  it("keeps the Docker pin consistent with engines and .nvmrc", () => {
    // If these three ever disagree, the ignore rule above is guarding the
    // wrong version and the mismatch should surface here rather than in a
    // broken image.
    const engines = JSON.parse(readFileSync("package.json", "utf8")).engines
      .node as string;
    const nvmrc = readFileSync(".nvmrc", "utf8").trim();
    expect(nvmrc).toBe(engines);
    expect(engines.startsWith("20."), `engines pins ${engines}`).toBe(true);
  });

  it("proves the unknown-key check can fail (guard against a vacuous pass)", () => {
    // Re-runs the exact assertion against the exact config that was broken.
    const broken = load(
      raw.replace(
        'directory: "/"',
        'directory: "/"\n    security-updates-only: false',
      ),
    ) as { updates: Array<Record<string, unknown>> };

    const offenders = broken.updates.flatMap((entry, i) =>
      Object.keys(entry)
        .filter((k) => !ALLOWED_KEYS.has(k))
        .map((k) => `updates[${i}].${k}`),
    );
    expect(offenders.length).toBeGreaterThan(0);
    expect(offenders[0]).toContain("security-updates-only");
  });
});
