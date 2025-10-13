import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { prisma } from '@/lib/database';

export async function DELETE(request: NextRequest) {
  try {
    // スタッフ権限チェック（不合格商品削除専用）
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: 'スタッフ権限が必要です' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '商品IDが必要です' },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // 不合格（failed）ステータスの商品のみ削除可能
    if (existingProduct.status !== 'failed') {
      return NextResponse.json(
        { error: '保留中（不合格）商品のみ削除できます' },
        { status: 400 }
      );
    }

    // アクティブな注文に含まれていないかチェック
    const activeOrder = await prisma.orderItem.findFirst({
      where: {
        productId: id,
        order: {
          status: {
            in: ['pending', 'confirmed', 'processing', 'shipped'],
          },
        },
      },
    });

    if (activeOrder) {
      return NextResponse.json(
        { error: 'アクティブな注文に含まれている商品は削除できません' },
        { status: 409 }
      );
    }

    // 関連データを削除
    await prisma.inspectionProgress.deleteMany({
      where: { productId: id }
    });

    await prisma.product.delete({
      where: { id },
    });

    // アクティビティログを作成
    await prisma.activity.create({
      data: {
        type: 'delete_failed_product',
        description: `保留中商品 ${existingProduct.name} (${existingProduct.sku}) が削除されました`,
        userId: user.id,
        metadata: JSON.stringify({
          productId: id,
          productName: existingProduct.name,
          sku: existingProduct.sku,
          reason: 'failed_product_removal'
        })
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: '保留中商品を削除しました' 
    });
  } catch (error) {
    console.error('Failed product deletion error:', error);
    
    return NextResponse.json(
      { error: '商品削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

