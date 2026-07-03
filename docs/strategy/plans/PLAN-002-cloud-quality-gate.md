# PLAN-002: Cloud quality gate (build + type-check + tests as required PR checks)
**Status**: Ready
**Effort**: S · **Risk**: Low

## Context
Nothing in this repo's cloud CI compiles the app, type-checks it, or runs a single test.
`cost-optimized-ci.yml` is deployment-only (its own header says so); `standards-check.yml`
runs ESLint; `security-scan.yml` runs Trivy. Branch protection on `main` (verified live)
requires: `Standards Compliance`, `Trivy filesystem scan`, `Trivy IaC config scan`,
`Trivy secrets scan`, `Gate on HIGH / CRITICAL` — so a PR that fails to build or breaks
every test can merge, and the push-to-main deploy fires with no `needs:` on any check.
The only correctness gate is a ~15-minute optional local script (`ci/g_master.sh`).

Constraint: `standards-check.yml` and `security-scan.yml` are canonical fleet files
("Do not edit per-repo copies"). The gate must therefore be a **new, repo-owned**
workflow file.

Known trap: the full test suite does NOT currently pass — `__tests__/api/status.test.ts:2`
imports a deleted module (`app/api/status/route`), and several files are placeholders
(cleaned up later by PLAN-005). The gate must run the known-good subsets only, and
PLAN-005 widens it afterward.

## Goal / Non-goals
**Goal**: Every PR to `main` must pass type-check, production build, the working unit/
integration test subset, and the `api/` typecheck+build, before merging.
**Non-goals**: Running Playwright/E2E in CI (needs a server; separate decision); coverage
enforcement (PLAN-005); editing the canonical workflows; adding `needs:` chains inside
`cost-optimized-ci.yml` (merge-gating via branch protection is sufficient — deploys only
fire on push to `main`, which only happens via gated PRs).

## Current state
- Workflows: `.github/workflows/{cost-optimized-ci,security-scan,standards-check,dependabot-security}.yml`.
- `cost-optimized-ci.yml:116-138` — `deploy-pr-to-azure` deploys every PR with the
  production SWA token (`AZURE_STATIC_WEB_APPS_API_TOKEN_BRIDGINGTRUST_WEBSITE`).
- Node: root pinned `20.19.1` (`.nvmrc`, `package.json engines`); `api/` targets Node 22.
- `scripts/fix-rollup.js` exists to work around npm optional-deps bug on Linux
  (npm/cli#4828) and is wired as a `pretest` hook; calling `npx vitest` directly bypasses
  the hook, so CI must run it explicitly.
- Working test subsets (verified 2026-07-03): `__tests__/components/`,
  `__tests__/integration/`, `__tests__/middleware.test.ts`, `__tests__/next-config.test.ts`.
  Broken: `__tests__/api/` (dead import). Placeholders pass trivially — harmless to the gate.

## Target state
A `Quality Gate` workflow with two jobs (`Quality Gate / frontend`, `Quality Gate / api`)
runs on every PR and push to `main`, and both are required status checks on `main`.

## Steps
1. Create `.github/workflows/quality-gate.yml`:
   ```yaml
   name: Quality Gate

   on:
     pull_request:
       branches: [main]
       types: [opened, synchronize, reopened]
     push:
       branches: [main]

   permissions:
     contents: read

   concurrency:
     group: quality-gate-${{ github.event_name }}-${{ github.ref }}
     cancel-in-progress: true

   jobs:
     frontend:
       name: Quality Gate / frontend
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v6
         - uses: actions/setup-node@v6
           with:
             node-version-file: .nvmrc
             cache: npm
         - run: npm ci
         - run: npm run type-check
         - run: node scripts/fix-rollup.js
         - name: Unit & integration tests
           run: npx vitest run __tests__/components __tests__/integration __tests__/middleware.test.ts __tests__/next-config.test.ts
         - run: npm run build

     api:
       name: Quality Gate / api
       runs-on: ubuntu-latest
       defaults:
         run:
           working-directory: api
       steps:
         - uses: actions/checkout@v6
         - uses: actions/setup-node@v6
           with:
             node-version: 22
             cache: npm
             cache-dependency-path: api/package-lock.json
         - run: npm ci
         - run: npm run typecheck
         - run: npm run build
         - run: npm test --if-present
   ```
   Notes: checkout/setup-node major versions copied from `standards-check.yml` (v6) —
   match whatever that file uses at execution time. `--if-present` keeps the api job
   green until PLAN-001 adds the `test` script. Pin the vitest path list exactly as
   above; widening it is PLAN-005's job.
2. Push the branch, open a PR, and confirm both checks appear and pass.
3. Add both contexts as required status checks (requires admin; `enforce_admins` is on):
   ```bash
   gh api -X POST repos/herculeanfit1/BTAISite/branches/main/protection/required_status_checks/contexts \
     --input - <<'EOF'
   ["Quality Gate / frontend", "Quality Gate / api"]
   EOF
   gh api repos/herculeanfit1/BTAISite/branches/main/protection/required_status_checks --jq '.contexts'
   ```
   Expected final contexts: the 5 existing + the 2 new.
4. Harden the PR preview deploy: in `cost-optimized-ci.yml`, on the `deploy-pr-to-azure`
   job (line ~116), extend the job-level `if:` to also require
   `github.event.pull_request.head.repo.full_name == github.repository` (same-repo PRs
   only — the repo is public; fork PRs must not attempt deploys). Preserve the existing
   `if:` conditions by AND-ing.
5. Update `README.md` badge section only if it references CI claims invalidated here
   (do not do a full README rewrite — that is PLAN-012).

## Security & compliance notes
`permissions: contents: read` only; no secrets used by the gate. Step 4 reduces exposure
of the production SWA token on a public repo. Branch-protection change is auditable via
the GitHub audit log. This workflow is repo-owned; document that in the file header
comment so a fleet sweep doesn't mistake it for a canonical copy.

## Validation
```bash
gh pr checks <pr-number>          # shows Quality Gate / frontend + api green
gh api repos/herculeanfit1/BTAISite/branches/main/protection/required_status_checks --jq '.contexts'
# → includes "Quality Gate / frontend" and "Quality Gate / api"
```
Negative test: push a commit to the PR with a deliberate type error (`const x: number = "a"`
in any `.ts` file), confirm the frontend job fails and the PR is blocked, then remove it.

## Rollback
Delete `.github/workflows/quality-gate.yml` and remove the two contexts:
```bash
gh api -X DELETE repos/herculeanfit1/BTAISite/branches/main/protection/required_status_checks/contexts \
  --input - <<'EOF'
["Quality Gate / frontend", "Quality Gate / api"]
EOF
```
