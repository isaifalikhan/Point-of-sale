import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const user = requireUser(req);

  const orderItems = await prisma.orderItem.findMany({
    where: { order: { branch: { tenantId: user.tenantId } } },
    include: { item: true },
  });

  const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {};
  orderItems.forEach((oi: any) => {
    if (!itemCounts[oi.itemId]) itemCounts[oi.itemId] = { name: oi.item.name, count: 0, revenue: 0 };
    itemCounts[oi.itemId].count += oi.quantity;
    itemCounts[oi.itemId].revenue += oi.price * oi.quantity;
  });

  return NextResponse.json(Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 5));
}

