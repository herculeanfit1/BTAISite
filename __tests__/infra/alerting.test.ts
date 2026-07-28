import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

// Guards the alerting declared in infra/main.bicep.
//
// The subtle failure this protects against: the contact webtest asserts that
// POST /api/contact returns 400, because a validation rejection is the healthy
// answer and proves the handler ran. If that expectation were ever "corrected"
// to 200, the test would fail on every run and page a human every 15 minutes
// until someone disabled alerting entirely — which is how monitoring dies.

const bicep = readFileSync("infra/main.bicep", "utf8");

describe("alerting is declared", () => {
  it("reads a non-trivial template (guard against a vacuous pass)", () => {
    expect(bicep.length).toBeGreaterThan(2000);
  });

  it("declares an action group with an email receiver", () => {
    expect(bicep).toContain("Microsoft.Insights/actionGroups");
    expect(bicep).toContain("emailReceivers");
    expect(bicep).toMatch(/param alertEmail string/);
  });

  it("declares both webtests and both paired alerts", () => {
    for (const name of ["wt-${prefix}-health", "wt-${prefix}-contact"]) {
      expect(bicep, `missing webtest ${name}`).toContain(name);
    }
    const alerts = bicep.match(/Microsoft\.Insights\/metricAlerts/g) ?? [];
    expect(alerts.length).toBe(2);
  });

  it("uses the webtest-specific criteria type", () => {
    // The generic SingleResourceMultipleMetricCriteria rejects the
    // (webtest + component) scope pair these alerts need, with
    // "Scopes property is invalid" at preflight.
    expect(bicep).toContain(
      "Microsoft.Azure.Monitor.WebtestLocationAvailabilityCriteria",
    );
  });

  it("tags each webtest with the hidden-link to App Insights", () => {
    // Without it the test is orphaned from the component and reports nothing.
    const links = bicep.match(/'hidden-link:\$\{appInsights\.id\}'/g) ?? [];
    expect(links.length).toBe(2);
  });
});

describe("the contact webtest expects a validation 400", () => {
  it("asserts 400, not 200", () => {
    expect(bicep).toContain("ExpectedHttpStatusCode: 400");
  });

  it("posts a payload the schema will reject, so no lead is ever created", () => {
    // Zod rejects this before any email, CRM write or queue enqueue.
    expect(bicep).toContain("not-an-email");
    expect(bicep).toMatch(/HttpVerb: 'POST'/);
  });
});

describe("alerts that would be permanently silent are not declared", () => {
  // Both were specified by PLAN-010 and both watch signals that cannot move in
  // the current architecture. A silent alert is worse than none: it reads as
  // coverage. See the Bicep comment block for the reasoning.
  // Match the DECLARATION form, not the bare word — both names appear in the
  // template's comment block explaining why they are absent, and a naive
  // substring check flags that explanation as a violation.
  const declares = (metric: string) =>
    new RegExp(`metricName:\\s*'${metric.replace("/", "\\/")}'`).test(bicep);

  it("declares no Http5xx alert on the retired Functions app", () => {
    expect(declares("Http5xx")).toBe(false);
  });

  it("declares no App Insights exceptions alert", () => {
    // Nothing server-side emits to App Insights — the SWA carries only a
    // browser-side connection string.
    expect(declares("exceptions/count")).toBe(false);
  });

  it("proves those patterns match a real declaration", () => {
    const sample = "metricName: 'Http5xx'";
    expect(/metricName:\s*'Http5xx'/.test(sample)).toBe(true);
    expect(/metricName:\s*'exceptions\/count'/.test("metricName: 'exceptions/count'")).toBe(
      true,
    );
  });
});
