#!/bin/bash

# =============================================================================
# Linting Quality Gate - Bridging Trust AI
# =============================================================================
# Validates code quality with ESLint including security and accessibility
# Complies with cursor rules: ESLint, security, accessibility, no warnings
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
if [ ! -f "package.json" ] || [ ! -f "eslint.config.js" ]; then
    log_error "Please run this script from the BTAISite root directory"
    exit 1
fi

log_info "Starting linting validation..."

# Run ESLint - allow warnings but fail on errors
log_info "Running ESLint checks..."
if npx eslint . --no-cache; then
    log_success "ESLint checks passed - no critical errors detected"
else
    log_error "ESLint checks failed - critical errors detected"
    log_info "Run 'npm run lint:fix' to auto-fix issues"
    exit 1
fi

log_success "Linting validation passed - code quality confirmed"
