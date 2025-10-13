import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';
import { notificationService } from '@/lib/services/notification.service';

const prisma = new PrismaClient();

/**
 * 在庫レベルをチェックして必要に応じてアラートを送信
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📦 在庫チェック開始');
    
    // スタッフ認証
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    
    // 低在庫の閾値（デフォルト: 3個以下）
    const LOW_STOCK_THRESHOLD = 3;
    const OUT_OF_STOCK_THRESHOLD = 0;
    
    // 在庫レベルが低い商品を取得
    const lowStockProducts = await prisma.product.findMany({
      where: {
        // 在庫数がない場合はmetadataから推定
        OR: [
          {
            // 実際の在庫管理がある場合
            stock: {
              lte: LOW_STOCK_THRESHOLD
            }
          }
          // 現在は商品テーブルにstockフィールドがないため、
          // statusで在庫状況を判断（実装簡略化のため）
        ],
        status: {
          in: ['in_stock', 'low_stock']
        }
      },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            fullName: true,
            notificationSettings: true
          }
        }
      }
    });

    console.log(`🔍 低在庫商品チェック: ${lowStockProducts.length}件の商品を確認`);

    // 在庫アラートを送信すべき商品をグループ化（セラー別）
    const alertsByUser = new Map<string, {
      sellerId: string;
      products: typeof lowStockProducts;
    }>();

    for (const product of lowStockProducts) {
      const sellerId = product.sellerId;
      
      if (!alertsByUser.has(sellerId)) {
        alertsByUser.set(sellerId, {
          sellerId,
          products: []
        });
      }
      
      alertsByUser.get(sellerId)!.products.push(product);
    }

    // 各セラーに在庫アラートを送信
    const notificationResults = [];
    
    for (const [sellerId, data] of alertsByUser) {
      try {
        const outOfStockProducts = data.products.filter(p => p.status === 'out_of_stock');
        const lowStockProducts = data.products.filter(p => p.status === 'low_stock');
        
        let title = '';
        let message = '';
        
        if (outOfStockProducts.length > 0 && lowStockProducts.length > 0) {
          title = '在庫切れ・低在庫アラート';
          message = `在庫切れ商品: ${outOfStockProducts.length}件、低在庫商品: ${lowStockProducts.length}件があります。早急に在庫補充をご検討ください。`;
        } else if (outOfStockProducts.length > 0) {
          title = '在庫切れアラート';
          message = `在庫切れ商品が${outOfStockProducts.length}件あります。早急に在庫補充が必要です。`;
        } else {
          title = '低在庫アラート';
          message = `低在庫商品が${lowStockProducts.length}件あります。在庫補充をご検討ください。`;
        }
        
        const result = await notificationService.sendNotification({
          type: 'inventory_alert',
          title,
          message,
          userId: sellerId,
          metadata: {
            outOfStockCount: outOfStockProducts.length,
            lowStockCount: lowStockProducts.length,
            products: data.products.map(p => ({
              id: p.id,
              name: p.name,
              sku: p.sku,
              status: p.status
            }))
          }
        });
        
        notificationResults.push({
          sellerId,
          success: result,
          productCount: data.products.length
        });
        
      } catch (error) {
        console.error(`在庫アラート送信エラー (セラー: ${sellerId}):`, error);
        notificationResults.push({
          sellerId,
          success: false,
          error: error instanceof Error ? error.message : '不明なエラー'
        });
      }
    }
    
    // アクティビティログを作成
    await prisma.activity.create({
      data: {
        type: 'inventory_check',
        description: `在庫チェック実行: ${lowStockProducts.length}件の在庫問題を検出`,
        userId: user.id,
        metadata: JSON.stringify({
          checkedAt: new Date().toISOString(),
          lowStockCount: lowStockProducts.length,
          alertsSent: notificationResults.filter(r => r.success).length,
          totalSellers: alertsByUser.size
        })
      }
    });

    console.log(`📧 在庫アラート送信完了: ${notificationResults.filter(r => r.success).length}/${notificationResults.length}件成功`);

    return NextResponse.json({
      success: true,
      summary: {
        totalProducts: lowStockProducts.length,
        totalSellers: alertsByUser.size,
        notificationsSent: notificationResults.filter(r => r.success).length,
        notifications: notificationResults
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('在庫チェックエラー:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '在庫チェックに失敗しました' 
      },
      { status: 500 }
    );
  }
}

/**
 * 特定の商品の在庫アラートを手動送信
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    const { productId, alertType = 'low_stock' } = await request.json();
    
    if (!productId) {
      return NextResponse.json(
        { error: '商品IDが必要です' },
        { status: 400 }
      );
    }
    
    // 商品情報を取得
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        }
      }
    });
    
    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }
    
    // 在庫アラートを送信
    const title = alertType === 'out_of_stock' ? '在庫切れアラート' : '低在庫アラート';
    const message = `商品「${product.name}」の${alertType === 'out_of_stock' ? '在庫が切れています' : '在庫が少なくなっています'}。`;
    
    const result = await notificationService.sendNotification({
      type: 'inventory_alert',
      title,
      message,
      userId: product.sellerId,
      metadata: {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        alertType,
        triggeredBy: user.id
      }
    });
    
    // アクティビティログを作成
    await prisma.activity.create({
      data: {
        type: 'manual_inventory_alert',
        description: `手動在庫アラート送信: ${product.name} (${alertType})`,
        userId: user.id,
        productId: product.id,
        metadata: JSON.stringify({
          alertType,
          sentTo: product.seller.email,
          success: result
        })
      }
    });
    
    return NextResponse.json({
      success: result,
      message: result ? 'アラートを送信しました' : 'アラート送信に失敗しました'
    }, { status: result ? 200 : 500 });
    
  } catch (error) {
    console.error('手動在庫アラート送信エラー:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '手動アラート送信に失敗しました' 
      },
      { status: 500 }
    );
  }
}
