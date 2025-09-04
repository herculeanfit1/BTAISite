#!/bin/bash

# =============================================================================
# Testing Quality Gate - Bridging Trust AI
# =============================================================================
# Validates test execution and coverage requirements
# Complies with cursor rules: Coverage ratchet, no regression rule
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
if [ ! -f "package.json" ] || [ ! -f "vitest.config.js" ]; then
    log_error "Please run this script from the BTAISite root directory"
    exit 1
fi

log_info "Starting test validation..."

# Run core functionality tests (mandatory)
log_info "Running core functionality tests..."
if npm run test:ci-basic; then
    log_success "Core functionality tests passed"
else
    log_error "Core functionality tests failed"
    exit 1
fi

# Run middleware security tests (mandatory)
log_info "Running middleware security tests..."
if npm run test:middleware; then
    log_success "Middleware security tests passed"
else
    log_error "Middleware security tests failed"
    exit 1
fi

# Run configuration tests (mandatory)
log_info "Running configuration tests..."
if npm run test:config; then
    log_success "Configuration tests passed"
else
    log_error "Configuration tests failed"
    exit 1
fi

# Check test coverage with ratchet (cursor rules: coverage ratchet - CI ≥ 70%)
log_info "Checking test coverage with ratchet..."
if npm run test:coverage; then
    log_success "Tests passed with coverage"
    
    # Run coverage ratchet to prevent regressions
    log_info "Running coverage ratchet analysis..."
    if node ci/coverage-ratchet.js --verbose; then
        log_success "Coverage ratchet passed - no regressions detected"
    else
        log_error "Coverage ratchet failed - coverage regression detected"
        log_info "Either add tests to improve coverage or investigate the regression"
        exit 1
    fi
else
    log_error "Test coverage below threshold (70% required)"
    log_info "Add more tests to increase coverage"
    exit 1
fi

log_success "Test validation passed - all critical tests passing"
