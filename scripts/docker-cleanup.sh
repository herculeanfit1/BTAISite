#!/bin/sh
# Docker cleanup script for Next.js application
# This script runs when the container is stopped to clean up resources

# Print status message
echo "Running container cleanup tasks..."

# Kill any lingering Node processes
echo "Stopping Node processes..."
pkill -f "node" || true

# Clean up temp files
echo "Cleaning temporary files..."
rm -rf /app/.next/cache/images/* || true
rm -rf /app/.next/cache/fetch-cache/* || true
rm -rf /tmp/* || true

# Clean npm cache if exists in the container
if [ -d ~/.npm ]; then
  echo "Cleaning npm cache..."
  npm cache clean --force || true
fi

# Remove test artifacts if they exist
echo "Removing test artifacts..."
rm -rf /app/test-results/* || true
rm -rf /app/playwright-report/* || true

# Log completion
echo "Cleanup completed successfully!"

# Exit with success
exit 0 