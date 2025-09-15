// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password', 10);

  // Create Acme Tenant
  const acme = await prisma.tenant.upsert({
    where: { slug: 'acme' },
    update: {},
    create: { name: 'Acme', slug: 'acme', plan: 'free' }
  });

  // Create Globex Tenant
  const globex = await prisma.tenant.upsert({
    where: { slug: 'globex' },
    update: {},
    create: { name: 'Globex', slug: 'globex', plan: 'free' }
  });

  // Acme Users
  await prisma.user.upsert({
    where: { email: 'admin@acme.test' },
    update: {},
    create: { email: 'admin@acme.test', passwordHash: password, role: 'Admin', tenantId: acme.id }
  });
  await prisma.user.upsert({
    where: { email: 'user@acme.test' },
    update: {},
    create: { email: 'user@acme.test', passwordHash: password, role: 'Member', tenantId: acme.id }
  });

  // Globex Users
  await prisma.user.upsert({
    where: { email: 'admin@globex.test' },
    update: {},
    create: { email: 'admin@globex.test', passwordHash: password, role: 'Admin', tenantId: globex.id }
  });
  await prisma.user.upsert({
    where: { email: 'user@globex.test' },
    update: {},
    create: { email: 'user@globex.test', passwordHash: password, role: 'Member', tenantId: globex.id }
  });
}

main()
  .then(() => {
    console.log('Seeding finished!');
    prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
