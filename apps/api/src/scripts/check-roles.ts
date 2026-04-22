import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany({
    where: { tenantId: '69dbe755ebcda14c592a45bf' }
  });
  console.log('Roles:', JSON.stringify(roles, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
