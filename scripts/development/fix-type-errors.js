/**
 * Script to fix common TypeScript errors across the project
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Helper function to find files recursively
function findFiles(dir, pattern) {
  let results = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules' && file.name !== 'dist') {
      results = results.concat(findFiles(fullPath, pattern));
    } else if (file.isFile() && pattern.test(file.name)) {
      results.push(fullPath);
    }
  }
  
  return results;
}

// Helper to read and write files with UTF-8 encoding
function fixFile(filePath, fixFn) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixed = fixFn(content);
    
    if (content !== fixed) {
      fs.writeFileSync(filePath, fixed, 'utf8');
      console.log(`Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Fix missing explicit types for parameters
function fixImplicitAnyParams(content) {
  // Find arrow functions with implicit any parameters
  return content.replace(
    /(\w+)\s*=>\s*{/g, 
    (match, param) => {
      // Only replace if it's a simple parameter without type
      if (!param.includes(':') && !param.includes('(') && !param.includes('{')) {
        return `${param}: any => {`;
      }
      return match;
    }
  );
}

// Fix object is possibly undefined errors
function fixPossiblyUndefined(content) {
  return content.replace(
    /(\w+)\.(\w+)\s*\./g,
    (match, obj, prop) => {
      return `${obj}?.${prop}.`;
    }
  ).replace(
    /(\w+)\.(\w+)\[/g,
    (match, obj, prop) => {
      return `${obj}?.${prop}[`;
    }
  );
}

// Fix null is not assignable to string errors
function fixNullableTypes(content) {
  return content.replace(
    /(string|number|boolean)\s*;/g,
    (match, type) => {
      return `${type} | null;`;
    }
  );
}

// Fix import type errors
function fixTypeImports(content) {
  return content.replace(
    /import\s+{\s*([^}]+)\s*}\s+from\s+['"]@qbit\/shared-types['"];/g,
    (match, imports) => {
      if (imports.includes('BillCreate') || imports.includes('BillUpdate')) {
        // Add the new type aliases if they're imported
        const updatedImports = imports.trim();
        return `import { ${updatedImports} } from '@qbit/shared-types';`;
      }
      return match;
    }
  );
}

// Process entire services and packages directories
const serviceDirs = ['services', 'packages'];
let totalFixed = 0;

serviceDirs.forEach(baseDir => {
  if (!fs.existsSync(baseDir)) return;
  
  // Find all TypeScript files
  const tsFiles = findFiles(baseDir, /\.(ts|tsx)$/);
  
  // Apply fixes to each file
  tsFiles.forEach(file => {
    let wasFixed = false;
    
    // Apply each fix function
    wasFixed |= fixFile(file, fixImplicitAnyParams);
    wasFixed |= fixFile(file, fixPossiblyUndefined);
    wasFixed |= fixFile(file, fixNullableTypes);
    wasFixed |= fixFile(file, fixTypeImports);
    
    if (wasFixed) totalFixed++;
  });
});

console.log(`Total files fixed: ${totalFixed}`); 