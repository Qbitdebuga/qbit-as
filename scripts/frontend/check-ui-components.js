#!/usr/bin/env node

/**
 * Script to check UI components for compatibility after updating frontend dependencies.
 * 
 * This script:
 * - Scans UI components in the web app
 * - Identifies potential import issues with updated packages
 * - Lists components that should be manually tested
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to web app UI components
const WEB_APP_PATH = path.join(__dirname, '../../apps/web');
const UI_COMPONENTS_PATH = path.join(WEB_APP_PATH, 'src/components/ui');

// Packages that were updated and need checking
const UPDATED_PACKAGES = [
  '@radix-ui/react-checkbox',
  '@radix-ui/react-dialog',
  '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-label',
  '@radix-ui/react-popover',
  '@radix-ui/react-select',
  '@radix-ui/react-separator',
  '@radix-ui/react-slot',
  '@radix-ui/react-switch',
  '@radix-ui/react-tabs',
  '@radix-ui/react-toast',
  'react-hook-form',
  'zod',
  'tailwindcss'
];

// Function to find all UI component files
function findComponentFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    return files;
  }

  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      findComponentFiles(itemPath, files);
    } else if (stat.isFile() && (itemPath.endsWith('.tsx') || itemPath.endsWith('.jsx'))) {
      files.push(itemPath);
    }
  }
  
  return files;
}

// Function to check imports in a file
function checkImports(filePath, packageName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes(`from '${packageName}'`) || content.includes(`from "${packageName}"`);
  } catch (err) {
    console.error(`Error reading ${filePath}: ${err.message}`);
    return false;
  }
}

// Function to check components
function checkComponents() {
  console.log('Scanning UI components...\n');
  
  const componentFiles = findComponentFiles(UI_COMPONENTS_PATH);
  console.log(`Found ${componentFiles.length} component files\n`);
  
  const affectedComponents = {};
  
  // Check each component file for imports from updated packages
  for (const packageName of UPDATED_PACKAGES) {
    affectedComponents[packageName] = [];
    
    for (const filePath of componentFiles) {
      if (checkImports(filePath, packageName)) {
        const relativePath = path.relative(WEB_APP_PATH, filePath);
        affectedComponents[packageName].push(relativePath);
      }
    }
  }
  
  // Print results
  console.log('Components affected by package updates:');
  
  let totalAffected = 0;
  
  for (const [packageName, components] of Object.entries(affectedComponents)) {
    if (components.length > 0) {
      console.log(`\n${packageName} (${components.length} components):`);
      components.forEach(comp => console.log(`  - ${comp}`));
      totalAffected += components.length;
    }
  }
  
  console.log(`\nTotal affected components: ${totalAffected}`);
  
  return {
    componentCount: componentFiles.length,
    affectedCount: totalAffected,
    affectedComponents
  };
}

// Function to check form components with zod and react-hook-form
function checkFormComponents() {
  console.log('\nScanning form components with zod and react-hook-form...\n');
  
  // Use grep to find forms using react-hook-form and zod
  try {
    console.log('Components using react-hook-form:');
    const hookFormResult = execSync('grep -r "useForm" --include="*.tsx" apps/web/src/components', { encoding: 'utf8' });
    console.log(hookFormResult || '  No components found');
    
    console.log('\nComponents using zod:');
    const zodResult = execSync('grep -r "zodResolver" --include="*.tsx" apps/web/src/components', { encoding: 'utf8' });
    console.log(zodResult || '  No components found');
  } catch (error) {
    console.log('  No components found or error running grep');
  }
}

// Main function
function main() {
  console.log('Checking UI components for compatibility...\n');
  
  const results = checkComponents();
  checkFormComponents();
  
  console.log('\nTest Plan:');
  console.log('1. Run the web application locally');
  console.log('2. Test the following components to ensure they work properly:');
  
  let testList = [];
  
  for (const [packageName, components] of Object.entries(results.affectedComponents)) {
    if (components.length > 0) {
      // Get unique component names (base filename without extension)
      const componentNames = [...new Set(components.map(c => path.basename(c, path.extname(c))))];
      testList = [...testList, ...componentNames];
    }
  }
  
  // Print unique component names to test
  [...new Set(testList)].sort().forEach(comp => console.log(`   - ${comp}`));
}

main(); 