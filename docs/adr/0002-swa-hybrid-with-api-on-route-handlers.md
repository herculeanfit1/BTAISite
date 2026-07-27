# 2. Azure Static Web Apps hybrid rendering, with `/api/*` on App Router route handlers

Date: 2026-07-26

## Status

Accepted. Supersedes [0001](0001-project-architecture.md).

## Context

ADR 0001 specified static export (`output: "export"`) to Azure Static Web Apps. That
design could not survive contact-form delivery: a static export has no server, so the
form needed a backend. Two successive architectures followed, and neither was recorded
as an ADR — this one records the end state and the reasoning, so the next reader does
not have to reconstruct it from `git log`.

The intermediate architecture was SWA's Oryx **hybrid** build plus a **linked Azure
Functions** app serving `/api/*`. It worked, but the link between the Static Web App and
the Function App proved unreliable: the backend became unlinked repeatedly (observed
four times out of four deploys), each time taking the contact form down while all pages
stayed up. Attempts to automate re-linking in CI caused two further incidents and were
reverted. The resting state before this decision was: backend deliberately unlinked,
`/api/*` returning 404, contact form down.

The observation that unblocked it: with the backend unlinked, requests to `/api/*` still
reached the Next.js server (they produced Next's own 404, not the platform's). The
managed hybrid backend that already server-renders every page could therefore serve
`/api/*` natively, with no second deployable and no link to break.

## Decision

Serve the whole site — pages **and** `/api/*` — from the single Next.js app on SWA's
managed hybrid backend.

- **Rendering**: SWA Oryx hybrid build. Not static export. `images.unoptimized: true` is
  required by the platform. `skip_app_build: true` must not be set.
- **API**: App Router route handlers at `app/api/{contact,health,status}/route.ts`, each
  a thin adapter over runtime-agnostic domain logic in `src/lib/api/`. The domain layer
  holds no framework imports so it stays unit-testable and portable.
- **No linked backend.** `api_location` is empty in the deploy workflow. The Azure
  Functions project remains in the tree at `api/` as dead code pending teardown.
- **`newsletter` was not ported.** It validated input, logged, and returned success
  without persisting anything, and had no production caller. A real newsletter gets a
  real endpoint with real persistence.
- **`csp-report` was not created.** The live CSP has no `report-uri`.
- **Response headers come from `next.config.js` `headers()`.** The hybrid adapter
  silently ignores `globalHeaders`, `routes[].headers`, and `responseOverrides` in
  `staticwebapp.config.json`; those keys were present and doing nothing, and the site
  served zero security headers as a result. They were removed rather than left as a
  decoy.
- **Redirects stay in `staticwebapp.config.json`** (`routes[].redirect`), which the
  adapter does honour. `next.config.js` `redirects()` is ignored by the adapter and broke
  the entire route map when attempted.
- **Post-response work is awaited.** HubSpot upsert and queue enqueue are each awaited
  inside `try`/`catch`, so failures are logged and swallowed but the work always
  completes before the response is sent. The Functions runtime tolerated unawaited work
  continuing after a response; the managed backend's behaviour there is undocumented, so
  relying on it could drop a lead after a 200 had already been returned.
- **Response contracts are frozen.** `/api/health` and `/api/contact` shapes are parsed
  by the CI post-deployment verification step and by incident tooling.

## Consequences

### Positive

- One deployable, one deploy job. The linked-backend failure mode is structurally gone,
  not merely mitigated.
- `/api/*` can never be up-or-down independently of the pages; if the app is up, the API
  is up.
- The domain logic under `src/lib/api/` is directly unit-testable without a Functions
  host, which is why `__tests__/api/` exists at all.

### Negative

- Rate limiting and the circuit breaker remain in-memory and best-effort: they reset on
  instance restart and were never multi-instance-safe. This is parity with the previous
  architecture, not a regression, but it is a real limitation. A durable limiter is
  roadmapped.
- Observability at cutover is `console.*` plus a correlation ID into the managed-backend
  logs. App Insights SDK preload is a deliberate fast-follow, not an oversight.
- The retired `api/` tree is a live trap for anyone reading the repo cold: it looks like
  the backend and is not. It must be excluded from the root `tsconfig.json` or
  `next build` fails on missing `@azure/functions` types.

### Neutral

- Azure resources for the retired Functions app (Function App, storage, Key Vault) still
  exist pending the teardown phase of
  `docs/projects/API-CONSOLIDATION-PLAN-2026-07-24.md`.
- The queue is now reached with a queue-scoped, add-only SAS URL instead of a Functions
  output binding.

## Notes

Anti-abuse mechanisms are named here but their thresholds are not: this repo is public,
and published limits tell an abuser exactly how to stay under them. Values live in the
private runbook.

Execution history is in `docs/projects/API-CONSOLIDATION-PLAN-2026-07-24.md` (phases,
open questions Q1–Q8, and the risk table) and in PRs #52–#57.
