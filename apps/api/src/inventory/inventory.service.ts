import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getInventory(tenantId: string) {
    return this.prisma.ingredient.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async getInventoryStats(tenantId: string) {
    const [totalSkus, lowStockCount, ingredients] = await Promise.all([
      this.prisma.ingredient.count({ where: { tenantId } }),
      this.prisma.ingredient.count({
        where: {
          tenantId,
          currentStock: { lte: this.prisma.ingredient.fields.lowStockAlert },
        },
      }),
      this.prisma.ingredient.findMany({ where: { tenantId } }),
    ]);

    // Simple calculation for "Inventory Value" assuming we had a 'costPrice' field.
    // Since we don't, we'll return a placeholder or 0 for now.
    return {
      totalSkus,
      lowStockCount,
      inventoryValue: 0, 
    };
  }

  async createIngredient(tenantId: string, data: any) {
    return this.prisma.ingredient.create({
      data: {
        name: data.name,
        stockUnit: data.stockUnit,
        currentStock: data.currentStock || 0,
        lowStockAlert: data.lowStockAlert || 10,
        tenantId,
      },
    });
  }

  async updateStock(tenantId: string, id: string, amount: number) {
    const ingredient = await this.prisma.ingredient.findFirst({
      where: { id, tenantId },
    });

    if (!ingredient) throw new NotFoundException('Ingredient not found');

    return this.prisma.ingredient.update({
      where: { id },
      data: { currentStock: ingredient.currentStock + amount },
    });
  }

  // Recipe Management
  async getMenuItemIngredients(tenantId: string, menuItemId: string) {
    return this.prisma.menuItemIngredient.findMany({
      where: { menuItemId, menuItem: { tenantId } },
      include: { ingredient: true },
    });
  }

  async linkIngredientToMenuItem(tenantId: string, menuItemId: string, data: { ingredientId: string; quantity: number }) {
    // Verify names/existence
    const [menuItem, ingredient] = await Promise.all([
      this.prisma.menuItem.findFirst({ where: { id: menuItemId, tenantId } }),
      this.prisma.ingredient.findFirst({ where: { id: data.ingredientId, tenantId } }),
    ]);

    if (!menuItem || !ingredient) throw new NotFoundException('Menu Item or Ingredient not found');

    return this.prisma.menuItemIngredient.upsert({
      where: {
        id: (await this.prisma.menuItemIngredient.findFirst({
          where: { menuItemId, ingredientId: data.ingredientId }
        }))?.id || '000000000000000000000000'
      },
      update: { quantity: data.quantity },
      create: {
        menuItemId,
        ingredientId: data.ingredientId,
        quantity: data.quantity,
      }
    });
  }
}
