# Roadmap — BTAI-Site

**Date**: 2026-07-03. Derived from `docs/strategy/STRATEGIC_REVIEW.md`.
Each Now/Next item has an execution plan in `docs/strategy/plans/`. Plans are written to
be executed by a fresh session with zero context — read the plan, not this file, when
implementing.

**Recommended execution order**: 001 → 002 → 003 → 004 → 005 → 006, then
007 → 012 → 011 → 009 → 010 → 008. One plan per session/PR.

---

## Now (0–30 days) — highest leverage, lowest risk

| # | Plan | What | Effort | Why now |
|---|---|---|---|---|
| 1 | PLAN-001 | Escape user input in Resend email templates | S | Active injection vulnerability on a public form |
| 2 | PLAN-002 | Cloud quality gate: build + type-check + unit tests as required PR checks | S | Converts existing branch protection into a real gate; protects every later plan |
| 3 | PLAN-003 | Repo hygiene purge: committed logs, SBOMs, `.bak`, scratch files, dead dev servers | S | Pure deletions; public-repo credibility; makes PLAN-004 reviewable |
| 4 | PLAN-004 | Dead code & dead dependency removal: `src/` mirrors, three.js, Jest/Babel stack, root `resend`, fix tsconfig aliases | M | Biggest compounding win; removes the edit-the-dead-copy trap |
| 5 | PLAN-005 | Test-suite honesty: delete placeholders/skips/broken imports, delete `fix-component-tests.js`, align coverage config with reality, fix pre-commit hook | M | Ends false confidence; makes the PLAN-002 gate meaningful |
| 6 | PLAN-006 | Newsletter persistence via existing HubSpot module | S–M | Endpoint currently lies to users and discards leads |

Sequencing: 001 is independent — do it first (vuln). 002 before 004/005 so deletions
happen under a working gate. 003 before 004 keeps the big deletion PR reviewable.
005 after 004 because coverage config references `src/components/**`, which 004 deletes.

## Next (30–90 days) — structural moves

| # | Plan | What | Effort | Depends on |
|---|---|---|---|---|
| 7 | PLAN-007 | API test harness: Vitest in `api/`, handler tests for contact/newsletter, wired into the CI gate | M | 001 (seeds harness), 002 (gate exists) |
| 8 | PLAN-012 | Docs truth reconciliation: fix CLAUDE.md false claims, ADR backfill (hybrid architecture, i18n deferral, gating model), archive stale `docs/` files | M | 004/005 landed (docs describe end state) |
| 9 | PLAN-011 | IaC completeness: declare queue + role + `queueServiceUri` in Bicep; author missing `wire-functions-settings.sh`; fix `rollback.sh` | S–M | none |
| 10 | PLAN-009 | Abuse hardening: XFF parsing, bounded rate-limit stores, body-size caps, CORS tightening, cspReport limits | M | 007 (tests to lock behavior) |
| 11 | PLAN-010 | Observability & alerting: action group, Functions failure alerts, availability test on `/api/health`, consistent `context.log`, host.json logging config | M | 011 (touches same Bicep) |
| 12 | PLAN-008 | Route & locale unification: one homepage content tree, canonical privacy/terms, drop phantom `fr` locale | M | 004 (dead code gone first) |

## Later (90+ days) — strategic bets, each with a trigger

- **Major-version upgrade campaign** (Next 16, ESLint 10, Vitest 4, happy-dom 20,
  Playwright 1.61, @types/node). *Trigger*: PLAN-002 + PLAN-005 + PLAN-007 landed (a real
  test gate exists to catch regressions) **and** the fleet-wide upgrade sequencing has
  chosen this repo's slot. Do Vitest 4 first (test-only blast radius), Next 16 last.
  Dependabot's ignore-all-majors rule (`.github/dependabot.yml:26-28`) stays until then.
- **Real i18n with next-intl**. *Trigger*: an actual business decision to market in
  Spanish. The `es.json` translation and `[locale]` scaffold are preserved by PLAN-008;
  wiring next-intl is ~2–3 days once wanted. Until then, do not wire it.
- **Durable rate limiting** (Azure Table/Redis-backed, replacing in-memory Maps).
  *Trigger*: observed abuse in App Insights, sustained multi-instance scale-out, or
  Resend cost anomalies. PLAN-009's hardening is sufficient below that threshold.
- **Queue-first contact pipeline** (decouple HubSpot/classification from the request
  path; today a HubSpot failure silently skips classification —
  `api/src/functions/contact.ts:181-204`). *Trigger*: lead volume where a lost
  classification matters, or a second consumer of the queue.
- **Repo visibility decision** (public ↔ private). *Trigger*: operator decision — see
  escalations in the review. If it stays public: SARIF upload posture is already correct,
  but Phase R2 must be permanently cancelled for this repo.

---

## Anti-goals — what NOT to do, and why

1. **Do NOT execute "Phase R2" (self-hosted runner) on this repo while it is public.**
   The TODOs at `security-scan.yml:43,140,232,325` predate the repo being public.
   `STANDARDS.md` §8 requires deregistering self-hosted runners *before* going public;
   the same logic forbids adding one after. PLAN-012 removes the TODOs.
2. **Do NOT wire next-intl or add French now.** i18n is decorative today; wiring it is
   real work with zero current business demand. Keep `es.json`; delete the `fr` promise.
3. **Do NOT start the Next 16 / ESLint 10 / Vitest 4 majors during the Now phase.**
   Upgrading on top of dead code and theater tests maximizes risk for zero user value.
   The freeze is currently a feature.
4. **Do NOT rewrite git history to purge committed logs/SBOMs.** Nothing tracked is a
   secret (verified: `.env` untracked). History rewrite on a public repo with branch
   protection is high-ceremony, low-value. Delete at HEAD (PLAN-003) and move on.
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
