import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'test@pos-saas.com';
  const targetTenantId = '69dbe755ebcda14c592a45bf'; // Baba Jani Fast Food

  console.log(`Moving user ${email} to tenant ${targetTenantId}...`);
  
  const user = await prisma.user.update({
    where: { email },
    data: { tenantId: targetTenantId },
  });

  console.log('User moved successfully.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
