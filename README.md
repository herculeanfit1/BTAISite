# Bridging Trust AI Website

[![Quality Gate](https://github.com/herculeanfit1/BTAISite/actions/workflows/quality-gate.yml/badge.svg)](https://github.com/herculeanfit1/BTAISite/actions/workflows/quality-gate.yml)
[![CI/CD Pipeline](https://github.com/herculeanfit1/BTAISite/actions/workflows/cost-optimized-ci.yml/badge.svg)](https://github.com/herculeanfit1/BTAISite/actions/workflows/cost-optimized-ci.yml)

Marketing and consulting site for Bridging Trust AI — a single-page Next.js App Router
app (anchor navigation) with a working contact form, deployed on Azure Static Web Apps.

Exact dependency versions live in `package.json`; the required Node version lives in
`.nvmrc`. This file deliberately does not restate them.

**`CLAUDE.md` is the authoritative engineering reference** for architecture, gotchas, and
the deployment contract. Read it before changing anything non-trivial — it records several
traps (dead code trees, config files the platform silently ignores) that are not visible
from the directory listing.

## Architecture

- **Frontend**: Next.js App Router + React + TypeScript (strict), styled with Tailwind CSS v4.
  Theme values live in the `@theme` block of `app/globals.css`; there is no active Tailwind
  config file. Dark mode is class-based via `next-themes`.
- **`/api/*`**: App Router route handlers (`app/api/{contact,health,status}/route.ts`) served
  by the Static Web Apps **managed hybrid backend**. Thin adapters over runtime-agnostic
  domain logic in `src/lib/api/`. The previously linked Azure Functions app was retired on
  2026-07-24; `api/` remains in the tree as dead code pending teardown — do not edit it.
- **Contact form**: Zod validation → server-side anti-abuse checks → Resend dual delivery
  (submitter confirmation + admin notification), with non-blocking HubSpot upsert and a
  queue enqueue for downstream lead classification. Anti-abuse specifics are intentionally
  not documented in this public repo.
- **Security headers / CSP**: served from `next.config.js` `headers()`. The Static Web Apps
  hybrid adapter silently ignores header directives in `staticwebapp.config.json`, which is
  why they are not there. Redirects, conversely, _do_ work in that file and stay there.
- **Infrastructure**: `infra/main.bicep` owns all Azure topology. Production secrets come
  from Azure Key Vault via managed identity.

## Requirements

Node.js **20.x LTS**, matching `.nvmrc` exactly. Node 18.x is unsupported and 23.x breaks
the build. Use nvm:

```bash
nvm install 20 && nvm use 20
node -v
```

## Development

```bash
npm install
npm run dev:http     # custom HTTP dev server — recommended locally
npm run dev          # same custom server over HTTPS
npm run dev:next     # plain `next dev`, no custom server
```

The site is served at `http://localhost:3000`. Note that `dev`, `dev:http`, and `start` run
the custom `server.js`, not `next dev`.

Other common scripts — see `package.json` for the full list:

```bash
npm run build        # production build
npm run lint         # lint  (lint:fix auto-fixes)
npm run type-check   # tsc --noEmit
npm run validate     # full pre-push quality gate (ci/g_master.sh)
```

Cloud CI enforces type-check, the full test suite with its coverage thresholds, and the
production build on every PR (`.github/workflows/quality-gate.yml`, a required status
check). It does not run Playwright/E2E, the security scripts, or the deploy-check — so
`npm run validate` locally is still the broader gate before pushing.

### Environment setup

For local email testing, create `.env.local`:

```bash
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=hello@bridgingtrust.ai
EMAIL_TO=sales@bridgingtrust.ai
EMAIL_ADMIN=admin@bridgingtrust.ai
EMAIL_TEST_MODE=true
```

`EMAIL_TEST_MODE=true` short-circuits real delivery. In production these values are Key
Vault references, never plain-text app settings. The full variable contract is documented
in `CLAUDE.md`.

## Testing

Vitest for unit/integration, Playwright for end-to-end. See `testing.md` for the layout and
`CLAUDE.md` for how to run a single test or a single case.

```bash
npm run test         # all Vitest suites
npm run test:docker  # same suites in Docker — avoids Rollup platform issues
npm run test:e2e     # Playwright (needs a server on :3000)
```

Docker is the recommended path for unit and integration runs because it eliminates
platform-specific Rollup binary problems.

## Deployment

Deployed to Azure Static Web Apps by `.github/workflows/cost-optimized-ci.yml` on merge to
`main`, using the Oryx hybrid build. One deployable, one deploy job, no linked backend.

Two constraints worth knowing before touching the pipeline:

- Do **not** set `skip_app_build: true` — it breaks page routing.
- `/api/health` and `/api/contact` response shapes are a CI contract: post-deploy
  verification polls `/api/health` for `"status"` and expects a JSON 400 from an invalid
  `/api/contact` payload. Changing either shape fails the deploy gate.

Pull requests deploy to a preview environment with real email, HubSpot, and queue side
effects disabled.

## Documentation

- `CLAUDE.md` — authoritative architecture, gotchas, environment contract.
- `testing.md` — test suite layout.
- `STANDARDS.md` — security and hygiene baseline this repo follows.
- `docs/adr/` — architecture decision records.
- `docs/projects/` — active plans, including the open API-consolidation teardown phase.
- `docs/` — historical incident notes and migration logs. These are dated point-in-time
  records, not current guidance; where they conflict with `CLAUDE.md`, `CLAUDE.md` wins.
