#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define the versions to update to
const newVersions = {
  '@prisma/client': '5.11.0',
  'prisma': '5.11.0'
};

// Path to services directory
const servicesDir = path.join(__dirname, '../services');

// Find all service directories
const serviceDirs = fs.readdirSync(servicesDir)
  .filter(dir => {
    const stat = fs.statSync(path.join(servicesDir, dir));
    return stat.isDirectory() && dir !== 'services';
  })
  .map(dir => path.join(servicesDir, dir));

console.log(`Found ${serviceDirs.length} services to check...`);

// Track services that were updated
const updatedServices = [];

// Process each service
serviceDirs.forEach(serviceDir => {
  const packageJsonPath = path.join(serviceDir, 'package.json');
  
  // Skip directories without a package.json
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`No package.json found in ${serviceDir}`);
    return;
  }
  
  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  let updated = false;
  
  // Check if service uses Prisma
  const usesPrisma = packageJson.dependencies && 
    (packageJson.dependencies['@prisma/client'] || packageJson.devDependencies?.prisma);
  
  if (!usesPrisma) {
    console.log(`Service ${path.basename(serviceDir)} does not use Prisma, skipping.`);
    return;
  }
  
  // Update dependencies
  if (packageJson.dependencies) {
    if (packageJson.dependencies['@prisma/client']) {
      packageJson.dependencies['@prisma/client'] = newVersions['@prisma/client'];
      updated = true;
    }
  }
  
  // Update devDependencies
  if (packageJson.devDependencies) {
    if (packageJson.devDependencies['prisma']) {
      packageJson.devDependencies['prisma'] = newVersions['prisma'];
      updated = true;
    }
  }
  
  // Save changes if updated
  if (updated) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    updatedServices.push(path.basename(serviceDir));
    console.log(`Updated Prisma dependencies in ${serviceDir}`);
  }
});

// Also check root package.json for Prisma dependencies
const rootPackageJsonPath = path.join(__dirname, '../package.json');
if (fs.existsSync(rootPackageJsonPath)) {
  const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));
  let updated = false;
  
  if (rootPackageJson.dependencies && rootPackageJson.dependencies['@prisma/client']) {
    rootPackageJson.dependencies['@prisma/client'] = newVersions['@prisma/client'];
    updated = true;
  }
  
  if (rootPackageJson.devDependencies && rootPackageJson.devDependencies['prisma']) {
    rootPackageJson.devDependencies['prisma'] = newVersions['prisma'];
    updated = true;
  }
  
  if (updated) {
    fs.writeFileSync(rootPackageJsonPath, JSON.stringify(rootPackageJson, null, 2) + '\n');
    console.log('Updated Prisma dependencies in root package.json');
  }
}

console.log('\nSummary:');
console.log(`Updated Prisma dependencies in ${updatedServices.length} services:`, updatedServices);
console.log('Run "yarn install" to update the yarn.lock file'); 