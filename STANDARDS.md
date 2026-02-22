# STANDARDS.md — Cross-Site Engineering Standards

> **Scope**: All web properties managed by TK (currently BTAISite, SchedulEd/AIStudyPlans).
> **Authority**: This file is the single source of truth for shared conventions. Repo-specific `CLAUDE.md` files supplement but never contradict this document.
> **Last updated**: 2026-02-22

---

## 1. Language & Framework Targets

| Standard | Target | Notes |
|----------|--------|-------|
| TypeScript | 5.x, strict mode | No `any` without justification comment |
| React | 19.x (target) | SchedulEd upgrade planned from 18 |
| Next.js | 15.x (target) | SchedulEd upgrade planned from 14 |
| Node.js | 20.x LTS | Enforced via `.nvmrc` or `engines` field |
| Module system | ESM (`"type": "module"`) | Target state; CJS repos migrate when upgrading |

## 2. Styling

- **Tailwind CSS only.** No inline `style={{}}` objects. No unscoped global CSS.
- Exception: Third-party library overrides may use scoped CSS modules.
- Always include `dark:` variants for any visible element.
- Dark mode strategy: `next-themes` with `attribute="class"`.
- Custom theme toggle components **must** use `useTheme()` from `next-themes` — never manage `document.documentElement.classList` or `localStorage` directly.

## 3. Component Architecture

- **Server Components by default.** Only add `"use client"` when the component needs browser APIs, event handlers, or React hooks.
- **Named exports** for components (`export const MyComponent`).
- **Default exports** for page files only (`export default function Page()`).
- Files soft-capped at **150 lines** (app code) / **250 lines** (config/infra). Split if exceeding.
- One component per file. File name matches component name (PascalCase).

## 4. API Routes

All API endpoints follow this pipeline in order:

1. **Zod schema validation** on request body
2. **Rate limiting** (per-IP or per-session)
3. **Business logic / action**
4. **Typed `NextResponse.json()`** return

Additional requirements:
- Honeypot fields (`_gotcha`) on public-facing forms
- CORS headers where cross-origin access is needed
- Structured error responses: `{ success: boolean, message: string, errors?: [] }`

## 5. Security

### Build-Time
- `typescript.ignoreBuildErrors` **must be `false`** in production pipelines. Use `true` only during active migration with a documented timeline to resolve.
- `eslint.ignoreDuringBuilds` **must be `false`** once all existing warnings are resolved.
- Never hardcode API keys, tokens, or secrets. Use environment variables.
- Dependencies pinned to **exact versions** (no `^` or `~`). Lock files committed.

### Runtime
- CSP headers with nonce generation in middleware.
- No inline `<script>` or `style=""` attributes that require `unsafe-inline`.
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`.
- Input sanitization on all user-provided strings before storage or email.

### Dependencies
- Run `npm audit` before any release. No `critical` or `high` vulnerabilities in production deps.
- Run `npm shrinkwrap` (or verify lock file) after adding/updating deps.

## 6. Testing

### Target Test Runner: Vitest
- All new test files use Vitest syntax (`describe`, `it`, `expect`, `vi`).
- Repos still on Jest should migrate to Vitest when performing a major framework upgrade.
- Test environment: `happy-dom` (preferred) or `jsdom`.

### Coverage Thresholds
| Environment | Lines | Branches | Functions | Statements |
|-------------|-------|----------|-----------|------------|
| CI (floor) | 30% | 20% | 30% | 30% |
| Local (target) | 70% | 60% | 70% | 70% |

CI floors are ratcheted up as coverage improves — never lowered.

### Test Structure
- Unit tests: `__tests__/components/`, `__tests__/api/`, `__tests__/lib/`
- Integration tests: `__tests__/integration/`
- E2E tests: Playwright (`e2e/` or `src/uitests/`)
- Test utilities: `__tests__/utils/`

### Mocking Rules
- Mock external services (email, database, third-party APIs) — never hit real services in tests.
- Mock `next/image`, `next/link`, `next/router` consistently across all test files.
- Use `vi.mock()` (Vitest) or `jest.mock()` (Jest, legacy only).

## 7. CI/CD

- **Cloud CI is deployment-only.** No test execution in GitHub Actions — run `npm run validate` locally before pushing.
- Deploy target: Azure Static Web Apps for all properties.
- Concurrency: Cancel in-progress runs on same branch.
- Timeouts: 10 min for deployment, 5 min for cleanup.

### Pre-Push Checklist (enforced by `validate` script)
1. `npm run lint` — zero errors (warnings acceptable during migration)
2. `npm run type-check` (or `typecheck`) — zero errors
3. `npm run test` — all passing
4. `npm run build` — successful

## 8. Git & Commits

- **Conventional commits**: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `ci:`, `test:`, `style:`, `perf:`
- Branch naming: `feat/description`, `fix/description`, `chore/description`
- PRs require passing deployment check before merge.
- Squash merge to `main` preferred.

## 9. Accessibility

- Semantic HTML: Use `<nav>`, `<main>`, `<footer>`, `<section>`, `<article>` appropriately.
- All interactive elements must have `aria-label` or visible label text.
- Color contrast: WCAG AA minimum (4.5:1 for normal text, 3:1 for large text).
- Keyboard navigation: All interactive elements reachable and operable via keyboard.
- Don't put `role="navigation"` on `<header>` — use `<nav>` inside `<header>` or use `<nav>` directly.

## 10. Documentation

- Every repo has a `CLAUDE.md` (agent instructions) and `README.md` (human instructions).
- `CLAUDE.md` references this `STANDARDS.md` for shared conventions and only documents repo-specific deviations.
- API endpoints documented with request/response examples in README or dedicated docs folder.
- Environment variables documented in `.env.example` with descriptions.

## 11. Logging

- Use structured logger (when available) over `console.log` in production code paths.
- `console.warn` and `console.error` are acceptable in all environments.
- `console.log` is acceptable in development-only code paths (gated by `NODE_ENV`).
- Never log secrets, tokens, full request bodies, or PII.

## 12. Performance

- Images: `unoptimized: true` in `next.config` for Azure Static Web Apps compatibility.
- Lazy load below-fold content.
- Fonts: Use `next/font` for self-hosted fonts. Minimize external font requests.
- Bundle analysis: Run `ANALYZE=true npm run build` periodically to check bundle size.

---

## Versioning This Document

When updating this document:
1. Update the "Last updated" date at the top.
2. Copy the updated file to all repos.
3. Commit with message: `docs: update STANDARDS.md vYYYY-MM-DD`
