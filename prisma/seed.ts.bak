import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create basic roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with full access',
      permissions: ['users:read', 'users:write', 'roles:read', 'roles:write'],
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Standard user',
      permissions: ['profile:read', 'profile:write'],
    },
  });

  console.log('Created roles:', { adminRole, userRole });

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@qbit.com' },
    update: {},
    create: {
      email: 'admin@qbit.com',
      name: 'Admin User',
      password: hashedPassword,
      roles: ['admin', 'user'],
    },
  });

  console.log('Created admin user:', adminUser);

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