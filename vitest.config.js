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
        // NOTE: this list used to blanket-exclude "app/**" and "lib/**", which silently
        // cancelled the `include` below — so the previous config measured NOTHING from
        // app/components despite naming it, and the 30/70 thresholds were judged against
        // whatever happened to slip through. Exclude specific non-source instead.
        "app/**/layout.tsx",
        "app/**/error.tsx",
        "app/**/loading.tsx",
        "app/**/not-found.tsx",
        "lib/i18n/**",
        "middleware.ts*",
        "server.js",
        "*.config.{js,ts}",
        ".eslintrc.js",
        ".github/**",
        "tests-examples/**",
        "test-minimal/**",
        "__mocks__/**"
      ],
      // Measured, not aspirational. `all: true` counts files with no test at all, so
      // these numbers reflect the whole included surface rather than only what a test
      // happened to import. `src/lib/api/**` is included because it is the entire
      // /api/* implementation and previously earned no coverage credit whatsoever.
      include: [
        "app/components/**/*.{js,jsx,ts,tsx}",
        // The route handlers were unmeasured entirely: `include` named only
        // app/components, so the three files serving /api/* earned no coverage
        // credit even though two of their response shapes are a deploy contract
        // (PLAN-007).
        "app/api/**/*.{js,ts}",
        "src/lib/**/*.{js,ts}",
        "lib/**/*.{js,ts}",
      ],
      all: true,
      // Set to the measured baseline minus a small margin (PLAN-005), and identical in
      // CI and locally — the old `process.env.CI ? 30 : 70` split meant the number that
      // actually gated was never the number anyone read. Raise these when coverage
      // genuinely improves; never lower them to make a run pass.
      // Measured 2026-07-27 after PLAN-007: 30.36 lines / 83.18 branches /
      // 84.96 functions / 30.36 statements (was 23.05 / 80.78 / 76.03 before
      // the API tests landed). Floors are those minus ~2 points of headroom.
      thresholds: {
        lines: 28,
        branches: 81,
        functions: 82,
        statements: 28,
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
