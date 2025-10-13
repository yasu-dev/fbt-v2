import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: string;
  priority?: 'high' | 'medium' | 'low';
  notificationType?: string; // 通知設定でのフィルタリング用
}

// ハードコードされたデモデータを削除（実際の通知のみ使用）

export async function GET(request: NextRequest) {
  try {
    console.log('[DEBUG] 通知API開始');
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    console.log('[DEBUG] リクエストロール:', role);
    
    // ユーザー認証（オプション、ゲスト表示も考慮）
    let userSettings = null;
    let userId = null;
    
    try {
      const user = await AuthService.requireRole(request, ['seller', 'staff', 'admin']);
      if (user) {
        userId = user.id;
        // ユーザーの通知設定を取得
        const userData = await prisma.user.findUnique({
          where: { id: user.id },
          select: { notificationSettings: true }
        });

        if (userData?.notificationSettings) {
          userSettings = JSON.parse(userData.notificationSettings);
        }
      }
    } catch (error) {
      // 認証エラーは無視してデフォルト通知を表示
      console.log('通知取得時の認証エラー（ゲストモード）:', error);
    }
    
    // データベースから実際の通知を取得
    let notifications = [];
    
    // 🔧 SAFE FIX: role=staffの場合は直接Raw SQLで通知取得
    if (role === 'staff') {
      try {
        console.log('[DEBUG] スタッフ通知直接取得開始');
        const staffNotifications = await prisma.$queryRaw`
          SELECT n.* FROM notifications n 
          JOIN users u ON n.userId = u.id 
          WHERE u.role = 'staff'
          ORDER BY n.createdAt DESC 
          LIMIT 20
        `;
        
        console.log('[DEBUG] スタッフ通知取得完了:', staffNotifications.length, '件');
        notifications = staffNotifications.map((n: any) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          timestamp: n.createdAt instanceof Date ? n.createdAt.toISOString() : new Date(n.createdAt).toISOString(),
          read: n.read,
          action: n.action,
          priority: n.priority,
          notificationType: n.notificationType
        }));
      } catch (error) {
        console.error('スタッフ通知取得エラー:', error);
      }
    } else if (userId) {
      try {
        const dynamicResponse = await fetch(`${request.nextUrl.origin}/api/notifications/dynamic?role=${role}`, {
          headers: {
            'Authorization': request.headers.get('Authorization') || '',
            'Cookie': request.headers.get('Cookie') || ''
          }
        });
        
        if (dynamicResponse.ok) {
          notifications = await dynamicResponse.json();
        }
      } catch (error) {
        console.error('通知取得エラー:', error);
      }
    }
    
    // セラーの場合、通知設定でフィルタリング
    if (role === 'seller' && userSettings) {
      notifications = notifications.filter(notification => {
        // notificationTypeがない通知は常に表示
        if (!notification.notificationType) return true;
        
        // 設定に応じてフィルタリング
        return userSettings[notification.notificationType] === true;
      });
      
      console.log(`通知フィルタリング: ${notifications.length}件表示（設定適用済み）`);
    }
    
    // タイムスタンプでソート（新しい順）
    const sortedNotifications = [...notifications].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // 最新20件に制限
    const limitedNotifications = sortedNotifications.slice(0, 20);
    
    console.log('[DEBUG] 通知API完了:', limitedNotifications.length, '件返却');
    return NextResponse.json(limitedNotifications);

  } catch (error) {
    console.error('通知取得エラー:', error);
    console.error('エラースタック:', error.stack);
    // エラー時は空配列を返す
    return NextResponse.json([]);
  }
}

// 通知を既読にする
export async function PUT(request: NextRequest) {
  try {
    const { notificationId } = await request.json();
    
    if (!notificationId) {
      return NextResponse.json({ error: 'notificationId is required' }, { status: 400 });
    }
    
    // データベースで通知のステータスを更新
    await prisma.$executeRaw`
      UPDATE notifications 
      SET "read" = true, updatedAt = datetime('now')
      WHERE id = ${notificationId}
    `;
    
    console.log(`Marking notification ${notificationId} as read`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('既読更新エラー:', error);
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }
}

// 全ての通知を既読にする
export async function POST(request: NextRequest) {
  const { action, role, userId, notification, notificationId } = await request.json();
  
  if (action === 'mark-read' && notificationId) {
    try {
      // 単一の通知を既読にマーク
      console.log(`📧 通知を既読にマーク: ${notificationId}`);
      
      // データベースで通知の既読状況を更新
      await prisma.$executeRaw`
        UPDATE notifications 
        SET "read" = true, updatedAt = datetime('now')
        WHERE id = ${notificationId}
      `;
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('既読更新エラー:', error);
      return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
    }
  }
  
  if (action === 'mark-all-read') {
    try {
      // 全ての通知を既読にマーク
      console.log(`📧 全通知を既読にマーク for ${role}`);
      
      // 現在のユーザーまたはロールに応じて全通知を既読にする
      if (userId) {
        await prisma.$executeRaw`
          UPDATE notifications 
          SET "read" = true, updatedAt = datetime('now')
          WHERE userId = ${userId}
        `;
      } else if (role === 'staff') {
        await prisma.$executeRaw`
          UPDATE notifications n
          SET "read" = true, updatedAt = datetime('now')
          FROM users u 
          WHERE n.userId = u.id AND u.role = 'staff'
        `;
      }
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('全既読更新エラー:', error);
      return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 });
    }
  }
  
  // 新しい通知を作成
  if (action === 'create') {
    const newNotification = {
      id: Date.now().toString(),
      type: notification.type || 'info',
      title: notification.title,
      message: notification.message,
      timestamp: new Date().toISOString(),
      read: false,
      action: notification.action,
      priority: notification.priority || 'medium'
    };
    
    // SSEでリアルタイム配信（一時的に無効化）
    // if (userId) {
    //   sendNotification(userId, {
    //     type: 'new_notification',
    //     notification: newNotification
    //   });
    // }
    
    // データベースに保存（実際の実装では）
    console.log('Creating new notification:', newNotification);
    
    return NextResponse.json({ success: true, notification: newNotification });
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
} 