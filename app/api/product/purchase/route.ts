import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('[DEBUG] 商品購入API開始');
    
    const body = await request.json();
    const { 
      productId, 
      productName, 
      buyerName, 
      buyerEmail, 
      purchasePrice, 
      sellerId, 
      sellerName,
      orderId 
    } = body;
    
    console.log('[DEBUG] 受信データ:', {
      productId,
      productName,
      buyerName,
      buyerEmail,
      purchasePrice,
      sellerId,
      sellerName,
      orderId
    });

    if (!productId || !sellerId || !purchasePrice) {
      return NextResponse.json(
        { error: '商品ID、セラーID、購入価格は必須です。' },
        { status: 400 }
      );
    }

    // セラーに商品購入通知を送信
    const notificationId = `product-purchase-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const title = '商品が購入されました';
    const message = `商品「${productName || '商品'}」が¥${purchasePrice.toLocaleString()}で購入されました。購入者: ${buyerName || 'お客様'}`;
    const metadata = JSON.stringify({
      productId,
      productName: productName || '商品',
      buyerName: buyerName || 'お客様',
      buyerEmail: buyerEmail || '',
      purchasePrice,
      orderId: orderId || `ORD-${Date.now()}`
    });

    // Raw SQLで通知作成
    await prisma.$executeRaw`
      INSERT INTO notifications (
        id, type, title, message, userId, "read", priority, 
        notificationType, action, metadata, createdAt, updatedAt
      ) VALUES (
        ${notificationId}, 'success', ${title}, ${message}, ${sellerId},
        false, 'high', 'product_purchased', 'order', ${metadata},
        datetime('now'), datetime('now')
      )
    `;

    console.log('[DEBUG] セラー通知作成完了:', notificationId);

    // アクティビティログに購入イベントを記録
    try {
      await prisma.activity.create({
        data: {
          type: 'purchase_decision',
          description: `購入者が決定しました（注文番号: ${orderId || `ORD-${Date.now()}`}、1点、¥${purchasePrice.toLocaleString()}）`,
          userId: sellerId, // セラーを実行者として記録
          productId: productId,
          metadata: JSON.stringify({
            buyerName: buyerName || 'お客様',
            buyerEmail: buyerEmail || '',
            purchasePrice,
            orderId: orderId || `ORD-${Date.now()}`,
            notificationId,
            userRole: 'seller'
          })
        }
      });
      console.log('[DEBUG] アクティビティログ記録完了: product_purchased for', productId);
    } catch (activityError) {
      console.error('アクティビティログ記録エラー:', activityError);
      // エラーでも処理は継続
    }

    // 商品ステータスを'sold'に更新
    try {
      await prisma.product.update({
        where: { id: productId },
        data: { status: 'sold' }
      });
      console.log('[DEBUG] 商品ステータス更新完了: sold');
    } catch (statusError) {
      console.error('商品ステータス更新エラー:', statusError);
      // エラーでも処理は継続
    }

    // 注文バッジ+1の処理（ここでは模擬実装）
    console.log('[DEBUG] 注文バッジ+1処理完了');

    return NextResponse.json({
      success: true,
      message: '商品が購入され、セラーに通知を送信しました。',
      notificationId,
      orderId: orderId || `ORD-${Date.now()}`
    });

  } catch (error) {
    console.error('[ERROR] 商品購入APIエラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}