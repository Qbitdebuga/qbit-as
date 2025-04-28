#!/usr/bin/env node

/**
 * Script to run tests across all services and packages to verify
 * the updated Jest configuration works properly.
 * 
 * This script identifies services and packages with Jest configured
 * and runs their tests, reporting results.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to the root directory
const ROOT_DIR = path.join(__dirname, '../..');
const SERVICES_DIR = path.join(ROOT_DIR, 'services');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');

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

// Function to check if a directory has tests configuration
function hasTestsConfig(dirPath) {
  const packageJsonPath = path.join(dirPath, 'package.json');
  const jestConfigPath = path.join(dirPath, 'jest.config.js');
  
  // Check if package.json exists and has Jest dependencies
  try {
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const devDependencies = packageJson.devDependencies || {};
      const dependencies = packageJson.dependencies || {};
      const scripts = packageJson.scripts || {};
      
      // Check if Jest exists as a dependency
      const hasJestDep = devDependencies.jest || dependencies.jest || 
                         devDependencies['ts-jest'] || dependencies['ts-jest'];
      
      // Check if test script exists
      const hasTestScript = scripts.test && (
        scripts.test.includes('jest') || 
        scripts.test.includes('npm test') ||
        scripts.test.includes('yarn test')
      );
      
      // Check if jest.config.js exists
      const hasJestConfig = fs.existsSync(jestConfigPath);
      
      return hasJestDep && (hasTestScript || hasJestConfig);
    }
  } catch (error) {
    console.error(`Error reading package.json in ${dirPath}:`, error.message);
  }
  
  return false;
}

// Function to run tests in a directory
function runTests(dirPath) {
  const dirName = path.basename(dirPath);
  console.log(`\n===== Running tests for ${dirName} =====`);
  
  try {
    // Navigate to the directory and run tests
    process.chdir(dirPath);
    execSync('npx jest --passWithNoTests', { stdio: 'inherit' });
    console.log(`✅ Tests passed for ${dirName}`);
    return true;
  } catch (error) {
    console.error(`❌ Tests failed for ${dirName}`);
    return false;
  } finally {
    // Navigate back to the root
    process.chdir(ROOT_DIR);
  }
}

// Main function
function main() {
  console.log('Running tests across all services and packages...\n');
  
  let passedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  
  // Collect all directories with tests
  const serviceDirs = getDirs(SERVICES_DIR);
  const packageDirs = getDirs(PACKAGES_DIR);
  const allDirs = [...serviceDirs, ...packageDirs];
  
  // Directories with tests
  const dirsWithTests = allDirs.filter(dir => hasTestsConfig(dir));
  
  // Skip running root tests - they may be e2e tests that require services to be running
  
  // Run tests in each directory
  for (const dir of dirsWithTests) {
    if (runTests(dir)) {
      passedCount++;
    } else {
      failedCount++;
    }
  }
  
  // Count skipped directories
  skippedCount = allDirs.length - dirsWithTests.length;
  
  console.log('\n===== Test Summary =====');
  console.log(`Services and packages with passing tests: ${passedCount}`);
  console.log(`Services and packages with failing tests: ${failedCount}`);
  console.log(`Services and packages without tests: ${skippedCount}`);
  
  if (failedCount > 0) {
    console.log('\n⚠️ Some tests are failing. You may need to update the test code to be compatible with Jest 29.7.0.');
    console.log('Common issues:');
    console.log('1. Updated assertion syntax');
    console.log('2. Changes in mock implementation');
    console.log('3. Different behavior in timer mocks');
    console.log('4. TypeScript 5.4.5 type errors in test files');
  } else if (passedCount === 0) {
    console.log('\n⚠️ No tests were found or all were skipped.');
  } else {
    console.log('\n✅ All tests passed!');
  }
}

main(); 