import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.js"],
    include: ["__tests__/integration/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    coverage: {
      reporter: ["text", "json", "html"],
      include: ["app/**/*.{js,jsx,ts,tsx}"],
      exclude: [
        "app/**/*.d.ts", 
        "app/**/*.stories.{js,jsx,ts,tsx}",
        "app/vercel-safari/**"
      ],
      // `all: false` is deliberate here, unlike vitest.config.js: this suite is two
      // scoped theme-integration tests, so measuring it against all of app/** would
      // produce a near-zero number that gates nothing. The enforced coverage gate is
      // the main config, which ci/g_test.sh runs via `npm run test:coverage`.
      all: false,
      // Measured 2026-07-27: 77.15 lines / 85 branches / 41.66 functions / 77.15
      // statements, minus ~2 points. Single set — the old `process.env.CI ? 20 : 60`
      // split meant the number that actually gated was never the number anyone read.
      thresholds: {
        lines: 75,
        branches: 83,
        functions: 39,
        statements: 75,
      },
    },
  },
  resolve: {
    alias: {
      "@/app": resolve(__dirname, "./app"),
      "@/lib": resolve(__dirname, "./lib"),
      "@/public": resolve(__dirname, "./public"),
      "@": resolve(__dirname, "./"),
    },
  },
});
