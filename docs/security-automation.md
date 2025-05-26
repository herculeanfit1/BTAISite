# Security Automation with Dependabot

This document explains how we've configured Dependabot to automatically handle security updates and vulnerability scanning for the BridgingTrustAI project.

## Configuration Overview

We use Dependabot for:

1. **Weekly dependency scanning**: Automatically checks for outdated packages
2. **Security vulnerability detection**: Identifies packages with security issues
3. **Automatic PR creation**: Creates pull requests to update vulnerable dependencies

## Workflow Integration

The `.github/workflows/dependabot-security.yml` workflow automatically runs additional security checks on Dependabot PRs:

1. **NPM security audit**: Checks for vulnerabilities in production dependencies
2. **Security tests**: Runs tests to verify middleware and Next.js security configurations

## Configuration Files

### 1. Dependabot Configuration (`.github/dependabot.yml`)

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "security"
    # Enable vulnerability checks
    security-updates-only: false
    # Version settings
    versioning-strategy: increase-if-necessary
    # Assign reviewers
    reviewers:
      - "bridgingtrustai-admin"
```

### 2. Security Workflow (`.github/workflows/dependabot-security.yml`)

```yaml
name: Dependabot Security Review
on:
  pull_request:
    branches: [main]

permissions:
  contents: read
  pull-requests: write

jobs:
  security-scan:
    if: ${{ github.actor == 'dependabot[bot]' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20.19.1"
          cache: "npm"
      - name: Install dependencies
        run: npm ci
      - name: Run security audit
        run: npm run security:audit
      - name: Run security tests
        run: npm run test:security
      - name: Add approval comment
        if: success()
        uses: actions/github-script@v7
        with:
          github-token: ${{secrets.GITHUB_TOKEN}}
          script: |
            const prNumber = context.issue.number;
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: prNumber,
              body: '✅ Security checks passed! This PR can be safely merged after code review.'
            });
```

## Available Security Scripts

The following npm scripts are available for security testing:

- `npm run security:audit`: Runs npm audit on production dependencies
- `npm run security:audit:full`: Runs full npm audit and saves results to JSON
- `npm run test:security`: Runs tests for middleware and Next.js config security

## Best Practices

1. **Review Dependabot PRs promptly**: Security updates should take priority
2. **Don't ignore audit failures**: Always address reported vulnerabilities
3. **Keep Node.js version up-to-date**: Currently using v20.19.1
4. **Run security tests locally**: Use `npm run test:security` before merging changes

## Troubleshooting

If Dependabot PRs fail security checks:

1. Check the workflow logs for details
2. Run the failing tests locally to debug
3. Consult the npm audit documentation for mitigation options
