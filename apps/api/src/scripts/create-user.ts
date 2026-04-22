import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'test@pos-saas.com';
  const password = 'Password123!';
  const name = 'Test Admin';
  const businessName = 'Test POS System';

  console.log('Checking if user exists...');
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('User already exists, updating password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    console.log('User updated successfully.');
  } else {
    console.log('Creating new tenant and user...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: businessName,
          domain: 'test-pos.pos-saas.com',
          businessType: 'RESTAURANT',
          branches: {
            create: {
              name: 'Main Branch',
            }
          }
        },
      });

      await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          tenantId: tenant.id,
        },
      });
    });
    console.log('User and tenant created successfully.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
