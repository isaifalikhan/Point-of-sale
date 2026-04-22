import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const user = requireUser(req);

  const [totalSkus, lowStockCount] = await Promise.all([
    prisma.ingredient.count({ where: { tenantId: user.tenantId } }),
    prisma.ingredient.count({
      where: {
        tenantId: user.tenantId,
        currentStock: { lte: prisma.ingredient.fields.lowStockAlert },
      },
    }),
  ]);

  return NextResponse.json({
    totalSkus,
    lowStockCount,
    inventoryValue: 0,
  });
}

