#!/usr/bin/env node

/**
 * Fix Imports Script
 *
 * This script systematically fixes all @/ imports in the codebase,
 * converting them to relative imports to resolve path alias issues
 * in the CI/CD pipeline.
 *
 * PROBLEM CONTEXT:
 * While Next.js supports path aliases like @/ in development and
 * server-side rendering, these can cause issues during static export
 * builds, particularly in CI environments. The Azure Static Web Apps
 * deployment specifically had failures because of these imports.
 *
 * SOLUTION:
 * This script:
 * 1. Finds all TypeScript/JavaScript files in the project
 * 2. Analyzes import statements using regex patterns
 * 3. Calculates correct relative paths between files
 * 4. Replaces @/ imports with proper relative paths
 *
 * The script targets three specific patterns:
 * 1. @/lib/* imports - Converting to relative paths (e.g., ../../lib/utils)
 * 2. @/app/components/* imports - Converting to relative paths
 * 3. @/components/* imports - Converting to relative paths (legacy imports)
 *
 * USAGE:
 *   node scripts/fix-imports.js
 *
 * INTEGRATION WITH CI:
 * This script is run as part of the CI build process via:
 *   npm run fix:imports
 *
 * This ensures all imports are fixed before the build step runs.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

// Get the current directory name from ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
// Define the app directory location and which file extensions to process
const APP_DIR = path.join(path.dirname(__dirname), "app");
const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

// Color codes for console output to make the logs more readable
const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Statistics tracking to report on script effectiveness
const stats = {
  filesScanned: 0,
  filesModified: 0,
  importsFixed: 0,
  errors: 0,
};

/**
 * Recursively finds all files with specified extensions in a directory
 *
 * @param {string} dir - Directory to scan for files
 * @param {string[]} extensions - File extensions to match (e.g., ['.ts', '.tsx'])
 * @returns {string[]} - Array of full file paths
 */
function findFiles(dir, extensions) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      // Skip node_modules and other build/cache directories
      // These are large and don't need processing
      if (file !== "node_modules" && file !== ".next" && file !== ".git") {
        results = results.concat(findFiles(filePath, extensions));
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  });

  return results;
}

/**
 * Calculates the relative path from source file to target file
 *
 * This is the core function that determines how to navigate from
 * one file to another using relative paths (../../etc)
 *
 * @param {string} sourcePath - Path of the file containing the import
 * @param {string} targetPath - Path of the file or directory being imported
 * @returns {string} - Relative path to use in import statement
 */
function calculateRelativePath(sourcePath, targetPath) {
  // Get the directory of the source file
  const sourceDir = path.dirname(sourcePath);

  // Calculate the relative path from source directory to target
  let relativePath = path.relative(sourceDir, targetPath);

  // If the relative path doesn't start with ./ or ../, add ./
  // This ensures proper module resolution in JavaScript
  if (!relativePath.startsWith(".")) {
    relativePath = "./" + relativePath;
  }

  return relativePath;
}

/**
 * Converts @/ imports to relative imports in a file
 *
 * This function does the actual replacement work:
 * 1. Reads a file
 * 2. Finds all @/ import patterns using regex
 * 3. Calculates relative paths for each
 * 4. Replaces the imports with relative versions
 * 5. Writes the file back if changes were made
 *
 * @param {string} filePath - Path to the file to process
 */
function fixImportsInFile(filePath) {
  console.log(`${COLORS.blue}Processing:${COLORS.reset} ${filePath}`);
  stats.filesScanned++;

  try {
    let content = fs.readFileSync(filePath, "utf8");
    let originalContent = content;
    let modified = false;

    // FIX TYPE 1: @/lib/* imports
    // Example: import { utils } from '../lib/lib/helpers'
    const libImportRegex = /from\s+['"]@\/lib\/(.*)['"]/g;
    const libMatches = [...content.matchAll(libImportRegex)];

    for (const match of libMatches) {
      const fullMatch = match[0];
      const importPath = match[1];
      const libPath = path.join(process.cwd(), "lib");
      const relativePath = calculateRelativePath(
        filePath,
        path.join(libPath, importPath),
      );

      content = content.replace(fullMatch, `from '${relativePath}'`);

      stats.importsFixed++;
      modified = true;
      console.log(
        `  ${COLORS.green}Fixed:${COLORS.reset} @/lib/${importPath} → ${relativePath}`,
      );
    }

    // FIX TYPE 2: @/app/components/* imports
    // Example: import { Button } from '../app/components/app/components/Button'
    const appComponentsImportRegex = /from\s+['"]@\/app\/components\/(.*)['"]/g;
    const appComponentMatches = [...content.matchAll(appComponentsImportRegex)];

    for (const match of appComponentMatches) {
      const fullMatch = match[0];
      const importPath = match[1];
      const componentsPath = path.join(process.cwd(), "app", "components");
      const relativePath = calculateRelativePath(
        filePath,
        path.join(componentsPath, importPath),
      );

      content = content.replace(fullMatch, `from '${relativePath}'`);

      stats.importsFixed++;
      modified = true;
      console.log(
        `  ${COLORS.green}Fixed:${COLORS.reset} @/app/components/${importPath} → ${relativePath}`,
      );
    }

    // FIX TYPE 3: @/components/* imports (legacy pattern from before component migration)
    // Example: import { Button } from '../app/components/app/components/Button'
    const legacyComponentsImportRegex = /from\s+['"]@\/components\/(.*)['"]/g;
    const legacyComponentMatches = [
      ...content.matchAll(legacyComponentsImportRegex),
    ];

    for (const match of legacyComponentMatches) {
      const fullMatch = match[0];
      const importPath = match[1];
      const componentsPath = path.join(process.cwd(), "app", "components");
      const relativePath = calculateRelativePath(
        filePath,
        path.join(componentsPath, importPath),
      );

      content = content.replace(fullMatch, `from '${relativePath}'`);

      stats.importsFixed++;
      modified = true;
      console.log(
        `  ${COLORS.yellow}Fixed legacy:${COLORS.reset} @/components/${importPath} → ${relativePath}`,
      );
    }

    // Write changes back to file if modified
    if (modified) {
      fs.writeFileSync(filePath, content, "utf8");
      stats.filesModified++;
    }
  } catch (error) {
    console.error(
      `${COLORS.red}Error processing ${filePath}:${COLORS.reset}`,
      error.message,
    );
    stats.errors++;
  }
}

/**
 * Main execution function
 *
 * Coordinates the overall script flow:
 * 1. Finds all applicable files
 * 2. Processes each file to fix imports
 * 3. Reports on results
 */
function main() {
  console.log(
    `${COLORS.magenta}===============================================${COLORS.reset}`,
  );
  console.log(
    `${COLORS.magenta}| IMPORT PATH FIXER                          |${COLORS.reset}`,
  );
  console.log(
    `${COLORS.magenta}===============================================${COLORS.reset}`,
  );
  console.log(
    `${COLORS.cyan}Starting import path fixing process...${COLORS.reset}`,
  );

  try {
    // Find all .ts, .tsx, .js, .jsx files in the project
    const files = findFiles(process.cwd(), EXTENSIONS);
    console.log(`Found ${files.length} files to process\n`);

    // Process each file
    files.forEach((file) => fixImportsInFile(file));

    // Report statistics on completion
    console.log(
      `\n${COLORS.magenta}===============================================${COLORS.reset}`,
    );
    console.log(
      `${COLORS.green}✓ Import path fixing completed!${COLORS.reset}`,
    );
    console.log(
      `${COLORS.cyan}Files scanned:   ${COLORS.reset}${stats.filesScanned}`,
    );
    console.log(
      `${COLORS.cyan}Files modified:  ${COLORS.reset}${stats.filesModified}`,
    );
    console.log(
      `${COLORS.cyan}Imports fixed:   ${COLORS.reset}${stats.importsFixed}`,
    );

    if (stats.errors > 0) {
      console.log(
        `${COLORS.red}Errors:          ${COLORS.reset}${stats.errors}`,
      );
    }
    console.log(
      `${COLORS.magenta}===============================================${COLORS.reset}`,
    );
  } catch (error) {
    console.error(`${COLORS.red}Fatal error:${COLORS.reset}`, error.message);
    process.exit(1);
  }
}

// Execute the script
main();
