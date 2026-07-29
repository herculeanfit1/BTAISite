import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Keeps the toolchain's version declarations from drifting apart.
 *
 * The Node version is stated in SEVEN places. On 2026-07-29 they disagreed:
 * `.nvmrc` and `engines` said 20.19.1 while all three Dockerfiles said 20.20 --
 * because Dependabot bumps Dockerfiles and cannot touch `.nvmrc`. The
 * Dockerfiles did not even agree with each other on precision
 * (`20.20.2-alpine` pinned the patch, `20.20-slim` floated).
 *
 * Nothing failed, because `.npmrc` sets `engine-strict=false`: the mismatch
 * only downgraded `npm ci` to a warning nobody reads. That is the whole
 * problem -- a repo whose test containers quietly ran a different Node than its
 * CI, with no signal.
 *
 * This test discovers declarations rather than listing them, so a NEW hardcoded
 * version added anywhere is caught rather than silently becoming an eighth
 * source of truth.
 */

const WORKFLOW_DIR = ".github/workflows";
const DOCKERFILES = ["dockerfile", "Dockerfile.static", "Dockerfile.test"];

type Decl = { where: string; version: string };

function nodeDeclarations(): Decl[] {
  const found: Decl[] = [];

  found.push({ where: ".nvmrc", version: readFileSync(".nvmrc", "utf8").trim() });
  found.push({
    where: "package.json engines.node",
    version: JSON.parse(readFileSync("package.json", "utf8")).engines.node,
  });

  for (const f of DOCKERFILES) {
    const text = readFileSync(f, "utf8");
    for (const m of text.matchAll(/^FROM\s+node:([0-9][^\s-]*)(?:-\S+)?/gm)) {
      found.push({ where: `${f} FROM`, version: m[1] });
    }
  }

  for (const f of readdirSync(WORKFLOW_DIR).filter((n) => /\.ya?ml$/.test(n))) {
    const text = readFileSync(join(WORKFLOW_DIR, f), "utf8");
    // Literal pins only. `node-version-file:` references are what we WANT and
    // cannot drift, so they are deliberately not collected.
    for (const m of text.matchAll(/^\s*NODE_VERSION:\s*["']?([0-9][^"'\s]*)/gm)) {
      found.push({ where: `${f} NODE_VERSION`, version: m[1] });
    }
    for (const m of text.matchAll(/^\s*node-version:\s*["']?([0-9][^"'\s]*)/gm)) {
      found.push({ where: `${f} node-version`, version: m[1] });
    }
  }

  return found;
}

describe("Node version is stated consistently", () => {
  const decls = nodeDeclarations();

  it("finds declarations in every expected kind of file (guard against a vacuous pass)", () => {
    // If the patterns stopped matching, every assertion below would pass on an
    // empty set -- the failure mode this repo keeps producing.
    expect(decls.length).toBeGreaterThanOrEqual(6);
    expect(decls.some((d) => d.where === ".nvmrc")).toBe(true);
    expect(decls.some((d) => d.where.includes("engines"))).toBe(true);
    expect(decls.some((d) => d.where.includes("FROM"))).toBe(true);
    expect(decls.some((d) => d.where.includes(".yml"))).toBe(true);
  });

  it("agrees everywhere", () => {
    const distinct = [...new Set(decls.map((d) => d.version))];
    expect(
      distinct,
      `Node version disagrees across:\n${decls
        .map((d) => `  ${d.version.padEnd(10)} ${d.where}`)
        .join("\n")}`,
    ).toHaveLength(1);
  });

  it("pins an exact patch, so no declaration floats", () => {
    // `node:20.20-slim` resolves to whatever the latest 20.20.x happens to be
    // that day, which makes the build irreproducible and lets a Dockerfile
    // silently diverge from .nvmrc without any file changing.
    for (const d of decls) {
      expect(d.version, `${d.where} is not an exact patch pin`).toMatch(
        /^\d+\.\d+\.\d+$/,
      );
    }
  });

  it("stays on the Node 20 LTS line this repo is built for", () => {
    // CLAUDE.md: 18.x is incompatible and 23.x breaks the build.
    expect(decls[0].version.startsWith("20.")).toBe(true);
  });
});

describe("shared GitHub Actions are on one version each", () => {
  const uses = readdirSync(WORKFLOW_DIR)
    .filter((n) => /\.ya?ml$/.test(n))
    .flatMap((f) => {
      const text = readFileSync(join(WORKFLOW_DIR, f), "utf8");
      return [...text.matchAll(/uses:\s*([\w.-]+\/[\w.-]+)@(v?[\w.]+)/g)].map(
        (m) => ({ action: m[1], version: m[2], file: f }),
      );
    });

  it("collects real action references (guard against a vacuous pass)", () => {
    expect(uses.length).toBeGreaterThan(10);
    expect(uses.some((u) => u.action === "actions/checkout")).toBe(true);
  });

  it("uses a single version of each action across all workflows", () => {
    // `actions/checkout` was split across v4 and v6 before the Dependabot
    // bumps; `setup-node` was split across v4 and v6, and the v4 straggler sat
    // in a workflow that had never executed. Each file looked internally
    // consistent, which is why the split was invisible.
    const byAction = new Map<string, Set<string>>();
    for (const u of uses) {
      if (!byAction.has(u.action)) byAction.set(u.action, new Set());
      byAction.get(u.action)!.add(u.version);
    }
    const split = [...byAction.entries()]
      .filter(([, versions]) => versions.size > 1)
      .map(([action, versions]) => `${action}: ${[...versions].join(", ")}`);
    expect(split, `actions pinned at multiple versions:\n  ${split.join("\n  ")}`).toEqual(
      [],
    );
  });

  it("keeps upload-artifact and download-artifact on the same generation", () => {
    // v3 and v4+ use different artifact backends and do not interoperate. The
    // download side feeds "Gate on HIGH / CRITICAL", a REQUIRED check, so a
    // mismatch blocks every PR.
    const up = uses.find((u) => u.action === "actions/upload-artifact")?.version;
    const down = uses.find((u) => u.action === "actions/download-artifact")?.version;
    if (up && down) expect(down).toBe(up);
  });
});
