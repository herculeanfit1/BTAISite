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
        "src/lib/**/*.{js,ts}",
        "lib/**/*.{js,ts}",
      ],
      all: true,
      // Set to the measured baseline minus a small margin (PLAN-005), and identical in
      // CI and locally — the old `process.env.CI ? 30 : 70` split meant the number that
      // actually gated was never the number anyone read. Raise these when coverage
      // genuinely improves; never lower them to make a run pass.
      // Measured 2026-07-27 over 79 files: 23.05 lines / 80.78 branches / 76.03 functions
      // / 23.05 statements. Floors are those minus ~2 points of headroom.
      thresholds: {
        lines: 21,
        branches: 78,
        functions: 74,
        statements: 21,
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
