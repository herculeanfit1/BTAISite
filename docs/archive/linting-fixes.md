# ESLint Fixes for Bridging Trust AI

This document provides guidance on fixing ESLint issues in the Bridging Trust AI project. It focuses on addressing the issues flagged in the CI/CD pipeline that are causing build failures.

## Quick Start

To automatically fix many linting issues, run:

```bash
npm run lint:fix
```

To check for remaining issues after applying fixes:

```bash
npm run lint:check
```

## Categories of Linting Issues

### 1. Unused Variables and Imports

**Issue:** Variables or imports defined but never used.
**Error codes:** `@typescript-eslint/no-unused-vars`

**How to fix:**
- Remove unused variables
- Remove unused imports
- Use variables you've declared

The `lint:fix` script will automatically handle most of these issues.

### 2. HTML Links vs Next.js Links

**Issue:** Using HTML `<a>` elements for internal navigation instead of Next.js `<Link>` components.
**Error codes:** `@next/next/no-html-link-for-pages`

**How to fix:**
1. Import the Link component: `import Link from 'next/link'`
2. Replace:
   ```jsx
   <a href="/about/">About</a>
   ```
   With:
   ```jsx
   <Link href="/about/">About</Link>
   ```

**Files to fix:**
- app/components/CookieConsent.tsx
- app/components/Newsletter.tsx
- app/components/home/GlobeSection.tsx
- app/contact/ContactForm.tsx
- app/page.tsx

### 3. Security: Object Injection

**Issue:** Using dynamic object properties without proper validation.
**Error codes:** `security/detect-object-injection`

**How to fix:**
1. Use an allowlist approach for object keys
   ```javascript
   // Instead of:
   data[userInput] = value;
   
   // Use:
   const allowedKeys = ['name', 'email', 'message'];
   if (allowedKeys.includes(userInput)) {
     data[userInput] = value;
   }
   ```

2. For TypeScript objects with index signatures, use validation

**Files to fix:**
- lib/logger.ts
- lib/rate-limit.ts
- app/api/contact/route.ts
- app/api/newsletter/route.ts

### 4. Type Safety: Replace 'any' with Proper Types

**Issue:** Using the `any` type instead of specific types.
**Error codes:** `@typescript-eslint/no-explicit-any`

**How to fix:**
1. Replace `any` with proper types
   ```typescript
   // Instead of:
   function process(data: any): any {
     // ...
   }
   
   // Use:
   interface DataInput {
     id: number;
     name: string;
   }
   
   interface DataOutput {
     result: boolean;
     message: string;
   }
   
   function process(data: DataInput): DataOutput {
     // ...
   }
   ```

2. Use `unknown` when you really don't know the type, and add type guards

**Files to fix:**
- lib/analytics.tsx
- lib/logger.ts
- lib/useAnalytics.tsx
- src/uitests/performance/performance.spec.ts

## Linting in CI/CD Pipeline

The CI/CD pipeline is configured to run ESLint as part of the build process. The following changes have been made to make this process more robust:

1. Added a `lint:fix` script to automatically fix common issues
2. Added a `lint:check` script to verify fixes
3. Updated the GitHub Actions workflow to use these scripts

## Best Practices for Future Development

1. **Run ESLint locally** before committing changes:
   ```bash
   npm run lint
   ```

2. **Use the VS Code ESLint extension** to see issues in real-time

3. **Consider using a pre-commit hook** to automatically run ESLint

4. **Gradually improve type safety** by replacing `any` with specific types

## Next Steps

1. Fix the remaining manual issues that can't be auto-fixed
2. Update the `.eslintrc.json` configuration to be stricter
3. Add more specific rules for the project's needs

## Resources

- [Next.js ESLint Documentation](https://nextjs.org/docs/app/api-reference/config/eslint)
- [TypeScript ESLint Rules](https://typescript-eslint.io/rules/)
- [ESLint Security Plugin](https://github.com/eslint-community/eslint-plugin-security) 