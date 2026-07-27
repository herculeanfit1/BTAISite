# Technology Stack

## Core Technologies

- **Frontend Framework**: [Next.js](https://nextjs.org/) v15.3.1 (App Router)
- **UI Library**: [React](https://reactjs.org/) v19.0.0
- **CSS Framework**: [Tailwind CSS](https://tailwindcss.com/) v4.1.5
- **TypeScript**: v5.4.5
- **Deployment**: Azure Static Web Apps

## Development Tools

- **Build System**: Next.js built-in
- **Package Manager**: npm
- **Linting**: ESLint with Next.js config
- **Testing**:
  - Jest for unit tests
  - Playwright for e2e tests
  - Testing Library for component tests

## Key Dependencies

- **State Management**: React's built-in hooks
- **Form Validation**: Zod
- **Internationalization**: next-intl
- **Theming**: next-themes (dark/light mode)
- **Component Libraries**: None (custom components)

## Architecture Overview

The application follows the Next.js App Router architecture with a focus on:

- Server Components by default
- Client Components for interactive elements
- Static Site Generation for most pages
- API routes with static export compatibility

## Styling Approach

- Tailwind CSS v4 for utility-first styling
- Custom design tokens via Tailwind theme
- Responsive design with mobile-first approach
- Dark mode support via CSS variables

## Build & Deployment

- GitHub Actions for CI/CD
- Azure Static Web Apps for hosting
- Static export generation

## Security Features

- API rate limiting
- Input validation with Zod
- Security headers via middleware
- Bot detection with honeypot fields
- CSRF protection
- XSS prevention

## Performance Optimizations

- Next.js Image optimization
- Component code splitting
- Static generation where possible
- ISR for dynamic content
- Font optimization
- Core Web Vitals focus

## SEO Approach

- Server-side metadata
- Structured data (Schema.org)
- Semantic HTML
- Sitemap generation
- Meta tags optimization
