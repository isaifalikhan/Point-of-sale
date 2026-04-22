import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { tenant: true }
  });
  console.log('Total Users:', users.length);
  users.forEach(u => {
    console.log(`User: ${u.email}, Name: ${u.name}, Tenant: ${u.tenant.name}, TenantID: ${u.tenant.id}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
