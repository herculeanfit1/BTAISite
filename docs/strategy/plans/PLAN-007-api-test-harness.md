# PLAN-007: API test harness (real tests over the Azure Functions backend)
**Status**: Blocked (by PLAN-001)
**Effort**: M · **Risk**: Low

## Context
The Azure Functions backend (`api/src/`) is the business-critical path of this repo —
contact-form validation, rate limiting, circuit breaking, Resend email, HubSpot upsert,
queue enqueue — and has **zero automated tests over the real handlers**. Historical
"API tests" under `__tests__/api/` targeted deleted Next.js routes or hand-copied clones
of the logic; PLAN-005 removes them. PLAN-001 seeds a minimal Vitest setup inside `api/`
(config + template tests); PLAN-006 adds newsletter tests. This plan builds out the rest
so that the CI gate (PLAN-002's `Quality Gate / api` job, which already runs
`npm test --if-present` in `api/`) meaningfully protects the lead pipeline.

## Goal / Non-goals
**Goal**: Unit tests over every function handler and lib module in `api/src/`, running in
CI, locking current behavior — including behaviors we plan to change later (PLAN-009
hardening will then update the tests deliberately).
**Non-goals**: Integration tests against live Azure/Resend/HubSpot (manual runbook
territory); load tests; changing any production behavior (pure test addition — if a test
reveals a bug, file it in the PR description and lock CURRENT behavior unless it's
trivially a bug the plan owner would obviously fix… no: lock current behavior, list
findings; behavior changes ride PLAN-009).

## Current state
- Harness: `api/vitest.config.ts` (from PLAN-001), `vitest` devDep, `npm test` script.
- Handlers register via `app.http(...)` side effects (e.g. `contact.ts:237`); the inner
  `handler` functions are currently module-private in `contact.ts` and `status.ts`
  (`newsletter.ts` exports post-PLAN-006).
- `api/src/lib/rate-limit.ts:17` — module-level `setInterval` cleanup, not `.unref()`'d
  (a test-runner hang hazard) and module-level `Map` state persisting across tests.
- `api/src/lib/email.ts` — module-level `rateLimitStore` and `circuitBreakerState`;
  lazy Resend init at `:5-16` reads `RESEND_API_KEY` at first send.
- Existing pipeline behaviors worth locking (they are subtle and undocumented):
  - Honeypot runs BEFORE Zod (`contact.ts:77` vs `:86`).
  - Queue enqueue only fires when HubSpot succeeded (`contact.ts:181-204`).
  - HubSpot/queue failures never fail the request (non-blocking try/catch).
  - CORS: allowed-origin echo incl. `*.azurestaticapps.net` regex (`contact.ts:48-61`).

## Target state
`cd api && npm test` exercises all five handlers and four lib modules with mocked
externals; `Quality Gate / api` runs it on every PR; ~all of `api/src/lib` and the
handler branch logic covered.

## Steps
1. Export handlers for testability: in `contact.ts` and `status.ts`, change
   `async function handler(...)` to `export async function handler(...)` (registration
   via `app.http` at the bottom is unchanged; the `app.http` call in an imported module
   is harmless under Vitest — verify import doesn't throw; if `app.http` requires runtime
   context, mock `@azure/functions`' `app` with `vi.mock("@azure/functions", ...)`
   preserving types via `importOriginal`).
2. Shared test utilities `api/src/test-utils.ts`: a `makeRequest({body, headers, method})`
   factory returning a minimal `HttpRequest` stub (`json: async () => body`,
   `headers: new Map(...)`-backed `get()`), and a `makeContext()` returning
   `{ log: vi.fn() }`.
3. `api/src/functions/contact.test.ts` — mock `../lib/email.js`, `../lib/hubspot.js`,
   `../lib/classify-queue.js` with `vi.mock`:
   - invalid body → 400 with Zod error shape; `sendContactEmail` not called.
   - `_gotcha` set → 200 success shape, no email/hubspot/queue calls (and assert
     honeypot short-circuits before validation by sending an INVALID body + honeypot →
     still 200).
   - happy path → 200; email, hubspot, queue all called; queue message built from
     hubspot's contactId.
   - hubspot failure → 200 still returned; queue NOT called (lock current coupling —
     add a comment referencing the Later "queue-first" roadmap item).
   - email rate-limit result → 429; circuit-open result → 503 (drive via the mocked
     `sendContactEmail` return values matching `email.ts`'s result shape).
   - CORS: OPTIONS/POST with `origin: https://bridgingtrust.ai` → echoed;
     `https://evil.example` → not echoed; `https://anything.azurestaticapps.net` →
     echoed (lock current behavior; PLAN-009 tightens and updates this test).
4. `api/src/lib/rate-limit.test.ts` — use `vi.useFakeTimers()`:
   - under limit → null; over limit → 429 response with `Retry-After` and
     `X-RateLimit-*` headers; window expiry resets.
   - `getClientIp`: first-XFF-value behavior locked as-is (PLAN-009 changes it).
   - Module state isolation: use `vi.resetModules()` + dynamic `await import()` per test
     to get a fresh Map, and call `vi.clearAllTimers()` so the un-unref'd interval can't
     hang the runner.
5. `api/src/lib/email.test.ts` — mock `resend` package (`vi.mock("resend")`):
   - dual delivery: two `emails.send` calls (user confirmation then admin), correct
     to/replyTo per CLAUDE.md; failure of the first send blocks the second (current
     sequential behavior — lock it).
   - rate limit: 6th call within an hour from same IP → rate-limited result.
   - circuit breaker: 5 consecutive failures → open; open → immediate breaker result
     without calling resend; fake-timer advance 5 min → half-open/close path.
   - `RESEND_TEST_MODE=true` short-circuit if present in code — read `email.ts` first
     and cover whatever the actual branch does.
6. `api/src/lib/classify-queue.test.ts` — `buildClassifyMessage`: schema v1 fields,
   8 KB guard throws `QueueMessageTooLargeError` (`classify-queue.ts:57-62`), excerpt
   truncation to 500 chars (`:64-68`).
7. `api/src/lib/hubspot.test.ts` — mocked `global.fetch`: 201 create; 409+CONFLICT →
   search+patch; 409 without CONFLICT category → failure result
   (`hubspot.ts:181-189`); search miss after 409 → failure; note-creation failure →
   `noteId: null` but `success: true`; AbortController timeout path (mock fetch that
   rejects with AbortError) → failure result, no throw.
8. `api/src/functions/{status,health,cspReport}.test.ts` — status shape, health 200,
   cspReport logs and 204/200s per current code, malformed body doesn't throw.
9. Coverage: add `@vitest/coverage-v8` to `api/` devDeps; enable in
   `api/vitest.config.ts` with `include: ["src/**"]`, report-only (no thresholds this
   plan; set thresholds one plan later once the baseline is known — record baseline
   numbers in the PR description).
10. Confirm `Quality Gate / api` picks it up automatically (`npm test --if-present` —
    the script now exists). Remove `--if-present` in `quality-gate.yml` so a vanished
    test script fails loudly.

## Security & compliance notes
Tests must use obviously-fake PII (`test@example.com`), never real addresses. No secrets
in fixtures — mocked `HUBSPOT_TOKEN`/`RESEND_API_KEY` values like `"test-token"`. This
plan is itself compliance evidence: documented, automated verification of the
lead-intake control path.

## Validation
```bash
cd api
npm run typecheck && npm test    # all green, no hanging processes (runner exits)
npx vitest run --coverage        # baseline recorded in PR description
```
CI: `Quality Gate / api` green on the PR.

## Rollback
Revert. Test-only change; zero production risk. If the handler-export change (step 1)
somehow affects the esbuild bundle, `npm run build` diff in validation would catch it
(exports from the entry's imports don't change `dist/index.js` registration behavior).
