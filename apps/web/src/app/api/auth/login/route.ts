import { NextResponse, type NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { getJwtSecret } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: String(body.email) },
    include: { role: true },
  });

  if (!user) return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });

  const ok = await bcrypt.compare(String(body.password), user.password);
  if (!ok) return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });

  const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
  const payload = { sub: user.id, tenantId: user.tenantId, businessType: tenant?.businessType || 'RESTAURANT' };
  const accessToken = jwt.sign(payload, getJwtSecret());

  return NextResponse.json({
    accessToken,
    user: { name: user.name, role: user.role?.name || 'Admin' },
  });
}

