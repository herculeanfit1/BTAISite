# GitHub Workflows

This directory contains the GitHub Actions workflows for the Bridging Trust AI project.

## Active Workflows

| Workflow | File | Trigger |
|----------|------|---------|
| Azure Static Web Apps Deployment | `cost-optimized-ci.yml` | Push to `main`, PRs to `main` |
| Dependabot Security Review | `dependabot-security.yml` | Dependabot PRs only |

## Deployment Workflow (`cost-optimized-ci.yml`)

Three jobs, only one runs per trigger:

- **`deploy-main-to-azure`** — Push to `main`: build + deploy to Azure SWA
- **`deploy-pr-to-azure`** — PR opened/updated: build + deploy preview
- **`cleanup-pr`** — PR closed: tear down preview environment

Local validation (`npm run validate`) is required before pushing — the workflow is deployment-only with no CI/CD pipeline.

## Dependabot Workflow (`dependabot-security.yml`)

Runs `npm audit` and tests on Dependabot PRs, then auto-comments results.
