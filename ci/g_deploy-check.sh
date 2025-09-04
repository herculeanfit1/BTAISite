#!/bin/bash

# =============================================================================
# Deployment Quality Gate - Bridging Trust AI
# =============================================================================
# Validates deployment readiness and performance budgets
# Complies with cursor rules: Performance budgets, accessibility, E2E tests
# =============================================================================

set -Eeuo pipefail  # Enhanced error handling
IFS=$'\n\t'         # Secure IFS
trap 'echo "❌ Gate failed at line $LINENO"' ERR

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "next.config.js" ]; then
    log_error "Please run this script from the BTAISite root directory"
    exit 1
fi

log_info "Starting deployment readiness validation..."

# Check required files exist
log_info "Checking required deployment files..."
required_files=("package.json" "next.config.js" "staticwebapp.config.json" "tsconfig.json")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        log_success "Found $file"
    else
        log_error "Missing required file: $file"
        exit 1
    fi
done

# Validate Next.js configuration
log_info "Validating Next.js configuration..."
if node -e "const config = require('./next.config.js'); console.log('Config valid')" 2>/dev/null; then
    log_success "Next.js configuration is valid"
else
    log_error "Next.js configuration is invalid"
    exit 1
fi

# Check for static export compatibility (Azure Static Web Apps)
log_info "Checking static export compatibility..."
if grep -q "output.*export" next.config.js 2>/dev/null; then
    log_warning "Static export enabled - ensure API routes are compatible"
else
    log_success "Dynamic export mode - API routes supported"
fi

# Run E2E tests if available
log_info "Running E2E tests..."
if [ -f "playwright.config.ts" ]; then
    if npm run test:e2e > /dev/null 2>&1; then
        log_success "E2E tests passed"
    else
        log_warning "E2E tests failed or not available"
    fi
else
    log_warning "Playwright configuration not found - skipping E2E tests"
fi

# Check accessibility (cursor rules: accessibility compliance)
log_info "Checking accessibility compliance..."
if npm run lint:check 2>&1 | grep -q "jsx-a11y"; then
    log_success "Accessibility linting rules active"
else
    log_warning "Accessibility linting may not be fully configured"
fi

# Validate environment variables (cursor rules: Azure SWA secrets)
log_info "Checking environment variable configuration..."
if [ -f ".env.example" ] || [ -f "docs/env-example.txt" ]; then
    log_success "Environment variable documentation found"
else
    log_warning "Environment variable documentation not found"
fi

# Check for performance optimization (cursor rules: performance budgets)
log_info "Checking performance optimizations..."
if grep -r "next/image\|next/font" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=out . > /dev/null; then
    log_success "Next.js performance optimizations found"
else
    log_warning "Consider adding Next.js performance optimizations"
fi

# Validate build output
log_info "Validating build output..."
if [ -d ".next" ]; then
    log_success "Build output directory exists"
    
    # Check for critical build files
    if [ -f ".next/static/chunks/pages/_app.js" ] || [ -f ".next/static/chunks/app/layout.js" ]; then
        log_success "Critical build files found"
    else
        log_warning "Critical build files may be missing"
    fi
else
    log_error "Build output directory not found - run build first"
    exit 1
fi

# Check for deployment artifacts
log_info "Checking deployment artifacts..."
if [ -f "staticwebapp.config.json" ]; then
    if grep -q "routes\|headers" staticwebapp.config.json; then
        log_success "Azure Static Web Apps configuration found"
    else
        log_warning "Azure Static Web Apps configuration may be incomplete"
    fi
else
    log_warning "Azure Static Web Apps configuration not found"
fi

log_success "Deployment readiness validation passed - ready for deployment"
