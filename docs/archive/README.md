# docs/archive — historical records, not current guidance

Everything in this directory is a **dated point-in-time record**: incident write-ups,
completed migrations, superseded deployment guides, and one-off fix logs. It is kept
because the reasoning in it is occasionally useful when re-litigating an old decision.

**Do not treat any file here as a description of how the system works today.** Much of it
describes architectures that were abandoned:

- the **static-export** era (before SWA hybrid rendering)
- the **linked Azure Functions backend**, retired 2026-07-24 — `/api/*` is now served by
  App Router route handlers (see `docs/adr/0002-*`)
- the deleted `src/` mirror and the deleted `src/uitests/` Playwright suite
- CI workflows that no longer exist (`hybrid-tests.yml`, `ui-tests.yml`,
  `playwright.yml`, `security-tests.yml`, `azure-static-web-apps.yml`,
  `backup-repository.yml`)

For current truth, in order of authority:

1. `CLAUDE.md` — architecture, gotchas, environment contract
2. `docs/adr/` — architecture decisions (`0002` supersedes `0001`)
3. the config files themselves — `next.config.js` (CSP/headers),
   `staticwebapp.config.json` (redirects), `package.json`, `infra/main.bicep`
4. `README.md`, `testing.md` — onboarding and test layout

Files were moved here with `git mv`, so `git log --follow <file>` still works. Nothing was
deleted.
