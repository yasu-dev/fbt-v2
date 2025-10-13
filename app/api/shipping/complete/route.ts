import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('[DEBUG] 出荷完了API開始');
    
    // 認証チェック（スタッフのみ）
    let user;
    try {
      user = await AuthService.requireRole(request, ['staff']);
      console.log('[DEBUG] 認証成功:', user.email);
    } catch (authError) {
      console.error('[ERROR] 認証エラー:', authError);
      return NextResponse.json(
        { error: 'ログインが必要です。再度ログインしてください。' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      orderId, 
      productId, 
      productName, 
      trackingNumber, 
      shippingCarrier, 
      sellerId, 
      sellerName,
      buyerName 
    } = body;
    
    console.log('[DEBUG] 受信データ:', {
      orderId,
      productId,
      productName,
      trackingNumber,
      shippingCarrier,
      sellerId,
      sellerName,
      buyerName
    });

    if (!orderId || !sellerId || !trackingNumber) {
      return NextResponse.json(
        { error: '注文ID、セラーID、追跡番号は必須です。' },
        { status: 400 }
      );
    }

    // セラーに出荷完了通知を送信
    const notificationId = `shipping-complete-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const title = '出荷完了';
    const message = `注文${orderId}の商品「${productName || '商品'}」の出荷が完了しました。追跡番号: ${trackingNumber}`;
    const metadata = JSON.stringify({
      orderId,
      productId: productId || '',
      productName: productName || '商品',
      trackingNumber,
      shippingCarrier: shippingCarrier || 'ヤマト運輸',
      buyerName: buyerName || 'お客様',
      staffId: user.id,
      staffName: user.name || 'スタッフ'
    });

    // Raw SQLで通知作成
    await prisma.$executeRaw`
      INSERT INTO notifications (
        id, type, title, message, userId, "read", priority, 
        notificationType, action, metadata, createdAt, updatedAt
      ) VALUES (
        ${notificationId}, 'success', ${title}, ${message}, ${sellerId},
        false, 'high', 'shipping_complete', 'tracking', ${metadata},
        datetime('now'), datetime('now')
      )
    `;

    console.log('[DEBUG] セラー通知作成完了:', notificationId);

    // アクティビティログに配送準備完了を記録
    if (productId) {
      try {
        await prisma.activity.create({
          data: {
            type: 'shipping_prepared',
            description: `商品 ${productName || '商品'} の配送準備が完了しました`,
            userId: user.id,
            productId: productId,
            metadata: JSON.stringify({
              orderId,
              trackingNumber,
              shippingCarrier: shippingCarrier || 'ヤマト運輸',
              staffId: user.id,
              staffName: user.name || 'スタッフ',
              userRole: 'staff'
            })
          }
        });
        console.log('[DEBUG] 配送準備完了の履歴を記録しました');
      } catch (activityError) {
        console.error('[ERROR] 履歴記録エラー:', activityError);
      }
    }

    // 追跡番号提供の処理（ここでは模擬実装）
    console.log('[DEBUG] 追跡番号提供処理完了:', trackingNumber);

    return NextResponse.json({
      success: true,
      message: '出荷が完了し、セラーに通知を送信しました。',
      notificationId,
      trackingNumber
    });

  } catch (error) {
    console.error('[ERROR] 出荷完了APIエラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}