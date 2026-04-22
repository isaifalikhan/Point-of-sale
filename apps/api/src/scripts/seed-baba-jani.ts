import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const data = {
    "restaurant": {
      "name": "Baba Jani Fast Food",
      "type": "Fast Food",
      "timings": "08:00 AM - 11:00 PM",
      "contact": ["0312-7887056", "0347-4040466", "0340-4097901"],
      "currency": "PKR"
    },
    "categories": [
      {
        "name": "Pizza",
        "has_variants": true,
        "variant_type": "size",
        "variants": ["Regular", "Medium", "Large", "Extra Large"],
        "products": [
          { "name": "Chicken Tikka Pizza", "prices": { "Regular": 490, "Medium": 990, "Large": 1490, "Extra Large": 1990 } },
          { "name": "Chicken Fajita Pizza", "prices": { "Regular": 490, "Medium": 990, "Large": 1490, "Extra Large": 1990 } },
          { "name": "Chicken Supreme Pizza", "prices": { "Regular": 490, "Medium": 990, "Large": 1490, "Extra Large": 1990 } },
          { "name": "Chicken Lover Pizza", "prices": { "Regular": 490, "Medium": 990, "Large": 1490, "Extra Large": 1990 } },
          { "name": "Chicken BBQ Pizza", "prices": { "Regular": 490, "Medium": 990, "Large": 1490, "Extra Large": 1990 } },
          { "name": "Veggie Pizza", "prices": { "Regular": 490, "Medium": 990, "Large": 1490, "Extra Large": 1990 } },
          { "name": "Cheese Lover Pizza", "prices": { "Regular": 490, "Medium": 990, "Large": 1490, "Extra Large": 1990 } },
          { "name": "Hot & Spicy Pizza", "prices": { "Regular": 490, "Medium": 990, "Large": 1490, "Extra Large": 1990 } }
        ],
        "addons": [
          { "name": "Extra Topping (Regular)", "price": 49 },
          { "name": "Extra Topping (Medium)", "price": 99 },
          { "name": "Extra Topping (Large)", "price": 149 },
          { "name": "Extra Topping (Extra Large)", "price": 199 }
        ]
      },
      {
        "name": "Burgers",
        "products": [
          { "name": "Zinger Burger", "price": 150 },
          { "name": "Zinger Cheese Burger", "price": 180 },
          { "name": "Chicken Burger", "price": 120 },
          { "name": "Chicken Cheese Burger", "price": 150 },
          { "name": "Double Chicken Burger", "price": 180 },
          { "name": "Anda Shami Burger", "price": 100 },
          { "name": "Shami Burger", "price": 80 }
        ]
      },
      {
        "name": "Shawarma",
        "products": [
          { "name": "Chicken Shawarma", "price": 120 },
          { "name": "Special Shawarma", "price": 150 },
          { "name": "Zinger Shawarma", "price": 180 },
          { "name": "Zinger Cheese Shawarma", "price": 200 },
          { "name": "Chicken Cheese Shawarma", "price": 180 },
          { "name": "Chicken Cheese Platter", "price": 350 }
        ]
      },
      {
        "name": "Paratha Roll",
        "products": [
          { "name": "Chicken Paratha Roll", "price": 150 },
          { "name": "Chicken Cheese Roll", "price": 180 },
          { "name": "Zinger Paratha Roll", "price": 180 },
          { "name": "Zinger Cheese Roll", "price": 200 }
        ]
      },
      {
        "name": "Broast",
        "products": [
          { "name": "1 Piece Broast", "price": 150 },
          { "name": "2 Piece Broast", "price": 280 },
          { "name": "3 Piece Broast", "price": 400 },
          { "name": "5 Piece Broast", "price": 650 }
        ]
      },
      {
        "name": "Biryani",
        "products": [
          { "name": "Chicken Biryani", "price": 150 },
          { "name": "Single Biryani", "price": 120 },
          { "name": "Special Biryani", "price": 200 },
          { "name": "Raita + Salad", "price": 50 }
        ]
      },
      {
        "name": "Chinese",
        "products": [
          { "name": "Chicken Chow Mein", "price": 450 },
          { "name": "Chicken Fried Rice", "price": 350 },
          { "name": "Vegetable Rice", "price": 250 },
          { "name": "Manchurian", "price": 450 }
        ]
      },
      {
        "name": "Wings",
        "products": [
          { "name": "6 Piece Wings", "price": 400 },
          { "name": "12 Piece Wings", "price": 750 }
        ]
      },
      {
        "name": "Fries",
        "products": [
          { "name": "French Fries", "price": 150 },
          { "name": "Garlic Fries", "price": 180 },
          { "name": "Chicken Fries", "price": 250 }
        ]
      },
      {
        "name": "Nuggets",
        "products": [
          { "name": "6 Piece Nuggets", "price": 200 },
          { "name": "12 Piece Nuggets", "price": 350 }
        ]
      },
      {
        "name": "Sandwich",
        "products": [
          { "name": "Club Sandwich", "price": 300 },
          { "name": "Cold Sandwich", "price": 200 }
        ]
      },
      {
        "name": "Pasta",
        "products": [
          { "name": "Cream Pasta", "price": 600 },
          { "name": "Chicken Pasta", "price": 650 },
          { "name": "Alfredo Pasta", "price": 600 }
        ]
      },
      {
        "name": "Soup",
        "products": [
          { "name": "Chicken Corn Soup", "price": 150 },
          { "name": "Hot & Sour Soup", "price": 180 },
          { "name": "Special Soup", "price": 200 }
        ]
      },
      {
        "name": "Chat",
        "products": [
          { "name": "Chaat Regular", "price": 150 },
          { "name": "Special Chaat", "price": 200 }
        ]
      },
      {
        "name": "Snacks",
        "products": [
          { "name": "Samosa", "price": 30 },
          { "name": "Spring Roll", "price": 100 },
          { "name": "Chicken Roll", "price": 150 },
          { "name": "Aloo Pakora Plate", "price": 100 }
        ]
      },
      {
        "name": "Gol Gappay",
        "products": [
          { "name": "1 Plate", "price": 120 },
          { "name": "6 Pieces", "price": 80 }
        ]
      },
      {
        "name": "Milkshakes",
        "products": [
          { "name": "Mango Shake", "price": 200 },
          { "name": "Banana Shake", "price": 180 },
          { "name": "Apple Shake", "price": 200 },
          { "name": "Dates Shake", "price": 250 }
        ]
      },
      {
        "name": "Ice Cream",
        "products": [
          { "name": "Ice Cream", "price": 100 },
          { "name": "Extra Cream", "price": 150 },
          { "name": "Vanilla Cream", "price": 120 },
          { "name": "Special Falooda", "price": 200 }
        ]
      },
      {
        "name": "Sweets",
        "products": [
          { "name": "Fruit Chat", "price": 200 },
          { "name": "Russian Salad", "price": 250 }
        ]
      },
      {
        "name": "Tea & Coffee",
        "products": [
          { "name": "Quetta Special Tea", "price": 80 },
          { "name": "Doodh Patti", "price": 100 },
          { "name": "Green Tea", "price": 80 },
          { "name": "Coffee", "price": 120 }
        ]
      }
    ]
  };

  console.log('Starting seed for Baba Jani Fast Food...');

  // 1. Get or Create Tenant
  let tenant = await prisma.tenant.findFirst({
    where: { 
      OR: [
        { name: data.restaurant.name },
        { name: 'Global POS Demo' }
      ]
    }
  });

  if (tenant) {
    // Update if it was the demo tenant
    tenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: { 
        name: data.restaurant.name,
        domain: 'babajani.pos.com'
      }
    });
  } else {
    tenant = await prisma.tenant.create({
      data: {
        name: data.restaurant.name,
        domain: 'babajani.pos.com',
        businessType: 'RESTAURANT',
        branches: {
          create: {
            name: 'Main Branch',
          }
        }
      }
    });
  }

  const tenantId = tenant.id;
  const branch = await prisma.branch.findFirst({ where: { tenantId } });
  const branchId = branch!.id;

  // 2. Clear existing categories and items for this tenant
  // First, clear orders and payments to prevent relational constraint errors
  const orders = await prisma.order.findMany({ where: { branchId } });
  const orderIds = orders.map(o => o.id);
  await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
  await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
  await prisma.order.deleteMany({ where: { branchId } });

  await prisma.menuItem.deleteMany({ where: { tenantId } });
  await prisma.menuCategory.deleteMany({ where: { tenantId } });


  // Image mapping for categories
  const categoryImages: Record<string, string> = {
    "Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80",
    "Burgers": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
    "Shawarma": "https://images.unsplash.com/photo-1619881589316-56c7f9e6b587?w=500&q=80",
    "Paratha Roll": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80",
    "Broast": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80",
    "Biryani": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&q=80",
    "Chinese": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&q=80",
    "Wings": "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&q=80",
    "Fries": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80",
    "Nuggets": "https://images.unsplash.com/photo-1562967914-01efa7e87832?w=500&q=80",
    "Sandwich": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80",
    "Pasta": "https://images.unsplash.com/photo-1621996311210-2a3ca89f7f45?w=500&q=80",
    "Soup": "https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80",
    "Chat": "https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=500&q=80",
    "Snacks": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80",
    "Gol Gappay": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80", // reusing snacks
    "Milkshakes": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&q=80",
    "Ice Cream": "https://images.unsplash.com/photo-1497034825429-c343d706a68f?w=500&q=80",
    "Sweets": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&q=80",
    "Tea & Coffee": "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&q=80"
  };

  // 3. Import Categories and Items
  for (const catData of data.categories) {
    const category = await prisma.menuCategory.create({
      data: {
        name: catData.name,
        tenantId,
      }
    });

    for (const prodData of catData.products) {
      const variants = (prodData as any).prices 
        ? Object.entries((prodData as any).prices).map(([name, price]) => ({ name, price: price as number }))
        : [];
      
      const addons = (catData as any).addons || [];
      const image = categoryImages[catData.name] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80"; // fallback image

      await prisma.menuItem.create({
        data: {
          name: prodData.name,
          price: (prodData as any).price || 0,
          image,
          categoryId: category.id,
          tenantId,
          variants: variants.length > 0 ? { set: variants } : undefined,
          addons: addons.length > 0 ? { set: addons.map((a: any) => ({ name: a.name, price: a.price })) } : undefined,
        }
      });
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
