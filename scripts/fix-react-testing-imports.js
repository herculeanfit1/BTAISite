#!/usr/bin/env node
/**
 * Script to fix React Testing Library imports for React 19 / RTL v16 compatibility
 * This is part of the Node 20 LTS upgrade project
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';

// Use glob's sync method
const testFiles = glob.sync('__tests__/**/*.{ts,tsx}');
console.log(`Found ${testFiles.length} test files to update`);

// Fix imports in each file
let filesUpdated = 0;
const importRegex = /import\s+\{([^}]+)\}\s+from\s+["']@testing-library\/react["']/;
// Regex to match the separate import paths for screen, fireEvent, etc.
const separateImportRegex = /import\s+\{\s*([a-zA-Z]+)\s*\}\s+from\s+["']@testing-library\/react\/([a-zA-Z]+)["']/g;

// Map of component to correct import path in React Testing Library v16
const rtlImportMap = {
  screen: '@testing-library/dom',
  fireEvent: '@testing-library/dom',
  waitFor: '@testing-library/dom',
  act: 'react-dom/test-utils',
};

for (const filePath of testFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updatedContent = content;
  
  // First fix the separate imports created by our previous script
  if (separateImportRegex.test(content)) {
    updatedContent = content.replace(separateImportRegex, (match, importName, importPath) => {
      const correctPath = rtlImportMap[importName] || '@testing-library/react';
      return `import { ${importName} } from "${correctPath}"`;
    });
  }
  
  // Then fix any remaining RTL imports
  if (importRegex.test(updatedContent)) {
    updatedContent = updatedContent.replace(importRegex, (match, importList) => {
      const imports = importList.split(',').map(i => i.trim());
      
      // Separate imports by their correct packages
      const reactImports = [];
      const domImports = [];
      const actImports = [];
      
      imports.forEach(imp => {
        if (imp === 'render') {
          reactImports.push(imp);
        } else if (imp === 'act') {
          actImports.push(imp);
        } else if (['screen', 'fireEvent', 'waitFor', 'within'].includes(imp)) {
          domImports.push(imp);
        } else {
          // Default to react package for unknown imports
          reactImports.push(imp);
        }
      });
      
      let result = [];
      
      // Add imports from each package
      if (reactImports.length > 0) {
        result.push(`import { ${reactImports.join(', ')} } from "@testing-library/react"`);
      }
      
      if (domImports.length > 0) {
        result.push(`import { ${domImports.join(', ')} } from "@testing-library/dom"`);
      }
      
      if (actImports.length > 0) {
        result.push(`import { ${actImports.join(', ')} } from "react-dom/test-utils"`);
      }
      
      return result.join('\n');
    });
  }
  
  // Write changes if content was updated
  if (updatedContent !== content) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Updated: ${filePath}`);
    filesUpdated++;
  }
}

console.log(`\nUpdated ${filesUpdated} files out of ${testFiles.length} test files`); 