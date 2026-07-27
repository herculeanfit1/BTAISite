# Testing — Bridging Trust AI

Two runners, one rule: **Vitest** for unit and integration, **Playwright** for
browser-driven end-to-end. Jest is a vestigial devDependency with no config file — do not
write Jest tests or reference `jest.config.*`.

Run commands are owned by `package.json`; configuration is owned by `vitest.config.js`,
`vitest.integration.config.js`, and `playwright.config.ts`. This document describes the
layout and the traps, and deliberately avoids restating command lists that go stale.

## Layout

| Path                         | Runner               | Notes                                                                                                                                                                    |
| ---------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `__tests__/components/`      | Vitest (`happy-dom`) | Component tests — `npm run test:unit`                                                                                                                                    |
| `__tests__/api/`             | Vitest               | Covers `src/lib/api/` — schema, CORS, client IP, handler orchestration with mocked providers, plus a guard asserting no direct `resend` import outside the provider seam |
| `__tests__/integration/`     | Vitest               | Separate config: `npm run test:integration`                                                                                                                              |
| `__tests__/*.test.ts` (root) | Vitest               | `next-config`, `security-headers`, `lighthouse-optimizations`                                                                                                            |
| `e2e/`                       | Playwright           | Playwright's `testDir`. Needs a server on `:3000`                                                                                                                        |
| `smoke/`                     | Playwright           | `npm run test:smoke`                                                                                                                                                     |

`npm run test` runs every Vitest suite (`__tests__/**`, excluding `__tests__/e2e/`).
Browser projects — desktop, mobile, visual-regression, performance — are defined in
`playwright.config.ts`; select one with `--project=<name>`.

## Running a subset

```bash
npx vitest run __tests__/api/contact-handler.test.ts   # one file
npx vitest run __tests__/api -t "rate limit"           # filter by test name
npx vitest __tests__/components/NavBar.test.tsx        # watch mode
npx playwright test e2e/basic.spec.ts --headed
npx playwright test --project=chromium
```

## Traps

- **A Vitest path filter matching zero files is silently ignored** when another filter
  matches, so the run still exits 0. A green result does not prove your file ran — check the
  reported file count. This is why `test:ci-basic` and `test:security` pass despite both
  naming the long-deleted `__tests__/middleware.test.ts`.
- **Coverage only counts the component tree.** `vitest.config.js` limits
  `coverage.include` to `app/components/` with `all: false`, so tests for `src/lib/api/` —
  the most logic-heavy code in the repo — earn no coverage credit and cannot move the
  thresholds.
- **`__tests__/e2e/dark-mode.spec.ts` runs in neither suite.** Vitest excludes
  `__tests__/e2e/`, and Playwright's `testDir` is `./e2e`, so nothing picks it up. The
  `test:e2e:dark-mode` script that targets it exits 1. Move the file under `e2e/` to
  reactivate it.
- **Scripts pointing at deleted files**: `test:middleware` never existed (only an orphaned
  `pretest:middleware` hook), and `test:middleware:coverage` exits 1. The `src/uitests/`
  Playwright suite referenced by older docs was removed in PR #63; `test:visual`,
  `test:lighthouse`, and `test:docker:e2e` do not exist either.

## Docker

Docker runs eliminate platform-specific Rollup binary failures and are the recommended
path for unit and integration suites locally. Entry point is `scripts/docker-test.sh`
(wrapped by the `test:docker:*` scripts); the image is built from `Dockerfile.test`.

Pre-commit uses `test:docker:affected` via lint-staged, so staged-file test runs happen in
Docker automatically.

## CI

Cloud CI is **deploy-only** — it does not run these suites. The gate is local:
`npm run validate` → `ci/g_master.sh`, whose test phase (`ci/g_test.sh`) runs
`test:ci-basic`, `test:security-headers`, `test:config`, and `test:coverage`. There is no
`hybrid-tests.yml` or `ui-tests.yml` workflow.

## Conventions

Keep tests isolated and fast; mock third-party services at the provider seam rather than
stubbing HTTP; prefer role- and text-based Playwright selectors over `data-testid` unless
the element has no accessible name; and update visual snapshots only when a design change
is intentional.
