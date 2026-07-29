import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
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

function waitStepText(): string {
  const steps = cleanup.steps as Array<{ run?: string }>;
  const step = steps.find((s) => (s.run ?? "").includes("GITHUB_WORKFLOW_REF"));
  if (!step?.run) throw new Error("wait step not found in cleanup-pr");
  return step.run;
}

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
    const waitStep = waitStepText();
    expect(waitStep).toMatch(/any status/i);
    expect(waitStep).toMatch(/::(warning|error)::/);
  });

  it("derives the workflow filename CORRECTLY, by executing the derivation", () => {
    // The first version of this step asserted only that GITHUB_WORKFLOW_REF was
    // *mentioned*. It was -- and the derivation was still wrong: it did
    //   wf="${REF##*/}"; wf="${wf%%@*}"
    // which returns "merge" (the tail of refs/pull/N/merge), 404s, and hung the
    // job for its full 15-minute budget on the very first real merge.
    //
    // Presence is not behaviour. This runs the actual lines against a realistic
    // value instead of pattern-matching them.
    const waitStep = waitStepText();
    const derivation = waitStep
      .split("\n")
      .filter((l) => /^\s*wf=/.test(l))
      .map((l) => l.trim())
      .join("\n");
    expect(derivation, "no wf= derivation found").toContain("GITHUB_WORKFLOW_REF");

    const ref =
      "herculeanfit1/BTAISite/.github/workflows/cost-optimized-ci.yml@refs/pull/101/merge";
    const out = execFileSync(
      "bash",
      ["-c", `GITHUB_WORKFLOW_REF='${ref}'\n${derivation}\nprintf '%s' "$wf"`],
      { encoding: "utf8" },
    );
    expect(out, `derivation produced '${out}'`).toBe("cost-optimized-ci.yml");
  });

  it("distinguishes 'query failed' from 'zero in flight'", () => {
    // `gh api` prints its error body to stdout on a 404 while also exiting
    // non-zero, so `|| echo 0` yields `{"message":"Not Found"...}0`. That is
    // not a number, `[ "$n" -eq 0 ]` errors instead of matching, and the loop
    // spins its full duration. The rewrite returns empty on failure and treats
    // empty as a loud error rather than as zero.
    const waitStep = waitStepText();

    // Strip comments before matching. The comment above explains the bad
    // pattern by quoting it, and a naive search finds that explanation and
    // calls it the violation -- the third time that trap has appeared in this
    // repo's guards (see also Http5xx in alerting.test.ts and the staticSites
    // config declaration in swa-settings.test.ts).
    const code = waitStep
      .split("\n")
      .filter((l) => !/^\s*#/.test(l))
      .join("\n");

    expect(code).not.toMatch(/\|\|\s*echo\s*"?0"?/);
    expect(code).toMatch(/if\s+\[\s+-z\s+"\$total"\s+\]/);
    expect(code).toContain("::error::");
  });

  it("proves these checks read a real job (guard against a vacuous pass)", () => {
    expect(cleanup).toBeDefined();
    expect((cleanup.steps as unknown[]).length).toBeGreaterThanOrEqual(2);
    expect(cleanup.if).toContain("closed");
  });
});
