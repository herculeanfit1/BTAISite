# Strategic Review — BTAI-Site

**Date**: 2026-07-03
**Author**: Claude Fable 5 (strategic review session; planning only, no code changes)
**Companion docs**: `docs/strategy/ROADMAP.md`, `docs/strategy/plans/PLAN-*.md`

---

## 1. Purpose & portfolio fit

BTAI-Site is the public marketing site and **lead-intake pipeline** for Bridging Trust AI:
Next.js 15.5 App Router frontend on Azure Static Web Apps, plus an Azure Functions v4
backend (`api/`) that handles the contact form — Zod validation → Resend dual email →
HubSpot CRM upsert → Azure Storage Queue enqueue for downstream n8n/Ollama lead
classification.

Consumers: prospective clients (the site), the founders (admin emails, HubSpot), and the
downstream classification pipeline. Within the wider fleet it is a **non-agent repo**
governed by the NONAGENT baseline (`STANDARDS.md`), scanned by the canonical Trivy
workflow, and — unusually for the fleet — **public on GitHub**.

Business criticality: the site itself is low-risk static content, but the **contact
pipeline is the revenue front door**. A silent failure there loses leads with no alarm
(see §5 Operational maturity — there is currently no alerting of any kind).

---

## 2. Architecture health

### Strengths

- **The deployed architecture is sound**: SWA + linked Functions backend, Key Vault via
  managed identity (`infra/main.bicep:103-198`), identity-based queue auth, no secrets in
  app settings or code. `api/src/lib/hubspot.ts` is genuinely well-written (AbortController
  timeouts, create-409-patch upsert, typed error results, HTML-escaped note bodies).
- **Branch protection is real and enforced** (verified live via GitHub API): required
  checks `Standards Compliance` + 3 Trivy scans + `Gate on HIGH / CRITICAL`,
  `enforce_admins: true`, linear history, no force pushes.
- **Security scanning is healthy**: canonical `security-scan.yml` with a fail-closed SARIF
  gate; `.trivyignore` has exactly one dated, justified suppression (DS-0002).
- **Tailwind v4 discipline** is documented and followed (`app/globals.css` layers,
  hard-won rules in CLAUDE.md).

### Structural risks

1. **A parallel dead codebase is still wired in.** `src/` holds 118 tracked files —
   a full second App Router (`src/app/`), ~57 component mirrors of `app/components/`,
   and ~20 lib files — of which only **three** are alive (`src/lib/validation.ts`,
   `src/lib/use-consent.ts`, `src/lib/telemetry.ts`, imported at
   `app/components/home/ContactSection.tsx:5`, `app/GoogleAnalytics.tsx:4`,
   `app/components/TelemetryProvider.tsx:4-5`). Worse, `tsconfig.json:38-46` aliases
   `@/components/*` and `@/lib/*` into the dead `src/` tree — a landmine for every future
   contributor and every future agent session. Utility libs exist in **three** copies
   (`lib/`, `src/lib/`, `api/src/lib/`) with imports split arbitrarily.

2. **Route duplication with divergent content.** `/` (`app/page.tsx`) and `/en`
   (`app/[locale]/page.tsx` → `app/components/HomePageContent.tsx`) render **different
   homepages** — one includes `GlobeOverlaySection`, the other `Methodology`. `privacy`
   and `terms` also exist in both locale and non-locale forms. Visitors can see two
   different sites depending on the URL.

3. **i18n is decorative.** `next-intl@4.1.0` is installed but **never imported** anywhere.
   `messages/es.json` is a real, complete Spanish translation that nothing consumes.
   `app/[locale]/layout.tsx:2` declares `["en","es","fr"]` and pre-renders `/fr` — but
   **no `fr.json` exists**. All locale routes render hardcoded English.

4. **Middleware is triplicated and the CSP nonce story is fiction.** Root `middleware.ts`
   (the only one Next.js runs) is a static-export-era no-op stub. `app/middleware.ts` —
   which CLAUDE.md describes as the active nonce-generating security middleware — is
   **ignored by Next.js** (middleware must live at project root). The actual headers come
   from `staticwebapp.config.json:86-94`, whose CSP contains a literal `'nonce-{nonce}'`
   placeholder that SWA never substitutes — served verbatim to browsers. Three `.bak`
   copies of middleware are also tracked.

5. **Dead dependencies.** `three` + `@react-three/fiber` (~1 MB+): zero imports anywhere;
   the `globe/` component dirs are empty. `resend@4.5.1` in the root `package.json` is
   dead (email moved to `api/`, which uses `resend@^6.11.0` — a major-version split of the
   same lib in one repo). The entire Jest/Babel stack (`jest`, `babel-jest`,
   `jest-environment-jsdom`, `jest-junit`, four `@babel/*` presets) coexists with Vitest,
   which is the actual runner. `tailwind.config.cjs` is dead under Tailwind v4.

6. **Client-component ratio**: 43 of 58 `app/components` files are `"use client"`; 16
   exceed the 150-line soft cap (`ContactSection.tsx` is 413 lines). Acceptable for a
   marketing site, but the RSC architecture is mostly unexploited.

### Scaling ceilings

For a marketing site, none that matter near-term. The real ceiling is **operational**:
in-memory rate limiting and circuit breaking (`api/src/lib/email.ts:19-30`,
`api/src/lib/rate-limit.ts:14`) are per-instance state on **Flex Consumption**, which
scales out — effective rate limit = configured limit × instance count, and the breaker
protects nothing across instances. Fine at today's traffic; wrong at any real volume.

---

## 3. Tech debt inventory

| Item | Location | Impact | Effort | Interest rate |
|---|---|---|---|---|
| `src/` dead tree (115 of 118 files) + poisoned tsconfig aliases | `src/`, `tsconfig.json:38-46` | Every change risks editing the dead copy (documented trap in project memory); agent sessions burn context on it | M | **High** — compounds with every session |
| Test theater: 7 always-pass placeholder files, 2 fully-skipped suites, broken import in `__tests__/api/status.test.ts:2`, tautological middleware test, `scripts/fix-component-tests.js` rewriting production source to satisfy tests | `__tests__/`, `scripts/` | False confidence; `npm run test:api` fails on import; "coverage ratchet" passes on empty data (`ci/coverage-ratchet.js:17-22,133-139`, `coverage/coverage-final.json` = `{}`) | M | **High** — every green run reinforces false belief |
| Zero cloud test/build/type-check gate | `.github/workflows/cost-optimized-ci.yml` (no test job; deploy jobs have no `needs:`) | Broken code reaches `main` if the ~15-min local `validate` is skipped; deploys fire in parallel with checks | S | **High** |
| Route duplication with divergent content (`/` vs `/en`; `privacy`/`terms` ×2) | `app/page.tsx` vs `app/components/HomePageContent.tsx`; `app/privacy` vs `app/[locale]/privacy` | Two different production sites; SEO duplicate content | M | Medium |
| Decorative i18n (next-intl unused, `fr` locale with no translations) | `app/[locale]/layout.tsx:2`, `messages/` | Pre-rendered `/fr` in English; misleading architecture claims | S–M | Low |
| Middleware triplication + non-functional CSP nonce | `middleware.ts`, `app/middleware.ts`, `staticwebapp.config.json:90` | Security posture is weaker than documented; literal `{nonce}` in served CSP | S | Medium |
| Committed artifacts: logs, SBOMs (1.7 MB), audit JSONs, `commit_message*.txt`, 6 `.bak` files, backup scripts duplicated at root and `scripts/backup/`, 5 dead dev servers, `app/page.tsx.backup`, `app/test-page.tsx` | repo root, `logs/`, `github-logs/`, `backups/` | Noise, credibility, clone weight on a **public** repo | S | Low but visible |
| Dead deps: `three`, `@react-three/fiber`, `@types/three`, root `resend`, Jest/Babel stack, `critters` (upstream archived), `tailwind.config.cjs` | `package.json` | Install weight, audit surface, upgrade drag | S | Medium |
| Doc drift: CLAUDE.md wrong on Next version (15.4.x vs 15.5.18), pipeline order, active middleware, locales, coverage ratchet; ADR-0001 describes static-export architecture with Next 15.3.2; README says 15.4.6 | `CLAUDE.md`, `docs/adr/0001-*.md`, `README.md`, 70+ stale files in `docs/` | Agents and humans act on false premises | M | **High** for agent-driven work |
| IaC gaps: queue `btai-lead-classify` + queue-sender role + `AzureWebJobsStorage__queueServiceUri` absent from Bicep; `scripts/wire-functions-settings.sh` referenced (CLAUDE.md, `infra/main.bicep:243-244`) but **does not exist** | `infra/main.bicep` | Environment not reproducible from IaC | S | Medium |
| Broken tooling: `rollback.sh:47,112` references nonexistent `azure-static-web-apps.yml`; `package.json` `validate:pre-commit` points to missing `scripts/pre-commit-validation.sh`; lint-staged "affected" hook runs a fixed Docker suite with an interactive prompt that no-ops in git hooks | `scripts/`, `package.json:91,184-192` | Rollback default path fails during an incident | S | Medium |
| Held major upgrades (Dependabot ignores all majors, lockfile-only): Next 16, ESLint 10, Vitest 4, Playwright 1.61, happy-dom 20, @types/node 26 | `.github/dependabot.yml:26-28` | Deliberate freeze; drift accrues | L | Medium |

---

## 4. Security & compliance posture

### Active vulnerabilities

- **HTML injection into outbound email (HIGH, exploitable today).** User-controlled
  `firstName`, `lastName`, `email`, `company`, and `message` are interpolated **raw** into
  the HTML admin-notification email (`api/src/lib/email-templates/admin-notification.ts:151,156,162,179,193`
  — line 193 is a `mailto:` href allowing attribute breakout) and the user confirmation
  (`contact-confirmation.ts:117,123`). Zod caps length but does not sanitize. The safe
  pattern exists 30 lines away — `escapeHtml()` at `api/src/lib/hubspot.ts:31-38` is
  applied to HubSpot notes but **not** to the emails. → **PLAN-001**.
- **Spoofable identity for rate limiting.** `api/src/lib/rate-limit.ts:26-33` trusts the
  first `x-forwarded-for` value; a client rotating XFF bypasses both rate limiters and
  poisons `submission_ip` stored in HubSpot and the classify queue. Combined with
  per-instance limits and unbounded Maps (no cleanup at all in `email.ts:19`), this is a
  Resend-abuse and memory-growth vector. → **PLAN-009**.
- **Newsletter endpoint is a silent no-op** (`api/src/functions/newsletter.ts:62-81`):
  validates, logs PII, returns "successfully subscribed", persists **nothing**. Business
  harm (lost leads) + integrity issue. → **PLAN-006**.

### Posture gaps

- **PII in plaintext logs**: full name/email/company/IP logged on every contact
  submission (`api/src/functions/contact.ts:143-148`), newsletter PII at
  `newsletter.ts:67`. 30-day Log Analytics retention bounds exposure but no redaction
  layer exists. GDPR-relevant.
- **Public repo** with the NONAGENT standard's private-by-default expectation
  (`STANDARDS.md:135-142`). Four TODOs in `security-scan.yml:43,140,232,325` plan a
  "Phase R2" switch to a **self-hosted runner** — executing that on a public repo would
  violate `STANDARDS.md` §8 and create a runner-compromise attack surface. **Must be
  blocked or gated on going private** (escalated to operator).
- **PR deploys use the production SWA token** (`cost-optimized-ci.yml:131`) on every PR.
  Fork PRs don't receive secrets by default, so exposure is limited to same-repo branches,
  but the pattern deserves a same-repo guard.
- CORS on contact echoes any `*.azurestaticapps.net` origin (`api/src/functions/contact.ts:53`);
  `cspReport` has no rate limit or body cap (log-flood vector); `status.ts` exposes
  env/version on an anonymous endpoint. All LOW.
- **Positives / SOC 2 evidence opportunities**: Key Vault + managed identity throughout
  (no plaintext secrets found; `.env` correctly untracked); enforced branch protection
  incl. admins; weekly Trivy with documented suppressions; Dependabot configured; SBOM
  generation exists. These map cleanly to change-management and vulnerability-management
  evidence once the test gate (PLAN-002) makes the change-control story honest.

---

## 5. Operational maturity

- **CI/CD**: deploys work and are fast; but the deploy workflow has **no quality gate in
  its own path** (`cost-optimized-ci.yml:37-111` — no `needs:`, no build/test/lint before
  SWA/Functions deploy). Merge gating = ESLint + Trivy only. **Nothing in the cloud ever
  compiles the app, type-checks, or runs a test.** The local `validate` gauntlet
  (`ci/g_master.sh`) is thorough but ~10–20 min, builds twice, and its security/E2E steps
  are warn-only (`ci/g_security.sh:137-151`, `ci/g_deploy-check.sh:77-84`) — a strong
  incentive to skip it.
- **Observability**: frontend App Insights wired but silently no-ops without its env var
  (`src/lib/telemetry.ts:9-10`); Functions rely on platform auto-instrumentation with a
  minimal `host.json` (no sampling/log config) and a mix of `console.*` and `context.log`
  (`api/src/functions/contact.ts:78,132,143` vs `:167-200`). Health check is
  liveness-only.
- **Alerting: none.** No metric alerts, availability tests, or action groups anywhere in
  IaC or scripts. A Resend outage, expired HubSpot token, or KV misconfiguration would
  lose leads silently.
- **Backup/recovery**: `scripts/rollback.sh` default path is broken (wrong workflow name);
  no use of SWA native deployment revert; no DR runbook.
- **Runbooks**: 70+ loose docs in `docs/` of mixed vintage; no current operational
  runbook; `scripts/wire-functions-settings.sh` (the KV wiring step) is missing entirely.

---

## 6. Top 5 risks (likelihood × impact)

1. **HTML injection via contact form** — high likelihood (trivial to trigger, public
   form), medium-high impact (attacker HTML/phishing rendered in the founders' inboxes;
   `mailto:` attribute breakout). Active now.
2. **Silent lead loss** — medium likelihood, high business impact. Newsletter already
   loses 100% of signups by design; the contact pipeline has no alerting, so any
   Resend/HubSpot/KV failure loses the revenue front door quietly. (Partial mitigant:
   circuit-breaker events are tracked as App Insights custom events — but nobody is
   alerted on them.)
3. **Unverified deploys** — medium likelihood, high impact. No cloud build/test gate +
   skippable 15-minute local validation + a test suite that lies (always-green
   placeholders, self-disabling ratchet) = production breakage discovered by visitors.
4. **Dead-code landmines** — high likelihood, medium impact. `src/` mirrors + poisoned
   aliases + divergent `/` vs `/en` content mean routine edits (human or agent) land in
   dead or wrong files. This has already happened historically (see project memory).
5. **Phase R2 self-hosted runner on a public repo** — low likelihood (requires deliberate
   action), severe impact (runner compromise → workstation/network foothold). A landmine,
   not a fire; must be defused in writing.

## Top 5 opportunities (value ÷ effort)

1. **Escape email HTML** (PLAN-001): hours of work, closes the only active injection vuln.
2. **Cloud quality gate** (PLAN-002): one workflow file + two `gh api` calls converts
   existing branch protection into a real correctness gate. Everything after it is safer.
3. **Dead-code purge** (PLAN-003/004): −~150 tracked files, −6 dead deps; every future
   session (human or agent) gets faster and safer. Highest compounding return in the repo.
4. **Newsletter persistence** (PLAN-006): small wiring job through the existing, good
   `hubspot.ts` module; converts a liability into captured leads.
5. **Alerting on the lead pipeline** (PLAN-010): a handful of Bicep resources; converts
   silent failure into a paged failure.

---

## 7. Verdict: **4 / 10**

The production architecture (SWA + Functions + KV + managed identity + queue) is
well-chosen and the newest backend code (`hubspot.ts`, `classify-queue.ts`) shows real
craftsmanship. Branch protection and security scanning are genuinely enforced — better
than most repos this size.

But the repo scores low because **its safety systems are largely theater**: no cloud
build/test gate, a coverage ratchet that passes on empty data, placeholder tests, a
script that edits production source to satisfy assertions, and documentation (CLAUDE.md,
ADR, README) that disagrees with the code and with itself. Meanwhile one real injection
vulnerability is live, the newsletter silently discards signups, and half the tracked
files are dead. The gap between *documented* and *actual* is the defining problem — and
for a repo that will be worked on primarily by AI agents reading those documents, that
gap compounds faster than in a human-only repo.

The good news: nothing here needs a rewrite. Ten of twelve plans are deletions, wiring,
and honesty fixes — boring, reversible work that a weaker executor can grind through
safely once the decisions (made in these plans) are locked.
