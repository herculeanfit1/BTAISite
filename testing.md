# Testing Strategy for Bridging Trust AI

This document outlines our comprehensive testing approach that combines Docker-based consistency with local environment coverage.

## Testing Philosophy

Our hybrid testing model addresses three key needs:

1. **Environment Consistency** - Docker ensures tests run in identical environments regardless of local setup
2. **Real-world Coverage** - Local tests capture browser-specific behaviors and edge cases
3. **Performance Validation** - Specialized tests ensure optimal site performance and accessibility

## Test Types

### Unit Tests

- **Location**: `__tests__/` directory
- **Framework**: Jest
- **Purpose**: Test individual functions, components, and utilities in isolation
- **Run Command**: `npm run test:unit`

### Integration Tests

- **Location**: `__tests__/api/` directory
- **Framework**: Jest
- **Purpose**: Test API endpoints, data fetching, and component interactions
- **Run Command**: `npm run test:integration`

### E2E Tests

- **Location**: `src/uitests/` directory
- **Framework**: Playwright
- **Purpose**: Test complete user flows in real browser environments
- **Run Command**: `npm run test:e2e`

### Security Tests

- **Location**: `src/uitests/security.spec.ts`, `src/uitests/contact-validation.spec.ts`
- **Framework**: Playwright
- **Purpose**: Validate security headers, rate limiting, and input validation
- **Run Command**: `npm run test:security`

### Visual Regression Tests

- **Location**: `src/uitests/visual/` directory
- **Framework**: Playwright
- **Purpose**: Ensure UI remains consistent across changes
- **Run Command**: `npm run test:visual`

### Performance Tests

- **Location**: `src/uitests/performance/` directory
- **Framework**: Playwright + Lighthouse
- **Purpose**: Measure load times, bundle sizes, and core web vitals
- **Run Command**: `npm run test:performance`

## Testing Environments

### Docker-based Testing

- **Purpose**: Provides consistent, reproducible testing environment
- **Best for**: Unit and integration tests where environment consistency is critical
- **Run Command**: `npm run test:docker`
- **Configuration**: `Dockerfile.test`

### Local Testing

- **Purpose**: Tests in real browser environment with real-world networking
- **Best for**: E2E tests, visual tests, and performance tests
- **Run Command**: `npm run test:local`

### Hybrid Testing

- **Purpose**: Combines Docker consistency with local environment coverage
- **Run Command**: `npm run test:hybrid`
- **What it runs**:
  - Unit tests in Docker
  - Integration tests in Docker
  - E2E tests in local environment

## CI/CD Pipeline

Our GitHub Actions workflow (`hybrid-tests.yml`) implements this hybrid approach:

1. **Docker Tests Job**:

   - Runs unit and integration tests in Docker
   - Uploads test results as artifacts

2. **Local E2E Tests Job**:

   - Runs E2E tests in a standard GitHub runner environment
   - Uses actual browsers with Playwright
   - Uploads test results as artifacts

3. **Performance Tests Job**:
   - Runs after both Docker and E2E tests succeed
   - Executes performance and Lighthouse tests
   - Uploads performance reports as artifacts

## Running Tests Locally

### All Tests

```bash
# Run all tests in hybrid mode (recommended)
npm run test:hybrid

# Run all tests in Docker only
npm run test:docker

# Run all tests locally only
npm run test:local
```

### Specific Test Types

```bash
# Unit tests
npm run test:docker:unit   # In Docker
npm run test:local:unit    # Local environment

# Integration tests
npm run test:docker:integration  # In Docker
npm run test:local:integration   # Local environment

# E2E tests
npm run test:docker:e2e    # In Docker
npm run test:local:e2e     # Local environment

# Security tests
npm run test:security

# Visual regression tests
npm run test:visual
npm run test:visual:update  # Update baseline snapshots

# Performance tests
npm run test:performance
npm run test:lighthouse     # Lighthouse only
```

## Writing New Tests

### Unit Tests

Create in `__tests__/` directory following Jest conventions:

```typescript
import { render, screen } from '@testing-library/react';
import { ComponentName } from '@/app/components/ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### E2E Tests

Create in `src/uitests/` directory following Playwright conventions:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature name", () => {
  test("should perform expected action", async ({ page }) => {
    await page.goto("/page-path");
    await page.getByRole("button", { name: "Click Me" }).click();
    await expect(page.getByText("Success")).toBeVisible();
  });
});
```

## Best Practices

1. **Test Isolation**: Each test should be independent of others
2. **Mock External Services**: Use mocks for third-party APIs and services
3. **Use Data Attributes**: Add `data-testid` attributes to simplify selectors
4. **Test Edge Cases**: Include tests for error states and edge conditions
5. **Keep Tests Fast**: Unit and integration tests should execute quickly
6. **Visual Regression Baseline**: Update visual snapshots only when design changes are intentional
7. **Security Focus**: Always add tests when implementing security features
8. **Performance Budgets**: Set thresholds for bundle sizes and load times

## Troubleshooting

### Docker Test Issues

- Check Docker installation: `docker --version`
- Ensure Docker daemon is running
- Make sure Docker has sufficient resources allocated

### Playwright Test Issues

- Update Playwright: `npx playwright install --with-deps`
- Check browser installations: `npx playwright install chromium firefox webkit`
- Increase timeouts for slow operations
- Use debugging tools: `PWDEBUG=1 npm run test:e2e`

### CI Pipeline Issues

- Check GitHub Actions logs for detailed error information
- Verify environment variables are properly set
- Check if tests are timing out due to resource constraints
