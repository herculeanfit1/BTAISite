#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Prompt for user input
async function promptUser() {
  return new Promise((resolve) => {
    const component = {};

    rl.question("Component name (PascalCase): ", (name) => {
      component.name = name;

      rl.question("Is this a client component? (y/n): ", (isClient) => {
        component.isClient = isClient.toLowerCase() === "y";

        rl.question("Add props interface? (y/n): ", (hasProps) => {
          component.hasProps = hasProps.toLowerCase() === "y";

          if (component.hasProps) {
            rl.question(
              "Enter comma-separated prop names (e.g., title, description, className): ",
              (propsInput) => {
                component.props = propsInput
                  .split(",")
                  .map((prop) => prop.trim());
                resolve(component);
                rl.close();
              },
            );
          } else {
            resolve(component);
            rl.close();
          }
        });
      });
    });
  });
}

// Generate interface based on props
function generateInterface(componentName, props) {
  if (!props || props.length === 0) return "";

  return `interface ${componentName}Props {
${props.map((prop) => `  ${prop}${prop === "className" ? "?" : ""}: string;`).join("\n")}
}\n\n`;
}

// Generate component with proper format
function generateComponent(component) {
  const { name, isClient, hasProps, props } = component;

  // Generate the interface if needed
  const interfaceCode = hasProps ? generateInterface(name, props) : "";

  // Generate the props destructuring if needed
  const propsDestructuring = hasProps
    ? `({ ${props.join(", ")} }: ${name}Props)`
    : "()";

  return `${isClient ? "'use client';\n\n" : ""}import React from 'react';
${hasProps && props.includes("className") ? "import { twMerge } from 'tailwind-merge';\n" : ""}
${interfaceCode}export const ${name} = ${propsDestructuring} => {
  return (
    <div${props && props.includes("className") ? " className={twMerge('', className)}" : ""}>
      {/* ${name} component */}
    </div>
  );
};`;
}

// Write the component file
function writeComponentFile(component) {
  const componentDir = path.join(process.cwd(), "app/components");
  const filePath = path.join(componentDir, `${component.name}.tsx`);

  // Check if the component directory exists
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }

  // Check if the file already exists
  if (fs.existsSync(filePath)) {
    console.error(`Error: Component "${component.name}.tsx" already exists.`);
    process.exit(1);
  }

  // Generate the component code
  const componentCode = generateComponent(component);

  // Write the file
  fs.writeFileSync(filePath, componentCode);

  console.log(
    `Component "${component.name}.tsx" created successfully in app/components directory.`,
  );
}

// Run the script
async function run() {
  try {
    const component = await promptUser();
    writeComponentFile(component);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

run();
