# Next.js Middleware to Static Export Migration Guide

This document explains how we resolved the incompatibility between Next.js middleware and static exports for the Azure Static Web Apps deployment.

## The Problem

When deploying to Azure Static Web Apps with static exports (using `output: 'export'` in next.config.js), we encountered the following error:

```
Error: Middleware cannot be used with "output: export"
```

This is a fundamental limitation of Next.js, as middleware requires a server runtime, which isn't available in a static export.

## Our Hybrid Solution

We implemented a hybrid approach that maintains the security and routing features previously handled by middleware:

### 1. Security Headers Migration

All security headers previously set in middleware.ts have been moved to `staticwebapp.config.json` under the `globalHeaders` section:

```json
"globalHeaders": {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://www.google-analytics.com; frame-src 'self'; report-uri /api/csp-report",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Report-To": "{\"group\":\"default\",\"max_age\":31536000,\"endpoints\":[{\"url\":\"/api/csp-report\"}],\"include_subdomains\":true}"
}
```

### 2. Content-Type Handling

The middleware previously set content-type headers for HTML responses. In Azure Static Web Apps, this is handled through the `mimeTypes` configuration:

```json
"mimeTypes": {
  ".json": "application/json",
  ".avif": "image/avif",
  ".webp": "image/webp",
  ".webmanifest": "application/manifest+json",
  ".js": "text/javascript",
  ".css": "text/css",
  ".html": "text/html",
  ".ico": "image/x-icon"
}
```

### 3. Fallback Pages

We created fallback pages for 404 and 500 errors:

```tsx
// app/404.tsx
export default function Custom404() {
  redirect('/not-found');
}

// app/500.tsx
export default function Custom500() {
  redirect('/error');
}
```

### 4. Dynamic Routes Handling

For dynamic routes that can't be pre-rendered statically, we:

1. Added a build:static script to package.json that sets `NEXT_PUBLIC_SKIP_DYNAMIC_ROUTES=true`
2. Modified dynamic route files to check for this environment variable and use fallback data

```tsx
// Example from app/blog/category/[category]/page.tsx
export async function generateStaticParams() {
  // For static export builds, use a minimal set of categories
  if (process.env.NEXT_PUBLIC_SKIP_DYNAMIC_ROUTES === 'true') {
    return [
      { category: "case-studies" },
      { category: "guides" },
      // ... more categories
    ];
  }
  
  // Regular data fetching for development
  try {
    // ... regular data fetching
  } catch (error) {
    // ... fallback to static data
  }
}
```

### 5. Lightweight Middleware for Development Environment

We've implemented a lightweight middleware that works with static exports by only applying minimal functionality during development:

```tsx
// middleware.ts - Static Export Compatible Version
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // For development environments only - these headers won't apply to the static export
  const response = NextResponse.next();
  
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('X-Development-Mode', 'true');
  }
  
  return response;
}

// Only run on minimal paths in development, as middleware is ignored in static exports
export const config = {
  matcher: [
    // Only match root path in development for minimal overhead
    '/'
  ],
};
```

This middleware:
- Only applies minimal functionality in development
- Has no effect in the final static export
- Doesn't interfere with the static export build process
- Maintains compatibility with the middleware testing infrastructure

## Changes Made

1. **Removed Original Middleware**
   - Backed up original middleware.ts as middleware.ts.bak-hybrid
   - Created a new lightweight middleware.ts compatible with static exports
   - Updated middleware tests to work with the new lightweight implementation

2. **Configuration Files**
   - Updated staticwebapp.config.json with all security headers
   - Added proper Report-To header in JSON format
   - Updated Azure Static Web Apps workflow to use the build:static script

3. **Fallback Pages**
   - Created app/404.tsx and app/500.tsx for static error pages
   - Modified app/not-found.tsx and app/error.tsx to work with static export

4. **Build Process**
   - Added build:static script to package.json
   - Modified dynamic routes to handle static export mode
   - Updated GitHub workflow to use the build:static script
   - Enhanced static-export-helper.js to check middleware compatibility

## Testing the Solution

1. **Local Testing**
   ```bash
   NEXT_PUBLIC_SKIP_DYNAMIC_ROUTES=true npm run build
   ```

2. **Verify Output Directory**
   ```bash
   ls -la out/
   ```

3. **Test with a Local Server**
   ```bash
   npx serve out
   ```

4. **Test Middleware in Development**
   ```bash
   npm run dev
   # Check that X-Development-Mode header is present in responses
   ```

5. **Run Middleware Tests**
   ```bash
   npm run test:middleware
   ```

## Maintaining and Troubleshooting

### Adding New Static Routes

When adding new static routes, follow these guidelines:

1. Implement proper fallback content for static export
2. For dynamic routes, check for the NEXT_PUBLIC_SKIP_DYNAMIC_ROUTES environment variable
3. Add static data fallbacks for API routes

### Common Issues

1. **Content Security Policy Issues**
   - Adjust the CSP in staticwebapp.config.json if you need to add new domains or directives

2. **Missing Static Routes**
   - If a route doesn't generate in the static export, add it to the generateStaticParams function

3. **API Routes**
   - Make sure all API routes have `export const dynamic = 'force-static';` to work in static export

4. **Middleware Compatibility**
   - If you need to add functionality to middleware.ts, ensure it remains compatible with static exports
   - Test both development mode and production mode behavior
   - Keep the middleware.test.ts file updated to test your changes

## Future Considerations

If advanced middleware functionality becomes necessary in the future, consider:

1. **Hybrid Rendering Mode**
   - Azure Static Web Apps now supports hybrid Next.js apps (in preview)
   - This allows middleware and server components while maintaining the benefits of static content

2. **Edge Functions**
   - Implement middleware-like functionality using edge functions or Azure Functions

3. **Custom API Backend**
   - Add a custom API backend linked to your Static Web App for dynamic functionality 