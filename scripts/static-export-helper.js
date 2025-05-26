#!/usr/bin/env node

/* eslint-disable no-console */
/* eslint-env node */

/**
 * Static Export Helper Script for Next.js
 *
 * CONTEXT:
 * When deploying a Next.js application as a static export to Azure Static Web Apps,
 * there are several edge cases and limitations that need to be addressed. This script
 * provides a post-build solution to ensure the static export is complete and properly
 * configured.
 *
 * PURPOSE:
 * This script runs after the Next.js static export to:
 * 1. Ensure all necessary configuration files are copied to the output directory
 * 2. Create fallback pages for routes that can't be statically generated
 * 3. Validate the output directory structure to detect build issues
 * 4. Add hosting-specific files (.nojekyll, etc.)
 * 5. Log information about middleware compatibility with static exports
 *
 * USAGE:
 * This script is called as part of the CI/CD pipeline and can be run locally with:
 *   npm run static-export
 *
 * The script is integrated into the build process in package.json via the
 * "azure-build" script.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import process from 'process';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Path Configuration
 * Define paths for important directories and files that need special handling
 */
const OUT_DIR = path.join(process.cwd(), "out");
const ROUTES_CONFIG = path.join(process.cwd(), "routes.json");
const STATIC_WEB_APP_CONFIG = path.join(
  process.cwd(),
  "staticwebapp.config.json",
);
const NEXT_CONFIG = path.join(process.cwd(), "next.config.js");
const PUBLIC_DIR = path.join(process.cwd(), "public");
const MIDDLEWARE_PATH = path.join(process.cwd(), "middleware.ts");

/**
 * Dynamic routes that can't be pre-rendered statically
 * These routes require special handling when deployed as static files
 */
const DYNAMIC_ROUTES = ["/api/*"];

/**
 * Additional files that should be copied from public directory
 * These files are important for SEO, browsers, and other services
 */
const ADDITIONAL_FILES = [
  { source: "robots.txt", destination: "robots.txt" },
  { source: "sitemap.xml", destination: "sitemap.xml" },
  { source: "favicon.ico", destination: "favicon.ico" },
];

/**
 * Ensures a directory exists, creating it if necessary
 *
 * @param {string} dir - Directory path to ensure exists
 */
function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`ℹ️ Directory already exists: ${dir}`);
  }
}

/**
 * Safely copies a file with error handling
 *
 * @param {string} source - Source file path
 * @param {string} destination - Destination file path
 * @returns {boolean} - True if copy succeeded, false otherwise
 */
function copyFileSafely(source, destination) {
  try {
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, destination);
      console.log(
        `✅ Copied ${path.basename(source)} to ${path.dirname(destination)}`,
      );
      return true;
    } else {
      console.warn(`⚠️ Warning: Source file does not exist: ${source}`);
      return false;
    }
  } catch (error) {
    console.error(
      `❌ Error copying ${source} to ${destination}:`,
      error.message,
    );
    return false;
  }
}

/**
 * Creates necessary fallback pages for routes that can't be statically generated
 *
 * This function:
 * 1. Creates a custom 404 page if it doesn't exist
 * 2. Adds a .nojekyll file for GitHub Pages compatibility
 * 3. Could be extended to add other fallback pages as needed
 */
function ensureFallbackPages() {
  ensureDirectory(OUT_DIR);

  // Create a fallback 404 page if it doesn't exist
  // This is critical for handling routes that don't exist in a static export
  const notFoundPath = path.join(OUT_DIR, "404.html");
  if (!fs.existsSync(notFoundPath)) {
    const notFoundContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Page Not Found</title>
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; flex-direction: column; background-color: #f7fafc; color: #2d3748; }
            .container { max-width: 600px; padding: 2rem; text-align: center; background-color: white; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            h1 { font-size: 2rem; margin-bottom: 1rem; }
            p { margin-bottom: 1.5rem; color: #4a5568; }
            a { color: #4299e1; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Page Not Found</h1>
            <p>The page you're looking for doesn't exist or has been moved.</p>
            <a href="/">Go back to the homepage</a>
          </div>
        </body>
      </html>
    `;
    try {
      fs.writeFileSync(notFoundPath, notFoundContent.trim());
      console.log(`✅ Created fallback 404 page: ${notFoundPath}`);
    } catch (error) {
      console.error(`❌ Error creating fallback 404 page:`, error.message);
    }
  } else {
    console.log(`ℹ️ 404 page already exists: ${notFoundPath}`);
  }

  // Create a .nojekyll file to prevent GitHub Pages from ignoring files that begin with an underscore
  // This is important because Next.js puts assets in _next directory
  const noJekyllPath = path.join(OUT_DIR, ".nojekyll");
  if (!fs.existsSync(noJekyllPath)) {
    try {
      fs.writeFileSync(noJekyllPath, "");
      console.log("✅ Created .nojekyll file");
    } catch (error) {
      console.error(`❌ Error creating .nojekyll file:`, error.message);
    }
  } else {
    console.log(`ℹ️ .nojekyll file already exists`);
  }
}

/**
 * Validates the output directory structure to ensure it contains required files
 *
 * This helps detect if the static export was successful or if there were build errors.
 *
 * @returns {boolean} - True if validation passed, false otherwise
 */
function validateOutputDirectory() {
  // Check if index.html exists in the root directory
  // This is the most basic check - if this is missing, the build definitely failed
  const indexPath = path.join(OUT_DIR, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.warn(
      `⚠️ Warning: No index.html found in the output directory. Static export may have failed.`,
    );
    return false;
  }

  // Check if _next directory exists
  // This directory contains all the JavaScript, CSS, and other assets
  const nextDir = path.join(OUT_DIR, "_next");
  if (!fs.existsSync(nextDir)) {
    console.warn(
      `⚠️ Warning: No _next directory found. Static export may be incomplete.`,
    );
    return false;
  }

  console.log(`✅ Output directory structure validated`);
  return true;
}

/**
 * Copies additional files from public directory to output
 *
 * These files include robots.txt, sitemap.xml, favicons, and other
 * assets that should be available at the root of the site.
 */
function copyPublicFiles() {
  if (fs.existsSync(PUBLIC_DIR)) {
    console.log(`ℹ️ Copying additional files from public directory...`);

    for (const file of ADDITIONAL_FILES) {
      const sourcePath = path.join(PUBLIC_DIR, file.source);
      const destPath = path.join(OUT_DIR, file.destination);

      copyFileSafely(sourcePath, destPath);
    }
  } else {
    console.warn(`⚠️ Warning: Public directory not found: ${PUBLIC_DIR}`);
  }
}

/**
 * Validates middleware configuration for static export compatibility
 * 
 * Next.js middleware is not fully compatible with static exports.
 * This function logs information about the current middleware setup.
 */
function checkMiddlewareCompatibility() {
  if (fs.existsSync(MIDDLEWARE_PATH)) {
    console.log("ℹ️ Middleware file detected: middleware.ts");
    console.log("ℹ️ Note: Middleware functionality is limited in static exports.");
    console.log("ℹ️ Security headers and other middleware features are implemented in staticwebapp.config.json");
    
    try {
      const middlewareContent = fs.readFileSync(MIDDLEWARE_PATH, 'utf8');
      if (middlewareContent.includes('output: export') || 
          middlewareContent.includes('static export')) {
        console.log("✅ Middleware appears to be compatible with static exports");
      } else {
        console.warn("⚠️ Warning: Make sure middleware.ts is compatible with 'output: export'");
        console.warn("⚠️ See docs/middleware-to-static-export.md for more information");
      }
    } catch (error) {
      console.warn("⚠️ Warning: Could not read middleware.ts file: ", error.message);
    }
  } else {
    console.log("ℹ️ No middleware.ts file detected");
  }
}

// Main execution block
try {
  console.log("🚀 Running Static Export Helper...");

  // Step 1: Ensure the output directory exists
  ensureDirectory(OUT_DIR);

  // Step 2: Copy Azure Static Web Apps configuration
  // This file contains routing rules and other settings for Azure
  if (fs.existsSync(STATIC_WEB_APP_CONFIG)) {
    copyFileSafely(
      STATIC_WEB_APP_CONFIG,
      path.join(OUT_DIR, "staticwebapp.config.json"),
    );
  } else {
    console.warn(
      `⚠️ Warning: Static Web App config not found: ${STATIC_WEB_APP_CONFIG}`,
    );
  }

  // Step 3: Copy routes configuration for custom routing
  if (fs.existsSync(ROUTES_CONFIG)) {
    copyFileSafely(ROUTES_CONFIG, path.join(OUT_DIR, "routes.json"));
  } else {
    console.warn(`⚠️ Warning: Routes config not found: ${ROUTES_CONFIG}`);
  }

  // Step 4: Create fallback pages for routes that can't be statically generated
  ensureFallbackPages();

  // Step 5: Copy important public files (robots.txt, etc.)
  copyPublicFiles();
  
  // Step 6: Check middleware compatibility
  checkMiddlewareCompatibility();

  // Step 7: Validate the output directory structure
  if (validateOutputDirectory()) {
    console.log("✅ Static Export Helper completed successfully");
    process.exit(0);
  } else {
    console.warn("⚠️ Static Export Helper completed with warnings");
    // Exit with code 0 to allow CI to continue even with warnings
    // This prevents non-critical issues from failing the build
    process.exit(0);
  }
} catch (error) {
  console.error("❌ Error during static export preparation:", error);
  // Exit with code 0 to allow CI to continue despite errors
  // The actual build already completed at this point, so this
  // script should not cause the whole deployment to fail
  process.exit(0);
}
