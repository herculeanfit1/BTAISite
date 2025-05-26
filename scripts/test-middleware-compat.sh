#!/bin/bash

# test-middleware-compat.sh
#
# Script to verify middleware compatibility with static exports.
# This script tests the same steps that the GitHub Actions workflow executes,
# allowing developers to verify compatibility locally before pushing changes.
#
# Usage: ./scripts/test-middleware-compat.sh [--clean] [--verbose]
#
# Options:
#   --clean    Clean build artifacts before testing
#   --verbose  Show more detailed output during testing

set -e

# Terminal colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
CLEAN=false
VERBOSE=false

for arg in "$@"; do
  case $arg in
    --clean)
      CLEAN=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    *)
      # Unknown option
      ;;
  esac
done

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}= Middleware & Static Export Test Runner =${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Function to log messages
log() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

# Function to log warnings
warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

# Function to log errors
error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check for required dependencies
log "Checking dependencies..."
if ! command_exists node; then
  error "Node.js is required but not installed. Please install Node.js 20 or later."
  exit 1
fi

if ! command_exists npm; then
  error "npm is required but not installed. Please install npm."
  exit 1
fi

# Clean build artifacts if requested
if [ "$CLEAN" = true ]; then
  log "Cleaning build artifacts..."
  if [ -d "out" ]; then
    rm -rf out
    log "Removed 'out' directory"
  fi
  if [ -d ".next" ]; then
    rm -rf .next
    log "Removed '.next' directory"
  fi
  if [ -d "coverage" ]; then
    rm -rf coverage
    log "Removed 'coverage' directory"
  fi
fi

# Check for middleware.ts file
log "Checking middleware.ts..."
if [ ! -f "middleware.ts" ]; then
  error "middleware.ts file not found. This test requires a middleware.ts file to be present."
  exit 1
fi

# Optional: Display middleware content
if [ "$VERBOSE" = true ]; then
  echo ""
  echo -e "${BLUE}===== middleware.ts content =====${NC}"
  cat middleware.ts
  echo -e "${BLUE}=================================${NC}"
  echo ""
fi

# Check for static export config in next.config.js
log "Checking Next.js configuration..."
if [ ! -f "next.config.js" ]; then
  error "next.config.js file not found. This test requires a next.config.js file to be present."
  exit 1
fi

if ! grep -q "output.*export" next.config.js; then
  warn "Static export ('output: \"export\"') not found in next.config.js. This may cause issues with middleware compatibility."
fi

# Run middleware tests
log "Running middleware tests..."
npm run test:middleware

# Generate test coverage
log "Generating middleware test coverage..."
npm run test:middleware:coverage || {
  warn "Failed to generate test coverage, continuing anyway..."
}

# Build the project with static export
log "Building project with static export..."
if [ "$VERBOSE" = true ]; then
  NEXT_PUBLIC_SKIP_DYNAMIC_ROUTES=true npm run build
else
  NEXT_PUBLIC_SKIP_DYNAMIC_ROUTES=true npm run build > /dev/null
fi

# Run static export helper
log "Running static export helper..."
npm run static-export

# Verify static export structure
log "Verifying static export structure..."
if [ ! -d "out" ]; then
  error "Static export directory 'out' is missing"
  exit 1
fi

if [ ! -f "out/staticwebapp.config.json" ]; then
  error "staticwebapp.config.json was not copied to the output directory"
  exit 1
fi

if [ ! -f "out/index.html" ]; then
  error "index.html is missing from the output directory"
  exit 1
fi

if [ ! -d "out/_next" ]; then
  error "_next directory is missing from the output"
  exit 1
fi

# Check if tests pass and build succeeds
if [ -d "out" ] && [ -f "out/staticwebapp.config.json" ] && [ -f "out/index.html" ]; then
  echo ""
  echo -e "${GREEN}=========================================${NC}"
  echo -e "${GREEN}= All tests passed! ✅                  =${NC}"
  echo -e "${GREEN}= Middleware is compatible with static  =${NC}"
  echo -e "${GREEN}= exports and security headers are      =${NC}" 
  echo -e "${GREEN}= properly configured.                  =${NC}"
  echo -e "${GREEN}=========================================${NC}"
  echo ""
  log "Test coverage available in: ./coverage/index.html"
  log "Static export available in: ./out/"
else
  echo ""
  echo -e "${RED}=========================================${NC}"
  echo -e "${RED}= Some tests failed! ❌                 =${NC}"
  echo -e "${RED}= See above for details.                =${NC}"
  echo -e "${RED}=========================================${NC}"
  exit 1
fi 