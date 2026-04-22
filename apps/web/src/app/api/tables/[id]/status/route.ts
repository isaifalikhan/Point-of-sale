import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/api-auth';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = requireUser(req);
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body?.status) return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });

  const table = await prisma.table.findFirst({ where: { id, branch: { tenantId: user.tenantId } } });
  if (!table) return NextResponse.json({ message: 'Table not found' }, { status: 404 });

  const updated = await prisma.table.update({
    where: { id },
    data: { status: body.status },
  });
  return NextResponse.json(updated);
}

