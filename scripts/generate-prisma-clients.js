#!/usr/bin/env node

/**
 * Script to generate Prisma clients for all services after updating dependencies.
 * 
 * This script:
 * - Finds all services with Prisma schema files
 * - Runs prisma generate for each service to update the client
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Services directory
const SERVICES_DIR = path.join(__dirname, '..', 'services');

// Function to find all services with schema.prisma files
function findPrismaServices(dir) {
  const services = [];
  
  // Get all directories in the services directory
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    
    if (fs.statSync(itemPath).isDirectory()) {
      // Check if the directory has a prisma directory with a schema.prisma file
      const prismaDir = path.join(itemPath, 'prisma');
      const schemaPath = path.join(prismaDir, 'schema.prisma');
      
      if (fs.existsSync(schemaPath)) {
        services.push({
          name: item,
          path: itemPath,
          schemaPath: schemaPath
        });
      }
    }
  }
  
  return services;
}

// Function to generate Prisma client for a service
function generatePrismaClient(service) {
  console.log(`\nGenerating Prisma client for ${service.name}...`);
  
  try {
    // Change to the service directory
    process.chdir(service.path);
    
    // Run prisma generate
    const result = execSync('npx prisma generate', { stdio: 'pipe' }).toString();
    console.log(`✅ Successfully generated Prisma client for ${service.name}`);
    console.log(result);
    return true;
  } catch (error) {
    console.error(`❌ Failed to generate Prisma client for ${service.name}`);
    console.error(error.stdout?.toString() || error.message);
    return false;
  }
}

// Main function
function main() {
  console.log('Generating Prisma clients for all services...\n');
  
  // Find all services with Prisma schema files
  const services = findPrismaServices(SERVICES_DIR);
  
  console.log(`Found ${services.length} services with Prisma schemas\n`);
  
  // Generate Prisma client for each service
  let successCount = 0;
  let failCount = 0;
  
  for (const service of services) {
    const success = generatePrismaClient(service);
    
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log('\n=== Summary ===');
  console.log(`Total services: ${services.length}`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  
  console.log('\nNext steps:');
  console.log('1. Review any failures and fix any issues');
  console.log('2. Test the services to ensure they work with the new Prisma client');
  console.log('3. Commit the changes');
}

main(); 