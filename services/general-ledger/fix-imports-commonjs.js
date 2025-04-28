const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, 'src');

// Regular expressions to fix imports
const jsExtensionRegex = /from\s+['"](\.{1,2}\/.+?)\.js['"](?!\.js)/g;
const duplicateJsRegex = /from\s+['"](\.{1,2}\/.+?)\.js\.js['"]/g;

function processFile(filePath) {
  // Skip node_modules
  if (filePath.includes('node_modules')) {
    return;
  }

  try {
    // Get the file stats
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // If it's a directory, process its contents
      const files = fs.readdirSync(filePath);
      files.forEach(file => {
        processFile(path.join(filePath, file));
      });
    } else if (stats.isFile() && (filePath.endsWith('.ts') || filePath.endsWith('.js'))) {
      // If it's a TypeScript or JavaScript file, process its imports
      let content = fs.readFileSync(filePath, 'utf-8');
      let originalContent = content;
      
      // Fix any duplicate .js.js extensions
      content = content.replace(duplicateJsRegex, (match, importPath) => {
        return `from '${importPath}'`;
      });
      
      // Remove .js extension from imports
      content = content.replace(jsExtensionRegex, (match, importPath) => {
        return `from '${importPath}'`;
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

// Start processing from the source directory
processFile(SOURCE_DIR);
console.log('Import statements updated successfully!'); 