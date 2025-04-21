import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database seeding...');

    // Create default roles
    const adminRole = await prisma.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: {
        name: 'admin',
        description: 'Administrator with full system access',
      },
    });

    const userRole = await prisma.role.upsert({
      where: { name: 'user' },
      update: {},
      create: {
        name: 'user',
        description: 'Standard user with limited access',
      },
    });

    console.log(`Created roles: admin (${adminRole.id}), user (${userRole.id})`);

    // Hash the admin password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    // Create a default admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@qbit.com' },
      update: {},
      create: {
        email: 'admin@qbit.com',
        name: 'System Administrator',
        password: hashedPassword,
        roles: {
          connect: [{ id: adminRole.id }],
        },
      },
    });

    console.log(`Created admin user: ${adminUser.email} (${adminUser.id})`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 