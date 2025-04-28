#!/usr/bin/env node

/**
 * Script to clean and rebuild all services
 * Run with: node scripts/clean-and-rebuild.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper function to run commands and log output
function runCommand(command, options = {}) {
  console.log(`${colors.cyan}> ${command}${colors.reset}`);
  try {
    execSync(command, {
      stdio: 'inherit',
      cwd: options.cwd || ROOT_DIR,
      ...options
    });
    return true;
  } catch (error) {
    console.error(`${colors.red}Command failed: ${command}${colors.reset}`);
    return false;
  }
}

// Welcome message
console.log(`
${colors.cyan}=====================================
🧹 QBIT Clean and Rebuild Script 🚀
=====================================${colors.reset}

This script will:
1. Clean all dist directories
2. Rebuild all services with ESM support
`);

// First confirm with the user
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question(`${colors.yellow}⚠️  This will delete all dist folders and rebuild everything. Continue? (y/N): ${colors.reset}`, answer => {
  if (answer.toLowerCase() !== 'y') {
    console.log(`${colors.yellow}Operation cancelled.${colors.reset}`);
    rl.close();
    process.exit(0);
  }
  
  rl.close();
  
  // Step 1: Clean all dist directories
  console.log(`\n${colors.magenta}🧹 Cleaning all dist directories...${colors.reset}`);
  runCommand('yarn workspaces foreach -pv --include "@qbit/*" exec rm -rf dist');
  
  // Step 2: Install dependencies if needed
  console.log(`\n${colors.magenta}📦 Making sure all dependencies are installed...${colors.reset}`);
  runCommand('yarn install');
  
  // Step 3: Rebuild all packages and services
  console.log(`\n${colors.magenta}🔨 Rebuilding all packages and services...${colors.reset}`);
  runCommand('yarn workspaces foreach -pv --include "@qbit/*" run build');
  
  console.log(`\n${colors.green}✅ Clean and rebuild complete!${colors.reset}`);
  console.log(`\n${colors.cyan}To run a specific service, use:${colors.reset}`);
  console.log(`yarn workspace @qbit/[service-name] run dev`);
}); 