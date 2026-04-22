import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const user = requireUser(req);
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.branchId) return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });

  const branch = await prisma.branch.findFirst({
    where: { id: String(body.branchId), tenantId: user.tenantId },
  });
  if (!branch) return NextResponse.json({ message: 'Branch not found' }, { status: 404 });

  const created = await prisma.table.create({
    data: {
      name: String(body.name),
      capacity: Number(body.capacity ?? 2),
      branchId: branch.id,
      x: Number(body.x ?? 0),
      y: Number(body.y ?? 0),
    },
  });
  return NextResponse.json(created);
}

export async function GET(req: NextRequest) {
  const user = requireUser(req);
  const tables = await prisma.table.findMany({
    where: { branch: { tenantId: user.tenantId } },
    include: { branch: true },
  });
  return NextResponse.json(tables);
}

