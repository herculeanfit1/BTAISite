# PLAN-012: Docs truth reconciliation (CLAUDE.md, README, ADR backfill, docs pruning)
**Status**: Blocked (by PLAN-004, PLAN-005, PLAN-006)
**Effort**: M · **Risk**: Low

## Context
This repo's documentation disagrees with its code and with itself, and because the repo
is worked on primarily by AI agents that read CLAUDE.md as ground truth, every false
claim gets re-injected into every future session. Current falsehoods include: CLAUDE.md
says Next.js 15.4.x (package.json: 15.5.18) and that `app/middleware.ts` provides CSP
nonce generation (Next.js never loads middleware from `app/`; the file is dead);
README.md says 15.4.6; the sole ADR (`docs/adr/0001-project-architecture.md`) describes
a static-export architecture on Next 15.3.2 that was abandoned; CLAUDE.md documents a
contact-pipeline order (Zod → honeypot → rate limit) that differs from the code
(honeypot → Zod → rate limit), claims locales "en, es, fr" (no fr exists), claims a
"coverage ratchet (30% floors)" that never enforced anything, and lists newsletter as a
live function while it was a no-op until PLAN-006. `docs/` contains ~70 loose files of
mixed vintage, many describing the abandoned static-export era.

Blocked by PLAN-004/005/006 because this plan documents the post-cleanup end state —
writing it earlier means documenting things twice.

## Goal / Non-goals
**Goal**: CLAUDE.md, README.md, and the ADR set are accurate; stale docs are archived
(not deleted); the four "Phase R2 self-hosted runner" TODOs have a written cancellation
decision.
**Non-goals**: Rewriting docs style; documenting future plans as if done; editing the
canonical workflow files (`security-scan.yml`, `standards-check.yml` — the Phase R2
TODOs live in canonical `security-scan.yml` and are cancelled via ADR + an upstream task
against HerculeanOlympus, NOT by editing the file here).

## Current state
See Context. Exact claims to fix, with locations (line numbers as of 2026-07-03; re-grep
before editing):
- `CLAUDE.md` "Project Overview": "Next.js 15.4.x" → verify against `package.json` at
  execution time and write the ACTUAL value; better, write "Next.js 15.x (see
  package.json)" so it can't rot again.
- `CLAUDE.md` App Router Structure: "`app/middleware.ts` — Security headers and CSP
  nonce generation" → replace with: root `middleware.ts` is a minimal stub; security
  headers/CSP are authoritatively set in `staticwebapp.config.json` (note: its
  `'nonce-{nonce}'` token is a literal, i.e. no real nonce mechanism exists — flag as
  known limitation, do not silently delete the mention).
- `CLAUDE.md` Contact Form pipeline + Service Layer diagram: order is honeypot → Zod →
  rate limit/circuit breaker (inside `sendContactEmail`); queue enqueue is CONDITIONAL
  on HubSpot success (`api/src/functions/contact.ts:181-204`) — the diagram currently
  implies independence.
- `CLAUDE.md` "i18n via next-intl with locale routing (en, es, fr)" → "(en, es)" after
  PLAN-008; if PLAN-008 hasn't landed, "(en, es; fr declared but unimplemented)". Also
  state plainly: next-intl is installed but not yet wired; all locales currently render
  English (huge trap for agents told to 'fix a translation').
- `CLAUDE.md` "Coverage ratchet: CI floors (30%)..." → replace with the PLAN-005
  vitest-threshold reality (state the actual numbers).
- `CLAUDE.md` Source Organization: remove the `src/components` legacy-copy warning
  (PLAN-004 deleted the tree — replace with a one-line "historical note: a dead `src/`
  mirror was removed 2026-07; if you see `@/components` imports in old branches, that's
  why"). Update Path Aliases section (only `@/*` remains). Update `src/uitests` →
  `uitests/` references, `src/lib` → `lib/`.
- `CLAUDE.md` scripts: `wire-functions-settings.sh` exists again after PLAN-011 —
  verify and describe its final (possibly seed-KV-only) contract.
- `README.md`: "Next.js 15.4.6" (two places), stale "Recent Updates" narrative, "No
  Static Export" section — rewrite the top third to describe the current architecture
  (SWA + linked Functions, contact→Resend/HubSpot/queue pipeline) in ~30 lines; delete
  the changelog-style sections (git history serves that purpose).
- ADRs: only `docs/adr/0001-project-architecture.md` (static export, Jest, 15.3.2).
- `docs/`: ~70 loose files; `docs/archive/` already exists.

## Target state
Accurate CLAUDE.md/README; ADRs 0002–0005 recorded; `docs/` root contains only living
documents; a written, discoverable decision cancelling Phase R2 for this repo.

## Steps
1. Apply the CLAUDE.md corrections enumerated above. Verify each against the code at
   execution time (grep, don't trust this plan's line numbers).
2. Rewrite README.md top sections as described. Keep the CI badge, Node-version section
   (verify 20.19.1 still true), and license.
3. Mark `docs/adr/0001-project-architecture.md` Status: "Superseded by 0002".
4. Write four ADRs in `docs/adr/` (use 0001's format):
   - `0002-hybrid-swa-plus-functions-architecture.md` — static-export abandoned for SWA
     Oryx hybrid + linked Azure Functions backend; consequences (images unoptimized,
     `[locale]` static-params requirement, api/ as separate TS project excluded from
     root tsconfig — cite PR #16 lesson).
   - `0003-i18n-deferred.md` — locale routing scaffold retained (en, es), next-intl
     unwired by choice, `messages/es.json` preserved; trigger for wiring = business
     decision to market in Spanish (see ROADMAP Later).
   - `0004-deployment-gating-model.md` — cloud Quality Gate (PLAN-002) + branch
     protection required checks + local `npm run validate` as belt-and-braces; deploy
     workflow intentionally has no internal test gate because merge-gating covers it;
     E2E stays local/manual for now.
   - `0005-public-repo-no-self-hosted-runner.md` — repo is public (pending operator
     confirmation — see escalation in STRATEGIC_REVIEW.md §4); therefore the Phase R2
     TODOs in `security-scan.yml:43,140,232,325` are CANCELLED for this repo per
     STANDARDS.md §8; the canonical-file change (removing the TODOs) must be made
     upstream in HerculeanOlympus `config/security-scan/variant-b.yml` or accepted as
     a documented dead comment. Include the STANDARDS.md §8 citation.
5. Prune `docs/`: `git mv` into `docs/archive/` every file that describes the
   static-export era, one-off fixed incidents, or completed migrations. Decision rule:
   a file stays in `docs/` root only if an engineer would need it to operate the system
   TODAY. Expected survivors (verify content before deciding): `adr/`, `email-setup.md`,
   `docker-testing.md`, `techstack.md` (update or archive if stale), `security.md`
   (review), `github-guidelines.md` (review). Everything matching these patterns goes to
   archive: `ci-*fixes*`, `*-deployment-troubleshooting`, `node20-*`, `promptlog`,
   `project-ending-*`, `project-starter-*`, `session-summary`, `progress-summary`,
   `deployment-log`, `deployment-status`, `email-function-*results*`, `globe-*`,
   `middleware-to-static-export`, `static-export-*`, `todo.md`, `linting-fixes`,
   `typescript-*fixes*`, `testing-issues`, `testing-updates`. Do NOT delete anything.
6. Sweep for references to moved/renamed things:
   `grep -rn "src/uitests\|src/components\|src/lib\|fix-component-tests\|coverage-ratchet\|pre-commit-validation" CLAUDE.md README.md docs/ --include="*.md" -l`
   and fix hits in living docs (archived docs stay as-is).
7. Update the auto-memory hint: this repo's project memory (`MEMORY.md` in the Claude
   projects dir) references the dead `src/components/home/ContactSection.tsx` copy —
   out of scope for a repo PR, but note in the PR description that session memory
   should be refreshed. (An agent executing this plan should update its own memory
   files if it has access.)

## Security & compliance notes
ADR-0005 is the control that prevents the public-repo/self-hosted-runner landmine from
being armed. Documentation accuracy is itself an audit-readiness control (SOC 2 asks
"does your documentation reflect reality" in every control walkthrough). No secrets.

## Validation
```bash
# every corrected claim, spot-checked:
grep -n "15.4" CLAUDE.md README.md                      # → empty
grep -n "app/middleware" CLAUDE.md                       # → only the corrected text
grep -rn "coverage ratchet" CLAUDE.md                    # → only the corrected text
ls docs/*.md | wc -l                                     # → ~5-8 living docs
ls docs/adr/                                             # → 0001..0005
```
The `standards-check.yml` workflow (required check) passing on the PR confirms required
files/gitignore rules weren't broken by the moves.

## Rollback
Revert; documentation-only.
