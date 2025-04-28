import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import globPkg from 'glob';
const { glob } = globPkg;

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to fix duplicate extensions in a file
function fixDuplicateExtensions(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Fix import statements with duplicate .js extensions (.js.js)
    const doubleJsRegex = /(import|export).*from\s+['"](.+?\.js)\.js['"]/g;
    content = content.replace(doubleJsRegex, (match, statement, path) => {
      console.log(`Fixed double .js extension in ${filePath}: ${path}.js.js -> ${path}`);
      return `${statement} from '${path}'`;
    });
    
    // Fix import statements with triple .js extensions (.js.js.js)
    const tripleJsRegex = /(import|export).*from\s+['"](.+?\.js)\.js\.js['"]/g;
    content = content.replace(tripleJsRegex, (match, statement, path) => {
      console.log(`Fixed triple .js extension in ${filePath}: ${path}.js.js.js -> ${path}`);
      return `${statement} from '${path}'`;
    });
    
    // Save the file if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

// Find all JavaScript files in the dist directory
const sourceFiles = glob.sync(path.join(__dirname, 'dist', '**', '*.js'), { 
  ignore: [path.join(__dirname, 'node_modules', '**')]
});

console.log(`Scanning ${sourceFiles.length} files for duplicate .js extensions...`);

let fixedFilesCount = 0;

// Process each file
sourceFiles.forEach(file => {
  if (fixDuplicateExtensions(file)) {
    fixedFilesCount++;
  }
});

console.log(`Completed! Fixed ${fixedFilesCount} files with duplicate .js extensions.`); 