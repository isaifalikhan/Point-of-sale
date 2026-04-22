import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.table.findMany();
  console.log(`Found ${tables.length} tables. Arranging into rows...`);

  // Group tables by category (prefix before '-')
  const groups: { [key: string]: any[] } = {};
  
  tables.forEach(table => {
    let category = 'Uncategorized';
    if (table.name.includes('-')) {
      category = table.name.split('-')[0].trim();
    } else if (table.name.toLowerCase().includes('smoke')) {
        category = 'Smoke';
    }
    
    if (!groups[category]) groups[category] = [];
    groups[category].push(table);
  });

  const startX = 50;
  const startY = 50;
  const paddingX = 140; // Horizontal spacing
  const paddingY = 120; // Vertical spacing between rows
  const maxPerRow = 6;  // How many tables before starting a new row within a category

  let currentY = startY;

  for (const category of Object.keys(groups)) {
    console.log(`Arranging Category: ${category} (${groups[category].length} tables)`);
    let currentX = startX;
    let countInRow = 0;

    const sortedTables = groups[category].sort((a, b) => a.name.localeCompare(b.name));

    for (const table of sortedTables) {
      await prisma.table.update({
        where: { id: table.id },
        data: { x: currentX, y: currentY }
      });

      currentX += paddingX;
      countInRow++;

      if (countInRow >= maxPerRow) {
        currentX = startX;
        currentY += paddingY;
        countInRow = 0;
      }
    }
    
    // Extra space between categories
    currentY += paddingY; 
  }

  console.log('All tables arranged into rows successfully.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
