#!/usr/bin/env node

/**
 * Script to fix test.skip() TypeScript errors in Playwright test files
 * 
 * This script finds all instances of test.skip() with a string argument and
 * replaces them with the skipTest() helper function.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const TEST_DIRS = [
  'src/uitests',
  '__tests__'
];
const TEST_FILE_PATTERN = /\.(spec|test)\.(ts|tsx|js|jsx)$/;
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// Log with level control
function log(message, verbose = false) {
  if (!verbose || VERBOSE) {
    console.log(message);
  }
}

// Find all test files
function findTestFiles(directories) {
  let files = [];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      log(`Directory not found: ${dir}`, true);
      return;
    }
    
    try {
      // Use grep to find files containing test.skip
      const grepCommand = `grep -l "test.skip" $(find ${dir} -type f | grep -E "${TEST_FILE_PATTERN.source}")`;
      const grepResult = execSync(grepCommand, { encoding: 'utf8' }).trim();
      
      if (grepResult) {
        const foundFiles = grepResult.split('\n');
        files = [...files, ...foundFiles];
        log(`Found ${foundFiles.length} files with test.skip in ${dir}`, true);
      }
    } catch (error) {
      // grep returns non-zero exit code when no matches found
      log(`No matching files in ${dir}`, true);
    }
  });
  
  return files;
}

// Fix test.skip in a file
function fixTestSkips(filePath) {
  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Two regex patterns to catch common test.skip usages
    const skipPattern1 = /test\.skip\((['"`].*?['"`])\);/g;
    const skipPattern2 = /test\.skip\((['"`].*?['"`])\s*,/g;
    
    // Check if the file already imports skipTest
    const hasSkipTestImport = /import.*?{.*?skipTest.*?}.*?from.*?['"`]\.\.\/utils\/test-utils['"`]/.test(content);
    
    // Check if file contains problematic test.skip calls
    const hasInvalidSkip = skipPattern1.test(content) || skipPattern2.test(content);
    
    if (!hasInvalidSkip) {
      log(`No invalid test.skip() calls in ${filePath}`, true);
      return false;
    }
    
    // Reset regex lastIndex
    skipPattern1.lastIndex = 0;
    skipPattern2.lastIndex = 0;
    
    // Replace invalid test.skip() calls with skipTest()
    let newContent = content.replace(skipPattern1, 'skipTest($1);');
    newContent = newContent.replace(skipPattern2, 'skipTest($1);');
    
    // Add skipTest import if needed
    if (!hasSkipTestImport) {
      // Check for existing import from test-utils
      const hasTestUtilsImport = /import.*?from.*?['"`]\.\.\/utils\/test-utils['"`]/.test(newContent);
      
      if (hasTestUtilsImport) {
        // Update existing import to include skipTest
        newContent = newContent.replace(
          /import\s*{([^}]*)}\s*from\s*(['"`])\.\.\/utils\/test-utils\2/,
          (match, imports) => {
            const importList = imports.split(',').map(i => i.trim());
            if (!importList.includes('skipTest')) {
              importList.push('skipTest');
            }
            return `import { ${importList.join(', ')} } from "../utils/test-utils"`;
          }
        );
      } else {
        // Add new import statement
        newContent = `import { skipTest } from "../utils/test-utils";\n${newContent}`;
      }
    }
    
    if (DRY_RUN) {
      log(`Would fix ${filePath}`);
      return true;
    } else {
      fs.writeFileSync(filePath, newContent, 'utf8');
      log(`Fixed ${filePath}`);
      return true;
    }
  } catch (error) {
    log(`Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

// Main execution
function main() {
  log(`${DRY_RUN ? 'DRY RUN: ' : ''}Searching for test files with invalid test.skip() usage...`);
  
  const files = findTestFiles(TEST_DIRS);
  log(`Found ${files.length} files to check`);
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixTestSkips(file)) {
      fixedCount++;
    }
  }
  
  log(`${DRY_RUN ? 'Would fix' : 'Fixed'} ${fixedCount} files`);
  
  if (DRY_RUN) {
    log('Run without --dry-run to apply changes');
  }
}

main(); 