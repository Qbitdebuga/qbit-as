#!/usr/bin/env node

/**
 * Fix Import Paths Script
 * 
 * This script finds and replaces all @/ import paths with relative paths
 * to fix build errors in the Next.js app.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Root directory of the web app
const WEB_APP_DIR = path.resolve(__dirname, '../apps/web');
const SRC_DIR = path.join(WEB_APP_DIR, 'src');
const APP_DIR = path.join(SRC_DIR, 'app');

// Count files updated
let filesModified = 0;

/**
 * Recursively get all files in a directory
 * @param {string} dir - Directory to scan
 * @param {string[]} fileList - List to append files to
 * @param {string} ext - File extension to filter by
 * @returns {string[]} - List of file paths
 */
function getAllFiles(dir, fileList = [], ext = '.tsx') {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fileList = getAllFiles(filePath, fileList, ext);
    } else if (path.extname(file) === ext) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Replace @/ imports with relative path imports
 * @param {string} filePath - Path to the file
 * @param {string} srcDir - Source directory (base for @/ imports)
 */
function fixImports(filePath, srcDir) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Get relative path from file to src directory
    const relativePath = path.relative(path.dirname(filePath), srcDir)
      .replace(/\\/g, '/'); // Normalize path separators for Windows
    
    // Replace @/ imports with relative paths
    const newContent = content.replace(
      /from ['"]@\/([^'"]+)['"]/g, 
      (match, importPath) => {
        modified = true;
        return `from '${relativePath}/${importPath}'`;
      }
    );
    
    // Only write if changes were made
    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Fixed imports in: ${path.relative(WEB_APP_DIR, filePath)}`);
      filesModified++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
  }
}

/**
 * Main function to execute the script
 */
function main() {
  console.log('🔍 Scanning for files with @/ imports...');
  
  // Get all TSX files in the app directory
  const tsxFiles = getAllFiles(APP_DIR);
  console.log(`Found ${tsxFiles.length} TSX files in the app directory.`);
  
  // Process each file
  tsxFiles.forEach(file => {
    fixImports(file, SRC_DIR);
  });
  
  console.log(`\n✨ Done! Updated imports in ${filesModified} files.`);
  
  // Suggest next steps
  console.log('\n📋 Next steps:');
  console.log('1. Run "cd apps/web && yarn build" to check if build issues are resolved');
  console.log('2. You may need to create placeholder components for pages that still have errors');
}

// Run the script
main(); 