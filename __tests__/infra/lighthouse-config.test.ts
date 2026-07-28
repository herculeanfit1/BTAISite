import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

// Guards the Lighthouse budget gate (PLAN-013 Part 2).
//
// The config this replaced was dead three times over: `module.exports` in a
// "type": "module" package so it could never load, every assertion set to
// "warn" so it could never fail, and both `url` and `staticDistDir` set. It sat
// in the repo from 2025-09 looking like a performance gate.
//
// Each test below is one of the ways it was broken, plus the version drift the
// new wiring introduces by pinning @lhci/cli in two places.

const rc = JSON.parse(readFileSync("lighthouserc.json", "utf8"));
const workflow = readFileSync(".github/workflows/cost-optimized-ci.yml", "utf8");
const pkg = JSON.parse(readFileSync("package.json", "utf8"));

describe("lighthouserc.json", () => {
  it("parses as JSON, so there is no module system to get wrong", () => {
    expect(rc.ci).toBeDefined();
  });

  it("asserts at error level, not only warn", () => {
    // A config where every assertion is "warn" exits 0 no matter what it
    // measured. That is what the previous version did.
    const assertions: Record<string, unknown[]> = rc.ci.assert.assertions;
    const levels = Object.values(assertions).map((a) => a[0]);
    expect(levels.length).toBeGreaterThan(5);
    expect(levels).toContain("error");
  });

  it("gates the four published budgets at error level", () => {
    // CLAUDE.md commits to LCP <= 2.5s, CLS <= 0.1 and Perf >= 90. Those three
    // must be able to fail the build; anything softer is decoration.
    const a: Record<string, [string, { minScore?: number; maxNumericValue?: number }]> =
      rc.ci.assert.assertions;
    expect(a["categories:performance"][0]).toBe("error");
    expect(a["categories:performance"][1].minScore).toBeGreaterThanOrEqual(0.9);
    expect(a["largest-contentful-paint"][0]).toBe("error");
    expect(a["largest-contentful-paint"][1].maxNumericValue).toBeLessThanOrEqual(2500);
    expect(a["cumulative-layout-shift"][0]).toBe("error");
    expect(a["cumulative-layout-shift"][1].maxNumericValue).toBeLessThanOrEqual(0.1);
  });

  it("pins no URL, so the target is always passed in explicitly", () => {
    // Measured 2026-07-28 on one commit: localhost scores perf 100 while the
    // apex scores 79. A hard-coded localhost target would pass forever.
    expect(rc.ci.collect.url).toBeUndefined();
    expect(rc.ci.collect.staticDistDir).toBeUndefined();
    expect(JSON.stringify(rc.ci.collect)).not.toMatch(/localhost|127\.0\.0\.1/);
  });

  it("runs more than once, so a single noisy sample cannot decide the gate", () => {
    expect(rc.ci.collect.numberOfRuns).toBeGreaterThanOrEqual(3);
  });
});

describe("the workflow wiring", () => {
  it("runs Lighthouse against the deploy step's URL output", () => {
    expect(workflow).toMatch(/lhci.*autorun/);
    expect(workflow).toContain("steps.deploy.outputs.static_web_app_url");
  });

  it("never points Lighthouse at localhost", () => {
    const lhLine = workflow
      .split("\n")
      .find((l) => l.includes("lhci") && l.includes("autorun"));
    expect(lhLine).toBeDefined();
    expect(lhLine).not.toMatch(/localhost|127\.0\.0\.1/);
  });

  it("pins the same @lhci/cli version the repo declares", () => {
    // The workflow installs lhci via npx rather than `npm ci`, so the two pins
    // can drift silently and CI would then gate on a different Lighthouse than
    // anyone reproduces locally.
    const declared = pkg.devDependencies["@lhci/cli"];
    expect(declared, "@lhci/cli missing from devDependencies").toBeDefined();
    expect(
      workflow,
      `workflow must pin @lhci/cli@${declared} to match package.json`,
    ).toContain(`@lhci/cli@${declared}`);
  });

  it("proves those checks could fail (guard against a vacuous pass)", () => {
    expect(/lhci.*autorun/.test("run: npx lhci autorun --collect.url=x")).toBe(true);
    expect(
      "npx --yes @lhci/cli@9.9.9 autorun".includes("@lhci/cli@0.15.1"),
    ).toBe(false);
  });
});
