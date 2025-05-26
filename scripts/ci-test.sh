#!/bin/bash

# CI Test Script
# This script handles server startup, test running, and cleanup

# Print each command for debugging
set -x

# Stop execution on error
set -e

# Kill any existing process on test ports (3000-3002)
echo "Cleaning up any existing processes..."
lsof -t -i:3000 | xargs kill -9 2>/dev/null || true
lsof -t -i:3001 | xargs kill -9 2>/dev/null || true
lsof -t -i:3002 | xargs kill -9 2>/dev/null || true

# Ensure the security middleware is properly configured
echo "Setting up security middleware..."
node scripts/setup-security.js

# Start the development server in the background
echo "Starting development server..."
npm run dev &
SERVER_PID=$!

# Function to clean up server process on exit
function cleanup {
  echo "Cleaning up processes..."
  if [ -n "$SERVER_PID" ]; then
    kill $SERVER_PID 2>/dev/null || true
  fi
  lsof -t -i:3000 | xargs kill -9 2>/dev/null || true
  lsof -t -i:3001 | xargs kill -9 2>/dev/null || true
  lsof -t -i:3002 | xargs kill -9 2>/dev/null || true
}

# Set the cleanup function to run on script exit
trap cleanup EXIT

# Wait for server to start properly
echo "Waiting for server to initialize..."
sleep 15

# Run the tests
echo "Running tests..."
npx playwright test src/uitests/contact-basic.spec.ts src/uitests/security.spec.ts --project=chromium

# Return the exit code from the test run
exit $? 