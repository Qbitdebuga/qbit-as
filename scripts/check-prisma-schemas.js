#!/usr/bin/env node

/**
 * Script to check Prisma schema files for compatibility with the updated Prisma version.
 * 
 * This script:
 * - Finds all schema.prisma files in the services directory
 * - Analyzes them for potential compatibility issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Services directory
const SERVICES_DIR = path.join(__dirname, '..', 'services');

// Function to find all schema.prisma files
function findPrismaSchemas(dir, schemas = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findPrismaSchemas(filePath, schemas);
    } else if (file === 'schema.prisma') {
      schemas.push(filePath);
    }
  }
  
  return schemas;
}

// Function to check a schema file
function checkSchemaFile(schemaPath) {
  console.log(`\nChecking schema: ${schemaPath}\n`);
  
  // Read schema file
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Check generator block
  const generatorBlock = schema.match(/generator\s+\w+\s+\{[\s\S]*?\}/g);
  if (generatorBlock) {
    console.log('✅ Generator block found');
  } else {
    console.log('❌ No generator block found');
  }
  
  // Check datasource block
  const datasourceBlock = schema.match(/datasource\s+\w+\s+\{[\s\S]*?\}/g);
  if (datasourceBlock) {
    console.log('✅ Datasource block found');
  } else {
    console.log('❌ No datasource block found');
  }
  
  // Check for models
  const models = schema.match(/model\s+\w+\s+\{[\s\S]*?\}/g);
  if (models && models.length > 0) {
    console.log(`✅ Found ${models.length} models`);
  } else {
    console.log('❌ No models found');
  }
  
  // Check for deprecated features
  const deprecated = {
    '@map("_")': '@map("_") is deprecated in newer Prisma versions',
    'cuid()': 'cuid() is being replaced by cuid() in Prisma 5+, consider using uuid() instead',
    'createMany': 'Check if createMany is used in your code, as its behavior might have changed',
  };
  
  for (const [pattern, message] of Object.entries(deprecated)) {
    if (schema.includes(pattern)) {
      console.log(`⚠️ Warning: ${message}`);
    }
  }
  
  console.log('\n--- Schema Preview ---');
  console.log(schema.substring(0, 300) + '...');
  console.log('---------------------');
}

// Function to run prisma validate
function validateSchema(schemaPath) {
  try {
    const serviceDir = path.dirname(schemaPath);
    process.chdir(serviceDir);
    
    console.log(`Validating schema: ${schemaPath}`);
    const result = execSync('npx prisma validate', { stdio: 'pipe' }).toString();
    console.log('✅ Schema validation passed');
    return true;
  } catch (error) {
    console.error('❌ Schema validation failed');
    console.error(error.stdout?.toString() || error.message);
    return false;
  }
}

// Main function
function main() {
  console.log('Checking Prisma schema files...\n');
  
  // Find all schema.prisma files
  const schemas = findPrismaSchemas(SERVICES_DIR);
  
  console.log(`Found ${schemas.length} schema files\n`);
  
  // Check each schema file
  for (const schema of schemas) {
    checkSchemaFile(schema);
  }
  
  console.log('\n=== Summary ===');
  console.log(`Total schema files: ${schemas.length}`);
  console.log('\nNext steps:');
  console.log('1. Review any warnings or compatibility issues');
  console.log('2. Run "npx prisma validate" in each service directory to validate schemas');
  console.log('3. Run "npx prisma generate" to regenerate Prisma client');
}

main(); 