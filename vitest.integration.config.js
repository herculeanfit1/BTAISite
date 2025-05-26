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
      all: false,
      thresholds: {
        lines: process.env.CI ? 20 : 60,
        branches: process.env.CI ? 15 : 50,
        functions: process.env.CI ? 20 : 60, 
        statements: process.env.CI ? 20 : 60
      }
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
