#!/bin/bash

# =============================================================================
# Pre-Push Validation Wrapper - Bridging Trust AI
# =============================================================================
# Wrapper script that calls the new quality gate system before pushing
# Replaces the old pre-commit-validation.sh approach
# =============================================================================

set -e  # Exit on any error (fail-fast)

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

log_header() {
    echo -e "\n${BLUE}================================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}================================================${NC}\n"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "ci/g_master.sh" ]; then
    log_error "Please run this script from the BTAISite root directory"
    exit 1
fi

log_header "PRE-PUSH VALIDATION - BRIDGING TRUST AI"

log_info "Running quality gates before push..."
log_info "This ensures code quality and prevents broken deployments"

# Run the master quality gate with verbose output
if ./ci/g_master.sh --verbose; then
    log_success "All quality gates passed!"
    log_success "Code is ready for push to GitHub"
    log_info "You can now safely run: git push"
else
    log_error "Quality gates failed!"
    log_error "Fix the issues above before pushing"
    log_info "Run './ci/g_master.sh --verbose' for detailed output"
    exit 1
fi
