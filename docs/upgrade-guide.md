# Upgrade Guide: Next.js 14 to Next.js 15.3.2

This guide documents the process of upgrading the Bridging Trust AI website from Next.js 14 to Next.js 15.3.2, including React 19 and Tailwind CSS v4 migration.

## Overview of Changes

- Next.js upgraded from 14.x to 15.3.1
- React upgraded from 18.x to 19.0.0
- Tailwind CSS upgraded from 3.x to 4.1.5
- Added ESM support throughout the project
- Updated type safety with improved Route typing
- Enhanced Docker resources for better build performance

## Key Migration Steps

### 1. Package Updates

```bash
npm install next@15.3.1 react@19.0.0 react-dom@19.0.0 @tailwindcss/postcss@4.1.5
npm install --save-dev @next/eslint-plugin-next@15.3.1
```

### 2. ESM Migration

- Added `"type": "module"` to package.json
- Converted configuration files from CommonJS to ESM:
  - tailwind.config.js → tailwind.config.mjs
  - postcss.config.js → postcss.config.mjs
  - eslint.config.js → eslint.config.mjs
- Updated imports to use .js extension for ESM packages

### 3. Route Typing for Next.js 15

Next.js 15 introduces more strict type checking for routes. We had to:

- Import the `Route` type from next: `import { Route } from 'next'`
- Cast string routes to `Route<string>`: `href="/" as Route<string>`
- Update all component props that accept route paths
- Create interface updates for components that use href props

Example:

```tsx
// Before
interface ButtonProps {
  href?: string;
}

// After
import { Route } from "next";

interface ButtonProps {
  href?: Route<string>;
}
```

### 4. Static Export Compatibility

For static exports to work properly with Next.js 15:

1. Added the `force-static` directive to API routes:

```tsx
export const dynamic = "force-static";
```

2. Replaced URL parsing using `nextUrl.searchParams` (not available in static exports):

```tsx
// Before
export async function GET(request: NextRequest) {
  const searchTerm = request.nextUrl.searchParams.get("q") || "";
  // ...
}

// After
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchTerm = url.searchParams.get("q") || "";
  // ...
}
```

### 5. Tailwind CSS v4 Updates

1. Updated import in postcss.config.mjs:

```js
import tailwindcss from "@tailwindcss/postcss";
```

2. Updated globals.css to use new directives:

```css
/* Before */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* variables */
  }
}

/* After */
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

@theme {
  :root {
    /* variables */
  }
}
```

### 6. React 19 Hydration Fixes

React 19 is more strict about hydration mismatches. We fixed:

1. Added proper client-side mounting checks:

```tsx
"use client";

import { useState, useEffect } from "react";

export const ClientComponent = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="skeleton-loader" />;
  }

  return <div>Client-rendered content</div>;
};
```

2. Made sure `'use client'` directives are at the very top of files
3. Added skeleton loaders to prevent flash of unstyled content

### 7. Test Suite Migration

Migrating the Jest test suite to work with ESM has been challenging:

1. Updated jest.config.js to jest.config.mjs
2. Created babel.config.mjs for ESM support
3. Updated jest.setup.js to jest.setup.mjs

We encountered several issues with ESM compatibility in tests. Options being considered:

- Migrate to Vitest for better ESM support
- Use a dual package approach (ESM for app, CommonJS for tests)
- Continue fixing the current Jest ESM configuration

See [testing-issues.md](./testing-issues.md) for more details.

## Docker Resources Improvement

We enhanced Docker configurations to prevent resource leaks:

1. Updated Dockerfile to use multi-stage builds
2. Added resource constraints in docker-compose
3. Implemented proper shutdown handling
4. Created docker-cleanup.sh script

## Known Issues and Workarounds

1. **Static Export API Routes**: Routes that use request.nextUrl directly won't work in static exports. Use URL constructor instead.

2. **ESM Import Extensions**: When importing from node_modules, sometimes .js extension is required:

```js
// Won't work in some ESM contexts
import foo from "package-name";

// Will work
import foo from "package-name/index.js";
```

3. **Jest ESM Support**: Jest's ESM support is still experimental. Consider using Vitest for better ESM compatibility.

## Resources

- [Next.js 15 Release Notes](https://nextjs.org/blog/next-15)
- [React 19 Release Notes](https://react.dev/blog/2024/04/25/react-19)
- [Tailwind CSS v4 Migration Guide](https://tailwindcss.com/docs/upgrade-guide)

```

```
