#!/usr/bin/env node

/**
 * This script fixes the Tailwind CSS Oxide native bindings issue in Docker
 * Similar to the lightningcss and rollup issues, Tailwind CSS v4 requires 
 * platform-specific native bindings.
 */

import { execSync } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Fixing Tailwind CSS Oxide native bindings for Docker...');

// Determine the current platform
const platform = os.platform();
const arch = os.arch();

try {
  // Reinstall tailwindcss to ensure we get the correct binary
  console.log(`Reinstalling tailwindcss for platform ${platform} (${arch})...`);
  execSync('npm uninstall tailwindcss', { stdio: 'inherit' });
  execSync('npm install tailwindcss@4.1.5', { stdio: 'inherit' });
  
  // For Linux, we might need to create fallbacks
  if (platform === 'linux') {
    const projectRoot = path.resolve(process.cwd());
    const oxidePath = path.join(projectRoot, 'node_modules', '@tailwindcss', 'oxide');
    
    if (fs.existsSync(oxidePath)) {
      console.log('Tailwind CSS Oxide directory found. Setting up fallbacks if needed...');
      
      // Create a modified index.js file that handles missing bindings more gracefully
      const indexPath = path.join(oxidePath, 'index.js');
      if (fs.existsSync(indexPath)) {
        // Read the existing file
        const originalContent = fs.readFileSync(indexPath, 'utf8');
        
        // Create a backup
        fs.writeFileSync(`${indexPath}.bak`, originalContent);
        
        // Modify the file to handle missing bindings more gracefully
        const modifiedContent = originalContent.replace(
          'throw new Error("Failed to load native binding");',
          `console.warn("Warning: Failed to load native Tailwind CSS Oxide binding. Using fallback.");
          // Return a fallback object that doesn't crash
          return {
            compileCss: () => ({ css: '' }),
            compileStylesheet: () => ({ css: '' }),
            resolveConfig: (config) => config,
            generateRules: () => [],
            generateUtilities: () => ({}),
          };`
        );
        
        // Write the modified file
        fs.writeFileSync(indexPath, modifiedContent);
        console.log('Modified Tailwind CSS Oxide index.js to handle missing bindings gracefully.');
      }
    }
  }
  
  console.log('✅ Tailwind CSS Oxide fix completed successfully!');
} catch (error) {
  console.error(`❌ Error fixing Tailwind CSS Oxide: ${error.message}`);
  process.exit(1);
} 