import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/orders.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(tenantId: string, userId: string, dto: CreateOrderDto) {
    // 1. Verify branch belongs to tenant
    const branch = await this.prisma.branch.findFirst({
      where: { id: dto.branchId, tenantId },
    });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // 2. Fetch all menu items simultaneously to verify they exist and calculate price
    const itemIds = dto.items.map(i => i.itemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: itemIds }, tenantId },
      include: { ingredients: true }
    });

    if (menuItems.length !== itemIds.length) {
      throw new BadRequestException('One or more menu items are invalid or not available');
    }

    // 3. Calculate total amount
    let totalAmount = 0;
    const orderItemsData = dto.items.map(itemDto => {
      const menuItem = menuItems.find(mi => mi.id === itemDto.itemId);
      if (!menuItem) throw new BadRequestException(`Item ${itemDto.itemId} not found`);

      // Base price
      let itemPrice = menuItem.price;

      // Variant price (if selected)
      if (itemDto.variantName && menuItem.variants) {
        const variant = (menuItem.variants as any[]).find(v => v.name === itemDto.variantName);
        if (variant) {
          itemPrice = variant.price;
        }
      }

      // Addons price
      if (itemDto.addonNames && menuItem.addons) {
        const selectedAddons = (menuItem.addons as any[]).filter(a => itemDto.addonNames?.includes(a.name));
        const addonsPrice = selectedAddons.reduce((sum, a) => sum + a.price, 0);
        itemPrice += addonsPrice;
      }

      totalAmount += itemPrice * itemDto.quantity;

      return {
        itemId: itemDto.itemId,
        quantity: itemDto.quantity,
        price: itemPrice,
        variantName: itemDto.variantName,
        addonNames: itemDto.addonNames || [],
        notes: itemDto.notes,
      };
    });

    // 4. Generate order number
    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    // 5. Create Order and Payment
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        type: dto.type,
        totalAmount,
        userId,
        tableId: dto.tableId,
        branchId: dto.branchId,
        items: {
          create: orderItemsData,
        },
        payments: dto.payments && dto.payments.length > 0 ? {
          create: dto.payments.map(p => ({
            amount: p.amount,
            method: p.method,
          }))
        } : undefined,
      },

      include: {
        items: { include: { item: true } },
        payments: true,
      }
    });

    if (dto.type === 'DINE_IN' && dto.tableId) {
      await this.prisma.table.update({
        where: { id: dto.tableId },
        data: { status: 'OCCUPIED' }
      });
    }

    // 6. Auto-Deduct Inventory
    try {
       for (const orderItem of orderItemsData) {
          const matchedMenuItem = menuItems.find(mi => mi.id === orderItem.itemId);
          if (matchedMenuItem && matchedMenuItem.ingredients && matchedMenuItem.ingredients.length > 0) {
             for (const recipeLink of matchedMenuItem.ingredients) {
                const totalDeduction = recipeLink.quantity * orderItem.quantity;
                await this.prisma.ingredient.updateMany({
                   where: { id: recipeLink.ingredientId },
                   data: {
                      currentStock: { decrement: totalDeduction }
                   }
                });
             }
          }
       }
    } catch (invErr) {
       console.error("Non-fatal inventory deduct error:", invErr);
    }

    return order;

  }

  async getOrders(tenantId: string, branchId?: string) {
    return this.prisma.order.findMany({
      where: {
        branch: { tenantId },
        ...(branchId ? { branchId } : {}),
      },
      include: {
        items: { include: { item: true } },
        table: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(tenantId: string, orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, branch: { tenantId } },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status },
    });
  }

  async updateOrderItemStatus(tenantId: string, orderId: string, itemId: string, status: any) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, branch: { tenantId } },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.orderItem.update({
      where: { id: itemId, orderId },
      data: { status },
      include: { item: true }
    });
  }
}
