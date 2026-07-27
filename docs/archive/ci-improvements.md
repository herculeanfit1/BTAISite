# CI & Test Infrastructure Improvements

This document outlines the improvements made to the CI pipeline and test infrastructure for more reliable builds and tests.

## Summary of Changes

1. **Node.js Version Standardization**

   - Set Node.js v20.19.1 across all GitHub Actions workflows
   - Added .nvmrc file for local development consistency
   - Added engines field to package.json

2. **GitHub Actions Modernization**

   - Updated all GitHub Actions from v3 to v4
   - Added workflow retry logic for flaky tests
   - Created a new improved test workflow with better debugging
   - Added job summaries for better reporting

3. **Test Reliability Improvements**

   - Added retry capabilities to Vitest configuration
   - Increased test timeouts for network-dependent tests
   - Created responsive testing utilities
   - Fixed aspect ratio and style comparison inconsistencies

4. **Git Hooks & Automation**

   - Added Husky for Git hooks
   - Configured lint-staged to run checks only on changed files
   - Created automation script to fix common component test issues

5. **Dependency Management**
   - Pinned all dependencies to exact versions
   - Added comprehensive dependency validation checks
   - Configured Dependabot for security updates only

## Usage Guide

### Local Development

For local development, use the correct Node.js version:

```bash
# Use the correct Node.js version
nvm use

# Install dependencies
npm install

# Run tests with automatic fixes
npm run fix:tests && npm run test:unit
```

### Understanding CI Failures

When CI tests fail:

1. Check if it's a Node.js version issue (EBADENGINE warnings)
2. Look for timeout errors, which may indicate network flakiness
3. For component test failures, run the fix script: `npm run fix:tests`
4. For persistent issues, check the component-specific sections below

### Component-Specific Testing Notes

#### OptimizedImage

- The `priority` attribute must be a string, not a boolean
- Use proper aspect ratio format in tests (4 / 3 vs 4/3)

#### BookingEmbed

- Loading spinner needs `role="status"` for accessibility tests
- Network timeouts can cause flaky tests

#### Newsletter

- Validation errors need proper data-testid attributes
- Class propagation must be properly handled

## Future Improvements

- [ ] Migrate to more reliable testing library for UI components
- [ ] Add visual regression testing with screenshot comparisons
- [ ] Implement test coverage gates in CI
- [ ] Add performance benchmarking for critical paths
