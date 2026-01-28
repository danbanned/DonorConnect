const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 🔐 HASH PASSWORDS FIRST
  const adminPassword = await bcrypt.hash('Admin@1234', 10);
  const staffPassword = await bcrypt.hash('Staff@1234', 10);

  // 🏢 ORGANIZATION
  const organization = await prisma.organization.upsert({
    where: { slug: 'green-street-friends' },
    update: {},
    create: {
      name: 'Green Street Friends School',
      slug: 'green-street-friends',
    }
  });

  // 👑 ADMIN USER
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@greenstreet.org' },
    update: {},
    create: {
      email: 'admin@greenstreet.org',
      name: 'Admin User',
      role: 'ADMIN',
      password: adminPassword, // ✅ FIXED
      organizationId: organization.id,
    }
  });



  // 👤 STAFF USER
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@donorconnect.com' },
    update: {},
    create: {
      email: 'staff@donorconnect.com',
      name: 'Staff User',
      role: 'STAFF',
      password: staffPassword, // ✅ FIXED
      organizationId: organization.id,
    }
  });

  console.log('✅ Seed complete');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
