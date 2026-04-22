import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const user = requireUser(req);
  const body = await req.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });

  const created = await prisma.menuCategory.create({
    data: { name: String(body.name), tenantId: user.tenantId },
  });
  return NextResponse.json(created);
}

export async function GET(req: NextRequest) {
  const user = requireUser(req);
  const categories = await prisma.menuCategory.findMany({
    where: { tenantId: user.tenantId },
    include: { items: true },
  });
  return NextResponse.json(categories);
}

