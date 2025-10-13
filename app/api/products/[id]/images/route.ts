import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

// 商品の画像を取得するAPI
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

    // ProductImageテーブルから画像を取得
    const images = await prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      images: images.map(image => ({
        id: image.id,
        url: image.url,
        thumbnailUrl: image.thumbnailUrl,
        filename: image.filename,
        category: image.category,
        description: image.description,
        sortOrder: image.sortOrder,
        createdAt: image.createdAt.toISOString(),
        updatedAt: image.updatedAt.toISOString(),
      })),
    });

  } catch (error) {
    console.error('商品画像取得エラー:', error);
    return NextResponse.json(
      { error: '商品画像の取得に失敗しました' },
      { status: 500 }
    );
  }
}
