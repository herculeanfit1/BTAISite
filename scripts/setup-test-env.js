#!/usr/bin/env node

/**
 * Test environment setup script
 *
 * This script creates a .env.test file with required environment variables
 * for running tests consistently across different environments.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Define test environment variables
const envVars = {
  // Server configuration
  NODE_ENV: "test",
  NEXT_PUBLIC_ENV: "test",

  // Disable analytics in test environment
  NEXT_PUBLIC_ANALYTICS_ENABLED: "false",

  // Test-specific API keys (these are dummy values)
  TEST_API_KEY: "test_api_key_" + crypto.randomBytes(8).toString("hex"),

  // Security settings
  RATE_LIMIT_REQUESTS: "20",
  RATE_LIMIT_WINDOW_MS: "60000",

  // Test control flags
  SKIP_VISUAL_TESTS: "false",
  SKIP_PERFORMANCE_TESTS: "false",

  // Cache settings
  NEXT_PUBLIC_CACHE_MAX_AGE: "0",
};

// Create the .env.test file
const envFilePath = path.join(process.cwd(), ".env.test");
const envFileContent = Object.entries(envVars)
  .map(([key, value]) => `${key}=${value}`)
  .join("\n");

fs.writeFileSync(envFilePath, envFileContent);

console.log(`Created ${envFilePath} with test environment variables`);

// Create a test-specific next.config.js if needed
// This could be used to adjust Next.js configuration for testing
const nextConfigTestContent = `
// next.config.test.js - Test-specific Next.js configuration
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Test-specific settings
  experimental: {
    // Enable specific experimental features for testing
  },
};

module.exports = nextConfig;
`;

const nextConfigTestPath = path.join(process.cwd(), "next.config.test.js");
fs.writeFileSync(nextConfigTestPath, nextConfigTestContent);

console.log(
  `Created ${nextConfigTestPath} with test-specific Next.js configuration`,
);

// Make the script executable
try {
  fs.chmodSync(__filename, "755");
} catch (error) {
  // Ignore errors on platforms that don't support chmod
}

console.log("Test environment setup complete!");
