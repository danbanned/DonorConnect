// scripts/seed-admin.js
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    // Create organization
    const organization = await prisma.organization.upsert({
      where: { slug: 'donorconnect-admin' },
      update: {},
      create: {
        name: 'DonorConnect Admin',
        slug: 'donorconnect-admin',
        settings: {}
      }
    });

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('Admin@1234', saltRounds);

    // Create admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@donorconnect.com' },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
        organizationId: organization.id
      },
      create: {
        email: 'admin@donorconnect.com',
        name: 'System Administrator',
        password: hashedPassword,
        role: 'ADMIN',
        organizationId: organization.id
      }
    });

    // Create staff user
    const staffPassword = await bcrypt.hash('Staff@1234', saltRounds);
    const staff = await prisma.user.upsert({
      where: { email: 'staff@donorconnect.com' },
      update: {
        password: staffPassword,
        role: 'STAFF',
        organizationId: organization.id
      },
      create: {
        email: 'staff@donorconnect.com',
        name: 'Staff User',
        password: staffPassword,
        role: 'STAFF',
        organizationId: organization.id
      }
    });

    console.log('✅ Admin users seeded successfully!');
    console.log('👑 Admin:', admin.email);
    console.log('👨‍💼 Staff:', staff.email);
    
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();