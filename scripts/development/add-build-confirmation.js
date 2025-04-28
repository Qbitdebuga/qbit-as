#!/usr/bin/env node

/**
 * Add Build Confirmation Messages
 * 
 * This script updates package.json files across all services and packages
 * to add a success message after build completion.
 * 
 * Usage:
 * ```
 * node scripts/development/add-build-confirmation.js
 * ```
 */

const fs = require('fs');
const path = require('path');

// Root directory of the project
const ROOT_DIR = path.resolve(__dirname, '../..');

// Directories to search for package.json files
const SERVICES_DIR = path.join(ROOT_DIR, 'services');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');
const APPS_DIR = path.join(ROOT_DIR, 'apps');

// Counter for updated files
let updatedFiles = 0;
let skippedFiles = 0;

/**
 * Reads a package.json file and returns its contents
 * @param {string} packagePath - Path to the package.json file
 * @returns {Object|null} - The parsed package.json or null if not found
 */
function readPackageJson(packagePath) {
  try {
    const content = fs.readFileSync(packagePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${packagePath}: ${error.message}`);
    return null;
  }
}

/**
 * Updates the build script in a package.json file to add success message
 * @param {Object} packageJson - The package.json contents
 * @returns {boolean} - Whether the package.json was updated
 */
function updateBuildScript(packageJson) {
  if (!packageJson.scripts || !packageJson.scripts.build) {
    return false;
  }

  const originalBuild = packageJson.scripts.build;
  const packageName = packageJson.name || "package";
  
  // Skip if it already has a success message
  if (originalBuild.includes('echo') && 
      (originalBuild.includes('build completed successfully') || 
       originalBuild.includes('✅') || 
       originalBuild.includes('success'))) {
    console.log('  - Build script already has success message, skipping');
    return false;
  }

  // Add success message with checkmark and package name
  packageJson.scripts.build = `${originalBuild} && echo "✅ ${packageName} build completed successfully"`;
  console.log(`  - Updated build script: "${packageJson.scripts.build}"`);
  return true;
}

/**
 * Writes updated package.json back to file
 * @param {string} packagePath - Path to the package.json file
 * @param {Object} packageJson - The updated package.json contents
 */
function writePackageJson(packagePath, packageJson) {
  try {
    fs.writeFileSync(
      packagePath, 
      JSON.stringify(packageJson, null, 2) + '\n',
      'utf8'
    );
    console.log(`  - Successfully wrote changes to ${packagePath}`);
    updatedFiles++;
  } catch (error) {
    console.error(`  - Error writing to ${packagePath}: ${error.message}`);
  }
}

/**
 * Process a directory to find package.json files
 * @param {string} directory - Directory to search in
 */
function processDirectory(directory) {
  if (!fs.existsSync(directory)) {
    console.log(`Directory ${directory} does not exist, skipping`);
    return;
  }

  const dirs = fs.readdirSync(directory, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const dir of dirs) {
    const dirPath = path.join(directory, dir);
    const packagePath = path.join(dirPath, 'package.json');
    
    if (fs.existsSync(packagePath)) {
      console.log(`\nProcessing ${packagePath}`);
      const packageJson = readPackageJson(packagePath);
      
      if (packageJson) {
        if (updateBuildScript(packageJson)) {
          writePackageJson(packagePath, packageJson);
        } else {
          console.log('  - No changes needed');
          skippedFiles++;
        }
      }
    }
  }
}

/**
 * Main function to execute the script
 */
function main() {
  console.log('Adding build confirmation messages to all workspaces...\n');
  
  // Process services directory
  console.log('Processing services directory...');
  processDirectory(SERVICES_DIR);
  
  // Process packages directory
  console.log('\nProcessing packages directory...');
  processDirectory(PACKAGES_DIR);
  
  // Process apps directory
  console.log('\nProcessing apps directory...');
  processDirectory(APPS_DIR);
  
  console.log(`\nSummary: ${updatedFiles} package.json files updated, ${skippedFiles} files unchanged.`);
}

// Execute the script
main(); 