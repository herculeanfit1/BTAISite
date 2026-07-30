# PLAN-014: Migrate off end-of-life Node 20

**Status**: Awaiting review — **not started**
**Effort**: S–M · **Risk**: Low locally, **one genuine unknown in the deployed runtime**
**Written**: 2026-07-29

> Every claim below was checked. Where something was *not* verifiable, it says so and the plan
> spends a step finding out rather than assuming. The one unknown is Step 1, and it is
> deliberately first because it can invalidate the rest.

## Why now

Node 20 reached **end of life on 2026-04-30** — 90 days ago — per
`nodejs/Release/schedule.json`. This repo pins `20.20.0` in eight places. The runtime receives
no security patches, which makes this a standing security item rather than housekeeping.

## ⚠️ Correction: the target is Node 22, not Node 24

The previous roadmap entry recommended **Node 24**, on the basis that Oryx carries `24.13.0`.
**That recommendation was wrong.** It checked Oryx's *build* support and never checked the
*runtime* ceiling.

Azure Static Web Apps' `apiRuntime` supports:

| Value | End of support |
| --- | --- |
| `node:18` | May 31, 2025 |
| `node:20` | — |
| **`node:22`** | — |
| `node:24` | **does not exist** |

There is no `node:24`. [Azure/static-web-apps#1724](https://github.com/Azure/static-web-apps/issues/1724),
asking for a Node 24 timeline, was opened 2026-02-05 and remains **open with no Microsoft
response**. So the platform ceiling is **Node 22**.

**Target: `22.22.0`** — the newest Node 22 that Oryx carries (its list stops there; the newest
Node 22 release is `22.23.2`, which Oryx does not have, and picking it would fail the build
exactly as `20.20.2` did). Verified: real release (2026-01-12, LTS "Jod"), and
`node:22.22.0-slim` / `-alpine` both exist on Docker Hub.

**This buys until 2027-04-30** (Node 22 EOL), roughly 9 months. That is unsatisfying and it is
the ceiling the platform imposes. Revisit when SWA ships `node:24`; #1724 is the thing to watch.

## What the evidence says: the local half is already proven

The whole toolchain was installed and exercised on **Node 22.22.0** before writing this plan:

| Check | Result on Node 22.22.0 |
| --- | --- |
| `npm ci` | **clean** |
| `keytar` (ABI 127 rebuild) | rebuilt and **loads** |
| `npm run type-check` | clean |
| `npm run test:coverage` | **339 passed** |
| `npx eslint . --no-cache` | 0 errors |
| `npm run build` | clean |
| `npx playwright test --project=chromium` (CI path, production build) | **32 passed** |
| `npx playwright test` (5 browsers) | **160 passed** |

So the risk is **not** in the application, the tests, or the dependency tree. It is entirely in
the deployed runtime, which is Step 1.

### Dependency research

- **No dependency has an upper bound blocking Node 22.** Every `engines.node` in the tree uses
  the `^18.18.0 || ^20.9.0 || >=21.1.0` shape, which admits 22. Checked programmatically across
  all of `node_modules`, not sampled.
- **Declared support**: `vitest@3.1.3` → `^18 || ^20 || >=22` (explicit), `next@15.5.21` →
  `>=20`, `happy-dom@17.4.6` → `>=18`, `@playwright/test@1.55.1` → `>=18`,
  `eslint@9.26.0` → `>=21.1.0`.
- **Node 22's hard removals do not touch this code.** Grepped for `crypto.createCipher`,
  `createDecipher`, `process.binding`, import assertions (`assert { type: }`), `url.parse`,
  `new Buffer`, `fs.rmdir`, `punycode` — **zero hits**. The only builtins used are `fs`, `path`,
  `child_process` and `process`, all stable.
- **Native modules are the usual suspects and they are fine.** `keytar` was the one real
  node-gyp addon and the ABI-127 rebuild succeeded. The rest (`@next`, `@rollup`,
  `@tailwindcss`, `lightningcss`, `@img`, `playwright`) ship per-platform binaries rather than
  ABI-coupled Node addons.

## The eight sites, one of which the existing guard misses

| # | Site | Current | Notes |
| --- | --- | --- | --- |
| 1 | `.nvmrc` | `20.20.0` | drives all `node-version-file:` consumers |
| 2 | `package.json` `engines.node` | `20.20.0` | also what SWA reads for the **front-end build** |
| 3 | `dockerfile` | `node:20.20.0-alpine` | |
| 4 | `Dockerfile.static` | `node:20.20.0-slim` | |
| 5 | `Dockerfile.test` | `node:20.20.0-slim` | |
| 6 | `cost-optimized-ci.yml` `NODE_VERSION` (deploy-main) | `20.20.0` | **must be Oryx-supported** |
| 7 | `cost-optimized-ci.yml` `NODE_VERSION` (deploy-pr) | `20.20.0` | ditto |
| 8 | **`staticwebapp.config.json` `platform.apiRuntime`** | **`node:20`** | ⚠️ **not covered by `toolchain-versions.test.ts`** |

Site 8 is a gap in the guard written yesterday: it scans `.nvmrc`, `package.json`, Dockerfiles
and workflows, and never looks at `staticwebapp.config.json`. Closing that gap is part of this
plan, not a follow-up.

## Steps

### Step 1 — Find out whether `apiRuntime` does anything here (**the unknown; do this first**)

**The question**: this repo has **no managed Azure Functions** (`api_location: ""`, no linked
backend, `/api/*` is Next.js route handlers on the hybrid runtime). Microsoft's docs describe
`apiRuntime` as configuring *"managed functions"*, and separately note that hybrid Next.js has
only **partial support for `staticwebapp.config.json`** — this repo has already documented
`globalHeaders`, `routes[].headers` and `responseOverrides` being **silently ignored** by that
adapter. `apiRuntime` may be equally inert.

Today's deploy log reports `Web App Runtime Information. OS: linux, node version: 20`, which
**matches** our `apiRuntime: "node:20"` — and therefore proves nothing, because it is also
plausibly SWA's default.

**The experiment**: on a PR branch, change **only** `platform.apiRuntime` to `node:22`. Deploy
to a preview and read the deploy log.

- If it reports `node version: 22` → the setting is live, and the runtime moves with it.
- If it still reports `20` → the setting is **inert** for hybrid, the runtime Node version is
  not ours to choose, and Steps 2–5 become a build-and-tooling-only migration. **Record that in
  CLAUDE.md next to the other silently-ignored keys**, because it is exactly the same class of
  trap.

Either outcome is fine and the plan proceeds; what changes is what we claim to have achieved.
**Do not skip this to save a cycle** — shipping a runtime bump that never took effect, and
believing it did, is the failure mode this repo has produced repeatedly.

### Step 2 — Move all eight sites to Node 22

`22.22.0` for the numeric sites; `node:22` for `apiRuntime`. Verify the Docker tags resolve
(`node:22.22.0-slim`, `node:22.22.0-alpine` — both confirmed to exist) before relying on them.

### Step 3 — Extend the guard to the eighth site

Add `staticwebapp.config.json` `platform.apiRuntime` to `toolchain-versions.test.ts`, comparing
its **major** against the other seven (it is `node:22`, not `node:22.22.0`, so an exact-string
comparison would be wrong). Mutation-test it: set `apiRuntime` back to `node:20` and confirm red.

Also add an assertion that `apiRuntime`'s major is one SWA actually supports — the same shape as
the existing Oryx allow-list check, and for the same reason: `node:24` is a real Node version and
an invalid SWA value.

### Step 4 — Remove `@azure/static-web-apps-cli`

It is referenced by **no npm script, workflow, CI script, or source file** — verified — and it is
the sole reason `keytar` is in the tree. `keytar` is a deprecated node-gyp addon and the only
ABI-coupled dependency here; deleting the CLI removes the one component that could break on a
future Node bump for reasons unrelated to this codebase.

Independently useful, and it shrinks the install. Do it in this PR or a separate one, but do it
**after** Step 1 — a spike should change one thing.

### Step 5 — Validate on the version being shipped

Not on the version already installed. `nvm install 22.22.0`, then the full gate: `npm ci`,
`type-check`, `test:coverage`, `eslint`, `build`, `playwright test` (5 browsers), and
`CI=true playwright test --project=chromium` for the production-build path. All eight of those
have **already passed** on 22.22.0 during research, so this step is confirmation rather than
discovery — but re-run it against the actual branch.

### Step 6 — Watch the deploy, and read the runtime line

The required checks will validate build and test. They will **not** validate the runtime. After
merge, read `Web App Runtime Information` in the deploy log and confirm it says what Step 1
predicted, then verify production directly: homepage `200`, `/api/health` `{"status":"ok"}`,
`/api/contact` `400`.

## Risks and mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Oryx rejects the chosen version | **Low** — `22.22.0` is in its list | Pinning to Oryx's newest 22.x; the guard asserts membership. This exact failure already happened once with `20.20.2`, in ~30 s on a preview |
| `apiRuntime` is inert for hybrid | **Unknown — this is Step 1** | Spike before committing to a claim; record the finding either way |
| Runtime and build Node diverge | Medium if Step 1 says "inert" | Accept and document. A Next.js build on 22 running on a 20 runtime is a real mismatch worth stating explicitly rather than papering over |
| `keytar` fails to rebuild | **Ruled out** — rebuilt and loaded on ABI 127 | Step 4 removes it entirely regardless |
| Test toolchain breaks | **Ruled out** — 339 unit + 160 E2E green on 22.22.0 | — |
| Docker images break | Low | Tags verified to exist; `hadolint` runs in Standards Check; nothing in CI builds these images, so blast radius is local `test:docker` only |
| Local devs stranded on 20 | Certain, briefly | `.nvmrc` change means `nvm use` prompts an install; note it in the PR |

## Rollback

Revert the PR. Every change is a version string plus one guard test; there is no data
migration, no schema change, and no production behaviour change. If the runtime moves and
something breaks, reverting `apiRuntime` alone is a one-line change and a redeploy.

## Explicitly out of scope

- **Node 24.** Not available on SWA. Watch [#1724](https://github.com/Azure/static-web-apps/issues/1724).
- **Releasing the npm `semver-major` ignore.** The dependency-majors backlog is its own piece of
  work and mixing it into a runtime migration would make a failure ambiguous.
- **Upgrading `typescript@5.4.5`** (over a year old) or any other dependency. Same reason.

## Sources

- Node release schedule — `https://raw.githubusercontent.com/nodejs/Release/main/schedule.json`
- SWA supported runtimes — `https://learn.microsoft.com/en-us/azure/static-web-apps/languages-runtimes`
- Hybrid Next.js unsupported features — `https://github.com/MicrosoftDocs/azure-docs/blob/main/includes/static-web-apps-nextjs-unsupported.md`
- Node 24 request — `https://github.com/Azure/static-web-apps/issues/1724`
- Oryx's supported version list — read from a real failing build log, run `30474305977`
