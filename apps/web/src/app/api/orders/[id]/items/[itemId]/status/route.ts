import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/api-auth';

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; itemId: string }> },
) {
  const user = requireUser(req);
  const { id: orderId, itemId } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body?.status) return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });

  const order = await prisma.order.findFirst({ where: { id: orderId, branch: { tenantId: user.tenantId } } });
  if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

  const updated = await prisma.orderItem.update({
    where: { id: itemId, orderId },
    data: { status: body.status },
    include: { item: true },
  });

  return NextResponse.json(updated);
}

