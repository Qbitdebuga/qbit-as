#!/usr/bin/env node

/**
 * Standardize Tsup Configurations
 * 
 * This script creates or updates tsup.config.ts files for packages 
 * that use tsup as their build tool, addressing the incremental TypeScript
 * compilation issue with tsup.
 * 
 * Usage:
 * ```
 * node scripts/development/standardize-tsup-configs.js
 * ```
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Root directory of the project
const ROOT_DIR = path.resolve(__dirname, '../..');

// Packages directory
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');

// Counter for updated files
let updatedFiles = 0;
let skippedFiles = 0;

/**
 * Reads a package.json file and returns its contents
 * @param {string} packagePath - Path to the package.json file
 * @returns {Object|null} - The parsed package.json or null if not found
 */
function readPackageJson(packagePath) {
  try {
    const content = fs.readFileSync(packagePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${packagePath}: ${error.message}`);
    return null;
  }
}

/**
 * Reads a tsconfig.json file and returns its contents
 * @param {string} tsconfigPath - Path to the tsconfig.json file
 * @returns {Object|null} - The parsed tsconfig.json or null if not found
 */
function readTsConfig(tsconfigPath) {
  try {
    const content = fs.readFileSync(tsconfigPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${tsconfigPath}: ${error.message}`);
    return null;
  }
}

/**
 * Checks if a package uses tsup for building
 * @param {Object} packageJson - The package.json contents
 * @returns {boolean} - Whether the package uses tsup
 */
function usesTsup(packageJson) {
  if (!packageJson.scripts || !packageJson.scripts.build) {
    return false;
  }
  
  return packageJson.scripts.build.includes('tsup');
}

/**
 * Standard tsup.config.ts content
 * @returns {string} - The content for the tsup.config.ts file
 */
function getTsupConfigContent() {
  return `import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  sourcemap: true,
  clean: true,
  dts: true,
  format: ['esm', 'cjs'],
  outDir: 'dist',
  target: 'es2022',
  tsconfig: 'tsconfig.build.json',
});
`;
}

/**
 * Updates the build script in package.json if needed
 * @param {string} packageDir - Path to the package directory
 * @param {Object} packageJson - The package.json contents
 * @returns {boolean} - Whether the package.json was updated
 */
function updateBuildScript(packageDir, packageJson) {
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  const originalBuild = packageJson.scripts.build;
  let updated = false;

  // Check if the build script includes tsup
  if (originalBuild && originalBuild.includes('tsup')) {
    // Create a simplified build script that uses the config file
    const simplifiedBuild = 'rimraf dist && tsup';
    
    // Only update if it's different
    if (originalBuild !== simplifiedBuild) {
      packageJson.scripts.build = simplifiedBuild;
      console.log(`  - Updated build script: "${simplifiedBuild}"`);
      updated = true;
    }
  }

  // If updated, write the package.json back to disk
  if (updated) {
    try {
      fs.writeFileSync(
        path.join(packageDir, 'package.json'),
        JSON.stringify(packageJson, null, 2) + '\n',
        'utf8'
      );
      console.log(`  - Successfully updated package.json`);
    } catch (error) {
      console.error(`  - Error writing to package.json: ${error.message}`);
      updated = false;
    }
  }

  return updated;
}

/**
 * Creates or updates a tsup.config.ts file
 * @param {string} packageDir - Path to the package directory
 * @returns {boolean} - Whether the file was created or updated
 */
function createTsupConfig(packageDir) {
  const configPath = path.join(packageDir, 'tsup.config.ts');
  const configContent = getTsupConfigContent();
  
  try {
    // Check if the file already exists
    const exists = fs.existsSync(configPath);
    
    // Write the file, regardless of whether it exists
    fs.writeFileSync(configPath, configContent, 'utf8');
    
    if (exists) {
      console.log(`  - Updated existing tsup.config.ts`);
    } else {
      console.log(`  - Created new tsup.config.ts`);
    }
    
    return true;
  } catch (error) {
    console.error(`  - Error writing tsup.config.ts: ${error.message}`);
    return false;
  }
}

/**
 * Creates a tsconfig.build.json file without incremental flag
 * @param {string} packageDir - Path to the package directory
 * @returns {boolean} - Whether the file was created or updated
 */
function createBuildTsConfig(packageDir) {
  const originalTsConfigPath = path.join(packageDir, 'tsconfig.json');
  const buildTsConfigPath = path.join(packageDir, 'tsconfig.build.json');
  
  // Read the original tsconfig.json
  const tsConfig = readTsConfig(originalTsConfigPath);
  
  if (!tsConfig) {
    console.error(`  - Could not read tsconfig.json, skipping tsconfig.build.json creation`);
    return false;
  }
  
  // Create a new tsconfig with incremental set to false
  const buildTsConfig = JSON.parse(JSON.stringify(tsConfig)); // Deep clone
  
  if (buildTsConfig.compilerOptions) {
    // Remove incremental flag if present
    if ('incremental' in buildTsConfig.compilerOptions) {
      delete buildTsConfig.compilerOptions.incremental;
    }
  }
  
  try {
    // Write the build tsconfig
    fs.writeFileSync(
      buildTsConfigPath,
      JSON.stringify(buildTsConfig, null, 2) + '\n',
      'utf8'
    );
    
    console.log(`  - Created tsconfig.build.json without incremental flag`);
    return true;
  } catch (error) {
    console.error(`  - Error writing tsconfig.build.json: ${error.message}`);
    return false;
  }
}

/**
 * Process a package directory
 * @param {string} packageDir - Path to the package directory
 * @param {string} packageName - Name of the package
 */
function processPackage(packageDir, packageName) {
  console.log(`\nProcessing ${packageName}`);
  
  const packageJsonPath = path.join(packageDir, 'package.json');
  const packageJson = readPackageJson(packageJsonPath);
  
  if (!packageJson) {
    console.error(`  - Could not read package.json, skipping`);
    skippedFiles++;
    return;
  }
  
  if (!usesTsup(packageJson)) {
    console.log(`  - Does not use tsup, skipping`);
    skippedFiles++;
    return;
  }
  
  // Create a tsconfig.build.json file without incremental flag
  const tsConfigUpdated = createBuildTsConfig(packageDir);
  
  // Update the build script if needed
  const scriptUpdated = updateBuildScript(packageDir, packageJson);
  
  // Create or update the tsup.config.ts file
  const configUpdated = createTsupConfig(packageDir);
  
  if (scriptUpdated || configUpdated || tsConfigUpdated) {
    updatedFiles++;
  } else {
    skippedFiles++;
  }
}

/**
 * Main function to execute the script
 */
function main() {
  console.log('Standardizing tsup configurations for packages...\n');
  
  if (!fs.existsSync(PACKAGES_DIR)) {
    console.error(`Packages directory does not exist: ${PACKAGES_DIR}`);
    process.exit(1);
  }
  
  const packageDirs = fs.readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => ({
      dir: path.join(PACKAGES_DIR, dirent.name),
      name: dirent.name
    }));
  
  for (const { dir, name } of packageDirs) {
    processPackage(dir, `packages/${name}`);
  }
  
  console.log(`\nSummary: ${updatedFiles} packages updated, ${skippedFiles} packages skipped.`);
  
  if (updatedFiles > 0) {
    console.log('\nNext steps:');
    console.log('1. Run yarn install to update dependencies');
    console.log('2. Verify builds work with the updated tsup configurations');
  }
}

// Execute the script
main(); 