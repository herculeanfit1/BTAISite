# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Bridging Trust AI marketing/consulting site — Next.js 15.5 (App Router) + React 19 + TypeScript 5 (strict) + Tailwind CSS v4, deployed on **Azure Static Web Apps**. `/api/*` is served by the SWA **managed hybrid backend** as App Router route handlers; the linked Azure Functions backend was retired 2026-07-24 (see Architecture facts).

## Identity and scope

**Identity**: `BTAI-Site` — the public marketing and consulting website for Bridging Trust AI (bridgingtrust.ai). A single Next.js application; one deployable.

**Scope**: the website itself, its `/api/*` route handlers (`app/api/` over `src/lib/api/`), and the Azure infrastructure that hosts them (`infra/main.bicep`). **Out of scope**: the downstream lead-classification pipeline that consumes the queue this site writes to, client engagement material, and the retired `api/` Functions project (dead code pending teardown — do not edit).

## Commands

Node **20.19.1** is required and pinned in `.nvmrc` / `engines` — 18.x is incompatible and 23.x breaks the build. Start every session with `nvm use 20`.

```bash
npm install
npm run dev:http       # custom HTTP dev server — recommended locally
npm run dev            # same custom server over HTTPS (node server.js)
npm run dev:next       # plain `next dev`, no custom server
npm run build          # next build
npm run build:static   # build skipping dynamic routes (NEXT_PUBLIC_SKIP_DYNAMIC_ROUTES=true)

npm run lint           # next lint  (the CI gate runs `npx eslint . --no-cache`; lint:fix auto-fixes)
npm run type-check     # tsc --noEmit — root project only; `api/` is excluded
npm run test           # vitest run — all of __tests__ except __tests__/e2e/
npm run test:unit      # __tests__/components/   |   npm run test:api → __tests__/api/
npm run test:integration   # separate config (vitest.integration.config.js)
npm run test:e2e       # Playwright; testDir is ./e2e — needs a server on :3000
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

**Cloud CI gates correctness as of PLAN-002.** `.github/workflows/quality-gate.yml` (repo-owned, not a canonical fleet file) runs type-check → `npm run test:coverage` → `next build` on every PR and is a **required status check**. It deliberately runs the whole suite rather than a pinned path list, because a vitest filter matching zero files is silently ignored. Still _not_ covered in cloud: Playwright/E2E, the security scripts, and deploy-check — `npm run validate` locally remains the broader gate.

### Broken/misleading npm scripts (verified — don't trust them)

- `validate:quick` passes `--quick` to `scripts/validate-before-push.sh`, which parses **no** arguments and runs the full gate anyway. There is no quick mode; use `./ci/g_master.sh --skip-tests`.
- `test:middleware` **does not exist** (only the orphaned `pretest:middleware` hook does). `test:middleware:coverage` and `test:e2e:dark-mode` both point at deleted files and exit 1 — the latter also targets a path outside Playwright's `testDir`.

## Architecture facts

Facts a fresh session cannot cheaply derive from the tree:

- **`/api/*` is Next.js route handlers, not Azure Functions.** `app/api/{contact,health,status}/route.ts` are thin adapters over runtime-agnostic domain logic in **`src/lib/api/`** (`contact-handler.ts` is the orchestrator; also `contact-schema`, `cors`, `rate-limit`, `queue-client`, `classify-queue`, `html`, `email/`). Route handlers set `export const dynamic = "force-dynamic"`. `api_location: ""` in CI and there is **no linked backend**.
- **`api/` (Azure Functions v4) is dead code awaiting teardown.** It is still tracked and still has its own tsconfig + esbuild, but nothing deploys it — the `deploy-functions` job was retired in #55. Do not "fix" bugs there or port changes into it; edit `src/lib/api/` instead. Deleting `api/` plus its Azure resources is the unfinished Phase 5 of `docs/projects/API-CONSOLIDATION-PLAN-2026-07-24.md`.
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

### Root tsconfig must exclude `api/` (PR #16)

`api/` is a separate TS project. If it is missing from the root `exclude` array, `next build` tries to type-check Azure Functions code and fails on missing `@azure/functions` types.

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
- **Prod secrets**: Azure Key Vault via system-assigned managed identity, referenced with `@Microsoft.KeyVault()` — never plain-text in app settings.
- **Performance budgets** (no regression vs `main` for changed pages): LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms, Perf ≥ 90. Check bundle size with `ANALYZE=true npm run build`.

## Environment variables

The contract the code actually reads (audited via `grep -rE process\.env` over `app/ src/ lib/ api/` + `next.config.js`). Prod values come from Key Vault; for local email testing put the Resend/EMAIL vars in `.env.local`.

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
