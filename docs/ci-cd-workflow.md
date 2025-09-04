# Bridging Trust AI - CI/CD Workflow Documentation

This document provides an overview of the GitHub Actions workflow configurations used for the Bridging Trust AI project.

## Key Workflows

1. **Azure Static Web Apps Deployment** (`.github/workflows/azure-static-web-apps.yml`)

   - Builds, tests, and deploys the Next.js app to Azure Static Web Apps
   - Includes comprehensive test suites before deployment
   - Provides staging environments for pull requests

2. **Repository Backup** (`.github/workflows/backup-repository.yml`)

   - Creates daily backups of the codebase at 10pm
   - Automatically backs up after successful deployments
   - Supports manual triggering

3. **Hybrid Testing** (`.github/workflows/hybrid-tests.yml`)

   - Runs tests in both Docker containers (for consistency) and local environments (for real-world behavior)
   - Includes E2E, unit, integration, and performance tests
   - Artifacts are preserved for debugging

4. **UI Tests** (`.github/workflows/ui-tests.yml`)

   - Runs component and page tests
   - Performs visual regression testing

5. **Security Tests** (`.github/workflows/security-tests.yml`)

   - Runs specialized security tests

6. **Visual Regression Tests** (`.github/workflows/visual-regression.yml`)

   - Performs detailed visual regression testing

7. **General Playwright Tests** (`.github/workflows/playwright.yml`)
   - Runs core Playwright test suites

## GitHub Actions Configuration

To ensure compatibility with the GitHub Actions runner (version 2.323.0), we've standardized our workflow configurations:

1. **Consistent Action Versions**

   - All actions use the v2 versions (checkout@v2, setup-node@v2, upload-artifact@v2)
   - Using v2 versions ensures compatibility with the GitHub Actions runner

2. **Node.js Version**

   - All workflows use a specific Node.js version (18.17) instead of the LTS/\* tag
   - This ensures consistent Node.js behavior across all workflows

3. **Caching Strategy**

   - Removed npm caching that was causing 422 errors with the GitHub Actions cache service
   - Dependencies are installed fresh with `npm ci` to ensure clean builds

4. **Upload/Download Artifacts**
   - Using actions/upload-artifact@v2 and actions/download-artifact@v2 consistently
   - Configuring appropriate retention periods based on artifact importance

## Testing Strategy

Our testing approach combines multiple strategies:

1. **Docker-based Tests**

   - Run in isolated containers for consistency
   - Ideal for unit and integration tests

2. **Local Environment Tests**

   - Run in a similar environment to production
   - Better for E2E and real-world behavior testing

3. **Specialized Test Suites**
   - Security, performance, UI, and visual regression tests
   - Each has dedicated workflows and configurations

## Deployment Process

1. **Build and Test Phase**

   - Comprehensive test suite execution
   - Static export of Next.js app for Azure

2. **Deployment Phase**

   - Upload to Azure Static Web Apps
   - Automatic backup after successful deployment

3. **PR Environments**
   - Pull requests get their own staging environments
   - Environments are cleaned up when PRs are closed

## Troubleshooting

When experiencing GitHub Actions failures:

1. **Caching Issues**

   - If seeing "Error: Cache service responded with 422", check that caching is disabled
   - Ensure Node.js version is specified explicitly

2. **Action Version Compatibility**

   - Stick with v2 versions of GitHub Actions
   - Avoid mixing v2, v3, and v4 versions

3. **Artifact Upload/Download**
   - If artifacts are failing, check retention periods and path specifications
   - Ensure paths exist before upload attempts

## Required Secrets

The following secrets need to be configured in your GitHub repository settings:

1. **`AZURE_STATIC_WEB_APPS_API_TOKEN`** - Token for Azure Static Web Apps deployment
2. **`BACKUP_REPO_TOKEN`** - Personal Access Token with repo scope for backup repository
3. **`REPO_ACCESS_TOKEN`** - Token for triggering workflows between repositories

## Local Development

When developing locally, you can simulate the CI/CD process using:

```bash
# Run tests as they would run in CI
npm run test:full

# Build for Azure deployment
npm run azure-deploy
```

## Maintenance

1. **Regular Reviews:**

   - Monthly review of all GitHub Actions to ensure they're current
   - Check for deprecation notices in actions used
   - Update Node.js and npm dependencies

2. **Security Audits:**
   - Quarterly review of workflow permissions
   - Rotation of access tokens and secrets
   - Update security scanning tools and patterns
