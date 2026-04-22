import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const user = requireUser(req);

  const activeShift = await prisma.shift.findFirst({
    where: { userId: user.sub, tenantId: user.tenantId, status: 'ACTIVE' },
  });

  if (!activeShift) return NextResponse.json({ success: false, message: 'No active shift' });

  const updated = await prisma.shift.update({
    where: { id: activeShift.id },
    data: { status: 'CLOSED', endTime: new Date() },
  });

  return NextResponse.json(updated);
}

