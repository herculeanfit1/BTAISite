# Bridging Trust AI Website

[![CI/CD Pipeline](https://github.com/herculeanfit1/BridgingTrustAISite/actions/workflows/deploy.yml/badge.svg)](https://github.com/herculeanfit1/BridgingTrustAISite/actions/workflows/deploy.yml)

A modern website for the Bridging Trust AI consultancy, focusing on ethical and trustworthy AI implementations.

## Recent Updates

### 🌙 Dark Mode Implementation (Latest)

- **Complete Dark Mode System**: Implemented comprehensive dark mode with system preference detection
- **Smooth Transitions**: Beautiful 200ms transitions between light and dark themes
- **Accessibility Compliant**: WCAG AA compliant with proper ARIA labels and keyboard navigation
- **Mobile Responsive**: Theme toggle available on both desktop and mobile navigation
- **Comprehensive Testing**: 100% test coverage with unit, integration, and E2E tests
- **Brand Consistent**: Custom color palette that maintains brand identity in both themes

### Navigation and Page Structure

- **Simplified Navigation**: Consolidated site navigation with sections on the main page (Solutions, About, Contact)
- **Enhanced Solutions Section**: Updated all solution links to point to the coming-soon page
- **Improved Header**: Increased company logo size by 30% and made the navigation buttons right-justified
- **Improved Footer**: Removed duplicate quick links and adjusted horizontal divider
- **Privacy Enhancements**: Removed contact information (email, phone, address) from the Contact section
- **Streamlined UI**: Removed the "Learn More" button from the hero section
- **Coming Soon Page**: Removed NextJS feature cards section from the coming-soon page

### Content Improvements

- **Updated Headline**: Enhanced the headline and subheadings with more compelling content
- **Improved Mission**: Updated "Our Story" section with revised company mission
- **Solutions Focus**: Made the "Our Solutions" heading more prominent (larger, bold, centered)

## Static Export Approach

This website is configured as a fully static site using Next.js static export. This approach has several benefits:

- **Improved Performance**: Static sites load faster and have better core web vitals scores
- **Simpler Hosting**: Can be deployed to any static hosting service (CDN, Azure Static Web Apps, etc.)
- **Enhanced Security**: Reduced attack surface with no server-side code execution
- **Lower Costs**: Static hosting is typically much less expensive than server-based options

Key configuration points:

- `output: "export"` is set in next.config.js
- Images are configured with `unoptimized: true` for static export compatibility
- No middleware is used (incompatible with static export)
- Security headers are managed via staticwebapp.config.json
- Redirects and routing are handled at the hosting level

### Building for Deployment

To generate a static build for deployment:

```bash
npm run build
```

This will output static files to the `out` directory, which can be deployed to any static hosting service.

## Node.js Version Requirements

### Overview

This project requires Node.js LTS (v20.x) for optimal compatibility with React 19 and Next.js 15.3.2. We've completed a comprehensive upgrade from previous versions to ensure the codebase takes full advantage of modern features and security improvements.

### Required Node.js Version

- **✅ Required**: Node.js v20.x LTS (tested with v20.19.1)
- **❌ Not Compatible**: Node.js v18.x (no longer supported)
- **❌ Not Compatible**: Node.js v23.x (causes compatibility issues)

### Technology Stack

- **React**: 19.0.0 (upgraded from 18.2.0)
- **Next.js**: 15.3.2
- **TypeScript**: Latest version
- **Tailwind CSS**: v4
- **Docker**: For production deployment and CI
- **Nginx**: For SSL termination and proxy
- **Certbot**: For automatic SSL certificate management

### Recent Improvements

#### Security Enhancements

- Implemented comprehensive SSL configuration with Let's Encrypt
- Created a flexible server configuration supporting dev, CI, and production environments
- Replaced all HTML anchor tags with Next.js Link components for proper client-side navigation
- Fixed unsafe window object usage with proper Next.js hooks
- Implemented improved error handling in API routes
- Added comprehensive type checking to prevent object injection vulnerabilities
- Enhanced security of form handling with proper validation

#### DevOps and Deployment

- Streamlined CI process with Docker configuration
- Added HTTP-only mode for CI testing
- Created scripts for automatic SSL certificate generation and renewal
- Configured Nginx for SSL termination and proper proxy behavior
- Improved production deployment documentation

#### User Experience Updates

- Consolidated About page content into the main page for improved user flow
- Updated navigation to use anchor links to page sections instead of separate pages
- Improved error boundary implementation for better error handling

#### Code Quality

- Re-enabled TypeScript strict type checking
- Fixed ESLint warnings and errors
- Improved API error handling and responses
- Enhanced component structure for better maintainability

### Installation & Setup

To manage Node.js versions, we strongly recommend using NVM (Node Version Manager):

```bash
# Install NVM (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Install and use the required Node.js version
nvm install 20
nvm use 20

# Verify installation
node -v  # Should output v20.x.x
npm -v   # Should show the compatible npm version
```

## Server Implementation

This project can be run using two different server implementations:

1. **Default Next.js Server** (recommended for development):

   ```bash
   npm run dev:next
   ```

2. **Custom Server** (with enhanced features):
   ```bash
   npm run dev
   ```

The custom server implementation in `server.js` adds:

- Dynamic SSL certificate handling
- Environment-specific configuration
- Content-type header handling
- Comprehensive logging

## Environment Modes

The application supports several environment modes:

### Development Mode

```bash
npm run dev
```

Features:

- Hot reloading
- Self-signed SSL certificates
- HTTPS by default

### CI/Testing Mode

```bash
CI=true npm run dev
```

Features:

- HTTP-only mode
- No SSL certificates required
- Simplified configuration for testing

### Production Mode

```bash
NODE_ENV=production SSL_CERT_ENV=prod npm run start
```

Features:

- Let's Encrypt SSL certificates
- HTTPS with proper certificate chain
- Performance optimizations

## Docker Deployment

### Development

```bash
docker-compose up --build
```

### CI/Testing

```bash
CI=true docker-compose up --build
```

### Production

```bash
SSL_CERT_ENV=prod docker-compose up --build
```

For more details, see [Deployment Guide](docs/deployment.md) and [Production Deployment](docs/production-deployment.md).

## UI Testing

This project includes an automated UI testing suite using Playwright. These tests validate the functionality and appearance of the website across different browsers and viewports.

### Test Structure

- **Page Tests**: Located in `src/uitests/pages/`, these test specific pages:

  - `home.spec.ts`: Tests for the homepage
  - `about.spec.ts`: Tests for the about page
  - `services.spec.ts`: Tests for the services page
  - `contact.spec.ts`: Tests for the contact page

- **Utility Functions**: Located in `src/uitests/utils/test-utils.ts`, providing reusable test functionality:
  - Dark mode testing
  - Responsive design testing
  - Accessibility testing

### Running Tests

To run all UI tests:

```bash
npm run test:ui
```

To run tests for a specific page:

```bash
npx playwright test src/uitests/pages/contact.spec.ts
```

To run tests in a specific browser:

```bash
npx playwright test --project=chromium
```

To run tests and open the HTML report:

```bash
npx playwright test --reporter=html && npx playwright show-report
```

### Configuration

The Playwright configuration is in `playwright.config.ts` and includes:

- Multiple browser configurations (Chromium, Firefox, WebKit)
- Mobile viewport testing
- Automatic screenshot capture on test failure
- HTML report generation

### Continuous Integration

UI tests are automatically run on GitHub Actions for pull requests and pushes to the main branch. The workflow file is located at `.github/workflows/ui-tests.yml`.

## Testing

### Docker-Based Testing

This project uses Docker for consistent testing across all environments. Docker testing eliminates platform-specific issues (particularly with Rollup modules) and ensures tests run identically on all machines.

#### Quick Start

Run quick tests (unit + middleware):

```bash
npm run test:docker:quick
```

Run all tests:

```bash
npm run test:docker
```

For pre-commit testing of affected components:

```bash
npm run test:docker:affected
```
