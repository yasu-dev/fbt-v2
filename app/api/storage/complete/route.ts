import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('[DEBUG] 保管完了API開始');
    
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
    const { productId, productName, storageLocation, sellerId, sellerName } = body;
    
    console.log('[DEBUG] 受信データ:', {
      productId,
      productName,
      storageLocation,
      sellerId,
      sellerName
    });

    if (!productId || !sellerId) {
      return NextResponse.json(
        { error: '商品IDとセラーIDは必須です。' },
        { status: 400 }
      );
    }

    // セラーに保管完了通知を送信
    const notificationId = `storage-complete-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const title = '保管完了';
    const message = `商品「${productName || '商品'}」の保管が完了しました。出品準備が整いました。保管場所: ${storageLocation || '倉庫A'}`;
    const metadata = JSON.stringify({
      productId,
      productName: productName || '商品',
      storageLocation: storageLocation || '倉庫A',
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
        false, 'medium', 'storage_complete', 'listing', ${metadata},
        datetime('now'), datetime('now')
      )
    `;

    console.log('[DEBUG] セラー通知作成完了:', notificationId);

    // 出品準備完了の処理（ここでは模擬実装）
    console.log('[DEBUG] 出品準備完了処理完了');

    return NextResponse.json({
      success: true,
      message: '保管が完了し、セラーに通知を送信しました。',
      notificationId
    });

  } catch (error) {
    console.error('[ERROR] 保管完了APIエラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}