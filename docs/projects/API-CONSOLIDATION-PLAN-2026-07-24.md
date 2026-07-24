# API Consolidation — Retire the Linked Backend, Serve `/api/*` from Next.js

**Status: DRAFT — for review. Do not execute.**
Written 2026-07-24. Intended to be red-teamed by a second model, revised, and only then
executed. Every claim about current state below was verified against the live system on
2026-07-24 unless marked otherwise.

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
alive.

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
| `/api/newsletter` | POST | Zod validation, honeypot fields, rate limit (3/min/IP), then **logs and returns success — no persistence** | **None found** in `app/` — apparently dead |
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
| `RESEND_TEST_MODE` | plain | `"true"` short-circuits sending |
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
  email/provider.ts            ← EmailProvider interface (the Resend-swap seam)
  email/resend-provider.ts     ← current implementation
  email/templates/…            ← ported verbatim
  hubspot.ts                   ← ported verbatim (fetch-based already)
  classify-queue.ts            ← ported verbatim (pure)
  queue-client.ts              ← NEW: @azure/storage-queue enqueue (replaces the binding)
  rate-limit.ts                ← ported; IP extraction adapted to NextRequest headers
app/api/contact/route.ts       ← POST/OPTIONS, orchestration identical to contact.ts
app/api/health/route.ts        ← {"status":"ok"}
app/api/status/route.ts        ← trivial port
app/api/newsletter/route.ts    ← port-or-drop (decision below)
app/api/csp-report/route.ts    ← port-or-drop (decision below)
__tests__/api/…                ← vitest unit tests (schema, honeypot, rate limit, handlers with mocked providers)
```

All handlers declare `export const dynamic = "force-dynamic"` (per Microsoft's own hybrid
example) so nothing is statically cached.

### Endpoint dispositions (decisions for review)

| Endpoint | Proposal | Rationale |
|---|---|---|
| `contact` | **Port fully**, behavior-identical | The product |
| `health` | **Port** | CI + monitoring depend on exact `{"status":"ok"}` |
| `status` | **Port** (10 lines) | Playwright smoke references it; near-free |
| `newsletter` | **Port but flag** | No production caller found; it also persists nothing (logs only). Cheap to port; reviewer may prefer deleting it honestly instead |
| `csp-report` | **Drop for now** | Nothing sends reports (no `report-uri` in the live CSP). Re-adding later is a small PR that adds the route *and* the CSP directive together |

---

## 5. The two hard problems

### 5.1 The queue enqueue (only real architectural change)

The Functions **output binding** (`context.extraOutputs.set(...)`) does not exist in
Next.js. Replacement: explicit enqueue with `@azure/storage-queue` —
`QueueClient.sendMessage(base64(JSON))`. Note: Functions bindings base64-encode by
default and the consumer presumably expects that — **verify consumer-side encoding
expectations before cutover** (open question Q5).

Auth options, in preference order:

1. **Queue-scoped SAS URL** (recommended): a SAS on `btai-lead-classify` only, permissions
   `a` (add) only, ~1-year expiry, stored as a Key Vault secret and surfaced to the app as
   an app setting (`CLASSIFY_QUEUE_SAS_URL`). Least privilege — can only append to one
   queue. Requires rotation discipline (documented, calendar-tracked like other 1P
   rotations).
2. Storage account connection string: simpler, but grants full account access — rejected
   while option 1 works.
3. Managed identity + `DefaultAzureCredential`: cleanest on paper, **but it is
   undocumented whether the SWA-managed hybrid backend exposes a usable IMDS/identity
   endpoint to the Next.js process**. Do not design around it; test it as a curiosity in
   Phase 0 if cheap (Q1).

Enqueue remains **non-blocking**: failure logs and never fails the submission (parity with
today).

### 5.2 Secrets and configuration

Per Microsoft: hybrid Next.js reads env vars at **request time from SWA application
settings** (and at build time from the workflow `env:` block — not needed here; all five
endpoints are runtime-only).

| Variable | Where it goes | Mechanism |
|---|---|---|
| `RESEND_API_KEY` | SWA app setting | **Key Vault reference** (supported on Standard with a system-assigned identity) |
| `HUBSPOT_TOKEN` | SWA app setting | Key Vault reference |
| `CLASSIFY_QUEUE_SAS_URL` (new) | SWA app setting | Key Vault reference (new secret in `kv-btai-site-prod`) |
| `EMAIL_FROM/TO/ADMIN/REPLY_TO`, `RESEND_TEST_MODE`, `HUBSPOT_PORTAL_ID` | SWA app settings | plain values |

Operator prerequisites (one-time, before cutover):
1. Enable **system-assigned managed identity** on the SWA (Standard plan — already on it).
2. Grant that identity **Key Vault Secrets User** on `kv-btai-site-prod` (RBAC vault).
3. Set the app settings (`az staticwebapp appsettings set`).

**Preview-environment behavior is a feature here:** per Microsoft, app settings are
copied to preview environments but **Key Vault references only resolve in production**.
So PR previews physically cannot send real email or write to HubSpot — handlers must
degrade gracefully when secrets are absent (return 503 with the existing
"service unavailable" shape; validation/honeypot paths remain fully testable in
previews). This replaces today's implicit "previews have no backend at all."

---

## 6. Behavioral deltas (parity notes)

| Concern | Today (Functions) | After (route handlers) | Assessment |
|---|---|---|---|
| Response contracts | as documented | **byte-identical JSON shapes required** — the frontend and the CI detection step both parse them | Non-negotiable; tests assert it |
| CORS | explicit allow-list incl. `*.azurestaticapps.net` | same-origin in production; keep the helper for preview-host POSTs | Keep ported helper verbatim |
| Rate limit / circuit breaker | in-memory on a Flex Consumption instance | in-memory on the managed App Service instance | Same best-effort semantics; both reset on restart and were never multi-instance-safe. Honeypot is the real spam defense. Multi-instance scale-out of the managed backend is undocumented — accept as best-effort (Q3) |
| Client IP | `x-forwarded-for` etc. | same headers via `NextRequest.headers` — **verify actual header presence through SWA+Cloudflare in Phase 0** | Spike output |
| OPTIONS preflight | explicit handler | explicit `OPTIONS` export in route handler | Same |
| Logging/telemetry | Functions → App Insights | `console.*` → SWA managed-backend logs; App Insights requires the documented SDK-preload workaround | **Observability regresses at cutover** unless the preload is added — decision Q6 |
| Security headers on `/api` responses | none needed | `next.config.js headers()` applies to `/(.*)`— harmless on JSON | No action |
| Cold start | Flex always-ready | managed backend already serves all SSR traffic (warm) | Likely neutral or better |
| `staticwebapp.config.json` | `/api/*` methods route entry | keep as-is (route rules are honored; headers aren't) | Touch nothing in that file — history says don't |

---

## 7. Phased execution plan (with gates and rollback)

**Rule inherited from the incident arc: one change per deploy, verify on the custom
domain (never only the `*.azurestaticapps.net` hostname, never HEAD requests), and never
operate on the backend link at all — it stays unlinked forever.**

### Phase 0 — Spike (½ hr, zero risk to prod behavior)
Add only `app/api/health/route.ts` + `app/api/echo-headers` (temporary, returns header
*names* + client-IP fields only). PR → preview env test → merge → prod verify.
**Gate:** `/api/health` returns `{"status":"ok"}` on bridgingtrust.ai with the backend
unlinked; header/IP fields confirmed; **the post-deploy verification health check goes
green** (contact check will still red — expected until Phase 3).
**Rollback:** revert PR; site returns to exact current state.
*(Also proves the CI detection step's `/api/health` poll passes with zero linked
backend — the core bet of the whole plan, retired for the cost of one tiny PR.)*

### Phase 1 — Port the code (offline; no deploy dependency)
Port libs into `lib/api/` behind the `EmailProvider` seam; write route handlers; port/write
unit tests (Zod schema incl. the interest enum, honeypot, rate-limit, handler orchestration
with mocked email/HubSpot/queue; response-shape snapshot tests). Local `next start` smoke:
invalid POST → 400 JSON; valid POST with `RESEND_TEST_MODE=true` → 200.
**Gate:** full suite green locally; `npm run validate` 6/6.

### Phase 2 — Platform prerequisites (operator, ~½ hr, no deploy)
SWA managed identity on; KV RBAC grant; mint queue SAS → KV secret; set all app settings.
Verify with `az staticwebapp appsettings list` (names only).
**Gate:** settings present. Nothing user-visible changes.

### Phase 3 — Cutover (one PR, one deploy)
Merge the Phase 1 PR (contact/status/newsletter routes + temporary echo route removed).
Verify on bridgingtrust.ai: health 200 · invalid POST → 400 JSON · valid POST with a
**designated test address** → 200 + Resend delivers + HubSpot contact created (then
deleted) + queue message visible (peek) · pages unaffected · **post-deploy verification
fully green for the first time since 2026-07-22.**
**Rollback:** revert PR → `/api` returns to 404-resting-state. Pages unaffected. (There is
deliberately no "re-link the Function App" rollback — that mechanism is the thing being
retired. The Function App stays deployed and warm through soak purely as an emergency
stopgap that could be called directly cross-origin if something catastrophic emerges.)

### Phase 4 — CI simplification (one PR)
Delete `deploy-functions` job; update the verification step's failure text (remove re-link
remediation — a failure now means *the app broke*, not *the platform dropped a link*);
update `notify-failure` body; close issue #46 after the first green run.
**Gate:** deploy run fully green end-to-end.

### Phase 5 — Decommission (operator, after 2-week soak)
Delete `func-btai-site-prod` (its Easy Auth identity provider dies with it). **Keep**
`stbtaisiteprod` + queue + `kv-btai-site-prod`. Delete `api/` from the repo. Remove GitHub
secrets `AZURE_CLIENT_ID/TENANT_ID/SUBSCRIPTION_ID` (verify no other workflow uses them
first — as of today only `deploy-functions` does). Optional cleanup, operator's call: the
`BTAI-Site-GitHubDeploy` app registration + both federated credentials, and the inert
`SWA Linked Backend Operator` custom role + assignment.
**Gate:** one more green deploy after each removal.

---

## 8. Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Hybrid Next.js is **in preview**; behavior can shift under us (already did once — the deploy action's floating `:stable` image) | Med | Med | Detection step runs on every deploy; it is now a true canary. Accept: the *pages* already depend on this same preview runtime, so the API adds no new platform exposure |
| R2 | SWA/edge intercepts or restricts `/api/*` in some undocumented way despite the 404 evidence | Low | High (plan invalidated) | Phase 0 spike settles it for the cost of one tiny PR |
| R3 | KV references in SWA app settings fail to resolve (misconfigured identity/RBAC) | Low-Med | High (contact 503s) | Phase 3 verification includes a real send; failure shape is explicit 503 not silent drop; fallback is plain app settings (values still encrypted at rest) at the cost of KV as single source |
| R4 | Queue consumer breaks on message encoding (base64 vs raw) or metadata differences | Med | Med (classification stalls; leads still captured in HubSpot + email) | Q5 verified before cutover; enqueue is non-blocking by design |
| R5 | Rate limiting weaker if the managed backend scales out | Low | Low (more spam email at worst) | Honeypot unchanged; Resend's own limits; acceptable per today's identical weakness |
| R6 | Observability gap at cutover (no App Insights from route handlers by default) | High | Low-Med | Ship cutover with structured `console` logging; App Insights preload as fast-follow (Q6) |
| R7 | Preview envs behave differently than prod (KV refs don't resolve there) and mask a prod-only failure | Med | Low | Phase 3 verifies against production directly, including one real submission |
| R8 | 250 MB app-size ceiling approached later | Low | Med | `output: "standalone"` documented lever, not needed now (146 MB) |
| R9 | This plan is executed with the old reflexes — multiple backend operations, apex-vs-origin confusion | — | High | The link is never touched again by anyone or anything; every verification is GET against bridgingtrust.ai |

---

## 9. Open questions for the reviewing model

1. **Q1:** Any evidence the SWA managed hybrid backend exposes managed identity to the
   Next.js process? (We assume no and use a queue SAS.)
2. **Q2:** Is KV-reference resolution in SWA app settings reliable enough for the two
   secrets, or should we prefer plain app settings synced from KV at rotation time?
3. **Q3:** Is best-effort in-memory rate limiting acceptable, or should cutover include a
   durable limiter (e.g., a small Upstash/Table-based counter)? Today's system has the
   identical weakness, so we propose parity now, hardening later.
4. **Q4:** Known hard limits (request duration, body size) for the managed hybrid backend
   that we failed to pin down from public docs?
5. **Q5:** Queue message encoding — Functions output bindings base64-encode strings by
   default; confirm what the downstream consumer expects before swapping the producer.
6. **Q6:** Ship cutover without App Insights (console-only) and fast-follow the SDK
   preload, or block cutover on it?
7. **Q7:** `newsletter` — port a logging-only endpoint nobody calls, or delete it?
8. **Q8:** Anything in Next 15.5 route-handler caching semantics beyond
   `dynamic = "force-dynamic"` we should pin (e.g., `revalidate = 0`)?

## 10. Out of scope

- **Resend-vs-alternatives evaluation** (owner: TK, separate track). The `EmailProvider`
  seam exists precisely so the outcome is a one-file change.
- Locale-URL collapse (`/en|es|fr` → canonical), analytics re-entry, `www` 526, PLAN-004
  dead-tree removal, lead-classifier taxonomy remap — all tracked in the punch list.
- Any change to `staticwebapp.config.json` routes or the Cloudflare layer.

## 11. Effort estimate

Phases 0–4: roughly **one focused day** of implementation plus verification windows,
spread over 2–3 calendar days (one deploy per phase, verified calm between). Phase 5 after
a two-week soak. No user-visible downtime at any phase; the contact form comes back up at
Phase 3.

## 12. Sources

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
