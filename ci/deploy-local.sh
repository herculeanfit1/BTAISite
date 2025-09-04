#!/bin/bash

set -Eeuo pipefail  # Enhanced error handling
IFS=$'\n\t'         # Secure IFS
trap 'echo "❌ Deploy local failed at line $LINENO"' ERR

# =================================================================
# Local Build & Deploy Script for Bridging Trust AI
# =================================================================
# This script runs the complete CI/CD process locally to save costs
# and bypass GitHub Actions native dependency issues.

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "=============================================="
echo "🚀 Bridging Trust AI - Local Deploy Pipeline"
echo "=============================================="

# Step 1: Clean previous builds
print_step "Cleaning previous builds..."
rm -rf .next out
rm -rf node_modules/.cache
print_success "Cleaned build directories"

# Step 2: Verify dependencies
print_step "Verifying dependencies..."
if [ ! -d "node_modules" ]; then
    print_warning "Installing dependencies..."
    npm ci
fi
print_success "Dependencies verified"

# Step 3: Run quality checks (optional, comment out to speed up)
print_step "Running quality checks..."
# Lint check (non-blocking)
npm run lint || print_warning "Linting issues found (non-blocking)"

# Type check (non-blocking)  
npx tsc --noEmit || print_warning "TypeScript issues found (non-blocking)"

print_success "Quality checks completed"

# Step 4: Build the application
print_step "Building Next.js application..."
export NEXT_PUBLIC_SKIP_DYNAMIC_ROUTES=true
npm run build:static
print_success "Build completed successfully"

# Step 5: Generate static export
print_step "Generating static export..."
npm run static-export
print_success "Static export generated"

# Step 6: Verify build output
print_step "Verifying build output..."
if [ ! -d "out" ] || [ ! -f "out/index.html" ]; then
    print_error "Build verification failed - out/index.html not found"
    exit 1
fi

# Check file sizes
OUT_SIZE=$(du -sh out | cut -f1)
print_success "Build verification passed - Output size: $OUT_SIZE"

# Step 7: Local testing (optional)
print_step "Starting local test server..."
print_warning "Test your site at: http://localhost:8080"
print_warning "Press Ctrl+C when ready to deploy..."

# Start a simple HTTP server for testing
cd out && python3 -m http.server 8080 &
SERVER_PID=$!

# Wait for user input
read -p "Press Enter when ready to deploy (or Ctrl+C to cancel)..."

# Stop test server
kill $SERVER_PID 2>/dev/null || true
cd ..

# Step 8: Commit and trigger deployment
print_step "Preparing deployment..."

# Add the out directory to git
git add out/
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    print_warning "No changes to deploy"
else
    # Commit with deploy trigger
    COMMIT_MSG="[deploy] Local build $(date '+%Y-%m-%d %H:%M:%S')"
    git commit -m "$COMMIT_MSG"
    
    print_step "Pushing to trigger deployment..."
    git push origin main
    
    print_success "Deployment triggered successfully!"
    print_warning "Monitor deployment at: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/' | sed 's/.git$//')/actions"
fi

echo "=============================================="
print_success "Local deployment pipeline completed!"
echo "==============================================" 