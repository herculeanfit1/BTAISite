# Testing Requirements - Bridging Trust AI

## 🚨 MANDATORY PRE-COMMIT TESTING PROTOCOL

**ALL CODE CHANGES MUST PASS COMPREHENSIVE TESTING BEFORE COMMIT/PUSH**

### Required Testing Sequence

1. **Core Functionality Tests**
   ```bash
   npm run test:ci-basic
   ```
   - Tests all components in `__tests__/components/`
   - Tests all API endpoints in `__tests__/api/`
   - Tests middleware and configuration
   - **MUST PASS 100% before proceeding**

2. **Static Build Validation**
   ```bash
   npm run build:static
   ```
   - Ensures static export works correctly
   - Validates no API route conflicts
   - Confirms all dependencies resolve
   - **MUST COMPLETE WITHOUT ERRORS**

3. **Additional Test Suites (when applicable)**
   ```bash
   npm run test:integration    # For integration changes
   npm run test:e2e           # For UI/UX changes
   npm run test:security      # For security-related changes
   ```

### Test Coverage Requirements

#### Component Tests (`__tests__/components/`)
- ✅ All React components must have unit tests
- ✅ Test rendering, props, user interactions
- ✅ Test error states and edge cases
- ✅ Minimum 90% code coverage for critical components

#### API Tests (`__tests__/api/`)
- ✅ All API endpoints must have tests
- ✅ Test success and error responses
- ✅ Test input validation and sanitization
- ✅ Test rate limiting and security measures

#### Configuration Tests
- ✅ Next.js configuration validation
- ✅ Middleware functionality tests
- ✅ Environment variable handling
- ✅ Static export compatibility

### Failure Resolution Protocol

**If ANY test fails:**

1. **STOP** - Do not commit or push
2. **ANALYZE** - Review test output and error messages
3. **FIX** - Resolve the underlying issue
4. **RE-TEST** - Run full test suite again
5. **REPEAT** - Until all tests pass

### Common Test Failures and Solutions

#### Component Test Failures
- **Missing imports**: Ensure all dependencies are properly imported
- **Props mismatch**: Verify component interfaces match test expectations
- **DOM queries**: Update selectors if component structure changed

#### Build Failures
- **API route conflicts**: Remove API routes when using static export
- **Import errors**: Check TypeScript path mappings in tsconfig.json
- **Missing dependencies**: Run `npm install` if packages were added/removed

#### Integration Failures
- **Environment variables**: Ensure test environment has required variables
- **Mock setup**: Verify mocks are properly configured
- **Async operations**: Check for proper async/await handling

### GitHub Actions Integration

This testing protocol prevents:
- ❌ Failed deployments
- ❌ Wasted GitHub Actions minutes
- ❌ Broken production builds
- ❌ Regression bugs

### Enforcement

**This protocol is MANDATORY for:**
- All feature additions
- All bug fixes
- All refactoring
- All dependency updates
- All configuration changes

**No exceptions** - Quality and stability are non-negotiable.

---

*Last updated: 2025-05-26*
*Next review: When testing requirements change* 