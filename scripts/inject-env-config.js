#!/usr/bin/env node

/**
 * inject-env-config.js
 * 
 * This script injects environment variables into the static site's HTML
 * so they can be used by client-side JavaScript.
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
try {
  if (fs.existsSync('.env.production')) {
    dotenv.config({ path: '.env.production' });
    console.log('✅ Loaded environment variables from .env.production');
  } else if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' });
    console.log('✅ Loaded environment variables from .env.local');
  } else {
    console.log('⚠️ No .env file found, using process environment variables');
  }
} catch (error) {
  console.error('❌ Error loading environment variables:', error);
}

// Get email configuration
const EMAIL_TO = process.env.EMAIL_TO || 'sales@bridgingtrust.ai';

// Directory with static HTML files
const staticDir = path.resolve(process.cwd(), 'out');

// Find all HTML files
function findHtmlFiles(dir) {
  const results = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results.push(...findHtmlFiles(filePath));
    } else if (file.endsWith('.html')) {
      results.push(filePath);
    }
  }

  return results;
}

// Create environment config script
const envConfig = `
<script>
  window.ENV = {
    EMAIL_TO: "${EMAIL_TO}"
  };
</script>
`;

// Inject environment config into HTML files
function injectConfig() {
  if (!fs.existsSync(staticDir)) {
    console.error(`❌ Static directory not found: ${staticDir}`);
    process.exit(1);
  }

  const htmlFiles = findHtmlFiles(staticDir);
  console.log(`Found ${htmlFiles.length} HTML files to process`);

  let modifiedCount = 0;

  for (const filePath of htmlFiles) {
    let html = fs.readFileSync(filePath, 'utf-8');

    if (!html.includes('window.ENV')) {
      // Insert the environment config script before the closing head tag
      html = html.replace('</head>', `${envConfig}</head>`);
      fs.writeFileSync(filePath, html);
      modifiedCount++;
    }
  }

  console.log(`✅ Injected environment config into ${modifiedCount} HTML files`);
}

// Run the script
injectConfig(); 