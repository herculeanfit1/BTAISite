# PLAN-012: Docs truth reconciliation (CLAUDE.md, README, ADR backfill, docs pruning)

**Status**: Executed — batch one 2026-07-26, remainder 2026-07-27
**Effort**: M · **Risk**: Low

## Execution notes — remainder (2026-07-27)

The two open items are closed.

**Step 4, ADRs 0003–0005 — written.** 0005 no longer needed the repo-visibility
confirmation this plan was waiting on: the repository is public and that is settled and
acted on throughout (scrubbed operator scripts, RFC 5737 test fixtures, the anti-abuse
tunables tracked as an open item). The ADR records the posture rather than asking for it.

**Step 5, the `docs/` prune — finished.** 20 of the remaining 27 root files archived,
leaving **7 living docs**, inside this plan's "~5–8" target.

Triage was evidence-driven rather than by pattern match, since the earlier marker sweep
returned "—" for most files and an empty result proves nothing on its own. Each file was
checked for repo paths that no longer exist and for claims contradicting the code:

- `azure-swa-deployment.md` was an **empty 0-line file**.
- `security.md` stated that "security headers are implemented via Next.js middleware
  (`middleware.ts`)" — flatly false; there is no middleware and headers come from
  `next.config.js`. This is precisely the class of document that misleads a session.
- `email-setup.md` referenced `src/components/` and `src/lib/email-templates/`, four paths
  deleted in #60 and the API consolidation.
- `deployment.md` referenced `app/i18n.ts`; `docker-testing.md` a workflow that does not
  exist; `production-deployment.md` a Let's Encrypt flow the site does not use.

The seven kept are durable by nature — product intent, design intent, policy — rather than
descriptions of how the system currently works, which is why they do not rot the way the
archived operational guides did.

**New: the prune is now enforced, not just performed.** `docs/README.md` carries a manifest
and `__tests__/docs/docs-manifest.test.ts` fails if the directory and the table disagree,
if a listed file vanishes, if the archive disclaimer is removed, or if a living doc
reasserts retired architecture. Verified by mutation: unlisting `prd.md` and appending the
middleware falsehood to a living doc each failed exactly the intended test. Without it,
`docs/` refills silently — which is how it reached 75 files.

## Execution status (2026-07-26)

Executed out of order, because documentation that contradicts the code was actively
misleading agent sessions and the blocking plans had not moved.

**Done:**

- Steps 1, 2, 6 — CLAUDE.md, README.md, `testing.md` and `.cursor/rules/` reconciled
  against the code, plus a reference sweep for moved/renamed paths.
- Step 3 — `0001-project-architecture.md` marked Superseded.
- Step 4 (partial) — ADR `0002-swa-hybrid-with-api-on-route-handlers.md` written.
- Step 7 — session memory refreshed.

**Not done:**

- Step 4, ADRs 0003–0005 (i18n deferral, deployment gating, public-repo/no-self-hosted-
  runner). 0005 needs the operator's repo-visibility confirmation first.

**In progress:**

- Step 5 — the `docs/` prune. **Batch one shipped in PR #69**: 48 of 75 root files moved
  to `docs/archive/` via `git mv`, plus a `docs/archive/README.md` stating that nothing
  there describes the current system. Three files this plan expected to survive were
  archived after being verified stale (`techstack.md` pins Next 15.3.1;
  `security-testing.md` documents the deleted `src/uitests`; `ci-cd-workflow.md` names six
  workflows that do not exist). 27 files remain — the `azure-*` deployment guides,
  `deployment.md`, `production-deployment.md`, `env-example.md`, and
  `testing-requirements.md` need a closer read than a pattern match. This plan's "~5–8
  living docs" target is not yet met.

**This plan is itself now partly outdated.** It was written before the API consolidation
(PRs #52–#57, 2026-07-24) and still assumes the linked Azure Functions backend and that
CSP lives in `staticwebapp.config.json`. Both are wrong as of 2026-07-24: `/api/*` is
served by App Router route handlers and CSP comes from `next.config.js`. Its step-4 spec
for ADR-0002 ("SWA Oryx hybrid + linked Azure Functions backend") describes a
superseded architecture; the ADR as written records the actual end state instead.
Re-verify every claim in this plan against the code before acting on it.

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
