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
        // `settings` used to carry `enableFetchMocks: true` and
        // `defaultUserAgent: 'happyDOM (vitest)'`. NEITHER IS A HAPPY-DOM
        // SETTING -- `enableFetchMocks` belongs to jest-fetch-mock, and
        // happy-dom's user agent lives at `navigator.userAgent`, not at the top
        // level. happy-dom 17 silently ignored unknown keys, so both had been
        // inert for as long as they existed; happy-dom 20 validates and throws
        // `Unknown browser setting "enableFetchMocks"`, which is how they were
        // finally noticed. Every one of the 42 test files failed to start.
        //
        // They are DELETED rather than translated into their valid equivalents.
        // Nothing reads the browser user agent (the `userAgent` in the API
        // tests is a request payload field, and the `fetchMock`s are local
        // vi.fn() spies), so writing `navigator: { userAgent: ... }` would
        // newly change behaviour that has never been in effect -- turning a
        // dead setting into a live one as a side effect of an upgrade.
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
      //
      // RE-BASELINED 2026-07-30 for Vitest 4, and NOT because a run failed. The v8
      // provider switched from `v8-to-istanbul` to AST-based analysis, which changed
      // what gets COUNTED. Measured on identical tests (all 341 pass on both):
      //
      //                covered / total          v3            v4
      //   functions    123/143 -> 91/295     86.01%   ->   30.85%
      //   branches     344/405 -> 322/1017   84.94%   ->   31.66%
      //   statements   1793/5672 -> 452/1227 31.61%   ->   36.84%
      //
      // The numerators barely moved; the DENOMINATORS did. AST analysis finds ~2.5x
      // more functions and branches than v8-to-istanbul enumerated, and ~4.6x fewer
      // statements. So the old 86%/85% were flattering — measured against a denominator
      // that omitted more than half the functions and branches in the codebase — while
      // the old statement number was pessimistic. The v3 figures were wrong in BOTH
      // directions, and the two sets are not comparable.
      //
      // Nothing regressed: real function coverage was never 86%. But be honest about the
      // cost — in ABSOLUTE terms the floor drops from ~117 covered functions (82% of 143)
      // to ~83 (28% of 295). Holding 82% would now demand 242 of 295, which is real
      // test-writing work, tracked in ROADMAP.md rather than smuggled in here.
      //
      // This drop therefore conflicts with the STANDARDS coverage ratchet ("floors must
      // never drop vs main"). Flagged deliberately: the ratchet assumes a stable
      // measurement, and this is a measurement change, not a coverage change.
      //
      // Floors are the v4 measurement minus ~2 points of headroom. Note lines and
      // statements go UP (28 -> 34/35), which is a genuine tightening.
      thresholds: {
        lines: 35,
        branches: 29,
        functions: 28,
        statements: 34,
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
