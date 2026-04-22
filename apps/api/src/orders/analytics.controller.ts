import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('orders/analytics')
export class AnalyticsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('summary')
  async getSummary(@Request() req: any) {
    const tenantId = req.tenantId;

    const orders = await this.prisma.order.findMany({
      where: { branch: { tenantId } },
      include: { payments: true },
    });

    const totalRevenue = orders.reduce((sum, order) => {
      const paymentSum = order.payments
        .filter(p => p.status === 'COMPLETED')
        .reduce((s, p) => s + p.amount, 0);
      return sum + paymentSum;
    }, 0);

    const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;
    const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'PREPARING').length;

    // Last 7 days chart data (simplified)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await this.prisma.order.findMany({
      where: {
        branch: { tenantId },
        createdAt: { gte: sevenDaysAgo },
      },
      include: { payments: true },
    });

    const revenueForm = {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
    };

    dailyStats.forEach(stat => {
      const dayDiff = Math.floor((new Date().getTime() - new Date(stat.createdAt).getTime()) / (1000 * 3600 * 24));
      if (dayDiff >= 0 && dayDiff < 7) {
        const pay = stat.payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0);
        revenueForm[6 - dayDiff] += pay;
      }
    });

    return {
      totalRevenue,
      totalOrders: orders.length,
      completedOrders,
      pendingOrders,
      averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      recentOrders: orders.slice(0, 5),
      chartData: Object.values(revenueForm),
    };
  }

  @Get('top-items')
  async getTopItems(@Request() req: any) {
    const tenantId = req.tenantId;
    
    // Simplified top items aggregation
    const orderItems = await this.prisma.orderItem.findMany({
      where: { order: { branch: { tenantId } } },
      include: { item: true },
    });

    const itemCounts: Record<string, { name: string, count: number, revenue: number }> = {};

    orderItems.forEach(oi => {
      if (!itemCounts[oi.itemId]) {
        itemCounts[oi.itemId] = { name: oi.item.name, count: 0, revenue: 0 };
      }
      itemCounts[oi.itemId].count += oi.quantity;
      itemCounts[oi.itemId].revenue += oi.price * oi.quantity;
    });

    return Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}
