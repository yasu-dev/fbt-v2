import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

// バーコードから商品を検索するAPI
export async function GET(
  request: NextRequest,
  { params }: { params: { barcode: string } }
) {
  try {
    const barcode = params.barcode;

    if (!barcode) {
      return NextResponse.json(
        { error: 'バーコードが指定されていません' },
        { status: 400 }
      );
    }

    console.log('[バーコード検索] バーコード:', barcode);

    // まずSKUとして検索
    let product = await prisma.product.findUnique({
      where: { sku: barcode },
      select: {
        id: true,
        name: true,
        sku: true,
        status: true,
        currentLocationId: true,
        currentLocation: {
          select: {
            code: true,
            name: true,
          }
        }
      }
    });

    // SKUで見つからない場合は部分一致検索
    if (!product) {
      product = await prisma.product.findFirst({
        where: {
          OR: [
            { sku: { contains: barcode } },
            { name: { contains: barcode } },
          ]
        },
        select: {
          id: true,
          name: true,
          sku: true,
          status: true,
          currentLocationId: true,
          currentLocation: {
            select: {
              code: true,
              name: true,
            }
          }
        }
      });
    }

    if (!product) {
      // デモ用: 任意の商品を返す
      const demoProduct = await prisma.product.findFirst({
        select: {
          id: true,
          name: true,
          sku: true,
          status: true,
          currentLocationId: true,
          currentLocation: {
            select: {
              code: true,
              name: true,
            }
          }
        }
      });

      if (demoProduct) {
        console.log('[バーコード検索] デモ商品を使用:', demoProduct.sku);
        return NextResponse.json({
          ...demoProduct,
          isDemo: true,
          message: `バーコード ${barcode} に対応する商品が見つからないため、デモ商品を表示しています`
        });
      }

      return NextResponse.json(
        { error: '商品が見つかりません', barcode },
        { status: 404 }
      );
    }

    console.log('[バーコード検索] 商品発見:', product.sku, product.name);

    return NextResponse.json(product);
  } catch (error) {
    console.error('[バーコード検索エラー]', error);
    return NextResponse.json(
      { error: 'バーコード検索中にエラーが発生しました' },
      { status: 500 }
    );
  }
}