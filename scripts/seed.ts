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
    const userData = {
      email: 'admin@qbit.com',
      name: 'System Administrator',
      password: hashedPassword,
    };

    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@qbit.com' },
      update: {},
      create: userData,
    });

    // Use raw query to assign roles to the user
    await prisma.$executeRaw`INSERT INTO "_RoleToUser" ("A", "B") VALUES (${adminRole.id}, ${adminUser.id}) ON CONFLICT DO NOTHING`;

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