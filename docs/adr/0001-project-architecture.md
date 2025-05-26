# 1. Project Architecture

Date: 2025-01-27

## Status

Accepted

## Context

The Bridging Trust AI website requires a modern, scalable architecture that supports:
- Static site generation for optimal performance
- Internationalization for global reach
- Component-based development for maintainability
- Comprehensive testing for reliability
- Security best practices for trust

## Decision

We will use Next.js 15.3.2 with App Router as the primary framework with the following architecture:

- **Frontend**: Next.js 15.3.2 with React 19.0.0
- **Styling**: Tailwind CSS v4 with utility-first approach
- **TypeScript**: Strict mode for type safety
- **Testing**: Vitest + Playwright + Jest for comprehensive coverage
- **Deployment**: Static export to Azure Static Web Apps
- **Internationalization**: next-intl for multi-language support

## Consequences

### Positive
- Static export provides excellent performance and security
- App Router enables modern React patterns with Server Components
- TypeScript strict mode catches errors early
- Comprehensive testing ensures reliability
- Tailwind CSS provides consistent, maintainable styling

### Negative
- Static export limits some dynamic features
- Learning curve for App Router patterns
- Build complexity with multiple testing frameworks

### Neutral
- Requires adherence to cursor rules for consistency
- Documentation overhead for architectural decisions 