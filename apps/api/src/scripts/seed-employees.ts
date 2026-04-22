import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const tenantId = '69dbe755ebcda14c592a45bf';

const employeeData = [
  { name: "Saqib Noor", father_name: "Ibrahim", cnic: "13201-7039412-5" },
  { name: "Bilal Ahmed", father_name: "Noor Ilahi", cnic: "13504-4289206-5" },
  { name: "Muhammad Imtiaz", father_name: "Bashir Ahmed", cnic: "13202-0145371-9" },
  { name: "Muhammad Shoaib", father_name: "Unknown", cnic: "13202-8937749-5" },
  { name: "Muhammad Zubair Ali", father_name: "Noor Shah", cnic: null },
  { name: "Nabeel Ahmed", father_name: "Muhammad Sadiq", cnic: null },
  { name: "Saif Ali", father_name: "Rashid", cnic: null },
  { name: "Saif Ali (Duplicate)", father_name: "Rasheed", cnic: null },
  { name: "Muhammad Afzal Ahmed", father_name: "Muhammad Rafique", cnic: "42401-3928985-1" },
  { name: "Shabbir", father_name: "Haq Nawaz", cnic: "13504-3939231-7" },
  { name: "Unknown 1", father_name: "Unknown", cnic: null, note: "Illegible handwriting" },
  { name: "Unknown 2", father_name: "Unknown", cnic: null, note: "Partially unclear" }
];

async function main() {
  console.log('Seeding Roles...');
  
  // Create default roles if they don't exist
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { id: '69dbe755ebcda14c592a45c0' }, // Random but valid ID if I had it, or use findFirst
      update: {},
      create: { name: 'Manager', permissions: ['ALL'], tenantId }
    }).catch(() => prisma.role.create({ data: { name: 'Manager', permissions: ['ALL'], tenantId } })),
    
    prisma.role.create({
      data: { name: 'Cashier', permissions: ['POS_ACCESS', 'ORDERS_VIEW'], tenantId }
    }),
    
    prisma.role.create({
      data: { name: 'Waiter', permissions: ['POS_ACCESS'], tenantId }
    })
  ]);

  const waiterRole = roles.find(r => r.name === 'Waiter') || roles[2];
  const hashedPassword = await bcrypt.hash('BabaJani123!', 10);

  console.log('Seeding Employees...');

  for (const emp of employeeData) {
    const email = `${emp.name.toLowerCase().replace(/\s+/g, '.')}@babajani.com`;
    
    try {
      await prisma.user.upsert({
        where: { email },
        update: {
          fatherName: emp.father_name,
          cnic: emp.cnic,
          roleId: waiterRole.id,
          pin: '1234'
        },
        create: {
          name: emp.name,
          email,
          password: hashedPassword,
          tenantId,
          roleId: waiterRole.id,
          pin: '1234',
          fatherName: emp.father_name,
          cnic: emp.cnic
        }
      });
      console.log(`Added/Updated: ${emp.name}`);
    } catch (e) {
      console.error(`Failed to add ${emp.name}:`, e.message);
    }
  }

  console.log('Finished Seeding Employees.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
