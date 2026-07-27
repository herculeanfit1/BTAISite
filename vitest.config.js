import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// Force development mode for React compatibility in tests
if (process.env.NODE_ENV === 'production') {
  console.warn('🔶 Forcing development mode for tests');
  process.env.NODE_ENV = 'development';
}

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.js", "./__tests__/utils/ci-test-mode.js"],
    include: ["__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    exclude: ["__tests__/e2e/**", "**/*.e2e.{test,spec}.{js,jsx,ts,tsx}"],
    retry: 2,
    testTimeout: 10000,
    hookTimeout: 10000,
    environmentOptions: {
      happyDOM: {
        settings: {
          // Enable React act environment
          enableFetchMocks: true,
          defaultUserAgent: 'happyDOM (vitest)',
        },
        globals: {
          IS_REACT_ACT_ENVIRONMENT: true,
        },
      },
    },
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/", 
        "app/api/mocks/**", 
        "**/*.d.ts",
        ".next/**",
        "out/**",
        "scripts/**",
        "e2e/**",
        "public/**",
        "performance/**",
        "smoke/**",
        "app/**/*.{js,jsx,ts,tsx}",
        "lib/**/*.{js,jsx,ts,tsx}",
        "middleware.ts*",
        "server.js",
        "*.config.{js,ts}",
        ".eslintrc.js",
        ".github/**",
        "tests-examples/**",
        "test-minimal/**",
        "__mocks__/**"
      ],
      // `src/components/**` was dropped here: that tree was deleted in PR #60 and the
      // stale entry made the include list look broader than it was. Note this still
      // excludes `src/lib/api/**` — the most logic-heavy code in the repo earns no
      // coverage credit. Widening it is PLAN-005's call, not this change's.
      include: ["app/components/**/*.{js,jsx,ts,tsx}"],
      all: false,
      thresholds: {
        lines: process.env.CI ? 30 : 70,
        branches: process.env.CI ? 20 : 60,
        functions: process.env.CI ? 30 : 70,
        statements: process.env.CI ? 30 : 70,
      },
    },
  },
  resolve: {
    alias: {
      "@/app": resolve(__dirname, "./app"),
      "@/src": resolve(__dirname, "./src"),
      "@/lib": resolve(__dirname, "./lib"),
      "@/public": resolve(__dirname, "./public"),
    },
  },
});
