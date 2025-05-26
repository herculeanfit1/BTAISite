#!/usr/bin/env node

/**
 * This script fixes remaining syntax errors in SimpleGlobe.tsx and contact/route.ts
 * It focuses on direct fixes for the specific problems in these files
 */

import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

// Files to process
const FILES_TO_FIX = [
  'app/components/globe/SimpleGlobe.tsx',
  'app/api/contact/route.ts'
];

// Process SimpleGlobe.tsx
function fixSimpleGlobe() {
  console.log('Fixing SimpleGlobe.tsx...');
  
  const filePath = path.join(process.cwd(), 'app/components/globe/SimpleGlobe.tsx');
  let content = readFileSync(filePath, 'utf8');
  
  // Fix the Vector3[] type declaration that has malformed syntax
  content = content.replace(
    /const newPoints: THREE\.\(Object\.prototype\.hasOwnProperty\.call\(Vector3, \[\]\) \? .*? : undefined\);/g,
    'const newPoints: THREE.Vector3[] = [];'
  );
  
  // Fix any remaining Object.prototype.hasOwnProperty.call patterns
  content = content.replace(
    /\(Object\.prototype\.hasOwnProperty\.call\(([^,]+), ([^)]+)\) \? ([^:]+) : undefined\)/g,
    '$1[$2]'
  );
  
  // Write the changes back
  writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed SimpleGlobe.tsx');
}

// Process contact/route.ts
function fixContactRoute() {
  console.log('Fixing contact/route.ts...');
  
  const filePath = path.join(process.cwd(), 'app/api/contact/route.ts');
  let content = readFileSync(filePath, 'utf8');
  
  // Fix Object.prototype.hasOwnProperty.call in the HONEYPOT_FIELDS.some() function
  content = content.replace(
    /const value = result\.\(Object\.prototype\.hasOwnProperty\.call\(data, fieldName\) \? .*? : undefined\);/g,
    'const value = result.data[fieldName];'
  );
  
  content = content.replace(
    /HONEYPOT_FIELDS\.some\(\(field\) => \{\s*\/\/ Use safe property access via type checking\s*const fieldName = field as keyof ContactFormData;\s*const value = .*?;/g,
    'HONEYPOT_FIELDS.some((field) => {\n      // Use safe property access via type checking\n      const fieldName = field as keyof ContactFormData;\n      const value = result.data[fieldName];'
  );
  
  // Fix any other Object.prototype.hasOwnProperty.call patterns
  content = content.replace(
    /\(Object\.prototype\.hasOwnProperty\.call\(([^,]+), ([^)]+)\) \? ([^:]+) : undefined\)/g,
    '$1[$2]'
  );
  
  // Write the changes back
  writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed contact/route.ts');
}

// Main function
const main = () => {
  try {
    console.log('🔧 Starting fix for remaining syntax errors...');
    
    // Fix each file
    fixSimpleGlobe();
    fixContactRoute();
    
    console.log('✅ All remaining syntax errors fixed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

main(); 