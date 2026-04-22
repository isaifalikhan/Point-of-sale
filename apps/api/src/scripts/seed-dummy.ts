import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@pos.com';
  const password = 'password123';
  const businessName = 'Global POS Demo';

  console.log('--- Seeding Dummy Account ---');

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`User ${email} already exists. Skipping.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: businessName,
        businessType: 'RESTAURANT',
        branches: {
          create: {
            name: 'Main Branch',
          },
        },
      },
    });

    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Admin User',
        tenantId: tenant.id,
      },
    });

    return { user, tenant };
  });

  console.log('Dummy account created successfully!');
  console.log('Email:', result.user.email);
  console.log('Password:', password);
  console.log('Tenant ID:', result.tenant.id);
}

main()
  .catch((e) => {
    console.error('Error seeding dummy account:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
