#!/usr/bin/env node

/**
 * Standardize Build Scripts
 * 
 * This script updates package.json files across all services and packages
 * to standardize build scripts with appropriate cleanup using rimraf.
 * 
 * Usage:
 * ```
 * node scripts/development/standardize-build-scripts.js
 * ```
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Root directory of the project
const ROOT_DIR = path.resolve(__dirname, '../..');

// Directories to search for package.json files
const SERVICES_DIR = path.join(ROOT_DIR, 'services');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');

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
 * Updates the build script in a package.json file
 * @param {Object} packageJson - The package.json contents
 * @returns {boolean} - Whether the package.json was updated
 */
function updateBuildScript(packageJson) {
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  const originalBuild = packageJson.scripts.build;
  let updated = false;

  // If build script exists but doesn't include rimraf
  if (originalBuild && !originalBuild.includes('rimraf')) {
    // Check if there's a prebuild script with rimraf
    const hasPrebuildRimraf = packageJson.scripts.prebuild && 
                             packageJson.scripts.prebuild.includes('rimraf');
    
    if (hasPrebuildRimraf) {
      // Keep prebuild with rimraf and don't modify build
      console.log('  - Already has prebuild with rimraf, keeping as is');
    } else {
      // Add rimraf to the build script
      packageJson.scripts.build = `rimraf dist && ${originalBuild}`;
      console.log(`  - Updated build script: "${packageJson.scripts.build}"`);
      updated = true;
    }
  } 
  // If build script doesn't exist but package has main/types fields
  else if (!originalBuild && (packageJson.main || packageJson.types)) {
    packageJson.scripts.build = 'rimraf dist && tsc';
    console.log(`  - Added build script: "${packageJson.scripts.build}"`);
    updated = true;
  }
  // If there's already a rimraf in the build script
  else if (originalBuild && originalBuild.includes('rimraf')) {
    console.log('  - Build script already includes rimraf, no changes needed');
  }
  // If no build script and no main/types fields
  else if (!originalBuild) {
    console.log('  - No build script and no main/types fields, skipping');
  }

  // Make sure rimraf is in devDependencies if we're using it
  if (updated || (packageJson.scripts.build && packageJson.scripts.build.includes('rimraf'))) {
    ensureRimrafDependency(packageJson);
  }

  return updated;
}

/**
 * Ensures rimraf is in devDependencies
 * @param {Object} packageJson - The package.json contents
 */
function ensureRimrafDependency(packageJson) {
  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {};
  }
  
  // Add or update rimraf in devDependencies if not present or outdated
  if (!packageJson.devDependencies.rimraf || 
      packageJson.devDependencies.rimraf !== '^5.0.5') {
    packageJson.devDependencies.rimraf = '^5.0.5';
    console.log('  - Added/updated rimraf dependency to ^5.0.5');
  }
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
  console.log('Standardizing build scripts across services and packages...\n');
  
  // Process services directory
  console.log('Processing services directory...');
  processDirectory(SERVICES_DIR);
  
  // Process packages directory
  console.log('\nProcessing packages directory...');
  processDirectory(PACKAGES_DIR);
  
  console.log(`\nSummary: ${updatedFiles} package.json files updated, ${skippedFiles} files unchanged.`);
  
  if (updatedFiles > 0) {
    console.log('\nNext steps:');
    console.log('1. Run yarn install to update dependencies');
    console.log('2. Verify builds work with the updated scripts');
    console.log('3. Run tests to ensure no regressions');
  }
}

// Execute the script
main(); 