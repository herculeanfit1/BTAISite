# Next.js 15 and Tailwind CSS v4 Configuration Fixes

## Overview

This document chronicles our solutions to critical issues encountered when upgrading to Next.js 15 and Tailwind CSS v4. The primary problem was an "Internal Server Error" where the browser would download HTML content instead of rendering it properly.

## Root Causes Identified

1. **Content-Type Header Issues**

   - The browser was receiving responses without proper `Content-Type: text/html` headers
   - This caused the browser to treat HTML content as a download instead of rendering it

2. **Node.js Version Incompatibility**

   - Node.js v23.x has compatibility issues with Next.js 15
   - JSX runtime resolution failed with newer Node.js versions

3. **React Version Conflicts**

   - React 19.1.0 had conflicts with Next.js 15
   - Downgrading to React 18.2.0 resolved these issues

4. **Tailwind CSS v4 Configuration**

   - Tailwind CSS v4 requires using `@tailwindcss/postcss` instead of `tailwindcss` as a PostCSS plugin
   - Incorrect plugin configuration caused CSS processing errors

5. **Babel Configuration Conflicts**
   - Duplicate Babel configuration files (`babel.config.js` and `.babelrc`) caused conflicts
   - Simplifying to a single configuration resolved the issues

## Solutions Implemented

### 1. Middleware Enhancement

We enhanced the middleware to explicitly set Content-Type headers for HTML responses:

```typescript
// In middleware.ts
// Explicitly set Content-Type for HTML responses to fix rendering issues
if (
  !request.nextUrl.pathname.startsWith("/_next/") &&
  !request.nextUrl.pathname.startsWith("/api/") &&
  !request.nextUrl.pathname.match(/\.(jpe?g|png|gif|svg|webp|ico|css|js)$/i)
) {
  response.headers.set("Content-Type", "text/html; charset=utf-8");
}
```

This ensures that all non-static routes receive the correct `text/html` content type.

### 2. Custom Server Implementation

We created a custom server.js to handle content-type headers explicitly:

```javascript
// In server.js
createServer((req, res) => {
  const parsedUrl = parse(req.url, true);

  // CRITICAL: Always set content-type for HTML responses
  res.setHeader("Content-Type", "text/html; charset=utf-8");

  handle(req, res, parsedUrl);
}).listen(port);
```

This provides a fallback solution when the middleware doesn't fully resolve the issue.

### 3. Node.js Version Management

We documented and implemented Node.js version requirements:

- Recommended: Node.js v20.19.1 (LTS)
- Not Compatible: Node.js v23.x

We installed NVM and downgraded to the recommended version to ensure compatibility.

### 4. Package Version Pinning

We pinned exact versions for core dependencies:

```json
"dependencies": {
  "next": "15.3.2",
  "react": "18.2.0",
  "react-dom": "18.2.0"
}
```

This prevents unintended updates to incompatible versions.

### 5. PostCSS Configuration for Tailwind CSS v4

We corrected the PostCSS configuration to use the proper plugin for Tailwind CSS v4:

```javascript
// In postcss.config.js
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {}, // Use the dedicated PostCSS plugin for Tailwind CSS v4
    autoprefixer: {},
  },
};
```

### 6. Simplified Next.js Configuration

We simplified the Next.js configuration to focus on core functionality:

```javascript
// In next.config.js
module.exports = {
  // Only essential configuration
  reactStrictMode: true,
  poweredByHeader: false,
};
```

### 7. Test Pages Without CSS Dependencies

We created simplified test pages to isolate rendering issues from CSS processing:

```javascript
// In app/minimal-test/page.js
export default function MinimalTestPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "16px" }}>Minimal Test Page</h1>
      <p>
        This is a minimal test page that doesn't use Tailwind CSS or any other
        dependencies. If you see this page, basic rendering functionality is
        working.
      </p>
    </div>
  );
}
```

## Route Typing Implementation for Next.js 15

One significant upgrade requirement was adding proper route typing using Next.js 15's `Route<string>` type. This has been fully implemented across the application:

### 1. Type Imports in Components

All components that use routes or links now import the Route type from Next.js:

```typescript
import { Route } from "next";
```

### 2. Properly Typed Props

Component props that accept routes now correctly use the Route<string> type:

```typescript
interface ButtonProps {
  href?: Route<string>;
  // Other props...
}

interface NavLinkProps {
  href: Route<string>;
  children: React.ReactNode;
}
```

### 3. Type Casting for Static Routes

For static routes, we use type casting to ensure proper typing:

```typescript
<Link href={"/" as Route<string>}>Home</Link>
```

### 4. Type Casting for Dynamic Routes

For dynamic routes, we carefully type cast the generated paths:

```typescript
<Button href={`/blog/${post.slug}` as Route<string>}>Read More</Button>
```

## Dependency Hardening Strategy

To prevent future dependency issues and ensure long-term stability, we've implemented the following dependency hardening practices:

### 1. Exact Version Pinning

All dependencies in `package.json` now use exact versions:

```json
"dependencies": {
  "@tailwindcss/forms": "0.5.10",
  "@tailwindcss/typography": "0.5.16",
  "next": "15.3.2",
  "next-intl": "4.1.0",
  "next-themes": "0.4.6",
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "tailwind-merge": "3.2.0",
  "zod": "3.24.4"
}
```

This prevents accidental upgrades through `^` or `~` version ranges.

### 2. Node.js Version Enforcement

We've added enforcement of the correct Node.js version through:

- `.nvmrc` file with the exact version: `20.19.1`
- `engines` field in `package.json`

```json
"engines": {
  "node": "20.19.1"
}
```

### 3. Automated Dependency Validation

A new CI workflow `dependency-checks.yml` verifies:

- Package-lock.json consistency with package.json
- All dependencies are properly pinned (no `^` or `~`)
- Node.js version consistency between `.nvmrc` and `package.json`
- Checks for security vulnerabilities via `npm audit`
- Reports outdated dependencies

This ensures dependency integrity is maintained across all environments.

### 4. Versioned Documentation

We now maintain documentation of key dependency requirements and fixes:

- The exact Node.js version requirement: v20.19.1 LTS
- React and Next.js version compatibility notes
- Proper PostCSS configuration for Tailwind CSS v4

## Current Status

All Next.js 15 and Tailwind v4 upgrade issues have been fully resolved. The application correctly implements:

1. ✅ Proper PostCSS configuration with `@tailwindcss/postcss`
2. ✅ Complete Route<string> typing across all components
3. ✅ Content-type header fixes in middleware and custom server
4. ✅ Node.js version enforcement (v20.19.1 LTS)
5. ✅ Exact dependency versioning
6. ✅ API route compatibility with static exports

## Testing Methodology

1. **Server Testing**

   - Tested the default Next.js server: `npm run dev:next`
   - Tested our custom server: `npm run dev`
   - Verified content-type headers with: `curl -I http://localhost:3000`

2. **Content Rendering**

   - Created minimal test pages without CSS/Tailwind dependencies
   - Tested page rendering with simplified layouts
   - Verified HTML content is properly displayed and not downloaded

3. **Node.js Version Testing**
   - Tested with Node.js v23.10.0 (incompatible)
   - Tested with Node.js v20.19.1 LTS (compatible)
   - Documented version requirements

## References

1. [Next.js 15 Documentation](https://nextjs.org/docs)
2. [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
3. [Node.js Version Compatibility](https://nodejs.org/en/about/previous-releases)
4. [Custom Server With Next.js](https://nextjs.org/docs/advanced-features/custom-server)
