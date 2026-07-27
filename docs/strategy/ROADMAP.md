# Roadmap — BTAI-Site

**Date**: 2026-07-03. Derived from `docs/strategy/STRATEGIC_REVIEW.md`.
Each Now/Next item has an execution plan in `docs/strategy/plans/`. Plans are written to
be executed by a fresh session with zero context — read the plan, not this file, when
implementing.

**Recommended execution order**: 001 → 002 → 003 → 004 → 005 → 006, then
007 → 012 → 011 → 009 → 010 → 008. One plan per session/PR.

---

## Execution status

Updated as plans land. The tables below are the original 2026-07-03 plan; this section is
the current truth. Full findings are in the transparency report at the end of this file,
and per-plan detail in each plan's "Execution notes" block.

| Plan                                | Status                                                                    | Landed as |
| ----------------------------------- | ------------------------------------------------------------------------- | --------- |
| PLAN-001 email HTML escaping        | ✅ Executed 2026-07-27                                                    | #74       |
| PLAN-002 cloud quality gate         | ✅ Executed 2026-07-27                                                    | #75       |
| PLAN-003 repo hygiene purge         | ✅ Executed 2026-07-27                                                    | #67–#72   |
| PLAN-004 dead code & deps           | ✅ Executed 2026-07-27                                                    | #67–#72   |
| PLAN-005 test-suite honesty         | ✅ Executed 2026-07-27                                                    | #67–#72   |
| PLAN-006 newsletter persistence     | ⏸️ **Deferred** — feature not scheduled                                   | #77       |
| PLAN-007 API test harness           | ✅ Executed 2026-07-27                                                    | #76       |
| PLAN-008 route & locale unification | ⬜ Open — highest availability risk remaining                             | —         |
| PLAN-009 abuse hardening            | ✅ Executed 2026-07-27                                                    | this PR   |
| PLAN-010 observability & alerting   | ⬜ Open — unblocked by 011                                                | —         |
| PLAN-011 IaC completeness           | ✅ Executed 2026-07-27                                                    | #78       |
| PLAN-012 docs truth reconciliation  | ◐ Partial — step 5 done; ADRs 0003–0005 and ~27 `docs/` root files remain | #67–#72   |
| API-consolidation Phase 5 teardown  | ⬜ Open — delete `api/`, tear down orphaned Azure resources               | —         |

**Found during execution, not in any plan:**

| Item                                                                                              | Status  |
| ------------------------------------------------------------------------------------------------- | ------- |
| Static Web App settings entirely undeclared in IaC (production reads settings no Bicep describes) | ⬜ Open |
| Verify empirically whether the platform appends the client IP to `x-forwarded-for`                | ⬜ Open |

---

## Now (0–30 days) — highest leverage, lowest risk

| #   | Plan     | What                                                                                                                                                   | Effort | Why now                                                                         |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------- |
| 1   | PLAN-001 | Escape user input in Resend email templates                                                                                                            | S      | Active injection vulnerability on a public form                                 |
| 2   | PLAN-002 | Cloud quality gate: build + type-check + unit tests as required PR checks                                                                              | S      | Converts existing branch protection into a real gate; protects every later plan |
| 3   | PLAN-003 | Repo hygiene purge: committed logs, SBOMs, `.bak`, scratch files, dead dev servers                                                                     | S      | Pure deletions; public-repo credibility; makes PLAN-004 reviewable              |
| 4   | PLAN-004 | Dead code & dead dependency removal: `src/` mirrors, three.js, Jest/Babel stack, root `resend`, fix tsconfig aliases                                   | M      | Biggest compounding win; removes the edit-the-dead-copy trap                    |
| 5   | PLAN-005 | Test-suite honesty: delete placeholders/skips/broken imports, delete `fix-component-tests.js`, align coverage config with reality, fix pre-commit hook | M      | Ends false confidence; makes the PLAN-002 gate meaningful                       |
| 6   | PLAN-006 | Newsletter persistence via existing HubSpot module                                                                                                     | S–M    | Endpoint currently lies to users and discards leads                             |

Sequencing: 001 is independent — do it first (vuln). 002 before 004/005 so deletions
happen under a working gate. 003 before 004 keeps the big deletion PR reviewable.
005 after 004 because coverage config references `src/components/**`, which 004 deletes.

## Next (30–90 days) — structural moves

| #   | Plan     | What                                                                                                                                                     | Effort | Depends on                               |
| --- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------- |
| 7   | PLAN-007 | API test harness: Vitest in `api/`, handler tests for contact/newsletter, wired into the CI gate                                                         | M      | 001 (seeds harness), 002 (gate exists)   |
| 8   | PLAN-012 | Docs truth reconciliation: fix CLAUDE.md false claims, ADR backfill (hybrid architecture, i18n deferral, gating model), archive stale `docs/` files      | M      | 004/005 landed (docs describe end state) |
| 9   | PLAN-011 | IaC completeness: declare queue + role + `queueServiceUri` in Bicep; author missing `wire-functions-settings.sh`; fix `rollback.sh`                      | S–M    | none                                     |
| 10  | PLAN-009 | Abuse hardening: XFF parsing, bounded rate-limit stores, body-size caps, CORS tightening, cspReport limits                                               | M      | 007 (tests to lock behavior)             |
| 11  | PLAN-010 | Observability & alerting: action group, Functions failure alerts, availability test on `/api/health`, consistent `context.log`, host.json logging config | M      | 011 (touches same Bicep)                 |
| 12  | PLAN-008 | Route & locale unification: one homepage content tree, canonical privacy/terms, drop phantom `fr` locale                                                 | M      | 004 (dead code gone first)               |

## Later (90+ days) — strategic bets, each with a trigger

- **Major-version upgrade campaign** (Next 16, ESLint 10, Vitest 4, happy-dom 20,
  Playwright 1.61, @types/node). _Trigger_: PLAN-002 + PLAN-005 + PLAN-007 landed (a real
  test gate exists to catch regressions) **and** the fleet-wide upgrade sequencing has
  chosen this repo's slot. Do Vitest 4 first (test-only blast radius), Next 16 last.
  Dependabot's ignore-all-majors rule (`.github/dependabot.yml:26-28`) stays until then.
- **Real i18n with next-intl**. _Trigger_: an actual business decision to market in
  Spanish. The `es.json` translation and `[locale]` scaffold are preserved by PLAN-008;
  wiring next-intl is ~2–3 days once wanted. Until then, do not wire it.
- **Durable rate limiting** (Azure Table/Redis-backed, replacing in-memory Maps).
  _Trigger_: observed abuse in App Insights, sustained multi-instance scale-out, or
  Resend cost anomalies. PLAN-009's hardening is sufficient below that threshold.
- **Queue-first contact pipeline** (decouple HubSpot/classification from the request
  path; today a HubSpot failure silently skips classification —
  `api/src/functions/contact.ts:181-204`). _Trigger_: lead volume where a lost
  classification matters, or a second consumer of the queue.
- **Repo visibility decision** (public ↔ private). _Trigger_: operator decision — see
  escalations in the review. If it stays public: SARIF upload posture is already correct,
  but Phase R2 must be permanently cancelled for this repo.

---

## Anti-goals — what NOT to do, and why

1. **Do NOT execute "Phase R2" (self-hosted runner) on this repo while it is public.**
   The TODOs at `security-scan.yml:43,140,232,325` predate the repo being public.
   `STANDARDS.md` §8 requires deregistering self-hosted runners _before_ going public;
   the same logic forbids adding one after. PLAN-012 removes the TODOs.
2. **Do NOT wire next-intl or add French now.** i18n is decorative today; wiring it is
   real work with zero current business demand. Keep `es.json`; delete the `fr` promise.
3. **Do NOT start the Next 16 / ESLint 10 / Vitest 4 majors during the Now phase.**
   Upgrading on top of dead code and theater tests maximizes risk for zero user value.
   The freeze is currently a feature.
4. **Do NOT rewrite git history to purge committed logs/SBOMs.** Nothing tracked is a
   secret (re-verified 2026-07-27 with credential-shape patterns: no key of any provider
   shape is tracked; `.env` untracked). History rewrite on a public repo with branch
   protection is high-ceremony, low-value. Delete at HEAD (PLAN-003) and move on.
   Caveat on the original verification: it covered _secrets_, not _recon detail_, and the
   private-IP sweep behind it used `\b` word boundaries, which are not POSIX ERE — so
   `git grep -E` silently matched nothing. Two real items existed and are now removed at
   HEAD (a LAN address in `dev-server.log`, two internal host addresses in a strategy
   doc). They remain in history, which this entry deliberately accepts.
5. **Do NOT chase a coverage percentage.** The 70%/30% numbers were fiction. PLAN-005
   sets thresholds to what the honest suite actually measures; ratchet up only from real
   baselines.
6. **Do NOT hand-edit the canonical workflows** (`standards-check.yml`,
   `security-scan.yml` — both marked "Do not edit per-repo copies"). Changes go upstream
   to HerculeanOlympus. The new quality gate (PLAN-002) is a **separate, repo-owned**
   workflow file for exactly this reason.
7. **Do NOT build newsletter infrastructure** (list provider, double-opt-in flows).
   PLAN-006 wires the existing HubSpot module. Anything more waits for evidence anyone
   uses the form.
8. **Do NOT refactor the 400-line client components for their own sake.** Over-cap files
   are listed in the review; split them only when a plan already touches them
   (e.g., PLAN-001 touches ContactSection's backend, not the component).
9. **Do NOT add a database, CMS, or auth.** This is a marketing site with one form. The
   moment that changes, write an ADR first.

---

## Transparency report

Written 2026-07-27, covering the execution of PLAN-001 through PLAN-011. Appended to
rather than rewritten, so the record stays chronological.

### The headline finding: these plans are hypotheses, not instructions

**Every plan executed so far contained at least one instruction that was wrong against the
code, and several would have caused real damage if followed literally.** Not one was
caught by reading the prose — each surfaced only because the plan's own verify-first step
was actually run.

| Plan     | What following it literally would have done                                                                                                                             |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PLAN-003 | Deleted the only working backup script (the "duplicate" was a 3-line stub)                                                                                              |
| PLAN-004 | `git rm -r src/` — deleted the live backend; removing `resend` would have broken the contact form                                                                       |
| PLAN-005 | Deleted seven real API tests as "placeholders"                                                                                                                          |
| PLAN-001 | Patched the **undeployed** `api/` tree — a green PR closing the ticket while the injection kept running in production                                                   |
| PLAN-002 | Pinned a test list naming a deleted file; a vitest filter matching zero files is silently ignored, so the gate would have run green while covering less than it claimed |
| PLAN-007 | Rebuilt a harness from scratch on the premise that "zero tests exist"; seven real test files were already there                                                         |
| PLAN-011 | **Deployed a template that re-links the retired Functions backend**, the one action CI explicitly warns is not the fix for a broken `/api/*`                            |
| PLAN-009 | "Tightened" a CORS rule that was inverted — it rejected our own origin and admitted every stranger's                                                                    |

The common root cause is dating: the plans were written 2026-07-03, before the
2026-07-24 API consolidation. **Six of them still describe `api/` — an Azure Functions
tree that has not served traffic since — as the live system.** Any future plan naming
`api/src/...` should be treated as describing a system that no longer exists.

### What actually shipped

| Area                                             | Before                                      | After                                         |
| ------------------------------------------------ | ------------------------------------------- | --------------------------------------------- |
| Stored HTML injection on the public contact form | live                                        | closed, structurally tested                   |
| Cloud CI correctness gates                       | **zero** (5 required checks, all lint/scan) | type-check + full suite + build, **required** |
| Tests / files                                    | 140 / 21                                    | **228 / 30**                                  |
| Coverage (lines / branches / functions)          | 23.05 / 80.78 / 76.03                       | **31.39 / 84.87 / 85.81**                     |
| `src/lib/api` coverage                           | 60.81% lines, 70.83% functions              | **95.71% / 95.83%**                           |
| `hubspot.ts`                                     | 9.49% lines, **0% functions**               | **100%**                                      |
| Rate-limit identity                              | leftmost XFF — client-controlled            | rightmost public entry                        |
| Rate-limit stores                                | unbounded, no eviction                      | capped, oldest-first eviction                 |
| Request body cap                                 | none                                        | 50 KB → 413                                   |
| CORS                                             | admitted any `*.azurestaticapps.net`        | exact allow-list only                         |
| Bicep                                            | would re-link the retired backend           | link removed; live queue declared             |
| 1Password vault/token names in this public repo  | in two scripts                              | removed                                       |

### Known limitations — stated plainly

1. **The XFF rightmost assumption is not empirically verified.** It is safe either way
   (never worse than the leftmost parsing it replaced), but whether this platform appends
   the true client IP was not proven. Verifying needs a header-echoing endpoint; observing
   the limiter in production would require sending real submissions, generating real
   emails, CRM contacts and queue messages. Tracked as open above.
2. **In-memory rate limiting is per-instance and resets on deploy.** Accepted at current
   traffic; durable limiting remains a triggered Later item. The bounded store fixes the
   memory lever, not the distribution.
3. **`api/` was deliberately left carrying the injection bug.** It is unreachable and
   scheduled for deletion; CLAUDE.md forbids editing it. Not residual exposure, but it
   will look like an unfixed vulnerability to anyone reading that tree.
4. **Coverage is 31% repo-wide.** That number is honest but low, and it is dominated by
   untested presentational components. The logic-heavy API layer is at ~96%. Do not read
   the headline figure as the risk picture.
5. **Anti-abuse tunables are still published in this public repo**
   (`src/lib/api/email/send-contact-email.ts` — window and max requests as literals).
   CLAUDE.md says these belong only in the private runbook. Not fixed: moving them is a
   config-plumbing change with its own risk, and the tests deliberately avoid restating
   them. Flagged for a follow-up decision.
6. **Nothing here was load-tested.** The limits are unit-tested for logic, not exercised
   under concurrency.

### Verification practices adopted

Because three separate sweeps in this effort reported "clean" while being structurally
incapable of matching anything, the following are now standing practice and are why the
findings above can be trusted:

- **Prove a search can hit before trusting an empty result.** `git grep -E` does not
  honour `\b`; `git check-ignore` skips tracked files without `--no-index`; a vitest path
  filter matching zero files is silently ignored.
- **Mutation-test new tests.** Every suite added was checked by breaking the thing it
  guards and confirming exactly that test fails. This caught one test that passed against
  both the fixed and unfixed code, and one mutation that silently rewrote a comment
  instead of the code it targeted.
- **Read live state before changing infrastructure.** The `what-if` comparison against
  `origin/main` is what turned "the Bicep is stale" into "the Bicep would re-link the
  retired backend."

### Addendum — PLAN-009 and PLAN-010 (2026-07-27)

**PLAN-009.** Three of four weaknesses were real. The CORS finding was worse than the plan
described: the wildcard `^https://[a-z0-9-]+\.azurestaticapps\.net$` **rejected this
project's own origin** (the character class excludes the dot in
`wonderful-bush-0e888f30f.6`) while **admitting every other Azure tenant's** Static Web
App. It never once admitted the site it was written for. Removed rather than tightened —
the form posts to a relative path, so it is same-origin and never consults CORS at all.

Client identity moved from the leftmost `x-forwarded-for` entry (client-controlled) to the
rightmost public one, unbounded rate-limit Maps became one capped store with eviction, and
a 50 KB body cap now returns 413. Test fixtures containing **real captured IPs — one
residential** — were replaced with RFC 5737 ranges.

**PLAN-010.** The premise held: zero alerts exist. But **two of its three proposed alerts
would have been permanently silent** — one scoped to the retired Functions app, one to App
Insights server-side telemetry that nothing emits (the SWA carries only a browser-side
connection string). Shipping them would have manufactured the appearance of monitoring.

Built instead: an action group, an availability test on `/api/health`, and one the plan
did not contain — a webtest that POSTs an **invalid** payload to `/api/contact` and
requires a **400**. Zod rejects it before any email, CRM write or enqueue, so it monitors
the real lead path continuously without creating a lead. That is the only check that
catches "site up, form broken".

Also removed the submitter's **email address from the logs of every validated
submission** (30-day retention), and reduced raw IPs to a resolved/unknown class.

**Two limitations to carry forward.** The PLAN-010 alerting is **declared but not
deployed** — it protects nothing until applied, and deployment is the owner's call because
it is billable and emails a real inbox. And PLAN-009's rightmost-XFF change ships on
reasoning, not measurement: it is provably never worse than the leftmost parsing it
replaced, but whether this platform appends the client IP was not empirically confirmed.

### Addendum — PLAN-008 (2026-07-27)

**The most dangerous instruction found in any plan so far.** PLAN-008's canonical
direction is the reverse of production's. PR #61 settled it on 2026-07-25: top-level paths
are canonical and every `/{locale}` path 301s to them. Step 6 asks to delete
`app/privacy/` — the page currently serving 200 — and add `/privacy → /en/privacy`, while
`/en/privacy → /privacy` already ships. That is an **infinite redirect loop on the privacy
policy**, a compliance-critical page, and step 7 would have pointed the cookie banner at
it. Both rejected.

Its other premises had also expired. The "two divergent homepages" were rendering the
**identical** eight sections; `GlobeOverlaySection` no longer exists anywhere, so step 1's
production check could not have resolved either way. The only real difference was a
`pt-20` class present in one copy and not the other, under a comment asking the next
person to keep them in sync by hand.

Delivered: one shared `HomeSections` component (the duplicate is deleted), `supportedLocales`
reduced to what the site can actually serve, and — the durable part —
`__tests__/routing/redirect-map.test.ts`, which fails with
`redirect loop: /privacy -> /en/privacy -> /privacy` if anyone re-implements step 6, and
explains why in the failure message.

**Not done, deliberately:** `app/[locale]/` was left in place even though the edge
redirects make it unreachable. CLAUDE.md ties it to Oryx static prerendering for the legal
pages, and that needs verifying on a real preview before acting. On the
highest-availability-risk plan, with the 2026-07-23 `next.config.js redirects()` incident
as precedent, a confident routing assumption is exactly the wrong thing to ship.
