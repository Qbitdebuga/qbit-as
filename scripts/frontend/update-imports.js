#!/usr/bin/env node

/**
 * Updates imports in the Next.js app to use the @/ alias instead of relative paths
 * 
 * This script scans all .ts and .tsx files in the apps/web/src directory
 * and replaces relative imports (../) with the @/ alias.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get project root directory
const projectRoot = path.resolve(__dirname, '../..');
const webAppSrc = path.join(projectRoot, 'apps/web/src');

// Count updated files
let updatedFiles = 0;
let scannedFiles = 0;

/**
 * Find all .ts and .tsx files recursively
 * @param {string} dir Directory to search
 * @returns {string[]} Array of file paths
 */
function findTsFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    if (item.isDirectory()) {
      results = results.concat(findTsFiles(path.join(dir, item.name)));
    } else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
      results.push(path.join(dir, item.name));
    }
  }

  return results;
}

/**
 * Update imports in the file
 * @param {string} filePath Path to the file
 */
function updateImports(filePath) {
  scannedFiles++;
  let content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(webAppSrc, filePath);
  const dir = path.dirname(relativePath);
  
  // Calculate the depth of nesting
  const depth = dir.split(path.sep).length;
  
  // Create regex patterns for the different levels of relative imports
  const patterns = [];
  for (let i = 1; i <= depth; i++) {
    const prefix = '../'.repeat(i);
    patterns.push({ 
      regex: new RegExp(`from ['"]${prefix}(?!../|\\.)([^'"]+)['"]`, 'g'),
      replacement: `from '@/$1'` 
    });
  }
  
  let originalContent = content;
  
  // Apply each pattern
  for (const pattern of patterns) {
    content = content.replace(pattern.regex, pattern.replacement);
  }
  
  // Write back if changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated imports in ${relativePath}`);
    updatedFiles++;
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Scanning for TypeScript files in apps/web/src...');
  const files = findTsFiles(webAppSrc);
  console.log(`Found ${files.length} TypeScript files`);
  
  for (const file of files) {
    updateImports(file);
  }
  
  console.log('\n========== Summary ==========');
  console.log(`Total files scanned: ${scannedFiles}`);
  console.log(`Files updated: ${updatedFiles}`);
  console.log('============================\n');
  
  if (updatedFiles > 0) {
    console.log('✨ Successfully updated imports to use @/ alias');
  } else {
    console.log('ℹ️ No imports needed to be updated');
  }
}

main(); 