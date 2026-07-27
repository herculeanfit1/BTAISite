# ADR-0004: Gate correctness in cloud CI, with a repo-owned workflow

**Status**: Accepted
**Date**: 2026-07-27
**Supersedes**: nothing. **Superseded by**: nothing.

## Context

Cloud CI for this repository was **deployment-only by design** — `cost-optimized-ci.yml`
says so in its own header. `standards-check.yml` ran ESLint and `security-scan.yml` ran
Trivy, both canonical fleet files that must not be edited per-repo.

Verified on 2026-07-27, not assumed:

```
$ grep -rlE "npm run build|type-check|vitest" .github/workflows/
(no matches)

$ gh api .../branches/main/protection/required_status_checks --jq '.contexts'
["Standards Compliance","Trivy filesystem scan","Trivy IaC config scan",
 "Trivy secrets scan","Gate on HIGH / CRITICAL"]
```

Five required checks, every one of them lint or scan. **A pull request that failed to
compile could merge**, and the push-to-main deploy fired with no `needs:` on anything. The
only correctness gate was an optional ~15-minute local script that nobody was forced to
run.

## Decision

**Add a repo-owned `Quality Gate` workflow and make it a required status check.**

1. `.github/workflows/quality-gate.yml` runs `npm ci` → `type-check` →
   `npm run test:coverage` → `next build` on every PR and on push to `main`. It is
   **repo-owned**, marked as such in its header, because the canonical fleet workflows
   must not be edited per-repo.
2. It runs the **entire** test suite, never a pinned path list. A vitest path filter that
   matches zero files is silently ignored as long as another filter matches, so a stale
   entry makes a gate quietly cover less than it claims while staying green.
3. Coverage thresholds are enforced in the same step, at the **measured baseline**, and are
   identical in CI and locally. A `process.env.CI ? 30 : 70` split had previously meant the
   number that actually gated was never the number anyone read.
4. Lint is deliberately **not** duplicated — `standards-check.yml` already runs
   `npx eslint .`.
5. **No job is created for the retired `api/` tree.** A required check whose target is
   scheduled for deletion blocks every PR the moment the teardown lands.

## Consequences

- Broken builds and failing tests cannot merge. This is the gate every later plan relies on.
- Coverage can only ratchet upward: thresholds sit just under the measured baseline, so a
  regression fails rather than being waved through.
- CI cost rises by roughly ninety seconds per PR. Accepted.
- Branch protection now requires the head branch to be up to date, so merging a stack means
  `gh pr update-branch` per PR and waiting for a fresh run. `--admin` is not used;
  `enforce_admins` is deliberately on.
- Adding a required context is a **one-way door in the short term**: the check must have
  reported on `main` before it can be required, or every open PR blocks immediately.
