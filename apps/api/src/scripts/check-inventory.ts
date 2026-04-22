import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const menuItems = await prisma.menuItem.findMany();
  const ingredients = await prisma.ingredient.findMany();
  
  console.log('Total Menu Items:', menuItems.length);
  menuItems.forEach(i => console.log(`Item: ${i.name}, Price: ${i.price}`));

  console.log('\nTotal Ingredients:', ingredients.length);
  ingredients.forEach(i => console.log(`Ingredient: ${i.name}, Stock: ${i.currentStock} ${i.stockUnit}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
