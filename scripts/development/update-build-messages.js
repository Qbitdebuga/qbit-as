#!/usr/bin/env node

/**
 * Update Build Messages
 * 
 * This script updates package.json files across all services and packages
 * to use a standardized build completion message format with checkmark.
 * 
 * Usage:
 * ```
 * node scripts/development/update-build-messages.js
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
 * Updates the build script in a package.json file to use the standardized format
 * @param {Object} packageJson - The package.json contents
 * @returns {boolean} - Whether the package.json was updated
 */
function updateBuildScript(packageJson) {
  if (!packageJson.scripts || !packageJson.scripts.build) {
    return false;
  }

  const buildScript = packageJson.scripts.build;
  const packageName = packageJson.name || 'package';
  
  // Only update if there's an echo command
  if (!buildScript.includes('echo')) {
    console.log('  - No echo command in build script, skipping');
    return false;
  }
  
  // Check if the format already matches exactly what we want
  if (buildScript.includes(`echo "✅ ${packageName} build completed successfully"`)) {
    console.log('  - Build script already has the exact format we want, skipping');
    return false;
  }
  
  // Extract the main build command (everything before the echo)
  const mainCommand = buildScript.split('&&')[0].trim();
  
  // Create the updated build script
  const updatedScript = `${mainCommand} && echo "✅ ${packageName} build completed successfully"`;
  
  // Only update if something changed
  if (updatedScript === buildScript) {
    console.log('  - No changes needed');
    return false;
  }
  
  // Update the build script
  packageJson.scripts.build = updatedScript;
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
  console.log('Updating build message format to use checkmark and package name...\n');
  
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