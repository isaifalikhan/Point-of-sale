import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const user = requireUser(req);
  const body = await req.json().catch(() => null);
  if (!body?.name || body?.price === undefined || !body?.categoryId) {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
  }

  const category = await prisma.menuCategory.findFirst({
    where: { id: String(body.categoryId), tenantId: user.tenantId },
  });
  if (!category) return NextResponse.json({ message: 'Category not found' }, { status: 404 });

  const created = await prisma.menuItem.create({
    data: {
      name: String(body.name),
      description: body.description ?? undefined,
      price: Number(body.price),
      image: body.image ?? undefined,
      isAvailable: body.isAvailable ?? true,
      categoryId: String(body.categoryId),
      tenantId: user.tenantId,
      variants: body.variants ?? [],
      addons: body.addons ?? [],
    },
  });
  return NextResponse.json(created);
}

export async function GET(req: NextRequest) {
  const user = requireUser(req);
  const items = await prisma.menuItem.findMany({
    where: { tenantId: user.tenantId },
    include: { category: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(items);
}

