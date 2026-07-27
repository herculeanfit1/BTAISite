# Node 20 LTS and Dependencies Upgrade Process

> **HIGH PRIORITY:** Update the project's main [todo.md](../todo.md) file to include this upgrade as a critical priority item.

## Overview

This document provides a comprehensive guide for migrating our Bridging Trust AI project to Node 20 LTS and updating dependencies to the recommended versions. This upgrade will ensure our codebase remains secure, maintainable, and supported through at least April 2026.

## Timeline and Resource Allocation

- **Total estimated time:** 12-19 days
- **Team members required:** 2-3 developers (1 lead, 1-2 support)
- **Testing resources:** QA team for validation
- **Operations support:** DevOps for CI/CD pipeline updates

## Phase 1: Environment Setup (1-2 days)

### 1.1 Branch Creation

```bash
git checkout -b feature/node20-upgrade
```

### 1.2 Local Development Environment Update

```bash
# Install and use Node 20.12 LTS
nvm install 20.12
nvm use 20.12

# Verify installation
node --version  # Should output v20.12.x
```

### 1.3 CI/CD Pipeline Configuration

Update the CI/CD configuration files to use Node 20.12:

#### GitHub Actions Example:

```yaml
# .github/workflows/ci.yml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.12'
      # Rest of your workflow
```

#### Azure DevOps Example:

```yaml
# azure-pipelines.yml
pool:
  vmImage: 'ubuntu-latest'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '20.12.x'
  displayName: 'Install Node.js 20.12'
```

## Phase 2: Package Updates (2-3 days)

### 2.1 Update package.json

Replace the current dependencies and devDependencies sections with the provided versions:

```json
{
  "engines": { "node": ">=20 <23" },

  "dependencies": {
    "@react-three/fiber": "8.15.16",
    "@tailwindcss/forms": "0.5.10",
    "@tailwindcss/typography": "0.5.16",
    "@types/three": "0.154.0",
    "critters": "0.0.23",
    "next": "15.3.2",
    "next-intl": "4.1.0",
    "next-themes": "0.4.6",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "tailwind-merge": "3.2.0",
    "three": "0.154.0",
    "zod": "3.24.4"
  },

  "devDependencies": {
    "@azure/static-web-apps-cli": "2.0.9",
    "@babel/plugin-syntax-import-attributes": "7.27.2",
    "@babel/preset-env": "7.27.2",
    "@babel/preset-react": "7.27.2",
    "@babel/preset-typescript": "7.27.2",
    "@eslint/js": "9.26.0",
    "@next/bundle-analyzer": "15.3.2",
    "@next/eslint-plugin-next": "15.3.2",
    "@playwright/test": "1.52.2",
    "@tailwindcss/postcss": "4.1.5",
    "@testing-library/jest-dom": "6.4.2",
    "@testing-library/react": "16.3.0",
    "@testing-library/user-event": "14.6.1",
    "@types/jest": "29.5.12",
    "@types/node": "20.11.18",
    "@types/react": "19.0.0",
    "@types/react-dom": "19.0.0",
    "@typescript-eslint/eslint-plugin": "8.32.0",
    "@typescript-eslint/parser": "8.32.0",
    "@vitejs/plugin-react": "4.4.1",
    "@vitest/coverage-v8": "3.2.0",
    "@vitest/ui": "3.2.0",
    "autoprefixer": "10.4.23",
    "eslint": "9.26.0",
    "eslint-plugin-security": "3.0.1",
    "globals": "16.1.0",
    "husky": "9.2.1",
    "jest": "29.7.0",
    "jest-environment-jsdom": "29.7.0",
    "jest-junit": "16.0.0",
    "lint-staged": "15.6.0",
    "postcss": "8.4.41",
    "postcss-import": "16.1.0",
    "prettier": "3.5.3",
    "rimraf": "6.0.1",
    "tailwindcss": "4.1.5",
    "typescript": "5.5.0",
    "vitest": "3.2.0"
  }
}
```

### 2.2 Implement Lockfile Improvements

```bash
# Remove existing node_modules and lockfile
rm -rf node_modules
rm pnpm-lock.yaml

# Install with strict peer dependency checking and frozen lockfile
pnpm install --strict-peer-deps

# For CI environments, use
pnpm install --strict-peer-deps --frozen-lockfile
```

### 2.3 SBOM Generation Setup

```bash
# Add SBOM generation tools
pnpm add -D @cyclonedx/cyclonedx-npm --save-exact

# Test SBOM generation
pnpm sbom --format cyclonedx
```

### 2.4 Update package.json Scripts

Add the following scripts to package.json:

```json
"scripts": {
  // ... existing scripts
  "sbom": "pnpm sbom --format cyclonedx",
  "audit:deps": "pnpm audit",
  "audit:signatures": "npm audit signatures",
  "build:prod": "NODE_ENV=production next build",
  "check:deps": "pnpm install --strict-peer-deps"
}
```

## Phase 3: Code Compatibility (3-5 days)

### 3.1 React 19 Migration

#### 3.1.1 Compatibility Review

Review all components for React 18 to 19 compatibility, focusing on:

- Components using deprecated APIs
- Custom hooks that might be affected
- Third-party dependencies that might not be compatible

```bash
# Run a check for potential issues with React 19
pnpm build
```

#### 3.1.2 Update TypeScript Types

Check for any TypeScript errors after updating to React 19 types:

```bash
pnpm tsc --noEmit
```

Fix any type errors that arise from the React 19 update.

### 3.2 ESLint Configuration Update

#### 3.2.1 Rename and Update ESLint Configuration

Rename `.eslintrc.js` to `eslint.config.mjs` and update to the flat config format:

```javascript
// eslint.config.mjs
import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import securityPlugin from 'eslint-plugin-security';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tsPlugin,
      'security': securityPlugin,
      '@next/next': nextPlugin
    },
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      // Migrate your existing rules here
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-unused-vars': ['error'],
      // Add security rules
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'error'
    }
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
    rules: {
      // Test-specific rules
    }
  }
];
```

#### 3.2.2 Update VSCode Settings

Update `.vscode/settings.json` to use the new ESLint configuration:

```json
{
  "eslint.experimental.useFlatConfig": true
}
```

#### 3.2.3 Verify ESLint Configuration

```bash
pnpm eslint . --max-warnings=0
```

## Phase 4: Testing (3-4 days)

### 4.1 Unit Tests

```bash
# Run Vitest tests
pnpm vitest run

# With coverage
pnpm vitest run --coverage
```

Fix any failing tests that result from dependency updates.

### 4.2 Integration Tests

```bash
# Install Playwright browsers
pnpm playwright install

# Run Playwright tests
pnpm playwright test
```

Update the Playwright configuration if needed:

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Make sure this is compatible with Node 20
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    // other browsers
  ],
  // rest of config
});
```

### 4.3 Manual Testing Checklist

Deploy to a staging environment on Azure SWA with Node 20 runtime and verify:

- [ ] All pages load correctly
- [ ] Forms submit properly
- [ ] Authentication flows work
- [ ] API endpoints respond as expected
- [ ] i18n features function correctly
- [ ] Responsive design is maintained across screen sizes
- [ ] Performance metrics meet or exceed previous values
- [ ] Accessibility is maintained or improved

## Phase 5: CI/CD and Security Hardening (2-3 days)

### 5.1 Update Azure Static Web Apps Configuration

Create or update `staticwebapp.config.json`:

```json
{
  "platform": {
    "apiRuntime": "node:20"
  },
  "routes": [
    // Your existing routes
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/images/*.{png,jpg,gif}", "/css/*", "/js/*"]
  },
  "mimeTypes": {
    ".json": "text/json"
  }
}
```

### 5.2 Add Security Scanning to CI Pipeline

#### GitHub Actions Example:

```yaml
# .github/workflows/ci.yml
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.12'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Generate SBOM
        run: pnpm sbom --format cyclonedx
        
      - name: Upload SBOM
        uses: actions/upload-artifact@v4
        with:
          name: sbom
          path: bom.json
      
      - name: Run dependency audit
        run: pnpm audit
```

### 5.3 Configure Dependabot

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    versioning-strategy: "lockfile-only"
    commit-message:
      prefix: "deps"
      include: "scope"
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]
```

### 5.4 Set Up Sigstore for Artifact Signing

```bash
# Install sigstore CLI
npm install -g @sigstore/cli

# Sign your artifacts during release
sigstore sign --identity "$(git config user.email)" ./dist
```

## Phase 6: Documentation and Release (1-2 days)

### 6.1 Update Documentation

Update `docs/promptlog.md` with migration details:

```markdown
# 2025-05-XX - Node 20 LTS Upgrade

Upgraded the codebase to Node 20 LTS and updated dependencies to ensure continued support through April 2026.

Key changes:
- Node runtime lifted to 20 LTS
- React upgraded to 19.0.0
- Next.js pinned to 15.3.2
- ESLint configuration updated to flat config format
- Security improvements including SBOM generation and dependency auditing
```

### 6.2 Create Comprehensive Release Notes

Document the following in your release notes:

- Node 20 migration benefits
- React 19 upgrade details and any breaking changes
- Security improvements and new practices
- Future upgrade cadence
- Known issues or required follow-up tasks

### 6.3 Final Deployment Checklist

Before final deployment to production:

- [ ] Verify Azure SWA runtime configuration is set to node:20
- [ ] Confirm dependency lockfile is committed
- [ ] Generate and store SBOM with release artifacts
- [ ] Run final security scans on the production build
- [ ] Ensure all tests pass in the CI pipeline
- [ ] Verify feature branch builds correctly in staging environment
- [ ] Complete QA signoff on the staging deployment
- [ ] Schedule future upgrades per recommended cadence

## Future Upgrade Schedule

| Date | Action |
|------|--------|
| July 2025 | Evaluate TypeScript 5.6 RC on a feature branch |
| October 2025 | Begin Node 22 testing when Azure rolls out Node 22 LTS |
| January 2026 | Assess React 20 upgrade path when roadmap is available |
| April 2026 | Complete Node 22 migration before Node 20 enters maintenance |

## References and Resources

- [Node 20 LTS & lifecycle](https://nodejs.org/en/blog/announcements/nodejs20-lts)
- [Next.js 15.3 release notes](https://nextjs.org/blog/next-15-3)
- [React 19 stable release](https://react.dev/blog/2023/05/03/react-19)
- [ESLint 9 flat-config migration guide](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [Azure SWA runtime documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/apis-functions)
- [pnpm strict peer-deps documentation](https://pnpm.io/cli/install#--strict-peer-deps)
- [SBOM importance overview](https://cyclonedx.org/use-cases/) 