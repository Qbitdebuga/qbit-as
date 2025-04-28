#!/usr/bin/env node

/**
 * Script to test form validation with the updated zod.
 * 
 * This script:
 * - Locates validation schemas using zod
 * - Provides test cases for various form validations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to web app
const WEB_APP_PATH = path.join(__dirname, '../../apps/web');
const VALIDATION_DIRS = [
  path.join(WEB_APP_PATH, 'src/lib/validations'),
  path.join(WEB_APP_PATH, 'src/components')
];

// Function to find all validation schema files
function findValidationFiles() {
  console.log('Searching for validation schemas...\n');
  
  // Use grep to find files with zod schema definitions
  const validationFiles = [];
  
  try {
    const grepCommand = `grep -r "z.object" --include="*.ts" --include="*.tsx" ${WEB_APP_PATH}/src`;
    const result = execSync(grepCommand, { encoding: 'utf8' });
    
    // Parse grep output to get file paths
    const lines = result.split('\n');
    
    for (const line of lines) {
      if (!line) continue;
      
      const [filePath] = line.split(':');
      if (filePath && !validationFiles.includes(filePath)) {
        validationFiles.push(filePath);
      }
    }
  } catch (error) {
    console.error('Error finding validation files:', error.message);
  }
  
  return validationFiles;
}

// Function to extract schema details from a file
function extractSchemas(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find schema names (variables assigned to z.object calls)
    const schemaRegex = /const\s+(\w+)\s*=\s*z\.object\(/g;
    const schemas = [];
    let match;
    
    while ((match = schemaRegex.exec(content)) !== null) {
      schemas.push(match[1]);
    }
    
    return schemas;
  } catch (err) {
    console.error(`Error reading ${filePath}: ${err.message}`);
    return [];
  }
}

// Function to generate test cases for a schema
function generateTestCases(schemas) {
  console.log('Test cases for form validation:');
  
  for (const schema of schemas) {
    console.log(`\n${schema}:`);
    console.log(`  1. Test with valid data`);
    console.log(`  2. Test with empty form`);
    console.log(`  3. Test with invalid email format (if applicable)`);
    console.log(`  4. Test with short password (if applicable)`);
    console.log(`  5. Test with mismatched password confirmation (if applicable)`);
  }
}

// Main function
function main() {
  console.log('Form Validation Testing Plan\n');
  
  const validationFiles = findValidationFiles();
  
  if (validationFiles.length === 0) {
    console.log('No validation schemas found.');
    return;
  }
  
  console.log(`Found ${validationFiles.length} files with validation schemas:`);
  
  const allSchemas = [];
  
  for (const file of validationFiles) {
    const relPath = path.relative(WEB_APP_PATH, file);
    const schemas = extractSchemas(file);
    
    if (schemas.length > 0) {
      console.log(`\n${relPath}:`);
      schemas.forEach(schema => {
        console.log(`  - ${schema}`);
        allSchemas.push(schema);
      });
    }
  }
  
  generateTestCases(allSchemas);
  
  console.log('\nForm testing procedure:');
  console.log('1. Run the web application');
  console.log('2. Navigate to forms that use these validation schemas');
  console.log('3. Test each form with valid and invalid inputs');
  console.log('4. Verify that validation errors appear correctly');
  console.log('5. Verify that forms submit successfully with valid data');
}

main(); 