import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, 'src');

// Regular expression to match import statements with relative paths without file extensions
const importRegex = /from\s+['"](\.{1,2}\/.+?)(?!\.js)['"]/g;

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
      
      // Add .js extension to local imports
      const updatedContent = content.replace(importRegex, (match, importPath) => {
        return `from '${importPath}.js'`;
      });
      
      // Write the modified content back to the file
      if (content !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent, 'utf-8');
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