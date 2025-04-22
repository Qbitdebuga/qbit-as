import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // First, delete existing roles to avoid duplicates
  console.log('Deleting existing roles...');
  await prisma.$executeRaw`TRUNCATE TABLE "roles" CASCADE`;

  // Create basic roles
  console.log('Creating roles...');
  const adminRole = await prisma.$executeRaw`
    INSERT INTO "roles" ("id", "name", "description", "permissions", "created_at", "updated_at")
    VALUES (gen_random_uuid(), 'admin', 'Administrator with full access', ARRAY['users:read', 'users:write', 'roles:read', 'roles:write'], NOW(), NOW())
    RETURNING *
  `;

  const userRole = await prisma.$executeRaw`
    INSERT INTO "roles" ("id", "name", "description", "permissions", "created_at", "updated_at")
    VALUES (gen_random_uuid(), 'user', 'Standard user', ARRAY['profile:read', 'profile:write'], NOW(), NOW())
    RETURNING *
  `;

  console.log('Created roles');

  // Delete existing users to avoid duplicates
  console.log('Deleting existing users...');
  await prisma.$executeRaw`TRUNCATE TABLE "users" CASCADE`;

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  console.log('Creating admin user...');
  const adminUser = await prisma.$executeRaw`
    INSERT INTO "users" ("id", "email", "name", "password", "roles", "created_at", "updated_at")
    VALUES (gen_random_uuid(), 'admin@qbit.com', 'Admin User', ${hashedPassword}, ARRAY['admin', 'user'], NOW(), NOW())
    RETURNING *
  `;

  console.log('Created admin user');

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 