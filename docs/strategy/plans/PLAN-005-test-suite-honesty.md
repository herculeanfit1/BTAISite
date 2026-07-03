# PLAN-005: Test-suite honesty (remove theater, fix hooks, align coverage with reality)
**Status**: Ready
**Effort**: M · **Risk**: Low

## Context
The test suite projects far more coverage than it delivers. Seven files are always-pass
placeholders (`expect(true).toBe(true)`), two suites are fully `describe.skip`ped, one
test imports a module deleted months ago (breaking `npm run test:api` entirely), one
"fix" script rewrites production source code to satisfy assertions, and the coverage
"ratchet" (`ci/coverage-ratchet.js`) sets its CI floors to 0 and exits green when no
coverage data exists — which is the permanent state (`coverage/coverage-final.json` is
`{}`). The pre-commit hook advertises "affected tests" but runs a fixed suite inside
Docker with an interactive prompt that silently no-ops in a non-TTY git hook.

A test suite that lies is worse than a small honest one: every green run reinforces false
confidence. This plan deletes the lies and makes the remaining ~15 real test files the
enforced baseline. Run AFTER PLAN-004 (which deletes `src/` mirrors some config refers to).

## Goal / Non-goals
**Goal**: `npx vitest run` (whole suite) passes with zero placeholder files, zero skipped
suites, zero broken imports; coverage numbers are real; the pre-commit hook runs without
Docker; the PLAN-002 CI gate widens to the full suite.
**Non-goals**: Writing new API tests (PLAN-007); raising coverage — this plan sets
thresholds AT the honest baseline, not above it; E2E in CI.

## Current state
Placeholder / always-pass files (delete):
- `__tests__/api/send-email.test.ts` (placeholder, early-returns in CI)
- `__tests__/api/status.test.ts` (imports nonexistent `../../app/api/status/route` at :2)
- `__tests__/api/contact-cors.test.ts` (tests a hand-copied clone of CORS logic, not the
  real handler — drift-blind; real handler tests arrive in PLAN-007)
- `__tests__/api/email-placeholder.txt`
- `__tests__/integration/contact-form-integration.test.ts` (placeholder)
- `__tests__/integration/BlogSearch.test.tsx` (fully skipped + placeholder)
- `__tests__/integration/FormValidation.test.tsx` (`describe.skip` at :12)
- `__tests__/lighthouse-optimizations.test.ts` (placeholder)
- `__tests__/components/BookingEmbed.test.tsx` (real tests commented out in `/* */`, only
  a placeholder runs)
- `__tests__/components/globe/GlobeVisualization.test.tsx` (placeholder; globe is dead)
- `__tests__/components/VercelSafariPage.test.tsx` (`describe.skip` + placeholder)

Real, keep: `Button`, `FeatureSection`, `Footer`, `HeroSection`, `NavBar`,
`NetworkMotifSection`, `Newsletter` (un-skip the one `it.skip` at :38 or delete that
case — decide by running it; if it fails for a real reason, fix the assertion, not the
component), `OptimizedImage`, `ThemeToggle`, `Todo`, `DarkModeIntegration`,
`ThemeSwitching`, `TodoPage`, `middleware.test.ts` (delete its tautological third test
at ~:160-166 which asserts against its own mock), `next-config.test.ts`.

Theater infrastructure:
- `scripts/fix-component-tests.js` — rewrites production components (`BookingEmbed.tsx`,
  `OptimizedImage.tsx`, `Newsletter.tsx`) to make tests pass; npm script `fix:tests`
  (`package.json:83`).
- `ci/coverage-ratchet.js` — CI floors 0 (`:17-22`), exits green on missing data
  (`:133-139`); invoked only by `ci/g_test.sh:74-87`.
- `vitest.setup.ts` (396 lines) — orphaned; config loads `vitest.setup.js`
  (`vitest.config.js:16`).
- `tests-examples/demo-todo-app.spec.ts` — verbatim Playwright starter testing an
  external demo site; `uitests/example.spec.ts` (post PLAN-004 move) tests playwright.dev.
- `package.json:91` `validate:pre-commit` → `./scripts/pre-commit-validation.sh` — path
  does not exist (real file is `ci/pre-commit-validation.sh`, which
  `scripts/validate-before-push.sh:6-7` says was replaced).
- lint-staged (`package.json:184-192`): runs `npm run test:docker:affected` per staged
  file batch — fixed Docker suite, interactive rebuild prompt no-ops in hooks, stale
  image risk, fails when Docker daemon is off.

Coverage config: `vitest.config.js:59-69` — `all: false`, include only
`app/components/**` + `src/components/**` (latter deleted by PLAN-004), thresholds
`CI ? 30 : 70` (never enforced in CI since CI runs no tests until PLAN-002).

## Target state
Honest suite: every file in `__tests__/` runs and asserts real behavior; coverage
measured over `app/components/**` and `lib/**` with `all: true`; thresholds = measured
baseline; ratchet script gone; hooks Docker-free; CI gate runs the entire suite.

## Steps
1. Delete all files in the placeholder list above (`git rm`). Delete
   `tests-examples/` and `uitests/example.spec.ts`. Delete `vitest.setup.ts` (keep `.js`).
2. Delete `scripts/fix-component-tests.js`; remove `fix:tests` script
   (`package.json:83`). Grep for other invocations: `grep -rn "fix-component-tests\|fix:tests" ci/ scripts/ .github/ docs/`.
3. Delete `ci/coverage-ratchet.js`; in `ci/g_test.sh` remove the ratchet invocation
   (~:74-87) and the "CI ≥ 70%" claim comment (~:72). Delete
   `ci/pre-commit-validation.sh` and the `validate:pre-commit` npm script
   (`package.json:91`) — orphaned approach per `scripts/validate-before-push.sh:6-7`.
4. Fix `__tests__/middleware.test.ts`: remove the self-mocking matcher test (~:40-51 mock
   + ~:160-166 assertion); keep the two real header tests.
5. `__tests__/components/Newsletter.test.tsx:38` — run the skipped case; if it fails
   because the component genuinely lacks the behavior, delete the case; if it passes,
   un-skip. Do not modify the component.
6. Replace the pre-commit hook test step: in `package.json` lint-staged block, change
   `"npm run test:docker:affected"` → `"vitest related --run"` (lint-staged appends the
   staged file paths; `vitest related` runs only tests importing them). Keep
   `eslint --fix`. Remove npm scripts `test:docker:affected` only if nothing else calls
   it (`grep -rn "test:docker:affected" ci/ scripts/ .github/`). Docker test scripts
   otherwise stay — they're still useful manually.
7. Jest/Babel stack removal (it exists only for tests; Vitest is the runner):
   `grep -rn "jest\b" --include="*.config.*" --include="*.json" . --exclude-dir=node_modules`
   — expect hits only in `package.json` deps and `@testing-library/jest-dom` (which is
   Vitest-compatible; KEEP it). Remove devDeps: `jest`, `babel-jest`,
   `jest-environment-jsdom`, `jest-junit`, `@babel/preset-env`, `@babel/preset-react`,
   `@babel/preset-typescript`, `@babel/plugin-syntax-import-attributes`. (PLAN-003
   already deleted `babel.config.js.bak`; no live babel config remains.) `npm install`
   to regenerate lockfile.
8. Coverage honesty in `vitest.config.js`: set `all: true`; include
   `["app/components/**", "lib/**"]`; run `npx vitest run --coverage`, record the real
   numbers, set thresholds (both CI and local — collapse the `process.env.CI` split to a
   single set) to `floor(actual) - 2` per metric. Mirror the same treatment in
   `vitest.integration.config.js`.
9. Widen the PLAN-002 gate: in `.github/workflows/quality-gate.yml`, replace the
   targeted vitest path list with `npx vitest run --coverage` (thresholds now enforce).
10. Update npm scripts that reference deleted dirs: `test:api`
    (`__tests__/api/` is now empty — remove the script and `git rm -r __tests__/api`),
    `test:e2e:dark-mode` path check, `pretest:*` hooks for removed scripts.

## Security & compliance notes
None directly; indirectly this is SOC 2 change-management evidence — the claim "tests
gate every change" becomes true. `fix-component-tests.js` deletion removes a script that
silently mutates production source, which is an integrity hazard.

## Validation
```bash
npm ci
node scripts/fix-rollup.js
npx vitest run --coverage        # whole suite passes; thresholds met; zero skips
grep -rn "expect(true).toBe(true)" __tests__/            # → empty
grep -rn "describe.skip\|it.skip" __tests__/             # → empty
git commit --dry-run             # hook path: stage a component change, verify
                                  # eslint + vitest related run without Docker
```
CI: the PR itself must pass the widened Quality Gate.

## Rollback
Revert the PR. Deleted tests were placeholders — restoring them restores nothing of
value, so partial rollback is never needed; a threshold set too aggressively is fixed by
lowering the number, not reverting.
