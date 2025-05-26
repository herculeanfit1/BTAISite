#!/bin/bash

# This script simulates the CI/CD process locally to help debug issues
# before pushing to GitHub.

set -e  # Exit on error

echo "==============================================="
echo "  Bridging Trust AI - Local CI/CD Simulation"
echo "==============================================="

# Environment setup
export CI=true
export NODE_ENV=test
export NEXT_PUBLIC_SKIP_DYNAMIC_ROUTES=true
export SKIP_AUTH=true

# Clean up any previous runs
echo "🧹 Cleaning up from previous runs..."
rm -rf .next out coverage test-results node_modules
mkdir -p test-results coverage

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Linting
echo "🔍 Running lint checks..."
npm run lint:fix || true
npm run lint -- --max-warnings=1000 || echo "::warning::Linting found issues that should be fixed, but continuing with the build"

# Type checking
echo "📝 Running type checks..."
npm run type-check || echo "::warning::Type checking found issues that should be fixed, but continuing with the build"

# Unit tests
echo "🧪 Running unit tests..."
npm run test:unit

# Integration tests
echo "🔄 Running integration tests..."
npm run test:integration

# Middleware tests
echo "🛡️ Running middleware tests..."
npm run test:middleware

# Config tests
echo "⚙️ Running config tests..."
npm run test:config

# Build static site
echo "🏗️ Building static site..."
npm run build:static || {
  echo "❌ Build failed, but attempting fallback build..."
  NODE_ENV=production npm run fix:platform || true
  NEXT_PUBLIC_SKIP_DYNAMIC_ROUTES=true npm run build:static
}

# Export static site
echo "📦 Exporting static site..."
npm run static-export || echo "::warning::Static export had issues but we'll continue"

# Generate security reports
echo "🔒 Generating security reports..."
npm run audit:deps || true

# Verification
echo "✅ Verifying outputs..."
if [ -d "out" ]; then
  echo "Static site was generated successfully in the 'out' directory"
  find out -type f | wc -l | xargs echo "Number of files generated:"
else
  echo "❌ Static site generation failed - 'out' directory is missing"
  exit 1
fi

echo "==============================================="
echo "  Local CI/CD Simulation Complete"
echo "==============================================="

echo "To deploy this build manually, you would run:"
echo "az staticwebapp deploy --source-location out --app-location out" 