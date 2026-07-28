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

**All twelve plans are now closed.** Everything below is merged to `main` and deployed.

| Plan                                | Status                                                                       | Landed as |
| ----------------------------------- | ---------------------------------------------------------------------------- | --------- |
| PLAN-001 email HTML escaping        | ✅ Executed                                                                  | #74       |
| PLAN-002 cloud quality gate         | ✅ Executed                                                                  | #75       |
| PLAN-003 repo hygiene purge         | ✅ Executed                                                                  | #67–#72   |
| PLAN-004 dead code & deps           | ✅ Executed                                                                  | #67–#72   |
| PLAN-005 test-suite honesty         | ✅ Executed                                                                  | #67–#72   |
| PLAN-006 newsletter persistence     | ⏸️ **Deferred** — feature not scheduled; premise corrected                   | #77       |
| PLAN-007 API test harness           | ✅ Executed                                                                  | #76       |
| PLAN-008 route & locale unification | ✅ Executed — **steps 6/7 rejected as harmful** (redirect loop)              | #81       |
| PLAN-009 abuse hardening            | ✅ Executed                                                                  | #79       |
| PLAN-010 observability & alerting   | ◐ IaC merged, **awaiting deployment** — alerts protect nothing until applied | #80       |
| PLAN-011 IaC completeness           | ✅ Executed                                                                  | #78       |
| PLAN-012 docs truth reconciliation  | ✅ Executed — batch one #67–#72, remainder #82                               | #82       |
| API-consolidation Phase 5 teardown  | ⬜ **Open** — delete `api/`, tear down orphaned Azure resources              | —         |

**Found during execution, not in any plan** — the carried-forward list.

Closed items are kept with their outcome rather than deleted; several of these were closed
by discovering they were impossible or harmful, and that is worth more than the fact that
they are no longer open.

| Item                                                                                                                            | Status                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Deploy the PLAN-010 alerting resources                                                                                          | ✅ **Done 2026-07-27** — live, and delivery to the owner's inbox confirmed 2026-07-28                                                  |
| Fire a real alert once                                                                                                          | ✅ **Done 2026-07-28** — fired in ~40s; email received                                                                                 |
| SWA settings undeclared in IaC                                                                                                  | ✅ **Contracted 2026-07-27** — deliberately _not_ a Bicep resource; declaring one would delete the secrets                             |
| Move the 3 SWA secrets to Key Vault references                                                                                  | ❌ **Closed 2026-07-28 — impossible.** SWA's managed backend cannot resolve KV references; doing it would have broken the contact form |
| Anti-abuse tunables published as literals                                                                                       | ✅ **Done 2026-07-28** — externalised; repo default deliberately stricter than production                                              |
| Delete the unreachable `app/[locale]/` tree                                                                                     | ⬜ Open — needs preview verification of the Oryx prerender claim first                                                                 |
| Verify whether the platform appends the client IP to `x-forwarded-for`                                                          | ⬜ Open — needs a header-echo endpoint                                                                                                 |
| **90 E2E tests exist and run in no workflow**, and `vercel-safari.spec.ts` targets a deleted page so a third fails on first run | ⬜ Open — **largest remaining gap**                                                                                                    |
| Performance budgets documented in CLAUDE.md, measured by nothing                                                                | ⬜ Open                                                                                                                                |
| Accessibility never assessed                                                                                                    | ⬜ Open                                                                                                                                |
| Dependency majors — the "Later" trigger (a real test gate exists) is now **met**                                                | ⬜ Open                                                                                                                                |

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

### Addendum — PLAN-012 remainder (2026-07-27)

ADRs 0003–0005 written (i18n deferral, the gating model, public-repo posture), closing the
step-4 gap. 0005 no longer needed the repo-visibility confirmation the plan was waiting
on — the posture is settled and already acted on.

The `docs/` prune is finished: 20 of the remaining 27 root files archived, leaving **7
living docs**, inside the plan's "~5–8" target. Triage was evidence-driven, because the
first marker sweep returned "—" for most files and an empty result proves nothing.
`azure-swa-deployment.md` turned out to be an **empty 0-line file**, and `security.md`
claimed security headers come from `middleware.ts` — flatly false, and exactly the class
of document that sends a session down the wrong path.

**The prune is now enforced rather than merely performed.** `docs/README.md` carries a
manifest and `__tests__/docs/docs-manifest.test.ts` fails if the directory and the table
disagree, if a listed file vanishes, if the archive disclaimer is dropped, or if a living
doc reasserts retired architecture. Without a mechanism, `docs/` refills silently — which
is how it reached 75 files in the first place.

That is the through-line of this whole effort. The recurring failure was never that people
wrote things down wrongly; it was that **nothing failed when the writing stopped matching
the code**. Each plan in this batch therefore ends with a guard rather than a correction:
the redirect map has a loop detector, the logging convention has a static scan, the API
behaviours have mutation-proven tests, and the docs now have a manifest.

---

## Closing transparency report — 2026-07-27

All twelve plans are closed and merged. This section is the honest final accounting; the
per-batch addenda above stay as the chronological record.

### What shipped, measured

|                                                  | Start of effort                                                   | Now                                                |
| ------------------------------------------------ | ----------------------------------------------------------------- | -------------------------------------------------- |
| Stored HTML injection on the public contact form | **live**                                                          | closed, structurally tested                        |
| Cloud CI correctness gates                       | **zero** — 5 required checks, all lint/scan                       | type-check + full suite + build, **required**      |
| Tests / files                                    | 140 / 21                                                          | **253 / 33**                                       |
| Coverage (lines / branches / functions)          | 23.05 / 80.78 / 76.03                                             | **~31 / ~84 / ~85**                                |
| `src/lib/api` coverage                           | 60.81% lines, 70.83% functions                                    | **~96% / ~96%**                                    |
| `hubspot.ts`                                     | 9.49% lines, **0% functions**                                     | **100%**                                           |
| Rate-limit identity                              | leftmost XFF — client-controlled                                  | rightmost public entry                             |
| Rate-limit stores                                | unbounded, no eviction                                            | capped, oldest-first eviction                      |
| Request body cap                                 | none                                                              | 50 KB → 413                                        |
| CORS                                             | admitted **any** `*.azurestaticapps.net`, rejected our own origin | exact allow-list; disallowed origins get no header |
| Submitter email in logs                          | written on **every** validated submission (30-day retention)      | removed                                            |
| Alerting                                         | none                                                              | declared, **not yet deployed**                     |
| Bicep                                            | would **re-link the retired backend** on deploy                   | link removed; live queue declared                  |
| Living `docs/` files                             | 75 → 27                                                           | **7**, manifest-enforced                           |
| ADRs                                             | 1 (superseded)                                                    | 5                                                  |

Live-verified on `bridgingtrust.ai` after the final deploy: homepage 200, `/api/health` →
`{"status":"ok"}`, invalid POST to `/api/contact` → JSON 400, `/privacy` 200,
`/en/privacy` → 301 → `/privacy`, `/fr` → 301 → `/`, and a disallowed CORS origin
receiving **no** `Access-Control-Allow-Origin` header while the real origin is echoed.

### The finding that matters most

**Every one of the twelve plans contained at least one instruction that was wrong against
the code.** Not one was caught by reading it. Each surfaced only because the plan's own
verify-first step was actually run — which means the process worked, and reading alone
would have failed twelve times out of twelve.

Ranked by what following them literally would have cost:

1. **PLAN-008** — an infinite redirect loop on the privacy policy, a compliance-critical
   page, by pointing `/privacy` at a path that already redirects back.
2. **PLAN-011** — deploying a template that re-links the retired Functions backend, the
   one action CI explicitly warns is not the fix for a broken `/api/*`.
3. **PLAN-004** — `git rm -r src/`, deleting the live backend.
4. **PLAN-001** — patching the undeployed tree: a green PR closing the ticket while the
   injection kept running in production.
5. **PLAN-010** — two permanently silent alerts, which is worse than none because silence
   reads as coverage.
6. **PLAN-003 / PLAN-005 / PLAN-007** — deleting the only working backup script, seven
   real API tests, and an existing harness respectively.

The root cause is uniform and worth stating plainly: the plans were written 2026-07-03,
three weeks before the API consolidation, and **six still describe the retired `api/`
Functions tree as the live system**. Any future plan naming `api/src/...` is describing
something that no longer exists.

### What is knowingly unresolved

Stated rather than buried:

1. **The alerting is not deployed.** Until applied it protects nothing. Deployment is
   billable and emails a real inbox, so it is the owner's call.
2. **The XFF rightmost change ships on reasoning, not measurement.** It is provably never
   worse than the leftmost parsing it replaced, but whether this platform appends the
   client IP was never empirically confirmed — verifying needs a header-echo endpoint, and
   observing the limiter in production would mean generating real emails and CRM records.
3. **`app/[locale]/` remains, unreachable.** CLAUDE.md ties it to Oryx prerendering; that
   needs preview verification before deletion.
4. **Anti-abuse tunables are still published** in a public repo.
5. **`api/` still carries the injection bug**, deliberately — unreachable and scheduled for
   deletion, but it will read as an unfixed vulnerability to anyone browsing that tree.
6. **Coverage is ~31% repo-wide**, dominated by untested presentational components. The
   logic-heavy API layer is ~96%. Do not read the headline number as the risk picture.
7. **Nothing was load-tested.** Limits are unit-tested for logic, not under concurrency.

### The durable change

The recurring failure was never that people wrote things down wrongly. It was that
**nothing failed when the writing stopped matching the code**. So this effort ends with
guards rather than corrections:

- `__tests__/routing/redirect-map.test.ts` — loop detector; fails with the offending chain
  and names the plan that would reintroduce it.
- `__tests__/docs/docs-manifest.test.ts` — `docs/` cannot silently refill, and a living doc
  cannot reassert retired architecture.
- `__tests__/api/logging-hygiene.test.ts` — no bare `console.*`, no personal data in logs.
- `__tests__/api/abuse-hardening.test.ts` and the API suite — mutation-proven.
- The Quality Gate — a required check that runs the whole suite, because a filter matching
  zero files is silently ignored.

Every one of those was verified by breaking the thing it guards and confirming the right
test failed. Two were rewritten after passing against both the fixed and unfixed code, and
one mutation appeared to pass until the mutation itself was checked and found to have
rewritten a comment instead of the code.

### Addendum — alerting deployed (2026-07-27)

The PLAN-010 alerting is **live**. Five resources in `BTAI-RG1`, alerting
`terence@bridgingtrust.ai`, both availability alerts enabled at severity 1.

**The first apply failed, and the lesson generalises.** `RoleAssignmentExists` on both role
assignments: they already existed under hand-created GUIDs, Bicep names them with `guid()`,
and **`what-if` cannot read role assignments** — so it reported them as `Create` and gave
no warning. A clean `what-if` does not guarantee a clean apply. The alerts themselves had
already been created when the failure hit, so nothing was lost, but the deployment was
marked Failed.

Fixed by removing both role assignments from the template. They granted storage and Key
Vault access to `func-btai-site-prod`'s identity, and that app is being deleted in Phase 5;
the live app uses neither, reaching the queue with a queue-scoped SAS and holding its own
settings. Redeploy succeeded.

**Verified functional, not merely present.** Both webtests report 100% availability, which
confirms the subtle case: Azure accepts `ExpectedHttpStatusCode: 400`, so the contact
probe's validation rejection counts as a pass. Had it not, the test would fail on every run
and page a human every fifteen minutes until someone switched alerting off — which is how
monitoring usually dies.

**Stated plainly: no alert has actually fired.** The probes are green, so there has been
nothing to fire on, and forcing one would mean breaking production or standing up a
throwaway failing webtest. The wiring is verified end-to-end short of that last step.

### Addendum — Phase 5 teardown (2026-07-27)

`api/` is deleted from the repository, and `func-btai-site-prod` plus
`plan-btai-site-prod` are deleted from Azure. The site was verified healthy immediately
before and after: homepage 200, `/api/health` → `{"status":"ok"}`, invalid POST to
`/api/contact` → JSON 400.

**Scope was deliberately narrow, and the reasons matter more than the deletion.**
`BTAI-RG1` is a **shared resource group** holding other projects' resources, so teardown
is never "delete the group". Three things were kept that a broader sweep would have taken:

- **The storage account** hosts `btai-lead-classify`, the **live** queue production writes
  to on every lead. Deleting it breaks the pipeline.
- **App Insights and Log Analytics** are now load-bearing — the availability alerting
  deployed earlier today depends on them.
- **Key Vault** is retained as the intended home for secrets even though nothing currently
  reads it.

**What the teardown removed was a decoy, not just dead weight.** `api/` was undeployed for
a month, and in that window **six strategy plans were written against it as the live
system** — PLAN-001 would have "fixed" a production vulnerability there while the real one
kept running. A tree that looks authoritative and executes nowhere is worse than no tree.
`__tests__/infra/phase5-teardown.test.ts` now fails if it returns.

`scripts/wire-functions-settings.sh` went with it, as its own header instructed.

**A correction to CLAUDE.md fell out of this.** It claimed "Prod secrets: Azure Key Vault
via system-assigned managed identity, referenced with `@Microsoft.KeyVault()` — never
plain-text in app settings." That is **false for the live application**: the Static Web
App's 11 settings contain zero Key Vault references and every secret is a literal value.
Key Vault + managed identity was the _Functions app's_ mechanism and died with it. The
claim is corrected, and closing the gap is the next open item.

---

## Transparency report — the three follow-up items (2026-07-27)

All three of the items listed after the twelve plans are now closed. Two shipped as built;
the third shipped as the opposite of what was proposed, for a reason worth reading.

### 1. Alerting deployed ✅

Live in `BTAI-RG1`, alerting `terence@bridgingtrust.ai`. Detail in the addendum above. The
finding that generalises: **`what-if` cannot read role assignments**, so it reported two
pre-existing ones as `Create` and the apply failed with `RoleAssignmentExists` — after the
alert resources had already been created. A clean `what-if` does not guarantee a clean
apply.

### 2. Phase 5 teardown ✅

`api/` deleted; `func-btai-site-prod` and its plan deleted. Storage (the live queue), App
Insights, Log Analytics and Key Vault deliberately kept. Detail in the addendum above.

### 3. SWA settings in IaC — **inverted, and this is the important one**

The item was "declare the Static Web App's settings in Bicep." **Doing that would have
taken production down.**

`Microsoft.Web/staticSites/config` **replaces the entire settings collection** on every
deploy. Of the eleven live settings, three are secrets that cannot live in a public repo.
Declaring the eight safe ones deletes the other three, and the next apply breaks the site:
no `RESEND_API_KEY` means the contact form answers 503, no `CLASSIFY_QUEUE_SAS_URL` means
every lead enqueue throws. Declaring all eleven behind `@secure()` parameters is worse
still — any deploy that omits them blanks the secrets silently, with no error.

So the settings stay operator-managed, and what was actually missing — a written,
enforceable contract — was built instead:

- `infra/swa-settings.contract.json` — the authoritative list. Names, classification, and
  the file that consumes each. No values.
- `__tests__/infra/swa-settings.test.ts` — cross-checks it against the code's real
  `process.env` usage **in both directions**: a variable the code reads that nobody
  provisions, and a setting provisioned that no code reads. Runs offline. Mutation-verified
  both ways.
- `scripts/check-swa-settings.sh` — the live half. Read-only, names only. Run against
  production: **11 settings, names match exactly.**
- `infra/main.bicep` records why the resource is absent, so the omission is not "fixed"
  later by someone who sees a gap.

**A security correction fell out of this.** CLAUDE.md claimed "Prod secrets: Azure Key
Vault via system-assigned managed identity, referenced with `@Microsoft.KeyVault()` — never
plain-text in app settings." That is **false for the live application**: zero of the three
secrets are Key Vault references; all are literal values. Key Vault + managed identity was
the _Functions app's_ mechanism and died with it. The Static Web App is Standard tier with
a system-assigned identity, so Key Vault references **are** supported — the literals are
historical, not a platform limit. Migrating them is now a tracked item, currently blocked
on the vault's network ACLs, which deny access from outside its allowed ranges.

### The pattern, one more time

Three items; one of them, followed literally, would have broken production. That is now
**nine** instructions across this effort that were wrong against the code — and as with all
the others, it surfaced only by checking the mechanism rather than trusting the sentence.
The check that caught it was reading what `staticSites/config` actually does before
declaring one.

---

## Transparency report — Key Vault migration: closed as impossible (2026-07-28)

The item was "move the three SWA secrets to Key Vault references." **It cannot be done on
this platform, and attempting it would have broken the contact form.**

### What was actually true

Azure Static Web Apps support `@Microsoft.KeyVault()` references **only for custom
authentication configuration**. The **managed backend** that serves `/api/*` does not.
Microsoft's own documentation states that the serverless functions shipping with Static
Web Apps "do not support direct Key Vault integration" and that Key Vault access must be
implemented in application code instead. Three open Azure issues track exactly this:
[#1090](https://github.com/Azure/static-web-apps/issues/1090),
[#1091](https://github.com/Azure/static-web-apps/issues/1091),
[#428](https://github.com/Azure/static-web-apps/issues/428).

So setting `RESEND_API_KEY` to `@Microsoft.KeyVault(SecretUri=...)` would have delivered
**that literal string** to `process.env` at runtime. The Resend client would have been
constructed with it as an API key and every send would have failed — an outage of the lead
path, reached while trying to improve its security.

### The uncomfortable part

**This item existed because of an inference in the previous session's report**, which
reasoned "Standard tier + system-assigned identity, therefore Key Vault references are
supported." Both premises were true. The conclusion was wrong, because the capability is
scoped to a feature the site does not use.

That is the same failure this whole effort has been cataloguing — and this time the source
was the effort's own output, not a plan written three weeks earlier. Documented findings
decay the same way plans do. The check that caught it was reading the platform
documentation before touching production, rather than trusting a sentence that sounded
authoritative.

### What replaces it

Key Vault is not a control here, so the controls are named explicitly instead of implied:

- **Azure RBAC on the Static Web App** governs who can read the settings.
- **`CLASSIFY_QUEUE_SAS_URL` is queue-scoped and add-only** — least privilege by
  construction, so a leaked value cannot read or delete messages.
- **Rotation** is the response to exposure; removal is not.
- **Values never enter this repository**, in any form.

`kv-btai-site-prod` is retained but reads by nothing. It was the retired Functions app's
mechanism and died with it.

### Guarded, not just corrected

CLAUDE.md carried the false claim — _"Prod secrets: Azure Key Vault via system-assigned
managed identity… never plain-text in app settings"_ — and CLAUDE.md is loaded into every
session, so a false security claim there is read far more widely than one in `docs/`.
`__tests__/docs/docs-manifest.test.ts` now fails if that wording returns, with the reason
in the failure message. Mutation-verified by pasting the original sentence back.

## Transparency report — alerting live-fired (2026-07-28)

An alert that has never fired is theater, so one was made to fire.

A throwaway webtest was deployed against `https://bridgingtrust.ai/__alerting-live-fire-does-not-exist`
(confirmed 404 first, so it fails by construction) with a paired Sev4 alert on the **real**
action group. It fired in **~40 seconds**:

```
rule:       alert-btai-firetest-DELETEME
condition:  Fired
severity:   Sev4
fired at:   2026-07-28T13:25:10Z
```

That proves the chain end to end — webtest → App Insights → metric alert rule → action
group — using the same action group the production alerts use.

Both throwaway resources were deleted immediately (alert first, since it references the
webtest), and the resource group was re-checked: exactly the five real resources remain,
nothing named `DELETEME` survives. The real webtests still report 100% and both production
alerts remain enabled. The site was unaffected throughout.

**Delivery confirmed 2026-07-28.** The owner received the Sev4 "TEMPORARY alerting
live-fire test" email. That closes the last hop: the chain is now verified end to end from
a failing probe all the way to a human's inbox, not merely to the action group. The
alerting is trustworthy.

**Made repeatable rather than one-off.** `infra/alerting-firetest.bicep` is now in the
repo with the full runbook in its header — deploy, confirm, delete. Alerting should be
re-verified periodically, and re-deriving this each time invites skipping it.
`__tests__/infra/alerting.test.ts` asserts the template stays quarantined: never referenced
by `main.bicep`, resources named `DELETEME`, deletion commands documented, and the probe
URL pointing at a path that cannot exist.

## Transparency report — anti-abuse tunables externalised (2026-07-28)

CLAUDE.md has said since the start that anti-abuse tunables belong only in the private
runbook. The contact rate limit was nonetheless sitting in `send-contact-email.ts` as two
literals in a **public** repository, telling anyone exactly how to stay under it.

Both now come from Static Web App settings. Two details make this more than a move:

**The repo default is deliberately stricter than production.** Any default in a public repo
publishes _a_ number, so the number published is one that fails **safe**: an environment
that forgets to configure the limit gets a tighter limit, not a looser one. The code says
so, to stop a future reader "correcting" the gap.

**Garbage input falls back rather than disabling the limiter.** `""`, `"0"`, `"-1"`,
`"abc"` and `"5.5"` all resolve to the safe default. A typo in an app setting must not
silently switch anti-abuse off — and that is asserted, not assumed.

Circuit-breaker values stay in code deliberately. They protect against a failing email
provider, not a human, and knowing them enables no evasion: an attacker cannot make Resend
fail on demand.

### Verified before touching production

`az staticwebapp appsettings set` documents itself as "add to or change", but CLI docs have
been wrong before, and a replace would have wiped the three secrets. It was **tested
empirically** with a throwaway setting nothing reads: 11 → 12 → 11. Merge confirmed, then
the real values were set: **11 → 13, with all three secrets still present**, and the
contract script reports 13 settings matching exactly.

### Two things this exercise caught in its own work

**A scrub that reported "clean" while erroring.** `git grep ... ':!__tests__'` failed with
`Unimplemented pathspec magic`, and `|| echo "  clean"` printed reassurance. The rerun added
a control case proving the search finds a known hit before trusting an empty one — the same
discipline this effort has needed at least four times now.

**The guard test published the very value it protects.** Its pattern-proof sample read
`const RATE_LIMIT_MAX_REQUESTS = 5;` — the real production number, committed to a public
repo inside the suite meant to keep it out. Changed to an obviously-arbitrary `999`. Worth
recording plainly: the fix and the leak were written in the same file, minutes apart.

## Transparency report — alerting confirmed, and where the site is not yet complete (2026-07-28)

**The alerting is trustworthy.** The owner confirmed receipt of the Sev4 live-fire email,
closing the one hop that could not be verified from a shell. The chain is proven from a
failing probe to a human's inbox.

With the twelve plans and their follow-ups closed, the honest answer to "what is left" is
that the **backend is in good shape and the front end is largely unverified**. Coverage
tells the story plainly:

| Area                          | Lines    |
| ----------------------------- | -------- |
| `src/lib/api` (the lead path) | **95%**  |
| `app/api/*` route handlers    | **100%** |
| `app/components`              | **27%**  |
| `lib/`, `src/lib` (non-API)   | **0%**   |

### The largest single gap: 90 E2E tests that run nowhere

`e2e/` holds three specs — 90 tests across basic navigation, dark mode and responsive
layout. They collect cleanly and are wired to a `webServer`. **No workflow runs them.**

And they have rotted while disconnected: `vercel-safari.spec.ts` navigates to
`/vercel-safari`, a page that **no longer exists**, so roughly a third of the suite would
fail on the first run. That is almost certainly why it was never wired in — the suite was
left disconnected rather than fixed, which let it rot further, which made wiring it in
look harder. The same loop that produced everything else in this report.

This matters more than the raw coverage number. The API is the part with tests; the part a
visitor actually touches — the nav, the form, the theme toggle — is verified by nothing
automated.

### Two claims in CLAUDE.md were themselves stale

Its "broken npm scripts" section warned that `test:e2e:dark-mode` "points at deleted files
and exit 1" and "targets a path outside Playwright's `testDir`". **Both false**:
`e2e/dark-mode.spec.ts` exists and `testDir` is `./e2e`. The `test:middleware*` entries it
warns about are gone entirely. Corrected — a stale warning is as misleading as a stale
instruction, and this one would have deterred someone from running a suite that works.

### Not gaps, but decisions

Performance budgets and accessibility are documented or assumed and measured by nothing.
Neither is a defect today; both are unverified claims, which this effort has repeatedly
shown is a different thing from a true one.

### A note on how this tracker nearly lied (2026-07-28)

Five rows in the carried-forward table above still read "Open" for work that had been
finished and merged. The cause was **my own conflict resolution**: rebasing four PRs that
each touched this file, I resolved every `ROADMAP.md` conflict by concatenating both sides.
That preserved the prose addenda — which are additive and read correctly — while silently
discarding the _in-place row edits_, which are not additive. Both sides "kept", one side
lost.

It surfaced only because a later edit printed the table and the rows contradicted reports
written directly above them. Nothing failed; the file simply became untrue in the one place
a reader looks first for status.

The general shape, for the next person resolving a conflict in a status document:
**concatenating both sides is safe for append-only prose and unsafe for tables and status
fields.** For those, re-derive the state rather than merging the text.

The table above is now rewritten from verified state rather than merged.

## PLAN-013 — why the front end is the whole remaining surface (2026-07-28)

With the twelve plans and their follow-ups closed, the imbalance is stark: the lead path is
at ~95% with every behaviour mutation-tested, and **the part a visitor touches is verified
by nothing automated**.

`docs/strategy/plans/PLAN-013-frontend-verification.md` covers the three gaps. It is mostly
about **connecting and repairing what already exists**, not writing tests from scratch —
which is why the diagnosis matters more than the effort estimate:

- **The Playwright suite cannot start.** `webServer.command` is `npm run dev`, which serves
  **HTTPS**, while `webServer.url` is `http://localhost:3000`. Playwright waits for an
  endpoint that never answers. Ninety tests were not "never wired in" out of neglect — they
  were **unrunnable**, and that is a one-line fix.
- **`vercel-safari.spec.ts` (20 tests) navigates to a deleted page**, so a fifth of the
  suite fails regardless.
- **Two configured Playwright projects match zero tests** — `visual-regression` and
  `performance`. The second is a fossil of an earlier attempt at exactly the performance
  budgets CLAUDE.md still publishes and nothing measures. A project matching zero tests is
  indistinguishable from a passing one, which is this repo's signature failure.

The plan carries two rules learned the hard way here. **Measure before asserting**: if the
site does not currently meet CLAUDE.md's performance budgets, record the real baseline and
ratchet, rather than shipping a gate that fails on day one or, worse, one that passes
because it measures nothing. And **do not make the new E2E job a required check in the same
PR** — a flaky new gate that blocks merges gets disabled permanently, so it runs advisory
until it has earned the promotion, exactly as PLAN-002's gate did.
