/**
 * Security Testing Setup
 *
 * This script prepares the environment for security testing by:
 * 1. Creating necessary directories for test results
 * 2. Setting up security-specific configurations
 * 3. Verifying security-related environment variables
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Create directories for test results if they don't exist
const directories = [
  "test-results",
  "test-results/security",
  "playwright-report",
  "coverage",
];

directories.forEach((dir) => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Verify environment is suitable for security testing
console.log("Verifying security environment...");

// Check Node.js version (should be LTS or higher)
const nodeVersion = process.version;
console.log(`Node.js version: ${nodeVersion}`);
const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0], 10);

if (majorVersion < 18) {
  console.warn(
    "⚠️ Warning: Using older Node.js version. Recommended minimum is v18 LTS.",
  );
}

// Check that we're not exposing sensitive env variables
const environmentVars = Object.keys(process.env);
const sensitiveVarPrefixes = ["API_", "SECRET_", "TOKEN_", "PASSWORD_", "KEY_"];
const sensitiveVars = environmentVars.filter((v) =>
  sensitiveVarPrefixes.some((prefix) => v.startsWith(prefix)),
);

if (sensitiveVars.length > 0) {
  console.warn(
    "⚠️ Warning: Potentially sensitive environment variables detected:",
  );
  sensitiveVars.forEach((v) => console.warn(`  - ${v}`));
}

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.NEXT_PUBLIC_TESTING_MODE = "true";

// Create security test configurations
const securityConfig = {
  csp: {
    enabled: true,
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  },
  headers: {
    enabled: true,
    xFrameOptions: "DENY",
    xContentTypeOptions: "nosniff",
    referrerPolicy: "no-referrer-when-downgrade",
    permissionsPolicy: "camera=(), microphone=(), geolocation=()",
  },
};

// Write temporary security config for testing
fs.writeFileSync(
  path.join(process.cwd(), "security-test-config.json"),
  JSON.stringify(securityConfig, null, 2),
);

// Check for production dependencies with known vulnerabilities
try {
  console.log(
    "Checking for known vulnerabilities in production dependencies...",
  );
  execSync("npm audit --production --json > security-audit.json");
  console.log("Security audit completed. Results saved to security-audit.json");
} catch (error) {
  console.warn("⚠️ Security vulnerabilities found in dependencies");
}

console.log("Security testing environment setup complete.");
