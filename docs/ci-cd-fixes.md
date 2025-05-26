# CI/CD Pipeline Fixes

This document outlines the fixes made to resolve issues with the CI/CD pipeline for the Azure Static Web Apps deployment.

## Issues Fixed

### 1. Dependency Version Pinning

**Problem**: The CI/CD pipeline validation was failing because some dependencies were not using exact version numbers. The presence of carets (`^`) in version numbers was causing validation errors.

**Fix**: 
- Updated all dependencies in `package.json` to use exact version numbers
- Fixed the version of `azure-functions-core-tools` in `email-function/package.json` to use a known valid version (4.0.5341)

### 2. ESLint Configuration

**Problem**: The ESLint configuration had compatibility issues with ESM modules and ESLint 9.

**Fix**:
- Updated `eslint.config.js` to use proper ESM module syntax (`import` instead of `require`)
- Fixed imports for ESLint packages 
- Added the eslint.config.js file to the tsconfig.json include list

### 3. Next.js Configuration

**Problem**: The `next.config.js` file had several issues causing build errors.

**Fix**:
- Removed duplicate `skipTrailingSlashRedirect` entry
- Properly organized and documented the middleware configuration options
- Fixed `process.env` references by importing the env object from 'node:process'
- Addressed unused variable warnings in the exportPathMap function
- Ensured `skipMiddlewareUrlNormalize` is correctly set to avoid header warnings with static exports

### 4. Azure Static Web Apps Configuration

**Problem**: The `staticwebapp.config.json` file contained an invalid error status code format in the `responseOverrides` section.

**Fix**:
- Updated `responseOverrides` section to use "500-599" for server error range instead of "Error" or "500"
- The Azure Static Web Apps documentation requires specific formats for error codes:
  - For standard HTTP errors (404, 401, 403), you can use those exact numbers
  - For server error ranges, you must use a range format like "500-599"
  - The string "Error" is not a valid format despite being mentioned in some documentation
- Ensured configuration follows the latest Azure Static Web Apps schema requirements

### 5. Build Script Syntax Errors

**Problem**: The `scripts/standardizeImports.js` file contained unterminated string literals that were causing build failures.

**Fix**:
- Fixed unterminated string literals in the import pattern replacements
- Corrected all instances of string replacement patterns by ensuring they had proper closing quotes
- The script was using extra single quotes in the string replacement patterns

## Best Practices for Future Maintenance

1. **Always use exact version numbers** in `package.json` and other dependency files to ensure reproducible builds.

2. **Test configuration files against schema validation** before deploying to catch format errors early.

3. **Follow Azure Static Web Apps documentation** closely for configuration requirements, especially for:
   - Response overrides (use range format like "500-599" for server errors)
   - Route configurations
   - API runtime settings

4. **Use consistent module syntax** across the codebase:
   - The project uses ESM modules (`"type": "module"` in package.json)
   - All .js files should use ESM import/export syntax
   - When working with Node.js built-ins like 'process', import them explicitly: `import { env } from 'node:process'`

5. **Regularly update dependencies** to compatible versions to avoid security issues.

6. **Handle ESLint and TypeScript properly**:
   - Ensure config files are included in tsconfig.json
   - Fix linting issues proactively
   - Eventually re-enable TypeScript and ESLint checking in the build process

7. **Validate scripts for syntax errors before committing**:
   - Check for proper string literal termination
   - Ensure JavaScript syntax is valid in all scripts
   - Consider adding automated syntax validation to pre-commit hooks

## Related Documentation

- [Azure Static Web Apps Configuration Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration)
- [Azure Static Web App Response Overrides](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration#response-overrides)
- [Next.js Static Export Documentation](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports)
- [ESLint 9 Configuration Guide](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [Next.js ESM Support](https://nextjs.org/docs/app/building-your-application/configuring/eslint#migrating-existing-config) 