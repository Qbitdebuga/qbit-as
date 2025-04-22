import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding process...');

  // Delete existing roles and users to avoid duplicates
  await prisma.$executeRaw`TRUNCATE TABLE "roles" CASCADE`;
  console.log('Deleted existing roles');

  await prisma.$executeRaw`TRUNCATE TABLE "users" CASCADE`;
  console.log('Deleted existing users');

  // Create roles
  const adminRole = await prisma.$queryRaw`
    INSERT INTO "roles" (id, name, description, created_at, updated_at, permissions)
    VALUES (
      ${crypto.randomUUID()}, 
      'admin', 
      'Administrator role with full access', 
      NOW(), 
      NOW(), 
      ${Prisma.raw("ARRAY['manage:users', 'manage:roles', 'read:users', 'create:users', 'update:users', 'delete:users']")}
    )
    RETURNING *
  `;

  const userRole = await prisma.$queryRaw`
    INSERT INTO "roles" (id, name, description, created_at, updated_at, permissions)
    VALUES (
      ${crypto.randomUUID()}, 
      'user', 
      'Regular user with limited access', 
      NOW(), 
      NOW(), 
      ${Prisma.raw("ARRAY['read:profile', 'update:profile']")}
    )
    RETURNING *
  `;

  console.log('Created roles:', { adminRole, userRole });

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.$queryRaw`
    INSERT INTO "users" (id, email, name, password, created_at, updated_at, roles)
    VALUES (
      ${crypto.randomUUID()}, 
      'admin@qbit.com', 
      'Admin User', 
      ${hashedPassword}, 
      NOW(), 
      NOW(), 
      ${Prisma.raw("ARRAY['admin', 'user']")}
    )
    RETURNING *
  `;

  console.log('Created admin user:', adminUser);
  console.log('Seeding completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 