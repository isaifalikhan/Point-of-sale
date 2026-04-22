import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { tenant: true }
  });

  console.log('--- User PIN List ---');
  users.forEach(u => {
    console.log(`User: ${u.name}, Email: ${u.email}, Tenant: ${u.tenant.name}, PIN: ${u.pin || 'NOT SET'}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
