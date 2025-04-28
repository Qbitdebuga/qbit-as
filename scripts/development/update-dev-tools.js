#!/usr/bin/env node

/**
 * Script to standardize development tools across all services.
 * 
 * This script updates:
 * - typescript: Standardize to 5.4.5
 * - eslint: Update to 8.57.0 
 * - jest: Standardize to 29.7.0
 * - prettier: Update to 3.2.5
 */

const fs = require('fs');
const path = require('path');

// Configuration for updates
const DEV_TOOL_UPDATES = {
  'typescript': '^5.4.5',
  'eslint': '^8.57.0',
  'jest': '^29.7.0',
  'prettier': '^3.2.5',
  '@types/jest': '^29.5.12',
  'ts-jest': '^29.1.2',
};

// Path to the root directory
const ROOT_DIR = path.join(__dirname, '../..');
const SERVICES_DIR = path.join(ROOT_DIR, 'services');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');
const APPS_DIR = path.join(ROOT_DIR, 'apps');

// Function to update package.json
function updatePackageJson(packageJsonPath) {
  if (!fs.existsSync(packageJsonPath)) {
    console.warn(`No package.json found at ${packageJsonPath}`);
    return false;
  }
  
  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  let updated = false;
  
  // Update devDependencies
  if (packageJson.devDependencies) {
    for (const [pkg, version] of Object.entries(DEV_TOOL_UPDATES)) {
      if (packageJson.devDependencies[pkg]) {
        // Only log if actually changing the version
        if (packageJson.devDependencies[pkg] !== version) {
          console.log(`Updating ${pkg} from ${packageJson.devDependencies[pkg]} to ${version}`);
          packageJson.devDependencies[pkg] = version;
          updated = true;
        }
      }
    }
  }
  
  if (updated) {
    // Write updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`Updated development tools in ${packageJsonPath}`);
    return true;
  } else {
    console.log(`No updates needed in ${packageJsonPath}`);
    return false;
  }
}

// Function to get all directories
function getDirs(baseDir) {
  try {
    return fs.readdirSync(baseDir)
      .filter(file => fs.statSync(path.join(baseDir, file)).isDirectory())
      .map(dir => path.join(baseDir, dir));
  } catch (error) {
    console.error(`Error reading directory ${baseDir}:`, error.message);
    return [];
  }
}

// Main function
function main() {
  console.log('Standardizing development tools across all services...');
  
  let updatedCount = 0;
  
  // Update root package.json
  const rootPackageJsonPath = path.join(ROOT_DIR, 'package.json');
  if (updatePackageJson(rootPackageJsonPath)) {
    updatedCount++;
  }
  
  // Update service package.json files
  const serviceDirs = getDirs(SERVICES_DIR);
  for (const serviceDir of serviceDirs) {
    const packageJsonPath = path.join(serviceDir, 'package.json');
    if (updatePackageJson(packageJsonPath)) {
      updatedCount++;
    }
  }
  
  // Update package package.json files
  const packageDirs = getDirs(PACKAGES_DIR);
  for (const packageDir of packageDirs) {
    const packageJsonPath = path.join(packageDir, 'package.json');
    if (updatePackageJson(packageJsonPath)) {
      updatedCount++;
    }
  }
  
  // Update apps package.json files
  const appDirs = getDirs(APPS_DIR);
  for (const appDir of appDirs) {
    const packageJsonPath = path.join(appDir, 'package.json');
    if (updatePackageJson(packageJsonPath)) {
      updatedCount++;
    }
  }
  
  console.log(`\nSummary: Updated development tools in ${updatedCount} package.json files.`);
  console.log('Next steps:');
  console.log('1. Run "yarn install" to update the yarn.lock file');
  console.log('2. Update tsconfig.json files to ensure compatibility with the new TypeScript version');
  console.log('3. Update .eslintrc.js and .prettierrc for consistency');
  console.log('4. Run linting and formatting to verify the changes');
  console.log('5. Fix any type errors that arise');
}

main(); 