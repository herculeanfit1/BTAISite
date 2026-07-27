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

# Run security header tests (mandatory)
log_info "Running security header tests..."
if npm run test:security-headers; then
    log_success "Security header tests passed"
else
    log_error "Security header tests failed"
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

# Coverage. The thresholds in vitest.config.js are the gate — they are set to the
# measured baseline, so a drop fails here rather than being waved through.
# The former ci/coverage-ratchet.js was deleted (PLAN-005): its CI floors were 0 and it
# exited green whenever coverage data was missing, which was the permanent state.
log_info "Checking test coverage against configured thresholds..."
if npm run test:coverage; then
    log_success "Tests passed and coverage thresholds met"
else
    log_error "Coverage below the thresholds in vitest.config.js"
    log_info "Add tests to raise it — do not lower the thresholds to make this pass"
    exit 1
fi

log_success "Test validation passed - all critical tests passing"
