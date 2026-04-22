import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const user = requireUser(req);
  const items = await prisma.ingredient.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const user = requireUser(req);
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.stockUnit) return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });

  const created = await prisma.ingredient.create({
    data: {
      name: String(body.name),
      stockUnit: String(body.stockUnit),
      currentStock: Number(body.currentStock ?? 0),
      lowStockAlert: Number(body.lowStockAlert ?? 10),
      tenantId: user.tenantId,
    },
  });
  return NextResponse.json(created);
}

