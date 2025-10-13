import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { error: 'itemIdが必要です' },
        { status: 400 }
      );
    }

    console.log('Bundle check for itemId:', itemId);

    // Activity.metadataから該当商品を含む同梱設定を検索
    const bundleActivity = await prisma.activity.findFirst({
      where: {
        type: 'sales_bundle_created',
        metadata: { 
          contains: itemId 
        }
      },
      orderBy: { createdAt: 'desc' } // 最新の同梱設定を取得
    });

    if (!bundleActivity) {
      console.log('No bundle found for itemId:', itemId);
      return NextResponse.json({ 
        bundleGroup: null,
        bundleId: null,
        isBundle: false
      });
    }

    let bundleData;
    try {
      bundleData = bundleActivity.metadata ? JSON.parse(bundleActivity.metadata) : null;
    } catch (error) {
      console.error('Bundle metadata parse error:', error);
      return NextResponse.json({ 
        bundleGroup: null,
        bundleId: null,
        isBundle: false
      });
    }

    if (!bundleData || bundleData.bundleType !== 'sales_manual') {
      return NextResponse.json({ 
        bundleGroup: null,
        bundleId: null,
        isBundle: false
      });
    }

    console.log('Bundle found:', bundleData.bundleId);

    return NextResponse.json({
      bundleGroup: bundleData.items,
      bundleId: bundleData.bundleId,
      isBundle: true,
      totalItems: bundleData.totalItems,
      totalValue: bundleData.totalValue,
      bundleNotes: bundleData.bundleNotes
    });

  } catch (error) {
    console.error('Bundle check error:', error);
    
    return NextResponse.json(
      { 
        error: '同梱設定の確認に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

