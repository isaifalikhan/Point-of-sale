import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const user = requireUser(req);

  const shift = await prisma.shift.create({
    data: {
      userId: user.sub,
      tenantId: user.tenantId,
      status: 'ACTIVE',
    },
  });

  return NextResponse.json(shift);
}

