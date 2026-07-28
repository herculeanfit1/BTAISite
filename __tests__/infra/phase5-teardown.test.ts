import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";

// API-consolidation Phase 5 completed 2026-07-27: the Azure Functions tree and
// its compute are gone.
//
// This guards the return of a decoy, not a bug. `api/` was undeployed for three
// days short of a month and in that time SIX strategy plans were written against
// it as though it were live — one would have "fixed" a production vulnerability
// there while leaving the real one running. A tree that looks authoritative and
// executes nowhere is worse than no tree.

describe("the retired Functions tree stays gone", () => {
  it("has no api/ directory", () => {
    expect(existsSync("api")).toBe(false);
  });

  it("tracks no files under api/", () => {
    const tracked = execSync("git ls-files api", { encoding: "utf8" }).trim();
    expect(tracked, `still tracked:\n${tracked}`).toBe("");
  });

  it("proves the git check can see files (guard against a vacuous pass)", () => {
    // If `git ls-files` were broken or scoped wrongly, the assertion above
    // would pass on an empty string forever.
    const some = execSync("git ls-files src/lib/api", { encoding: "utf8" }).trim();
    expect(some.length).toBeGreaterThan(0);
  });

  it("is not excluded by tsconfig — there is nothing to exclude", () => {
    const tsconfig = readFileSync("tsconfig.json", "utf8");
    expect(JSON.parse(tsconfig).exclude).not.toContain("api");
  });

  it("declares no Functions app or plan in the Bicep", () => {
    const bicep = readFileSync("infra/main.bicep", "utf8");
    expect(bicep).not.toMatch(/resource\s+functionsApp\s/);
    expect(bicep).not.toMatch(/Microsoft\.Web\/serverfarms/);
    expect(bicep).not.toMatch(/resource\s+plan\s+'Microsoft\.Web/);
  });

  it("proves those Bicep patterns could match a real declaration", () => {
    expect(/resource\s+functionsApp\s/.test("resource functionsApp 'Microsoft.Web/sites@2024-04-01' = {")).toBe(true);
    expect(/Microsoft\.Web\/serverfarms/.test("'Microsoft.Web/serverfarms@2024-04-01'")).toBe(true);
  });
});

describe("what Phase 5 deliberately kept", () => {
  const bicep = readFileSync("infra/main.bicep", "utf8");

  it("keeps the storage account and the live lead-classification queue", () => {
    // stbtaisiteprod hosts btai-lead-classify, which production writes to on
    // every submission. Deleting it breaks the pipeline.
    expect(bicep).toContain("Microsoft.Storage/storageAccounts");
    expect(bicep).toContain("btai-lead-classify");
  });

  it("keeps App Insights and Log Analytics, which the deployed alerting needs", () => {
    expect(bicep).toContain("Microsoft.Insights/components");
    expect(bicep).toContain("Microsoft.OperationalInsights/workspaces");
  });

  it("keeps Key Vault", () => {
    // Nothing reads it today — the SWA's settings are literals — but it is the
    // intended home for secrets and closing that gap is tracked work.
    expect(bicep).toContain("Microsoft.KeyVault/vaults");
  });

  it("records that the resource group is shared", () => {
    // BTAI-RG1 holds other projects' resources. Teardown is never "delete the
    // resource group", and the template says so where someone will read it.
    expect(bicep.toUpperCase()).toContain("SHARED");
  });
});
