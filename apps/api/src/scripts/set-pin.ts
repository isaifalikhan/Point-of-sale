import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.update({
    where: { email: 'babajani@pos.com' },
    data: { pin: '1234' }
  });

  console.log(`PIN for ${result.email} has been set to: 1234`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
