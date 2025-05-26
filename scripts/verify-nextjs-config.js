#!/usr/bin/env node

/**
 * Next.js Configuration Validator for Static Exports
 * 
 * This script verifies that the Next.js configuration file contains
 * all required settings for proper static exports, especially for
 * Azure Static Web Apps deployments.
 * 
 * It helps avoid common issues by ensuring:
 * 1. Static output is properly configured
 * 2. Image optimization settings are compatible with static exports
 * 3. ESM module formats are properly handled
 * 
 * Usage:
 *   node scripts/verify-nextjs-config.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the Next.js config file
const NEXT_CONFIG_PATH = path.join(process.cwd(), 'next.config.js');

// ANSI color codes for console output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Required configuration settings for static exports
const REQUIRED_CONFIG = {
  output: 'export',
  images: {
    unoptimized: true
  }
};

/**
 * Main function to verify Next.js configuration
 */
async function verifyNextConfig() {
  console.log(`${COLORS.blue}Verifying Next.js configuration for static exports...${COLORS.reset}`);
  
  // Check if next.config.js exists
  if (!fs.existsSync(NEXT_CONFIG_PATH)) {
    console.error(`${COLORS.red}❌ ERROR: next.config.js not found!${COLORS.reset}`);
    process.exit(1);
  }
  
  try {
    // Read the file content
    const configContent = fs.readFileSync(NEXT_CONFIG_PATH, 'utf8');
    
    // Check for output: 'export'
    if (!configContent.includes('output:') || !configContent.includes("'export'") && !configContent.includes('"export"')) {
      console.error(`${COLORS.red}❌ ERROR: Missing 'output: "export"' in next.config.js${COLORS.reset}`);
      console.log(`${COLORS.yellow}Please add the following to next.config.js:${COLORS.reset}
      output: 'export',`);
      process.exit(1);
    }
    
    // Check for unoptimized images setting
    if (!configContent.includes('images:') || !configContent.includes('unoptimized:') || !configContent.includes('unoptimized: true')) {
      console.warn(`${COLORS.yellow}⚠️ WARNING: Images may not be properly configured for static export${COLORS.reset}`);
      console.log(`${COLORS.yellow}Consider adding:${COLORS.reset}
      images: {
        unoptimized: true,
      },`);
    }
    
    // Check for module.exports vs export default
    if (configContent.includes('module.exports') && configContent.includes('type": "module"')) {
      console.warn(`${COLORS.yellow}⚠️ WARNING: Using CommonJS exports with ES modules${COLORS.reset}`);
      console.log(`${COLORS.yellow}Consider changing to:${COLORS.reset}
      export default nextConfig;`);
    }
    
    console.log(`${COLORS.green}✅ Next.js configuration verified for static exports${COLORS.reset}`);
    return true;
  } catch (error) {
    console.error(`${COLORS.red}❌ ERROR reading next.config.js: ${error.message}${COLORS.reset}`);
    process.exit(1);
  }
}

// Execute the verification
verifyNextConfig().catch(error => {
  console.error(`${COLORS.red}Unexpected error:${COLORS.reset}`, error);
  process.exit(1);
}); 