import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/api-auth';

export async function GET(req: NextRequest, ctx: { params: Promise<{ menuItemId: string }> }) {
  const user = requireUser(req);
  const { menuItemId } = await ctx.params;

  const links = await prisma.menuItemIngredient.findMany({
    where: { menuItemId, menuItem: { tenantId: user.tenantId } },
    include: { ingredient: true },
  });
  return NextResponse.json(links);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ menuItemId: string }> }) {
  const user = requireUser(req);
  const { menuItemId } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body?.ingredientId || body?.quantity === undefined) {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
  }

  const [menuItem, ingredient] = await Promise.all([
    prisma.menuItem.findFirst({ where: { id: menuItemId, tenantId: user.tenantId } }),
    prisma.ingredient.findFirst({ where: { id: String(body.ingredientId), tenantId: user.tenantId } }),
  ]);

  if (!menuItem || !ingredient) {
    return NextResponse.json({ message: 'Menu Item or Ingredient not found' }, { status: 404 });
  }

  const existing = await prisma.menuItemIngredient.findFirst({
    where: { menuItemId, ingredientId: String(body.ingredientId) },
  });

  const upserted = await prisma.menuItemIngredient.upsert({
    where: { id: existing?.id ?? '000000000000000000000000' },
    update: { quantity: Number(body.quantity) },
    create: {
      menuItemId,
      ingredientId: String(body.ingredientId),
      quantity: Number(body.quantity),
    },
  });

  return NextResponse.json(upserted);
}

