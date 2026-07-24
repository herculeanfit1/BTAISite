# API Consolidation — Retire the Linked Backend, Serve `/api/*` from Next.js

**Status: FINALIZED — authorized for execution (Phases 0–4).**
Written 2026-07-24; red-teamed by a second model the same day — verdict **approved with
amendments**. That review resolved all eight open questions and added six amendments
(A1–A6); both are folded into the sections below, and the former "open questions" section
is now the decision record (§9). Every claim about current state was verified against the
live system on 2026-07-24 unless marked otherwise.

**Execution discipline (unchanged, load-bearing):** one change per deploy; verify on
`bridgingtrust.ai` (never only the `*.azurestaticapps.net` origin, never HEAD); the linked
backend is **never touched again by anyone or anything.** Mandatory STOP-and-report points:
**after Phase 0's production gate** and **after Phase 3's production gate.**

> **Canonical copy:** this file (`BTAI-Site/docs/projects/`, colocated with the code) is
> **canonical from execution onward** — it is the copy the executing agent works against.
> The planning/reference snapshot lives at `HerculeanInfra/docs/projects/btai-site/`
> (finalized 2026-07-24, infra PR #636). Live execution status is tracked here, in the
> observation ledger, and on issue #46.

---

## 1. Executive summary

Move the five HTTP endpoints currently served by the Azure Functions app
(`func-btai-site-prod`) into the Next.js application as App Router **Route Handlers**
(`app/api/*/route.ts`). The Static Web App's managed hybrid backend — the thing that
already server-renders every page — then serves `/api/*` natively. The linked-backend
mechanism, the source of every outage in the 2026-07-22/23 incident arc, is eliminated
rather than repaired.

This is not a workaround; it is the **documented supported architecture**. Microsoft's
hybrid Next.js documentation lists *"Linked APIs using Azure Functions, Azure App Service,
Azure Container Apps, or Azure API Management"* as **unsupported** for hybrid Next.js
apps, and in the same document walks through creating exactly the kind of API Route
Handler this plan proposes. We have been fighting to keep an unsupported configuration
alive. The second-model review concurred: the architecture call "is not merely acceptable —
it is the documented supported path, and it structurally eliminates the failure class
rather than detecting it."

End state: one deployable (the Next.js app), one deploy job, `/api/*` can never be
"dropped" by a deploy because it ships inside the deploy, and the post-deploy verification
step goes permanently green instead of documenting an expected failure.

---

## 2. How we got here (context for the reviewer)

Full forensic detail lives in `docs/strategy/POST-ROLLUP-PUNCHLIST-2026-07-22.md` §0.
Compressed timeline:

- **2026-04-18** — SWA `bridgingtrust-website` (Next.js hybrid) + Function App
  `func-btai-site-prod` created. `/api/*` routed to the Function App via a **linked
  backend**. This worked and survived at least four deploys (04-20, 05-11, 05-18, 06-17).
- **2026-06-23** — subscription evacuation changed the Function App's resource ID; the
  linked backend silently pointed at a dead resource. Contact form dead for a month; zero
  Function App executions for 30 straight days; every Azure surface reported `Succeeded`.
- **2026-07-22/23** — link repaired, then found that **every deploy drops the linked
  backend routing** (4/4 observed). Attempts to automate the re-link caused two additional
  self-inflicted outages (a whole-site hijack where the backend captured `/`, and an
  empty-200 state recoverable only by redeploy). Automation reverted; CI is now
  detection-only.
- **2026-07-24** — the Azure Portal's APIs blade for this site offers only a *"NextJS
  backend"* Linux Web App link (it will not link a Function App at all), and the hybrid
  Next.js docs confirm Function App linking is unsupported for this app type. The
  April–June stability appears to have been legacy behavior the platform no longer honors.

**Current resting state (deliberate):** backend unlinked. All pages up (200, security
headers 4/4). `/api/*` → Next.js 404. Contact form down. Every merge to `main` produces an
expected-red deploy run (the detection step correctly reports `/api` down) and comments on
GitHub issue #46.

---

## 3. Current state — verified inventory

### 3.1 The Functions app (`api/` in this repo → `func-btai-site-prod`)

Azure Functions v4, Node 22 target, esbuild-bundled ESM, deployed by the `deploy-functions`
CI job via OIDC. Five HTTP endpoints, registered in `api/src/index.ts`:

| Route | Method | Logic | Live callers |
|---|---|---|---|
| `/api/contact` | POST, OPTIONS | Zod validation → honeypot (`_gotcha`) → in-memory rate limit (5/hr/IP) → circuit breaker (5 failures / 5 min) → **2 Resend emails** (confirmation to submitter; admin notification) → **HubSpot upsert + note** (non-blocking) → **Storage Queue enqueue** `btai-lead-classify` (non-blocking, via Functions output binding) | `app/components/home/ContactSection.tsx` (the only production caller) |
| `/api/newsletter` | POST | Zod validation, honeypot fields, rate limit (3/min/IP), then **logs and returns success — no persistence** | **None found** in `app/` — dead (→ **delete**, Q7) |
| `/api/status` | GET | Static JSON (uptime, version) | Only `src/uitests/` (dead `src/` tree, PLAN-004) |
| `/api/csp-report` | POST | Logs CSP violation reports, returns 204 | **None** — the live CSP (in `next.config.js`) has no `report-uri`; only the never-executing `app/middleware.ts` references it |
| `/api/health` | GET | `{"status":"ok"}` | **CI post-deploy verification step**; all incident tooling |

Shared libs: `email.ts` (Resend client, rate limit, circuit breaker, test mode),
`hubspot.ts` (create-or-update contact + note, 10 s timeouts, non-blocking),
`classify-queue.ts` (message schema v1, 8 KB cap, portal ID default `245473112`),
`rate-limit.ts` (IP extraction from `x-forwarded-for`/`x-real-ip`/`cf-connecting-ip`),
two HTML email templates.

### 3.2 Configuration on the Function App (names verified; values not read)

| Setting | Kind | Notes |
|---|---|---|
| `RESEND_API_KEY` | **Key Vault reference** → `kv-btai-site-prod` / `resend-api-key` | vault is RBAC-mode |
| `HUBSPOT_TOKEN` | **Key Vault reference** → `kv-btai-site-prod` / `btai-hubspot-legacy-app-token` | |
| `EMAIL_FROM / EMAIL_TO / EMAIL_ADMIN / EMAIL_REPLY_TO` | plain | code has fallback defaults |
| `RESEND_TEST_MODE` | plain | `"true"` short-circuits sending (renamed `EMAIL_TEST_MODE` in the port — A2; legacy name still read) |
| `AzureWebJobsStorage__accountName` + `__queueServiceUri` | plain | **identity-based** queue connection → `https://stbtaisiteprod.queue.core.windows.net/`, using the Function App's system-assigned managed identity |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | plain | Function-side telemetry |

The queue `btai-lead-classify` exists on `stbtaisiteprod` and is consumed downstream
(lead-classification pipeline). **The queue and storage account must survive this
migration untouched.**

### 3.3 The Next.js app

- Next 15.5.21, App Router, Node pinned `20.19.1` (`package.json` engines + CI env).
- **No `app/api/` directory exists** — `/api/*` currently falls through to Next's 404,
  which proves requests already reach the Next server when the backend is unlinked.
- Frontend contract (must not change): POST JSON
  `{firstName, lastName, email, company?, interest?, message, _gotcha?, utm*}` →
  `{success: boolean, message: string, errors?}`; network-level failure shows "problem
  connecting", non-2xx shows "problem sending".
- `.next` build output ≈ 146 MB (hybrid app size limit is 250 MB; `output: "standalone"`
  is the documented lever if that's ever approached).
- SWA app settings today: only `NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING`
  (known-inert). SWA has **no managed identity** yet.

### 3.4 CI today

- `deploy-main-to-azure`: deploy → post-deploy verification (polls `/api/health`, POSTs
  invalid payload to `/api/contact` expecting JSON 400, prints re-link remediation on
  failure). **Expected red on every merge while unlinked.**
- `deploy-functions`: builds `api/`, deploys to the Function App via OIDC
  (`AZURE_CLIENT_ID/TENANT_ID/SUBSCRIPTION_ID` secrets). Green but pointless while
  unlinked.
- `notify-failure`: files/updates GitHub issue on deploy failure (currently fires every
  merge, by design).

---

## 4. Target architecture

```
Browser ──► Cloudflare ──► SWA edge ──► managed hybrid Next.js backend
                                          ├── pages (unchanged)
                                          └── app/api/*/route.ts   ← NEW
                                                ├── Resend (email seam)
                                                ├── HubSpot REST (fetch)
                                                └── @azure/storage-queue → btai-lead-classify
```

- No linked backend. Nothing for a deploy to drop — the API ships in the same artifact as
  the pages, atomically versioned with the frontend that calls it.
- `func-btai-site-prod` decommissioned after soak (Phase 5), **keeping** `stbtaisiteprod`
  and the queue.
- One deploy job. The post-deploy verification step becomes a genuine always-green gate.

### Proposed file layout

```
lib/api/                       ← runtime-agnostic domain logic (ported from api/src/lib)
  email/provider.ts            ← EmailProvider interface + getEmailProvider() factory; test-mode no-op lives here (A2)
  email/resend-provider.ts     ← current impl — the ONLY file that imports `resend` (guard test enforces this — A2)
  email/templates/…            ← provider-agnostic HTML strings, ported verbatim
  hubspot.ts                   ← ported verbatim (fetch-based already)
  classify-queue.ts            ← ported verbatim (pure)
  queue-client.ts              ← NEW: @azure/storage-queue enqueue, byte-identical wire format (Q5)
  rate-limit.ts                ← ported; IP extraction adapted to NextRequest headers
  correlation.ts               ← NEW: per-submission short ID, logged at each stage (Q6)
app/api/contact/route.ts       ← POST/OPTIONS; orchestration identical to contact.ts, awaited-with-catch (A1), time budget (Q4)
app/api/health/route.ts        ← {"status":"ok"}
app/api/status/route.ts        ← trivial port
__tests__/api/…                ← vitest unit tests (schema, honeypot, rate limit, mocked-provider handlers, provider-import guard — A2)
```

`newsletter` is **deleted** (Q7), not ported; `csp-report` is **not created** (no
`report-uri` in the live CSP). All handlers declare `export const dynamic = "force-dynamic"`
(per Microsoft's own hybrid example) so nothing is statically cached — **Q8 confirms this
is sufficient; `revalidate = 0` adds nothing under it.**

### Endpoint dispositions (finalized)

| Endpoint | Disposition | Rationale |
|---|---|---|
| `contact` | **Port fully**, behavior-identical | The product |
| `health` | **Port** | CI + monitoring depend on exact `{"status":"ok"}` |
| `status` | **Port** (10 lines) | Playwright smoke references it; near-free |
| `newsletter` | **Delete (Q7)** | No production caller and it persists nothing — porting would launder a lie-shaped endpoint into the new architecture. Grep `app/` once more, delete, note it in the commit. A real newsletter later gets a real endpoint with real persistence |
| `csp-report` | **Drop (do not create)** | Nothing sends reports (no `report-uri` in the live CSP). Re-adding later is a small PR that adds the route *and* the CSP directive together |

### The email-provider seam (A2 — makes the provider swap a one-file change)

The Resend-vs-alternatives evaluation (TK-owned, §10) must land as a single new file, not
a refactor. The seam is therefore a hard contract, not a convenience:

- **`email/provider.ts`** defines the neutral interface and factory:
  `send(msg: {to, from, replyTo?, subject, html}) => Promise<{id: string}>` (throws on
  failure) and `getEmailProvider()`.
- **`resend-provider.ts` is the only file in the repo that imports `resend` or its types.**
  A vitest guard asserts this — scan `lib/api/` and `app/api/` for a `resend` import and
  fail if it appears anywhere else. This is what keeps the seam real over time.
- **Test mode lives at the seam.** `getEmailProvider()` returns a logging no-op provider
  when the test flag is set, so test-mode behavior survives any future provider swap. The
  flag is renamed **`EMAIL_TEST_MODE`** with a back-compat read of the legacy
  `RESEND_TEST_MODE` (both honored; new name preferred).
- Templates stay provider-agnostic HTML strings. The **circuit breaker and email rate
  limit wrap the seam, not the provider** — they are transport-independent.

Net result, on the record: swapping to Postmark / SES / Microsoft Graph later is one new
`*-provider.ts`, one secret, and one `getEmailProvider()` case. Nothing else moves.

---

## 5. The two hard problems

### 5.1 The queue enqueue (only real architectural change)

The Functions **output binding** (`context.extraOutputs.set(...)`) does not exist in
Next.js. Replacement: explicit enqueue with `@azure/storage-queue`
(`QueueClient.sendMessage(...)`).

**Wire-format parity is a HARD GATE (Q5), settled by reading reality, not by assumption.**
Functions output bindings base64-encode the string by default, and the downstream n8n
consumer was built against that. Before cutover:

1. **Peek an existing message** on `btai-lead-classify` (`az storage queue message peek`
   or the SDK) and record its exact on-wire form — base64-of-JSON vs raw JSON.
2. Make `queue-client.ts` produce a **byte-identical** wire format.
3. In Phase 3, **peek the message our test submission enqueued and diff it** against the
   recorded reference.
4. **If no old message survives** (queue TTL expired), read the n8n queue-trigger node's
   decode setting — that is the consumer contract in writing — and match it.

A silently-wrong encoding would stall classification while every surface looks green: this
arc's signature failure mode. Do not cut over until the diff matches.

**Auth — queue-scoped SAS (Q1 confirms: assume no managed identity).** A SAS on
`btai-lead-classify` only, permission `a` (add) only, **HTTPS-only, six-month expiry
aligned with the HubSpot-token rotation (A3)** — one rotation ritual, not two — stored as a
Key Vault secret and surfaced to the app as `CLASSIFY_QUEUE_SAS_URL`. Least privilege: it
can only append to one queue. Rejected alternatives: a storage-account connection string
(grants full account access); managed identity + `DefaultAzureCredential` (undocumented
whether the managed hybrid backend exposes a usable IMDS endpoint — Phase 0 may probe it
for ≤15 min as **documentation only**, but the SAS ships regardless).

**Enqueue is non-blocking on failure, but awaited (A1):** `await` the send inside
try/catch so failure is logged and swallowed, but the work completes before the response
returns — never fire-and-forget (see §5.3 and §6; the managed backend may kill
post-response work).

### 5.2 Secrets and configuration

Per Microsoft: hybrid Next.js reads env vars at **request time from SWA application
settings** (and at build time from the workflow `env:` block — not needed here; all
endpoints are runtime-only).

| Variable | Where it goes | Mechanism |
|---|---|---|
| `RESEND_API_KEY` | SWA app setting | **Key Vault reference** (supported on Standard with a system-assigned identity) |
| `HUBSPOT_TOKEN` | SWA app setting | Key Vault reference |
| `CLASSIFY_QUEUE_SAS_URL` (new) | SWA app setting | Key Vault reference (new secret in `kv-btai-site-prod`) |
| `EMAIL_FROM/TO/ADMIN/REPLY_TO`, `EMAIL_TEST_MODE`, `HUBSPOT_PORTAL_ID` | SWA app settings | plain values |

**Decision (Q2): use Key Vault references, not plain settings.** `kv-btai-site-prod` stays
the single source of truth, the pattern is already proven on the Function App side for a
year, and the failure shape is loud (explicit 503, §R3) — the opposite of the silent
failures this arc was about. Phase 3's real send is the test. **Fallback:** if refs ever
fail to resolve, flipping to plain app settings is a five-minute operator action,
documented here and punch-listed to revisit — not a reason to pre-emptively downgrade.

Operator prerequisites (one-time, before cutover):
1. Enable **system-assigned managed identity** on the SWA (Standard plan — already on it).
2. Grant that identity **Key Vault Secrets User** on `kv-btai-site-prod` (RBAC vault).
3. Set the app settings (`az staticwebapp appsettings set`).

**Preview-environment behavior is a feature here:** per Microsoft, app settings are copied
to preview environments but **Key Vault references only resolve in production.** So PR
previews physically cannot send real email or write to HubSpot — handlers must degrade
gracefully when secrets are absent (return 503 with the existing "service unavailable"
shape; validation/honeypot paths remain fully testable in previews). This replaces today's
implicit "previews have no backend at all."

### 5.3 Handler execution budget and observability (Q4, Q6)

**Total time budget (Q4).** Public docs don't pin the managed backend's request-duration
ceiling, so the handler must never let an unknown platform limit be what terminates it.
Wrap the `contact` orchestration in an explicit budget so that even the worst case — both
Resend and HubSpot exhausting their 10 s timeouts — returns a well-formed JSON error
comfortably under ~25 s. **Terminate ourselves with a clean contract before the platform
can terminate us with an opaque 5xx.**

**Correlation ID (Q6).** Generate a short per-submission ID and log it at each stage —
`validated → emailed → hubspot → enqueued`. This is the interim observability contract:
one lead's full path is traceable in the managed-backend console logs without App Insights.
App-Insights SDK-preload for route handlers is a **fast-follow, not a cutover blocker**
(punch-list item, §10, with an explicit "done when": route-handler telemetry visible in
App Insights for a test submission).

---

## 6. Behavioral deltas (parity notes)

| Concern | Today (Functions) | After (route handlers) | Assessment |
|---|---|---|---|
| Response contracts | as documented | **byte-identical JSON shapes required** — the frontend and the CI detection step both parse them | Non-negotiable; tests assert it |
| **Post-response work (HubSpot, enqueue)** | Functions runtime lets work continue after the response is sent | **Undocumented** on the managed hybrid backend — unawaited work may be killed mid-flight, dropping a lead with a 200 already sent | **A1: `await` each inside try/catch** — failure logged and swallowed (failure-non-blocking) but always completed before responding (time-blocking, bounded by the Q4 budget). The one place "port verbatim" would silently change meaning across runtimes |
| Request wall-clock ceiling | Flex Consumption limits | managed-backend ceiling undocumented (Q4) | **Self-terminate** with a well-formed JSON error under ~25 s before the platform can (§5.3) |
| CORS | explicit allow-list incl. `*.azurestaticapps.net` | same-origin in production; keep the helper for preview-host POSTs | Keep ported helper verbatim |
| Rate limit / circuit breaker | in-memory on a Flex Consumption instance | in-memory on the managed App Service instance | **Q3: parity now** — same best-effort semantics; both reset on restart and were never multi-instance-safe. Honeypot is the real spam defense. Durable Table-storage limiter → punch list (v-next) |
| Client IP | `x-forwarded-for` etc. | same headers via `NextRequest.headers` — **verify actual header presence through SWA+Cloudflare in Phase 0** | Spike output |
| OPTIONS preflight | explicit handler | explicit `OPTIONS` export in route handler | Same |
| Logging/telemetry | Functions → App Insights | `console.*` + **correlation ID (Q6)** → SWA managed-backend logs; App Insights SDK-preload is a punch-listed fast-follow | Observability is interim-console at cutover by design, not a regression left unmanaged |
| Security headers on `/api` responses | none needed | `next.config.js headers()` applies to `/(.*)` — harmless on JSON | No action |
| Cold start | Flex always-ready | managed backend already serves all SSR traffic (warm) | Likely neutral or better |
| `staticwebapp.config.json` | `/api/*` methods route entry | keep as-is (route rules are honored; headers aren't) | Touch nothing in that file — history says don't |

---

## 7. Phased execution plan (with gates and rollback)

**Rule inherited from the incident arc: one change per deploy, verify on the custom domain
(never only the `*.azurestaticapps.net` hostname, never HEAD requests), and never operate
on the backend link at all — it stays unlinked forever. Every deploy from Phase 0 through
Phase 3 updates the observation ledger; Phase 4 retires it.**

### Phase 0 — Spike (½ hr, zero risk to prod behavior) · STOP after prod gate
Add only `app/api/health/route.ts` + a **temporary, boring** `app/api/echo-headers` route
that returns header *names* and the client-IP fields only — **never values of cookies or
auth headers (A5)**. PR → preview-env test → merge → prod verify.
**Gate:**
- `/api/health` returns `{"status":"ok"}` on bridgingtrust.ai with the backend unlinked.
- **Double-request test (Q8):** hit `/api/health` twice varying a query param (or check a
  logged timestamp) and confirm the handler *actually executes both times* — an
  edge-cached 200 must not be able to masquerade as a working handler.
- Header names + client-IP fields confirmed present through SWA + Cloudflare.
- **The post-deploy verification health check goes green** (the contact check still reds —
  expected until Phase 3).
- *Optional, ≤15 min, documentation only (Q1):* probe whether an IMDS/identity endpoint is
  reachable from a route handler. The result changes nothing — the SAS ships either way.
**Named checklist item:** the `echo-headers` route is removed in Phase 3 (A5) — write it
down now, don't trust memory.
**Rollback:** revert PR; site returns to exact current state.
*(This retires the core bet of the plan — that the managed backend serves `/api/*` with
zero linked backend — for the cost of one tiny PR.)*
**→ STOP and report the gate table with actuals before Phase 1.**

### Phase 1 — Port the code (offline; no deploy dependency)
Port libs into `lib/api/` **behind the `EmailProvider` seam (A2)** — `provider.ts` +
`resend-provider.ts` + the provider-import guard test; rename the flag to `EMAIL_TEST_MODE`
(legacy `RESEND_TEST_MODE` still read). Write the route handlers with:
- **awaited-with-catch** HubSpot + enqueue (A1),
- an explicit **total time budget** (Q4),
- **correlation-ID** logging at each stage (Q6),
- `export const dynamic = "force-dynamic"` (Q8).
**Delete `newsletter` (Q7)** — grep `app/` once more to confirm no caller, delete, note it
in the commit message. Do **not** create `csp-report`. Port/write unit tests (Zod schema
incl. the interest enum, honeypot, rate-limit, handler orchestration with mocked
email/HubSpot/queue; response-shape snapshot tests; the provider-import guard). Local
`next start` smoke: invalid POST → 400 JSON; valid POST with `EMAIL_TEST_MODE=true` → 200.
**Gate:** full suite green locally; `npm run validate` 6/6; provider-import guard passes.

### Phase 2 — Platform prerequisites (operator, ~½ hr, no deploy)
SWA system-assigned managed identity on; grant it **Key Vault Secrets User** on
`kv-btai-site-prod`; mint the **six-month, add-only, HTTPS-only queue SAS (A3)** → store as
a KV secret → app setting `CLASSIFY_QUEUE_SAS_URL`; set all app settings (KV refs for the
three secrets, plain for the rest). Verify with `az staticwebapp appsettings list` (names
only). **Record the SAS expiry on the existing rotation calendar alongside the HubSpot
token.**
**Gate:** settings present. Nothing user-visible changes.

### Phase 3 — Cutover (one PR, one deploy) · STOP after prod gate
Merge the Phase 1 PR; **remove the temporary `echo-headers` route in the same PR (A5).**
Verify on bridgingtrust.ai:
- health 200 · invalid POST → 400 JSON;
- valid POST with a **designated test address** → 200 · Resend delivers · HubSpot contact
  created · queue message enqueued;
- **queue byte-diff (Q5/A4):** peek the enqueued message, diff against the recorded
  reference wire format — must match;
- **correlation-ID trace (A4):** the submission's `validated → emailed → hubspot →
  enqueued` line is visible in the managed-backend logs;
- **the CI detection contact check goes green on this very deploy (A4)** — its green-to-red
  flip is the standing canary, so watch it prove itself on day one;
- pages unaffected; **post-deploy verification fully green for the first time since
  2026-07-22.**
**CRM hygiene:** the test HubSpot contact is deleted **by the operator (TK), not by the
executing agent** — flag it, never delete CRM records autonomously.
**Rollback:** revert PR → `/api` returns to 404 resting state, pages unaffected. There is
deliberately no "re-link the Function App" rollback — that mechanism is what's being
retired. The Function App stays deployed and warm through soak purely as an emergency
cross-origin stopgap.
**→ STOP and report the gate table with actuals before Phase 4.**

### Phase 4 — CI simplification (one PR)
Delete the `deploy-functions` job; rewrite the verification step's failure text (a failure
now means *the app broke*, not *the platform dropped a link*); update `notify-failure`;
close issue #46 after the first green run. **Retire the observation ledger here (A4).**
**Gate:** deploy run fully green end-to-end.

### Phase 5 — Decommission (operator, after 2-week soak)
Delete `func-btai-site-prod` (its Easy Auth identity provider dies with it). **Keep**
`stbtaisiteprod` + queue + `kv-btai-site-prod`. Delete `api/` from the repo. Remove GitHub
secrets `AZURE_CLIENT_ID/TENANT_ID/SUBSCRIPTION_ID` (verify no other workflow uses them —
today only `deploy-functions` does). Optional operator cleanup: the `BTAI-Site-GitHubDeploy`
app registration + federated credentials, and the inert `SWA Linked Backend Operator`
custom role + assignment.
**Gate:** one more green deploy after each removal.

---

## 8. Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Hybrid Next.js is **in preview**; behavior can shift under us (already did once — the deploy action's floating `:stable` image) | Med | Med | Detection step runs on every deploy; it is now a true canary. Accept: the *pages* already depend on this same preview runtime, so the API adds no new platform exposure |
| R2 | SWA/edge intercepts or restricts `/api/*` in some undocumented way despite the 404 evidence | Low | High (plan invalidated) | Phase 0 spike settles it for the cost of one tiny PR |
| R3 | KV references in SWA app settings fail to resolve (misconfigured identity/RBAC) | Low-Med | High (contact 503s) | Phase 3 verification includes a real send; failure shape is explicit 503 not silent drop; fallback is plain app settings (values still encrypted at rest) at the cost of KV as single source (Q2) |
| R4 | Queue consumer breaks on message encoding (base64 vs raw) or metadata differences | Med → **gated at cutover** | Med (classification stalls; leads still captured in HubSpot + email) | **Q5 is now a hard gate:** peek-and-diff the real wire format before and at cutover; enqueue is awaited-with-catch, non-blocking on failure |
| R5 | Rate limiting weaker if the managed backend scales out | Low | Low (more spam email at worst) | Honeypot unchanged; Resend's own limits; parity with today's identical weakness (Q3); durable limiter punch-listed |
| R6 | Observability gap at cutover (no App Insights from route handlers by default) | High | Low-Med | Correlation-ID console logging ships at cutover (Q6); App Insights preload is a punch-listed fast-follow with an explicit "done when" |
| R7 | Preview envs behave differently than prod (KV refs don't resolve there) and mask a prod-only failure | Med | Low | Phase 3 verifies against production directly, including one real submission |
| R8 | 250 MB app-size ceiling approached later | Low | Med | `output: "standalone"` documented lever, not needed now (146 MB) |
| R9 | This plan is executed with the old reflexes — multiple backend operations, apex-vs-origin confusion | — | High | The link is never touched again by anyone or anything; every verification is GET/POST against bridgingtrust.ai |

---

## 9. Resolved decisions (second-model review, 2026-07-24)

The plan was red-teamed by a second model: **approved with amendments.** All eight open
questions are resolved; the resolutions are folded into the sections above and recorded
here for provenance.

| # | Question | Decision |
|---|---|---|
| Q1 | Managed identity to the Next process? | **Assume no.** Design on the queue SAS. Phase 0 may probe an IMDS endpoint for ≤15 min as documentation only; the SAS ships regardless (§5.1) |
| Q2 | KV references vs plain app settings? | **Key Vault references** — proven pattern, single source of truth, loud 503 failure shape. Plain-settings flip is the documented five-minute fallback, not a pre-emptive downgrade (§5.2, R3) |
| Q3 | Best-effort rate limit vs durable now? | **Parity now** (in-memory best-effort); honeypot is the real defense. Durable Table-storage counter → punch list, v-next (§6, R5) |
| Q4 | Unknown platform request limits? | **Self-terminate first:** explicit handler time budget returns a clean JSON error under ~25 s even if both external calls time out (§5.3, §6) |
| Q5 | Queue message encoding? | **Hard gate.** Peek the live queue, record the exact wire form, produce byte-identical output, diff at cutover; fall back to the n8n node's decode setting if TTL expired (§5.1, Phase 3) |
| Q6 | App Insights at cutover? | **Ship with correlation-ID console logging**; App Insights SDK-preload is a punch-listed fast-follow with a named "done when" (§5.3, §6) |
| Q7 | Newsletter — port or delete? | **Delete.** No caller, no persistence; porting would launder a lie-shaped endpoint. Grep once more, delete, note in the commit (§4, Phase 1) |
| Q8 | Route-handler caching beyond `force-dynamic`? | **`force-dynamic` is sufficient**; `revalidate = 0` adds nothing. Phase 0 adds a double-request test so an edge-cached 200 can't masquerade as a live handler (§4, Phase 0) |

**Amendments folded in:** A1 awaited-with-catch post-response work (§5.1/§5.3/§6) · A2 hard
EmailProvider seam contract with import guard + `EMAIL_TEST_MODE` (§4) · A3 six-month SAS
aligned to the HubSpot rotation (§5.1, Phase 2) · A4 Phase 3 gate additions (correlation
trace, queue byte-diff, CI canary) + ledger-retire in Phase 4 · A5 echo-route hygiene +
named removal (Phase 0/3) · A6 punch-list deltas (§10).

**Execution authorization:** Phases 0–4 are authorized with the amended gates. Mandatory
STOP-and-report points: **after Phase 0's production gate** and **after Phase 3's
production gate.** Phase 5 waits for the operator after the two-week soak.

---

## 10. Out of scope + punch-list deltas (A6)

Out of scope (unchanged):
- **Resend-vs-alternatives evaluation** (owner: TK, separate track). The `EmailProvider`
  seam (§4/A2) exists precisely so the outcome is a one-file change — unblocked by design.
- Locale-URL collapse (`/en|es|fr` → canonical), analytics re-entry, `www` 526, PLAN-004
  dead-tree removal, lead-classifier taxonomy remap — all tracked in the punch list.
- Any change to `staticwebapp.config.json` routes or the Cloudflare layer.

Punch-list deltas to record on completion (A6):
- Close the linked-backend §0 saga in `POST-ROLLUP-PUNCHLIST-2026-07-22.md` with a pointer
  to **this plan as the resolution** (cause, fix, doc citation).
- Add **durable rate limiter** (Q3) and **App Insights route-handler preload** (Q6) as
  v-next hardening items, each with a "done when."
- Keep the Resend-vs-alternatives evaluation exactly where it is — operator-owned.

---

## 11. Effort estimate

Phases 0–4: roughly **one focused day** of implementation plus verification windows,
spread over 2–3 calendar days (one deploy per phase, verified calm between), with the two
mandatory STOP points at Phase 0 and Phase 3. Phase 5 after a two-week soak. No
user-visible downtime at any phase; the contact form comes back up at Phase 3.

---

## 12. Open Brain captures on completion

Search-first, one idea each:
- The cutover outcome and final architecture (route handlers, no linked backend).
- The **queue-encoding finding** (Q5's answer, whatever it turns out to be) — the exact
  wire format the n8n consumer requires.
- The **EmailProvider seam** pattern as the reusable provider-abstraction template.
- The **closing entry of the linked-backend saga** — cause, resolution, and the doc
  citation that settled it (Function App linking unsupported for hybrid Next.js).

---

## 13. Sources

- Microsoft Learn — [Deploy hybrid Next.js websites on Azure Static Web Apps (Preview)](https://learn.microsoft.com/en-us/azure/static-web-apps/deploy-nextjs-hybrid):
  route-handler support, linked-Functions **unsupported** list, env-var guidance, 250 MB
  limit, standalone output, `/.swa/health.html` deployment validation, App Insights preload.
- Microsoft Learn — [Bring your own functions to Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/functions-bring-your-own):
  the (non-hybrid) linked-backend model this site was incorrectly using.
- Microsoft Learn — [Secure authentication secrets in Azure Key Vault for Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/key-vault-secrets):
  KV references in app settings; **production-environment-only** resolution; identity
  prerequisites.
- Live-system verification 2026-07-24: Function App settings names + KV-ref detection,
  queue existence, SWA settings/identity, frontend contract, CI workflow state.
- **Second-model review 2026-07-24** — approved-with-amendments; resolutions recorded in §9.
