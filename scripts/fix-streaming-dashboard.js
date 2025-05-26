#!/usr/bin/env node

/**
 * This script fixes the StreamingDashboard.tsx file
 * which has a parsing error.
 */

import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

// Process StreamingDashboard.tsx
function fixStreamingDashboard() {
  console.log('Fixing StreamingDashboard.tsx...');
  
  const filePath = path.join(process.cwd(), 'app/components/streaming/StreamingDashboard.tsx');
  let content = readFileSync(filePath, 'utf8');
  
  // Look through the file line by line to identify the exact issue
  const lines = content.split('\n');
  let lineWithError = '';
  
  for (let i = 165; i < 175; i++) {
    console.log(`Line ${i}: ${lines[i]}`);
    if (lines[i] && lines[i].includes('performanceData.')) {
      lineWithError = lines[i];
      console.log(`Found potential error on line ${i}: ${lineWithError}`);
    }
  }
  
  // Fix the common error with Object.prototype.hasOwnProperty.call
  content = content.replace(
    /\? performanceData\.\(Object\.prototype\.hasOwnProperty\.call\(labels, index\) \? .*? : undefined\)/g,
    '? performanceData.labels[index]'
  );
  
  // Fix any other similar syntax issues
  content = content.replace(
    /\(Object\.prototype\.hasOwnProperty\.call\(([^,]+), ([^)]+)\) \? ([^:]+) : undefined\)/g,
    '$1[$2]'
  );
  
  // Write the fixed content back to the file
  writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed StreamingDashboard.tsx');
}

// Main function
const main = () => {
  try {
    console.log('🔧 Starting fix for StreamingDashboard.tsx...');
    fixStreamingDashboard();
    console.log('✅ Fix completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

main(); 