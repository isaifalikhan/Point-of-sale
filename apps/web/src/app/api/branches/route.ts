import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const user = requireUser(req);
  const branches = await prisma.branch.findMany({
    where: { tenantId: user.tenantId },
  });
  return NextResponse.json(branches);
}

