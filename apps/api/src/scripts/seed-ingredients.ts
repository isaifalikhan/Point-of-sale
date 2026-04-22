import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenantId = '69dbe755ebcda14c592a45bf'; // Baba Jani Fast Food
  
  const ingredients = [
    { name: 'Flour', stockUnit: 'kg', currentStock: 50, lowStockAlert: 10 },
    { name: 'Cooking Oil', stockUnit: 'liters', currentStock: 20, lowStockAlert: 5 },
    { name: 'Chicken Breast', stockUnit: 'kg', currentStock: 30, lowStockAlert: 8 },
    { name: 'Potatoes', stockUnit: 'kg', currentStock: 100, lowStockAlert: 20 },
    { name: 'Tomatoes', stockUnit: 'kg', currentStock: 25, lowStockAlert: 5 },
    { name: 'Onions', stockUnit: 'kg', currentStock: 40, lowStockAlert: 8 },
    { name: 'Milk', stockUnit: 'liters', currentStock: 15, lowStockAlert: 5 },
    { name: 'Sugar', stockUnit: 'kg', currentStock: 25, lowStockAlert: 5 },
    { name: 'Cheese', stockUnit: 'kg', currentStock: 10, lowStockAlert: 3 },
    { name: 'Beef Petty', stockUnit: 'pieces', currentStock: 50, lowStockAlert: 15 },
    { name: 'Burger Buns', stockUnit: 'pieces', currentStock: 60, lowStockAlert: 20 },
  ];

  console.log(`Seeding ${ingredients.length} ingredients for tenant ${tenantId}...`);

  for (const item of ingredients) {
    await prisma.ingredient.upsert({
      where: { 
        // Using a composite check logic since we don't have a unique constraint on name+tenantId in the schema, 
        // but we'll search first to avoid duplicates.
        id: (await prisma.ingredient.findFirst({ where: { name: item.name, tenantId } }))?.id || '000000000000000000000000'
      },
      update: {
        currentStock: item.currentStock,
        lowStockAlert: item.lowStockAlert,
      },
      create: {
        ...item,
        tenantId,
      }
    });
  }

  console.log('Ingredients seeded successfully.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
