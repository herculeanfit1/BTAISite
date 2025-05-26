#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Find all files with imports from the old path
async function fixLegacyImports() {
  try {
    // Get all files that have imports from @/components
    const result = execSync(
      'grep -r "from \'@/components/" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" .',
    ).toString();

    // Parse the output to get file paths and the specific import lines
    const lines = result.split("\n").filter(Boolean);
    const fileImports = {};

    lines.forEach((line) => {
      const [filePath, importLine] = line.split(":", 2);
      if (!fileImports[filePath]) {
        fileImports[filePath] = [];
      }
      fileImports[filePath].push(importLine.trim());
    });

    // Fix each file
    Object.keys(fileImports).forEach((filePath) => {
      console.log(`Fixing imports in ${filePath}`);
      let content = fs.readFileSync(filePath, "utf8");

      // Replace each import line
      fileImports[filePath].forEach((importLine) => {
        const newImportLine = importLine.replace(
          /from ['"]@\/components\//,
          `from '@/app/components/`,
        );
        content = content.replace(importLine, newImportLine);
      });

      // Write the updated content back to the file
      fs.writeFileSync(filePath, content, "utf8");
    });

    console.log("All legacy imports have been fixed.");
  } catch (error) {
    if (error.status === 1) {
      console.log("No legacy imports found. All good!");
    } else {
      console.error("Error fixing legacy imports:", error);
    }
  }
}

fixLegacyImports();
