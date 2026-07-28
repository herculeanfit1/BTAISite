# PLAN-010: Observability & alerting for the lead pipeline

**Status**: Executed and **deployed** 2026-07-27 — see "Execution notes"
**Effort**: M · **Risk**: Low

## Execution notes (2026-07-27)

The premise is correct and was verified live, not assumed: the resource group contains
**zero** metric alerts, action groups and webtests. Nothing alerts anyone when the lead
pipeline breaks.

### Two of the three proposed alerts would never have fired

This is the finding that changes the plan. Both were checked against live state:

| Proposed alert                                                            | Verdict                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `alert-func-5xx` — `Http5xx` on `Microsoft.Web/sites/func-btai-site-prod` | **Structurally always zero.** That app has served no traffic since 2026-07-24                                                                                                                                              |
| `alert-func-exceptions` — App Insights `exceptions/count`                 | **Nothing server-side emits to App Insights.** The Static Web App holds only `NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING` — browser telemetry. CLAUDE.md says the managed backend's observability channel is stdout |
| Availability webtest on `/api/health`                                     | **Works.** Probes from outside, depends on no in-process instrumentation                                                                                                                                                   |

Shipping the first two would have been worse than shipping nothing: a permanently silent
alert reads as coverage. They are deliberately absent, and `infra/main.bicep` records why
so nobody "fixes" the omission later.

### What was built instead

- **Action group** `ag-btai-site-prod` (email), parameterised via `alertEmail`.
- **`wt-btai-site-health`** — GET `/api/health` every 5 min from 3 regions, content-matching
  `"status"` (the same string the deploy gate greps) with SSL expiry checking.
- **`wt-btai-site-contact`** — the addition the plan did not have. It POSTs a deliberately
  **invalid** payload and requires a **400**. Zod rejects it before any email, CRM write or
  enqueue, so it exercises the real contact handler continuously **without ever creating a
  lead**. A health check alone cannot catch "site up, form broken", which is the failure
  that actually costs money.
- **Two paired availability alerts**, severity 1, on the action group.

`Microsoft.Azure.Monitor.WebtestLocationAvailabilityCriteria` is required here — the
generic single-resource criteria the plan implies rejects the (webtest + component) scope
pair with `Scopes property is invalid`.

### Steps that were moot

- **`api/host.json` logging config (step 2)** — retired tree; nothing reads it.
- **The `console.*` → `context.log` sweep (step 3)** targets `api/src/functions/*`. The
  live equivalent is `apiLog` in `src/lib/api/`, and only **two** bare calls existed
  (`hubspot.ts`, `send-contact-email.ts`). Both converted, and a static guard test now
  fails if one reappears.
- **The live-fire test (step 5)** proposes stopping the Function App. That would prove
  nothing: the availability tests probe `bridgingtrust.ai`, which the Functions app has not
  served since 2026-07-24.

### PII

The plan's line references are stale but the concern was real. `contact-handler.ts` logged
the submitter's **full email address on every validated submission**, into a store with
30-day retention. Now logs `interest` and `hasCompany` only. Raw IPs in the honeypot and
oversize paths are reduced to `ipClass` — `resolved` or `unknown`. Both are covered by a
test that fails if either value reappears.

### Deployed 2026-07-27

Applied to `BTAI-RG1` with `alertEmail=terence@bridgingtrust.ai` on owner approval. All
five resources exist: action group `ag-btai-site-prod`, webtests `wt-btai-site-health` and
`wt-btai-site-contact`, and both severity-1 availability alerts (enabled, PT15M window,
PT5M frequency).

**The first apply FAILED**, and the reason is worth recording: `RoleAssignmentExists` on
both role assignments. They already existed in Azure under hand-created GUIDs, and Bicep
names role assignments with `guid()`, so redeclaring them is a conflict.
**`what-if` cannot read role assignments**, so it reported them as `Create` and gave no
warning — a clean `what-if` does not guarantee a clean apply. The alerting resources had
already been created by the time the role assignments failed, so the practical damage was
zero, but the deployment was marked Failed.

Resolved by removing both role assignments from the template. They granted Storage Blob
Data Owner and Key Vault Secrets User to `func-btai-site-prod`'s managed identity, and
that app is being deleted in Phase 5. The live app uses neither: it reaches the queue with
a queue-scoped SAS and holds its own settings. The redeploy succeeded.

**Verified functional, not merely present.** Both webtests report **100% availability**,
which confirms the subtle case: Azure accepts `ExpectedHttpStatusCode: 400` and treats the
contact endpoint's validation rejection as a _pass_. Had it not, the test would fail every
run and page a human every 15 minutes until someone disabled alerting — the way monitoring
usually dies.

**No alert has actually fired.** The probes are green, so there has been nothing to fire
on. Forcing one would mean breaking production or standing up a throwaway failing webtest;
neither was in scope. The wiring is verified end-to-end short of that final step, and this
is stated rather than glossed.

`__tests__/infra/alerting.test.ts` guards the configuration — in particular that the
contact webtest keeps expecting 400, and that the two permanently-silent alerts stay
absent.

### Previously: not deployed — deliberate

`what-if` confirms the change is purely additive (5 Creates: action group, 2 webtests,
2 alerts; no Delete). **Deployment is left for the owner** because it creates billable
resources and configures email to a real inbox — an outward-facing action beyond "declare
the IaC". Until it is applied, **the alerts protect nothing**. The command and the
live-fire check are in the PR body.

## Context

The contact pipeline is the business's revenue front door, and today **nothing alerts
anyone when it breaks**. There are no metric alerts, availability tests, or action groups
anywhere in IaC or scripts. A Resend outage, expired HubSpot token, or Key Vault
misconfiguration would silently lose every lead until someone happens to test the form.
Logging in the Functions is a mix of `context.log` (App Insights-correlated) and bare
`console.*`, `host.json` has no logging configuration, and several log lines include
raw PII (name, email, IP) — a GDPR liability sitting in Log Analytics.

Blocked by PLAN-011 because both plans edit `infra/main.bicep`; land the IaC-completeness
plan first so this one builds on an accurate baseline.

## Goal / Non-goals

**Goal**: A human is notified within ~15 minutes when the API errors or goes
unreachable; Functions logs are consistent, correlated, and PII-free.
**Non-goals**: Dashboards/workbooks (nice-to-have, later); frontend RUM changes
(App Insights web SDK wiring already exists in `src/lib/telemetry.ts` → root `lib/` after
PLAN-004); SLOs; paging integration (email is sufficient at this scale).

## Current state

- `infra/main.bicep` — Log Analytics (30-day retention, `:47`), workspace-based App
  Insights (`:51-60`), Functions app with `APPLICATIONINSIGHTS_CONNECTION_STRING`
  (`:121-123`). **Zero** `Microsoft.Insights/metricAlerts`, `actionGroups`, `webtests`,
  or `scheduledQueryRules` resources.
- `api/host.json` — only `version` + `extensionBundle`; no `logging` section.
- Logging inconsistency: `api/src/functions/contact.ts:78,132,143,223` use `console.*`
  while `:167-200` use `context.log`. PII in logs: `contact.ts:143-148` logs full
  name/email/company/IP on every success; `cspReport.ts:20` logs user-agent.
  (`newsletter.ts:67` PII log removed by PLAN-006.)
- `api/src/functions/health.ts` returns static `{status:"ok"}` — liveness only, which is
  fine for an availability test target.
- CLAUDE.md's `context.log` binding trap: never pass it bare; arrow-wrap.

## Target state

Bicep declares an action group + three alerts; `host.json` configures sampling; all
Functions logging goes through `context.log` with no raw PII.

## Steps

1. Bicep additions (`infra/main.bicep`), parameterized:
   - `param alertEmail string` — add to `infra/parameters.prod.json` with value
     `admin@bridgingtrust.ai` (matches EMAIL_ADMIN convention in CLAUDE.md's env
     sample; the operator can change the address at deploy time).
   - `Microsoft.Insights/actionGroups` `ag-btai-site-prod`: one email receiver
     (`alertEmail`), `groupShortName` ≤12 chars e.g. `btai-prod`.
   - Metric alert `alert-func-5xx`: scope = the Functions app, metric `Http5xx`
     (Microsoft.Web/sites), threshold > 0, window PT15M, frequency PT5M, severity 2,
     action group above.
   - Metric alert `alert-func-exceptions` on App Insights `exceptions/count` > 5 over
     PT15M, severity 3 (catches handler crash-loops that still return via platform).
   - Availability: `Microsoft.Insights/webtests` standard test (SyntheticMonitorId
     pattern) against `https://bridgingtrust.ai/api/health`, 5-minute frequency, 3
     locations (`us-ca-sjc-azr`, `us-il-ch1-azr`, `us-va-ash-azr`), plus the paired
     metric alert on `availabilityResults/availabilityPercentage < 100` over PT15M,
     severity 2. Webtests require the `hidden-link` tag to the App Insights resource —
     include it.
2. `api/host.json`: add
   ```json
   "logging": {
     "applicationInsights": {
       "samplingSettings": { "isEnabled": true, "excludedTypes": "Request" }
     },
     "logLevel": { "default": "Information" }
   }
   ```
3. Logging consistency pass over `api/src/functions/*.ts` and `api/src/lib/*.ts`:
   - Replace every `console.log/warn/error` with `context.log` / `context.warn` /
     `context.error` (v4 model exposes these on `InvocationContext`); where libs need a
     logger, keep the existing `Logger` type and pass `(msg, meta) => context.log(msg, meta)`
     (the binding trap).
   - PII scrub: `contact.ts:143-148` → log only
     `{contactIdPresent: bool, company: bool, interest, ipClass: "public"|"unknown"}` —
     never name/email/raw IP. `cspReport.ts` → drop user-agent (PLAN-009 also touches
     this; coordinate — whichever lands second rebases).
   - `email.ts:118-122` test-mode logs of EMAIL\_\* env values: keep (not secrets, useful),
     but gate behind test mode only (verify it already is).
4. Deploy: `az deployment group create --resource-group BTAI-RG1 --template-file
infra/main.bicep --parameters infra/parameters.prod.json` — run `what-if` FIRST and
   confirm only additions (see PLAN-011's baseline discipline).
5. Fire a real alert once: temporarily stop the Function App
   (`az functionapp stop -n func-btai-site-prod -g BTAI-RG1`), wait for the
   availability alert email (≤ ~20 min), restart. Do this in a low-traffic window and
   note it in the PR. If stopping prod is unacceptable to the operator, validate with a
   deliberate synthetic: point a SECOND temporary webtest at a nonexistent path, confirm
   it alerts, then delete it.

## Security & compliance notes

- Removing PII from logs is the material compliance win here (GDPR data-minimization;
  Log Analytics retains 30 days).
- Alert emails contain resource names only — no lead data.
- No new secrets; action group email is configuration, not a credential.
- Audit trail: alerts and their firing history are visible in Azure Monitor — SOC 2
  monitoring-control evidence.

## Validation

```bash
az deployment group what-if -g BTAI-RG1 --template-file infra/main.bicep \
  --parameters infra/parameters.prod.json     # only Create entries, no Delete/Modify surprises
cd api && npm run typecheck && npm test       # logging refactor green
grep -rn "console\." api/src/                 # → empty
az monitor metrics alert list -g BTAI-RG1 -o table   # three alerts present
```

Plus the live-fire test in step 5 — an alert that has never fired is theater.

## Rollback

`az deployment group create` with the previous template revision (git revert first);
alert resources delete cleanly. Logging changes revert with the Functions redeploy.
