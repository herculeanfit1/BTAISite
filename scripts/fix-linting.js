#!/usr/bin/env node

/**
 * ESLint automated fixes script for Bridging Trust AI
 * 
 * This script runs ESLint with the --fix flag to automatically fix
 * issues that can be auto-fixed, focusing on common problems like
 * unused variables, imports, and basic formatting.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.blue}🔧 Bridging Trust AI - ESLint Automated Fixes${colors.reset}\n`);

// Create a log directory if it doesn't exist
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, `eslint-fixes-${new Date().toISOString().replace(/:/g, '-')}.log`);

// Helper function to run a command and handle errors
function runCommand(command, description) {
  console.log(`${colors.yellow}⏳ ${description}...${colors.reset}`);
  
  try {
    const output = execSync(command, { encoding: 'utf8', maxBuffer: 5 * 1024 * 1024 }); // Increase buffer size
    console.log(`${colors.green}✓ Success${colors.reset}`);
    fs.appendFileSync(logFile, `\n\n--- ${description} ---\n${output}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
    
    if (error.stdout) {
      fs.appendFileSync(logFile, `\n\n--- ${description} (ERROR) ---\n${error.stdout}`);
    }
    
    if (error.stderr) {
      fs.appendFileSync(logFile, `\n${error.stderr}`);
    }
    
    return false;
  }
}

// Helper function to get directories to process
function getDirectories() {
  return [
    'app/components',
    'app/api',
    'app/[locale]',
    'app/about',
    'app/blog',
    'app/careers',
    'app/contact',
    'app/page.tsx',
    'lib',
    'src/uitests'
  ];
}

// Main execution
console.log(`${colors.cyan}📝 Starting automated linting fixes...${colors.reset}`);
fs.writeFileSync(logFile, `ESLint Fixes Log - ${new Date().toISOString()}\n`);

// Process directories separately to avoid buffer overflow
const directories = getDirectories();
console.log(`${colors.cyan}Found ${directories.length} directories/files to process${colors.reset}`);

// 1. Fix unused variables in each directory
console.log(`\n${colors.bright}${colors.blue}Step 1: Fixing unused variables${colors.reset}`);
for (const dir of directories) {
  runCommand(
    `npx eslint --fix ${dir} --rule "@typescript-eslint/no-unused-vars:error"`,
    `Fixing unused variables in ${dir}`
  );
}

// 2. Run general ESLint fix for each directory
console.log(`\n${colors.bright}${colors.blue}Step 2: Running general ESLint fixes${colors.reset}`);
for (const dir of directories) {
  runCommand(
    `npx eslint --fix ${dir}`,
    `Running general ESLint fixes in ${dir}`
  );
}

// 3. Run TypeScript type checking
console.log(`\n${colors.bright}${colors.blue}Step 3: Running TypeScript checks${colors.reset}`);
runCommand(
  'npx tsc --noEmit',
  'Checking for TypeScript errors'
);

// Print summary
console.log(`\n${colors.bright}${colors.blue}📋 Summary:${colors.reset}`);
console.log(`${colors.green}✓ Automated fixes completed${colors.reset}`);
console.log(`${colors.cyan}📄 Log file created at: ${logFile}${colors.reset}`);

console.log(`\n${colors.yellow}⚠️ Manual fixes still required for:${colors.reset}`);
console.log(`1. Replace <a> elements with Next.js <Link> components`);
console.log(`2. Fix object injection security issues (security/detect-object-injection)`);
console.log(`3. Replace "any" types with proper TypeScript types`);

console.log(`\n${colors.bright}${colors.blue}Next steps:${colors.reset}`);
console.log(`1. Run ${colors.cyan}npm run lint${colors.reset} to check for remaining issues`);
console.log(`2. Check the GitHub Actions workflow to verify the fixes`); 