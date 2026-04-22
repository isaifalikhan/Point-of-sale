import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.table.findMany({
    include: { branch: { include: { tenant: true } } }
  });
  console.log('Total Tables:', tables.length);
  tables.forEach(t => {
    console.log(`Table: ${t.name}, Branch: ${t.branch.name}, Tenant: ${t.branch.tenant.name}, X: ${t.x}, Y: ${t.y}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
