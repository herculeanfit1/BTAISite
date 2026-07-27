# PLAN-003: Repo hygiene purge (committed artifacts and scratch files)

**Status**: Executed 2026-07-27 — see "Execution notes" below
**Effort**: S · **Risk**: Low

## Execution notes (2026-07-27)

35 files removed, 2 relocated, `.gitignore` hardened. `npm run type-check`, the full
vitest suite (26 files / 145 tests passed, 1 skipped) and `next build` all pass.

Four places where the plan as written was wrong, and what was done instead:

1. **`scripts/backup/init_backup.sh` was a 3-line stub; the root copy was the real
   50-line script.** Step 2 says "delete the root copy and keep `scripts/backup/`" —
   following that literally would have destroyed the only working implementation. The root
   copy's `SOURCE_REPO="$(... /../..)"` pathing also only resolves correctly from
   `scripts/backup/`, confirming it was a misplaced copy rather than a root-local variant.
   Resolved by moving the root implementation over the stub.
   `setup_backup.sh`, `ssh_backup.sh` and `simple_backup.sh` did follow the plan — their
   `scripts/backup/` twins are the more robust versions (relative pathing, `|| exit 1`),
   and the root copies were stale (one hard-coded a OneDrive path).

2. **`middleware.ts.bak` and `middleware.ts.bak-hybrid` do not exist**, and neither does
   the root `middleware.ts` the plan tells you to preserve. No root middleware has existed
   for some time; only the dead `app/middleware.ts`, which is PLAN-004's to remove.

3. **The validation block references `__tests__/middleware.test.ts`, which was deleted.**
   A vitest filter matching zero files is silently ignored when other filters match, so
   that command would have passed while covering less than it claims. The full suite was
   run instead.

4. **"Nothing tracked is a secret — verified" was true, but the sweep behind it was not
   sound.** Re-verified with patterns that actually match: no credential of any shape is
   tracked. But two recon items were: a LAN address in `dev-server.log` (removed here) and
   two internal host addresses in a strategy doc (removed in PR #68). The earlier private-IP
   sweep used `\b...\b`, which is not POSIX ERE, so `git grep -E` silently matched nothing.
   The same premise is restated in `ROADMAP.md` and has been annotated there.

Also found and closed: **7 tracked files were shadowed by `.gitignore`'s existing `*.log`
rule** — tracked despite being ignored, so no ignore rule protected them. This class is
invisible to `git ls-files | git check-ignore --stdin`, which skips tracked paths unless
`--no-index` is passed. All 7 are removed here; the correct check now reports clean.

`tailwind.config.cjs` deletion verified safe beyond the `@config` grep: the built CSS still
contains 14 media queries at the expected breakpoints, and the brand colours resolve from
the `@theme` block in `app/globals.css` (`--color-primary: rgb(91, 144, 176)` = `#5B90B0`),
not from the deleted file.

## Context

This is a **public** repo with 614 tracked files, roughly 40 of which are build
artifacts, logs, scratch notes, `.bak` copies, and abandoned one-off scripts committed
over the project's life. They add clone weight, mislead readers (and AI agents) about
what is live, and look unprofessional on a public marketing company's repo. This plan is
pure deletion + `.gitignore` hardening. Deleting _code_ (dead components, dead deps) is
deliberately excluded — that is PLAN-004, which needs more careful verification.

## Goal / Non-goals

**Goal**: No logs, scratch files, generated reports, or `.bak` copies tracked in git;
`.gitignore` prevents recurrence.
**Non-goals**: Git history rewrite (nothing tracked is a secret — verified; explicitly an
anti-goal, see ROADMAP.md); deleting source code or dependencies (PLAN-004); pruning
stale `docs/*.md` content files (PLAN-012).

## Current state

All of the following are **git-tracked** (verified via `git ls-files` on 2026-07-03):

Generated reports / logs (root): `audit-report.txt`, `npm-audit.json`,
`security-audit.json`, `sbom.json` (1.27 MB), `sbom-npm-list.json` (490 KB),
`dev-server.log`, `server.log`, `test-results.log`, `post-export-log.txt`,
`logs/eslint-fixes-*.log` (4 files), `github-logs/README.md`,
`github-logs/workflow_runs.json`.

Scratch / temp: `commit_message.txt`, `commit_message2.txt`, `commit_now.txt`,
`temp_page.html` (0 bytes), `test-globe.html`.

Backups: `babel.config.js.bak`, `middleware.ts.bak`, `middleware.ts.bak-hybrid`,
`backups/middleware.ts.bak`, `app/page.tsx.backup`.

Backup scripts duplicated at root AND in `scripts/backup/`: `init_backup.sh`,
`main_backup.sh` (root only), `setup_backup.sh`, `simple_backup.sh`, `ssh_backup.sh`.

Dead dev servers (root; not referenced by any `package.json` script — verify before
deleting): `minimal-server.js`, `minimal-server.cjs`, `safari-server.js`,
`test-server.js`. **KEEP `server.js`** — it is live (`npm run dev` = `node server.js`).

Dead test/route scraps inside `app/`: `app/test-page.tsx`, `app/simple-test.tsx`,
`app/simple-layout.js`.

Dead config: `tailwind.config.cjs` — Tailwind v4 (in use, `package.json:117,131`) only
reads a JS config via an explicit `@config` directive; verify none exists (step 3).

## Target state

All files above removed from the index and working tree; `.gitignore` extended so none of
these classes can be re-committed; build and tests unaffected.

## Steps

1. Reference check (must return nothing before each deletion group):
   ```bash
   grep -rn --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git \
     -e "minimal-server" -e "safari-server" -e "test-server" \
     -e "test-globe" -e "simple-layout" -e "simple-test" -e "test-page" \
     package.json scripts/ ci/ .github/ app/ next.config.js server.js
   ```
   Any hit = investigate before deleting that file; do not delete a referenced file.
   Expected hits to ignore: none. (`docs/*.md` mentions are fine — stale docs are
   PLAN-012's problem.)
2. Backup-script dedup: `diff` each root `*_backup.sh` against its `scripts/backup/`
   twin. If identical or trivially divergent, delete the root copy and keep
   `scripts/backup/`. `main_backup.sh` has no twin — move it to `scripts/backup/`.
3. Tailwind config: confirm `grep -rn "@config" app/globals.css src/app/globals.css`
   returns nothing, then delete `tailwind.config.cjs`.
4. Delete everything listed in Current state via `git rm` (use `git rm -r` for `logs/`,
   `github-logs/`, `backups/`). Delete `middleware.ts.bak*` but NOT `middleware.ts`
   (live) and NOT `app/middleware.ts` (dead, but its removal is PLAN-004's — it is code,
   and CLAUDE.md currently documents it).
5. Append to `.gitignore` (keep existing entries; add only what's missing):
   ```
   *.log
   logs/
   github-logs/
   sbom*.json
   npm-audit.json
   security-audit.json
   audit-report.txt
   commit_message*.txt
   commit_now.txt
   *.bak
   *.backup
   backups/
   temp/
   tsconfig.tsbuildinfo
   ```
6. Confirm the working tree still contains untracked-but-ignored dirs (`coverage/`,
   `playwright-report/`, `test-results/`, `temp/`) — leave them on disk, they are
   already ignored.

## Security & compliance notes

Reduces public exposure of internal tooling output (`workflow_runs.json`, audit reports
enumerate dependency versions — mild recon value to an attacker). Verified no tracked
file contains secrets (`.env*` untracked; standards-check.yml §"No .env files in git"
passes). No permissions or data-handling changes. Do NOT rewrite history.

## Validation

```bash
npm run type-check && npm run build
npx vitest run __tests__/components __tests__/integration __tests__/middleware.test.ts __tests__/next-config.test.ts
git ls-files | grep -E '\.(bak|backup|log)$|commit_|sbom|_backup\.sh$' \
  | grep -v scripts/backup   # → empty
```

The PLAN-002 quality gate (if already merged) passing on the PR is the executable proof.

## Rollback

Single revert restores all files; they are inert data.
