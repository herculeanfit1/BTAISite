#!/bin/bash

# =============================================================================
# TypeScript Quality Gate - Bridging Trust AI
# =============================================================================
# Validates TypeScript compilation without emitting files
# Complies with cursor rules: TypeScript strict, no any types
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

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "tsconfig.json" ]; then
    log_error "Please run this script from the BTAISite root directory"
    exit 1
fi

log_info "Starting TypeScript type checking..."

# Run TypeScript type check
if npm run type-check; then
    log_success "TypeScript compilation clean - no type errors"
else
    log_error "TypeScript type checking failed"
    exit 1
fi

log_success "TypeScript validation passed"
