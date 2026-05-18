# Herculean Ecosystem Standards — Non-Agent (External Repos)

Version 1.0 — Last updated 2026-05-07

This document defines the security and hygiene baseline for repos in Terence's GitHub footprint that are **not** part of the Herculean ecosystem. These standards exist so HerculeanHydra (the ecosystem gatekeeper) can bring all of `~/dev/` to a defensible posture, not only the agent repos.

For Herculean agent repos, see `STANDARDS.md` (Node), `config/standards/STANDARDS-python.md`, or `config/standards/STANDARDS-NONCODE.md`.

Compliance verification is operator-driven during initial rollout; automated checks via `checks/standards-compliance.js` follow once the rollout settles.

---

## 1. Scope

Applies to repos that:

- Are owned by `herculeanfit1` (or other Terence-controlled accounts)
- Are **not** one of the active Herculean agent repos
- Have a `.git/` and a `github.com` remote

Examples (as of 2026-05-07): AIStudyPlans, BTAI-AgencySwarm, BTAISite, DudeDash, Dude-cc, engram, FlowState, LaunchBrief, NameBridge, SchedulEd, synod, Agora.

---

## 2. What this standard does NOT require

These items are Herculean-ecosystem-specific and not enforced for non-agent repos:

- `STANDARDS.md` at repo root
- `CLAUDE.md` at repo root
- Ganoe TOC pattern + `rules/` directory
- 1Password vault naming `BTAI-CC-{AgentName}`
- `standards-check.yml` workflow (Herculean drift detection)

If a non-agent repo voluntarily includes any of these, that is fine — but they are not gating.

---

## 3. Security Scanning

**REQUIRED.** Every non-agent private repo must run the canonical Variant B Trivy workflow.

| Item | Value |
|---|---|
| Workflow file | `.github/workflows/security-scan.yml` |
| Source | HerculeanOlympus `config/security-scan/variant-b.yml` |
| Allowlist | `.trivyignore` at repo root (header-only template) |
| Severity policy | HIGH + CRITICAL gate; MEDIUM informational; LOW + unfixed suppressed |
| Self-hosted runner | `runs-on: [self-hosted, herculean, linux]` |
| GHAS posture | `continue-on-error: true` on `upload-sarif` (private repos without GHAS) |

Variant A (adds `scan-images`) is allowed if the repo has `docker-compose*.yml` or `stacks/*.yml` referencing images. Default is B.

Suppressions in `.trivyignore` must include an inline `# YYYY-MM-DD: <reason>` comment and are reviewed quarterly.

---

## 4. Dependency updates

**REQUIRED.** `.github/dependabot.yml` derived from HerculeanOlympus `config/dependabot.yml.template`. Uncomment ecosystems applicable to the repo:

- `github-actions` always
- `pip` if Python
- `npm` if Node
- `docker` if Dockerfile present

Cadence: weekly Monday 14:00 UTC. **Renovate is not used.**

---

## 5. .gitignore minimums

**REQUIRED.** Every `.gitignore` must include at minimum:

```
.env
.env.local
.env.bak
.env.backup
.DS_Store
*.log
_diag/
```

Plus language-specific:

- Python: `.venv/`, `__pycache__/`, `*.pyc`
- Node: `node_modules/`, build output dirs (`.next/`, `dist/`, `build/` as applicable)

---

## 6. Branch Protection

**REQUIRED on default branch.**

- Force pushes blocked
- `enforce_admins.enabled: true`
- `Gate on HIGH / CRITICAL` (Trivy gate) **may** be required at operator discretion (recommended once the workflow has run cleanly for ~1 week)
- Standards Compliance check **not** required (Herculean-only)

Configure via:

```bash
gh api -X PUT repos/{owner}/{name}/branches/main/protection \
  -F required_status_checks=null \
  -F enforce_admins=true \
  -F required_pull_request_reviews=null \
  -F restrictions=null \
  -F allow_force_pushes=false
```

---

## 7. Pre-commit hooks

**RECOMMENDED.** `.pre-commit-config.yaml` with at minimum the no-dot-env hook:

```yaml
repos:
  - repo: local
    hooks:
      - id: no-dot-env
        name: Block .env commits
        entry: >
          bash -c 'for f in "$@"; do case "$f" in .env|.env.local|.env.bak|.env.backup) echo "BLOCKED: $f"; exit 1;; esac; done' --
        language: system
        files: '\.env'
```

Install via `pre-commit install` after cloning. Not gating; included so the protection from the same hook in agent repos extends to non-agent ones too.

---

## 8. Visibility

**REQUIRED.** Repos default to **private**. Public visibility requires explicit operator decision (open-source publication, demo, public marketing, etc.) and triggers re-evaluation of:

- Self-hosted runner usage — **deregister before flipping public**, per [HerculeanHydra `docs/projects/security-runner-setup/`](https://github.com/herculeanfit1/HerculeanHydra/blob/main/docs/projects/security-runner-setup/README.md)
- `continue-on-error: true` on `upload-sarif` — flip to `false` once the repo is public (GHAS-equivalent code-scanning becomes available)
- Whether secrets in the codebase need rotation before publication

When auditing visibility, treat "default expected" as private; flag any public repo that has not been explicitly confirmed.

---

## 9. Dockerfile `FROM` pinning

**REQUIRED if Dockerfile present.** Every `FROM` line in every Dockerfile must pin to a manifest-list `@sha256:` digest:

```bash
docker buildx imagetools inspect <image>:<tag> --format '{{.Manifest.Digest}}'
```

Replace `FROM <image>:<tag>` with `FROM <image>:<tag>@sha256:<digest>`. Same as Tier 1 #4 of [HerculeanInfra `rules/security-baseline.md`](https://github.com/herculeanfit1/HerculeanInfra/blob/main/rules/security-baseline.md).

---

## 10. Compliance Verification

Operator-driven during initial rollout. Audit pattern: HerculeanHydra [`docs/projects/ecosystem-standards-sweeps/README.md`](https://github.com/herculeanfit1/HerculeanHydra/blob/main/docs/projects/ecosystem-standards-sweeps/README.md).

Future automation: extend `checks/standards-compliance.js` with a `non-agent` registry type that runs § 3, § 4, § 5, § 6, § 8, § 9 checks against a list of declared non-agent repos.

| Check | Severity |
|---|---|
| `security-scan.yml` missing | warning |
| `.trivyignore` missing | warning |
| `.github/dependabot.yml` missing | warning |
| `.gitignore` incomplete | warning |
| Branch protection missing on default branch | critical |
| Repo public without explicit allowlist | critical |
| Hardcoded secrets in committed code | critical |
| Unpinned `FROM` line in Dockerfile | warning |

---

## References

- HerculeanOlympus `STANDARDS.md` (full ecosystem standard — Node)
- HerculeanOlympus `config/standards/STANDARDS-python.md`
- HerculeanOlympus `config/standards/STANDARDS-NONCODE.md`
- HerculeanOlympus `config/security-scan/{variant-a,variant-b}.yml`
- HerculeanOlympus `config/dependabot.yml.template`
- HerculeanInfra `rules/security-baseline.md` (12-item baseline source)
- HerculeanHydra `docs/projects/ecosystem-standards-sweeps/README.md` (rollout plan)
- HerculeanHydra `docs/projects/security-runner-setup/README.md` (self-hosted runner spec)
