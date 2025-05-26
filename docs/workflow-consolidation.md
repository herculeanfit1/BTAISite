# GitHub Actions Workflow Consolidation

This document details the consolidation of GitHub Actions workflows to improve maintainability
and reduce duplication in our CI/CD infrastructure.

## Consolidated Workflows

The following workflows have been merged into the main `ci-pipeline.yml` workflow:

1. **hybrid-tests.yml** - Docker-based testing capabilities integrated
2. **improved-tests.yml** - Component and API testing with retry logic integrated
3. **security-tests.yml** - Security scanning moved to Dependabot workflow and main pipeline
4. **ui-tests.yml** - Redundant with E2E tests in main pipeline
5. **playwright.yml** - Consolidated with other E2E testing
6. **performance-security-tests.yml** - Performance tests merged into main pipeline

## Remaining Core Workflows

1. **ci-pipeline.yml** (enhanced)
2. **dependabot-security.yml**
3. **dependency-checks.yml**
4. **deploy.yml**
5. **azure-static-web-apps.yml**
6. **visual-regression.yml**
7. **backup-repository.yml**

## Changes Made

- Added Docker-based testing to ci-pipeline.yml
- Added retry logic for flaky tests in main pipeline
- Ensured all actions use v4 of GitHub Actions
- Updated Node.js version to 20.19.1 consistently
- Added comprehensive test summary
- Added security testing to main pipeline
- Standardized artifacts and retention policies

## Benefits of Consolidation

1. **Reduced CI Duplication**: Eliminated duplicate jobs across multiple workflows
2. **Easier Maintenance**: Changes to CI logic only need to be made in fewer places
3. **Consistent Approach**: Standardized environment and artifact handling
4. **Better Visibility**: Consolidated test summary provides overview of all tests
5. **Reduced CI Resource Usage**: Fewer redundant jobs running in parallel
6. **Simpler Debugging**: Centralized logs for related test processes
