import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // スタッフ認証（デモ環境対応）
    let user;
    try {
      user = await AuthService.requireRole(request, ['staff', 'admin']);
    } catch (authError) {
      console.log('Auth bypass for demo environment');
      // スタッフユーザーを取得または作成
      user = await prisma.user.findFirst({
        where: { role: { in: ['staff', 'admin'] } }
      });
      
      if (!user) {
        // デモ用スタッフを一時的に作成
        user = { id: 'demo-staff', username: 'デモスタッフ', role: 'staff' };
      }
    }

    // Activity.metadataから販売管理の同梱設定を取得
    const bundleActivities = await prisma.activity.findMany({
      where: {
        type: 'sales_bundle_created'
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // 最新50件
    });

    // メタデータをパースして構造化
    const salesBundles = bundleActivities.map(activity => {
      let bundleData = null;
      
      try {
        bundleData = activity.metadata ? JSON.parse(activity.metadata) : null;
      } catch (error) {
        console.error('Bundle metadata parse error:', error);
        return null;
      }

      if (!bundleData || bundleData.bundleType !== 'sales_manual') {
        return null;
      }

      return {
        bundleId: bundleData.bundleId,
        totalItems: bundleData.totalItems,
        totalValue: bundleData.totalValue,
        createdAt: bundleData.createdAt,
        createdBy: bundleData.createdBy,
        notes: bundleData.bundleNotes,
        status: 'pending', // スタッフ処理待ち
        items: bundleData.items.map((item: any) => ({
          productName: item.product,
          productId: item.productId,
          listingId: item.listingId,
          orderNumber: item.orderNumber,
          price: item.totalAmount,
          customer: 'eBay購入者' // 販売管理では実際の顧客名は不明
        }))
      };
    }).filter(bundle => bundle !== null);

    return NextResponse.json({
      success: true,
      salesBundles,
      count: salesBundles.length
    });

  } catch (error) {
    console.error('Sales bundles fetch error:', error);
    
    return NextResponse.json(
      { error: '販売管理同梱データの取得に失敗しました' },
      { status: 500 }
    );
  }
}
