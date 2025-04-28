#!/usr/bin/env node

/**
 * Script to check current versions of development tools across the project.
 * 
 * This script inspects package.json files and reports the current versions
 * of development tools like TypeScript, ESLint, Jest, and Prettier.
 */

const fs = require('fs');
const path = require('path');

// Target development tool packages to check
const DEV_TOOLS = [
  'typescript',
  'eslint',
  'jest',
  'prettier',
  'ts-jest',
  '@types/jest',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser'
];

// Path to the root directory
const ROOT_DIR = path.join(__dirname, '../..');
const SERVICES_DIR = path.join(ROOT_DIR, 'services');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');
const APPS_DIR = path.join(ROOT_DIR, 'apps');

// Store results
const results = {};

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

// Function to check package.json for dev dependencies
function checkPackageJson(dirPath) {
  const packageJsonPath = path.join(dirPath, 'package.json');
  
  try {
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const directoryName = path.basename(dirPath);
      const devDependencies = packageJson.devDependencies || {};
      const dependencies = packageJson.dependencies || {};
      
      // Get directory type (root, service, package, or app)
      let dirType = 'root';
      if (dirPath.includes(SERVICES_DIR)) {
        dirType = 'services';
      } else if (dirPath.includes(PACKAGES_DIR)) {
        dirType = 'packages';
      } else if (dirPath.includes(APPS_DIR)) {
        dirType = 'apps';
      }
      
      // Check each dev tool
      for (const tool of DEV_TOOLS) {
        const version = devDependencies[tool] || dependencies[tool];
        if (version) {
          if (!results[tool]) {
            results[tool] = [];
          }
          results[tool].push({
            directory: directoryName,
            type: dirType,
            version
          });
        }
      }
      
      return true;
    }
  } catch (error) {
    console.error(`Error reading package.json in ${dirPath}:`, error.message);
  }
  
  return false;
}

// Function to display results in a formatted table
function displayResults() {
  console.log('\n=== Development Tool Versions Across the Project ===\n');
  
  for (const tool of DEV_TOOLS) {
    if (results[tool] && results[tool].length > 0) {
      console.log(`\n${tool}:`);
      console.log('-'.repeat(80));
      console.log('| Directory'.padEnd(30) + '| Type'.padEnd(15) + '| Version'.padEnd(30) + '|');
      console.log('-'.repeat(80));
      
      // Group by version to detect inconsistencies
      const versionGroups = {};
      
      results[tool].forEach(entry => {
        console.log(`| ${entry.directory.padEnd(28)}| ${entry.type.padEnd(13)}| ${entry.version.padEnd(28)}|`);
        
        if (!versionGroups[entry.version]) {
          versionGroups[entry.version] = [];
        }
        versionGroups[entry.version].push(entry.directory);
      });
      
      console.log('-'.repeat(80));
      
      // Flag version inconsistencies
      const versions = Object.keys(versionGroups);
      if (versions.length > 1) {
        console.log(`\n⚠️ WARNING: ${tool} has ${versions.length} different versions:\n`);
        versions.forEach(version => {
          console.log(`  - ${version}: ${versionGroups[version].join(', ')}`);
        });
      }
    }
  }
  
  console.log('\n=== Summary ===\n');
  for (const tool of DEV_TOOLS) {
    if (results[tool] && results[tool].length > 0) {
      const versions = [...new Set(results[tool].map(entry => entry.version))];
      console.log(`${tool}: ${results[tool].length} locations, ${versions.length} unique versions`);
    } else {
      console.log(`${tool}: Not found`);
    }
  }
}

// Main function
function main() {
  console.log('Checking development tool versions across the project...');
  
  // Check root package.json
  checkPackageJson(ROOT_DIR);
  
  // Check service package.json files
  const serviceDirs = getDirs(SERVICES_DIR);
  for (const serviceDir of serviceDirs) {
    checkPackageJson(serviceDir);
  }
  
  // Check package package.json files
  const packageDirs = getDirs(PACKAGES_DIR);
  for (const packageDir of packageDirs) {
    checkPackageJson(packageDir);
  }
  
  // Check app package.json files
  const appDirs = getDirs(APPS_DIR);
  for (const appDir of appDirs) {
    checkPackageJson(appDir);
  }
  
  // Display results
  displayResults();
  
  console.log('\nNext steps:');
  console.log('1. Use the update-dev-tools.js script to standardize versions');
  console.log('2. Run yarn install to update dependencies');
  console.log('3. Run the update-eslint-config.js and update-tsconfig.js scripts to update configurations');
}

main(); 