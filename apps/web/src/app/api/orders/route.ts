import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const user = requireUser(req);
  const body = await req.json().catch(() => null);
  if (!body?.type || !body?.branchId || !Array.isArray(body?.items) || body.items.length === 0) {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
  }

  const branch = await prisma.branch.findFirst({
    where: { id: String(body.branchId), tenantId: user.tenantId },
  });
  if (!branch) return NextResponse.json({ message: 'Branch not found' }, { status: 404 });

  const itemIds = body.items.map((i: any) => i.itemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: itemIds }, tenantId: user.tenantId },
    include: { ingredients: true },
  });
  if (menuItems.length !== itemIds.length) {
    return NextResponse.json({ message: 'One or more menu items are invalid or not available' }, { status: 400 });
  }

  let totalAmount = 0;
  const orderItemsData = body.items.map((itemDto: any) => {
    const menuItem = menuItems.find((mi) => mi.id === itemDto.itemId);
    if (!menuItem) throw new Error(`Item ${itemDto.itemId} not found`);

    let itemPrice = menuItem.price;

    if (itemDto.variantName && menuItem.variants) {
      const variant = (menuItem.variants as any[]).find((v) => v.name === itemDto.variantName);
      if (variant) itemPrice = variant.price;
    }

    if (itemDto.addonNames && menuItem.addons) {
      const selectedAddons = (menuItem.addons as any[]).filter((a) => itemDto.addonNames?.includes(a.name));
      const addonsPrice = selectedAddons.reduce((sum, a) => sum + a.price, 0);
      itemPrice += addonsPrice;
    }

    totalAmount += itemPrice * Number(itemDto.quantity ?? 1);

    return {
      itemId: String(itemDto.itemId),
      quantity: Number(itemDto.quantity ?? 1),
      price: itemPrice,
      variantName: itemDto.variantName ?? undefined,
      addonNames: itemDto.addonNames || [],
      notes: itemDto.notes ?? undefined,
    };
  });

  const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      type: body.type,
      totalAmount,
      userId: user.sub,
      tableId: body.tableId,
      branchId: String(body.branchId),
      items: { create: orderItemsData },
      payments:
        body.payments && body.payments.length > 0
          ? {
              create: body.payments.map((p: any) => ({
                amount: Number(p.amount),
                method: p.method,
              })),
            }
          : undefined,
    },
    include: {
      items: { include: { item: true } },
      payments: true,
    },
  });

  if (body.type === 'DINE_IN' && body.tableId) {
    await prisma.table.update({ where: { id: String(body.tableId) }, data: { status: 'OCCUPIED' } });
  }

  // Auto-deduct inventory (non-fatal)
  try {
    for (const orderItem of orderItemsData) {
      const matchedMenuItem = menuItems.find((mi) => mi.id === orderItem.itemId);
      if (matchedMenuItem?.ingredients?.length) {
        for (const recipeLink of matchedMenuItem.ingredients as any[]) {
          const totalDeduction = recipeLink.quantity * orderItem.quantity;
          await prisma.ingredient.updateMany({
            where: { id: recipeLink.ingredientId },
            data: { currentStock: { decrement: totalDeduction } },
          });
        }
      }
    }
  } catch (invErr) {
    console.error('Non-fatal inventory deduct error:', invErr);
  }

  return NextResponse.json(order);
}

export async function GET(req: NextRequest) {
  const user = requireUser(req);
  const branchId = req.nextUrl.searchParams.get('branchId') || undefined;

  const orders = await prisma.order.findMany({
    where: {
      branch: { tenantId: user.tenantId },
      ...(branchId ? { branchId } : {}),
    },
    include: {
      items: { include: { item: true } },
      table: true,
      user: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(orders);
}

