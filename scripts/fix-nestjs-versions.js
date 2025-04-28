#!/usr/bin/env node

/**
 * Script to fix NestJS version compatibility issues for all services.
 * 
 * This script updates all services with compatible NestJS versions.
 */

const fs = require('fs');
const path = require('path');

// Configuration for NestJS updates
const NESTJS_UPDATES = {
  '@nestjs/common': '^10.3.0',
  '@nestjs/core': '^10.3.0',
  '@nestjs/config': '^4.0.2',
  '@nestjs/schematics': '^10.0.0',  // Use correct compatible version
  '@nestjs/cli': '^10.2.1',
  '@nestjs/testing': '^10.3.0',
  '@nestjs/swagger': '^7.3.0',
  '@nestjs/terminus': '^10.2.0',
  '@nestjs/jwt': '^10.2.0',
  '@nestjs/passport': '^10.0.2',
  '@nestjs/microservices': '^10.3.0',
  '@nestjs/platform-express': '^10.3.0'
};

// Services directory
const SERVICES_DIR = path.join(__dirname, '..', 'services');

// Function to get all service directories
function getServiceDirectories() {
  const services = [];
  
  const items = fs.readdirSync(SERVICES_DIR);
  
  for (const item of items) {
    const itemPath = path.join(SERVICES_DIR, item);
    
    if (fs.statSync(itemPath).isDirectory()) {
      services.push({
        name: item,
        path: itemPath
      });
    }
  }
  
  return services;
}

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
    for (const [dependency, version] of Object.entries(NESTJS_UPDATES)) {
      if (packageJson.dependencies[dependency]) {
        packageJson.dependencies[dependency] = version;
        updated = true;
      }
    }
  }
  
  // Update devDependencies
  if (packageJson.devDependencies) {
    for (const [dependency, version] of Object.entries(NESTJS_UPDATES)) {
      if (packageJson.devDependencies[dependency]) {
        packageJson.devDependencies[dependency] = version;
        updated = true;
      }
    }
  }
  
  if (updated) {
    // Write updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`Updated NestJS dependencies in ${servicePath}`);
    return true;
  }
  
  return false;
}

// Main function
function main() {
  console.log('Fixing NestJS version compatibility issues...\n');
  
  // Get all service directories
  const services = getServiceDirectories();
  
  console.log(`Found ${services.length} services\n`);
  
  let updatedCount = 0;
  
  // Update each service
  for (const service of services) {
    if (updatePackageJson(service.path)) {
      updatedCount++;
    }
  }
  
  console.log(`\nSummary: Updated NestJS dependencies in ${updatedCount} services.`);
  console.log('Next steps:');
  console.log('1. Run "yarn install" to update the yarn.lock file');
  console.log('2. Test the services to ensure compatibility');
}

main(); 