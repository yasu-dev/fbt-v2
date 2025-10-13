import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

// 商品の在庫移動履歴を取得するAPI
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    if (!productId) {
      return NextResponse.json(
        { error: '商品IDが指定されていません' },
        { status: 400 }
      );
    }

    // 商品が存在するか確認
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // InventoryMovementテーブルから移動履歴を取得
    const movements = await prisma.inventoryMovement.findMany({
      where: { productId },
      include: {
        fromLocation: true,
        toLocation: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      movements: movements.map(movement => ({
        id: movement.id,
        fromLocationId: movement.fromLocationId,
        toLocationId: movement.toLocationId,
        fromLocation: movement.fromLocation ? {
          id: movement.fromLocation.id,
          code: movement.fromLocation.code,
          name: movement.fromLocation.name,
          zone: movement.fromLocation.zone,
          capacity: movement.fromLocation.capacity,
          currentCount: movement.fromLocation.currentCount,
          description: movement.fromLocation.description,
          createdAt: movement.fromLocation.createdAt.toISOString(),
          updatedAt: movement.fromLocation.updatedAt.toISOString(),
        } : null,
        toLocation: {
          id: movement.toLocation.id,
          code: movement.toLocation.code,
          name: movement.toLocation.name,
          zone: movement.toLocation.zone,
          capacity: movement.toLocation.capacity,
          currentCount: movement.toLocation.currentCount,
          description: movement.toLocation.description,
          createdAt: movement.toLocation.createdAt.toISOString(),
          updatedAt: movement.toLocation.updatedAt.toISOString(),
        },
        reason: movement.reason,
        notes: movement.notes,
        movedBy: movement.movedBy,
        movedAt: movement.movedAt?.toISOString(),
        createdAt: movement.createdAt.toISOString(),
      })),
    });

  } catch (error) {
    console.error('在庫移動履歴取得エラー:', error);
    return NextResponse.json(
      { error: '在庫移動履歴の取得に失敗しました' },
      { status: 500 }
    );
  }
}
