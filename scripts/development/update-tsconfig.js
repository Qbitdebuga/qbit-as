#!/usr/bin/env node

/**
 * Script to standardize TypeScript configuration across all services.
 * 
 * This script updates tsconfig.json files to ensure compatibility with TypeScript 5.4.5
 * and to apply consistent compiler options across all services.
 */

const fs = require('fs');
const path = require('path');

// Base compiler options for TypeScript 5.4.5
const BASE_COMPILER_OPTIONS = {
  "target": "es2022",
  "module": "commonjs",
  "declaration": true,
  "removeComments": true,
  "emitDecoratorMetadata": true,
  "experimentalDecorators": true,
  "allowSyntheticDefaultImports": true,
  "moduleResolution": "node",
  "sourceMap": true,
  "outDir": "./dist",
  "baseUrl": "./",
  "incremental": true,
  "skipLibCheck": true,
  "strictNullChecks": true,
  "noImplicitAny": true,
  "strictBindCallApply": true,
  "forceConsistentCasingInFileNames": true,
  "noFallthroughCasesInSwitch": true
};

// Path to the root directory
const ROOT_DIR = path.join(__dirname, '../..');
const SERVICES_DIR = path.join(ROOT_DIR, 'services');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');

// Function to update tsconfig.json
function updateTsConfig(tsconfigPath) {
  try {
    if (!fs.existsSync(tsconfigPath)) {
      console.warn(`No tsconfig.json found at ${tsconfigPath}`);
      return false;
    }
    
    // Read tsconfig.json
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    let updated = false;
    
    // Update compiler options
    if (!tsconfig.compilerOptions) {
      tsconfig.compilerOptions = {};
    }
    
    // Merge compiler options, keeping project-specific settings
    for (const [key, value] of Object.entries(BASE_COMPILER_OPTIONS)) {
      if (tsconfig.compilerOptions[key] !== value) {
        tsconfig.compilerOptions[key] = value;
        updated = true;
      }
    }
    
    if (updated) {
      // Write updated tsconfig.json
      fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');
      console.log(`Updated TypeScript configuration in ${tsconfigPath}`);
      return true;
    } else {
      console.log(`No updates needed in ${tsconfigPath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error updating ${tsconfigPath}:`, error.message);
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
  console.log('Standardizing TypeScript configuration across all services...\n');
  
  let updatedCount = 0;
  
  // Update root tsconfig.json
  const rootTsConfigPath = path.join(ROOT_DIR, 'tsconfig.json');
  if (updateTsConfig(rootTsConfigPath)) {
    updatedCount++;
  }
  
  // Update service tsconfig.json files
  const serviceDirs = getDirs(SERVICES_DIR);
  for (const serviceDir of serviceDirs) {
    const tsconfigPath = path.join(serviceDir, 'tsconfig.json');
    if (updateTsConfig(tsconfigPath)) {
      updatedCount++;
    }
  }
  
  // Update package tsconfig.json files
  const packageDirs = getDirs(PACKAGES_DIR);
  for (const packageDir of packageDirs) {
    const tsconfigPath = path.join(packageDir, 'tsconfig.json');
    if (updateTsConfig(tsconfigPath)) {
      updatedCount++;
    }
  }
  
  console.log(`\nSummary: Updated TypeScript configuration in ${updatedCount} tsconfig.json files.`);
  console.log('Next steps:');
  console.log('1. Fix any type errors that arise from the configuration changes');
  console.log('2. Verify that all projects build successfully with the new TypeScript version');
}

main(); 