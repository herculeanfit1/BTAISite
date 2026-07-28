# PLAN-013: Front-end verification (E2E in CI, performance budgets, accessibility)

**Status**: Ready
**Effort**: M · **Risk**: Low (test-only; no production behaviour changes)
**Written**: 2026-07-28

> Every claim in "Current state" was verified against the code on 2026-07-28 and the
> command that produced it is shown. Treat the **Steps** as a hypothesis anyway — that is
> the lesson of PLAN-001 through PLAN-012, and this plan is not exempt.

## Context

The lead path is well covered: `src/lib/api` at ~95% lines, `app/api/*` route handlers at
100%, every behaviour mutation-tested. **The part a visitor actually touches is verified by
nothing automated.** `app/components` sits at 27% and the root `lib/` at 0%.

There is an E2E suite — 90 Playwright tests — and it runs in no workflow. This plan is
mostly about connecting and repairing what already exists rather than writing new tests
from scratch.

## Goal / Non-goals

**Goal**: The user-facing site is verified on every PR — it loads, navigates, submits,
toggles theme, meets the performance budgets CLAUDE.md already commits to, and has no
critical accessibility violations.

**Non-goals**: Raising `app/components` unit coverage (E2E is the higher-value instrument
for presentational code); visual-regression snapshots (a separate decision — snapshots are
a maintenance burden that needs its own justification); redesign of any page; changing
production behaviour of any kind.

## Current state — verified 2026-07-28

- **`e2e/` holds 3 specs, 90 tests**, across 5 browser projects (chromium, firefox, webkit,
  mobile-chrome, mobile-safari) — 18 tests each.
  `npx playwright test --list` → `Total: 90 tests in 3 files`.
- **No workflow runs them.** `grep -rl "playwright\|test:e2e" .github/workflows/` → no
  matches. The Quality Gate (`quality-gate.yml`) runs type-check, the Vitest suite and the
  build; not this.
- **`playwright.config.ts:113-115` cannot start a server.** `command: "npm run dev"` runs
  `node server.js`, which serves **HTTPS**; `url: "http://localhost:3000"` is **HTTP**.
  Playwright waits for an HTTP endpoint that never answers. `npm run dev:http`
  (`SSL_CERT_ENV=none node server.js`) is the HTTP variant.
  **This is the most likely reason the suite was never wired in** — it does not start.
- **`e2e/vercel-safari.spec.ts` (20 tests) targets a deleted page.** It calls
  `page.goto("/vercel-safari")` at `:13`, `:48`, `:70`; `app/vercel-safari/` does not
  exist. Roughly a fifth of the suite fails on the first run.
- **Two configured projects match zero tests**: `visual-regression`
  (`testMatch: /visual.*\.spec\.ts/` — no such file) and `performance`
  (`testMatch: /__tests__\/lighthouse.*\.test\.ts/`, resolved under `testDir: ./e2e` — no
  such file). Scaffolding for intentions never implemented.
- **Performance budgets are stated in CLAUDE.md** (LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms,
  Perf ≥ 90) **and measured by nothing.** The `performance` project above is the fossil of
  an earlier attempt.
- **Accessibility has never been assessed.** No axe/pa11y dependency, no a11y test.
- Deploy already produces a preview URL per PR (`deploy-pr-to-azure`), and production
  availability is probed by two Azure webtests.

## Target state

`Quality Gate / e2e` runs the repaired Playwright suite on every PR. Performance budgets
and accessibility are asserted by tests that fail the gate when breached, against numbers
that are measured rather than aspirational.

## Steps

### Part 1 — make the suite runnable, then wire it in

1. **Fix the webServer** (`playwright.config.ts:113`): `command: "npm run dev:http"`.
   Verify locally with `npx playwright test e2e/basic.spec.ts --project=chromium` from a
   clean state (no server already running — `reuseExistingServer: !process.env.CI` will
   otherwise mask the bug).
2. **Resolve `vercel-safari.spec.ts`.** The page is gone. Default to **deleting the spec**;
   it tested a Vercel-specific Safari workaround for a deployment target this site no
   longer uses. If any assertion in it covers behaviour still worth having (mobile viewport
   rendering, form interaction), port that assertion into `basic.spec.ts` rather than
   keeping the file. Record which assertions were kept and which dropped.
3. **Delete the two dead projects** (`visual-regression`, `performance`) or give them real
   `testMatch` targets. Prefer deletion: a project matching zero tests is indistinguishable
   from a passing one, which is the failure mode this repo keeps hitting.
4. **Run the full suite locally.** Expect failures beyond the known ones — 65 dark-mode
   tests have never been run against the current DOM. Fix or delete; do **not** skip. A
   skipped E2E test is the same lie as a placeholder unit test (PLAN-005).
5. **Add an `e2e` job to `quality-gate.yml`.** Separate job, `needs: []` so it runs in
   parallel with `frontend`. Install browsers with `npx playwright install --with-deps
   chromium` and run **chromium only** in CI initially — five browsers is ~5× the minutes
   for a marketing site whose analytics nobody reads. Widen later if a browser-specific bug
   ever ships. Upload the HTML report as an artifact on failure.
6. **Do NOT make it a required status check in the same PR.** Let it run advisory for a few
   PRs first; a flaky new gate that blocks merges gets disabled, permanently. Add the
   context once it has been green across several runs — same discipline as PLAN-002.

### Part 2 — performance budgets

7. **Measure before asserting.** Run Lighthouse against the PR preview URL and record the
   actual LCP/CLS/INP/Perf numbers in the PR. CLAUDE.md's budgets were written as
   aspirations; if the site does not currently meet them, the honest move is to record the
   real baseline and set thresholds just under it, then ratchet — exactly what PLAN-005 did
   for coverage. **Do not assert a budget the site does not meet and call it a gate.**
8. Add `@lhci/cli` (Lighthouse CI) as a devDependency and a `lighthouserc.json` asserting
   the agreed numbers. Run it in CI against the **preview deployment**, not `localhost` —
   a dev-server measurement is meaningless for LCP.
9. If the numbers are already comfortably inside the budgets, assert CLAUDE.md's published
   values directly and delete the "measured by nothing" caveat from the roadmap.

### Part 3 — accessibility

10. Add `@axe-core/playwright`. One spec, `e2e/a11y.spec.ts`, running axe against the
    homepage and each canonical legal page (`/privacy`, `/terms`, `/product-terms`,
    `/engagement-terms`), asserting **zero `critical` and `serious` violations**.
11. Expect real findings — contrast on the gradient headings and form-label associations
    are the usual suspects. Fix them in this plan; they are small and they are the point.
    If a violation needs a design decision, record it in the PR and exclude that specific
    rule with a comment naming the decision, never a blanket disable.
12. Run a11y in the same `e2e` job (chromium only) — axe is fast and has no separate infra.

## Security & compliance notes

Test-only; no production behaviour changes and no new secrets. Accessibility work has
genuine legal weight for a public commercial site in several jurisdictions, and this is a
consultancy that sells engineering judgement — an unaudited public site is a credibility
problem before it is a legal one. Playwright browser downloads add a CI supply-chain
surface; pin the version via `package.json` as the repo already does.

## Validation

```bash
npx playwright test --list                       # expect 0 dead projects, no vercel-safari
npx playwright test --project=chromium           # full suite green from a clean state
npm run test:coverage                            # unit suite unaffected
```

CI: `Quality Gate / e2e` green on the PR, artifacts uploaded on failure.
Lighthouse: numbers recorded in the PR body, thresholds set from them.
Axe: zero critical/serious violations, or an explicit documented exclusion.

## Rollback

Delete the `e2e` job from `quality-gate.yml`; revert the config and spec changes. Nothing
here touches production code, so rollback is a revert with no deploy consequence.

## Notes for whoever executes this

- **The 65 dark-mode tests are the unknown.** They have never run against the current DOM
  and were written before the `src/` component tree was deleted. Budget for them being the
  bulk of the work, and be willing to delete rather than nurse them.
- `reuseExistingServer: !process.env.CI` means a stale local dev server masks webServer
  bugs. Test the fix from a clean state or you will "verify" nothing.
- Prove the gate can fail before trusting it: break something deliberately and confirm the
  `e2e` job goes red. A green job that runs zero tests looks identical to a passing one,
  and this repo has produced that exact artefact twice.
