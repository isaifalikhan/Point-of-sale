import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/api-auth';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = requireUser(req);
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);

  const table = await prisma.table.findFirst({ where: { id, branch: { tenantId: user.tenantId } } });
  if (!table) return NextResponse.json({ message: 'Table not found' }, { status: 404 });

  const updated = await prisma.table.update({
    where: { id },
    data: {
      ...(body?.name !== undefined && { name: String(body.name) }),
      ...(body?.capacity !== undefined && { capacity: Number(body.capacity) }),
      ...(body?.x !== undefined && { x: Number(body.x) }),
      ...(body?.y !== undefined && { y: Number(body.y) }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = requireUser(req);
  const { id } = await ctx.params;

  const table = await prisma.table.findFirst({ where: { id, branch: { tenantId: user.tenantId } } });
  if (!table) return NextResponse.json({ message: 'Table not found' }, { status: 404 });

  const deleted = await prisma.table.delete({ where: { id } });
  return NextResponse.json(deleted);
}

