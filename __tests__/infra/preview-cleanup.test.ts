import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { load } from "js-yaml";

/**
 * Guards the ordering fix in `cleanup-pr`.
 *
 * The bug: cleanup RACED the deploy it was cleaning up after, and lost.
 * On PR #75 cleanup ran 18:34:01-18:34:25 and reported success, while the
 * deploy from the preceding push ran until 18:35:02 and created the staging
 * environment at 18:34:37 -- twelve seconds after its own cleanup finished.
 * The environment was orphaned and the cleanup was green.
 *
 * Ten accumulated that way, the Static Web App hit its staging-environment cap,
 * and preview deploys began failing on unrelated PRs with "already has the
 * maximum number of staging environments". The symptom appeared nowhere near
 * the cause.
 *
 * The fix is ordering, not retrying: wait for in-flight runs, then close. These
 * tests fail if the wait is removed, if the permission it needs disappears, or
 * if the timeout is tightened back below the length of a deploy.
 */

const workflow = readFileSync(
  ".github/workflows/cost-optimized-ci.yml",
  "utf8",
);
const parsed = load(workflow) as {
  jobs: Record<string, Record<string, unknown>>;
};
const cleanup = parsed.jobs["cleanup-pr"];

describe("preview cleanup cannot race the deploy", () => {
  it("waits before closing, and closes second", () => {
    const steps = cleanup.steps as Array<{ name?: string; uses?: string }>;
    const waitIndex = steps.findIndex((s) => /wait/i.test(s.name ?? ""));
    const closeIndex = steps.findIndex((s) =>
      (s.uses ?? "").includes("static-web-apps-deploy"),
    );

    expect(waitIndex, "no step that waits for in-flight deploys").toBeGreaterThanOrEqual(0);
    expect(closeIndex, "no close step").toBeGreaterThanOrEqual(0);
    // Order is the entire fix. Closing first is the original bug.
    expect(waitIndex).toBeLessThan(closeIndex);
  });

  it("can read workflow runs, which the wait depends on", () => {
    // Without `actions: read` the API call returns nothing, the wait sees
    // "0 in flight" and closes immediately -- silently restoring the race
    // while looking like it still guards against it.
    const perms = cleanup.permissions as Record<string, string> | undefined;
    expect(perms, "cleanup-pr declares no permissions block").toBeDefined();
    expect(perms!.actions).toBe("read");
  });

  it("allows longer than a deploy takes", () => {
    // A deploy runs ~4-5 minutes. The original timeout was 5, which could not
    // have waited for one even if it had tried.
    expect(cleanup["timeout-minutes"] as number).toBeGreaterThanOrEqual(15);
  });

  it("verifies its own query can see, before trusting a zero", () => {
    // A run-listing query that silently matches nothing returns "0 in flight",
    // which is indistinguishable from a genuinely idle branch. The job counts
    // runs of ANY status first and warns when that is also zero.
    const steps = cleanup.steps as Array<{ run?: string }>;
    const waitStep = steps.find((s) => (s.run ?? "").includes("inflight"));
    expect(waitStep, "wait step not found by its helper name").toBeDefined();
    expect(waitStep!.run).toMatch(/any status/i);
    expect(waitStep!.run).toContain("::warning::");
  });

  it("derives the workflow filename instead of hard-coding it", () => {
    // A rename would otherwise turn the query into a permanent no-op that
    // still reports success.
    const steps = cleanup.steps as Array<{ run?: string }>;
    const waitStep = steps.find((s) => (s.run ?? "").includes("inflight"));
    expect(waitStep!.run).toContain("GITHUB_WORKFLOW_REF");
    expect(waitStep!.run).not.toMatch(/workflows\/cost-optimized-ci\.yml\/runs/);
  });

  it("proves these checks read a real job (guard against a vacuous pass)", () => {
    expect(cleanup).toBeDefined();
    expect((cleanup.steps as unknown[]).length).toBeGreaterThanOrEqual(2);
    expect(cleanup.if).toContain("closed");
  });
});
