/**
 * Favicon Generator Script for Bridging Trust AI
 * 
 * This script converts the company SVG logo into various favicon formats
 * and sizes required for modern browsers and devices.
 * 
 * Usage: node scripts/generate-favicon.js
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOGO_PATH = path.join(__dirname, '../public/images/logo/BTAI_Logo_Original.svg');
const OUTPUT_DIR = path.join(__dirname, '../public');
const FAVICON_SIZES = [16, 32, 48, 96, 128, 196, 256, 512];
const APPLE_ICON_SIZES = [57, 60, 72, 76, 114, 120, 144, 152, 180];
const ANDROID_ICON_SIZES = [36, 48, 72, 96, 144, 192, 512];
const MS_ICON_SIZES = [70, 144, 150, 310];

// Colors
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';

/**
 * Ensure the output directory exists
 */
async function ensureDirectories() {
  const directories = [
    path.join(OUTPUT_DIR, 'icons'),
    path.join(OUTPUT_DIR, 'icons/apple-touch-icon'),
    path.join(OUTPUT_DIR, 'icons/android-chrome'),
    path.join(OUTPUT_DIR, 'icons/mstile')
  ];
  
  for (const dir of directories) {
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(`${GREEN}✓ Created directory:${RESET} ${dir}`);
    } catch (error) {
      console.error(`${RED}Error creating directory ${dir}:${RESET}`, error);
      throw error;
    }
  }
}

/**
 * Generate a favicon at the specified size
 */
async function generateIcon(inputPath, outputPath, size, padding = 0) {
  try {
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toFile(outputPath);
    
    console.log(`${GREEN}✓ Generated:${RESET} ${path.basename(outputPath)}`);
    return true;
  } catch (error) {
    console.error(`${RED}Error generating ${outputPath}:${RESET}`, error);
    return false;
  }
}

/**
 * Generate ICO file (favicon.ico)
 */
async function generateIco() {
  try {
    // For ICO files, we'll create PNG files of each size first
    const tempDir = path.join(__dirname, '../temp_icons');
    await fs.mkdir(tempDir, { recursive: true });
    
    const icoSizes = [16, 32, 48];
    const pngFiles = [];

    for (const size of icoSizes) {
      const outputPath = path.join(tempDir, `favicon-${size}.png`);
      await generateIcon(LOGO_PATH, outputPath, size);
      pngFiles.push(outputPath);
    }
    
    // Use sharp to convert to ICO (by using PNG as intermediate)
    const outputPath = path.join(OUTPUT_DIR, 'favicon.ico');
    
    // For favicon.ico, we'll use the 32x32 PNG as base
    await fs.copyFile(path.join(tempDir, 'favicon-32.png'), outputPath);
    
    console.log(`${GREEN}✓ Generated:${RESET} favicon.ico`);
    
    // Clean up temp directory
    for (const file of pngFiles) {
      await fs.unlink(file);
    }
    await fs.rmdir(tempDir);
    
    return true;
  } catch (error) {
    console.error(`${RED}Error generating favicon.ico:${RESET}`, error);
    return false;
  }
}

/**
 * Generate an HTML snippet for favicon references
 */
async function generateHtmlSnippet() {
  const snippetPath = path.join(OUTPUT_DIR, 'favicon-meta.html');
  
  const snippet = `<!-- Favicon configuration -->
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" type="image/png" href="/icons/favicon-16.png" sizes="16x16">
<link rel="icon" type="image/png" href="/icons/favicon-32.png" sizes="32x32">
<link rel="icon" type="image/png" href="/icons/favicon-48.png" sizes="48x48">
<link rel="icon" type="image/png" href="/icons/favicon-96.png" sizes="96x96">
<link rel="icon" type="image/png" href="/icons/favicon-128.png" sizes="128x128">
<link rel="icon" type="image/png" href="/icons/favicon-196.png" sizes="196x196">
<!-- Apple Touch Icons -->
<link rel="apple-touch-icon" sizes="57x57" href="/icons/apple-touch-icon/apple-touch-icon-57.png">
<link rel="apple-touch-icon" sizes="60x60" href="/icons/apple-touch-icon/apple-touch-icon-60.png">
<link rel="apple-touch-icon" sizes="72x72" href="/icons/apple-touch-icon/apple-touch-icon-72.png">
<link rel="apple-touch-icon" sizes="76x76" href="/icons/apple-touch-icon/apple-touch-icon-76.png">
<link rel="apple-touch-icon" sizes="114x114" href="/icons/apple-touch-icon/apple-touch-icon-114.png">
<link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-touch-icon/apple-touch-icon-120.png">
<link rel="apple-touch-icon" sizes="144x144" href="/icons/apple-touch-icon/apple-touch-icon-144.png">
<link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon/apple-touch-icon-152.png">
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon/apple-touch-icon-180.png">
<!-- Android Chrome -->
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#ffffff">
<!-- Microsoft Tiles -->
<meta name="msapplication-TileColor" content="#ffffff">
<meta name="msapplication-TileImage" content="/icons/mstile/mstile-144.png">
<meta name="msapplication-config" content="/browserconfig.xml">`;
  
  try {
    await fs.writeFile(snippetPath, snippet);
    console.log(`${GREEN}✓ Generated:${RESET} favicon-meta.html`);
    console.log(`${YELLOW}ℹ️ Add the contents of favicon-meta.html to your layout.tsx head section${RESET}`);
    return true;
  } catch (error) {
    console.error(`${RED}Error generating HTML snippet:${RESET}`, error);
    return false;
  }
}

/**
 * Generate site.webmanifest file for PWA support
 */
async function generateWebManifest() {
  const manifestPath = path.join(OUTPUT_DIR, 'site.webmanifest');
  
  const manifest = {
    name: "Bridging Trust AI",
    short_name: "BTAI",
    icons: [
      {
        src: "/icons/android-chrome/android-chrome-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icons/android-chrome/android-chrome-512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone"
  };
  
  try {
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`${GREEN}✓ Generated:${RESET} site.webmanifest`);
    return true;
  } catch (error) {
    console.error(`${RED}Error generating webmanifest:${RESET}`, error);
    return false;
  }
}

/**
 * Generate browserconfig.xml file for Microsoft browsers
 */
async function generateBrowserConfig() {
  const configPath = path.join(OUTPUT_DIR, 'browserconfig.xml');
  
  const config = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square70x70logo src="/icons/mstile/mstile-70.png"/>
      <square150x150logo src="/icons/mstile/mstile-150.png"/>
      <square310x310logo src="/icons/mstile/mstile-310.png"/>
      <TileColor>#ffffff</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
  
  try {
    await fs.writeFile(configPath, config);
    console.log(`${GREEN}✓ Generated:${RESET} browserconfig.xml`);
    return true;
  } catch (error) {
    console.error(`${RED}Error generating browserconfig.xml:${RESET}`, error);
    return false;
  }
}

/**
 * Main function to generate all favicons
 */
async function main() {
  console.log(`${YELLOW}Starting favicon generation from ${LOGO_PATH}${RESET}`);
  
  try {
    // Check if the logo file exists
    await fs.access(LOGO_PATH);
  } catch (error) {
    console.error(`${RED}Error: Logo file not found at ${LOGO_PATH}${RESET}`);
    process.exit(1);
  }
  
  // Create necessary directories
  await ensureDirectories();
  
  // Generate standard favicons
  for (const size of FAVICON_SIZES) {
    await generateIcon(
      LOGO_PATH, 
      path.join(OUTPUT_DIR, `icons/favicon-${size}.png`), 
      size
    );
  }
  
  // Generate Apple Touch Icons (with slight padding)
  for (const size of APPLE_ICON_SIZES) {
    await generateIcon(
      LOGO_PATH,
      path.join(OUTPUT_DIR, `icons/apple-touch-icon/apple-touch-icon-${size}.png`),
      size,
      Math.floor(size * 0.1) // 10% padding
    );
  }
  
  // Generate Android Chrome Icons
  for (const size of ANDROID_ICON_SIZES) {
    await generateIcon(
      LOGO_PATH,
      path.join(OUTPUT_DIR, `icons/android-chrome/android-chrome-${size}.png`),
      size
    );
  }
  
  // Generate Microsoft Tiles
  for (const size of MS_ICON_SIZES) {
    await generateIcon(
      LOGO_PATH,
      path.join(OUTPUT_DIR, `icons/mstile/mstile-${size}.png`),
      size
    );
  }
  
  // Generate ICO file
  await generateIco();
  
  // Generate manifest and config files
  await generateWebManifest();
  await generateBrowserConfig();
  
  // Generate HTML snippet
  await generateHtmlSnippet();
  
  console.log(`${GREEN}✅ Favicon generation complete${RESET}`);
}

// Run the script
main().catch(error => {
  console.error(`${RED}An error occurred:${RESET}`, error);
  process.exit(1);
}); 