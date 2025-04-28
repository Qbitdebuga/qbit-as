#!/usr/bin/env node

/**
 * Script to update Prisma-related dependencies across all services.
 * 
 * This script updates:
 * - @prisma/client
 * - prisma dev dependency
 * in all package.json files of services using Prisma.
 */

const fs = require('fs');
const path = require('path');

// Configuration for updates
const UPDATES = {
  '@prisma/client': '^5.11.0',
  'prisma': '^5.11.0',
};

// Services directory
const SERVICES_DIR = path.join(__dirname, '..', 'services');

// Services with Prisma
const PRISMA_SERVICES = [
  'accounts-payable',
  'accounts-receivable',
  'auth',
  'banking',
  'fixed-assets',
  'general-ledger',
  'inventory',
  'reporting',
];

// Function to update package.json
function updatePackageJson(servicePath) {
  const packageJsonPath = path.join(servicePath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.warn(`No package.json found in ${servicePath}`);
    return false;
  }
  
  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  let updated = false;
  
  // Update dependencies
  if (packageJson.dependencies) {
    if (packageJson.dependencies['@prisma/client']) {
      packageJson.dependencies['@prisma/client'] = UPDATES['@prisma/client'];
      updated = true;
    }
  }
  
  // Update devDependencies
  if (packageJson.devDependencies) {
    if (packageJson.devDependencies['prisma']) {
      packageJson.devDependencies['prisma'] = UPDATES['prisma'];
      updated = true;
    }
  }
  
  if (updated) {
    // Write updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`Updated Prisma dependencies in ${servicePath}`);
    return true;
  }
  
  return false;
}

// Main function
function main() {
  console.log('Updating Prisma dependencies...');
  
  let updatedCount = 0;
  
  // Update services with Prisma
  for (const service of PRISMA_SERVICES) {
    const servicePath = path.join(SERVICES_DIR, service);
    if (fs.existsSync(servicePath)) {
      if (updatePackageJson(servicePath)) {
        updatedCount++;
      }
    } else {
      console.warn(`Service directory not found: ${servicePath}`);
    }
  }
  
  console.log(`\nSummary: Updated Prisma dependencies in ${updatedCount} services.`);
  console.log('Next steps:');
  console.log('1. Run "yarn install" to update the yarn.lock file');
  console.log('2. Test the services to ensure compatibility');
  console.log('3. Commit the changes');
}

main(); 