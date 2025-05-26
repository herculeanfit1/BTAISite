/**
 * Middleware Static Export Helper
 * 
 * This script manages middleware compatibility with Next.js static exports.
 * It handles backing up the middleware file before build and restoring it after.
 * 
 * Usage:
 *   node scripts/middleware-static-export-helper.js --prepare   # Run before build
 *   node scripts/middleware-static-export-helper.js --cleanup   # Run after build
 */

const fs = require('fs');
const path = require('path');

// Configuration
const MIDDLEWARE_FILE = path.join(process.cwd(), 'middleware.ts');
const MIDDLEWARE_BACKUP = path.join(process.cwd(), 'middleware.ts.bak-static-export');

// Simplified middleware content that's compatible with static exports
const SIMPLIFIED_MIDDLEWARE = `/**
 * Simplified middleware for static export compatibility
 * 
 * This file replaces the original middleware during the build process.
 * The static export will ignore this file, but we need it to be valid
 * TypeScript to avoid build errors.
 */
export function middleware() {
  // This is intentionally empty - it won't be used in the static export
}

// Empty config to avoid matching any routes
export const config = {
  matcher: []
};
`;

/**
 * Backs up the middleware file and replaces it with a simplified version
 * that's compatible with static exports
 */
function prepareMiddleware() {
  try {
    // Check if middleware file exists
    if (fs.existsSync(MIDDLEWARE_FILE)) {
      console.log('⚠️ Found middleware.ts - static exports don\'t support middleware');
      console.log('Creating a backup and replacing with a simplified version');

      // Backup the original middleware
      fs.copyFileSync(MIDDLEWARE_FILE, MIDDLEWARE_BACKUP);
      
      // Replace with simplified version
      fs.writeFileSync(MIDDLEWARE_FILE, SIMPLIFIED_MIDDLEWARE);
      
      console.log('✅ Created simplified middleware for build');
      return true;
    } else {
      console.log('ℹ️ No middleware.ts found - no action needed');
      return false;
    }
  } catch (error) {
    console.error('❌ Error preparing middleware:', error);
    return false;
  }
}

/**
 * Restores the original middleware file from backup
 */
function restoreMiddleware() {
  try {
    // Check if backup file exists
    if (fs.existsSync(MIDDLEWARE_BACKUP)) {
      console.log('Restoring original middleware.ts from backup');
      
      // Restore from backup
      fs.copyFileSync(MIDDLEWARE_BACKUP, MIDDLEWARE_FILE);
      
      // Remove backup
      fs.unlinkSync(MIDDLEWARE_BACKUP);
      
      console.log('✅ Restored original middleware');
      return true;
    } else {
      console.log('ℹ️ No middleware backup found - no restoration needed');
      return false;
    }
  } catch (error) {
    console.error('❌ Error restoring middleware:', error);
    return false;
  }
}

/**
 * Main function to run the appropriate actions based on command line arguments
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--prepare')) {
    console.log('🔧 Preparing middleware for static export build...');
    prepareMiddleware();
  } else if (args.includes('--cleanup')) {
    console.log('🧹 Cleaning up middleware after static export build...');
    restoreMiddleware();
  } else {
    console.log('Please specify either --prepare or --cleanup');
    console.log('Example: node scripts/middleware-static-export-helper.js --prepare');
  }
}

// Run the main function
main(); 