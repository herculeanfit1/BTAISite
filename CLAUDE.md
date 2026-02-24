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
npm run test:integration  # Integration tests
npm run test:middleware    # Middleware/security tests
npm run test:e2e          # Playwright E2E tests
npm run test:docker       # All tests in Docker (consistent environment)
npm run test:docker:quick # Quick Docker tests (unit + middleware)
```

### Validation (run before pushing)
```bash
npm run validate          # Full pre-push validation
npm run validate:quick    # Quick validation
```

## Architecture

### App Router Structure
- **`app/[locale]/`** — Locale-routed pages (en, es, fr) using next-intl
- **`app/api/`** — Server-side API routes (contact form, newsletter, status, CSP reporting)
- **`app/components/`** — React components (primary location, 42+ files)
- **`app/middleware.ts`** — Security headers and CSP nonce generation

### Source Organization
- **`src/lib/`** — Utilities: email (Resend), rate limiting, Zod validation schemas, logging, i18n config, nonce generation
- **`src/types/`** — TypeScript type definitions
- **`lib/`** — Server-side libraries (analytics, cookies, rate-limit, i18n)
- **`__tests__/`** — Vitest unit/integration tests (components/, api/, integration/)
- **`src/uitests/`** — Playwright E2E tests
- **`ci/`** — CI/CD shell scripts; `g_master.sh` orchestrates all quality gates

### Path Aliases (use these)
`@/components/*`, `@/lib/*`, `@/types/*` — configured in tsconfig.json

### Contact Form / Email Pipeline
The contact form (`app/api/contact/route.ts`) uses: Zod validation -> honeypot bot detection (`_gotcha` field) -> per-IP rate limiting (5/hour) -> circuit breaker pattern -> Resend API for dual delivery (user confirmation + admin notification). Email templates in `src/lib/email-templates/`.

### Service Layer & Data Flow

```
Client (ContactSection.tsx)
  → POST /api/contact (app/api/contact/route.ts)
    → Zod schema validation
    → Honeypot check (_gotcha field)
    → sendContactEmail() (src/lib/email.ts)
      → checkRateLimit() — in-memory IP-based, 5 req/hour
      → checkCircuitBreaker() — 5 failures opens, 5 min timeout
      → Resend API — dual delivery:
        1. User confirmation email (email-templates/contact-confirmation.ts)
        2. Admin notification email (email-templates/admin-notification.ts)
```

**Key abstractions in `src/lib/`:**
- **`email.ts`** — Resend client (lazy-init), rate limiting, circuit breaker, dual email delivery
- **`rate-limit.ts`** — Generic rate limit middleware for API routes (Map-based, IP keyed, auto-cleanup)
- **`validation.ts`** — Shared validators (email, name, message, phone) and `sanitizeInput()` for XSS prevention

**Additional `src/lib/` modules:** `logger.ts` (structured logging), `env.ts` (env var access), `metadata.ts` (SEO), `route-types.ts` (typed route definitions)

### Key Patterns
- **Dark mode** — class-based via next-themes; ThemeToggle uses `useTheme()` hook
- **CSP/security headers** — generated in middleware with nonce; no inline styles/scripts that break CSP
- **ESM modules** throughout (`"type": "module"` in package.json)

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

## Testing

- **Docker testing** available for consistent cross-platform results (avoids Rollup platform issues)
- **Pre-commit hooks**: Husky + lint-staged runs ESLint fix and affected tests on staged files

## Deployment

- **Platform**: Azure Static Web Apps via GitHub Actions
- **CI in cloud is deployment-only** — run `npm run validate` locally before pushing
- **Environment variables**: Managed in Azure portal (RESEND_API_KEY, EMAIL_FROM, EMAIL_TO, etc.)
- **Images unoptimized**: Required for Azure Static Web Apps compatibility (`next.config.js`)

## BTAISite-Specific Notes

- Node 20.19.1 required (18.x incompatible, 23.x causes issues)
- Use `logger` instead of `console.log` in production paths
- i18n via next-intl with locale routing (en, es, fr)
