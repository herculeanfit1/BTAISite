#!/bin/bash

# =============================================================================
# Build Quality Gate - Bridging Trust AI
# =============================================================================
# Validates that the application builds successfully
# Complies with cursor rules: Quality First, Performance budgets
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
if [ ! -f "package.json" ] || [ ! -f "next.config.js" ]; then
    log_error "Please run this script from the BTAISite root directory"
    exit 1
fi

log_info "Starting build validation..."

# Clean previous builds
log_info "Cleaning previous builds..."
rm -rf .next out

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    log_info "Installing dependencies..."
    npm ci --silent
fi

# Run build
log_info "Building application..."
if npm run build; then
    log_success "Build completed successfully"
else
    log_error "Build failed"
    exit 1
fi

# Verify build output
if [ ! -d ".next" ]; then
    log_error "Build output directory (.next) not found"
    exit 1
fi

log_success "Build validation passed"
