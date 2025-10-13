import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// テスト用通知エンドポイント（認証なし）
export async function GET(request: NextRequest) {
  try {
    console.log('[TEST] テスト通知API開始');
    
    const searchParams = request.nextUrl.searchParams;
    const userRole = searchParams.get('role') || 'staff';
    let userId = searchParams.get('userId');
    
    // userIdが指定されていない場合、ロールに基づいてデフォルトユーザーを取得
    if (!userId) {
      try {
        const defaultUser = await prisma.user.findFirst({
          where: { role: userRole },
          select: { id: true }
        });
        userId = defaultUser?.id || 'cmfdouvrq0001mku12p0r43zh';
      } catch (error) {
        console.error('[TEST] デフォルトユーザー取得エラー:', error);
        userId = 'cmfdouvrq0001mku12p0r43zh';
      }
    }
    
    console.log('[TEST] 対象ユーザーID:', userId);
    
    // Raw SQLで通知取得
    const unreadNotifications = await prisma.$queryRaw`
      SELECT * FROM notifications 
      WHERE userId = ${userId} 
        AND createdAt >= datetime('now', '-24 hours')
      ORDER BY createdAt DESC 
      LIMIT 10
    `;
    
    console.log('[TEST] 取得件数:', unreadNotifications.length);
    
    // 動的通知配列に変換
    const dynamicNotifications = [];
    
    for (const notification of unreadNotifications) {
      console.log('[TEST] 変換中:', notification.id, '|', notification.title, '| read:', notification.read);
      
      // createdAtをISO文字列に変換
      let timestamp;
      if (notification.createdAt instanceof Date) {
        timestamp = notification.createdAt.toISOString();
      } else if (typeof notification.createdAt === 'string') {
        timestamp = new Date(notification.createdAt).toISOString();
      } else {
        timestamp = new Date().toISOString();
      }
      
      dynamicNotifications.push({
        id: notification.id,
        type: notification.type || 'info',
        title: notification.title,
        message: notification.message,
        timestamp: timestamp,
        read: notification.read,
        notificationType: notification.notificationType || undefined,
        metadata: notification.metadata,
        userId: userId
      });
    }
    
    console.log('[TEST] 変換後配列サイズ:', dynamicNotifications.length);
    console.log('[TEST] 結果返却');
    
    return NextResponse.json(dynamicNotifications);
    
  } catch (error) {
    console.error('[TEST] テスト通知APIエラー:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 通知を既読にマークするPOSTエンドポイント
export async function POST(request: NextRequest) {
  try {
    console.log('[TEST] 通知既読API開始');
    
    const body = await request.json();
    const { notificationId } = body;
    
    if (!notificationId) {
      return NextResponse.json({ error: 'notificationId is required' }, { status: 400 });
    }
    
    console.log('[TEST] 既読処理:', notificationId);
    
    // Raw SQLで既読更新
    const result = await prisma.$executeRaw`
      UPDATE notifications 
      SET "read" = true, updatedAt = datetime('now')
      WHERE id = ${notificationId}
    `;
    
    console.log('[TEST] 既読更新結果:', result);
    
    return NextResponse.json({ success: true, updated: result });
    
  } catch (error) {
    console.error('[TEST] 通知既読APIエラー:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}