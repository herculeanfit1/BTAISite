# PLAN-007: API test harness (real tests over the Azure Functions backend)

**Status**: Executed 2026-07-27 — see "Execution notes"
**Effort**: M · **Risk**: Low

## Execution notes (2026-07-27)

**The title is wrong and so is every path.** There is no Azure Functions backend to test.
`api/` has not been deployed since 2026-07-24; the live API is `app/api/*/route.ts` over
`src/lib/api/`. All ten steps name `api/src/...` files. Executed against the live tree
instead.

**The premise "zero automated tests over the real handlers" was false**, and the plan's
claim that PLAN-005 removes the existing `__tests__/api/` tests is the opposite of what
happened — PLAN-005 _kept_ seven real ones (46 tests) and deleted only the broken and
placeholder files. Rewriting from scratch would have discarded working tests.

So the work was re-scoped to what the coverage report showed was actually untested:

| Module                                    | Before                          | After               |
| ----------------------------------------- | ------------------------------- | ------------------- |
| `src/lib/api/hubspot.ts`                  | 9.49% lines, **0% functions**   | **100%**            |
| `src/lib/api/queue-client.ts`             | 0%                              | **100%**            |
| `src/lib/api/email/send-contact-email.ts` | 0%                              | **98.07%**          |
| `src/lib/api/email/resend-provider.ts`    | 19.35%                          | **100%**            |
| `src/lib/api/correlation.ts`              | 71.42%                          | **100%**            |
| `app/api/*/route.ts`                      | **not measured at all**         | **100%**            |
| `src/lib/api` overall                     | 60.81% lines / 70.83% functions | **95.71% / 95.83%** |

Repo-wide: 23.05 → **30.36** lines, 76.03 → **84.96** functions, 192 tests across 27 files.

### The blocker the plan could not have known about

`vitest.setup.js` mocked `next/server` with a **decoy**: one module-scope `new Map()`
shared by every response ever constructed, `init.headers` ignored entirely, and
`NextResponse` exposed as a plain object with only `json`/`next` — so
`new NextResponse(...)`, which `app/api/contact/route.ts` uses for preflight, could not be
constructed at all. Any header assertion read an empty shared Map, indistinguishable from
a genuinely missing header. Route-handler tests were **impossible, while appearing merely
unwritten**. Replaced with a faithful mock (per-instance real `Headers`, honoured `init`, a
usable constructor, `json`/`text`). No existing test imported `next/server`, so nothing
depended on the old behaviour.

Second harness trap: `origin` is a forbidden header name, so
`new Request(url, { headers: { origin } })` silently drops it and every CORS assertion
reads `null` regardless of handler behaviour. The tests build request stubs instead.

### Other corrections

- **No `Quality Gate / api` job exists** for step 10 to adjust. PLAN-002 deliberately did
  not create one, because a required check on a tree scheduled for deletion blocks every
  PR the moment the teardown lands.
- **The coverage `include` list never covered the `app/api` tree**, so the three route
  handlers earned no credit despite two of their response shapes being a **deploy
  contract** (`/api/health` must contain `"status"`; an invalid POST to `/api/contact`
  must return a JSON 400). Widened, and those contracts are now asserted.
- **No thresholds "one plan later"** — they are raised here, to the measured baseline minus
  ~2 points, per PLAN-005's rule.
- Steps 1 and 2 (export handlers, build an `HttpRequest` stub factory) are moot: the live
  route handlers already export `GET`/`POST`/`OPTIONS`, and take a Fetch `Request`.
- Step 5's instruction to keep anti-abuse tunables out of the public repo was followed
  literally and is the reason the rate-limit and circuit-breaker tests **loop until the
  behaviour flips** rather than asserting a literal count. A test asserting "the 6th
  request is blocked" publishes the number to stay under.
- `newsletter` and `cspReport` handlers (steps 3, 8) **do not exist in the live tree** —
  no route, no UI, no fetch anywhere in `app/`. They exist only in `api/`. This also
  undercuts PLAN-006, which assumes a live newsletter endpoint that merely lacks
  persistence.

### Verification

Every new suite was mutation-tested rather than trusted for being green: removing
`escapeHtml` from the HubSpot note body, changing the `/api/health` response shape, and
deleting the Resend `error` check each produced exactly one failing test. (A fourth
mutation appeared to pass until the mutation itself was checked — `perl s///` without `/g`
had rewritten a code comment rather than the code.)

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
   - honeypot field set → 200 success shape, no email/hubspot/queue calls (and assert
     honeypot short-circuits before validation by sending an INVALID body + honeypot →
     still 200). Read the field name off the schema; it is not restated here.
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
   - rate limit: one call past the threshold, inside the window, from the same IP →
     rate-limited result.
   - circuit breaker: the configured run of consecutive failures → open; open →
     immediate breaker result without calling resend; fake-timer advance past the
     cooldown → half-open/close path.
   - Thresholds, window and cooldown are in the private runbook, not here (public
     repo) — read the actual constants out of the module under test.
   - `EMAIL_TEST_MODE` / `RESEND_TEST_MODE` short-circuit if present in code — read
     `email.ts` first and cover whatever the actual branch does.
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
