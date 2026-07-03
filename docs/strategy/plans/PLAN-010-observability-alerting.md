# PLAN-010: Observability & alerting for the lead pipeline
**Status**: Blocked (by PLAN-011)
**Effort**: M · **Risk**: Low

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
   - `email.ts:118-122` test-mode logs of EMAIL_* env values: keep (not secrets, useful),
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
