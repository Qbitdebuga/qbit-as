#!/usr/bin/env node

/**
 * Script to convert microservices to ESM format
 * Run with: node scripts/convert-to-esm.js
 * 
 * This script does the following:
 * 1. Updates package.json to set "type": "module"
 * 2. Updates tsconfig.json to use NodeNext module format
 * 3. Adds .js extensions to all local imports in .ts files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const SERVICES_DIR = path.join(ROOT_DIR, 'services');

// List of all service directories
const services = fs.readdirSync(SERVICES_DIR).filter(file => {
  const stats = fs.statSync(path.join(SERVICES_DIR, file));
  return stats.isDirectory();
});

console.log(`Found ${services.length} services to convert to ESM:`);
console.log(services.join(', '));
console.log('\n');

// Function to update package.json
function updatePackageJson(servicePath) {
  const packageJsonPath = path.join(servicePath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`No package.json found in ${servicePath}`);
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Set type to module
  packageJson.type = 'module';
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`Updated package.json in ${servicePath}`);
}

// Function to update tsconfig.json
function updateTsconfig(servicePath) {
  const tsconfigPath = path.join(servicePath, 'tsconfig.json');
  
  if (!fs.existsSync(tsconfigPath)) {
    console.log(`No tsconfig.json found in ${servicePath}`);
    return;
  }
  
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  
  // Update module and moduleResolution
  if (!tsconfig.compilerOptions) {
    tsconfig.compilerOptions = {};
  }
  
  tsconfig.compilerOptions.module = 'NodeNext';
  tsconfig.compilerOptions.moduleResolution = 'NodeNext';
  tsconfig.compilerOptions.target = 'ES2022';
  tsconfig.compilerOptions.esModuleInterop = true;
  
  // Write updated tsconfig.json
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');
  console.log(`Updated tsconfig.json in ${servicePath}`);
}

// Regular expression to match import statements with relative paths without file extensions
const importRegex = /from\s+['"](\.{1,2}\/.+?)['"](?!\.js)/g;

// Function to add .js extensions to imports
function fixImportsInFile(filePath) {
  try {
    // Get the file stats
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // If it's a directory, process its contents
      const files = fs.readdirSync(filePath);
      files.forEach(file => {
        fixImportsInFile(path.join(filePath, file));
      });
    } else if (stats.isFile() && (filePath.endsWith('.ts') || filePath.endsWith('.js'))) {
      // If it's a TypeScript or JavaScript file, process its imports
      let content = fs.readFileSync(filePath, 'utf-8');
      let originalContent = content;
      
      // Add .js extension to local imports if they don't already have one
      content = content.replace(importRegex, (match, importPath) => {
        return `from '${importPath}.js'`;
      });
      
      // Write the modified content back to the file
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated imports in ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Process each service
for (const service of services) {
  const servicePath = path.join(SERVICES_DIR, service);
  console.log(`Processing service: ${service}`);
  
  // 1. Update package.json
  updatePackageJson(servicePath);
  
  // 2. Update tsconfig.json
  updateTsconfig(servicePath);
  
  // 3. Fix imports
  const srcDir = path.join(servicePath, 'src');
  if (fs.existsSync(srcDir)) {
    fixImportsInFile(srcDir);
  }
  
  console.log(`Completed processing service: ${service}`);
  console.log('--------------------------------');
}

console.log('All services have been converted to ESM format.');
console.log('Now you should clean and rebuild all services:');
console.log('');
console.log('yarn workspaces foreach -pv --include "@qbit/*" run clean');
console.log('yarn workspaces foreach -pv --include "@qbit/*" run build'); 