# Testing Migration: From Jest to Vitest

## Initial Challenges

After upgrading to Next.js 15 and converting the project to use ESM modules (`"type": "module"` in package.json), we encountered several issues with the Jest test suite:

1. **ESM Compatibility**: Jest's support for ESM in the current configuration caused errors with imports and mocking
2. **Babel Configuration**: Despite having the correct babel dependencies installed, there were issues with resolving preset paths in the ESM context
3. **Mock Functions**: Jest's mocking system didn't work correctly in the ESM environment

## Solution: Migration to Vitest

After evaluating several options, we decided to migrate from Jest to Vitest for the following reasons:

1. **Native ESM Support**: Vitest has built-in support for ESM modules without complex configuration
2. **Compatibility with React 19**: Vitest works seamlessly with React 19's new features
3. **Improved Performance**: Vitest uses esbuild for faster test execution
4. **Similar API to Jest**: The migration from Jest to Vitest requires minimal changes to test files
5. **Better Developer Experience**: Includes a built-in UI and watch mode

## Implementation

### 1. Installed Vitest and Related Dependencies

```bash
npm install -D vitest @vitest/ui happy-dom @testing-library/react @vitejs/plugin-react
```

### 2. Created Vitest Configuration

Created `vitest.config.js`:

```js
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.js"],
    include: ["__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    // Additional configuration...
  },
  resolve: {
    alias: {
      "@/app": resolve(__dirname, "./app"),
      "@/lib": resolve(__dirname, "./lib"),
      "@/public": resolve(__dirname, "./public"),
    },
  },
});
```

### 3. Created Vitest Setup File

Created `vitest.setup.js` to mock Next.js modules:

```js
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Next.js router, image, server, etc.
vi.mock("next/router", () => ({
  useRouter: () => ({
    // Router implementation
  }),
}));

// Additional mocks for Next.js components and APIs
```

### 4. Updated Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:unit": "vitest run __tests__/",
    "test:integration": "vitest run __tests__/api/",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
    // Other test scripts...
  }
}
```

### 5. Migrated Test Files

Updated test files to use Vitest syntax:

- Changed imports from `import { jest } from '@jest/globals'` to `import { vi } from 'vitest'`
- Updated mock functions from `jest.fn()` to `vi.fn()`
- Renamed `jest.mock()` to `vi.mock()`

## Benefits of Migration

1. **Simplified Configuration**: No more complex ESM-related setup
2. **Improved Developer Experience**: Faster test execution and better watch mode
3. **Better Compatibility**: Works seamlessly with Next.js 15 and React 19
4. **Future-Proofing**: Vitest is built for modern JavaScript and will continue to evolve with the ecosystem

## Running Tests

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run in watch mode
npm run test:watch

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

## Migration Status (Completed)

The migration from Jest to Vitest has been successfully completed:

- ✅ All tests are now running with Vitest
- ✅ 19 tests passing, 0 skipped (fixed the status API test)
- ✅ Configuration files updated for ESM compatibility
- ✅ Test scripts updated in package.json
- ✅ Test files migrated to use Vitest syntax

### Next Steps

1. ✅ Fix the skipped test in `__tests__/api/status.test.ts` (completed)
2. ✅ Enhance the NavBar test to properly mock next-intl
3. ✅ Add more tests for the Todo component to cover all functionality
4. ✅ Add tests for additional components (Button, ThemeToggle)
5. ✅ Set up integration tests

### Current Testing Coverage

After implementing the above steps, we now have:

- Unit tests for key components (NavBar, Todo, Button, ThemeToggle, FeatureSection, HeroSection)
- API tests for the status endpoint
- Integration test for the Todo functionality
- Total of 36 unit tests and 1 integration test

### Remaining Testing Tasks

1. Add tests for remaining components:

   - NetworkMotifSection
   - OptimizedImage
   - BookingEmbed
   - All form components

2. Enhance integration tests:

   - Add test for blog search functionality
   - Add test for form submissions with validation
   - Add test for theme switching

3. Set up CI/CD pipeline:

   - Configure GitHub Actions workflow
   - Set up test reports and coverage analysis
   - Implement test failure notifications

4. Performance testing:
   - Add tests for bundle size monitoring
   - Implement Lighthouse score testing

The testing infrastructure is now more robust with the migration to Vitest, which provides better ESM compatibility and faster test execution. With the addition of integration tests, we have a more comprehensive testing strategy that covers both component behavior and user interactions.
