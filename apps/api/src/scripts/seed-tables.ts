import { PrismaClient, TableStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding tables for Baba Jani Fast Food...');

  // Get the main branch for Baba Jani
  const tenant = await prisma.tenant.findFirst({
    where: { name: 'Baba Jani Fast Food' },
    include: { branches: true }
  });

  if (!tenant || !tenant.branches || tenant.branches.length === 0) {
    console.error('Tenant or Branch not found. Have you ran the Baba Jani seed yet?');
    return;
  }

  const branchId = tenant.branches[0].id;

  // Clear existing orders associated with tables to avoid constraint errors
  console.log('Clearing old table assignments...');
  await prisma.order.updateMany({
    where: { branchId, tableId: { not: null } },
    data: { tableId: null }
  });

  // Clear existing tables
  await prisma.table.deleteMany({ where: { branchId } });

  console.log('Creating new tables...');

  // Arrays to hold our create promises
  const tablePromises: Promise<any>[] = [];

  // 1. Family Hall (10 tables)
  for (let i = 1; i <= 10; i++) {
    tablePromises.push(
      prisma.table.create({
        data: {
          name: `Family Hall - Table ${i}`,
          capacity: 4,
          status: TableStatus.AVAILABLE,
          branchId
        }
      })
    );
  }

  // 2. General Hall (14 tables)
  for (let i = 1; i <= 14; i++) {
    tablePromises.push(
      prisma.table.create({
        data: {
          name: `General Hall - Table ${i}`,
          capacity: 2,
          status: TableStatus.AVAILABLE,
          branchId
        }
      })
    );
  }

  // 3. Rooftop (15 tables)
  for (let i = 1; i <= 15; i++) {
    tablePromises.push(
      prisma.table.create({
        data: {
          name: `Rooftop - Table ${i}`,
          capacity: 4,
          status: TableStatus.AVAILABLE,
          branchId
        }
      })
    );
  }

  await Promise.all(tablePromises);

  console.log(`Successfully created 10 Family Hall tables, 14 General Hall tables, and 15 Rooftop tables!`);
}

main()
  .catch((e) => {
    console.error('Error seeding tables:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
