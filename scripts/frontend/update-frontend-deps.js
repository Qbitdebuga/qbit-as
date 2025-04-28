#!/usr/bin/env node

/**
 * Script to update frontend-related dependencies in the web application.
 * 
 * This script updates:
 * - tailwindcss to 3.4.3
 * - keeps all other dependencies at their current versions to avoid compatibility issues
 */

const fs = require('fs');
const path = require('path');

// Configuration for updates
const UPDATES = {
  // Only update tailwindcss, keep other packages at their current versions
  'tailwindcss': '^3.4.3',
};

// Path to web app package.json
const WEB_APP_PATH = path.join(__dirname, '../../apps/web');
const PACKAGE_JSON_PATH = path.join(WEB_APP_PATH, 'package.json');

// Function to update package.json
function updatePackageJson() {
  if (!fs.existsSync(PACKAGE_JSON_PATH)) {
    console.error(`No package.json found at ${PACKAGE_JSON_PATH}`);
    return false;
  }
  
  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  let updated = false;
  
  // Update dependencies
  if (packageJson.dependencies) {
    for (const [pkg, version] of Object.entries(UPDATES)) {
      if (packageJson.dependencies[pkg]) {
        // Only log if actually changing the version
        if (packageJson.dependencies[pkg] !== version) {
          console.log(`Updating ${pkg} from ${packageJson.dependencies[pkg]} to ${version}`);
          packageJson.dependencies[pkg] = version;
          updated = true;
        }
      }
    }
  }
  
  // Update devDependencies
  if (packageJson.devDependencies) {
    for (const [pkg, version] of Object.entries(UPDATES)) {
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
    fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`Updated frontend dependencies in ${PACKAGE_JSON_PATH}`);
    return true;
  } else {
    console.log('No updates were needed');
    return false;
  }
}

// Main function
function main() {
  console.log('Updating frontend dependencies...');
  
  if (updatePackageJson()) {
    console.log('\nFrontend dependencies updated successfully.');
    console.log('Next steps:');
    console.log('1. Run "yarn install" to update the yarn.lock file');
    console.log('2. Run UI component tests to ensure compatibility');
    console.log('3. Commit the changes');
  } else {
    console.log('\nNo frontend dependencies were updated.');
  }
}

main(); 