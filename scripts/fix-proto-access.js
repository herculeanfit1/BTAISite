#!/usr/bin/env node

/**
 * This script fixes the anti-pattern of using Object.prototype.hasOwnProperty.call()
 * by replacing those occurrences with direct property access with appropriate null/undefined checks
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

// Files to process
const FILE_PATTERNS = [
  'app/api/contact/route.ts',
  'app/api/newsletter/route.ts',
  'app/components/globe/SimpleGlobe.tsx',
  'app/components/PricingTable.tsx',
  'app/components/SchemaOrg.tsx',
  'app/components/streaming/StreamingDashboard.tsx',
  'app/components/BlogSearch.tsx'
];

// Find all matching files
const findFiles = async () => {
  const files = [];
  for (const pattern of FILE_PATTERNS) {
    const matches = await glob(pattern);
    files.push(...matches);
  }
  return files;
};

// Process each file
const processFile = (filePath) => {
  console.log(`Processing ${filePath}...`);
  
  let content = readFileSync(filePath, 'utf8');
  
  // Simple fix for result.data access in route handlers
  if (filePath.includes('route.ts')) {
    content = content.replace(
      /const value = result\.\(Object\.prototype\.hasOwnProperty\.call\(data, fieldName\) \? .*? : undefined\);/g,
      'const value = result.data[fieldName];'
    );
    
    // Fix for ipSubmissions.get/set in contact route
    content = content.replace(
      /const submissions = ipSubmissions\.get\(ip\) \|\| \[\];/g,
      'const submissions = ipSubmissions.get(ip) || [];'
    );
    
    content = content.replace(
      /ipSubmissions\.set\(ip, filteredSubmissions\);/g,
      'ipSubmissions.set(ip, filteredSubmissions);'
    );
    
    // Fix Object.prototype.hasOwnProperty patterns in conditionals
    content = content.replace(
      /\(Object\.prototype\.hasOwnProperty\.call\(([^,]+), ([^)]+)\) \? ([^:]+) : undefined\)(?: = |\.)([^;]+);/g,
      '$3$4;'
    );
    
    content = content.replace(
      /if \(!\(Object\.prototype\.hasOwnProperty\.call\(([^,]+), ([^)]+)\) \? ([^:]+) : undefined\)\) \{/g,
      'if (!$3) {'
    );
  }
  
  // Fix for THREE.Vector3[] type in SimpleGlobe
  if (filePath.includes('SimpleGlobe.tsx')) {
    content = content.replace(
      /const newPoints: THREE\.\(Object\.prototype\.hasOwnProperty\.call\(Vector3, \] = \[\) \? .*? : undefined\);/g,
      'const newPoints: THREE.Vector3[] = [];'
    );
    
    content = content.replace(
      /newPoints\.push\(\(Object\.prototype\.hasOwnProperty\.call\(points, index\) \? .*? : undefined\)\);/g,
      'newPoints.push(points[index]);'
    );
  }
  
  // Fix for PricingTable features type
  if (filePath.includes('PricingTable.tsx')) {
    content = content.replace(
      /features: \(Object\.prototype\.hasOwnProperty\.call\(string, \] \| Feature\[\) \? .*? : undefined\);/g,
      'features: string[] | Feature[];'
    );
  }
  
  // Fix for SchemaOrg sameAs type
  if (filePath.includes('SchemaOrg.tsx')) {
    content = content.replace(
      /const sameAs: \(Object\.prototype\.hasOwnProperty\.call\(string, \] = \[\) \? .*? : undefined\);/g,
      'const sameAs: string[] = [];'
    );
  }
  
  // Fix for StreamingDashboard label access
  if (filePath.includes('StreamingDashboard.tsx')) {
    content = content.replace(
      /\? performanceData\.\(Object\.prototype\.hasOwnProperty\.call\(labels, index\) \? .*? : undefined\)/g,
      '? performanceData.labels[index]'
    );
  }
  
  // Fix for BlogSearch state types
  if (filePath.includes('BlogSearch.tsx')) {
    content = content.replace(
      /const \[categories, setCategories\] = useState<\(Object\.prototype\.hasOwnProperty\.call\(string, \]>\(.*?\);/g,
      'const [categories, setCategories] = useState<string[]>(["All"]);'
    );
    
    content = content.replace(
      /const \[tags, setTags\] = useState<\(Object\.prototype\.hasOwnProperty\.call\(string, \]>\(.*?\);/g,
      'const [tags, setTags] = useState<string[]>(["All"]);'
    );
  }
  
  // Write the changes back
  writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed ${filePath}`);
};

// Main function
const main = async () => {
  try {
    console.log('🔍 Finding files...');
    const files = await findFiles();
    
    if (files.length === 0) {
      console.log('No files found matching the specified patterns.');
      return;
    }
    
    console.log(`Found ${files.length} files to process.`);
    
    // Process each file
    for (const file of files) {
      processFile(file);
    }
    
    console.log('✅ All files processed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

main(); 