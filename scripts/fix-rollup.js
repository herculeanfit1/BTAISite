#!/usr/bin/env node

/**
 * Fixes Rollup platform-specific module issues
 * 
 * This script installs the correct platform-specific Rollup modules
 * based on the current operating system, addressing the npm bug related
 * to optional dependencies (https://github.com/npm/cli/issues/4828).
 */

import { execSync } from 'child_process';
import os from 'os';

console.log('🔧 Checking for Rollup platform-specific modules...');

const platform = os.platform();
const arch = os.arch();

// Only install Linux-specific modules when running on Linux
if (platform === 'linux') {
  try {
    console.log(`Installing Rollup modules for Linux ${arch}...`);
    
    if (arch === 'x64') {
      // Install both variants to be safe
      execSync('npm i -D @rollup/rollup-linux-x64-gnu @rollup/rollup-linux-x64-musl', { 
        stdio: 'inherit' 
      });
      console.log('✅ Successfully installed Linux x64 Rollup modules');
    } else if (arch === 'arm64') {
      execSync('npm i -D @rollup/rollup-linux-arm64-gnu @rollup/rollup-linux-arm64-musl', { 
        stdio: 'inherit' 
      });
      console.log('✅ Successfully installed Linux arm64 Rollup modules');
    } else {
      console.log(`⚠️ Unsupported architecture: ${arch}. Skipping Rollup module installation.`);
    }
  } catch (error) {
    console.error('❌ Error installing Rollup modules:', error.message);
    // Exit with 0 to not break the build, as this is a best-effort fix
    process.exit(0);
  }
} else {
  console.log(`📋 Running on ${platform} ${arch}. No need to install Linux-specific Rollup modules.`);
}

console.log('✅ Rollup module check completed'); 