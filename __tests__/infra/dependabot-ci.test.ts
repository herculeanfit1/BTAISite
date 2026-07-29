import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Guards the two ways Dependabot PRs were red for reasons that had nothing to
 * do with the dependency being bumped. Both surfaced on Dependabot's first ever
 * run (2026-07-28), because the config had never parsed before that.
 */

const deployWorkflow = readFileSync(
  ".github/workflows/cost-optimized-ci.yml",
  "utf8",
);
const pkg = JSON.parse(readFileSync("package.json", "utf8"));

describe("preview deploys skip Dependabot", () => {
  it("excludes dependabot[bot] from deploy-pr-to-azure", () => {
    // Not a policy choice -- the job CANNOT succeed. Dependabot-triggered runs
    // read from a separate secret store, which has no
    // AZURE_STATIC_WEB_APPS_API_TOKEN_*, so the deploy failed with
    // `deployment_token was not provided`. Every Dependabot PR carried a red X
    // for a preview that was never possible.
    const job = deployWorkflow.slice(
      deployWorkflow.indexOf("deploy-pr-to-azure:"),
      deployWorkflow.indexOf("cleanup-pr:"),
    );
    expect(job).toContain("github.actor != 'dependabot[bot]'");
  });

  it("proves that check reads the right slice (guard against a vacuous pass)", () => {
    const job = deployWorkflow.slice(
      deployWorkflow.indexOf("deploy-pr-to-azure:"),
      deployWorkflow.indexOf("cleanup-pr:"),
    );
    expect(job.length).toBeGreaterThan(200);
    expect(job).toContain("Azure/static-web-apps-deploy");
  });
});

describe("next-intl is gone", () => {
  it("is not a declared dependency", () => {
    // Removed 2026-07-28. It was the repo's ONLY production-scope vulnerability
    // (open redirect, moderate) and nothing imported it -- CLAUDE.md had
    // recorded it as installed but never wired up. It also failed
    // `npm run security:audit`, which made every Dependabot PR red.
    const all = {
      ...(pkg.dependencies ?? {}),
      ...(pkg.devDependencies ?? {}),
    };
    expect(Object.keys(all)).not.toContain("next-intl");
  });

  it("is imported by nothing", () => {
    // If it ever comes back it must come back wired up, not as dead weight.
    const sources = [
      "app",
      "src",
      "lib",
    ].flatMap((d) => walk(d));
    const offenders = sources.filter(
      (f) =>
        /\.(ts|tsx|js|mjs)$/.test(f) &&
        /from ["']next-intl|require\(["']next-intl/.test(
          readFileSync(f, "utf8"),
        ),
    );
    expect(offenders, `still importing next-intl: ${offenders.join(", ")}`).toEqual(
      [],
    );
  });
});

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((e: string) => {
    const full = join(dir, e);
    if (e === "node_modules" || e === ".next") return [];
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}
