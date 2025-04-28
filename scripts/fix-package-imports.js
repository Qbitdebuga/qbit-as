#!/usr/bin/env node

/**
 * Fix Package Imports Script
 * 
 * This script finds and replaces package imports with local mocks
 * to fix build errors in the Next.js app.
 */

const fs = require('fs');
const path = require('path');

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
 * Replace package imports with local mocks
 * @param {string} filePath - Path to the file
 */
function fixImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Get relative path from file to src directory
    const fileDir = path.dirname(filePath);
    const relativeToSrc = path.relative(fileDir, SRC_DIR).replace(/\\/g, '/');
    
    // Replace package imports with our mock versions
    const newContent = content
      .replace(
        /from ['"]@qbit\/api-client['"]/g,
        (match) => {
          modified = true;
          return `from '${relativeToSrc}/mocks/api-client'`;
        }
      )
      .replace(
        /from ['"]@qbit\/shared-types['"]/g,
        (match) => {
          modified = true;
          return `from '${relativeToSrc}/mocks/shared-types'`;
        }
      )
      .replace(
        /from ['"]@qbit-accounting\/api-client['"]/g,
        (match) => {
          modified = true;
          return `from '${relativeToSrc}/mocks/api-client'`;
        }
      )
      .replace(
        /from ['"]@qbit-accounting\/shared-types['"]/g,
        (match) => {
          modified = true;
          return `from '${relativeToSrc}/mocks/shared-types'`;
        }
      );
    
    // Only write if changes were made
    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Fixed package imports in: ${path.relative(WEB_APP_DIR, filePath)}`);
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
  console.log('🔍 Scanning for files with package imports...');
  
  // Get all TSX files in the app directory
  const tsxFiles = getAllFiles(APP_DIR);
  console.log(`Found ${tsxFiles.length} TSX files in the app directory.`);
  
  // Process each file
  tsxFiles.forEach(file => {
    fixImports(file);
  });
  
  console.log(`\n✨ Done! Updated imports in ${filesModified} files.`);
  
  // Suggest next steps
  console.log('\n📋 Next steps:');
  console.log('1. Run "cd apps/web && yarn build" to check if build issues are resolved');
  console.log('2. You may need to create placeholder components for other pages that still have errors');
}

// Run the script
main(); 