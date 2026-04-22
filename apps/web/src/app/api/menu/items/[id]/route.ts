import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/api-auth';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = requireUser(req);
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);

  const item = await prisma.menuItem.findFirst({ where: { id, tenantId: user.tenantId } });
  if (!item) return NextResponse.json({ message: 'Menu item not found' }, { status: 404 });

  const updated = await prisma.menuItem.update({
    where: { id },
    data: body ?? {},
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = requireUser(req);
  const { id } = await ctx.params;

  const item = await prisma.menuItem.findFirst({ where: { id, tenantId: user.tenantId } });
  if (!item) return NextResponse.json({ message: 'Menu item not found' }, { status: 404 });

  const deleted = await prisma.menuItem.delete({ where: { id } });
  return NextResponse.json(deleted);
}

