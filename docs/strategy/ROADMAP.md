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
| PLAN-010 observability & alerting   | ✅ Executed — deployed 2026-07-27; both alerts live and enabled, delivery confirmed | #80, #84  |
| PLAN-011 IaC completeness           | ✅ Executed                                                                  | #78       |
| PLAN-012 docs truth reconciliation  | ✅ Executed — batch one #67–#72, remainder #82                               | #82       |
| API-consolidation Phase 5 teardown  | ✅ Executed 2026-07-27 — `api/` deleted, Function App and plan torn down; guarded by `__tests__/infra/phase5-teardown.test.ts` | #84       |

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
| **90 E2E tests exist and run in no workflow**, and `vercel-safari.spec.ts` targets a deleted page so a third fails on first run | ✅ **Done 2026-07-28 (PLAN-013 Part 1)** — 130 tests green across 5 browsers; advisory `Quality Gate / e2e` job added                   |
| Dev server could not hydrate — CSP withheld `'unsafe-eval'` from Next's dev bundler                                             | ✅ **Fixed 2026-07-28** — dev-only relaxation gated on `NODE_ENV === "development"`, 4 guard tests; production policy unchanged         |
| SWA preview deploys failing — staging-environment cap reached, cleanup races the in-flight deploy                               | ✅ **Fixed 2026-07-29** — `cleanup-pr` now waits for in-flight runs before closing; ordering, not retrying                              |
| Performance budgets documented in CLAUDE.md, measured by nothing                                                                | ✅ **Done 2026-07-28 (PLAN-013 Part 2)** — Lighthouse CI against the preview URL; a dead `lighthouserc.js` replaced                     |
| Cloudflare beacon blocked by CSP — cost 26 best-practices points via one console error                                          | ✅ **Fixed 2026-07-28** — allow-listed; privacy policy corrected to disclose Cloudflare and drop a false Google Analytics claim         |
| **Cloudflare Bot Management (JS Detections) costs ~34 points** — 16 performance + 18.5 best-practices; `/cdn-cgi/challenge-platform/…/jsd/main.js`, 750 ms eval, one 375 ms long task | ⬜ **Open — decision documented, owner's call.** See `docs/strategy/plans/PLAN-015-cloudflare-bot-management.md`. Dashboard-only; **the available lever depends on the Cloudflare plan** and there are no credentials here. Cost **recurs ~every 15 min** (measured; the 365-day `cf_clearance` expiry is a red herring), so the first load of essentially every visit pays — but apex Core Web Vitals still pass. Prove with `JSD_ONLY=1 ./scripts/measure-cloudflare-cost.sh` |
| Intermittent `inspector-issues` CSP audit at the apex (~3.7 best-practices points, fails 1 run in 6) | ⬜ Open — **cause not established, deliberately.** Edge-related (origin is clean under a byte-identical CSP) but it corresponds to **no** CSP violation a real browser reports; a `static.cloudflareinsights.com` `connect-src` hypothesis was refuted with a positive-controlled probe |
| **Node 20 reached END OF LIFE on 2026-04-30** — the runtime has had no security patches for 90 days                             | ✅ **Done 2026-07-29 (PLAN-014)** — migrated to **22.22.0**, build *and* runtime; `apiRuntime` proven inert and removed                  |
| Cloudflare's AI-crawler policy costs 8 SEO points — the `Content-Signal:` line Lighthouse calls an unknown directive               | ⬜ Open — **recommend KEEPING.** It blocks GPTBot/ClaudeBot/Google-Extended et al from training on this content; 8 points is a poor trade |
| Accessibility never assessed                                                                                                    | ✅ **Done 2026-07-28 (PLAN-013 Part 3)** — axe over 5 pages + dark mode; 57 blocking nodes → **0 critical, 0 serious**                  |
| **Dependabot had never run — invalid config since the first commit (2025-05-25)**; 0 Dependabot PRs against 88 total              | ✅ **Fixed 2026-07-28** — `security-updates-only` removed, alerts enabled, guard test added                                             |
| Dependency majors — the "Later" trigger (a real test gate exists) is now **met**                                                | ⬜ Open — still `ignore`d in dependabot.yml; releasing them is deliberate work, not a side effect                                       |
| 4 GitHub Actions major bumps proposed on Dependabot's first run (#92–#95) — Node 20 action runtime is being deprecated            | ✅ **Done 2026-07-28** — all four landed one at a time, plus the hadolint minor (#91); all four workflows green on `main`                |
| Two actions still on the deprecated Node 20 runtime: `setup-node@v4` and `download-artifact@v4`                                   | ✅ **Done 2026-07-29** — bumped to v6/v7; a guard now fails if any action is pinned at two versions across workflows                    |
| Dependabot PRs failed `deploy-pr-to-azure` — Dependabot runs read a separate secret store with no SWA token                      | ✅ **Fixed 2026-07-28** — job now skips `dependabot[bot]`; the deploy could never have succeeded                                        |
| `dependabot-security.yml` ran for the first time ever and failed — gated on an actor that had never existed                      | ✅ **Fixed 2026-07-28** — it was correct; it failed on the real `next-intl` vulnerability, now removed                                  |
| 69 open Dependabot alerts, of which **only 2 are production scope** (both `next-intl`, which is installed and never wired up)     | ✅ **Fixed 2026-07-28** — `next-intl` removed; `npm audit --omit=dev` now reports **0 vulnerabilities**                                 |
| `server.js` prints `HTTP_PORT` but the HTTP-only branch binds `PORT` — the startup banner can name a port it is not serving          | ⬜ Open — cosmetic but cost real debugging time; see CLAUDE.md                                                                          |
| Availability monitoring costs **~$16.26/mo**, 81% of it the 5-minute health probe                                                    | ⬜ Open — owner's call; 10-min interval saves ~$6.60/mo for ~5 min more detection latency                                              |

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

---

## Transparency report — PLAN-013 Part 1: E2E in CI (2026-07-28)

**Outcome**: the E2E suite runs, in CI, and can fail. 130 tests green across five browsers
in 1.2 minutes; `Quality Gate / e2e` added as an **advisory** check. Unit suite 293 → 297.

### The plan's headline diagnosis was wrong, and it was written the same day

PLAN-013 said `npm run dev` serves HTTPS while `webServer.url` is HTTP, so Playwright waits
forever — "a one-line fix". That is false. `server.js` picks its protocol from whether SSL
certificates exist: with none it logs *"No SSL certificates found, falling back to HTTP"*;
with them it starts HTTPS **and** HTTP, the latter still on 3000. HTTP answers on 3000 in
both cases. The one-line fix would have changed nothing.

The claim came from reading `package.json` — `dev` sets no `SSL_CERT_ENV`, `dev:http` sets
it to `none` — and inferring the runtime behaviour. Reasonable inference, wrong conclusion,
never executed. Structurally identical to the Key Vault item closed three days earlier:
true premises, plausible reasoning, nobody ran it. **The lesson is not "plans go stale".
It is that a conclusion nobody executed is a hypothesis no matter how recently it was
written, including one written ten minutes ago by someone who had just read the code.**

### What was actually wrong — two failures, both silent

**1. Playwright could not tell this site from any other.** `webServer` used `url:` with
`reuseExistingServer: !process.env.CI`, which polls until *something* returns 200. Port 3000
on this machine is held by an unrelated container. Replaying the old config verbatim
produced:

```
Expected pattern: /Bridging Trust AI/
Received string:  "Sign in | Langfuse"
```

A foreign application's login page, reported as a homepage-title regression. Every
subsequent failure would have read as a DOM regression in this repo. This is the fourth
distinct instance of the same family — a mechanism that reports confidently about something
it never examined.

Fixed by switching `url:` → `port:` (Playwright then *refuses to start* on an occupied
port instead of polling it), `reuseExistingServer: false` unconditionally, and adding a
**target-identity test** that asserts the origin under test is actually this site before
anything else runs.

**2. The dev server could not hydrate.** The CSP withholds `'unsafe-eval'`; Next's dev
bundler wraps every module in `eval()`. The browser refused all of it, so `npm run dev`
rendered its server HTML and stopped — theme toggle frozen at its pre-mount placeholder,
hero absent, nothing interactive, one console line as the only symptom. **Local development
of any client-side behaviour was impossible and had been for some time.**

Production was checked before touching anything and is unaffected: the same diagnostic
against `https://bridgingtrust.ai/` finds the `h1`, a mounted toggle, and no CSP violation
beyond a Cloudflare beacon that is correctly blocked. Fixed with a relaxation gated on
`NODE_ENV === "development"`.

**A near-miss worth recording.** That gate was first written `!== "production"`. Vitest runs
under `NODE_ENV=test`, so it would have handed the relaxation to the test environment — and
the *existing* `never allows unsafe-eval` assertion would have gone on passing while
guarding a policy no browser ever sees. Caught because the pre-existing test failed
immediately. It is now `=== "development"`, with a guard asserting the test environment is
excluded, and a mutation confirmed both fail when the gate is loosened.

### The dark-mode suite was not stale. It was hollow

The plan budgeted for 65 dark-mode tests "never run against the current DOM". The real
problem was different: **five of the thirteen ended in `expect(typeof isDark).toBe("boolean")`**
— true for every possible value, including `undefined`. They would have reported green
against a toggle that did nothing at all. Others asserted Tailwind class strings
(`dark:bg-gray-900/98`; the actual class is `dark:bg-gray-900`) and a two-icon DOM the
component does not render, and one asserted `role="button"` as an *attribute* on a
`<button>` — which carries that role implicitly and sets no such attribute, so it failed
against correct markup.

Rewritten to assert experience rather than implementation: the computed `background-color`
changes, the choice survives a reload, `Enter`/`Space` operate the control, an explicit
choice overrides the system preference. Nothing skipped.

### CI tests the production build, not the dev server

Because the two demonstrably differ — the CSP alone differs, and this repo has already
shipped a defect (no security headers at all) that existed *only* in the deployed artifact.
`playwright.config.ts` runs `npm run build && npm run start` when `CI` is set. Verified
locally with `CI=true`: 26/26 green.

### Found en route: preview deploys had been failing since the cap filled

`deploy-pr-to-azure` was failing with *"already has the maximum number of staging
environments"*. Ten environments, every one belonging to an **already-merged** PR.

The `cleanup-pr` job fires correctly on `pull_request: closed` — and still leaks. On PR #75
it ran 18:34:01–18:34:25 and reported success, while the in-flight deploy from the previous
push ran until 18:35:02 and **created the environment at 18:34:37**, twelve seconds after
its own cleanup finished. The cleanup runs before the thing it cleans up exists, exits
green, and orphans it permanently.

Orphans deleted (production `default` untouched, verified 200 before and after) and previews
restored — #86's re-run went green. **The race itself is not fixed** and is tracked above;
it will refill the cap in roughly ten merged PRs. Not fixed here because the robust
options need Azure credentials the workflow does not currently have, and that is a separate
change from this one.

### Verification

| Check | Result |
| --- | --- |
| `npm run type-check` | clean |
| `npm run test:coverage` | 297 passed, thresholds met |
| `npm run build` | clean |
| `npx eslint . --no-cache` | 0 errors (22 pre-existing warnings) |
| `npx playwright test` (5 browsers) | **130 passed** |
| `CI=true npx playwright test --project=chromium` | 26 passed, against a production build |
| Gate proven able to fail | `ThemeToggle` forced to its placeholder → 11 red; reverted → 26 green |
| Guards proven able to fail | CSP gate loosened to `!== "production"` → 2 red, incl. the pre-existing one |
| Production unaffected | homepage 200, `/api/health` `{"status":"ok"}`, `/api/contact` 400 |

### Also corrected: the status table was still contradicting itself

#86 rewrote the *carried-forward* table from verified state but left the **plan** table
above it untouched. It asserted "all twelve plans are now closed" three rows above
`PLAN-010 … ◐ awaiting deployment` and `Phase 5 teardown … ⬜ Open` — both of which were
finished and merged days earlier. Verified against reality before editing: `api/` is
absent and untracked, the Bicep declares no `serverfarms`, and `az monitor metrics alert
list` shows both alerts live and `Enabled: True`. Rows corrected.

The repair in #86 fixed the table someone had reported as wrong and did not re-derive its
neighbour. Worth stating plainly, since the same session wrote the rule about not trusting
in-place table edits: **a fix scoped to the reported symptom leaves the rest of the class
in place.**

### What is deliberately not done

- **The `e2e` job shipped advisory, not required.** It was promoted to required on 2026-07-29 after the job itself was green 12 of 12 runs.
- **Five-browser runs stay local.** CI runs chromium only.
- **No visual-regression snapshots.** Deleting the dead project is not a decision to adopt
  snapshots; that needs its own justification.
- **The staging-environment race**, above.

---

## Transparency report — PLAN-013 Part 3: accessibility (2026-07-28)

**Outcome**: the site's first accessibility gate. `e2e/a11y.spec.ts` runs axe over the
homepage, all four canonical legal pages, and the homepage in dark mode. **57 blocking
nodes → 0 critical, 0 serious.** `@axe-core/playwright` pinned at 4.12.1.

### The findings were one problem, not fifty

The plan expected "contrast on the gradient headings and form-label associations". Form
labels were **already correct** — every contact field has a real `htmlFor`. Every finding
was colour, and they collapsed to four tokens repeated across the site:

| Token | Was | Now | Where |
| --- | --- | --- | --- |
| brand `#5B90B0` as text on white | 3.46:1 | `#3A5F77` — 6.81:1 | nav links, footer links, small caps |
| white text on the brand background | 3.46:1 | on `#3A5F77` — 6.81:1 | primary buttons |
| `text-blue-500` `#2b7fff` | 3.76:1 | `text-blue-600` — 5.25:1 | inline links in legal prose |
| `text-gray-400` `#99a1af` | 2.60:1 | `text-gray-500` — 4.84:1 | message character counter |

Plus `link-in-text-block` on the three terms pages (colour-only link affordance → always
underlined), a dark-mode Decline button at 3.96:1, and the contact form's invalid-state
submit button at `opacity-60` → 2.75:1.

**That submit button is the one worth reading twice.** It is styled `opacity-60
cursor-not-allowed` when the form is invalid, but `disabled` is bound only to `isSubmitting`
— so it is an **enabled, clickable control** that merely looks disabled, at 2.75:1. WCAG
exempts genuinely inactive controls; this one did not qualify. Raised to `opacity-85`
(4.74:1). The underlying disabled/enabled mismatch is left alone deliberately: changing the
submit behaviour of the lead form is not a contrast fix.

`#3A5F77` was already the codebase's hover tone for the same elements, so nothing new was
invented — hovers moved down to `#2C4A5E` to stay distinguishable. Purely decorative accent
bars carry no text, so contrast rules do not apply to them; the three that a blanket
find-and-replace had swept up were **reverted**, keeping the diff tied to its stated purpose.

### The flake taught the more useful lesson

The dark-mode scan failed about one run in three, on a different browser each time, and
passed on every isolated re-run. The captured message was the whole diagnosis:

```
foreground #192736 on background #1a2937 — 1.02:1
```

Two near-identical darks. At partial opacity, both an element's text and its background
resolve to blends of whatever is behind them, so axe measured a pair that is shown to no
user at any point they could act on.

Two wrong turns before the right one, both recorded because each was a plausible theory that
survived until it was tested:

1. **`emulateMedia({ reducedMotion: "reduce" })`** — the component honours the preference, so
   this looked sufficient. It is not: Framer Motion's `reducedMotion="user"` suppresses
   *transform and layout* animations and deliberately keeps **opacity** fades, which are
   considered vestibular-safe. Flake survived.
2. **A CSS `transition: none !important` stylesheet** — correct for the theme-change
   transition, useless here. Framer Motion writes inline `style="opacity: …"` from
   requestAnimationFrame, and no stylesheet can stop a script assigning inline styles.

The fix that worked waits for every **inline** opacity to settle to 0 or 1, then freezes
what remains. Only inline opacity is polled, because the contact form's submit is now
`opacity-85` — a permanent fractional opacity from a utility class, which a naive "wait until
nothing is fractional" check would have waited on forever. Verified by **6 consecutive clean
a11y runs (180 test executions)** and 3 clean full-suite runs, against a prior ~1-in-3
failure rate.

Generalisable: `networkidle` is not "the page has settled". It says the network is quiet, and
says nothing about animation, hydration, or layout. Any visual assertion taken on
`networkidle` alone is racing whatever the page does next.

### Two unit tests were asserting the old colours

`Footer.test.tsx` pinned `bg-[#5B90B0]` on a decorative underline and `hover:text-[#5B90B0]`
on nav links. The first was reverted (decorative, no text, should never have changed); the
second was updated with the reason recorded in the test — hovering used to move contrast from
4.84:1 **down** to 3.46:1, which is the wrong direction for a focus cue.

### Scope stated honestly

axe detects roughly a third of WCAG issues. Green here means "no machine-detectable critical
or serious violation", **not** "this site is accessible". Keyboard traps, focus order, and
whether alt text is *meaningful* rather than merely present still need a human. The spec says
so at the top so nobody cites it as more than it is.

`moderate` and `minor` violations are printed in failure output but do not fail the run. A
first gate nobody can get to green gets deleted; this one can be tightened once it has held.

### Verification

| Check | Result |
| --- | --- |
| `npm run type-check` | clean |
| `npm run test:coverage` | 297 passed, thresholds met |
| `npm run build` | clean |
| `npx eslint . --no-cache` | 0 errors |
| `npx playwright test` (5 browsers) | **160 passed**, 3 consecutive clean runs |
| `CI=true --project=chromium` | 32 passed against a production build |
| Gate proven able to fail | one colour reverted → homepage and dark-mode both red |

---

## Transparency report — PLAN-013 Part 2: performance budgets (2026-07-28)

**Outcome**: Lighthouse CI runs against the PR preview URL with thresholds derived from
measurement, all met today. A `lighthouserc.js` that had been in the repo since 2025-09 and
could never load, never fail, and was misconfigured, is gone.

### Measuring first is the whole story

The plan's rule was "measure before asserting". It changed what got built.

Same commit, same day, desktop preset, 3 runs each:

| Target | Perf | A11y | Best prac. | SEO | LCP | TBT |
| --- | --- | --- | --- | --- | --- | --- |
| local `npm run start` | **100** | 100 | 100 | 100 | 605 ms | **0 ms** |
| SWA origin — same code as apex | **97** | 96 | 100 | 100 | 1301 ms | **0 ms** |
| PR preview — with the Part 3 fixes | **97** | **100** | 100 | 100 | 1323 ms | 0 ms |
| apex `bridgingtrust.ai` | **79** | 96 | **74** | **92** | 1526 ms | **360 ms** |

**A localhost gate would have been worthless.** It reports a perfect 100 while real users
get 79 — it would have passed forever and detected nothing. That is the fourth instance of
this repo's signature failure, and the first one caught *before* shipping rather than after.
`lighthouserc.json` pins no URL at all; a guard test fails if one is added or if it mentions
localhost.

### CLAUDE.md's "Perf ≥ 90" is met by the application and missed by the deployment

97 on the SWA origin, 79 at the apex, **identical build**. Accessibility scores 96 on both,
which is what establishes the code is the same and the gap is entirely the edge.

The apex sits behind **Cloudflare** (`server: cloudflare`, `cf-ray` present; absent on the
SWA origin). Verified mechanisms:

- Cloudflare injects its Web Analytics beacon — +1297 bytes, **browser User-Agent only**, so
  `curl` shows nothing and only a real browser reveals it. The CSP correctly refuses it
  (`static.cloudflareinsights.com` is not allow-listed), and the resulting console error is
  what drops best-practices from 100 to 74.
- Cloudflare merges an AI-crawler policy into `robots.txt`. The site's own `Allow: /` and
  `Sitemap:` survive inside the merged file, but Lighthouse rejects its syntax — SEO 100 → 92.
- No Rocket Loader; checked.

**What was not established**: the 360 ms TBT at the apex versus 0 ms on the origin. It
correlates with the Cloudflare hop and the blocked beacon is too small to explain it. It is
recorded as a correlation, and the roadmap item says so rather than asserting a cause I did
not isolate. Naming the boundary of what was proven is the point — the Key Vault item that
cost this effort a day was a plausible inference presented as a finding.

**Nothing was changed about Cloudflare.** It is the owner's infrastructure, the AI-crawler
policy may well be wanted, and "turn off the CDN" is not a conclusion that follows from a
Lighthouse score. It is now a tracked, quantified item instead of an invisible one.

### The Part 3 work is confirmed on a real deployment

Accessibility 96 → 100 between the SWA origin and the PR preview, which differ only by the
Part 3 commits. The axe result was not just a local phenomenon.

### The config that was already there was dead three ways

`lighthouserc.js`, tracked since 2025-09:

1. `module.exports` in a `"type": "module"` package — **it could never load**, and the first
   `lhci` invocation died with `ReferenceError: module is not defined`.
2. **Every assertion was `"warn"`** — so even had it loaded, it would have exited 0 against
   any measurement whatsoever.
3. It set both `url` and `staticDistDir`, which conflict.

Same family as the Playwright `performance` project deleted in Part 1: scaffolding that
looks like a gate, reports success, and has never once run. `lighthouserc.json` replaces it
in JSON so there is no module system to get wrong, and
`__tests__/infra/lighthouse-config.test.ts` fails on each of those three shapes plus drift
between the `@lhci/cli` pin in the workflow and the one in `package.json` — the workflow
installs it via `npx` rather than `npm ci`, so the two can otherwise diverge silently.

### Verification

| Check | Result |
| --- | --- |
| `npm run type-check` | clean |
| `npm run test:coverage` | **306 passed** (37 files) |
| `npm run build` | clean |
| `npx eslint . --no-cache` | 0 errors |
| `lhci autorun` against the preview | **passes**, all assertions met |
| Gate proven able to fail | LCP threshold tightened to 100 ms → `✘ largest-contentful-paint failure`, exit 1 |
| Guards proven able to fail | version pin and error-level both mutated → 2 red |
| Both workflow YAMLs | parse; `deploy-pr-to-azure` has 5 steps, `quality-gate` has 2 jobs |

### What is deliberately not done

- **The Lighthouse step is `continue-on-error`** while it earns a track record, same staging
  as the `e2e` job.
- **The gate does not run against the apex.** Pointing it there would fail on day one for
  reasons outside this repo. When the Cloudflare item is resolved, move it.
- **No performance optimisation work.** The application already meets its published budget;
  the deficit is at the edge.

### Addendum — the new gate's first CI run measured nothing (2026-07-28)

The Lighthouse step went green on its first run and had not executed. From the log:

```
❌  .lighthouseci/ directory not writable
    ERROR: EACCES: permission denied, mkdir '/home/runner/work/BTAISite/BTAISite/.lighthouseci'
Healthcheck failed!
##[error]Process completed with exit code 1.
```

`Azure/static-web-apps-deploy` runs in a Docker container as **root** and leaves root-owned
files in the workspace; the next step runs as `runner` and cannot create a directory there.
`continue-on-error: true` — added deliberately so a budget breach would not fail a deploy —
turned that into a passing check.

Caught by reading the job log rather than trusting the green tick. **This is the same failure
this entire effort has been about, produced by the gate built to prevent it, within minutes
of adding it.** Worth stating plainly: knowing the pattern is not protection from it. Only
checking is.

Two fixes:

1. `sudo chown -R "$(id -u):$(id -g)" "$GITHUB_WORKSPACE"` before invoking lhci.
2. A step that distinguishes **"a budget was breached"** from **"the gate never ran"**. Both
   were previously indistinguishable green. It counts `.lighthouseci/lhr-*.json` and emits a
   PR annotation — `Lighthouse did not run … this is not a pass` — when there are none.

`__tests__/infra/lighthouse-config.test.ts` now fails if the chown is removed or if the
"did it actually measure" reporting disappears.

---

## Running cost of what was built (2026-07-28)

Recorded because nothing in this repo stated it, and one item is a real recurring charge
that nobody had quantified.

### The subscription is sponsored, which is why cost queries look empty

`Sponsored_2016-01-01` ("BTAI 2026 sponsorship"), spending limit **off**. Azure Cost
Management `ActualCost` returns **zero rows** for this subscription — not because usage is
free, but because sponsorship credit absorbs it. Verified as a query-blindness problem
rather than a genuine zero by widening the same query to subscription scope and still
getting nothing; the API itself responds correctly with a valid schema.

**Consequence**: `az consumption` / Cost Management cannot answer "what does this cost" here.
The sponsorship balance lives at `microsoftazuresponsorships.com`, not in ARM. Charges below
are computed from the **Azure retail prices API** (public, unauthenticated) against the
deployed configuration.

### The one meaningful recurring charge: availability monitoring

From PLAN-010, deployed 2026-07-27. `Standard Web Test Execution` in `eastus2` is
**$0.0005/execution** (retail API, 2026-07-28):

| Resource | Interval | Locations | Executions/mo | USD/mo |
| --- | --- | --- | --- | --- |
| `wt-btai-site-health` | 5 min | 3 | 26,282 | **13.14** |
| `wt-btai-site-contact` | 15 min | 2 | 5,840 | **2.92** |
| 2 metric alert rules | — | — | — | 0.20 |
| | | | **Total** | **≈ $16.26/mo (~$195/yr)** |

**The health test is 81% of that**, purely from its 5-minute interval across 3 locations.
Halving it to 10 minutes costs ~5 minutes of extra detection latency and saves ~$6.60/mo.
Dropping to 2 locations would save more but weakens the alert: `failedLocationCount: 2` over
3 locations tolerates one flaky probe, and over 2 locations it does not. **Not changed —
that is an availability/cost tradeoff for the owner, not a cleanup.**

Not included: App Insights / Log Analytics ingestion from those probes (90-day retention,
likely inside the 5 GB/month free grant at this volume, unverified), and the pre-existing
Static Web App Standard tier.

### PLAN-013 added no Azure cost at all

Every part of the front-end verification work runs in GitHub Actions. It created no Azure
resource; it *removed* 10 orphaned staging environments. The Lighthouse step makes 3 HTTPS
requests to a preview origin that already existed.

### GitHub Actions is free here, and the reason is load-bearing

**`BTAISite` is a public repository**, and GitHub Actions on standard runners is free for
public repos. Every job across all workflows is `ubuntu-latest`; there are no larger runners
and no self-hosted labels (three `TODO: switch to [self-hosted…]` comments exist and are not
active). Added by PLAN-013: the `e2e` job (~2 min/run) and the Lighthouse step (~1 min).
Artifacts are `playwright-report` (failure only) and `lighthouse-reports`, both 7-day
retention.

**If this repo is ever made private, that changes**: those ~3 extra minutes per push begin
consuming the account's Actions allowance, and artifact storage starts counting. Anyone
proposing to flip visibility should price the CI first.

---

## Transparency report — the Cloudflare CSP fix (2026-07-28)

**Outcome**: the Web Analytics beacon is allow-listed and the privacy policy now describes
what actually runs. The performance half of the Cloudflare gap is **not** fixed, cannot be
fixed from this repo, and the reason is now known precisely.

### The two costs had been conflated, and only one was a CSP problem

Earlier today this was recorded as "Cloudflare costs 18 performance and 26 best-practices
points" with the mechanism explicitly unproven. Lighthouse's own attribution settles it —
these are two unrelated causes:

| | Cost | Cause | Fixable here? |
| --- | --- | --- | --- |
| best-practices 100 → 74 | one console error | CSP refusing `static.cloudflareinsights.com/beacon.min.js` | **Yes** — done |
| performance ~15 pts | 793 ms script eval, one 396 ms long task | `/cdn-cgi/challenge-platform/scripts/jsd/main.js` — Cloudflare **Bot Management** JS detection | **No** |
| SEO 100 → 92 | invalid `robots.txt` | Cloudflare merging an AI-crawler policy | No (dashboard) |

The blocked beacon showed **`blockingTime 0 ms, transferSize 0 B`** in Lighthouse's
third-party summary. A refused script does not execute, so it never cost performance at all —
only the error. The earlier note that the TBT "correlates with the Cloudflare hop" was right
to stop short of naming a cause; the actual cause was a *different* Cloudflare feature
entirely, invisible until the per-script bootup-time breakdown was read.

**The bot-detection script is served from this site's own origin** (`bridgingtrust.ai/cdn-cgi/…`),
so `script-src 'self'` already permits it. No CSP edit can touch it. Disabling it means
turning off Bot Management / JS Detections in the Cloudflare dashboard — which is a security
tradeoff, not a cleanup, and is the owner's call.

### Allowing the beacon created a disclosure obligation, and exposed an existing false one

Permitting the beacon means analytics **actually starts collecting**. Checking the privacy
policy first found it wrong in both directions:

- It stated *"We use Google Analytics to understand how visitors use our site"* and listed
  Google Analytics under third-party services. **No code loads Google Analytics.**
  Over-disclosure — low risk, but a published legal document asserting something untrue.
- It said **nothing about Cloudflare**, which serves every apex request and injects the
  beacon. Under-disclosure, which is the half that matters, and it was already true before
  this change.

Both corrected. Cloudflare Web Analytics is cookieless and does not fingerprint, so this is
disclosure rather than a consent question; the cookie banner manages only the site's own
`btai_consent` cookie and needed no change.

`__tests__/privacy-disclosure.test.ts` now treats the CSP as the machine-readable answer to
"who may receive data from this page" and fails when the prose disagrees — in either
direction. A CSP *allowance* is permission, not usage, so the still-allow-listed Google
Analytics hosts are correctly not treated as evidence of use; the test keys on whether code
actually calls `gtag`/`dataLayer`.

### Verification

| Check | Result |
| --- | --- |
| `npm run type-check` | clean |
| `npm run test:coverage` | **313 passed** |
| `npm run build` | clean |
| `npx eslint . --no-cache` | 0 errors |
| `npx playwright test` (5 browsers) | **160 passed** |
| CSP emitted by a real production build | `script-src … https://static.cloudflareinsights.com`, `connect-src … https://cloudflareinsights.com`, no `unsafe-eval` |
| Guards proven able to fail | beacon removed from `script-src` → red; false GA claim reinstated → red |

**Not yet verified**: the best-practices recovery itself. The beacon only exists behind
Cloudflare, and PR previews are served from `*.azurestaticapps.net`, which is **not** behind
it — so this specific fix is unmeasurable until it reaches the apex. Re-measure after deploy;
the expectation is best-practices 74 → ~100 with performance roughly unchanged.

---

## Transparency report — the Cloudflare CSP fix, measured (2026-07-28)

The fix shipped in #89 and the apex was re-measured. **The prediction in that PR was wrong
in both directions**, which is worth more than the fix itself.

| | Before | Predicted | **Actual** |
| --- | --- | --- | --- |
| best-practices | 74 | ~100 | **81** |
| performance | 81 | "roughly unchanged" | **86** (within noise) |
| accessibility | 100 | — | 100 |
| SEO | 92 | — | 92 |

**What the fix did, exactly as intended**: the beacon now loads (`200`, 11,577 B) and reports
(`204 /cdn-cgi/rum`, which confirms the `connect-src` addition was necessary, not decorative).
**Console errors: none. Inspector issues: none.**

**Why 81 and not 100**: one *unrelated* audit was already failing and I had not checked what
else was red before predicting — `deprecations`, specifically
`StorageType.persistent is deprecated`. It is not in this repo's source or its built bundle.
Isolated the same way as before: the SWA origin, serving identical code without Cloudflare,
scores **best-practices 100 with zero deprecations**. So the last 19 points are Cloudflare
too — almost certainly the bot-detection script, though the literal API name does not appear
in either Cloudflare bundle and both are obfuscated, so that attribution is inference and is
labelled as such.

**On the performance number**: 81 → 86 median, but the ranges overlap (78–87 before, 80–91
after) and TBT ranges overlap too (173–341 before, 160–322 after). **This is run-to-run
variance, not an improvement.** Claiming the CSP fix made the site faster would be reading
noise as signal.

Net: **everything still costing the apex points is Cloudflare's bot-detection script** — the
~15 performance points *and* the last 19 best-practices points. Disabling JS Detections would
take the apex to roughly 97/100 on the same code. That is a security tradeoff and remains the
owner's call.

---

## Transparency report — Dependabot had never run (2026-07-28)

**Fourteen months of nothing.** `.github/dependabot.yml` failed schema validation from the
repository's first commit (2025-05-25) until today:

```
The property '#/updates/0/' contains additional properties
["security-updates-only"] outside of the schema when none are allowed
```

`security-updates-only` is not a Dependabot key. **0 Dependabot pull requests against 88
total** — verified as a real zero, not a query artefact, by running the same author filter
for a known-present author and getting 88.

### Why it survived so long

Three compounding reasons, each worth remembering separately:

1. **A config that fails to parse is ignored entirely, not partially.** The
   `github-actions` and `docker` entries were individually valid and never ran either.
2. **Validation is server-side and only runs on commits that CHANGE the file.** The red check
   appeared once, on the commit that introduced it, and every commit since looked clean. It
   was invisible unless someone went looking.
3. **Two adjacent mechanisms looked like coverage.** `.github/workflows/dependabot-security.yml`
   exists and is gated on `github.actor == 'dependabot[bot]'` — an actor that had never
   opened a PR. `security-scan.yml` runs Trivy, which scans for vulnerabilities but does not
   update anything. The repo looked like it had dependency security. It had none.

### And the alerts were off entirely

Separately from the config, `dependabot_security_updates` was `disabled` and the alerts API
returned `403 Dependabot alerts are disabled for this repository`. So there were no version
updates, no security updates, **and no vulnerability visibility at all**.

Alerts are now enabled. The result:

| Scope | Count |
| --- | --- |
| Total open alerts | **69** (3 critical, 36 high, 24 medium, 6 low) |
| **Production / runtime scope** | **2** — both `next-intl`, medium, open redirect |

**69 is the alarming number and 2 is the true one.** 67 of 69 are development-scope: vitest,
happy-dom, the SWA CLI, lhci — tooling that never reaches a visitor. `npm audit --omit=dev`
independently agrees: one moderate advisory in production.

And `next-intl` is the package CLAUDE.md records as **installed but never wired up**. So the
only production vulnerability is in a dependency the site does not use. Removing it resolves
both alerts and deletes dead weight; that is tracked rather than done here, because removing
a dependency is a change with its own blast radius and does not belong in a config fix.

### The guard

`__tests__/infra/dependabot-config.test.ts` parses the file and rejects any key outside
Dependabot's documented schema, plus keys GitHub has removed (`reviewers` — the other stale
key in this file; review assignment comes from `.github/CODEOWNERS`, which already has
`* @herculeanfit1`). Its last test reconstructs the exact broken config and asserts the check
fires, so the guard cannot pass vacuously.

`js-yaml` was added as an explicit devDependency for it. It was already resolvable
transitively, but a guard about dependency updates that depends on an undeclared transitive
package is a guard waiting to disappear in a dependency update.

### Verification

| Check | Result |
| --- | --- |
| `npm run type-check` | clean |
| `npm run test:coverage` | **318 passed** |
| `npm run build` | clean |
| `npx eslint . --no-cache` | 0 errors |
| Guard proven able to fail | rebuilds the broken config in-test and asserts it is caught |
| Config validity | **server-side; watch the `.github/dependabot.yml` check on the PR** |

### Still open, deliberately

- **Automatic security update PRs** remain disabled — turning them on with 69 alerts
  outstanding is a decision about review load, not a cleanup.
- **`ignore: version-update:semver-major`** is retained. The roadmap's trigger for taking
  majors on is met, but releasing fourteen months of majors is its own piece of work.
- **Removing `next-intl`**, which would clear both production alerts.

### Addendum — Dependabot's first run, and a gap in the fix (2026-07-28)

Within minutes of #90 merging, the `.github/dependabot.yml` check on the merge commit
reported **`success`** and Dependabot opened **6 pull requests — the first in the
repository's history**. The mechanism works.

One of them, **#96, would have broken the build**: `node 20.19-slim → 26.5-slim` across
`dockerfile`, `Dockerfile.static` and `Dockerfile.test`. `package.json` `engines` and
`.nvmrc` both pin `20.19.1`, and CLAUDE.md records that **23.x breaks the build** — so that
is four majors past known-broken.

**Dependabot did exactly what it was told.** #90's description said majors were "held back";
that was true of the **npm** entry only, and the same `ignore` had never been applied to
`docker` or `github-actions`. An accurate-sounding summary of a change that was narrower
than described — the same class of error as predicting best-practices would reach 100.

Fixed by ignoring `node` majors on the docker entry, with two guards: one asserting that
ignore exists, and one asserting `engines`, `.nvmrc` and each other stay consistent, so the
rule cannot end up pinned to a version the repo no longer uses.

The four `actions/*` major bumps are **deliberately not suppressed**. GitHub is deprecating
the Node 20 action runtime (the deploy logs already warn about it), so those are worth taking
— one at a time, with CI as the check.

Also corrected: a comment in the config claimed only the root `dockerfile` was matched.
The first real run proposed all three Dockerfiles together, so that was wrong.

### Addendum — what Dependabot's first run exposed (2026-07-28)

Turning Dependabot on did more than open 6 PRs. It **executed two mechanisms that had never
run**, and both were broken:

**1. `dependabot-security.yml` had never fired.** It is gated on
`github.actor == 'dependabot[bot]'` — an actor that could not exist while the config failed
to parse. Its first ever run failed, on every Dependabot PR. It was **not** a decoy: it was
working correctly and failing on a genuine finding — `npm run security:audit`
(`npm audit --production`) exited 1 because of the `next-intl` open redirect. The workflow
was right and nobody had ever heard it speak.

**2. `deploy-pr-to-azure` failed on every Dependabot PR**, in ~40s, with
`deployment_token was not provided`. The log line that explains it is `Secret source:
Dependabot` — Dependabot-triggered runs read a **separate secret store** that does not
contain `AZURE_STATIC_WEB_APPS_API_TOKEN_*`. The job could never have succeeded there. It now
skips `dependabot[bot]`, since nothing on a dependency bump is worth previewing anyway.

**`next-intl` removed.** It was the repository's only production-scope vulnerability, and
CLAUDE.md had already recorded it as *installed but never wired up*: zero imports across
`app/`, `src/` and `lib/`, no config reference. `npm audit --omit=dev` now reports
**0 vulnerabilities**, down from 1 moderate, and `npm run security:audit` exits 0 instead of
1 — which unblocks every Dependabot PR at once.

`messages/en.json` and `messages/es.json` are **kept deliberately**. They are orphaned now,
but ADR-0003 defers i18n rather than abandoning it, and deleting translation catalogues is
not the same kind of change as dropping an unused package. A dead `vi.mock("next-intl")` in
`NavBar.test.tsx` was removed with it — NavBar never imported next-intl, so that mock had
never once been resolved, and it described translation keys no component ever requested.

**The pattern worth naming**: three separate mechanisms in this repo were configured, looked
authoritative, and had never executed — the Playwright suite, `dependabot-security.yml`, and
Dependabot itself. In each case the first execution failed immediately. Configuration is not
evidence of operation, and neither is the absence of complaints.

---

## Transparency report — the preview-cleanup race (2026-07-29)

**Outcome**: `cleanup-pr` can no longer orphan a staging environment. It waits for every
in-flight run of its own workflow on the PR's branch, then closes.

### The bug was an ordering bug, so the fix is ordering

Reconstructed from PR #75's timestamps:

```
18:32:13  deploy (from the preceding push) starts
18:33:52  PR merged -> `closed` event fires
18:34:01  cleanup-pr starts
18:34:25  cleanup-pr reports SUCCESS
18:34:37  the deploy CREATES the staging environment   <-- 12s after its own cleanup
18:35:02  deploy finishes
```

The cleanup ran before the thing it was cleaning up existed, exited green, and orphaned it.
Ten accumulated, the Static Web App hit its staging-environment cap, and preview deploys
started failing on unrelated PRs — usually docs-only ones — with *"already has the maximum
number of staging environments."* **The symptom appeared nowhere near the cause**, which is
why it went unexplained long enough for ten to pile up.

Retrying would not have fixed it; there was nothing to retry *yet*. The job now blocks until
no run of this workflow on that branch is `in_progress` or `queued`, and only then closes.
Whatever a deploy created, cleanup removes afterwards.

**Nothing can start behind it**: `deploy-pr-to-azure` is gated on
`github.event.action != 'closed'`, and a closed PR cannot emit `synchronize`.

### The wait had to be able to prove it can see

A run-listing query that silently matches nothing returns "0 in flight" — indistinguishable
from a genuinely idle branch, and it would have restored the exact race while looking like a
guard. So the step first counts runs of **any** status for that branch and emits a
`::warning::` if that is also zero, and it **derives the workflow filename** from
`GITHUB_WORKFLOW_REF` rather than hard-coding it, because a rename would otherwise turn the
query into a permanent no-op that still reported success.

Both properties were verified against the live API before shipping: a real branch
(`docs/actions-majors-landed`) returns 1 run; a fabricated branch name returns 0. The filter
discriminates, so a zero means something.

`actions: read` was added to the job. Without it the API returns nothing and the wait becomes
a no-op — which is why one of the guard tests asserts the permission rather than only the
step.

### Verification

| Check | Result |
| --- | --- |
| `npm run type-check` | clean |
| `npm run test:coverage` | **330 passed** |
| `npm run build` | clean |
| `npx eslint . --no-cache` | 0 errors |
| Live API query | real branch → 1 run; fabricated branch → 0 |
| Guards proven able to fail | wait step removed → **4 red**; `actions: read` dropped → 1 red; timeout back to 5 → 1 red |

### What this does not do

It does not **verify** the environment is gone afterwards — that needs Azure credentials the
workflow does not have. If the wait ever times out (15 min) it closes anyway and logs
`::warning::`, naming itself as the cause of any orphan. Detection today is still the cap
being reached; the residual risk is much smaller but not zero.

### Correction — the race fix shipped with two bugs of its own (2026-07-29)

The transparency report above says the cleanup race is fixed. **The mechanism was right and
the implementation was broken**, and it broke on the very first merge that exercised it —
its own.

**Bug 1: the workflow filename derivation was backwards.**

```bash
wf="${GITHUB_WORKFLOW_REF##*/}"   # WRONG
wf="${wf%%@*}"
```

`GITHUB_WORKFLOW_REF` is `owner/repo/.github/workflows/FILE.yml@refs/pull/N/merge`. Taking
the basename *first* returns **`merge`** — from the tail of the ref, not the workflow file.
The API call then 404s. Correct order is strip the `@ref`, then take the basename.

**Bug 2: a 404 did not fail, it hung.** `gh api --jq` prints its **error body to stdout**
while also exiting non-zero, so `... 2>/dev/null || echo "0"` produced
`{"message":"Not Found",...}0`. That is not a number, so `[ "$n" -eq 0 ]` *errored* rather
than matching, the condition was never true, and the loop span its full 900-second budget
before falling through to the close.

Net effect on PR #101's own merge: cleanup took ~15 minutes instead of ~20 seconds, and only
cleaned up because the timeout path fails open. Not an orphan — but only by luck of the
fallback, not by design.

**Why the guard test did not catch it.** It asserted that `GITHUB_WORKFLOW_REF` was
*mentioned* in the step. It was. The derivation was still wrong.

> **Presence is not behaviour.** A test that greps for the name of the right approach passes
> against a broken use of it.

The test now **executes** the derivation — it extracts the `wf=` lines from the workflow and
runs them under `bash` against a realistic `GITHUB_WORKFLOW_REF`, asserting the result is
`cost-optimized-ci.yml`. Mutation-confirmed: restoring the shipped expansion order turns it
red.

The query helper now returns a bare integer or **empty**, and empty is treated as a loud
`::error::` and an immediate close, rather than being conflated with zero. A query that
cannot answer and a branch with nothing in flight are different states and must not look the
same — the same distinction the Lighthouse gate needed.

**And a third instance of the comment-matching trap.** The new test asserting the absence of
`|| echo 0` initially failed against the *comment* explaining why `|| echo 0` is wrong. Guards
in this repo have now been fooled by their own explanatory prose three times (`Http5xx` in
`alerting.test.ts`, the `staticSites/config` declaration in `swa-settings.test.ts`, and this).
Strip comments before asserting a pattern is absent.
### Addendum — the actions majors landed, and the docker pin proved itself (2026-07-28)

All five of Dependabot's first-run PRs are merged, one at a time with CI as the check:

| PR | Bump | Notes |
| --- | --- | --- |
| #91 | `hadolint-action` 3.1.0 → 3.3.0 | grouped minor; Standards Check green |
| #92 | `setup-python` 6 → 7 | single use in standards-check.yml |
| #93 | `upload-artifact` 4 → 7 | verified it still uploads — Lighthouse wrote 3 reports through v7 |
| #94 | `github-script` 7 → 9 | only API used is `github.rest.issues.createComment`, stable across both |
| #95 | `checkout` 4 → 7 | **also normalised a v4/v6 split** — all 9 uses are now v7 |

All four workflows green on `main` afterwards, deploy successful, production healthy.

**The docker pin proved itself the same day it shipped.** #96 (`node 20.19-slim → 26.5-slim`,
four majors past known-broken) is gone, and Dependabot re-proposed **#98:
`20.19-slim → 20.20-slim`** — a minor inside the pinned major. The `ignore` rule did exactly
what it was written to do rather than merely appearing to.

**Two stragglers remain on the deprecated Node 20 action runtime**, and Dependabot did *not*
propose them: `actions/setup-node@v4` in `dependabot-security.yml` and
`actions/download-artifact@v4` in `security-scan.yml`. Both sit in workflows that had never
executed until this week, which is likely why nobody noticed the versions drift. Four other
`setup-node` uses are already at v6.

**A detail worth knowing about the Dependabot deploy skip.** The guard is
`github.actor != 'dependabot[bot]'`, keyed on who *triggered the run* rather than who opened
the PR. That is deliberate and it is the correct discriminator: the failure is that
Dependabot-triggered runs read a secret store without the SWA token. When a human runs
`gh pr update-branch` on a Dependabot PR, the actor becomes that human, secrets resolve
normally, and the deploy runs and passes — which is exactly what happened on all five of
these merges. Keying on `pull_request.user.login` instead would have skipped a deploy that
works.
### Verified live — the cleanup race fix works, on both paths (2026-07-29)

The corrected `cleanup-pr` ran on its own merge (#102). Actual log output:

```
workflow: cost-optimized-ci.yml   branch: fix/cleanup-wait-workflow-ref
runs visible for this branch (any status): 2
No in-flight runs after 0s; safe to close.
```

Three things confirmed at once: the filename now derives correctly (`cost-optimized-ci.yml`,
not `merge`), the see-check returns **2** so the zero that follows is meaningful rather than
the artefact of a broken filter, and the wait exits immediately when nothing is in flight.
**Wait-step duration: 2 seconds**, against 15+ minutes for the broken version.

Both paths are now proven:

| Path | Evidence |
| --- | --- |
| Fast path (nothing in flight) | #102 — wait exited at 0s, close succeeded, environment `102` never lingered |
| Fail-open path (query broken) | #101 — hit the 900s bound, warned, closed anyway; environment `101` **was** removed |

Staging environments afterwards: `default` and `100` only — and `100` belongs to a PR that
was still open. Nothing orphaned.

The fail-open evidence matters as much as the fast path: it is the behaviour that kept a
broken implementation from actually leaking an environment, and it is why the bug cost 15
minutes rather than a recurrence of the original outage.

---

## `Quality Gate / e2e` promoted to a required check (2026-07-29)

Shipped advisory on 2026-07-28 with an explicit promotion condition — *"once it has been
green across several PRs"* — and that condition is now met.

**Evidence, checked at the job level rather than the workflow level**: the `e2e` **job** was
`success` on **12 of the last 12** runs, spanning five Dependabot dependency bumps
(`checkout`, `github-script`, `upload-artifact`, `setup-python`, `hadolint`) and four
hand-written PRs.

That distinction is the point. `gh run list --workflow=quality-gate.yml` showed 20
consecutive successes, but a workflow can report success with this job **skipped** — the
same evidence, worth nothing. Enumerating the job's own conclusion per run is what makes 12
of 12 mean something.

`main` now has **seven** required contexts:

| Context | Since |
| --- | --- |
| `Standards Compliance` | pre-existing |
| `Gate on HIGH / CRITICAL` | pre-existing |
| `Trivy filesystem scan` · `Trivy IaC config scan` · `Trivy secrets scan` | pre-existing |
| `Quality Gate / frontend` | PLAN-002 |
| **`Quality Gate / e2e`** | **2026-07-29** |

Applied with the additive contexts endpoint rather than a full `PUT` of the protection
object, because a `PUT` replaces the entire configuration and silently drops anything omitted
from the payload. Before/after were captured and diffed: the only difference is the new
context; `enforce_admins` and the require-up-to-date flag are unchanged and still on.

### The trap this creates

**The requirement lives in branch protection, not in the workflow file.** Renaming the job
without renaming the protection context blocks every PR forever, waiting on a check that can
no longer report — and the workflow will look perfectly healthy while it happens. A comment
in `quality-gate.yml` says so at the point of danger.

### Still deliberately not required

- **`deploy-pr-to-azure`** — it cannot run on Dependabot PRs at all (separate secret store),
  so requiring it would block every dependency bump.
- **The Lighthouse step** — advisory while it earns the same track record this job just did.

---

## Toolchain version alignment (2026-07-29)

**Outcome**: one Node version (`20.20.2`) across all seven declaration sites, every shared
action on a single version, and a guard that fails on drift in either.

### The Node version had silently split, and nothing could have told you

Dependabot bumps Dockerfiles. It **cannot** touch `.nvmrc`. So after #98:

| Site | Was |
| --- | --- |
| `.nvmrc`, `package.json` `engines` | **20.19.1** |
| `dockerfile` | 20.20.2-alpine |
| `Dockerfile.static`, `Dockerfile.test` | 20.20-slim |
| `cost-optimized-ci.yml` `NODE_VERSION` ×2 | 20.19.1 |
| `dependabot-security.yml` `node-version` | 20.19.1 |

Two separate problems. The obvious one: test containers ran a different Node than CI. The
quieter one: the Dockerfiles did not agree with each other on **precision** —
`20.20.2-alpine` pinned a patch while `20.20-slim` floated to whatever the latest 20.20.x
happened to be that day, so the build was not reproducible and a Dockerfile could diverge
from `.nvmrc` with no file changing at all.

**Nothing failed**, because `.npmrc` sets `engine-strict=false` — the mismatch only
downgraded `npm ci` to a warning nobody reads. That is the whole problem: a repo whose test
containers quietly ran a different Node than its CI, with no signal.

All seven now say `20.20.0` — see the correction below; `20.20.2` was tried first and Azure's
Oryx builder rejected it. `dependabot-security.yml`'s literal was replaced with `node-version-file: .nvmrc`
rather than updated, removing one declaration site entirely.

**Validated on the version being shipped, not the one already installed**: `nvm install
20.20.0`, then `npm ci` (clean, no engine warning), type-check, 339 unit tests, lint, build,
and **160 Playwright tests across 5 browsers** — all green on 20.20.0.

### The stragglers

`actions/setup-node@v4` → **v6** (matching the four others) and `actions/download-artifact@v4`
→ **v7** (matching `upload-artifact@v7`). Both sat in workflows that had never executed until
this week, which is why the drift was invisible.

The download bump needed care rather than confidence: it feeds **`Gate on HIGH / CRITICAL`**,
a *required* check. v3 and v4+ use different artifact backends and do not interoperate; v4
through v7 all share the post-v4 backend, so v7-upload/v4-download was working — but the
split was one Dependabot bump away from becoming a v3/v4 problem on a required gate.

### The guard

`__tests__/infra/toolchain-versions.test.ts` **discovers** declarations rather than listing
them, so a new hardcoded version anywhere is caught instead of silently becoming an eighth
source of truth. It fails when the seven disagree, when any of them floats instead of pinning
an exact patch, when a shared action is pinned at two different versions across workflows, or
when upload/download-artifact fall onto different generations.

Mutation-confirmed on all three failure shapes: reverting `.nvmrc` to 20.19.1 → red; floating
a Dockerfile tag back to `20.20-slim` → 2 red; splitting the artifact generation → red.

CLAUDE.md **no longer restates the number**. It says read `.nvmrc` — because the line that
said `20.19.1` was itself one of the stale copies.

### Correction — the Node version is not a free choice (2026-07-29)

The alignment above first landed on **20.20.2**: the latest Node 20 LTS, a real release,
with all three Docker tags verified to exist. Every local check passed — `npm ci`,
type-check, 338 unit tests, lint, build, and 160 Playwright tests across five browsers.

Then the preview deploy failed in 33 seconds:

```
Error: Platform 'nodejs' version '20.20.2' is unsupported.
Oryx has found build steps, but identified unsupported platform versions. Failing build.
```

**Azure's Oryx builder ships a fixed allow-list**, and 20.20.2 is not on it. The newest Node
20.x Oryx carries is **20.20.0**. Everything moved to that; all checks re-run and green.

Two things worth keeping from this:

**The premise "align all seven to the newest version" was wrong.** Six of those sites are
this repo's choice; the seventh — `NODE_VERSION` for the SWA build — is constrained by a
platform allow-list nobody here controls. "Latest LTS" and "valid Docker tag" and "installs
under nvm" were all true and none of them implied deployable. **Verifying a version exists is
not verifying a version is accepted.**

**No amount of local validation would have caught it.** The failure lives only in Oryx, which
runs nowhere but the deploy. It surfaced on a preview rather than production purely because
previews run first — which is an argument for previews existing, not for the check having
been adequate.

The guard now asserts `NODE_VERSION` is in Oryx's supported set, with the list snapshotted
from the failing build and labelled as a snapshot rather than an authority: when Oryx adds
versions the list goes stale in the *safe* direction, rejecting something that would now work.
Widen it from a real build log, never by guessing. Mutation-confirmed — setting `NODE_VERSION`
back to 20.20.2 turns it red.

---

## Node 20 is end-of-life, and has been for 90 days (2026-07-29)

From `nodejs/Release/schedule.json`, checked rather than remembered:

| Major | EOL | Status on 2026-07-29 |
| --- | --- | --- |
| 18 | 2025-04-30 | EOL |
| **20** | **2026-04-30** | **EOL — 90 days ago** |
| 22 | 2027-04-30 | maintenance (275 days left) |
| **24** | **2028-04-30** | **Active LTS (641 days)** |
| 26 | 2029-04-30 | becomes LTS 2026-10-28 |

This repo pins **20.20.0** everywhere. That runtime receives **no security patches**, which
makes it a standing security item rather than housekeeping — and it outranks the Cloudflare
performance work on that basis, even though Cloudflare is the more visible number.

**Target: Node 24.** Not 22 (already in maintenance, EOL in 9 months — a migration that buys
9 months is barely worth doing twice). Not 26 (not LTS until 2026-10-28). Dependabot proposed
`node:26.5-slim` and the docker pin correctly blocked it.

### What a migration has to touch, and the trap in it

All **seven** declaration sites, which `__tests__/infra/toolchain-versions.test.ts` already
enumerates and cross-checks — so the mechanical part is bounded and the guard will fail loudly
if one is missed.

**The trap is the same one that caught the 20.20.2 attempt**: `NODE_VERSION` for the SWA build
must be a version **Oryx carries**, and Oryx's Node 24 support is currently a single version —
**`24.13.0`**. There is no choice of patch. Confirm from a real build log at migration time,
because that list moves; the guard's snapshot goes stale in the safe direction (rejecting a
version that would now work) rather than the dangerous one.

### What needs checking beyond the version bump

- **Next.js 15.5** on Node 24 — supported, but verify against a real build rather than docs.
- **`happy-dom`** (the vitest environment) and `@vitest/coverage-v8` — both are native-adjacent
  and the most likely to complain about a V8 major change.
- **`node:` builtin API changes** in 21→24, particularly anything `server.js` touches.
- **The three Dockerfiles** — `node:24.13.0-slim` and `-alpine` tags must be confirmed to
  exist before use, the way `20.20.0`'s were.
- **CI runners** — `node-version-file: .nvmrc` picks it up automatically; nothing to change.

Estimated shape: a single PR, mechanical, with the risk concentrated entirely in the test
toolchain rather than the application. The E2E suite and 339 unit tests are the evidence that
it worked, and both now exist — which is exactly the "real test gate" that the deferred
dependency-majors item was waiting on.

---

## The Cloudflare edge costs 42 Lighthouse points, and none of it is fixable from this repo (2026-07-29)

Measured with `scripts/measure-cloudflare-cost.sh`, which compares the apex against the SWA
origin serving the **identical build** — so every difference is the edge, not the application:

| Category | apex (Cloudflare) | origin (bare SWA) | Edge cost |
| --- | --- | --- | --- |
| performance | 81 | 96 | **−15** |
| accessibility | 100 | 100 | 0 |
| best-practices | 81 | 100 | **−19** |
| SEO | 92 | 100 | **−8** |
| TBT | 298 ms | 0 ms | **+298 ms** |

Accessibility being identical is what proves the code is the same and the rest is the edge.

### Three distinct causes, three separate decisions

**1. Bot Management / JS Detections — costs 15 performance points and 19 best-practices.**
It injects `/cdn-cgi/challenge-platform/scripts/jsd/main.js` (793 ms of script evaluation, one
396 ms long task) *and* is the source of the `StorageType.persistent` deprecation that keeps
best-practices at 81. Served from **this site's own origin**, so `script-src 'self'` already
permits it and **no CSP change can touch it**. Cloudflare dashboard → Security → Bots →
JavaScript Detections.

**2. AI Crawl Control / Content Signals — costs 8 SEO points.** Cloudflare prepends a
`Content-Signal: search=yes,ai-train=no,use=reference` directive to `robots.txt`, which
Lighthouse rejects: *line 30 — Unknown directive*. Verified as the single reported error.
It also adds `Disallow: /` blocks for `GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot`,
`Bytespider`, `Amazonbot`, `Applebot-Extended` and `meta-externalagent`.

**This one is a product decision, not a cleanup.** Those rules are what stop AI crawlers
training on this site's content. Turning them off to gain 8 Lighthouse SEO points would trade
content protection for a score — and the site's own `Allow: /` and `Sitemap:` survive inside
the merged file either way, so real crawlers are not being harmed today. Recommend **keeping
it** and accepting SEO 92.

**3. Web Analytics — already resolved.** The beacon is allow-listed as of #89 and now loads
(`200`) and reports (`204 /cdn-cgi/rum`). No longer a cost.

### Why this is not being done here

There are **no Cloudflare credentials in this repo or environment** — no `CLOUDFLARE_API_TOKEN`,
no Cloudflare secrets, no `wrangler`. All three are dashboard settings belonging to the account
owner. What this repo can contribute is the measurement, which it now does.

### Verifying a change afterwards

Run `scripts/measure-cloudflare-cost.sh` before and after. **The apex is not deterministic** —
the bot-detection long task varies, and a single run has swung between 64 and 86 performance on
unchanged code. The script reports min/max alongside the median for exactly that reason: if a
before/after difference falls inside those ranges, it is noise. Use `RUNS=3` or more.

---

## The newly-required e2e gate flaked immediately, and the promotion evidence was hollow (2026-07-29)

`Quality Gate / e2e` was promoted to required on the strength of **12 of 12 green runs**. It
failed on run 13 — a PR whose only changes were documentation and a shell script, so the site
code was byte-identical to `main`.

**The 12 green runs were not evidence.** They were passing with a wait that did nothing, so
they were twelve lucky samples rather than twelve demonstrations of determinism. Counting green
runs measures nothing if the mechanism under test is inert — which is the same mistake as
counting workflow successes when the job is skipped, made one level deeper.

### What was actually wrong

`settleAndFreeze()` waited for every element with an inline `opacity` to reach 0 or 1. Probing
a real production build showed why that can never succeed:

```
{"atMs":2500,"inlineOpacityEls":14,"animations":8,"running":7,
 "prop":"backgroundPositionX,backgroundPositionY","cls":"absolute inset-0 hero-aurora"}
```

At 2.5 s there were still **7 running animations** — an infinite `hero-aurora` background pan
and `mix-blend-screen` floating blobs — and **14 elements held a permanently fractional inline
opacity**. The loop therefore always ran to its timeout and proceeded anyway. axe then sampled
whatever frame it landed on, and the hero CTA's contrast came out as a different blend each
time: 1.08, 1.17, 1.27, 1.53.

Two earlier attempts at this function both failed the same way, for reasons that each looked
sufficient in isolation:

1. `emulateMedia({ reducedMotion })` — Framer Motion keeps opacity fades by design.
2. A `transition: none` stylesheet — cannot stop script-driven animation.
3. Waiting for inline opacity to settle — **some never settle**.

### The fix: freeze, do not wait

`document.getAnimations()` covers CSS animations, CSS transitions **and** the Web Animations
API that Framer Motion uses — all three at once, which no CSS-only or inline-style-only
approach can. Each animation's `currentTime` is pinned to 0 before pausing, so the frozen frame
is identical on every run; pausing alone would freeze at an arbitrary point and stay flaky.

**Verified 9 consecutive clean runs** on the exact configuration that failed (CI path,
production build, chromium): 6× the a11y spec alone, 2× the full 32-test CI suite, plus
160/160 across all five browsers on the dev path.

### On the promotion

Kept required rather than reverted, because the root cause is now understood and fixed rather
than retried until green — and because the alternative would restore the same hollow evidence
this entry is about. The written rule ("a flaky new gate gets switched off") was aimed at
nursing a gate that cannot be made deterministic; this one could.

The lesson to carry: **before counting green runs as evidence, confirm the thing you are
counting actually exercises the mechanism.** A gate whose wait is a no-op passes exactly as
often as one that works, until it doesn't.

### Correction — the Node target is 22, not 24 (2026-07-29)

The entry above originally recommended **Node 24**, reasoning from Oryx carrying `24.13.0`.
**That was wrong**, and wrong in a familiar way: it checked the *build* platform's support and
never checked the *runtime* ceiling.

Azure Static Web Apps' `apiRuntime` supports `node:18`, `node:20` and `node:22`. **There is no
`node:24`.** [Azure/static-web-apps#1724](https://github.com/Azure/static-web-apps/issues/1724),
asking for a Node 24 timeline, was opened 2026-02-05 and is still open with no Microsoft
response.

So the platform ceiling is Node 22, EOL 2027-04-30 — the migration buys about 9 months rather
than 2½ years. Unsatisfying, and it is the ceiling that exists.

**The pattern to notice**: "Oryx supports 24.13.0" was a true fact that supported a false
conclusion, because it answered a different question than the one that mattered. The same shape
as "20.20.2 is the latest LTS" (true, and Oryx rejects it) and "the e2e job was green 12 times"
(true, and the wait was a no-op). **Check that the fact you verified is the fact the decision
turns on.**

`PLAN-014` also found an **eighth** Node declaration site that yesterday's
`toolchain-versions.test.ts` does not cover: `staticwebapp.config.json` `platform.apiRuntime`.
The guard scans `.nvmrc`, `package.json`, the Dockerfiles and the workflows, and never looks at
that file. Closing the gap is part of PLAN-014 rather than a follow-up.

---

## Transparency report — PLAN-014, off end-of-life Node 20 (2026-07-29)

**Outcome**: Node **22.22.0** across every declaration site, **build and runtime**. Node 20 had
been EOL for 90 days. `platform.apiRuntime` is gone, because it was proven to do nothing.

### Step 1's answer was a third possibility the plan did not enumerate

The plan predicted two outcomes: `apiRuntime` is live → full migration, or inert →
build-and-tooling only. Three single-variable preview deploys gave a better answer than either:

| # | `apiRuntime` | `NODE_VERSION` (build) | → runtime |
| --- | --- | --- | --- |
| 1 | `node:22` | `20.20.0` | **20** |
| 2 | `node:22` | `22.22.0` | **22** |
| 3 | `node:20` | `22.22.0` | **22** |

Observation 1 ruled out `apiRuntime` acting alone. Observation 2 showed the runtime moving with
the build — but with both at 22 it could not distinguish *inert* from *must agree*. **Observation
3 settled it**: runtime 22 while `apiRuntime` said `node:20`.

So `apiRuntime` is **completely inert** for hybrid Next.js — a **fourth** silently-ignored
`staticwebapp.config.json` key beside `globalHeaders`, `routes[].headers` and
`responseOverrides` — and the runtime is driven **solely** by `NODE_VERSION`, the Oryx build
version. **The migration therefore moves the runtime after all**, via a knob the plan had not
identified.

Stopping at observation 2 would have produced a true-sounding claim ("setting both moves the
runtime") that left the actual mechanism unknown. The third cycle cost five minutes and is the
difference between a fact and a correlation.

### `apiRuntime` was removed, not updated

It was the only key in the `platform` block, so the block is gone. Setting it to `node:22` would
have been *worse* than leaving it at `node:20`: both are inert, and a value that agrees with
reality reads as the thing causing it. Same reasoning that removed the ignored header keys rather
than leaving them as a decoy. The three observations are recorded in the file's own `_comment`,
where the next person to consider re-adding it will look.

**The "eighth declaration site" is now deleted rather than guarded** — a better outcome than the
plan's Step 3, which was going to teach the guard to check it. The guard instead asserts it stays
**absent**.

### The local half was proven before the plan was written

`npm ci`, keytar's ABI-127 rebuild, type-check, unit tests, lint, build, and both E2E paths were
all exercised on 22.22.0 during research. Re-run against the branch: **340 unit tests**, **32 E2E
on the production-build CI path**, **160 E2E across five browsers**, type-check / lint / build
clean.

### Two guards fired during the migration, exactly as intended

1. `toolchain-versions.test.ts` failed on the Oryx allow-list — it contained only Node 20
   versions. Widened with Oryx's Node 22 list, *including a comment that Oryx's newest 22 is
   `22.22.0` while the newest Node 22 release is `22.23.2`*, which Oryx does not carry. Node 24
   is deliberately excluded: Oryx has `24.13.0` but SWA has no `node:24` runtime.
2. `dependabot-config.test.ts` failed on `engines.startsWith("20.")` — a guard **I wrote
   yesterday** that hardcoded the major and therefore failed on a completely correct change.
   Rewritten to assert the invariant that matters (`.nvmrc` equals `engines`, and both pin an
   exact patch) and to stop duplicating "which Node line is supported", which is asserted once in
   `toolchain-versions.test.ts`. **Two tests asserting the same invariant means one of them is
   the stale copy.**

### `@azure/static-web-apps-cli` removed

Referenced by no npm script, workflow, CI script, or source file, and the sole reason `keytar` —
a deprecated node-gyp addon and the only ABI-coupled dependency here — was in the tree.
**143 packages removed.** It would have been the most likely thing to break on the *next* Node
bump, for reasons having nothing to do with this codebase.

### What this does and does not buy

Node 22 is EOL **2027-04-30**: roughly 9 months. That is the ceiling Azure Static Web Apps
imposes, not a choice — there is no `node:24` runtime, and
[Azure/static-web-apps#1724](https://github.com/Azure/static-web-apps/issues/1724) has been open
since 2026-02-05 with no Microsoft response. Watch that issue; when `node:24` ships, the seven
remaining sites and the Oryx allow-list are the whole change.

---

## Documentation reconciliation (2026-07-30)

Swept `CLAUDE.md` against reality after PLAN-013, PLAN-014 and the CI work. **Four claims had
gone stale**, all of them written during this effort — which is the point worth noting: docs
rot fastest while the thing they describe is actively changing, and the author is the last
person to notice.

| Claim | Was | Now |
| --- | --- | --- |
| `Quality Gate / e2e` | "**advisory**, not a required check" | Required since 2026-07-29 (7 required contexts) |
| `settleAndFreeze()` | "waits for every inline opacity to reach 0 or 1" | Freezes via `getAnimations()` — the wait-based version was replaced *because it never settled* |
| Preview-deploy leak | described as a live bug | Fixed 2026-07-29; kept as a diagnostic with the `actions: read` and `gh api` 404 traps recorded |
| Dependabot | not mentioned at all | Full section: 14 months of silence, why it was invisible, per-ecosystem `ignore`, alert scoping |

The `settleAndFreeze` entry is the sharpest: the docs described the *mechanism that was
removed for not working*, which would have sent the next reader to reproduce a known dead end.

Verified rather than assumed: `npx playwright test --list` reports **160 tests in 3 files**, and
the branch-protection API reports **7 required contexts including `Quality Gate / e2e`**.

Also confirmed no stale references to the removed `@azure/static-web-apps-cli` outside
`docs/archive/` (dated historical records, correctly left alone) and no npm script still invokes
it.

### Next up: Cloudflare Bot Management

The two Cloudflare rows were split, because they are **two different decisions** wearing one
label:

- **Bot Management / JS Detections — 34 points** (15 performance + 19 best-practices). A
  security-vs-speed trade. This is the actionable one.
- **AI-crawler policy — 8 SEO points.** Recommend **keeping**. Those rules stop GPTBot,
  ClaudeBot, Google-Extended and five others training on this content; trading that for 8
  Lighthouse points is a poor deal, and the site's own `Allow: /` and `Sitemap:` survive inside
  the merged file regardless.
