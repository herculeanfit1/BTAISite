# CLAUDE.md

Bridging Trust AI marketing/consulting site — Next.js 15.4 (App Router) + React 19 + TypeScript 5 (strict) + Tailwind CSS v4, deployed on **Azure Static Web Apps** with a linked **Azure Functions** backend (contact form via Resend).

## Commands

Node **20.19.1** is required and pinned in `.nvmrc` / `engines` — 18.x is incompatible and 23.x breaks the build. Start every session with `nvm use 20`.

```bash
npm install
npm run dev            # custom HTTPS dev server (node server.js)
npm run dev:http       # custom HTTP dev server — recommended locally
npm run dev:next       # plain `next dev`, no custom server
npm run build          # next build
npm run build:static   # build skipping dynamic routes (NEXT_PUBLIC_SKIP_DYNAMIC_ROUTES=true)

npm run lint           # next lint   (lint:fix auto-fixes)
npm run type-check     # tsc --noEmit
npm run test           # vitest run — all unit tests
npm run test:api       # scoped vitest suites: also test:integration, test:middleware, test:e2e (Playwright)
npm run test:docker    # run suites in Docker (test:docker:quick) — avoids Rollup platform issues
npm run validate       # ./scripts/validate-before-push.sh — FULL pre-push gate (validate:quick = --quick)
```

`dev`/`dev:http`/`start` run a **custom `server.js`**, not `next dev`. CI in the cloud is deploy-only and does not re-run these checks — `npm run validate` locally is the gate (`ci/g_master.sh` orchestrates the same quality gates).

## Architecture facts

Facts a fresh session cannot cheaply derive from the tree:

- **Active components live in `app/components/`.** `src/components/` holds legacy/dead copies — always check which one is imported before editing.
- **Path aliases point into `src/`, not `app/`.** `@/*` → repo root; `@/components/*` → `src/components/`, `@/lib/*` → `src/lib/`, `@/types/*` → `src/types/` (tsconfig.json). Because the active components are in `app/components/`, importing `@/components/...` may resolve to the dead legacy copy.
- **`api/` is a separate TypeScript project** (Azure Functions v4, its own tsconfig + esbuild → `dist/index.js`, ESM/Node). The root tsconfig **must** exclude `api/` (see Gotchas). Functions: contact, newsletter, status, cspReport, health; all `/api/*` requests are proxied to Functions via the SWA linked backend.
- **Contact API** (`api/src/functions/contact.ts`): Zod validation → server-side anti-abuse checks (implementation and all tunables live only in the private runbook, never in this public file) → Resend dual delivery (user confirmation + admin notification). Non-blocking side-effects: HubSpot contact upsert + note (`api/src/lib/hubspot.ts`) and a versioned JSON message enqueued to an Azure Storage Queue for downstream classification (`api/src/lib/classify-queue.ts`).
- **Production security headers/CSP are owned by `staticwebapp.config.json` `globalHeaders`** — not by any middleware (see Gotchas).
- Single-page marketing site (anchor-nav sections). Dark mode is class-based via `next-themes`. ESM throughout (`"type": "module"`). Tailwind v4 has **no `tailwind.config.js`** — theme values live in the `@theme` block in `globals.css`. Use `logger` (`src/lib/logger.ts`), not `console.log`, in production paths.

## Gotchas

Incident-derived; each has burned someone. WRONG/CORRECT where it helps.

### Middleware: only the ROOT `middleware.ts` runs
Next.js resolves middleware **only** from the project root (or `src/`). A file at `app/middleware.ts` is **never executed** — editing its CSP/nonce logic changes nothing in dev or prod.
- WRONG: treat `app/middleware.ts` as the source of CSP nonces + security headers (it is dead code — a leftover hybrid experiment; Next.js ignores middleware under `app/`).
- CORRECT: `./middleware.ts` at the repo root is the real entry point, and it is **minimal** — it only sets `X-Development-Mode` on `/` in dev. Production CSP + all security headers come from `staticwebapp.config.json` `globalHeaders`.

### Tailwind v4 — all custom CSS must be in `@layer` blocks
In CSS cascade layers, unlayered CSS beats layered CSS regardless of specificity. Tailwind v4 puts every utility in `@layer utilities`, so any unlayered rule silently overrides all utilities (this once killed `mx-auto`, `px-6`, `rounded-lg`, and every responsive variant).
```css
/* WRONG — overrides ALL Tailwind utilities */
* { margin: 0; padding: 0; }
section { padding-top: 4rem; }
/* CORRECT — layered, so utilities still win */
@layer base { section { padding-top: 4rem; } }
```

### Tailwind v4 — use `@import "tailwindcss"`, not v3 directives
The v3 directives (`@tailwind base/utilities/components`) partially work but **silently skip every responsive variant** — zero `sm:`/`md:`/`lg:` rules get generated. Always use the unified `@import "tailwindcss"`.

### Exactly one `<html>`/`<body>`, and inline-only error boundaries
Only `app/layout.tsx` renders `<html>`/`<body>`. `app/[locale]/layout.tsx` **must** stay a pass-through (`<>{children}</>`) — nested HTML tags cause hydration failure that trips the error boundary and blanks the whole site. `app/error.tsx` and `app/[locale]/error.tsx` use **inline styles only**, never Tailwind classes, so they still render when CSS fails to load.

### Root tsconfig must exclude `api/` (PR #16)
`api/` is a separate TS project. If it is missing from the root `exclude` array, `next build` tries to type-check Azure Functions code and fails on missing `@azure/functions` types.

### `context.log` binding trap (PR #13)
Never pass `context.log` as a bare callback into another module — the `this`-binding is lost and calls throw silently inside non-blocking try/catch. Arrow-wrap it: `(msg, meta) => context.log(msg, meta)`.

### CI concurrency groups (PR #14, #18)
Concurrency groups must key on **both** `${{ github.workflow }}` and `${{ github.event_name }}`. Sharing a group across workflows caused Standards Check and SWA Deployment to cancel each other; omitting `event_name` cancelled the merge run when `push` and `pull_request: closed` fired together.

## Deployment

- **Platform**: Azure Static Web Apps + linked Azure Functions backend. SWA build is Oryx hybrid via `.github/workflows/cost-optimized-ci.yml`.
- Do **NOT** set `skip_app_build: true`. `.npmrc` sets `engine-strict=false` for Oryx compatibility. `images.unoptimized: true` (`next.config.js`) is required for SWA.
- Pages **must** live under `app/[locale]/` so SWA's hybrid adapter resolves them via `generateStaticParams`.
- Functions deploy via `func azure functionapp publish` or the `deploy-functions` GitHub Actions job.
- **Infra is owned by `infra/main.bicep`** (Functions, Storage, Key Vault, App Insights, SWA linked backend) + `infra/parameters.prod.json` — do not restate the topology here. Azure resource names and Key Vault secret names are withheld from this public file (see the private runbook / 1Password vault).
- **Prod secrets**: Azure Key Vault via system-assigned managed identity, referenced with `@Microsoft.KeyVault()` — never plain-text in app settings.
- **Performance budgets** (no regression vs `main` for changed pages): LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms, Perf ≥ 90. Check bundle size with `ANALYZE=true npm run build`.

## Environment variables

The contract the code actually reads (audited via `grep -rE process\.env` over `app/ src/ lib/ api/`). Prod values come from Key Vault; for local email testing put the Resend/EMAIL vars in `.env.local`.

- **App (frontend/SSR)**: `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_USE_CALENDLY`, `NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING`, `NEXT_PUBLIC_APP_URL`, `LOG_ENDPOINT`; build knobs `NEXT_PUBLIC_SKIP_DYNAMIC_ROUTES`, `NEXT_PUBLIC_DIST_DIR`.
- **Email (app + `api/`)**: `RESEND_API_KEY`, `RESEND_TEST_MODE`, `EMAIL_FROM`, `EMAIL_TO`, `EMAIL_ADMIN`, `EMAIL_REPLY_TO`.
- **`api/` only**: `HUBSPOT_TOKEN`, `HUBSPOT_PORTAL_ID`.

## Standards

Follows the Herculean Ecosystem Standards (NONAGENT variant) — see `STANDARDS.md` header for the current version. STANDARDS.md takes precedence on any conflicting guidance.

- **Pre-commit**: Husky + lint-staged runs ESLint fix and affected tests on staged files; `.pre-commit-config.yaml` also blocks staging `.env*` (`no-dot-env` hook) — resolve by unstaging, not bypassing.
- **Secrets**: 1Password via `.env.1p.template` (`op://` refs) locally; Azure Key Vault in prod.
- **Coverage ratchet**: CI floors (30% lines/branches) must never drop vs `main` for touched packages.
- `.cursor/rules/master-coding-rules.mdc` overlaps this file — **CLAUDE.md is authoritative for Claude Code**.

## Key docs / paths

- `staticwebapp.config.json` — production routes + security headers (authoritative).
- `infra/main.bicep` — IaC; owns all Azure topology and resource names.
- `docs/adr/NNNN-title.md` — architecture decision records.
- `STANDARDS.md` — NONAGENT standards baseline.
