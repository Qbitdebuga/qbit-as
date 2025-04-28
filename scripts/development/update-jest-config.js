#!/usr/bin/env node

/**
 * Script to standardize Jest configuration across the project.
 * 
 * This script updates jest.config.js files in services and packages
 * to ensure consistent testing configuration compatible with Jest 29.7.0.
 */

const fs = require('fs');
const path = require('path');

// Base Jest configuration
const BASE_JEST_CONFIG = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  preset: 'ts-jest',
};

// Path to the root directory
const ROOT_DIR = path.join(__dirname, '../..');
const SERVICES_DIR = path.join(ROOT_DIR, 'services');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');

// Function to update jest.config.js
function updateJestConfig(dirPath) {
  const jestConfigPath = path.join(dirPath, 'jest.config.js');
  
  try {
    // Create configuration as a module export
    const jestConfig = `module.exports = ${JSON.stringify(BASE_JEST_CONFIG, null, 2)};\n`;
    
    // Check if file exists
    if (fs.existsSync(jestConfigPath)) {
      // Compare with existing content
      const existingContent = fs.readFileSync(jestConfigPath, 'utf8');
      if (existingContent.trim() === jestConfig.trim()) {
        console.log(`No updates needed in ${jestConfigPath}`);
        return false;
      }
    }
    
    // Write or update file
    fs.writeFileSync(jestConfigPath, jestConfig);
    console.log(`Updated Jest configuration in ${jestConfigPath}`);
    return true;
  } catch (error) {
    console.error(`Error updating ${jestConfigPath}:`, error.message);
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

// Function to check if package.json has Jest dependencies
function hasJestInPackageJson(dirPath) {
  const packageJsonPath = path.join(dirPath, 'package.json');
  
  try {
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const devDependencies = packageJson.devDependencies || {};
      const dependencies = packageJson.dependencies || {};
      
      return devDependencies.jest || dependencies.jest || 
             devDependencies['ts-jest'] || dependencies['ts-jest'] ||
             devDependencies['@types/jest'] || dependencies['@types/jest'];
    }
  } catch (error) {
    console.error(`Error reading package.json in ${dirPath}:`, error.message);
  }
  
  return false;
}

// Main function
function main() {
  console.log('Standardizing Jest configuration across the project...\n');
  
  let updatedCount = 0;
  let skippedCount = 0;
  
  // Update service configurations if they use Jest
  const serviceDirs = getDirs(SERVICES_DIR);
  for (const serviceDir of serviceDirs) {
    if (hasJestInPackageJson(serviceDir)) {
      if (updateJestConfig(serviceDir)) {
        updatedCount++;
      }
    } else {
      console.log(`Skipping ${serviceDir} - No Jest dependencies found`);
      skippedCount++;
    }
  }
  
  // Update package configurations if they use Jest
  const packageDirs = getDirs(PACKAGES_DIR);
  for (const packageDir of packageDirs) {
    if (hasJestInPackageJson(packageDir)) {
      if (updateJestConfig(packageDir)) {
        updatedCount++;
      }
    } else {
      console.log(`Skipping ${packageDir} - No Jest dependencies found`);
      skippedCount++;
    }
  }
  
  // Check if the root has Jest dependencies and update if needed
  if (hasJestInPackageJson(ROOT_DIR)) {
    if (updateJestConfig(ROOT_DIR)) {
      updatedCount++;
    }
  } else {
    console.log(`Skipping root directory - No Jest dependencies found`);
    skippedCount++;
  }
  
  console.log(`\nSummary: Updated ${updatedCount} Jest configurations, skipped ${skippedCount} directories without Jest dependencies.`);
  console.log('Next steps:');
  console.log('1. Run tests to verify the configuration changes');
  console.log('2. Fix any test failures that arise');
  console.log('3. Update test scripts if necessary');
}

main(); 