import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const branches = await prisma.branch.findMany({
    include: { tenant: true, tables: true }
  });
  console.log('Total Branches:', branches.length);
  branches.forEach(b => {
    console.log(`Branch: ${b.name}, Tenant: ${b.tenant.name}, Tables: ${b.tables.length}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
