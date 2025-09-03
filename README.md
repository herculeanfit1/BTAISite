# Bridging Trust AI Website

[![CI/CD Pipeline](https://github.com/herculeanfit1/BTAISite/actions/workflows/cost-optimized-ci.yml/badge.svg)](https://github.com/herculeanfit1/BTAISite/actions/workflows/cost-optimized-ci.yml)

A modern, responsive website for Bridging Trust AI consultancy, built with Next.js 15.4.6 and deployed on Azure Static Web Apps. Features a clean design, working contact form with email integration, and mobile-optimized layouts.

## Recent Updates

### 📧 Email System & Mobile Optimization (Latest)

- **Working Contact Form**: Fully functional contact form with Resend email integration
- **Dual Email Delivery**: User confirmation and admin notification emails
- **Mobile Layout Fixed**: Proper spacing, alignment, and responsive design across all devices
- **Security Improvements**: Removed exposed API keys, implemented proper environment variable management
- **Clean Codebase**: Removed duplicate components and Azure Function email system

### Site Structure & Content

- **Single Page Application**: All content consolidated into main page with anchor navigation
- **Five Main Sections**: Hero, Leveling the Playing Field, Solutions, About Us (Founders), Contact
- **Responsive Design**: Optimized layouts for mobile and desktop with proper breakpoint handling
- **Founder Profiles**: Updated co-founder information with simplified titles
- **Solutions Showcase**: Two-column desktop, single-column mobile layout for service offerings

### Technical Infrastructure

- **Next.js 15.4.6**: Latest stable version with App Router architecture
- **Azure Static Web Apps**: Production deployment with CI/CD via GitHub Actions
- **Internationalization Ready**: Multi-locale support structure in place
- **Email Integration**: Resend API with rate limiting and bot protection

## Deployment Architecture

This website is deployed on **Azure Static Web Apps** with server-side API routes for email functionality. The architecture combines static site benefits with dynamic capabilities:

- **Static Frontend**: Pre-rendered pages for optimal performance and SEO
- **API Routes**: Server-side endpoints for contact form processing and email delivery
- **CDN Distribution**: Global content delivery with edge caching
- **Automated Deployment**: CI/CD pipeline via GitHub Actions

### Key Configuration

- **No Static Export**: Removed `output: "export"` to enable API routes
- **Images Unoptimized**: Compatible with Azure Static Web Apps hosting
- **Security Headers**: Managed via `staticwebapp.config.json`
- **Cache Control**: Optimized caching strategy for faster deployments

### Building for Deployment

```bash
npm run build
```

The build process creates optimized static assets and API functions that are automatically deployed to Azure Static Web Apps via GitHub Actions.

## Node.js Version Requirements

### Overview

This project requires Node.js LTS (v20.x) for optimal compatibility with React 19 and Next.js 15.4.6. The codebase is optimized for modern JavaScript features and enhanced security.

### Required Node.js Version

- **✅ Required**: Node.js v20.x LTS (tested with v20.19.1)
- **❌ Not Compatible**: Node.js v18.x (no longer supported)
- **❌ Not Compatible**: Node.js v23.x (causes compatibility issues)

### Technology Stack

- **React**: 19.0.0
- **Next.js**: 15.4.6
- **TypeScript**: 5.4.5
- **Styling**: CSS-in-JS with inline styles (Safari-optimized)
- **Email Service**: Resend API
- **Hosting**: Azure Static Web Apps
- **CI/CD**: GitHub Actions

### Development Features

- **Hot Reloading**: Instant updates during development
- **TypeScript**: Full type safety with strict mode enabled
- **ESLint**: Code quality enforcement with auto-fixing
- **Component Architecture**: Modular, reusable React components
- **Responsive Hooks**: Custom hooks for breakpoint detection

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

## Development

### Local Development

Start the development server:

```bash
# Install dependencies
npm install

# Start development server (recommended)
npm run dev:http

# Alternative: Standard Next.js dev server
npm run dev:next
```

The site will be available at `http://localhost:3000`.

### Development Scripts

```bash
npm run dev:http     # HTTP development server (recommended)
npm run dev          # HTTPS development server  
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint checking
npm run lint:fix     # Auto-fix ESLint issues
npm run type-check   # TypeScript validation
```

### Environment Setup

For local email testing, create `.env.local`:

```bash
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=hello@bridgingtrust.ai
EMAIL_TO=sales@bridgingtrust.ai
EMAIL_ADMIN=admin@bridgingtrust.ai
RESEND_TEST_MODE=true
```

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

## Email System

The website features a fully functional contact form with email integration using Resend API.

### Features

- **Dual Email Delivery**: Sends confirmation email to user and notification to admin
- **Rate Limiting**: 5 submissions per hour per IP address
- **Bot Protection**: Honeypot field to prevent automated spam
- **Circuit Breaker**: Automatic failover for service reliability
- **Professional Templates**: HTML email templates with company branding

### Environment Variables

The following environment variables must be configured in Azure Static Web Apps:

```bash
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=hello@bridgingtrust.ai
EMAIL_TO=sales@bridgingtrust.ai
EMAIL_ADMIN=admin@bridgingtrust.ai
RESEND_TEST_MODE=false
```

### Testing

Test the email system locally or in production:

```bash
curl -X POST https://bridgingtrust.ai/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "company": "Test Company",
    "message": "Test message",
    "_gotcha": ""
  }'
```

For more details, see [Email Setup Documentation](docs/email-setup.md).

## Site Structure

The website is a single-page application with five main sections:

1. **Hero Section**: Main headline and call-to-action
2. **Leveling Section**: "Empowering Ambitious Businesses" content
3. **Solutions Section**: Service offerings (AI Leadership Accelerator, Governance & Compliance)
4. **About Section**: Company story, mission, and founder profiles
5. **Contact Section**: Working contact form with email integration

### Responsive Design

- **Mobile-First**: Optimized layouts for all device sizes
- **Breakpoint**: 768px for mobile/desktop transition
- **Touch-Friendly**: Proper spacing and touch targets on mobile
- **Performance**: Lazy loading and optimized images

## Security

- **Environment Variables**: All secrets stored securely, never in code
- **Rate Limiting**: API endpoints protected against abuse
- **Input Validation**: Comprehensive form validation with Zod schemas
- **CSRF Protection**: Honeypot fields and proper request validation
- **Security Headers**: Configured via `staticwebapp.config.json`
