import nextJest from "next/jest";

// Providing the path to your Next.js app which will enable loading next.config.js and .env files
const createJestConfig = nextJest({
  dir: "./",
});

// Any custom config you want to pass to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/app/(.*)$": "<rootDir>/app/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
    "^@/public/(.*)$": "<rootDir>/public/$1",
  },
  // Define directories to test
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/cypress/"],

  // Configure test coverage
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "!app/api/mocks/**/*", // Exclude mock data
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
  ],
  coverageThreshold: {
    global: {
      statements: 8,
      branches: 40,
      functions: 40,
      lines: 8,
    },
  },
  coverageReporters: ["json", "lcov", "text", "clover", "html"],
};

// Export the Jest config
export default createJestConfig(customJestConfig);
