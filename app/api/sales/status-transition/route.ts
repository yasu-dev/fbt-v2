import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('[API] /api/sales/status-transition POST called');
    const { productId } = await request.json();
    if (!productId) {
      console.error('[API] productId missing');
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    // Product.status を listing -> sold に更新
    const product = await prisma.product.update({
      where: { id: productId },
      data: { status: 'sold' },
    });
    console.log('[API] Product updated to sold', { productId });

    // Listing があれば soldAt を付与（存在しなくてもスルー）
    await prisma.listing.updateMany({
      where: { productId: productId },
      data: { status: 'sold', soldAt: new Date() }
    });
    console.log('[API] Listing updatedMany to sold', { productId });

    return NextResponse.json({ success: true, productId: product.id, newStatus: 'sold' });
  } catch (error) {
    console.error('[API] status-transition error', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


