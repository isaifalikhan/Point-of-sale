import { NextResponse, type NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { getJwtSecret } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password || !body?.name || !body?.businessName || !body?.businessType) {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email: body.email } });
  if (existingUser) {
    return NextResponse.json({ message: 'User already exists' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(String(body.password), 10);

  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: String(body.businessName),
        businessType: body.businessType,
        branches: { create: { name: 'Main Branch' } },
      },
    });

    const user = await tx.user.create({
      data: {
        email: String(body.email),
        password: hashedPassword,
        name: String(body.name),
        tenantId: tenant.id,
      },
    });

    return { user, tenant };
  });

  const payload = { sub: result.user.id, tenantId: result.user.tenantId, businessType: result.tenant.businessType };
  const accessToken = jwt.sign(payload, getJwtSecret());
  return NextResponse.json({ accessToken });
}

