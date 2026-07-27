# Migration Summary

This document summarizes migration efforts for the Bridging Trust AI website.

## Next.js 15 and Tailwind CSS v4 Upgrade

### What Changed

We've upgraded the project from Next.js 14 to Next.js 15.3.1, React 18 to React 19.0.0, and Tailwind CSS v3 to v4.1.5. This represents a significant update to our core technologies.

### Key Changes Made

#### Configuration Updates

1. Package.json changes:

   - Updated Next.js to v15.3.1
   - Updated React and React DOM to v19.0.0
   - Updated Tailwind CSS to v4.1.5
   - Added @tailwindcss/postcss dependency
   - Added @next/eslint-plugin-next dependency
   - Added "type": "module" for ESM support

2. Build configuration:

   - Converted tailwind.config.js from CommonJS to ESM format
   - Updated postcss.config.mjs to use @tailwindcss/postcss
   - Modified next.config.js to remove deprecated experimental options
   - Removed .eslintrc.json in favor of eslint.config.mjs

3. CSS updates:
   - Updated globals.css to use the new Tailwind v4 directives
   - Changed from @layer base to @theme directive
   - Updated styling patterns to align with Tailwind v4

#### Type Safety Improvements

1. Created lib/route-types.ts to define proper types for Next.js 15 routes
2. Updated components to use Route<string> for href props:
   - Button, Breadcrumbs, BasicCard components
   - HeroSection, NavBar, SimpleCard, ServiceCard components
   - PageHeader component for customBreadcrumbs
3. Fixed dynamic route templates in various pages with proper type casting

#### API Routes

1. Made API routes compatible with static export using 'force-static' directive
2. Used generateStaticParams to pre-generate content for static export
3. Working on resolving issues with routes that use request.nextUrl.searchParams

### Known Issues

1. The blog search API route is currently incompatible with static export due to its use of nextUrl.searchParams
2. Some components may still need Route<string> type updates
3. Potential SSR hydration warnings from React 19 need to be addressed
4. Jest configuration needs to be migrated to ESM format

### Benefits of the Upgrade

- Improved typesafety through typed routes
- Better performance with React 19
- Modern CSS features with Tailwind v4
- Better developer experience with the latest tooling
- Enhanced static site generation capabilities

## App Router Migration

## Migration Overview

We successfully migrated the component structure of the BridgingTrustAI project to follow Next.js 14 App Router conventions. This included moving all components from the root `/components` and `/src/components` directories to the `/app/components` directory, converting default exports to named exports, and updating all import references throughout the codebase.

## Key Changes

1. **Component Location**:

   - Moved all components to `/app/components`
   - Created subdirectories for specialized components (e.g., `/app/components/icons`)

2. **Export Format**:

   - Changed default exports to named exports for all components
   - Updated import statements across the codebase to use named imports

3. **Import Path Standardization**:

   - Standardized import paths to use `@/app/components/` format
   - Removed relative path imports to components

4. **Client/Server Component Separation**:
   - Properly marked client components with `'use client'` directive
   - Created wrapper components for dynamic imports of client components

## Migration Process

1. Created scripts to automate the migration process:

   - `scripts/migrateComponents.js`: Moved components and updated export syntax
   - `scripts/standardizeImports.js`: Standardized import paths to use `@/app/components/`
   - `scripts/fixLegacyImports.js`: Updated remaining references to the old component locations

2. Fixed component import errors in tests and pages.

3. Created proper dynamic imports for client components used in server components.

4. Created documentation to establish component structuring guidelines for future development.

5. Removed old component directories after verifying successful build.

## Benefits of New Structure

1. **Better Alignment with Next.js 14**:

   - Proper use of Server and Client Components
   - Improved performance through Server Component usage

2. **Simplified Import Paths**:

   - Consistent import pattern reduces complexity
   - Absolute imports improve code maintainability

3. **Type Safety**:

   - Named exports provide better TypeScript support
   - Improved IntelliSense and autocompletion

4. **Reduced Bundle Size**:
   - Server Components don't contribute to client JavaScript bundle
   - Improved page load performance

## Future Improvements

1. Continue refining test suite to properly test both Server and Client Components.

2. Consider further categorization of components into subdirectories based on function.

3. Implement Storybook for component documentation and visual testing.

4. Create a component generator script to automate creation of new components following the established pattern.
