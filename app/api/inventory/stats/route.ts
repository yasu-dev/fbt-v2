import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export async function GET() {

  try {
    // Get status counts
    const statusCounts = await prisma.product.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // Get category counts
    const categoryCounts = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
    });

    // Get total inventory value
    const totalValue = await prisma.product.aggregate({
      _sum: {
        price: true,
      },
      where: {
        status: {
          not: 'sold'
        }
      }
    });

    // Transform status data
    const statusStats = statusCounts.reduce((acc, item) => {
      const japaneseStatus = item.status.replace('inbound_pending', '入庫待ち')
                                      .replace('inbound', '入庫待ち')
                                      .replace('inspection', '検品')
                                      .replace('storage', '保管')
                                      .replace('listing', '出品')
                                      .replace('ordered', '受注')
                                      .replace('shipping', '出荷')
                                      .replace('delivery', '配送')
                                      .replace('sold', '売約済み')
                                      .replace('workstation', '梱包待ち')
                                      .replace('returned', '返品');
      acc[japaneseStatus] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    // 準備フェーズ: 納品プラン作成・倉庫発送のカウント
    const planStats = await prisma.deliveryPlan.groupBy({
      by: ['status'],
      _count: { _all: true }
    });

    // 納品プラン作成数（Pendingステータス）
    statusStats['納品プラン作成'] = planStats
      .filter(p => p.status === 'Pending')
      .reduce((sum, p) => sum + p._count._all, 0);

    // 倉庫発送数（Shippedステータス）
    statusStats['倉庫発送'] = planStats
      .filter(p => p.status === 'Shipped')
      .reduce((sum, p) => sum + p._count._all, 0);

    // 販売フェーズ: 受注処理のカウント
    const processingOrders = await prisma.order.count({
      where: { status: 'processing' }
    });
    statusStats['受注処理'] = processingOrders;

    // 出荷フェーズ: 梱包・発送のカウント
    const packingShipments = await prisma.shipment.count({
      where: { status: 'packed' }
    });
    statusStats['梱包・発送'] = packingShipments;

    // 購入者受取は既存の配送ステータスを利用
    statusStats['購入者受取'] = statusStats['配送'] || 0;

    // 返品フェーズ: 返品受付・検品・再出品のカウント
    const returnStats = await prisma.return.groupBy({
      by: ['status'],
      _count: { _all: true }
    });

    statusStats['返品受付'] = returnStats
      .find(r => r.status === 'pending')?._count._all || 0;
    statusStats['返品検品'] = returnStats
      .find(r => r.status === 'inspecting')?._count._all || 0;
    statusStats['再出品・廃棄'] = returnStats
      .find(r => r.status === 'approved')?._count._all || 0;

    // Transform category data
    const categoryStats = categoryCounts.reduce((acc, item) => {
      const japaneseCategory = item.category.replace('camera_body', 'カメラ本体')
                                          .replace('lens', 'レンズ')
                                          .replace('watch', '腕時計')
                                          .replace('accessory', 'アクセサリ');
      acc[japaneseCategory] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      statusStats,
      categoryStats,
      totalValue: totalValue._sum.price || 0,
      totalItems: statusCounts.reduce((sum, item) => sum + item._count.id, 0)
    });
  } catch (error) {
    console.error('Inventory stats error:', error);
    

    
    // エラー時はデフォルトデータを返す
    return NextResponse.json({
      statusStats: {},
      categoryStats: {},
      totalValue: 0,
      totalItems: 0
    });
  }
}