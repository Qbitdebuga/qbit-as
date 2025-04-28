#!/usr/bin/env node

/**
 * Verify Builds Script
 * 
 * This script runs the build command for each package and service
 * to verify that the standardized build scripts work correctly.
 * 
 * Usage:
 * ```
 * node scripts/development/verify-builds.js
 * ```
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Root directory of the project
const ROOT_DIR = path.resolve(__dirname, '../..');

// Directories to search for package.json files
const SERVICES_DIR = path.join(ROOT_DIR, 'services');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');

// Counter for successful and failed builds
let successfulBuilds = 0;
let failedBuilds = 0;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

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
 * Checks if a package has a build script
 * @param {string} packagePath - Path to the package.json file
 * @returns {boolean} - Whether the package has a build script
 */
function hasBuildScript(packagePath) {
  const packageJson = readPackageJson(packagePath);
  return packageJson && 
         packageJson.scripts && 
         packageJson.scripts.build;
}

/**
 * Runs the build command for a package
 * @param {string} packageDir - Directory of the package
 * @param {string} packageName - Name of the package for display
 */
function runBuild(packageDir, packageName) {
  try {
    console.log(`\n${colors.blue}Building ${packageName}...${colors.reset}`);
    
    // Clean any existing dist directory first
    const distDir = path.join(packageDir, 'dist');
    if (fs.existsSync(distDir)) {
      try {
        console.log(`${colors.yellow}Cleaning existing dist directory...${colors.reset}`);
        fs.rmSync(distDir, { recursive: true, force: true });
      } catch (cleanError) {
        console.error(`${colors.yellow}Warning: Could not clean dist directory: ${cleanError.message}${colors.reset}`);
      }
    }
    
    // Run the build command
    execSync('yarn build', {
      cwd: packageDir,
      stdio: 'inherit'
    });
    
    // Verify the dist directory exists after the build
    if (fs.existsSync(distDir) && fs.readdirSync(distDir).length > 0) {
      console.log(`${colors.green}✓ Build successful for ${packageName}${colors.reset}`);
      successfulBuilds++;
    } else {
      console.error(`${colors.red}✗ Build completed but no dist directory or empty dist directory for ${packageName}${colors.reset}`);
      failedBuilds++;
    }
  } catch (error) {
    console.error(`${colors.red}✗ Build failed for ${packageName}: ${error.message}${colors.reset}`);
    failedBuilds++;
  }
}

/**
 * Process a directory to find package.json files
 * @param {string} directory - Directory to search in
 * @param {string} type - Type of directory (packages or services)
 */
function processDirectory(directory, type) {
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
    
    if (fs.existsSync(packagePath) && hasBuildScript(packagePath)) {
      const packageName = `${type}/${dir}`;
      runBuild(dirPath, packageName);
    }
  }
}

/**
 * Main function to execute the script
 */
function main() {
  console.log(`${colors.blue}Verifying builds for all packages and services...\n${colors.reset}`);
  
  // Process packages directory first (as services might depend on packages)
  console.log(`${colors.blue}Processing packages...${colors.reset}`);
  processDirectory(PACKAGES_DIR, 'packages');
  
  // Process services directory
  console.log(`\n${colors.blue}Processing services...${colors.reset}`);
  processDirectory(SERVICES_DIR, 'services');
  
  // Print summary
  console.log(`\n${colors.blue}Build Summary:${colors.reset}`);
  console.log(`${colors.green}✓ Successfully built: ${successfulBuilds}${colors.reset}`);
  if (failedBuilds > 0) {
    console.log(`${colors.red}✗ Failed builds: ${failedBuilds}${colors.reset}`);
  }
}

// Execute the script
main(); 