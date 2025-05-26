/**
 * Image optimization script for static export
 * 
 * This script optimizes images in the public directory for better performance
 * since Next.js Image Optimization is not available in static exports
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cwd = process.cwd();

// Ensure Sharp is installed
try {
  await import('sharp');
  console.log('✅ Sharp is already installed');
} catch (error) {
  console.log('📦 Installing Sharp...');
  execSync('npm install --save-dev sharp', { stdio: 'inherit' });
  console.log('✅ Sharp installed successfully');
}

// Get all image files in the public directory
console.log('🔍 Finding images to optimize...');
const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const imagesDir = path.join(cwd, 'public');
const outDir = path.join(cwd, 'out');

// Helper function to find all image files in a directory recursively
function findImageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findImageFiles(filePath, fileList);
    } else if (imageExtensions.includes(path.extname(file).toLowerCase())) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

const publicImageFiles = findImageFiles(imagesDir);
const outImageFiles = fs.existsSync(outDir) ? findImageFiles(outDir) : [];
const imageFiles = [...publicImageFiles, ...outImageFiles];

console.log(`🖼️ Found ${imageFiles.length} images to optimize`);

// Create directory for optimized images
const optimizedDir = path.join(cwd, 'out', 'optimized');
if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true });
}

// Import Sharp for image processing
const sharp = await import('sharp');

// Track optimization statistics
let totalOriginalSize = 0;
let totalOptimizedSize = 0;
let optimizedCount = 0;
let errorCount = 0;

// Process each image
async function optimizeImages() {
  console.log('⚙️ Starting image optimization...');
  
  for (const imagePath of imageFiles) {
    const isPublicImage = imagePath.includes('/public/');
    const relativePath = isPublicImage 
      ? path.relative(imagesDir, imagePath)
      : path.relative(outDir, imagePath);
    const outputPath = path.join(optimizedDir, relativePath);
    
    // Create output directory if it doesn't exist
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    try {
      // Get original file size
      const originalStat = fs.statSync(imagePath);
      totalOriginalSize += originalStat.size;
      
      // Skip SVG files (they're already optimized as vector graphics)
      if (path.extname(imagePath).toLowerCase() === '.svg') {
        // Just copy the SVG file
        fs.copyFileSync(imagePath, outputPath);
        const newStat = fs.statSync(outputPath);
        totalOptimizedSize += newStat.size;
        optimizedCount++;
        continue;
      }
      
      // Determine output format based on original
      const ext = path.extname(imagePath).toLowerCase();
      const format = ext === '.png' ? 'png' : 
                    ext === '.gif' ? 'gif' : 
                    ext === '.webp' ? 'webp' : 'jpeg';
      
      // Set up sharp pipeline
      const sharpInstance = sharp.default(imagePath);
      
      // Apply appropriate optimization based on format
      if (format === 'jpeg') {
        sharpInstance.jpeg({ quality: 80, mozjpeg: true });
      } else if (format === 'png') {
        sharpInstance.png({ quality: 80, compressionLevel: 9 });
      } else if (format === 'webp') {
        sharpInstance.webp({ quality: 80 });
      } else if (format === 'gif') {
        // For GIFs just copy as Sharp doesn't handle animated GIFs well
        fs.copyFileSync(imagePath, outputPath);
        const newStat = fs.statSync(outputPath);
        totalOptimizedSize += newStat.size;
        optimizedCount++;
        continue;
      }
      
      // Process and save the image
      await sharpInstance.toFile(outputPath);
      
      // Calculate new size
      const newStat = fs.statSync(outputPath);
      totalOptimizedSize += newStat.size;
      optimizedCount++;
      
      console.log(`✅ Optimized: ${relativePath}`);
    } catch (error) {
      console.error(`❌ Error optimizing ${relativePath}: ${error.message}`);
      errorCount++;
      
      // Copy the original file as fallback
      try {
        fs.copyFileSync(imagePath, outputPath);
        const newStat = fs.statSync(outputPath);
        totalOptimizedSize += newStat.size;
      } catch (copyError) {
        console.error(`  Failed to copy original: ${copyError.message}`);
      }
    }
  }
  
  // Calculate and display stats
  const savedBytes = totalOriginalSize - totalOptimizedSize;
  const savedPercentage = (savedBytes / totalOriginalSize) * 100;
  
  console.log('\n📊 Optimization Results:');
  console.log(`  Total images processed: ${imageFiles.length}`);
  console.log(`  Successfully optimized: ${optimizedCount}`);
  console.log(`  Errors encountered: ${errorCount}`);
  console.log(`  Original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Optimized size: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Space saved: ${(savedBytes / 1024 / 1024).toFixed(2)} MB (${savedPercentage.toFixed(2)}%)`);
  
  console.log('\n🔍 Next steps:');
  console.log('  1. Optimized images are available in out/optimized/');
  console.log('  2. Update your image paths to use these optimized versions');
  console.log('  3. Or copy the optimized images back to their original locations');
}

// Run the optimization
try {
  await optimizeImages();
} catch (error) {
  console.error('❌ Fatal error:', error);
  process.exit(1);
} 