# Docker-Based Testing Guide

## Overview

The Bridging Trust AI project uses Docker for all testing to ensure consistent behavior across development, CI, and production environments. This approach solves platform-specific dependency issues (particularly with Rollup modules) and guarantees tests run identically everywhere.

## Table of Contents

- [Why Docker Testing?](#why-docker-testing)
- [Quick Start](#quick-start)
- [Available Commands](#available-commands)
- [Test Results and Coverage](#test-results-and-coverage)
- [Using Docker Test Script Directly](#using-docker-test-script-directly)
- [CI/CD Integration](#cicd-integration)
- [How It Works](#how-it-works)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Maintenance](#maintenance)
- [Questions?](#questions)

## Why Docker Testing?

Docker-based testing provides multiple advantages:

- **Environment consistency**: Tests run in the same environment regardless of your local OS (macOS, Windows, Linux)
- **No platform-specific issues**: Eliminates problems with dependencies like Rollup modules that require specific OS/architecture binaries
- **Production parity**: Tests run in an environment similar to production, catching deployment issues early
- **Reproducible results**: All team members get the same test results, eliminating "works on my machine" problems
- **CI/CD alignment**: Local tests match what happens in CI pipelines, reducing surprises in the build process

## Quick Start

Run quick tests (unit + middleware):

```bash
npm run test:docker:quick
```

Run all tests:

```bash
npm run test:docker
```

For pre-commit testing of affected components:

```bash
npm run test:docker:affected
```

## Available Commands

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run test:docker:quick` | Run essential tests (fastest option) | Daily development, quick feedback |
| `npm run test:docker:unit` | Run unit tests only | Component-level testing |
| `npm run test:docker:integration` | Run integration tests only | Testing component interactions |
| `npm run test:docker:middleware` | Run middleware tests only | Testing routing and security rules |
| `npm run test:docker:config` | Run config tests only | Testing Next.js configuration |
| `npm run test:docker` | Run all tests | Before submitting PRs |
| `npm run test:docker:affected` | Run tests for affected components | Pre-commit hooks |

## Test Results and Coverage

After running Docker tests, results are available in:

- `./coverage` - Code coverage reports including HTML reports (open `./coverage/index.html` in your browser)
- `./test-results` - Test results data in JSON format for CI integration

## Using Docker Test Script Directly

For more control, use the Docker test script directly with custom options:

```bash
./scripts/docker-test.sh -t <test-type>
```

Available test types:
- `quick` (default): Runs unit + middleware tests
- `unit`: Runs unit tests
- `integration`: Runs integration tests
- `middleware`: Runs middleware tests
- `config`: Runs config tests
- `all`: Runs all tests

Use the `-h` flag for help:

```bash
./scripts/docker-test.sh -h
```

## CI/CD Integration

The CI pipeline uses Docker for all tests, ensuring consistency with local development. The GitHub workflow has been updated to:

1. Run all tests in Docker containers
2. Make tests required (not optional)
3. Standardize the testing process across all environments

Example CI configuration (from `.github/workflows/ci-pipeline.yml`):

```yaml
docker-tests:
  name: Docker-based Tests
  runs-on: ubuntu-latest
  timeout-minutes: 30
  needs: lint
  steps:
    - name: Checkout repository
      uses: actions/checkout@v4
    
    - name: Set up Docker
      uses: docker/setup-buildx-action@v3.10.0
      
    - name: Build test Docker image
      run: docker build -t bridging-trust-tests -f Dockerfile.test .
      
    - name: Run Unit Tests in Docker
      run: docker run --name unit-tests bridging-trust-tests npm run test:unit
    
    - name: Copy unit test results
      run: docker cp unit-tests:/app/coverage ./coverage
      
    # ... more test steps ...
```

## How It Works

Our Docker testing solution consists of three main components:

### 1. Dockerfile.test

The `Dockerfile.test` file defines a Debian-based Node.js environment with all necessary dependencies:

```dockerfile
FROM node:20.19-slim AS base

# Environment setup
ENV NODE_ENV=test
ENV CI=true

# Install system dependencies (Playwright, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget curl gnupg ca-certificates ...

# Install dependencies and fix Rollup modules
COPY package*.json ./
COPY scripts/fix-rollup-docker.js ./scripts/
RUN npm ci && node ./scripts/fix-rollup-docker.js

# Copy application code
COPY . .

# ... additional setup ...
```

### 2. Scripts/fix-rollup-docker.js

This script solves the platform-specific Rollup module issue by:

1. Attempting to install all Linux-specific Rollup modules
2. Creating fallback modules if installation fails
3. Ensuring tests run regardless of architecture mismatches

### 3. Scripts/docker-test.sh

The test runner script that:

1. Builds or rebuilds the Docker image when needed
2. Mounts volumes for test results and coverage
3. Runs the specified test command in Docker
4. Reports test results

## Troubleshooting

### Docker Image Issues

If you encounter problems with the Docker image:

```bash
# Force rebuild the image
docker rmi bridging-trust-tests
./scripts/docker-test.sh
```

### Volume Mounting Issues

If test results or coverage aren't appearing in your local directories:

1. Check Docker permissions: Docker needs permission to mount volumes from your local filesystem
2. Verify paths: Ensure the local paths exist and are writable
3. Check Docker Desktop settings: On macOS and Windows, verify file sharing is enabled

### Test Failures

If tests pass locally but fail in CI (or vice versa), it's likely due to:

1. **Environment variables**: Check that all required variables are set correctly
2. **Timing-sensitive tests**: Tests that depend on timing might behave differently in Docker
3. **Path differences**: Path handling can differ between Windows/macOS and Linux

To debug test failures:

```bash
# Run tests with more verbose output
docker run --rm -v "$(pwd)/test-results:/app/test-results" bridging-trust-tests npm run test:unit -- --reporter=verbose
```

## Best Practices

1. **Always run tests in Docker before pushing changes** to catch environment-specific issues early
2. **Use `npm run test:docker:quick` for rapid feedback** during development
3. **Run `npm run test:docker` before submitting PRs** to ensure all tests pass
4. **Keep the Docker image updated** when dependencies change
5. **Add new test types to docker-test.sh** when creating new test categories

## Maintenance

The Docker test environment is defined in these files:

- `Dockerfile.test`: The container definition
- `docker-compose.test.yml`: Multi-container setup for complex tests
- `scripts/docker-test.sh`: Helper script for running tests
- `scripts/docker-cleanup.sh`: Cleanup script for test containers
- `scripts/fix-rollup-docker.js`: Rollup module fix script

When updating dependencies:

1. Rebuild the Docker image: `docker rmi bridging-trust-tests && ./scripts/docker-test.sh`
2. Update CI pipelines if necessary

## Questions?

If you have issues with Docker testing, please contact the development team or file a GitHub issue. 