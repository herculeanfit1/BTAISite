#!/usr/bin/env node

/**
 * This script fixes the platform-specific modules issue for lightningcss in Docker containers.
 * It installs the correct lightningcss binary for the current platform.
 */

import { execSync } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Fixing lightningcss platform-specific modules for Docker...');

// Determine the current platform
const platform = os.platform();
const arch = os.arch();
const isMusl = false; // Docker containers are typically glibc-based

try {
  if (platform === 'linux') {
    // For Linux in Docker (typically glibc-based)
    if (arch === 'x64') {
      console.log('Installing lightningcss modules for Linux x64...');
      execSync('npm i -D lightningcss@^1.23.0', { stdio: 'inherit' });
    } else if (arch === 'arm64') {
      console.log('Installing lightningcss modules for Linux arm64...');
      execSync('npm i -D lightningcss@^1.23.0', { stdio: 'inherit' });
      
      // Check if we need to create symlinks for missing binaries
      const projectRoot = path.resolve(process.cwd());
      const nodeModulesPath = path.join(projectRoot, 'node_modules', 'lightningcss', 'node');
      const gnuPath = path.join(nodeModulesPath, 'lightningcss.linux-arm64-gnu.node');
      const muslPath = path.join(nodeModulesPath, 'lightningcss.linux-arm64-musl.node');
      
      if (!fs.existsSync(gnuPath) && fs.existsSync(muslPath)) {
        console.log('Creating symlink for missing gnu binary...');
        fs.copyFileSync(muslPath, gnuPath);
      } else if (!fs.existsSync(muslPath) && fs.existsSync(gnuPath)) {
        console.log('Creating symlink for missing musl binary...');
        fs.copyFileSync(gnuPath, muslPath);
      }
    } else {
      throw new Error(`Unsupported architecture: ${arch}`);
    }
  } else {
    console.log(`Platform ${platform} (${arch}) detected. No fixes needed.`);
  }

  console.log('✅ lightningcss platform-specific modules fixed successfully!');
} catch (error) {
  console.error(`❌ Error fixing lightningcss modules: ${error.message}`);
  process.exit(1);
} 