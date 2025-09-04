# Bridging Trust AI - CI/CD Workflow Documentation

This document provides an overview of the GitHub Actions workflow configurations used for the Bridging Trust AI project.

## Active Workflows

### 1. **Cost-Optimized CI** (`.github/workflows/cost-optimized-ci.yml`)

   - **Primary deployment workflow** for Azure Static Web Apps
   - **Cost-conscious strategy**: Minimal GitHub Actions usage, comprehensive local testing
   - Runs on push to `main` and pull requests
   - **Three-phase approach**:
     - Minimal validation (dependency checks, quick build)
     - Azure deployment (with cache-busting timestamps)
     - Cost monitoring and cleanup
   - **Timeout limits**: 10min validation, 15min deployment to control costs
   - **Concurrent run limits** to prevent resource waste

### 2. **Dependabot Security** (`.github/workflows/dependabot-security.yml`)

   - Automated security review for dependency updates
   - Runs security audits and tests on Dependabot PRs
   - Auto-approval comments for passed security checks
   - Weekly npm updates, monthly GitHub Actions updates

### 3. **Repository Backup** (`.github/workflows/backup-repository-fixed.yml`)

   - Creates backups of the codebase
   - Supports manual triggering
   - Fixed version addressing previous backup issues

## Disabled/Legacy Workflows

The following workflows are disabled (`.disabled` extension) but preserved for reference:
- `azure-static-web-apps-bridgingtrust-website.yml` - Original Azure deployment
- `ci-pipeline.yml` - Legacy CI pipeline
- `deploy.yml` - Old deployment workflow
- `hybrid-tests.yml` - Complex testing setup
- `visual-regression.yml` - Visual testing
- `dependency-checks.yml` - Standalone dependency checks

## Local CI/CD Strategy

The project follows a **"Local-First, Cloud-Minimal"** approach to minimize GitHub Actions costs:

### Local Testing Scripts

1. **Pre-Commit Validation** (`scripts/pre-commit-validation.sh`)
   - Comprehensive 7-phase testing: dependencies, code quality, functionality, build, Docker, security, performance
   - **Mandatory tests**: Core functionality, build validation
   - **Optional tests**: Docker, security, performance (can be skipped with `--quick` flag)

2. **Local CI Simulation** (`scripts/local-ci-test.sh`)
   - Simulates full CI/CD process locally
   - Environment setup, clean builds, static site generation
   - Security report generation

3. **Pre-Push Validation** (`scripts/validate-before-push.sh`)
   - Wrapper for comprehensive validation before pushing
   - Explains cost-conscious strategy to developers

### GitHub Actions Configuration

**Current Standards:**
- **Node.js Version**: 20.19.1 (LTS)
- **Action Versions**: Updated to v4 (checkout@v4, setup-node@v4)
- **Caching Strategy**: NPM caching enabled with `cache-dependency-path`
- **Build Cache Busting**: `BUILD_TIMESTAMP` environment variable for deployments

## Testing Strategy

**Current Testing Framework:**
- **Unit Tests**: Vitest for components and API routes
- **Integration Tests**: Vitest with custom configurations
- **E2E Tests**: Playwright for end-to-end scenarios
- **Security Tests**: Custom middleware and configuration validation
- **Performance Tests**: Lighthouse and custom performance metrics

**Test Categories:**
1. **Component Tests**: React component rendering and interaction
2. **API Tests**: Route handlers and middleware validation
3. **Integration Tests**: Cross-component functionality
4. **Security Tests**: Middleware, CSRF, rate limiting
5. **Performance Tests**: Bundle size, loading times, Core Web Vitals

## Deployment Process

**Current Deployment Flow:**

1. **Local Validation Phase**
   - Developer runs `scripts/pre-commit-validation.sh` locally
   - Comprehensive testing catches issues before push
   - Saves GitHub Actions costs by preventing failed deployments

2. **GitHub Actions Phase**
   - **Minimal Validation**: Quick dependency and build checks
   - **Azure Deployment**: Build with cache-busting and deploy to Azure Static Web Apps
   - **Cost Monitoring**: Track usage and optimization metrics

3. **Azure Static Web Apps**
   - **Production URL**: https://bridgingtrust.ai
   - **API Routes**: Serverless functions for contact form and status endpoints
   - **CDN Caching**: Optimized cache headers for performance
   - **Environment Variables**: Resend API keys and email configuration

4. **PR Environments**
   - Pull requests get staging environments automatically
   - Environments cleaned up when PRs are closed

## Troubleshooting

**Common Issues:**

1. **Test Failures**
   - Run `npm run test:ci-basic` locally to reproduce
   - Use `scripts/pre-commit-validation.sh --quick` for faster validation
   - Check component mocking in test files

2. **Build Issues**
   - Clear Next.js cache: `rm -rf .next`
   - Verify TypeScript compilation: `npm run type-check`
   - Check for import/export issues: `npm run fix:imports`

3. **Deployment Issues**
   - Verify Azure Static Web Apps token is valid
   - Check environment variables in Azure portal
   - Monitor deployment logs in GitHub Actions

4. **Performance Issues**
   - Run `npm run test:performance:all` locally
   - Check bundle size with `npm run analyze`
   - Verify image optimization settings

## Required Secrets

**GitHub Repository Secrets:**
- `AZURE_STATIC_WEB_APPS_API_TOKEN_BRIDGINGTRUST_WEBSITE` - Azure deployment token

**Azure Static Web Apps Environment Variables:**
- `RESEND_API_KEY` - Email service API key
- `EMAIL_FROM` - Sender email address  
- `EMAIL_TO` - Recipient email address
- `EMAIL_ADMIN` - Admin email address
- `RESEND_TEST_MODE` - Set to "false" for production

## Local Development

**Development Workflow:**

```bash
# Comprehensive local validation (recommended before any commit)
./scripts/pre-commit-validation.sh

# Quick validation (skip optional tests)
./scripts/pre-commit-validation.sh --quick

# Simulate full CI/CD process
./scripts/local-ci-test.sh

# Run specific test suites
npm run test:ci-basic          # Core functionality tests
npm run test:middleware        # Security tests
npm run test:performance:all   # Performance validation
```

**Local Environment Setup:**
```bash
# Install dependencies
npm ci

# Start development server
npm run dev:http

# Build for production
npm run build
```

## Maintenance

**Monthly Tasks:**
- Review GitHub Actions for deprecation notices
- Update Node.js and npm dependencies with `npm run ncu`
- Monitor cost optimization metrics in workflow logs

**Quarterly Tasks:**
- Security audit of workflow permissions
- Rotation of Azure Static Web Apps tokens
- Review and update local testing scripts
- Validate email system and environment variables
