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

  it("stays on a Node line that Azure Static Web Apps can run", () => {
    // Node 20 reached EOL 2026-04-30; migrated to 22 on 2026-07-29 (PLAN-014).
    // 24 is deliberately NOT here: SWA has no node:24 runtime and Oryx's Node 24
    // support is a single version. Widen this only when SWA ships node:24.
    expect(decls[0].version.startsWith("22.")).toBe(true);
  });

  it("uses a version Azure's Oryx builder actually supports", () => {
    // NOT a free choice. Oryx ships a fixed allow-list and rejects anything
    // outside it at build time:
    //
    //   Error: Platform 'nodejs' version '20.20.2' is unsupported.
    //   Oryx has found build steps, but identified unsupported platform
    //   versions. Failing build.
    //
    // 20.20.2 is the latest Node 20 LTS and a perfectly real release -- Oryx
    // simply does not carry it. This bit exactly once, on the PR that first
    // aligned these versions, and it failed the preview deploy rather than
    // production only because previews run first.
    //
    // This list is Oryx's Node 20.x support as reported by the failing build on
    // 2026-07-29. It is a snapshot, not an authority: when Oryx adds versions
    // this list goes stale in the safe direction (it rejects a version that
    // would now work), so widen it from a real build log rather than guessing.
    const ORYX_SUPPORTED = [
      // Node 20 (kept for rollback: these are known-good if 22 ever has to be reverted)
      "20.9.0", "20.11.0", "20.11.1", "20.14.0", "20.15.1", "20.17.0",
      "20.18.0", "20.18.1", "20.18.3", "20.19.1", "20.19.3", "20.19.5",
      "20.19.6", "20.20.0",
      // Node 22. NOTE the newest Node 22 release is 22.23.2 and Oryx does NOT
      // carry it -- picking "latest" would fail the build exactly as 20.20.2 did.
      "22.9.0", "22.13.0", "22.14.0", "22.15.0", "22.17.0", "22.20.0",
      "22.21.1", "22.22.0",
      // Node 24 is intentionally omitted. Oryx carries 24.13.0, but SWA has no
      // node:24 runtime, so building on 24 would run on a mismatched runtime.
    ];
    const deployVersion = decls.find((d) =>
      d.where.includes("NODE_VERSION"),
    )?.version;
    expect(deployVersion, "no NODE_VERSION found for the deploy").toBeDefined();
    expect(
      ORYX_SUPPORTED,
      `Oryx does not support ${deployVersion}; the SWA build will fail before it starts`,
    ).toContain(deployVersion);
  });

  it("types Node at the major the runtime actually runs", () => {
    // @types/node's MAJOR tracks the Node major it describes. PLAN-014 moved the
    // seven declaration sites above from 20 to 22 and left this one at 20.11.5,
    // so for a day the repo type-checked against a runtime it no longer ran --
    // an eighth de-facto Node declaration that the checks above do not collect,
    // because it lives in `devDependencies` rather than in a version field.
    //
    // Only the major is asserted. @types/node's minor and patch move on their own
    // schedule and deliberately do NOT track Node's; pinning the full version to
    // .nvmrc would fail on every legitimate types release.
    //
    // "Latest" is the wrong target here for the same reason it was wrong for
    // Oryx: @types/node@26 is a real, current release and describes APIs this
    // runtime does not have.
    const nvmrcMajor = readFileSync(".nvmrc", "utf8").trim().split(".")[0];
    const typesNode = JSON.parse(readFileSync("package.json", "utf8"))
      .devDependencies["@types/node"] as string;
    expect(typesNode, "@types/node is not declared").toBeDefined();
    expect(
      typesNode.split(".")[0].replace(/^[^\d]*/, ""),
      `@types/node ${typesNode} describes Node ${typesNode.split(".")[0]}, but .nvmrc runs ${nvmrcMajor}`,
    ).toBe(nvmrcMajor);
  });

  it("declares no platform.apiRuntime, which is inert and therefore a decoy", () => {
    // Proven inert 2026-07-29 by three preview deploys (PLAN-014 Step 1):
    //   apiRuntime node:22 + build 20 -> runtime 20
    //   apiRuntime node:22 + build 22 -> runtime 22
    //   apiRuntime node:20 + build 22 -> runtime 22   <-- settles it
    // The hybrid runtime's Node version comes solely from NODE_VERSION. A value
    // that does nothing is worse than no value: it reads as the thing that pins
    // the runtime. Removed for the same reason globalHeaders,
    // routes[].headers and responseOverrides were.
    const swa = JSON.parse(readFileSync("staticwebapp.config.json", "utf8"));
    expect(
      swa.platform?.apiRuntime,
      "platform.apiRuntime is back. It does not pin the hybrid runtime -- change NODE_VERSION in cost-optimized-ci.yml instead.",
    ).toBeUndefined();
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
