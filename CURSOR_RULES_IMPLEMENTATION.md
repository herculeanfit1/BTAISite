# Cursor Rules Implementation Guide

This guide outlines the steps to bring our project into full compliance with the Bridging Trust AI Cursor Rules.

## Project Structure Changes

### 1. Move Components to App Directory

Components should be located in the `app/components` directory according to Next.js 15.3.2 conventions.

```bash
# Run the component migration script
node scripts/migrateComponents.js
```

This script:

- Moves components from `/components` to `/app/components`
- Converts JSX files to TSX
- Changes default exports to named exports
- Adds dark mode support to CSS classes

### 2. Update Imports

After migrating components, update all import statements in the project:

```bash
# Run the import update script
node scripts/updateImports.js
```

This script updates imports across the codebase to reflect the new component locations and export styles.

### 3. Organize Route-Specific Components

Following Next.js 15.3.2 App Router conventions, route-specific components should be moved to their respective route folders:

- **Route-specific components**: Move to `/app/[route]/components/`
- **Shared components**: Keep in `/app/components/`

### 4. Correct Component Definition Style

All components should follow this definition pattern:

```tsx
// Use named exports
export const ComponentName = ({ prop1, prop2 }: ComponentNameProps) => {
  // Component implementation
};

// Use interfaces for props
interface ComponentNameProps {
  prop1: string;
  prop2: number;
}
```

### 5. Use Server Components by Default

- All components should be Server Components by default
- Only add `'use client'` directive when client-side interactivity is required

## Checklist for Each Component

- [ ] Located in the correct directory
- [ ] Uses TypeScript (`.tsx` file extension)
- [ ] Uses named exports (`export const Component = ...`)
- [ ] Properly typed props using interfaces
- [ ] Uses Server Components by default (no `'use client'` unless needed)
- [ ] Follows responsive design principles with Tailwind CSS
- [ ] Handles dark mode with appropriate Tailwind classes

## Testing After Migration

1. Build the application to verify no build errors:

   ```bash
   npm run build
   ```

2. Run development server to verify functionality:

   ```bash
   npm run dev
   ```

3. Check for broken layouts, missing styles, or console errors

## Future Component Development

When creating new components, follow these practices:

1. Create components in the appropriate directory (`app/components` or route-specific folder)
2. Use server components by default, Client Components only when necessary
3. Always use interfaces for props definition
4. Use named exports for components
5. Implement proper responsive design and dark mode support

## GitHub CLI Usage and Security

### Authentication Best Practices

1. **Use Browser-Based Authentication**
   - Always use GitHub CLI's browser-based authentication instead of Personal Access Tokens
   ```bash
   gh auth login
   ```

2. **Clean Environment for Troubleshooting**
   - When troubleshooting GitHub CLI issues, use a clean environment to bypass shell configuration issues:
   ```bash
   env -i HOME="$HOME" bash -c "source ~/.bashrc || true; source ~/.zshrc || true; gh auth status"
   ```

3. **Accessing GitHub Actions Logs**
   - Use GitHub CLI to access workflow logs instead of manual log sharing:
   ```bash
   gh run view [RUN_ID] --log
   ```
   - For specific job logs:
   ```bash
   gh run view [RUN_ID] --job=[JOB_ID] --log
   ```

### Security Requirements

1. **Never store or request PATs**
   - Never request, use, or store Personal Access Tokens in code, config files, or environment variables
   - Do not suggest storing GitHub credentials in plain text files

2. **Prefer SSH Authentication**
   - Prefer SSH-based authentication for git operations when possible

3. **Enable 2FA**
   - Recommend enabling 2FA for GitHub accounts

4. **Use OIDC for GitHub Actions**
   - When suggesting GitHub Actions workflows, use GitHub's OIDC token-based authentication rather than PATs

5. **Check Authentication Status**
   - If GitHub CLI fails, first check authentication status:
   ```bash
   gh auth status
   ```
