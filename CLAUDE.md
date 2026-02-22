# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
The contact form (`app/api/contact/route.ts`) uses: Zod validation → honeypot bot detection (`_gotcha` field) → per-IP rate limiting (5/hour) → circuit breaker pattern → Resend API for dual delivery (user confirmation + admin notification). Email templates in `src/lib/email-templates/`.

### Key Patterns
- **Server Components by default** — only add `'use client'` for true interactivity
- **Named exports** for components; default exports for pages
- **Zod validation** on all API inputs
- **Dark mode** — class-based via next-themes; always include `dark:` Tailwind variants
- **CSP/security headers** — generated in middleware with nonce; no inline styles/scripts that break CSP
- **ESM modules** throughout (`"type": "module"` in package.json)

## Testing

- **Primary runner**: Vitest with happy-dom environment
- **E2E**: Playwright (Chromium, Firefox, WebKit)
- **Coverage ratchet**: CI floor ≥ 30%, local target ≥ 70%
- **Docker testing** available for consistent cross-platform results (avoids Rollup platform issues)
- **Pre-commit hooks**: Husky + lint-staged runs ESLint fix and affected tests on staged files

## Deployment

- **Platform**: Azure Static Web Apps via GitHub Actions
- **CI in cloud is deployment-only** — run `npm run validate` locally before pushing
- **Environment variables**: Managed in Azure portal (RESEND_API_KEY, EMAIL_FROM, EMAIL_TO, etc.)
- **Images unoptimized**: Required for Azure Static Web Apps compatibility (`next.config.js`)

## Conventions

- TypeScript strict mode; avoid `any` (isolate and justify if unavoidable)
- Tailwind utilities only — no inline styles or unscoped global CSS
- Files soft-capped at 150 lines (app code) / 250 lines (config/infra)
- Use `logger` instead of `console.log` in production paths
- Conventional commits: `feat`, `fix`, `refactor`, etc.
- API route pattern: zod validate → rate-limit → action → typed `Response.json`
- Node 20.19.1 required (18.x incompatible, 23.x causes issues)
