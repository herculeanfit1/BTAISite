# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Cross-site standards**: See `STANDARDS.md` in this repo for shared conventions
> that apply across all TK web properties. This file documents BTAISite-specific
> details only. STANDARDS.md takes precedence on any conflicting guidance.

## Project Overview

Bridging Trust AI marketing/consulting website built with **Next.js 15.4.x** (App Router), **React 19**, **TypeScript 5** (strict), and **Tailwind CSS 4.1**. Deployed on **Azure Static Web Apps** with a working contact form powered by Resend email service.

## Essential Commands

### Development
```bash
nvm use 20                # Required: Node 20.19.1 (enforced in .nvmrc)
npm install               # Install dependencies
npm run dev:http          # Local dev server (HTTP, recommended)
npm run dev               # HTTPS dev server
npm run dev:next          # Next.js built-in dev server
```

### Build
```bash
npm run build             # Production build
npm run build:static      # Build skipping dynamic routes
```

### Lint & Type Check
```bash
npm run lint              # ESLint check
npm run lint:fix          # Auto-fix ESLint issues
npm run type-check        # TypeScript validation (tsc --noEmit)
```

### Testing
```bash
npm run test              # Vitest — all unit tests
npm run test:unit         # Unit tests only
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
npm run test:api          # API endpoint tests
npm run test:integration  # Integration tests (uses vitest.integration.config.js)
npm run test:middleware    # Middleware/security tests
npm run test:e2e          # Playwright E2E tests
npm run test:docker       # All tests in Docker (consistent environment)
npm run test:docker:quick # Quick Docker tests (unit + middleware)

# Run a single test file
npx vitest run __tests__/components/NavBar.test.tsx
# Run a single Playwright test
npx playwright test src/uitests/pages/home.spec.ts
```

### Validation (run before pushing)
```bash
npm run validate          # Full pre-push validation
npm run validate:quick    # Quick validation
```

## Architecture

### App Router Structure
- **`app/[locale]/`** — Locale-routed pages (en, es, fr) using next-intl
- **`api/`** — Azure Functions v4 backend (contact, newsletter, status, cspReport, health). Linked to SWA — all `/api/*` requests proxy here
- **`app/components/`** — React components (primary location, 42+ files)
- **`app/middleware.ts`** — Security headers and CSP nonce generation

### Source Organization
- **`app/components/`** — Primary component location (42+ files, actively imported)
- **`src/components/`** — Legacy/dead copies exist here; check imports before editing — the active version is usually in `app/components/`
- **`src/lib/`** — Utilities: email (Resend), rate limiting, Zod validation schemas, logging, i18n config, nonce generation
- **`src/types/`** — TypeScript type definitions
- **`lib/`** — Server-side libraries (analytics, cookies, rate-limit, i18n)
- **`__tests__/`** — Vitest unit/integration tests (components/, api/, integration/)
- **`src/uitests/`** — Playwright E2E tests
- **`ci/`** — CI/CD shell scripts; `g_master.sh` orchestrates all quality gates
- **`docs/`** — Architecture notes and ADRs (`docs/adr/NNNN-title.md`)

### Path Aliases (use these)
`@/*` resolves to project root (`"./*"`). Specific mappings: `@/components/*` → `src/components/`, `@/lib/*` → `src/lib/`, `@/types/*` → `src/types/`. Configured in tsconfig.json.

### Contact Form / Email Pipeline
The contact form is handled by the Azure Functions backend (`api/src/functions/contact.ts`): Zod validation -> honeypot bot detection -> per-IP rate limiting -> circuit breaker pattern -> Resend API for dual delivery (user confirmation + admin notification). The honeypot field name, rate-limit threshold, and circuit-breaker settings are kept in the private runbook. Email templates in `api/src/lib/email-templates/`.

### Service Layer & Data Flow

```
Client (ContactSection.tsx)
  → POST /api/contact (SWA proxies to <function-app>)
    → Azure Functions handler (api/src/functions/contact.ts)
      → Zod schema validation
      → Honeypot check
      → sendContactEmail() (api/src/lib/email.ts)
        → checkRateLimit() — in-memory IP-based (limit in private runbook)
        → checkCircuitBreaker() — thresholds in private runbook
        → Resend API (key from Key Vault) — dual delivery:
          1. User confirmation (reply-to: sales@bridgingtrust.ai)
          2. Admin notification (to: sales@, cc: terence@)
      → upsertContactAndLogInquiry() (api/src/lib/hubspot.ts) [non-blocking]
        → HubSpot CRM: create-or-update contact (13 custom properties)
        → HubSpot CRM: create note engagement with inquiry text
      → buildClassifyMessage() → Azure Storage Queue [non-blocking]
        → Enqueue to <queue-name> for n8n/Ollama classification
```

### Azure Functions Backend (`api/`)
- **Runtime**: Azure Functions v4, Flex Consumption (`<function-app>`)
- **Build**: esbuild → `dist/index.js` (ESM, Node 22). Root `tsconfig.json` excludes `api/` — the API has its own tsconfig
- **Functions**: contact, newsletter, status, cspReport, health
- **Key Vault**: `<key-vault-name>` — secret names withheld from this public file (deployment detail — see the private runbook / 1Password vault); referenced via `@Microsoft.KeyVault()`
- **Storage Queue**: `<queue-name>` in `<storage-account>` — identity-based auth via `AzureWebJobsStorage__queueServiceUri`
- **Managed Identity**: System-assigned, grants Key Vault Secrets User + Storage Queue Data Message Sender
- **SWA Link**: All `/api/*` requests proxy to Functions via linked backend

### Infrastructure as Code (`infra/`)
- `main.bicep` — Functions, Storage, Key Vault, App Insights, SWA linked backend
- `parameters.prod.json` — Production parameter values
- Deploy: `az deployment group create --resource-group <resource-group> --template-file infra/main.bicep --parameters infra/parameters.prod.json`

### Operational Scripts (`scripts/`)
- KV seed script — seed Key Vault from 1Password and wire KV references to Functions (script name / 1Password item withheld — see the private runbook)
- KV escrow script — back up Key Vault secrets to 1Password (script name / vault item withheld — see the private runbook)

**Key abstractions in `api/src/lib/`:**
- **`email.ts`** — Resend client (lazy-init), rate limiting, circuit breaker, dual email delivery
- **`hubspot.ts`** — HubSpot CRM contact upsert (create-or-409-then-patch), note engagement creation, `INTEREST_TO_INQUIRY_TOPIC` mapping
- **`classify-queue.ts`** — `buildClassifyMessage()` for Azure Storage Queue output binding, 8KB payload guard, message schema v1
- **`rate-limit.ts`** — Generic rate limit middleware for Azure Functions (Map-based, IP keyed, auto-cleanup)
- **`validation.ts`** — Shared validators (email, name, message, phone) and `sanitizeInput()` for XSS prevention

**Additional `src/lib/` modules:** `logger.ts` (structured logging), `env.ts` (env var access), `metadata.ts` (SEO), `route-types.ts` (typed route definitions)

### Key Patterns
- **Single-page marketing site** — all content on main page with anchor navigation (Hero, Problem, Methodology, Solutions [Govern/Relate/Build], About/Founders, Contact)
- **Dark mode** — class-based via next-themes; ThemeToggle uses `useTheme()` hook
- **CSP/security headers** — dual config: `staticwebapp.config.json` (authoritative for Azure deployment headers/routes) + `app/middleware.ts` (nonce generation, runtime headers)
- **ESM modules** throughout (`"type": "module"` in package.json)
- **Component exports** — named exports for components (`export const MyComponent`), default exports for page files only
- **Client islands** — only add `"use client"` when the component needs browser APIs, event handlers, or React hooks; prefer Server Components by default
- **File size** — soft cap 150 lines (app code) / 250 lines (config/infra)

## Critical: Tailwind CSS v4 Rules

This project uses **Tailwind CSS v4.1** with the v4 engine (`@tailwindcss/postcss`). These rules prevent recurring production breakages:

### 1. All custom CSS MUST be in `@layer` blocks
In CSS cascade layers, **unlayered CSS beats layered CSS regardless of specificity**. Since Tailwind v4 puts all utilities in `@layer utilities`, any unlayered rule like `* { margin: 0 }` or `.flex { display: flex }` will silently override every Tailwind utility. This caused `mx-auto`, `px-6`, `rounded-lg`, and all responsive variants to stop working.

```css
/* WRONG — overrides ALL Tailwind margin/padding utilities */
* { margin: 0; padding: 0; }
section { padding-top: 4rem; }
input { border-radius: 0; }

/* CORRECT — lives in @layer base, utilities take precedence */
@layer base {
  section { padding-top: 4rem; }
}
@layer components {
  .my-class { ... }
}
```

### 2. Use `@import "tailwindcss"` (NOT v3 directives)
The v3 directives (`@tailwind base/utilities/components`) partially work in v4 but **silently skip responsive variants**. Zero `sm:`, `md:`, `lg:` rules will be generated.

```css
/* WRONG — v3 syntax, responsive variants silently missing */
@import "tailwindcss/preflight";
@tailwind utilities;

/* CORRECT — v4 unified import */
@import "tailwindcss";
```

### 3. Theme customization uses `@theme` blocks in CSS
Tailwind v4 does not read `tailwind.config.js` (deleted from this repo). Custom colors and other theme values are defined in the `@theme` block in `globals.css`. To add a new color utility, add `--color-mycolor: ...` to the `@theme` block.

### 4. Only ONE `<html>` and `<body>` tag
Only `app/layout.tsx` (root layout) renders `<html>` and `<body>`. The `app/[locale]/layout.tsx` is a **pass-through** (`<>{children}</>`) — it must NOT wrap children in `<html>` or `<body>`. Nested HTML tags cause React hydration failure, which triggers the error boundary and breaks the entire site.

### 5. Error boundaries use inline styles only
`app/error.tsx` and `app/[locale]/error.tsx` use **inline styles**, not Tailwind classes. Error boundaries must render even when CSS fails to load.

## Local Environment Setup

For local email testing, create `.env.local`:
```bash
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=hello@bridgingtrust.ai
EMAIL_TO=sales@bridgingtrust.ai
EMAIL_ADMIN=admin@bridgingtrust.ai
RESEND_TEST_MODE=true
```

## Testing

- **Docker testing** available for consistent cross-platform results (avoids Rollup platform issues)
- **Pre-commit hooks**: Husky + lint-staged runs ESLint fix and affected tests on staged files
- **Coverage ratchet**: CI floors (30% lines/branches) must never drop vs `main` for touched packages

## Deployment

- **Platform**: Azure Static Web Apps + linked Azure Functions backend (`<function-app>`)
- **SWA**: Oryx hybrid build, `cost-optimized-ci.yml`. Do NOT use `skip_app_build: true`. `.npmrc` has `engine-strict=false` for Oryx compatibility
- **Functions**: Deployed via `func azure functionapp publish` or GitHub Actions `deploy-functions` job
- **Secrets**: Key Vault (`<key-vault-name>`) via managed identity. NEVER plain-text in app settings
- **CI in cloud is deployment-only** — run `npm run validate` locally before pushing
- **Images unoptimized**: Required for Azure Static Web Apps compatibility (`next.config.js`)
- **Pages under `app/[locale]/`** — Must live under `app/[locale]/` for SWA's hybrid adapter via `generateStaticParams`

## Performance Budgets

Home and key pages must meet: **LCP ≤ 2.5s**, **CLS ≤ 0.1**, **INP ≤ 200ms**, **Perf score ≥ 90**. No regressions vs `main` for changed pages. Run `ANALYZE=true npm run build` to check bundle size.

## BTAISite-Specific Notes

- Node 20.19.1 required (18.x incompatible, 23.x causes issues)
- Use `logger` instead of `console.log` in production paths
- i18n via next-intl with locale routing (en, es, fr)
- ADRs for architectural decisions go in `docs/adr/NNNN-title.md`
- Cursor rules exist at `.cursor/rules/master-coding-rules.mdc` with overlapping guidance — CLAUDE.md is authoritative for Claude Code

## Recent Architecture Decisions (April 2026)

- **HubSpot contact upsert + note engagement now live (P1b.1)** — `api/src/lib/hubspot.ts` creates/updates contacts with 13 custom properties under `btai_lead_intake` group, then attaches an HTML note with the inquiry text. Token from Key Vault (secret name withheld — see the private runbook)
- **Azure Storage Queue `<queue-name>` + classify-queue.ts (P1b.2)** — after HubSpot upsert, a versioned JSON message (schema v1) is enqueued for downstream n8n/Ollama classification. Identity-based auth via `AzureWebJobsStorage` managed identity
- **Root tsconfig.json must exclude `api/`** — the `api/` directory is a separate TypeScript project with its own tsconfig and esbuild pipeline. If `api/` is not in the root `exclude` array, `next build` will try to type-check Azure Functions code and fail (missing `@azure/functions` types). See PR #16
- **context.log binding trap** — never pass `context.log` as a bare callback to another module. The `this`-binding is lost and calls throw silently inside non-blocking try/catch. Use arrow-wrap: `(msg, meta) => context.log(msg, meta)`. See PR #13
- **CI concurrency groups keyed on `${{ github.workflow }}`** — prevents cross-workflow cancellation where Standards Check and SWA Deployment used to share a group. See PR #14
- **CI concurrency groups also include `${{ github.event_name }}`** — prevents same-workflow cross-event cancellation on merge when both `push` and `pull_request:closed` fire simultaneously. See PR #18
