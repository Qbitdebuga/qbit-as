#!/usr/bin/env node

/**
 * Script to standardize ESLint configuration across the project.
 * 
 * This script updates .eslintrc.js files to ensure consistent code style
 * and linting rules across all services and packages.
 */

const fs = require('fs');
const path = require('path');

// Base ESLint configuration
const BASE_ESLINT_CONFIG = {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "tsconfig.json",
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint/eslint-plugin"],
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "root": true,
  "env": {
    "node": true,
    "jest": true
  },
  "ignorePatterns": [".eslintrc.js", "dist", "node_modules"],
  "rules": {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "prettier/prettier": ["error", {
      "endOfLine": "auto"
    }]
  }
};

// Base Prettier configuration
const BASE_PRETTIER_CONFIG = {
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "semi": true,
  "tabWidth": 2
};

// Path to the root directory
const ROOT_DIR = path.join(__dirname, '../..');
const SERVICES_DIR = path.join(ROOT_DIR, 'services');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');

// Function to update .eslintrc.js
function updateEslintConfig(dirPath) {
  const eslintPath = path.join(dirPath, '.eslintrc.js');
  
  try {
    // Create configuration as a module export
    const eslintConfig = `module.exports = ${JSON.stringify(BASE_ESLINT_CONFIG, null, 2)};\n`;
    
    // Check if file exists
    if (fs.existsSync(eslintPath)) {
      // Compare with existing content
      const existingContent = fs.readFileSync(eslintPath, 'utf8');
      if (existingContent.trim() === eslintConfig.trim()) {
        console.log(`No updates needed in ${eslintPath}`);
        return false;
      }
    }
    
    // Write or update file
    fs.writeFileSync(eslintPath, eslintConfig);
    console.log(`Updated ESLint configuration in ${eslintPath}`);
    return true;
  } catch (error) {
    console.error(`Error updating ${eslintPath}:`, error.message);
    return false;
  }
}

// Function to update .prettierrc
function updatePrettierConfig(dirPath) {
  const prettierPath = path.join(dirPath, '.prettierrc');
  
  try {
    // Create configuration
    const prettierConfig = JSON.stringify(BASE_PRETTIER_CONFIG, null, 2) + '\n';
    
    // Check if file exists
    if (fs.existsSync(prettierPath)) {
      // Compare with existing content
      const existingContent = fs.readFileSync(prettierPath, 'utf8');
      if (existingContent.trim() === prettierConfig.trim()) {
        console.log(`No updates needed in ${prettierPath}`);
        return false;
      }
    }
    
    // Write or update file
    fs.writeFileSync(prettierPath, prettierConfig);
    console.log(`Updated Prettier configuration in ${prettierPath}`);
    return true;
  } catch (error) {
    console.error(`Error updating ${prettierPath}:`, error.message);
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
  console.log('Standardizing ESLint and Prettier configuration across the project...\n');
  
  let eslintUpdatedCount = 0;
  let prettierUpdatedCount = 0;
  
  // Update root configurations
  if (updateEslintConfig(ROOT_DIR)) {
    eslintUpdatedCount++;
  }
  
  if (updatePrettierConfig(ROOT_DIR)) {
    prettierUpdatedCount++;
  }
  
  // Update service configurations
  const serviceDirs = getDirs(SERVICES_DIR);
  for (const serviceDir of serviceDirs) {
    if (updateEslintConfig(serviceDir)) {
      eslintUpdatedCount++;
    }
    
    if (updatePrettierConfig(serviceDir)) {
      prettierUpdatedCount++;
    }
  }
  
  // Update package configurations
  const packageDirs = getDirs(PACKAGES_DIR);
  for (const packageDir of packageDirs) {
    if (updateEslintConfig(packageDir)) {
      eslintUpdatedCount++;
    }
    
    if (updatePrettierConfig(packageDir)) {
      prettierUpdatedCount++;
    }
  }
  
  console.log(`\nSummary: Updated ${eslintUpdatedCount} ESLint configurations and ${prettierUpdatedCount} Prettier configurations.`);
  console.log('Next steps:');
  console.log('1. Run linting to verify the configuration changes');
  console.log('2. Fix any linting issues that arise');
  console.log('3. Format the codebase with the new Prettier configuration');
}

main(); 