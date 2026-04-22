import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const user = requireUser(req);

  const orders = await prisma.order.findMany({
    where: { branch: { tenantId: user.tenantId } },
    include: { payments: true },
  });

  const totalRevenue = orders.reduce((sum, order) => {
    const paymentSum = order.payments
      .filter((p: any) => p.status === 'COMPLETED')
      .reduce((s: number, p: any) => s + p.amount, 0);
    return sum + paymentSum;
  }, 0);

  const completedOrders = orders.filter((o: any) => o.status === 'COMPLETED').length;
  const pendingOrders = orders.filter((o: any) => o.status === 'PENDING' || o.status === 'PREPARING').length;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const dailyStats = await prisma.order.findMany({
    where: { branch: { tenantId: user.tenantId }, createdAt: { gte: sevenDaysAgo } },
    include: { payments: true },
  });

  const revenueForm: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  dailyStats.forEach((stat: any) => {
    const dayDiff = Math.floor((Date.now() - new Date(stat.createdAt).getTime()) / (1000 * 3600 * 24));
    if (dayDiff >= 0 && dayDiff < 7) {
      const pay = stat.payments.filter((p: any) => p.status === 'COMPLETED').reduce((s: number, p: any) => s + p.amount, 0);
      revenueForm[6 - dayDiff] += pay;
    }
  });

  return NextResponse.json({
    totalRevenue,
    totalOrders: orders.length,
    completedOrders,
    pendingOrders,
    averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
    recentOrders: orders.slice(0, 5),
    chartData: Object.values(revenueForm),
  });
}

