# PLAN-009: Abuse hardening (IP trust, bounded stores, size caps, CORS tightening)
**Status**: Blocked (by PLAN-007)
**Effort**: M · **Risk**: Med

## Context
The API's anti-abuse controls have four weaknesses that compound: (1) client identity is
the **first** value of `x-forwarded-for` — attacker-controlled, so rotating XFF bypasses
both rate limiters and poisons the `submission_ip` recorded in HubSpot and the classify
queue; (2) rate-limit state lives in unbounded module-level `Map`s — the contact
limiter's store (`api/src/lib/email.ts:19`) has **no cleanup at all**, and the shared
limiter cleans only every 10 minutes, so rotated identities grow memory without bound;
(3) no request-body size caps beyond platform defaults, and the CSP-report endpoint is a
completely un-rate-limited log-flood vector; (4) CORS on the contact endpoint echoes
**any** `*.azurestaticapps.net` origin.

Blocked by PLAN-007 because that plan locks current behavior in tests; this plan then
changes behavior deliberately, updating those tests — the two-step protects against
accidental semantic drift. (In-memory state remaining per-instance on Flex Consumption
is a known, accepted limitation at current traffic — durable rate limiting is a Later
roadmap item with an abuse-evidence trigger. Do not add Redis/Table storage here.)

## Goal / Non-goals
**Goal**: Spoofed XFF no longer trivially defeats rate limiting or poisons CRM data;
memory use is bounded; cspReport can't be used to flood logs; CORS allows only this
project's origins.
**Non-goals**: Distributed/durable rate limiting (Later, triggered); WAF/Front Door
(infrastructure decision above this repo); changing rate-limit numbers (5/hr contact,
3/min newsletter stay).

## Current state
- `api/src/lib/rate-limit.ts:26-33` — `getClientIp()`: first XFF value → `x-real-ip` →
  `cf-connecting-ip` → `"unknown"`. `:14` unbounded `ipStore` Map; `:17-24` 10-min
  `setInterval` cleanup, not `.unref()`'d.
- `api/src/lib/email.ts:19` — separate unbounded `rateLimitStore` Map (5/hr), no cleanup;
  `:21-30` circuit breaker state.
- `api/src/functions/contact.ts:48-61` — CORS: exact-match list + regex
  `^https:\/\/[a-z0-9-]+\.azurestaticapps\.net$` (`:53`); disallowed origins still get
  `ACAO: https://bridgingtrust.ai` (`:56`).
- `api/src/functions/cspReport.ts` — no rate limit, no size cap, logs unbounded
  attacker-controlled fields (`:12-21`).
- `contact.ts:75`, `newsletter.ts:34`, `cspReport.ts:9` — `await request.json()` with no
  content-length guard.
- Deployment topology: SWA (edge) → linked backend → Functions. Azure's front ends
  APPEND the true client IP to `x-forwarded-for` (possibly with a port suffix,
  `ip:port`), so the **rightmost** entry is platform-appended; the leftmost is whatever
  the client sent.

## Target state
Rightmost-public-IP XFF parsing; both limiters share one bounded-store implementation;
50 KB body cap on all POST handlers; cspReport rate-limited and truncated; CORS
anchored to this project's SWA hostname.

## Steps
1. Rewrite `getClientIp` in `api/src/lib/rate-limit.ts`:
   - Split XFF on commas, trim, strip `:port` suffixes (IPv4 only — bracketed IPv6
     `[::1]:port` also handled), walk from the RIGHT, return the first entry that parses
     as a public IP (reject 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8,
     169.254.0.0/16, `::1`, `fc00::/7`, `fe80::/10`). Fallbacks unchanged
     (`x-real-ip`, `cf-connecting-ip`, `"unknown"`).
   - Keep it dependency-free (hand-rolled range checks; ~30 lines).
2. Bound and unify stores in `rate-limit.ts`:
   - `MAX_TRACKED_IPS = 10_000`; on insert when at cap, delete the oldest entry (first
     key in Map insertion order).
   - `.unref()` the cleanup interval (`:17`) so it never holds a process open.
3. Consolidate the contact limiter: replace `email.ts`'s private `rateLimitStore` logic
   (`email.ts:19,27-28` and its check site ~`:100`) with a call to `checkRateLimit` from
   `rate-limit.ts` configured `{limit: 5, windowMs: 60*60*1000}` — but note
   `checkRateLimit` returns an HTTP response object; `email.ts` returns result objects.
   Add a lower-level export `isRateLimited(key, {limit, windowMs}): boolean` in
   `rate-limit.ts` that both `checkRateLimit` and `email.ts` use. One store
   implementation, two configs. Circuit breaker stays in `email.ts` untouched, except
   add cleanup of stale breaker state if any exists (read the code; likely a single
   object — no cleanup needed).
4. Body-size guard: shared helper in `rate-limit.ts` or new `api/src/lib/http-guards.ts`:
   `tooLarge(request, maxBytes = 50_000): boolean` checking `content-length` header;
   wire into `contact.ts`, `newsletter.ts`, `cspReport.ts` before `request.json()`,
   returning `413 { success: false, message: "Payload too large" }`.
5. cspReport hardening (`cspReport.ts`): `checkRateLimit(ip, {limit: 10, windowMs: 60_000})`;
   truncate every logged field to 500 chars; drop `user-agent` logging (recon noise, PII-ish).
6. CORS tightening (`contact.ts:53`): anchor the preview regex to this project's SWA
   default hostname. Get it: `az staticwebapp list --query "[].defaultHostname"` (or from
   the SWA portal). SWA preview environments look like
   `<default-host-prefix>-<env>.<region>.azurestaticapps.net` — anchor the regex to the
   prefix, e.g. `^https:\/\/<prefix>(-[a-z0-9]+)?\.<region>\.azurestaticapps\.net$`.
   **Assumption to verify on the PR's own preview deploy**: the preview origin matches;
   if PR previews don't exercise CORS (same-origin via SWA proxy — likely, since the
   frontend calls `/api/*` relative), the regex may be removable entirely; test a
   preview submission first and prefer REMOVAL over tightening if same-origin proxying
   is confirmed. Also change the disallowed-origin branch (`:56`) to omit the ACAO
   header instead of asserting the prod origin.
7. Update PLAN-007's locked tests deliberately: XFF tests now assert rightmost-public
   parsing (add cases: single spoofed value; `client, proxy1, proxy2`; private-only
   list → fallback; `ip:port` suffix), CORS tests assert the new allow-list, new tests
   for 413 and cspReport limits, store-cap eviction test (insert 10_001 keys, assert
   size stays 10_000 and oldest evicted).

## Security & compliance notes
- `submission_ip` in HubSpot/queue becomes meaningfully accurate — improves audit
  quality of lead data, and stops attacker-chosen strings flowing into CRM fields.
- Memory bound removes a cheap DoS lever on the (cost-metered) Flex Consumption app.
- Keep the limiter's fail-open semantics for `"unknown"` IPs (never block legitimate
  users because a proxy stripped headers) — document this in code.
- No new secrets or permissions.

## Validation
```bash
cd api && npm run typecheck && npm test   # updated suite green
```
Manual against the PR preview (or prod post-merge):
```bash
# spoof attempt: 7 rapid submissions rotating XFF must still 429 by the 6th
for i in $(seq 1 7); do curl -s -o /dev/null -w "%{http_code}\n" \
  -X POST https://<host>/api/contact -H "content-type: application/json" \
  -H "x-forwarded-for: 1.2.3.$i" -d @valid-payload.json; done
# oversized body → 413
head -c 60000 /dev/zero | tr '\0' 'a' | curl -s -o /dev/null -w "%{http_code}\n" \
  -X POST https://<host>/api/contact -H "content-type: application/json" -d @-
```
(Note: the platform appends the real IP rightmost, so rotating the leftmost value no
longer rotates identity — expect 429 on the 6th request.)

## Rollback
Revert the PR and redeploy Functions. No stored state or schema changes; the limiter
resets on deploy anyway (in-memory).
