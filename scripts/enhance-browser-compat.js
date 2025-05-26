/**
 * Cross-Browser Compatibility Enhancement Script
 * 
 * This script adds necessary prefixes and polyfills to improve
 * cross-browser compatibility of the static site export.
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cwd = process.cwd();

// Ensure Autoprefixer is installed
try {
  await import('autoprefixer');
  console.log('✅ Autoprefixer is already installed');
} catch (error) {
  console.log('📦 Installing Autoprefixer...');
  execSync('npm install --save-dev autoprefixer', { stdio: 'inherit' });
  console.log('✅ Autoprefixer installed successfully');
}

// Ensure PostCSS CLI is installed
try {
  await import('postcss-cli');
  console.log('✅ PostCSS CLI is already installed');
} catch (error) {
  console.log('📦 Installing PostCSS CLI...');
  execSync('npm install --save-dev postcss-cli', { stdio: 'inherit' });
  console.log('✅ PostCSS CLI installed successfully');
}

// Update postcss.config.js if needed to ensure autoprefixer is included
console.log('🔄 Checking and updating PostCSS config...');
const postcssConfigPath = path.join(cwd, 'postcss.config.cjs');

// Check if postcss.config.cjs exists
if (fs.existsSync(postcssConfigPath)) {
  const postcssConfig = fs.readFileSync(postcssConfigPath, 'utf8');

  if (!postcssConfig.includes('autoprefixer')) {
    console.log('🔄 Adding autoprefixer to PostCSS config...');
    const updatedPostcssConfig = postcssConfig.replace(
      /module\.exports\s*=\s*{/,
      `module.exports = {
  plugins: {
    autoprefixer: {
      flexbox: 'no-2009',
      grid: 'autoplace'
    },
    ...(`
    );
    
    fs.writeFileSync(postcssConfigPath, updatedPostcssConfig, 'utf8');
    console.log('✅ Updated postcss.config.cjs with autoprefixer');
  } else {
    console.log('✅ Autoprefixer already configured in PostCSS');
  }
} else {
  console.log('⚠️ postcss.config.cjs not found, skipping config update');
}

// Create a browserslist file if it doesn't exist
const browserslistPath = path.join(cwd, '.browserslistrc');
if (!fs.existsSync(browserslistPath)) {
  console.log('📝 Creating .browserslistrc file...');
  const browserslistContent = `# Browsers that the site supports
> 0.5%
last 2 versions
Firefox ESR
not dead
not IE 11
`;
  fs.writeFileSync(browserslistPath, browserslistContent, 'utf8');
  console.log('✅ Created .browserslistrc file');
} else {
  console.log('✅ .browserslistrc file already exists');
}

// Process the static export directory
const outDir = path.join(cwd, 'out');
if (!fs.existsSync(outDir)) {
  console.error('❌ Static export directory "out" not found. Run "npm run build:static" first.');
  process.exit(1);
}

// Create a no-js class for users with JavaScript disabled
console.log('🔄 Adding no-js fallback class to HTML...');
const htmlFiles = fs.readdirSync(outDir, { recursive: true })
  .filter(file => typeof file === 'string' && file.endsWith('.html'));

htmlFiles.forEach(htmlFile => {
  const htmlFilePath = path.join(outDir, htmlFile);
  let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
  
  // Check if the nojs class is already added
  if (!htmlContent.includes('no-js')) {
    htmlContent = htmlContent.replace(
      /<html/,
      '<html class="no-js"'
    );
    
    // Add script to remove no-js class when JS is enabled
    htmlContent = htmlContent.replace(
      /<head>/,
      `<head>
  <script>document.documentElement.classList.remove('no-js');</script>`
    );
    
    fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
  }
});

// Create a browser compatibility CSS file
console.log('📝 Creating browser compatibility CSS...');
const compatCssPath = path.join(outDir, 'browser-compat.css');
const compatCssContent = `
/**
 * Cross-browser compatibility CSS
 */

/* Flexbox fallbacks for older browsers */
.flex {
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}

.flex-col {
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
}

.flex-row {
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
}

/* Basic fallback for grid in older browsers */
.grid {
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
}

.grid.display-grid {
  display: grid;
}

/* Fallbacks for modern CSS features */
.text-gradient {
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Smooth scrolling with fallback */
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

/* Fallback for focus-visible */
.focus-visible {
  outline: 2px solid var(--color-primary);
}

/* No JavaScript fallbacks */
.no-js .js-only {
  display: none !important;
}

/* Fix for iOS Safari 100vh issue */
@supports (-webkit-touch-callout: none) {
  .min-h-screen {
    min-height: -webkit-fill-available;
  }
}

/* Scrollbar styling for Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--color-primary) transparent;
}

/* Scrollbar styling for Webkit browsers */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: var(--color-primary);
  border-radius: 4px;
}
`;

fs.writeFileSync(compatCssPath, compatCssContent, 'utf8');
console.log('✅ Created browser-compat.css');

// Add the compatibility CSS to all HTML files
htmlFiles.forEach(htmlFile => {
  const htmlFilePath = path.join(outDir, htmlFile);
  let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
  
  if (!htmlContent.includes('browser-compat.css')) {
    htmlContent = htmlContent.replace(
      /<\/head>/,
      '  <link rel="stylesheet" href="/browser-compat.css">\n</head>'
    );
    
    fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
  }
});

console.log('✅ Added browser-compat.css to all HTML files');

// Run postcss with autoprefixer on the main CSS file in the output directory
console.log('🔄 Running autoprefixer on output CSS files...');

try {
  // Get CSS files in the output directory
  const cssDir = path.join(outDir, '_next/static/css');
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir)
      .filter(file => file.endsWith('.css'));

    cssFiles.forEach(cssFile => {
      const cssFilePath = path.join(cssDir, cssFile);
      
      // Run postcss with autoprefixer
      execSync(`npx postcss ${cssFilePath} -o ${cssFilePath} --use autoprefixer`, { stdio: 'inherit' });
    });
    
    console.log('✅ Applied autoprefixer to all CSS files');
  } else {
    console.log('⚠️ CSS directory not found in output');
  }
} catch (error) {
  console.error('❌ Error running autoprefixer:', error.message);
}

console.log('\n✅ Cross-browser compatibility enhancements complete');
console.log('🔍 Browser compatibility improvements:');
console.log('  1. Added autoprefixer for vendor prefixes');
console.log('  2. Created browser fallback CSS');
console.log('  3. Added no-js class for JavaScript-disabled browsers');
console.log('  4. Fixed iOS Safari 100vh issue');
console.log('  5. Added custom scrollbar styling');
console.log('  6. Added reduced motion support'); 