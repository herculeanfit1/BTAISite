#!/bin/bash

# This script runs all fixes in sequence and then tests the build
# to verify that all syntax errors have been resolved

echo "📋 Running all fix scripts in sequence..."

# Run platform-specific Docker module fixes
echo "🔧 Running Rollup Docker fix..."
node scripts/fix-rollup-docker.js

echo "🔧 Running LightningCSS Docker fix..."
node scripts/fix-lightningcss-docker.js 

echo "🔧 Running Tailwind Oxide fix..."
node scripts/fix-tailwind-oxide.js

# Run syntax error fixes
echo "🔧 Running prototype access fix..."
node scripts/fix-proto-access.js

# Run the remaining errors fix
echo "🔧 Running remaining errors fix..."
node scripts/fix-remaining-errors.js

# Test the build
echo "🧪 Testing build to verify fixes..."
npm run build

# If the build succeeds, run the export
if [ $? -eq 0 ]; then
  echo "✅ Build successful! All syntax errors have been fixed."
  echo "🔄 Running static export..."
  npm run export
  
  if [ $? -eq 0 ]; then
    echo "✅ Static export successful! The project is ready for deployment."
  else
    echo "❌ Static export failed. Please check the errors above."
    exit 1
  fi
else
  echo "❌ Build failed. Please check the errors above."
  exit 1
fi

echo "✨ All done! The project should now be ready for CI/CD." 