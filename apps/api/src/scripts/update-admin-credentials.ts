import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const oldEmail = 'admin@pos.com';
  const newEmail = 'babajani@pos.com';
  const newPassword = 'BabaJani123!';

  console.log(`Updating user ${oldEmail} to ${newEmail}...`);
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const user = await prisma.user.update({
    where: { email: oldEmail },
    data: { 
      email: newEmail,
      password: hashedPassword 
    },
  });

  console.log('User credentials updated successfully.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
