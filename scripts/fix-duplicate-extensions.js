#!/usr/bin/env node

/**
 * Script to fix duplicate or triple .js extensions in import statements
 * Run with: node scripts/fix-duplicate-extensions.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const SERVICES_DIR = path.join(ROOT_DIR, 'services');

// List of all service directories
const services = fs.readdirSync(SERVICES_DIR).filter(file => {
  const stats = fs.statSync(path.join(SERVICES_DIR, file));
  return stats.isDirectory();
});

console.log(`Found ${services.length} services to fix:`);
console.log(services.join(', '));
console.log('\n');

// Regular expressions to fix imports
const doubleJsRegex = /from\s+['"](\.{1,2}\/.+?)\.js\.js['"]/g;
const tripleJsRegex = /from\s+['"](\.{1,2}\/.+?)\.js\.js\.js['"]/g;

// Function to fix duplicate .js extensions
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
      
      // Fix triple .js extensions first (to avoid partial fixes)
      content = content.replace(tripleJsRegex, (match, importPath) => {
        console.log(`Fixed triple .js in ${filePath}: ${importPath}.js.js.js -> ${importPath}.js`);
        return `from '${importPath}.js'`;
      });
      
      // Fix double .js extensions
      content = content.replace(doubleJsRegex, (match, importPath) => {
        console.log(`Fixed double .js in ${filePath}: ${importPath}.js.js -> ${importPath}.js`);
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
  
  // Fix imports in the src directory
  const srcDir = path.join(servicePath, 'src');
  if (fs.existsSync(srcDir)) {
    fixImportsInFile(srcDir);
  }
  
  console.log(`Completed processing service: ${service}`);
  console.log('--------------------------------');
}

console.log('All duplicate .js extensions have been fixed.');
console.log('You can now rebuild the services:');
console.log('yarn workspaces foreach -pv --include "@qbit/*" run build'); 