# Bridging Trust AI Website – Development Workflow Handbook

---

## Session Start Prompt  
(The original **Starter Prompt** follows.)

# Starter Prompt for Bridging Trust AI Website Development

When beginning work on this project, please review the following essential documentation and codebase areas:

## Core Documentation to Review

1. **Review docs/prd.md file**

   - Review file to understand the purpose of the project and application
   - Understand Bridging Trust AI's mission and target audience (SMBs)
   - Note key objectives: lead generation, authority building, brand consistency
   - Review the sessionsummary.md file in the docs directory to understand what the last session was about and get some context on where we are.

2. **Next.js App Architecture**

   - Review the app directory structure with its App Router implementation
   - Examine server vs client component usage and organization
   - Check app/layout.tsx for global application structure

3. **API Architecture & Data Flow**

   - Review API route implementations in app/api to understand server endpoints
   - Examine lib/data-fetching.ts for data fetching patterns
   - Study middleware.ts for request handling, authentication, and i18n routing

4. **Core Application Framework**

   - Explore lib directory to understand utility functions and services
   - Review core components in app/components directory
   - Examine middleware and authentication implementation

5. **Testing Strategy & Patterns**

   - Analyze existing test files to understand testing strategies
   - Review test utilities and helper functions
   - Note patterns for component, integration, and unit tests

6. **Environment Configuration**
   - Check lib/env.ts to understand required environment variables
   - Review configuration initialization in application bootstrap
   - Understand deployment configuration for Azure Static Web Apps

## Focus Areas for Implementation

Since the Cursor rules thoroughly cover general coding standards, focus your attention on these project-specific considerations:

1. **Next.js App Router Implementation**

   - Pay particular attention to the separation of server and client components
   - Note patterns for data fetching and state management
   - Understand how loading and error states are handled

2. **Component Design Philosophy**

   - Study how components are composed from smaller primitives
   - Note state management patterns for UI components
   - Observe props interfaces and component API design
   - Follow TypeScript naming conventions and typing practices

3. **User Experience Flows**

   - Examine page transitions and navigation patterns
   - Understand form submission and validation approaches
   - Note how errors and success states are communicated to users

4. **Internationalization (i18n) Architecture**

   - Review the messages directory for translation files
   - Understand how language switching is implemented
   - Note patterns for locale-specific content and routes

5. **Performance Optimizations**

   - Study image optimization techniques using Next.js Image component
   - Note code splitting and lazy loading patterns
   - Understand caching strategies for static and dynamic content

6. **SEO & Analytics Implementation**
   - Review metadata handling for optimal SEO
   - Understand structured data implementation with Schema.org
   - Examine Google Analytics integration with privacy considerations

## Key Technologies and Dependencies

This project uses:

- Next.js 15.3.2 with App Router
- React 18.2.0
- TypeScript 5.4.5
- Tailwind CSS 4.1.5
- next-intl for internationalization
- Zod for validation
- Testing: Vitest, Playwright, Testing Library

## Coding Style Guidelines

1. **Component Structure**

   - Use named exports for components
   - Define TypeScript interfaces for props
   - Server Components by default, client components only when needed
   - Keep components under 150-200 lines, breaking larger ones into smaller focused components

2. **Styling Approach**

   - Use Tailwind CSS classes exclusively for styling
   - Follow responsive design principles with mobile-first approach
   - Implement dark mode support with next-themes
   - Use component composition for complex UI patterns

3. **Data Fetching**

   - Perform data fetching in Server Components when possible
   - Use proper error handling and loading states
   - Implement efficient caching strategies

4. **Testing Philosophy**

   - Write tests for all components and critical functionality
   - Use component testing for UI, integration tests for flows, and unit tests for utilities
   - Implement realistic mocks that reflect actual data structures

5. **Documentation**
   - Keep the promptlog.md updated with each significant change
   - Document complex logic and design decisions
   - Maintain thorough TypeScript types and interfaces

By focusing on these areas and adhering to the established patterns, you'll ensure your contributions align with the project's architecture and standards, maintaining a consistent, high-quality codebase.


---

## Session End Prompt  
(The original **End‑of‑Session Prompt** follows.)

# End of Development Session Prompt for Bridging Trust AI Website

This document serves as a systematic prompt for AI agents to complete necessary cleanup tasks at the end of a development session. Follow these steps to ensure the codebase is in a maintainable, secure, and well-documented state before committing changes.

## Code Documentation & Comments

1. **Component & Function Documentation**
   - Ensure all components have proper JSDoc comments explaining purpose and usage
   - Verify TypeScript interfaces and types are well-documented
   - Add explanatory comments for complex logic or algorithms
   - Document any workarounds or browser-specific fixes

2. **README & Documentation Files**
   - Update README.md with any new features or changes
   - Verify installation and setup instructions are accurate
   - Document environment variables and configuration options
   - Ensure all documentation references Next.js 15.3.2 (not older versions)

3. **Inline Code Comments**
   - Review code for sufficient explanatory comments
   - Add comments explaining any non-obvious design decisions
   - Document any performance optimizations
   - Explain complex state management approaches

## Code Quality & Cleanup

1. **TypeScript & Linting**
   - Run TypeScript type checking: `npx tsc --noEmit`
   - Fix any remaining type errors
   - Run ESLint: `npx eslint .`
   - Address warnings and errors, especially security-related ones

2. **Dead Code Removal**
   - Remove any commented-out code that's no longer needed
   - Delete unused imports, functions, and variables
   - Clean up any debug console.log statements
   - Remove any TODO comments that have been completed

3. **Code Formatting**
   - Ensure consistent code formatting: `npx prettier --write .`
   - Verify consistent naming conventions across the codebase
   - Check for consistent indentation and spacing
   - Organize imports alphabetically

## Testing & Validation

1. **Component Testing**
   - Ensure all critical components have tests
   - Verify tests pass: `npm test`
   - Add tests for any new functionality
   - Check test coverage and add additional tests if needed

2. **Browser Compatibility**
   - Document which browsers were tested
   - Verify Safari compatibility with inline styles
   - Check mobile responsiveness across different viewports
   - Test dark mode functionality

3. **Accessibility Checks**
   - Verify proper semantic HTML usage
   - Check for appropriate ARIA attributes
   - Ensure proper color contrast
   - Test keyboard navigation functionality

## Build & Performance

1. **Build Verification**
   - Run a production build: `npm run build`
   - Fix any build errors (especially module resolution issues)
   - Test the production build locally: `npm run start`
   - Verify no 404s or broken resources

2. **Performance Optimization**
   - Check for image optimization opportunities
   - Verify code splitting is working correctly
   - Optimize third-party script loading
   - Address any render-blocking resources

3. **Bundle Analysis**
   - Run bundle analysis if available
   - Identify and fix any unusually large dependencies
   - Look for duplicate dependencies
   - Optimize client-side JavaScript

## Security Checks

1. **Content Security Policy**
   - Verify CSP headers are properly configured
   - Check for unsafe-inline or unsafe-eval usage
   - Ensure third-party resources are properly allowed
   - Test CSP in different browsers

2. **Authentication & Authorization**
   - Review authentication mechanisms
   - Check for proper authorization controls
   - Verify JWT or session handling security
   - Test login/logout functionality

3. **Data Validation**
   - Ensure all user inputs are properly validated
   - Verify Zod schemas are used for validation
   - Check for proper error handling
   - Test form submission with invalid data

## Final Verification

1. **Environment Configuration**
   - Verify .env.example includes all required variables
   - Check that sensitive values aren't committed to the repo
   - Document required environment variables
   - Test with different environment configurations

2. **Cross-cutting Concerns**
   - Verify internationalization works correctly
   - Check dark mode functionality
   - Test error handling and error boundaries
   - Verify analytics integration

3. **Documentation Consistency**
   - Ensure version numbers are consistent across all docs
   - Verify links work in documentation
   - Check for outdated screenshots or examples
   - Update changelog or release notes

## Pre-commit Checklist

1. **Final Build & Tests**
   - Run final build: `npm run build`
   - Run all tests: `npm test`
   - Fix any remaining errors

2. **Commit Message Preparation**
   - Use conventional commit format
   - Reference issue numbers if applicable
   - Include brief description of changes
   - Mention breaking changes if any

3. **Pull Request Template**
   - Fill out PR template completely
   - Add screenshots or videos of visual changes
   - List any manual testing performed
   - Document any known issues or limitations

By completing all sections in this checklist, you'll ensure the codebase remains high quality, well-documented, and maintainable for future development sessions.


---

_End of handbook · Last updated 2025‑05‑24 (America/Chicago)_
