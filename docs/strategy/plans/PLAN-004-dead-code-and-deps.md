# PLAN-004: Dead code & dead dependency removal
**Status**: Ready
**Effort**: M · **Risk**: Med

## Context
The repo carries a near-complete parallel dead codebase: `src/` holds 118 tracked files —
a second App Router (`src/app/`), ~57 mirrors of `app/components/`, and ~20 lib files —
of which exactly **three modules are alive**. Meanwhile `tsconfig.json` aliases
`@/components/*` and `@/lib/*` into the dead tree, so any contributor (or agent) using
the documented aliases edits code that never ships. This trap has bitten before (see the
"Dead code copy" note in project memory / CLAUDE.md's `src/components/` warning).
Additionally ~1 MB+ of dependencies have zero imports. Nothing in this plan changes
runtime behavior; it removes what provably doesn't run.

## Goal / Non-goals
**Goal**: One live source tree (`app/` + root `lib/`), no aliases into dead code, no
dependencies without imports. Build output byte-equivalent-in-behavior to before.
**Non-goals**: Removing the Jest/Babel test stack (PLAN-005, it's test infra);
unifying `/` vs `/[locale]` routes (PLAN-008); refactoring oversized components;
touching `api/` (separate project, nothing dead found there).

## Current state
Live imports INTO `src/` — exactly four, all via the `@/*` → `./*` alias
(`tsconfig.json:34-37`):
- `app/components/home/ContactSection.tsx:5` → `@/src/lib/validation`
- `app/GoogleAnalytics.tsx:4` → `@/src/lib/use-consent`
- `app/components/TelemetryProvider.tsx:4-5` → `@/src/lib/telemetry` and `@/src/lib/use-consent`

Aliases into dead code: `tsconfig.json:38-46` (`@/components/*` → `./src/components/*`,
`@/lib/*` → `./src/lib/*`, `@/types/*` → `./src/types/*`). Zero live usages of
`@/components/*` or `@/lib/*` (verified); `@/types/*` usage unverified — check in step 1.

Playwright lives inside `src/`: `playwright.config.ts:13` sets `testDir` to
`src/uitests/` — those files are NOT dead.

Dead dependencies (zero imports, verified by grep across `app/ src/ lib/ api/`):
- `three@0.171.0`, `@react-three/fiber@9.1.2`, `@types/three` (`package.json:100,104,118`)
  — the `globe/` component dirs are empty; the live "globe" (`GlobeOverlaySection.tsx`)
  is CSS-only.
- `resend@4.5.1` (`package.json:115`) — email sending moved to `api/` (which uses
  `resend@^6.11.0`); no frontend import remains. Verify: `grep -rn "from \"resend\"\|from 'resend'" app/ src/ lib/` → only dead `src/lib/email*` copies.
- `critters@0.0.23` (`package.json:106`) — only consumer would be
  `experimental.optimizeCss`, which is commented out (`next.config.js:68-70`). Upstream
  project is archived.

Dead middleware: `app/middleware.ts` — Next.js only loads root-level middleware; this
file (CSP nonce generation) never runs. Root `middleware.ts` is the live (no-op stub)
one. `lib/nonce.ts` exists to support the dead one — check imports before removing.

Dead files inside `app/` were removed by PLAN-003 (`test-page.tsx` etc.).

## Target state
- `src/` deleted except content relocated: live libs → root `lib/`, Playwright suite →
  `uitests/` at root.
- `tsconfig.json` paths: only `@/*` → `./*` remains.
- `package.json` without the six dead deps; lockfile regenerated.
- `app/middleware.ts` and (if orphaned) `lib/nonce.ts` deleted.

## Steps
1. Verify assumptions (abort & re-plan on surprises):
   ```bash
   grep -rn "@/components/\|@/lib/\|@/types/" app/ lib/ __tests__/ middleware.ts server.js
   grep -rn "from \"@/src/\|from '@/src/" app/ lib/ __tests__/
   grep -rn "src/" __tests__/ --include="*.tsx" --include="*.ts" -l
   ```
   Expected: no `@/components|@/lib` hits; the three `@/src/lib` files above; if
   `@/types/*` IS used, relocate `src/types/` content into root `types/` (which exists)
   instead of deleting, merging carefully. If any `__tests__/` file imports from `src/`
   mirrors, rewrite the import to the `app/` twin (the mirrors are near-identical) or
   defer that single test to PLAN-005's deletion list if it's already theater.
2. Re-home the three live modules into root `lib/`:
   - `git mv src/lib/validation.ts lib/validation.ts` — **if** `lib/validation.ts`
     already exists, overwrite it with the `src/lib` version (the imported one defines
     live behavior) after diffing to confirm nothing in `lib/`'s version is uniquely
     imported elsewhere (`grep -rn "lib/validation" app/ lib/ __tests__/`).
   - Same for `src/lib/use-consent.ts` and `src/lib/telemetry.ts` (check for sibling
     imports inside those files — e.g. telemetry importing use-consent — and fix their
     relative paths after the move).
3. Update the four import sites to relative paths (repo convention — the live app uses
   relative imports):
   - `app/components/home/ContactSection.tsx:5` → `../../../lib/validation`
   - `app/GoogleAnalytics.tsx:4` → `./lib/use-consent` is wrong — it's `../lib/use-consent`
     from `app/`; compute exactly: file is `app/GoogleAnalytics.tsx`, target `lib/use-consent.ts`
     → `../lib/use-consent`.
   - `app/components/TelemetryProvider.tsx:4-5` → `../../lib/telemetry`, `../../lib/use-consent`.
4. Relocate Playwright: `git mv src/uitests uitests` and change
   `playwright.config.ts:13` testDir to `./uitests`. Grep for other `src/uitests`
   references (`package.json`, docs, CI): update `npx playwright test src/uitests/...`
   examples in CLAUDE.md later (PLAN-012); nothing in workflows uses it.
5. Delete the dead tree: `git rm -r src/` (after steps 2-4 it contains only dead code).
6. tsconfig: remove the `@/components/*`, `@/lib/*`, `@/types/*` path entries
   (`tsconfig.json:38-46`), keep `@/*`. Check `vitest.config.js` and
   `vitest.integration.config.js` for `resolve.alias` entries pointing into `src/` and
   remove/retarget them likewise.
7. Delete dead middleware: `git rm app/middleware.ts`. Then
   `grep -rn "nonce" lib/ app/ middleware.ts` — if `lib/nonce.ts` has no remaining
   importer, delete it too.
8. Remove dead deps: edit `package.json` to drop `three`, `@react-three/fiber`,
   `@types/three`, `resend`, `critters`. Then `npm install` to regenerate the lockfile.
   Do NOT remove `autoprefixer`/`postcss-import`/`postcss` in this plan — first check
   `postcss.config.cjs`: if they appear there they are load-bearing config; removing them
   is a separate, riskier change (defer; note in PR description).
9. Update `vitest.config.js` coverage include (`:59-62`) to drop `src/components/**`
   (now nonexistent) — leave the rest of coverage policy to PLAN-005.

## Security & compliance notes
Shrinks the audit/attack surface (~6 fewer dependency trees for Trivy/Dependabot to
track; `three` alone is a large tree). No secrets, no permission changes. The dead
`app/middleware.ts` deletion removes a false sense of CSP nonce protection — the real
CSP posture (static headers in `staticwebapp.config.json`, including the non-functional
literal `{nonce}`) is addressed in PLAN-012 documentation and future hardening.

## Validation
```bash
npm ci
npm run type-check          # no missing-module errors
npm run build               # succeeds
node scripts/fix-rollup.js && npx vitest run __tests__/components __tests__/integration __tests__/middleware.test.ts __tests__/next-config.test.ts
npx playwright test uitests/smoke.spec.ts   # local, with dev server, if feasible
grep -rn "src/lib\|src/components\|@/components/\|@/lib/" app/ lib/ __tests__/ tsconfig.json  # → empty
```
Bundle check: `ANALYZE=true npm run build` before/after — expect equal or smaller
first-load JS; any growth = something was resolving differently, investigate.

## Rollback
Revert the PR (single commit). No data or infra involved. If a hidden consumer of a
deleted module surfaces post-merge, `git revert` restores everything including lockfile.
