#!/usr/bin/env node

/**
 * Script to run ESLint across all services and packages with the updated configuration.
 * 
 * This script identifies services and packages with ESLint configured
 * and runs linting, reporting results.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to the root directory
const ROOT_DIR = path.join(__dirname, '../..');
const SERVICES_DIR = path.join(ROOT_DIR, 'services');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');
const APPS_DIR = path.join(ROOT_DIR, 'apps');

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

// Function to check if a directory has ESLint configuration
function hasLintConfig(dirPath) {
  const packageJsonPath = path.join(dirPath, 'package.json');
  const eslintrcPath = path.join(dirPath, '.eslintrc.js');
  
  // Check if package.json exists and has ESLint dependencies
  try {
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const devDependencies = packageJson.devDependencies || {};
      const dependencies = packageJson.dependencies || {};
      const scripts = packageJson.scripts || {};
      
      // Check if ESLint exists as a dependency
      const hasEslintDep = devDependencies.eslint || dependencies.eslint;
      
      // Check if lint script exists
      const hasLintScript = scripts.lint && scripts.lint.includes('eslint');
      
      // Check if .eslintrc.js exists
      const hasEslintConfig = fs.existsSync(eslintrcPath);
      
      return hasEslintDep && (hasLintScript || hasEslintConfig);
    }
  } catch (error) {
    console.error(`Error reading package.json in ${dirPath}:`, error.message);
  }
  
  return false;
}

// Function to run ESLint in a directory
function runLint(dirPath) {
  const dirName = path.basename(dirPath);
  console.log(`\n===== Running ESLint for ${dirName} =====`);
  
  try {
    // Navigate to the directory and run lint
    process.chdir(dirPath);
    // Run ESLint on src directory if it exists, otherwise on the current directory
    const srcDir = fs.existsSync(path.join(dirPath, 'src')) ? 'src' : '.';
    execSync(`npx eslint ${srcDir} --ext .ts,.js,.tsx,.jsx --max-warnings=0`, { stdio: 'inherit' });
    console.log(`✅ Linting passed for ${dirName}`);
    return true;
  } catch (error) {
    console.error(`❌ Linting failed for ${dirName}`);
    return false;
  } finally {
    // Navigate back to the root
    process.chdir(ROOT_DIR);
  }
}

// Function to run Prettier in a directory
function runPrettierCheck(dirPath) {
  const dirName = path.basename(dirPath);
  console.log(`\n===== Running Prettier check for ${dirName} =====`);
  
  try {
    // Navigate to the directory and run Prettier check
    process.chdir(dirPath);
    // Run Prettier on src directory if it exists, otherwise on the current directory
    const srcDir = fs.existsSync(path.join(dirPath, 'src')) ? 'src' : '.';
    execSync(`npx prettier --check "${srcDir}/**/*.{ts,js,tsx,jsx,json}"`, { stdio: 'inherit' });
    console.log(`✅ Prettier check passed for ${dirName}`);
    return true;
  } catch (error) {
    console.error(`❌ Prettier check failed for ${dirName}`);
    return false;
  } finally {
    // Navigate back to the root
    process.chdir(ROOT_DIR);
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const onlyPrettier = args.includes('--prettier');
  const onlyLint = args.includes('--lint');
  const autoFix = args.includes('--fix');
  
  // Default to running both if no specific option is provided
  const runLintCheck = !onlyPrettier || onlyLint;
  const runPrettier = !onlyLint || onlyPrettier;
  
  if (runLintCheck) {
    console.log('Running ESLint across all services, packages, and apps...\n');
  }
  
  if (runPrettier) {
    console.log('Running Prettier check across all services, packages, and apps...\n');
  }
  
  let lintPassedCount = 0;
  let lintFailedCount = 0;
  let prettierPassedCount = 0;
  let prettierFailedCount = 0;
  let skippedCount = 0;
  
  // Collect all directories
  const serviceDirs = getDirs(SERVICES_DIR);
  const packageDirs = getDirs(PACKAGES_DIR);
  const appDirs = getDirs(APPS_DIR);
  const allDirs = [...serviceDirs, ...packageDirs, ...appDirs];
  
  // Directories with ESLint
  const dirsWithLint = allDirs.filter(dir => hasLintConfig(dir));
  
  // Run linting in each directory
  for (const dir of dirsWithLint) {
    if (runLintCheck) {
      const command = autoFix ? 'npx eslint src --ext .ts,.js,.tsx,.jsx --fix' : 'npx eslint src --ext .ts,.js,.tsx,.jsx --max-warnings=0';
      
      try {
        process.chdir(dir);
        const srcDir = fs.existsSync(path.join(dir, 'src')) ? 'src' : '.';
        execSync(`npx eslint ${srcDir} --ext .ts,.js,.tsx,.jsx ${autoFix ? '--fix' : '--max-warnings=0'}`, { stdio: 'inherit' });
        console.log(`✅ Linting passed for ${path.basename(dir)}`);
        lintPassedCount++;
      } catch (error) {
        console.error(`❌ Linting failed for ${path.basename(dir)}`);
        lintFailedCount++;
      } finally {
        process.chdir(ROOT_DIR);
      }
    }
    
    if (runPrettier) {
      try {
        process.chdir(dir);
        const srcDir = fs.existsSync(path.join(dir, 'src')) ? 'src' : '.';
        const prettierCmd = autoFix ? 'npx prettier --write' : 'npx prettier --check';
        execSync(`${prettierCmd} "${srcDir}/**/*.{ts,js,tsx,jsx,json}"`, { stdio: 'inherit' });
        console.log(`✅ Prettier ${autoFix ? 'formatting' : 'check'} passed for ${path.basename(dir)}`);
        prettierPassedCount++;
      } catch (error) {
        console.error(`❌ Prettier ${autoFix ? 'formatting' : 'check'} failed for ${path.basename(dir)}`);
        prettierFailedCount++;
      } finally {
        process.chdir(ROOT_DIR);
      }
    }
  }
  
  // Count skipped directories
  skippedCount = allDirs.length - dirsWithLint.length;
  
  console.log('\n===== Lint Summary =====');
  if (runLintCheck) {
    console.log(`Services, packages, and apps with passing ESLint: ${lintPassedCount}`);
    console.log(`Services, packages, and apps with failing ESLint: ${lintFailedCount}`);
  }
  
  if (runPrettier) {
    console.log(`Services, packages, and apps with passing Prettier: ${prettierPassedCount}`);
    console.log(`Services, packages, and apps with failing Prettier: ${prettierFailedCount}`);
  }
  
  console.log(`Services, packages, and apps without ESLint: ${skippedCount}`);
  
  if (lintFailedCount > 0 || prettierFailedCount > 0) {
    console.log('\n⚠️ Some linting or formatting checks failed. You may need to fix code style issues.');
    console.log('To automatically fix some issues, run this script with --fix.');
  } else if (lintPassedCount === 0 && prettierPassedCount === 0) {
    console.log('\n⚠️ No linting or formatting was performed. Check your configurations.');
  } else {
    console.log('\n✅ All linting and formatting checks passed!');
  }
}

main(); 