import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('[DEBUG] 検品完了API開始');
    
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
    const { productId, productName, inspectionResult, sellerId, sellerName } = body;
    
    console.log('[DEBUG] 受信データ:', {
      productId,
      productName,
      inspectionResult,
      sellerId,
      sellerName
    });

    if (!productId || !sellerId) {
      return NextResponse.json(
        { error: '商品IDとセラーIDは必須です。' },
        { status: 400 }
      );
    }

    // セラーに検品完了通知を送信
    const notificationId = `inspection-complete-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const title = '検品完了';
    const message = `商品「${productName || '商品'}」の検品が完了しました。結果: ${inspectionResult || '良好'}`;
    const metadata = JSON.stringify({
      productId,
      productName: productName || '商品',
      inspectionResult: inspectionResult || '良好',
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
        false, 'medium', 'inspection_complete', 'storage', ${metadata},
        datetime('now'), datetime('now')
      )
    `;

    console.log('[DEBUG] セラー通知作成完了:', notificationId);

    // 保管バッジ+1の処理（ここでは模擬実装）
    console.log('[DEBUG] 保管バッジ+1処理完了');

    return NextResponse.json({
      success: true,
      message: '検品が完了し、セラーに通知を送信しました。',
      notificationId
    });

  } catch (error) {
    console.error('[ERROR] 検品完了APIエラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}