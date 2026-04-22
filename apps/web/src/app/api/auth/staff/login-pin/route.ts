import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { requireUser, getJwtSecret } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const requester = requireUser(req);
  const body = await req.json().catch(() => null);
  if (!body?.pin) return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });

  const user = await prisma.user.findFirst({
    where: { pin: String(body.pin), tenantId: requester.tenantId },
    include: { role: true },
  });
  if (!user) return NextResponse.json({ message: 'Invalid PIN code' }, { status: 401 });

  const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
  const payload = { sub: user.id, tenantId: user.tenantId, businessType: tenant?.businessType || 'RESTAURANT' };
  const accessToken = jwt.sign(payload, getJwtSecret());

  return NextResponse.json({
    accessToken,
    user: { name: user.name, role: user.role?.name || 'Admin' },
  });
}

