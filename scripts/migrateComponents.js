const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Directories
const sourceDir = path.join(__dirname, "..", "components");
const targetDir = path.join(__dirname, "..", "app", "components");

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Helper function to transform component exports
function transformToNamedExport(content) {
  // Replace default export with named export
  content = content.replace(
    /export\s+default\s+function\s+(\w+)/g,
    "export const $1 = ",
  );

  // Replace arrow function default exports
  content = content.replace(/export\s+default\s+(\w+)/g, "export const $1 =");

  // Replace const Component = ... export default Component
  const matches = content.match(
    /const\s+(\w+)\s+=.*?\n.*?export\s+default\s+\1;?/gs,
  );
  if (matches) {
    matches.forEach((match) => {
      const componentName = match.match(/const\s+(\w+)/)[1];
      content = content.replace(
        match,
        match.replace(`export default ${componentName};`, ""),
      );
      content = content.replace(
        `const ${componentName} =`,
        `export const ${componentName} =`,
      );
    });
  }

  return content;
}

// Read all components from the source directory
const files = fs.readdirSync(sourceDir);

// Process each file
files.forEach((file) => {
  const sourcePath = path.join(sourceDir, file);

  // Skip if it's a directory
  if (fs.statSync(sourcePath).isDirectory()) {
    // Copy directory
    const targetSubDir = path.join(targetDir, file);
    fs.mkdirSync(targetSubDir, { recursive: true });
    console.log(`Created directory: ${targetSubDir}`);
    return;
  }

  // Skip non-TypeScript/JavaScript files
  if (
    !file.endsWith(".tsx") &&
    !file.endsWith(".ts") &&
    !file.endsWith(".jsx") &&
    !file.endsWith(".js")
  ) {
    return;
  }

  // Convert JSX files to TSX
  const newExt = file.endsWith(".jsx")
    ? ".tsx"
    : file.endsWith(".js")
      ? ".ts"
      : "";
  const newFile = newExt ? file.replace(/\.(jsx|js)$/, newExt) : file;
  const targetPath = path.join(targetDir, newFile);

  // Read file content
  let content = fs.readFileSync(sourcePath, "utf8");

  // Transform to named exports
  content = transformToNamedExport(content);

  // Add dark mode support to Tailwind classes if needed
  content = content.replace(
    /className="([^"]*bg-white[^"]*)"/g,
    'className="$1 dark:bg-gray-800"',
  );
  content = content.replace(
    /className="([^"]*text-gray-[6-9]00[^"]*)"/g,
    'className="$1 dark:text-gray-300"',
  );

  // Write to new location
  fs.writeFileSync(targetPath, content);
  console.log(`Migrated: ${sourcePath} → ${targetPath}`);
});

console.log("Migration complete!");
console.log("Next steps:");
console.log("1. Update imports in your components to use named exports");
console.log("2. Check for any styling issues related to dark mode");
console.log("3. Verify all components work correctly");
