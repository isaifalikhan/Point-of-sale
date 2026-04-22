import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany();
  console.log('Total Tenants:', tenants.length);
  tenants.forEach(t => {
    console.log(`Tenant: ${t.name}, Domain: ${t.domain}, ID: ${t.id}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
