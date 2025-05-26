# Security Testing Documentation

This document describes the security testing setup for the Bridging Trust AI website.

## Security Enhancements Implemented

1. **Security Headers**

   - Content Security Policy (CSP)
   - X-Content-Type-Options
   - X-Frame-Options
   - X-XSS-Protection
   - Referrer-Policy
   - Permissions-Policy

2. **Rate Limiting**

   - Implemented in lib/rate-limit.ts
   - Configurable limits and time windows for API endpoints
   - Used to protect against brute force and DoS attacks

3. **Input Validation**

   - Zod schemas for API request validation
   - Protection against malicious inputs and injection attacks

4. **Form Protection**
   - Honeypot fields to detect bots
   - CSRF protection through tokens

## Running Security Tests

### Local Testing

Run the basic security test suite:

```sh
npm run test:basic
```

Run the full security test suite:

```sh
npm run test:security
```

### CI Testing

The CI workflow uses a script that handles server startup, testing, and cleanup:

```sh
npm run test:ci-basic
```

This script:

1. Starts the Next.js server
2. Ensures security middleware is properly configured
3. Runs the tests
4. Shuts down the server

## Security Test Files

- `src/uitests/security.spec.ts`: Tests for security headers and rate limiting
- `src/uitests/contact-validation.spec.ts`: Tests for form validation and protection
- `src/uitests/contact-basic.spec.ts`: Basic site navigation tests

## GitHub CI Workflow

The `.github/workflows/security-tests.yml` workflow automatically runs security tests on:

- Push to the main branch
- Pull requests to the main branch

## Maintenance

When updating security features:

1. Update the corresponding test to verify the change
2. Run the tests locally before pushing to GitHub
3. Check the GitHub Actions results after pushing
