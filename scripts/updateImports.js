const fs = require("fs");
const path = require("path");

// Directories to check for imports
const dirsToCheck = [
  path.join(__dirname, "..", "app"),
  path.join(__dirname, "..", "components"), // Existing components may import others
  path.join(__dirname, "..", "lib"),
  path.join(__dirname, "..", "styles"),
  path.join(__dirname, "..", "utils"),
  path.join(__dirname, "..", "hooks"),
  path.join(__dirname, "..", "contexts"),
];

// Get all component names from the new location
const componentDir = path.join(__dirname, "..", "app", "components");
const componentFiles = fs
  .readdirSync(componentDir)
  .filter((file) => file.endsWith(".tsx") || file.endsWith(".ts"))
  .map((file) => path.parse(file).name);

// Map of default import statements to named import statements
const importMappings = {};
componentFiles.forEach((component) => {
  // Create mappings for various import patterns
  importMappings[`import ${component} from '../app/components/${component}'`] =
    `import { ${component} } from '../app/components/${component}'`;

  importMappings[`import ${component} from '../components/${component}'`] =
    `import { ${component} } from '../app/components/${component}'`;

  importMappings[`import ${component} from '../../components/${component}'`] =
    `import { ${component} } from '../../app/components/${component}'`;

  importMappings[`import ${component} from './components/${component}'`] =
    `import { ${component} } from './app/components/${component}'`;

  // Also handle component folder imports
  importMappings[
    `import ${component} from '../app/components/${component.toLowerCase()}'`
  ] =
    `import { ${component} } from '../app/components/${component.toLowerCase()}'`;
});

// Function to process a file
function processFile(filePath) {
  if (fs.statSync(filePath).isDirectory()) {
    // Process directory
    fs.readdirSync(filePath).forEach((file) => {
      const fullPath = path.join(filePath, file);
      processFile(fullPath);
    });
    return;
  }

  // Only process TypeScript/JavaScript files
  if (
    !filePath.endsWith(".tsx") &&
    !filePath.endsWith(".ts") &&
    !filePath.endsWith(".jsx") &&
    !filePath.endsWith(".js")
  ) {
    return;
  }

  // Skip the component files we just migrated
  if (filePath.includes(path.join("app", "components"))) {
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // Replace imports
  for (const [oldImport, newImport] of Object.entries(importMappings)) {
    if (content.includes(oldImport)) {
      content = content.replace(new RegExp(oldImport, "g"), newImport);
      modified = true;
      console.log(`Updated import in ${filePath}: ${oldImport} → ${newImport}`);
    }
  }

  // Save if modified
  if (modified) {
    fs.writeFileSync(filePath, content);
  }
}

// Process each directory
dirsToCheck.forEach((dir) => {
  if (fs.existsSync(dir)) {
    processFile(dir);
  }
});

console.log("Import updates complete!");
console.log("Remember to:");
console.log("1. Check for any imports that were not automatically updated");
console.log("2. Verify the application builds and works correctly");
console.log(
  "3. Remove the old components directory after confirming everything works",
);
