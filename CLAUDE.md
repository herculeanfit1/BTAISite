# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Bridging Trust AI marketing/consulting site — Next.js 15.5 (App Router) + React 19 + TypeScript 5 (strict) + Tailwind CSS v4, deployed on **Azure Static Web Apps**. `/api/*` is served by the SWA **managed hybrid backend** as App Router route handlers; the linked Azure Functions backend was retired 2026-07-24 (see Architecture facts).

## Identity and scope

**Identity**: `BTAI-Site` — the public marketing and consulting website for Bridging Trust AI (bridgingtrust.ai). A single Next.js application; one deployable.

**Scope**: the website itself, its `/api/*` route handlers (`app/api/` over `src/lib/api/`), and the Azure infrastructure that hosts them (`infra/main.bicep`). **Out of scope**: the downstream lead-classification pipeline that consumes the queue this site writes to, client engagement material, and the downstream pipeline's own repo. The retired `api/` Functions project was **deleted 2026-07-27** (API-consolidation Phase 5) — if you see it referenced in a plan or doc, that document predates the teardown.

## Commands

**Node: read `.nvmrc`** — deliberately not restated here, because this line said `20.19.1`
while all three Dockerfiles had moved to 20.20 and nothing complained (`.npmrc` sets
`engine-strict=false`, so the mismatch was only a warning). Run `nvm use` (no argument — it
reads `.nvmrc`).

Migrated to **Node 22.22.0** on 2026-07-29 (PLAN-014), off end-of-life Node 20.
**Not Node 24**: Azure Static Web Apps has no `node:24` runtime at all, so building on 24 would
run on a mismatched runtime. Node 22 is EOL 2027-04-30, so this buys ~9 months; the real fix is
SWA shipping `node:24` — watch [Azure/static-web-apps#1724](https://github.com/Azure/static-web-apps/issues/1724).

The version is declared in **seven** places — `.nvmrc`, `package.json` `engines`, three
Dockerfiles, and two `NODE_VERSION` values in `cost-optimized-ci.yml`. Everything else uses
`node-version-file:`, which cannot drift. `__tests__/infra/toolchain-versions.test.ts` fails
if any of the seven disagree, if one floats instead of pinning an exact patch, or if a new
hardcoded declaration appears. Change the version in all seven, or add a `node-version-file:`
reference instead of an eighth literal.

**`NODE_VERSION` in `cost-optimized-ci.yml` sets the RUNTIME too, not just the build.** Proven
2026-07-29 by three preview deploys: `platform.apiRuntime` in `staticwebapp.config.json` is
**completely inert** for hybrid Next.js (a fourth silently-ignored key, alongside
`globalHeaders`, `routes[].headers` and `responseOverrides`) and has been removed. To change the
runtime Node version, change `NODE_VERSION`. Do not re-add `apiRuntime` expecting it to pin
anything.

**The version is not a free choice — Azure's Oryx builder ships a fixed allow-list.**
`20.20.2` is the latest Node 20 LTS and a perfectly real release, and Oryx rejects it:

```
Error: Platform 'nodejs' version '20.20.2' is unsupported.
Oryx has found build steps, but identified unsupported platform versions. Failing build.
```

The build dies *before it starts*, in ~30s. Oryx's newest Node 22 is `22.22.0`, while the newest Node 22 release is `22.23.2` — which Oryx
does **not** carry. Before bumping Node, check the version against Oryx's list — the guard test holds a snapshot taken
from a real failing build, and the authoritative list is whatever the next failure prints.

```bash
npm install
npm run dev:http       # custom HTTP dev server — recommended locally
npm run dev            # same custom server over HTTPS (node server.js)
npm run dev:next       # plain `next dev`, no custom server
npm run build          # next build
npm run build:static   # build skipping dynamic routes (NEXT_PUBLIC_SKIP_DYNAMIC_ROUTES=true)

npm run lint           # next lint  (the CI gate runs `npx eslint . --no-cache`; lint:fix auto-fixes)
npm run type-check     # tsc --noEmit
npm run test           # vitest run — all of __tests__ except __tests__/e2e/
npm run test:unit      # __tests__/components/   |   npm run test:api → __tests__/api/
npm run test:integration   # separate config (vitest.integration.config.js)
npm run test:e2e       # Playwright; testDir is ./e2e. Starts its own server — see Gotchas
npm run test:docker    # run suites in Docker (test:docker:quick) — avoids Rollup platform issues
npm run validate       # FULL pre-push gate → ci/g_master.sh
```

Running one test or one case:

```bash
npx vitest run __tests__/api/contact-handler.test.ts   # single file
npx vitest run __tests__/api -t "rate limit"           # filter by test name
npx vitest __tests__/components/NavBar.test.tsx        # watch mode
npx playwright test e2e/basic.spec.ts --headed
```

A vitest path filter matching **zero** files is silently ignored as long as another filter matches, so a green run does not prove your file ran — check the reported file count. This is why `test:ci-basic` and `test:security` still pass despite both naming the deleted `__tests__/middleware.test.ts`.

`dev`/`dev:http`/`start` run a **custom `server.js`**, not `next dev`. `ci/g_master.sh` runs build → type-check → lint → test → security → deploy-check; skip tests with `./ci/g_master.sh --skip-tests`.

**Cloud CI gates correctness as of PLAN-002.** `.github/workflows/quality-gate.yml` (repo-owned, not a canonical fleet file) runs type-check → `npm run test:coverage` → `next build` on every PR and is a **required status check**. It deliberately runs the whole suite rather than a pinned path list, because a vitest filter matching zero files is silently ignored. A second job, `Quality Gate / e2e`, runs Playwright (chromium, 32 tests including accessibility) against a **production build** and is **also required** as of 2026-07-29 — promoted after the job itself was green 12 of 12 runs. Still _not_ covered in cloud: the security scripts and deploy-check — `npm run validate` locally remains the broader gate.

**Seven required contexts** guard `main`: `Standards Compliance`, `Gate on HIGH / CRITICAL`, the three Trivy scans, `Quality Gate / frontend`, and `Quality Gate / e2e`. The requirement lives in **branch protection, not in the workflow file** — renaming a job without renaming its protection context blocks every PR forever, waiting on a check that can no longer report. `deploy-pr-to-azure` and the Lighthouse step inside it are deliberately **not** required (the former cannot run on Dependabot PRs; the latter is still earning its track record).

### Broken/misleading npm scripts (verified — don't trust them)

- `validate:quick` passes `--quick` to `scripts/validate-before-push.sh`, which parses **no** arguments and runs the full gate anyway. There is no quick mode; use `./ci/g_master.sh --skip-tests`.
- `validate:quick` is the only surviving liar in this list (see above). The former `test:middleware*` entries and their orphaned `pretest` hook are **gone** as of PLAN-005. `test:e2e:dark-mode` **works** — `e2e/dark-mode.spec.ts` exists and `testDir` is `./e2e`, so the old warning about deleted files and a path outside `testDir` was itself stale.

## Architecture facts

Facts a fresh session cannot cheaply derive from the tree:

- **`/api/*` is Next.js route handlers, not Azure Functions.** `app/api/{contact,health,status}/route.ts` are thin adapters over runtime-agnostic domain logic in **`src/lib/api/`** (`contact-handler.ts` is the orchestrator; also `contact-schema`, `cors`, `rate-limit`, `queue-client`, `classify-queue`, `html`, `email/`). Route handlers set `export const dynamic = "force-dynamic"`. `api_location: ""` in CI and there is **no linked backend**.
- **`api/` is gone.** The Azure Functions v4 tree, `func-btai-site-prod` and its plan were all deleted on 2026-07-27, completing Phase 5 of `docs/projects/API-CONSOLIDATION-PLAN-2026-07-24.md`. It had served no traffic since 2026-07-24. **Six of the strategy plans still describe it as the live system** — any document naming `api/src/...` predates the teardown and is describing something that no longer exists. `__tests__/infra/phase5-teardown.test.ts` fails if it returns.
- **Contact flow** (`src/lib/api/contact-handler.ts`): Zod validation → server-side anti-abuse checks (implementation and all tunables live only in the private runbook, never in this public file) → Resend dual delivery (submitter confirmation + admin notification). Non-blocking side-effects: HubSpot contact upsert + note (`src/lib/api/hubspot.ts`) and a versioned JSON message enqueued to an Azure Storage Queue for downstream classification (`src/lib/api/queue-client.ts`, encoded by `queue-encoding.ts`). The Functions output binding is gone — the queue is now reached with a queue-scoped, add-only SAS URL. Sole production caller: `app/components/home/ContactSection.tsx`.
- **Security headers and CSP live in `next.config.js` `headers()`** — _not_ in `staticwebapp.config.json` (see Gotchas). Any CSP edit happens there.
- **Active components live in `app/components/`.** The legacy `src/` component tree was deleted in #60; `src/` now holds **only** `src/lib/` (`api/`, `validation.ts`, `telemetry.ts`, `use-consent.ts`).
- **Path aliases: there is exactly one — `@/*` → repo root** (tsconfig.json). So `@/src/lib/api/...` and `@/lib/...` are the real import forms; there is no `@/components/*` or `@/types/*` mapping. Vitest declares its own narrower aliases (`@/app`, `@/src`, `@/lib`, `@/public`) in `vitest.config.js` — a new top-level alias must be added in **both** files.
- **Two loggers, two layers**: `lib/logger.ts` for app/frontend code, `src/lib/api/log.ts` (`apiLog`) for the API layer — the only sanctioned `console` wrapper, because the managed hybrid backend captures stdout as the interim observability channel. Never use bare `console.log` in production paths.
- **`next-intl` is installed but never wired up.** Every locale served identical English at 200, so `/en`, `/es`, `/fr` and their sub-pages now 301 to canonical top-level paths. Canonical pages are `app/terms/`, `app/privacy/`, `app/product-terms/`, `app/engagement-terms/`; near-identical copies still exist under `app/[locale]/` (both render the same components from `app/components/legal/`).
- Single-page marketing site (anchor-nav sections). `/about`, `/solutions` and `/contact` 301 to homepage anchors even though `app/about/page.tsx`, `app/solutions/page.tsx` and `app/contact/page.tsx` still exist — those files are **shadowed by the redirects and unreachable in production**, so editing them changes nothing users see. Dark mode is class-based via `next-themes`. ESM throughout (`"type": "module"`).

## Gotchas

Incident-derived; each has burned someone. WRONG/CORRECT where it helps.

### The SWA hybrid adapter honours only part of `staticwebapp.config.json`

- **WORKS**: `routes[].redirect` — the anchor and locale 301s. Keep them there.
- **IGNORED**: `globalHeaders`, `routes[].headers`, `responseOverrides`. All three were present and silently did nothing; the site served **zero security headers** as a result. They were removed rather than left as a decoy.
- Response headers now come from `next.config.js` `headers()`. Conversely, `next.config.js` `redirects()` is ignored by the adapter **and broke the entire route map** when tried on 2026-07-23 — redirects stay in `staticwebapp.config.json`.

### No middleware runs at all

Next.js resolves middleware only from the project root (or `src/`). **This repo has no middleware at all** — there is no root `middleware.ts`, and the `app/middleware.ts` that used to sit here was deleted in PR #70 along with the `lib/nonce.ts` it existed to support. Next.js never loaded it, so its CSP-nonce logic had never once executed.

- WRONG: add CSP/nonce logic under `app/` — Next.js ignores middleware there, and the file will look authoritative while doing nothing. That decoy cost real debugging time before it was removed.
- CORRECT: security headers → `next.config.js`; redirects → `staticwebapp.config.json`. The live CSP needs `'unsafe-inline'` for scripts and styles precisely because that nonce path never ran. Reinstating nonces means a **root** `middleware.ts` plus a matching CSP change, not a file under `app/`.

### Tailwind v4 — all custom CSS must be in `@layer` blocks

In CSS cascade layers, unlayered CSS beats layered CSS regardless of specificity. Tailwind v4 puts every utility in `@layer utilities`, so any unlayered rule silently overrides all utilities (this once killed `mx-auto`, `px-6`, `rounded-lg`, and every responsive variant).

```css
/* WRONG — overrides ALL Tailwind utilities */
* {
  margin: 0;
  padding: 0;
}
section {
  padding-top: 4rem;
}
/* CORRECT — layered, so utilities still win */
@layer base {
  section {
    padding-top: 4rem;
  }
}
```

### Tailwind v4 — use `@import "tailwindcss"`, and there is no config file

The v3 directives (`@tailwind base/utilities/components`) partially work but **silently skip every responsive variant** — zero `sm:`/`md:`/`lg:` rules get generated. `app/globals.css` correctly uses the unified `@import "tailwindcss"`; theme values live in its `@theme` block (e.g. `--color-primary`). A `tailwind.config.cjs` used to sit at the repo root duplicating those colours; it was **inert** — v4 reads a JS config only when an explicit `@config` directive points at it, and none existed — so it was deleted. Do not add one back expecting it to take effect: without `@config` it is decoration, and a second copy of the palette that silently disagrees with `@theme` is worse than none.

### Exactly one `<html>`/`<body>`, and inline-only error boundaries

Only `app/layout.tsx` renders `<html>`/`<body>`. `app/[locale]/layout.tsx` **must** stay a pass-through (`<>{children}</>`) — nested HTML tags cause hydration failure that trips the error boundary and blanks the whole site. `app/error.tsx` and `app/[locale]/error.tsx` use **inline styles only**, never Tailwind classes, so they still render when CSS fails to load. That layout also pins `dynamicParams = false` and 404s unsupported locales: without it the `[locale]` segment matched any single path segment, serving the full homepage at `/banana` with a 200.

### User input reaching HTML must be escaped at the sink (PLAN-001)

Every user-controlled string in the two Resend templates and the HubSpot note body goes
through `escapeHtml` from `src/lib/api/html.ts`. Do **not** move this into the Zod schema —
input sanitization mangles legitimate messages and leaves the next sink unprotected.
`ipAddress` and `userAgent` are header-derived and never touch Zod, so they are the most
attacker-controlled values in the admin email.

- `escapeHtmlMultiline` (adds `<br />`) belongs **only** in the confirmation template. The
  admin template's `.message-content` is `white-space: pre-wrap`, so newlines already
  render there and `<br />` would double every line break.
- Do not assert `not.toContain("onerror=")` in a test — escaped payloads survive as inert
  text and that assertion fails against a _correct_ fix. `__tests__/api/email-template-injection.test.ts`
  parses the HTML and asserts structurally instead.

### E2E: never point it at a port you did not start (PLAN-013)

`e2e/` holds **160 Playwright tests** across 3 specs (`basic`, `dark-mode`, `a11y`) and 5
browser projects. CI runs `Quality Gate / e2e` (chromium only, 32 tests) against a **production
build**, and it is a **required check** as of 2026-07-29.

It shipped advisory and was promoted on 12 green runs — which then **failed on the next PR**,
because those 12 had been passing with a wait that did nothing. See the animation note below;
the lesson is that counting green runs proves nothing until you know the mechanism ran.

The config takes two env knobs, both unset by default:

```bash
npx playwright test                       # 5 browsers, dev server on :3000
E2E_PORT=3100 npx playwright test         # when :3000 is taken (it often is)
E2E_BASE_URL=https://… npx playwright test  # a deployed origin; starts no server
```

**Why the port is a knob and `reuseExistingServer` is hard-`false`.** The old config used
`url:` + `reuseExistingServer: !process.env.CI`, which polls until *anything* returns 200.
On a machine where port 3000 belonged to an unrelated container, the whole suite ran
against that application and reported `Expected /Bridging Trust AI/, Received "Sign in |
Langfuse"` — a foreign login page, presented as a homepage regression. It now uses `port:`,
so Playwright **refuses to start** on an occupied port, and `e2e/basic.spec.ts` opens with a
target-identity test that names the misconfiguration if it ever happens again.

- **CI builds and serves production** (`npm run build && npm run start`); locally it is the
  dev server. Not interchangeable — see the CSP note below.
- Assert behaviour, not Tailwind class strings. The old dark-mode spec asserted
  `dark:bg-gray-900/98` (the class is `dark:bg-gray-900`) and a two-icon DOM `ThemeToggle`
  does not render — it swaps one `<svg>` via a ternary. Five of its tests also ended in
  `expect(typeof isDark).toBe("boolean")`, which is true for every value.
- The hero animates word by word, so its `h1` has **no whitespace between words** in the
  DOM. Compare with spaces stripped.
- NavBar's Contact link `preventDefault()`s and scrolls itself, so the URL fragment never
  changes; assert `toBeInViewport()`. Below `md` the links sit behind a "Toggle menu"
  button and are not rendered at all.

### Published legal copy must match what actually loads

The privacy policy claimed "We use Google Analytics" and listed it as a third-party service.
**Nothing had loaded Google Analytics for some time**, while Cloudflare — which serves every
apex request and injects an analytics beacon — went unmentioned. Wrong in both directions at
once; the under-disclosure is the half that matters.

`__tests__/privacy-disclosure.test.ts` uses the CSP as the machine-readable answer to "who
may receive data from this page" and fails if the prose disagrees: naming Cloudflare is
required while the beacon is allow-listed, and claiming Google Analytics is forbidden while
no code calls `gtag`/`dataLayer`. A CSP *allowance* is permission, not usage — the GA hosts
stay allow-listed as pre-approval for deferred work, and that alone is not evidence of use.

### `next dev` and `next build` share `.next`

Running the E2E suite locally (which starts `dev:http`) replaces the production build id, so
a later `npm run start` dies with *"Could not find a production build"*. Rebuild before
serving production locally.

### `server.js` reports a port it may not be listening on

`HTTP_PORT` is what the startup banner prints (`Using HTTP port: 3100…`), but the HTTP-only
branch — the one you get whenever SSL certificates are absent, and always under `dev:http`
— calls `server.listen(port)`, where `port` comes from **`PORT`**. Set only `HTTP_PORT` and
it announces 3100 while serving 3000. `HTTP_PORT`/`HTTPS_PORT` are read only by the
dual-server branch that runs when certificates exist. **Set `PORT`**, and set all three if
you want the log to agree with reality.

Related: a stray 141-byte `package-lock.json` in `$HOME` makes Next.js infer the wrong
workspace root (`⚠ Next.js inferred your workspace root… selected /Users/<you>/`). Harmless
for `next dev`, but it governs `outputFileTracingRoot`. Delete it or set that option.

### The dev server needs `'unsafe-eval'`; production must never have it

Next's dev bundler wraps modules in `eval()`. Under the shipped CSP the browser refuses all
of it, and `npm run dev` renders server HTML and then **never hydrates** — theme toggle
stuck on its pre-mount placeholder, hero absent, nothing interactive, one console line as
the only symptom. `next.config.js` therefore grants `'unsafe-eval'` when
`NODE_ENV === "development"`.

The gate must stay `=== "development"`, never `!== "production"`: vitest runs under
`NODE_ENV=test`, so the looser form hands the relaxation to the test environment and the
`never allows unsafe-eval` assertion goes on passing against a policy no browser sees.
`__tests__/security-headers.test.ts` asserts both directions.

### Performance: measure a deployed origin, never localhost

`lighthouserc.json` + an advisory `lhci` step in `deploy-pr-to-azure` (the only job that
knows the preview URL). Measured **2026-07-30**, desktop preset, 3 runs each:

| Target | Perf | Best prac. | SEO | TBT |
| --- | --- | --- | --- | --- |
| local `npm run start` | **100** | 100 | 100 | 0 ms |
| SWA origin (same code as apex) | **97** | 100 | 100 | 0 ms |
| apex `bridgingtrust.ai` | **81** (81–86) | **81** | **92** | **293 ms** |

- **A localhost gate is worthless here** — perfect 100 while real users get 81. The config
  pins no URL and a guard test fails if one is added.
- **The app meets "Perf ≥ 90"; the deployment does not.** Same build, 97 vs 81, and a
  **byte-identical CSP header** on both. The apex is behind **Cloudflare**; the SWA origin
  is not.
- **Attribute from per-audit source locations, never from the category score.** Doing the
  latter is how one identified cause gets credited with an entire aggregate — it happened
  here. best-practices 74 was recorded as "one console error, the blocked Web Analytics
  beacon"; allow-listing it in #89 was correct and bought **7 points, not 26**. The
  remaining deficit was a different Cloudflare feature all along. Points must add up before
  a cause is named.
- **Today's split** (best-practices is scored out of weight 27, so 1 weight = 3.7 points):
  - **`deprecations`, weight 5 = 18.5 pts, fails 6/6 runs.** All three entries
    (`SharedStorage`, `StorageType.persistent`, `Fledge`) carry a `sourceCodeLocation` of
    `/cdn-cgi/challenge-platform/scripts/jsd/main.js` — Bot Management's JS Detections.
  - **Performance −16 is that same one file**: 750 ms script evaluation, one 375 ms long
    task. Nothing else on the page evaluates for more than 25 ms. It is served from **this
    site's own origin**, so `script-src 'self'` already permits it and **no CSP change can
    affect it**; only a Cloudflare dashboard setting can.
  - **`inspector-issues`, 3.7 pts, fails 1/6 runs — cause deliberately not established.**
    It reports a "Content security policy" issue, but six positive-controlled browser loads
    found **zero** real CSP violations, and a specific `static.cloudflareinsights.com`
    `connect-src` hypothesis was *refuted*. Edge-related; beyond that, unknown.
  - SEO 92 is Cloudflare merging an AI-crawler policy into `robots.txt` that Lighthouse
    rejects as invalid. Your own `Allow: /` and `Sitemap:` survive inside it, and the policy
    is **deliberate and being kept**.
- **The JS Detections cost recurs about every 15 minutes** — measured, because two sources
  disagreed and the wrong one was more convenient. Same browser profile: cold → **3**
  requests to `/cdn-cgi/challenge-platform/`, +10 s → **0**, **+17 min → 5**. Cloudflare's
  docs (15-minute session, re-injected before expiry) are right; the **365-day
  `cf_clearance` expiry is a red herring** — it answers "how long is this cookie valid",
  not "how long until JSD re-injects". Reasoning from the cookie would have understated the
  cost enormously. So: further page views inside a session are free, but the first load of
  essentially every visit pays. Lighthouse always runs cold, so it always pays full price.
- **Apex Core Web Vitals still pass** — LCP 1.2 s, CLS 0, FCP 0.6 s. The damage is
  concentrated in TBT, a lab metric carrying the single heaviest score weight (30). The
  score is worse than the experience; weigh that before trading security for it.
- **Measure it with `scripts/measure-cloudflare-cost.sh`**, which compares the apex against
  the SWA origin serving the identical build — accessibility scores 100 on both, which is
  what proves the difference is the edge and not the app. **Check `JSD_ONLY=1` first**: JSD
  injection is a byte in the HTML, so it answers yes/no in one request, and it exits `2` for
  "could not tell" rather than folding a fetch failure into "not present". The apex scores
  are **not deterministic** — single runs have swung 64→86 on unchanged code, so use
  `RUNS=3`+ and compare ranges, not points.
- **There are no Cloudflare credentials in this repo or environment**, and the available
  lever depends on the zone's plan: on **Free**, Bot Fight Mode makes JS Detections
  mandatory and runs *outside* the Ruleset Engine, so it cannot be skipped by WAF custom
  rules or Page Rules nor scoped to paths; on **Pro/Business** it is a separate optional
  toggle. The decision is written up in
  `docs/strategy/plans/PLAN-015-cloudflare-bot-management.md`. Do not point the gate at the
  apex until it is resolved.
- The previous `lighthouserc.js` was dead three ways — `module.exports` in an ESM package so
  it could not load, every assertion `"warn"` so it could not fail, and `url` plus
  `staticDistDir` together. `__tests__/infra/lighthouse-config.test.ts` guards all three, and
  the `@lhci/cli` version pinned in two places.

### Accessibility: colours are load-bearing, and scans must wait for animation

`e2e/a11y.spec.ts` runs axe over the homepage, the four canonical legal pages, and the
homepage in dark mode. The bar is **zero `critical` and zero `serious`**; `moderate`/`minor`
are printed on failure but do not fail the run. axe catches roughly a third of WCAG issues —
green here is not "accessible", and the spec says so.

- **Text contrast is why `#3A5F77` exists.** The brand `#5B90B0` is 3.46:1 on white and
  fails AA, so `#3A5F77` (6.81:1) is the *text and button* tone and `#5B90B0` is kept for
  decorative accents and dark-mode text, where it is fine. Hovers go to `#2C4A5E`. Do not
  "restore the brand colour" on text without re-running the a11y spec.
- **Never scan on `networkidle`, and never *wait* for animations here — freeze them.** This
  page has animations that **never end**: probed on a production build, 7 were still running at
  2.5 s (an infinite `hero-aurora` background pan and `mix-blend-screen` blobs) and 14 elements
  held a permanently fractional inline opacity. Any "wait until everything settles" loop
  therefore runs to its timeout and proceeds anyway — a wait that does nothing while looking
  like a guard. Two versions of `settleAndFreeze()` did exactly that, and the second one is why
  a newly-required check failed on the next PR.

  Three approaches that look sufficient and are not: `emulateMedia({ reducedMotion })` (Framer
  Motion keeps opacity fades by design), a `transition: none` stylesheet (cannot stop
  script-driven animation), and waiting on inline opacity (some never settle). Only
  `document.getAnimations()` covers CSS animations, CSS transitions **and** the Web Animations
  API that Motion uses. `settleAndFreeze()` waits for hydration, then pins every animation's
  `currentTime` to 0 and pauses it — pinning matters, or the frozen frame is arbitrary and it
  stays flaky. A captured mid-fade failure read `#192736 on #1a2937, 1.02:1`.

### PR preview deploys used to leak staging environments (fixed 2026-07-29)

`cleanup-pr` **raced the deploy it was cleaning up after**: on a merge, the `closed` event's
cleanup could finish *before* the still-in-flight push deploy created the environment, so the
environment was orphaned and the cleanup exited green. Ten accumulated, the Static Web App hit
its cap, and `deploy-pr-to-azure` then failed with *"already has the maximum number of staging
environments"* — on unrelated PRs, usually docs-only. **The symptom appeared nowhere near the
cause**, which is why it went unexplained long enough to matter.

Fixed by ordering, not retrying: `cleanup-pr` now waits for every in-flight run of its workflow
on that branch before closing. If it ever recurs, clear it with
`az staticwebapp environment list/delete` (the environment name is the PR number;
**never delete `default`** — that is production).

Two notes for anyone editing that job. It needs `actions: read`; without it the run query
returns nothing, the wait sees "0 in flight" and closes immediately, silently restoring the
race. And `gh api --jq` prints its **error body to stdout** on a 404 while also exiting
non-zero, so `|| echo 0` yields a non-numeric string that makes `[ "$n" -eq 0 ]` error rather
than match — the loop then spins its full budget. Treat "query failed" and "zero in flight" as
different states.

### Dependabot never ran here until 2026-07-29

`.github/dependabot.yml` failed schema validation from the repository's **first commit
(2025-05-25)** until it was fixed — fourteen months, **0 Dependabot PRs against 88 total**. One
unknown key (`security-updates-only`) did it. Three things kept it invisible, each worth
remembering separately:

1. **A config that fails to parse is ignored *entirely*** — the valid `github-actions` and
   `docker` entries never ran either.
2. **Validation is server-side and only reports on the merge commit** that *changes the file*.
   One red check, once; every commit after looked clean. There is **no local validator** —
   `__tests__/infra/dependabot-config.test.ts` approximates the schema and is the only
   pre-merge signal.
3. **Two adjacent mechanisms looked like coverage.** `dependabot-security.yml` is gated on
   `github.actor == 'dependabot[bot]'`, an actor that had never opened a PR; `security-scan.yml`
   runs Trivy, which *finds* vulnerabilities but updates nothing.

Vulnerability alerts were also **disabled at the repo level** and are now on. Of 69 open alerts
only **2 were production-scope** (both `next-intl`, since removed) — so quote the runtime-scope
number, not the total. Automatic security-update PRs remain **off**; that is a review-load
decision, not an oversight.

`ignore` rules are **per-ecosystem**. The npm entry ignores majors; docker ignores `node`
majors specifically, because Dependabot proposed `node:26.5-slim` — four majors past a version
CLAUDE.md documents as breaking. `github-actions` majors are deliberately *not* suppressed.

### Dependabot PRs cannot run the preview deploy

`deploy-pr-to-azure` skips `github.actor == 'dependabot[bot]'` because it **cannot succeed**
there: Dependabot-triggered runs read a separate secret store with no
`AZURE_STATIC_WEB_APPS_API_TOKEN_*`, and the job fails in ~40 s with `deployment_token was not
provided`. The guard keys on `github.actor` (who *triggered* the run), not on the PR author —
so when a human runs `gh pr update-branch` on a Dependabot PR the actor changes, secrets
resolve, and the deploy correctly runs.

### Testing route handlers: two harness traps (PLAN-007)

- `vitest.setup.js` mocks `next/server`. It used to share **one** module-scope `Map` across every response, ignore `init.headers`, and expose `NextResponse` without a constructor — so header assertions read an empty Map and `new NextResponse(...)` could not be built. It is now faithful (per-instance `Headers`, honoured `init`, `json`/`text`). If you extend it, keep it per-instance.
- `origin` is a **forbidden header name**: `new Request(url, { headers: { origin } })` silently drops it, so CORS assertions read `null` no matter what the handler does. Build a request stub (`{ method, headers: new Headers(...), json: async () => body }`) instead — route handlers only touch those.

### `context.log` binding trap (PR #13)

Never pass a logger method as a bare callback into another module — the `this`-binding is lost and calls throw silently inside non-blocking try/catch. Arrow-wrap it: `(msg, meta) => context.log(msg, meta)`. Originally an Azure Functions `context.log` incident; the same hazard applies to any method passed by reference across the API seam.

### Coverage only counts `app/components/**`

`vitest.config.js` sets `coverage.include` to `app/components/**` only, with `all: false`. Tests you add for `src/lib/api/**` — the most logic-heavy code in the repo, and the whole `/api/*` implementation — earn **no** coverage credit and cannot lift the thresholds. Thresholds are 70/60/70/70 locally and 30/20/30/30 in CI (lines/branches/functions/statements). Widening the include list is PLAN-005's call; until then, do not read a passing coverage gate as evidence the API layer is tested.

### CI concurrency groups (PR #14, #18)

Concurrency groups must key on **both** `${{ github.workflow }}` and `${{ github.event_name }}`. Sharing a group across workflows caused Standards Check and SWA Deployment to cancel each other; omitting `event_name` cancelled the merge run when `push` and `pull_request: closed` fired together.

## Deployment

- **Platform**: Azure Static Web Apps, Oryx hybrid build via `.github/workflows/cost-optimized-ci.yml`. One deployable, one deploy job, no linked backend (`api_location: ""`).
- Do **NOT** set `skip_app_build: true`. `.npmrc` sets `engine-strict=false` for Oryx compatibility. `images.unoptimized: true` (`next.config.js`) is required for SWA.
- **API response shapes are a CI contract.** Post-deploy verification polls `/api/health` for `"status"` on the SWA origin _or_ the apex, then POSTs an invalid payload to `/api/contact` expecting a JSON **400**. Changing either shape breaks the deploy gate and the incident tooling that greps them.
- PR previews deploy with `PREVIEW_BUILD=true` baked in at build time, which makes `/api/contact` skip real email/HubSpot/queue side effects (host headers alone were unreliable for detecting previews).
- Pages that must be statically prerendered live under `app/[locale]/` and get `generateStaticParams` treatment; the canonical legal pages are also top-level routes.
- **Infra is owned by `infra/main.bicep`** (+ `infra/parameters.prod.json`) — do not restate the topology here; read the Bicep. Storage, Key Vault and the Function App still exist pending Phase 5 teardown.
- **On withholding Azure resource names**: this file does not name them, but that is convention, not a control. `infra/main.bicep` and two `scripts/*.sh` name them by construction in this **public** repo, so the topology is already published and scrubbing prose would be theatre. Treat resource names as public and rely on the actual controls — Key Vault + managed identity, and a queue-scoped add-only SAS. What must **never** land here: credential values, Key Vault secret _values_, 1Password vault/item names, private LAN addresses, and anti-abuse thresholds.
- **Prod secrets are literal Static Web App settings, and Key Vault is not available for them.** SWA supports `@Microsoft.KeyVault()` references **only for custom authentication config** — the managed backend serving `/api/*` does not resolve them (Microsoft documents that SWA's serverless functions "do not support direct Key Vault integration"; see Azure/static-web-apps#1090, #1091, #428). Setting `RESEND_API_KEY` to a reference would hand the runtime that literal string and break every email send. `kv-btai-site-prod` exists but nothing reads it; it was the retired Functions app's mechanism. **The real controls** are Azure RBAC on the SWA resource, a queue-scoped add-only SAS, and rotation. `infra/swa-settings.contract.json` is authoritative; do not reopen this as "move the secrets to Key Vault".
- **Performance budgets** (no regression vs `main` for changed pages): LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms, Perf ≥ 90. Check bundle size with `ANALYZE=true npm run build`.

## Environment variables

**`infra/swa-settings.contract.json` is authoritative** for what production actually has, and `__tests__/infra/swa-settings.test.ts` fails if this list and the code's `process.env` usage diverge in either direction. Do not restate the contract here — the list below is orientation. Prod values are **literal Static Web App settings, not Key Vault references** (see Deployment); for local email testing put the Resend/EMAIL vars in `.env.local`.

- **App (frontend/SSR)**: `NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING`, `NEXT_PUBLIC_APP_URL`, `LOG_ENDPOINT`.
- **Email**: `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`, `EMAIL_ADMIN`, `EMAIL_REPLY_TO`, and `EMAIL_TEST_MODE` (preferred) or `RESEND_TEST_MODE` (legacy, still honoured).
- **API side-effects**: `HUBSPOT_TOKEN`, `HUBSPOT_PORTAL_ID`, `CLASSIFY_QUEUE_SAS_URL` (queue-scoped, add-only).
- **Build knobs** (`next.config.js`): `NEXT_PUBLIC_SKIP_DYNAMIC_ROUTES`, `NEXT_PUBLIC_DIST_DIR`, `PREVIEW_BUILD`.
- No longer read by any code, despite older docs: `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_USE_CALENDLY`. Analytics hosts are pre-allowed in the CSP but nothing loads them.

## Standards

Follows the Herculean Ecosystem Standards (NONAGENT variant) — see `STANDARDS.md` header for the current version. STANDARDS.md takes precedence on any conflicting guidance.

- **Pre-commit**: Husky + lint-staged runs ESLint fix and affected tests (in Docker) on staged files; `.pre-commit-config.yaml` also blocks staging `.env*` (`no-dot-env` hook) — resolve by unstaging, not bypassing.
- **Secrets**: 1Password via `.env.1p.template` (`op://` refs) locally; Azure Key Vault in prod.
- **Coverage ratchet**: CI floors must never drop vs `main` for touched packages (see the coverage gotcha for what is actually measured).
- `.cursor/rules/master-coding-rules.mdc` overlaps this file — **CLAUDE.md is authoritative for Claude Code**.

## Key docs / paths

- `next.config.js` — CSP + security headers (authoritative).
- `staticwebapp.config.json` — production redirects (authoritative); its header sections are deliberately absent.
- `docs/projects/API-CONSOLIDATION-PLAN-2026-07-24.md` — why `/api/*` moved off Functions, and the open Phase 5 teardown.
- `infra/main.bicep` — IaC; owns all Azure topology and resource names.
- `docs/adr/NNNN-title.md` — architecture decision records.
- `STANDARDS.md` — NONAGENT standards baseline.
- `README.md` — onboarding entry point; `testing.md` — test suite layout. Both reconciled against the code on 2026-07-26 and now cite this file rather than restating architecture.
- `docs/*.md` outside `adr/` and `projects/` are **dated historical records** (migration logs, incident notes, old email-function results), not current guidance. Several still describe the retired Functions backend and the deleted `src/uitests/` suite. Where they conflict with this file, this file wins.
