# GitHub Workflows

This directory contains the GitHub Actions workflows for the Bridging Trust AI project.

## Active Workflows

- `azure-static-web-apps.yml` - Main deployment workflow for Azure Static Web Apps
- `middleware-test.yml` - Tests for static export compatibility with middleware
- `visual-regression.yml` - Visual regression testing
- `hybrid-tests.yml` - Tests for hybrid rendering scenarios
- `dependency-checks.yml` - Security scanning for dependencies
- `dependabot-security.yml` - Dependabot security updates
- `backup-repository.yml` - Repository backup routine
- `auto-log-analysis.yml` - Automated log analysis

## Disabled Workflows

The following workflows have been disabled (renamed with `.disabled` extension) to prevent conflicts:

- `azure-static-web-apps-happy-rock-0a93fdf0f.yml.disabled` - Deprecated Azure deployment workflow
- `ci-pipeline.yml.disabled` - Legacy CI pipeline that duplicates functionality
- `deploy.yml.disabled` - Old deployment workflow

## Workflow Maintenance Guidelines

1. Always check for workflow conflicts before adding new workflows
2. Keep the number of concurrent workflows minimal to avoid resource contention
3. Use environment variables consistently across workflows
4. Document any workflow changes in commit messages
5. Test workflows on branches before merging to main 