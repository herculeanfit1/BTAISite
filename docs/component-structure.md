# BridgingTrustAI Component Structure

This document outlines the component structure and organization for the BridgingTrustAI project.

## Component Location

All components are now located in the `/app/components` directory, following Next.js 14 App Router conventions. This change helps ensure proper server component and client component handling.

## Component Structure Guidelines

1. **Named Exports**: All components should use named exports instead of default exports:

```tsx
// ✅ Good
export const Button = ({ children, ...props }: ButtonProps) => {
  return <button {...props}>{children}</button>;
};

// ❌ Bad
const Button = ({ children, ...props }: ButtonProps) => {
  return <button {...props}>{children}</button>;
};
export default Button;
```

2. **TypeScript Interface Definitions**: Define interfaces for component props:

```tsx
interface ButtonProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
}
```

3. **Server vs. Client Components**: By default, use Server Components. Only add the `'use client'` directive when needed for client-side interactivity:

```tsx
// For client components only
"use client";

import { useState } from "react";
```

4. **Dynamic Imports**: When dynamically importing client components, make sure to handle named exports properly:

```tsx
// When the component uses named exports:
const BlogSearch = dynamic(
  () => import("@/app/components/BlogSearch").then((mod) => mod.BlogSearch),
  { ssr: false },
);

// When the component needs to be isolated in a client-only environment:
// Create a wrapper client component in the same directory as the page
("use client");
import { BlogSearch } from "@/app/components/BlogSearch";

export function ClientBlogSearch() {
  return <BlogSearch />;
}
```

5. **Import Paths**: Use the `@/app/components/` import path consistently:

```tsx
// ✅ Good
import { Button } from "@/app/components/Button";

// ❌ Bad
import { Button } from "../../components/Button";
import { Button } from "@/components/Button";
```

## Component Categories

Components are organized into several categories:

1. **Base UI Components**: Button, Card, Icon, etc.
2. **Layout Components**: NavBar, Footer, PageHeader, etc.
3. **Feature Components**: BlogSearch, Newsletter, ServiceCard, etc.
4. **Page-Specific Components**: Components used only on specific pages can be placed in that page's directory.

## Testing Components

When writing tests for components:

```tsx
// ✅ Good
import { render, screen } from "@testing-library/react";
import { Button } from "@/app/components/Button";

// Test the component...
```

## Optimization Considerations

### Bundle Size

- Client Components should be kept small and focused to minimize JavaScript sent to the client
- Consider using dynamic imports with the `dynamic` function for larger client components that aren't needed on initial load
- Group related icons in a single file (like `Icons.tsx` or `NetworkIcons.tsx`) rather than creating many individual files

### Server Components

- Prefer Server Components for any component that doesn't need client-side interactivity
- Server Components don't add to the client JavaScript bundle size, resulting in faster page loads
- Data fetching should be done in Server Components whenever possible

### Component Granularity

- Components should be neither too large (hard to maintain) nor too small (creates unnecessary complexity)
- Components exceeding 150-200 lines should generally be broken down into smaller, more focused components
- Consider extracting repeated patterns into reusable components
