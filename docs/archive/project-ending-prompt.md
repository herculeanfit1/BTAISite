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

4. **Promptlog Update**
   - Update `docs/promptlog.md` with session summary
   - Include key decisions and changes made
   - Document any issues encountered and solutions
   - Add timestamp and context for future reference

## Session Completion

By completing all sections in this checklist, you'll ensure the codebase remains high quality, well-documented, and maintainable for future development sessions.

**Final Steps:**
- [ ] All checklist items completed
- [ ] Code committed with proper message
- [ ] Documentation updated
- [ ] Server tested and working
- [ ] Ready for next development session

---

*Last updated: 2025-01-27*
