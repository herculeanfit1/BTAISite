# Security Implementation Guide

This document outlines the security measures implemented in the Bridging Trust AI website.

## Security Headers

The following security headers are implemented via Next.js middleware (`middleware.ts`):

| Header                    | Purpose                                                    | Value                                                       |
| ------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------- |
| Content-Security-Policy   | Prevents XSS attacks by specifying allowed content sources | Custom policy for scripts, styles, images, etc.             |
| Report-To                 | Configures reporting groups for browser violations         | JSON configuration for CSP reporting endpoint               |
| X-Content-Type-Options    | Prevents MIME type sniffing                                | `nosniff`                                                   |
| X-Frame-Options           | Prevents clickjacking attacks                              | `DENY`                                                      |
| X-XSS-Protection          | Additional XSS protection for older browsers               | `1; mode=block`                                             |
| Referrer-Policy           | Controls referrer information                              | `strict-origin-when-cross-origin`                           |
| Permissions-Policy        | Restricts browser features                                 | `camera=(), microphone=(), geolocation=()`                  |
| Strict-Transport-Security | Forces HTTPS connections                                   | `max-age=63072000; includeSubDomains; preload` (production) |

## CSP Reporting

Content Security Policy violations are now monitored through a dedicated reporting endpoint:

- **Report Endpoint**: `/api/csp-report`
- **Implementation**: Edge API route that logs and processes CSP violation reports
- **Reporting Directives**: Both `report-uri` (legacy) and `report-to` (modern) directives are configured
- **Monitoring**: All violations are logged for analysis and can be used to:
  - Identify legitimate CSP issues that need fixing
  - Detect potential XSS or injection attacks
  - Fine-tune the CSP policy based on real-world usage

### Implementation Details

The CSP reporting implementation consists of:

1. **API Route**: Created in `app/api/csp-report/route.ts` as an Edge API route to handle violation reports
2. **Middleware Configuration**: Updated in `middleware.ts` to add:
   - `report-uri` directive pointing to the reporting endpoint
   - `report-to` directive with a configured endpoint group
3. **Logging Structure**: CSP violation reports are logged with:
   - Time and date of violation
   - Document URI where violation occurred
   - Blocked URI that violated the policy
   - Violated directive
   - User agent information

### Future Enhancements

In production, consider enhancing the reporting endpoint to:

- Send reports to a dedicated logging/monitoring service
- Store violations in a database for trend analysis
- Send alerts for suspicious patterns of violations
- Implement automated CSP policy adjustments based on legitimate violation patterns

## API Security

All API routes are protected with:

1. **Rate Limiting**: Restricts the number of requests from a single IP address within a time window.
2. **Input Validation**: Uses Zod schema validation to ensure all inputs meet required constraints.
3. **Bot Detection**: Implements honeypot fields to detect and silently block automated form submissions.
4. **Data Sanitization**: Sanitizes all user inputs before processing.
5. **Cache Control Headers**: Prevents caching of sensitive API responses.

API rate limits:

- Contact form: 5 requests per minute
- Newsletter subscription: 3 requests per minute

## Cookie Security

All cookies are set with secure defaults through the cookie utility (`lib/cookies.ts`):

- `httpOnly: true` - Prevents JavaScript access to cookies
- `secure: true` - Ensures cookies are only sent over HTTPS (in production)
- `sameSite: 'lax'` - Restricts cookies in cross-site requests
- Appropriate expiration times based on purpose

## Form Security

1. **Client-side Validation**: Immediate feedback on invalid inputs.
2. **Server-side Validation**: Thorough validation of all inputs regardless of client-side checks.
3. **CSRF Protection**: Built-in protection via Next.js.
4. **Rate Limiting**: Prevents brute-force attacks.
5. **Error Sanitization**: Avoids leaking sensitive information in error messages.

## Authentication & Authorization

Currently, the site doesn't implement user authentication. When implemented, it will follow these principles:

- Secure password storage with bcrypt
- Multi-factor authentication options
- JWT with appropriate expiration
- Strict role-based access controls
- Session management with secure defaults

## Dependency Management

- Regular dependency audits via `npm audit`
- Automated updates for security patches
- Version pinning for critical dependencies

## Client-Side Security

- Implements strict Content Security Policy
- Uses HTTPS for all resources
- Avoids storing sensitive data in localStorage/sessionStorage
- Sanitizes all user-generated content before rendering

## Deployment Considerations

1. **Environment Variables**: Sensitive configuration is stored in environment variables
2. **HTTPS Only**: Production deployments should be HTTPS-only
3. **Edge Functions**: API routes are deployed as edge functions when possible for enhanced security
4. **Monitoring**: Implement monitoring for unusual request patterns

## Security Testing

Run the security audit:

```bash
npm run security:audit
```

## Reporting Security Issues

If you discover a security vulnerability, please report it by emailing [security@bridgingtrustai.com](mailto:security@bridgingtrustai.com).

## Future Improvements

- ✅ Implement Content Security Policy reporting
- Add server-side request logging for security events
- Implement more granular rate-limiting based on user behavior
- Set up automated security scanning in CI/CD pipeline
