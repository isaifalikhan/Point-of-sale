import { NextResponse, type NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const user = requireUser(req);

  const staff = await prisma.user.findMany({
    where: { tenantId: user.tenantId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      pin: true,
      shifts: { orderBy: { startTime: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(staff);
}

export async function POST(req: NextRequest) {
  const user = requireUser(req);
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password || !body?.name) {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
  }

  try {
    const hashedPassword = await bcrypt.hash(String(body.password), 10);
    const created = await prisma.user.create({
      data: {
        email: String(body.email),
        password: hashedPassword,
        name: String(body.name),
        tenantId: user.tenantId,
        roleId: body.roleId || undefined,
        pin: body.pin || undefined,
      },
    });
    return NextResponse.json(created);
  } catch (err: any) {
    // Prisma unique violation (email)
    if (err?.code === 'P2002') {
      return NextResponse.json(
        { message: 'An account with this email address already exists. Please use a unique email for new staff.' },
        { status: 400 },
      );
    }
    return NextResponse.json({ message: err?.message || 'Internal error' }, { status: 400 });
  }
}

