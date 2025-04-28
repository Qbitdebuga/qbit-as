#!/usr/bin/env node

/**
 * Fix imports for UI components
 * 
 * This script replaces all imports from '@/ui' with '@/components/ui'
 * and also fixes direct imports like '@/card' -> '@/components/ui/card'
 * and other import issues.
 */

const fs = require('fs');
const path = require('path');

// Get project root directory
const projectRoot = path.resolve(__dirname, '../..');
const webAppSrc = path.join(projectRoot, 'apps/web/src');

// Count updated files
let updatedFiles = 0;
let scannedFiles = 0;

// List of UI component names that might be directly imported
const uiComponentNames = [
  'card', 'button', 'badge', 'tabs', 'table', 'select', 'switch', 'input', 'textarea',
  'form', 'alert', 'dialog', 'dropdown-menu', 'popover', 'separator', 'sheet',
  'skeleton', 'toast', 'alert-dialog', 'calendar', 'date-picker', 'heading', 'label',
  'loading-spinner', 'pagination', 'use-toast'
];

/**
 * Find all .ts and .tsx files recursively
 * @param {string} dir Directory to search
 * @returns {string[]} Array of file paths
 */
function findTsFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    if (item.isDirectory()) {
      results = results.concat(findTsFiles(path.join(dir, item.name)));
    } else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
      results.push(path.join(dir, item.name));
    }
  }

  return results;
}

/**
 * Update imports in the file
 * @param {string} filePath Path to the file
 */
function updateImports(filePath) {
  scannedFiles++;
  let content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(webAppSrc, filePath);
  
  // If it's the ui/index.ts file, we've already fixed it separately
  if (relativePath === 'components/ui/index.ts') {
    return;
  }
  
  let originalContent = content;
  
  // 1. Fix imports from '@/ui'
  const uiPattern = /from ['"]@\/ui['"]/g;
  const uiReplacement = `from '@/components/ui'`;
  content = content.replace(uiPattern, uiReplacement);
  
  // 2. Fix direct imports like '@/card', '@/button', etc.
  uiComponentNames.forEach(component => {
    const directPattern = new RegExp(`from ['"]@\\/${component}['"]`, 'g');
    const directReplacement = `from '@/components/ui/${component}'`;
    content = content.replace(directPattern, directReplacement);
  });
  
  // 3. Fix incorrect package imports
  content = content.replace(
    /from ['"]@qbit-accounting\/shared-types['"]/g,
    `from '@qbit/shared-types'`
  );
  
  content = content.replace(
    /from ['"]@qbit-accounting\/api-client['"]/g, 
    `from '@qbit/api-client'`
  );
  
  // Write back if changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated imports in ${relativePath}`);
    updatedFiles++;
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Scanning for TypeScript files in apps/web/src...');
  const files = findTsFiles(webAppSrc);
  console.log(`Found ${files.length} TypeScript files`);
  
  for (const file of files) {
    updateImports(file);
  }
  
  console.log('\n========== Summary ==========');
  console.log(`Total files scanned: ${scannedFiles}`);
  console.log(`Files updated: ${updatedFiles}`);
  console.log('============================\n');
  
  if (updatedFiles > 0) {
    console.log('✨ Successfully updated UI imports');
  } else {
    console.log('ℹ️ No imports needed to be updated');
  }
}

main(); 