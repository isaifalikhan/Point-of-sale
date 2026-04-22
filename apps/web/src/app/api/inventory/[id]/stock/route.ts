import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/api-auth';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = requireUser(req);
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const amount = Number(body?.amount);
  if (!Number.isFinite(amount)) return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });

  const ingredient = await prisma.ingredient.findFirst({ where: { id, tenantId: user.tenantId } });
  if (!ingredient) return NextResponse.json({ message: 'Ingredient not found' }, { status: 404 });

  const updated = await prisma.ingredient.update({
    where: { id },
    data: { currentStock: ingredient.currentStock + amount },
  });
  return NextResponse.json(updated);
}

