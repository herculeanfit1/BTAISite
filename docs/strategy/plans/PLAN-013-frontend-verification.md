# PLAN-013: Front-end verification (E2E in CI, performance budgets, accessibility)

**Status**: Parts 1 and 3 done (2026-07-28) · Part 2 open
**Effort**: M · **Risk**: Low (test-only; no production behaviour changes)
**Written**: 2026-07-28

> Every claim in "Current state" was verified against the code on 2026-07-28 and the
> command that produced it is shown. Treat the **Steps** as a hypothesis anyway — that is
> the lesson of PLAN-001 through PLAN-012, and this plan is not exempt.

## ⚠️ Correction — this plan's central diagnosis was wrong

Written 2026-07-28, **before** Part 1 was executed. Executing it disproved the headline
claim within the first ten minutes. Recorded here rather than silently edited, because the
plan being wrong *in exactly the way it warned about* is the useful part.

**The plan said**: `playwright.config.ts:113` runs `npm run dev`, which serves **HTTPS**,
while `webServer.url` is HTTP — so Playwright waits for an endpoint that never answers.

**What is actually true**: `server.js` chooses HTTP or HTTPS by whether SSL certificates
happen to exist on the machine. With none present it logs *"No SSL certificates found,
falling back to HTTP"* and serves HTTP on 3000. With certificates present it starts
**both** — HTTPS on `HTTPS_PORT` and HTTP on `HTTP_PORT` (3000). Either way HTTP answers on
3000, so the stated mismatch does not exist and the one-line fix would have fixed nothing.

**What was actually wrong** — two things, both worse:

1. **Playwright had no way to tell this site from any other.** `webServer` used `url:` with
   `reuseExistingServer: !process.env.CI`, which polls until *something* returns 200. On the
   machine this was run from, port 3000 is held by an unrelated container. The suite ran
   against that application and reported `Expected /Bridging Trust AI/, Received "Sign in |
   Langfuse"` — a foreign app's login page, presented as a homepage-title regression.
   Demonstrated by replaying the old config verbatim, not inferred.
2. **The dev server could not hydrate at all.** The CSP in `next.config.js` withholds
   `'unsafe-eval'`; Next's dev bundler wraps every module in `eval()`. The browser refused
   all of it, so `npm run dev` rendered server HTML and then stopped: no theme toggle
   (frozen at its pre-mount placeholder), no hero, no interactivity, one console line as the
   only symptom. **Production was verified unaffected** — same diagnostic against
   `https://bridgingtrust.ai/` shows the `h1`, a mounted toggle and no CSP violation beyond
   a Cloudflare beacon that is correctly blocked.

Neither was visible by reading. Both took running the thing.

**Method note**: the false claim came from reading `package.json` (`dev` has no
`SSL_CERT_ENV`, `dev:http` sets it to `none`) and inferring the rest. The inference was
reasonable and wrong, and it is the same shape as the Key Vault item in PLAN-012's
transparency report — true premises, plausible reasoning, a conclusion nobody executed.

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

#### Part 1 as executed (2026-07-28) — done

Steps 1–6 above are the hypothesis. What shipped:

| Step | Planned | Actual |
| --- | --- | --- |
| 1 | `command: "npm run dev:http"` | Done, but **not** the fix. Added `E2E_PORT`/`E2E_BASE_URL`, switched `url:` → `port:` so an occupied port is a hard error instead of a silent wrong target, and set `reuseExistingServer: false` unconditionally. CI builds and serves **production**, not the dev server. |
| 2 | Delete or port `vercel-safari.spec.ts` | Deleted (20 tests). Ported: responsive rendering at 3 viewports, and form-field interaction — both retargeted at the real homepage. Dropped: assertions on a newsletter section (deferred), a `© 2023` footer, and nav links that no longer exist. |
| 3 | Delete the two zero-match projects | Done — `visual-regression` and `performance` removed with a comment saying why. |
| 4 | Run the suite; fix or delete failures | Done. **130 tests pass across 5 browsers in 1.2 min.** No test skipped. |
| 5 | Add an advisory `e2e` job | Done — chromium only, `needs:` absent so it runs beside `frontend`, HTML report uploaded on failure. |
| 6 | Do not make it required | Held. |
| — | *(not planned)* | **CSP fix**: `'unsafe-eval'` granted to the dev server only, gated on `NODE_ENV === "development"`, with 4 guard tests. |

**The dark-mode suite was not "13 tests that had never run against the current DOM".** It
was 13 tests of which **five ended in `expect(typeof isDark).toBe("boolean")`** — true for
every possible value, including `undefined`. They would have reported green against a
toggle that did nothing. Others asserted Tailwind class strings (`dark:bg-gray-900/98` —
the class is `dark:bg-gray-900`, no `/98`) and a two-icon DOM the component does not render;
one asserted `role="button"` as an *attribute* on a `<button>`, which carries that role
implicitly and sets no such attribute, so it failed against correct markup.

Rewritten to assert what a visitor experiences: the computed `background-color` changes,
the choice survives a reload, `Enter`/`Space` operate the control, an explicit choice
overrides the system preference. 26 tests per browser, up from 18.

**Gate proven able to fail**: forcing `ThemeToggle` to never leave its pre-mount
placeholder turned 11 chromium tests red; reverting restored 26 green.

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

#### Part 3 as executed (2026-07-28) — done

`e2e/a11y.spec.ts` scans the homepage and all four canonical legal pages, plus the homepage
in dark mode, with `@axe-core/playwright` 4.12.1 pinned. **Zero critical and zero serious
violations**, from a starting point of 57 blocking nodes.

The plan said "expect real findings — contrast on the gradient headings and form-label
associations are the usual suspects." Half right. **Form labels were already correct** —
every field has a real `htmlFor`. The findings were entirely colour, and they collapsed to
four tokens rather than being scattered:

| Token | Was | Now | Where |
| --- | --- | --- | --- |
| brand `#5B90B0` on white | 3.46:1 | `#3A5F77` — 6.81:1 | nav links, footer links, small caps |
| white on brand background | 3.46:1 | on `#3A5F77` — 6.81:1 | primary buttons |
| `text-blue-500` `#2b7fff` | 3.76:1 | `text-blue-600` — 5.25:1 | inline links in legal prose |
| `text-gray-400` `#99a1af` | 2.60:1 | `text-gray-500` — 4.84:1 | the message character counter |

Plus `link-in-text-block` on the three terms pages (links distinguished by colour alone →
now always underlined, matching the footer idiom), a dark-mode Decline button at 3.96:1, and
the contact form's invalid-state submit at `opacity-60` → 2.75:1, raised to `opacity-85` →
4.74:1. That last one is worth noting: the button is styled to look disabled but is only
actually `disabled` while submitting, so it was an **enabled** control nobody could read.

`#3A5F77` was already in the codebase as the hover tone for the same elements, so no new
colour was introduced; hovers moved down to `#2C4A5E` to stay distinguishable. Purely
decorative accent bars (no text) were deliberately left on `#5B90B0` — contrast rules do not
apply to them and changing them would have been restyling beyond the stated purpose.

**The flake, and why it was not a threshold problem.** The dark-mode scan failed roughly one
run in three, on a different browser each time, and passed on every isolated re-run. Captured
message: `foreground #192736 on background #1a2937 — 1.02:1`. Two near-identical darks,
because at partial opacity both the element's text and its background resolve to blends of
the page behind it — a pair shown to no user. Cause: **Framer Motion writes inline
`style="opacity"` from rAF**, which CSS cannot freeze, and Motion's `reducedMotion="user"`
suppresses transform and layout animations but deliberately keeps opacity fades. Fixed by
waiting for every *inline* opacity to settle before scanning, then injecting a
transition/animation kill stylesheet. Only inline opacity is polled — the contact form's
`opacity-85` submit is a permanent fractional opacity from a utility class and must not be
mistaken for an animation in flight. **6 consecutive clean a11y runs (180 executions) and 3
clean full-suite runs** after the fix.

Gate proven able to fail: reverting the single character-counter colour turned both the
homepage and dark-mode tests red.

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
