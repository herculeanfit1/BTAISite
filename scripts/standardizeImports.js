#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Patterns to find and replace
const importPatterns = [
  // Replace relative paths that go up to the app directory
  {
    find: /import\s+\{([^}]+)\}\s+from\s+['"]\.\.\/\.\.\/app\/components\/([^'"]+)['"]/g,
    replace: "import {$1} from '../app/components/$2'",
  },
  // Replace direct relative imports to components directory
  {
    find: /import\s+\{([^}]+)\}\s+from\s+['"]\.\.\/components\/([^'"]+)['"]/g,
    replace: "import {$1} from '../app/components/$2'",
  },
  // Handle default imports
  {
    find: /import\s+([^{}\s]+)\s+from\s+['"]\.\.\/\.\.\/app\/components\/([^'"]+)['"]/g,
    replace: "import $1 from '../app/components/$2'",
  },
  // Handle default imports from relative paths
  {
    find: /import\s+([^{}\s]+)\s+from\s+['"]\.\.\/components\/([^'"]+)['"]/g,
    replace: "import $1 from '../app/components/$2'",
  },
];

// Function to recursively get all files
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively process subdirectories, but exclude node_modules and .git
      if (file !== "node_modules" && file !== ".git" && file !== ".next") {
        getAllFiles(filePath, fileList);
      }
    } else if (
      stat.isFile() &&
      (file.endsWith(".js") ||
        file.endsWith(".ts") ||
        file.endsWith(".tsx") ||
        file.endsWith(".jsx"))
    ) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Main function
async function updateImports() {
  try {
    // Get all JS/TS files in the project
    const files = getAllFiles(".");

    let changedFiles = 0;

    for (const filePath of files) {
      let content = fs.readFileSync(filePath, "utf8");
      let originalContent = content;

      for (const pattern of importPatterns) {
        content = content.replace(pattern.find, pattern.replace);
      }

      if (content !== originalContent) {
        console.log(`Updating imports in ${filePath}`);
        fs.writeFileSync(filePath, content, "utf8");
        changedFiles++;
      }
    }

    console.log(`Finished! Updated ${changedFiles} files.`);
  } catch (err) {
    console.error("Error:", err);
  }
}

updateImports();
