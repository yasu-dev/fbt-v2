import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

// 通知チャンネルを管理するマップ
const notificationChannels = new Map<string, ReadableStreamDefaultController>();

// 通知を配信する関数
function sendNotification(userId: string, notification: any) {
  const controller = notificationChannels.get(userId);
  if (controller) {
    const data = `data: ${JSON.stringify(notification)}\n\n`;
    controller.enqueue(new TextEncoder().encode(data));
  }
}

// SSE (Server-Sent Events) for real-time notifications
export async function GET(request: Request) {
  // Get user role from query params
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') || 'seller';

  // Create a stream for SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({
          type: 'connection',
          message: 'Connected to notification stream'
        })}\n\n`)
      );

      // Simulate real-time notifications
      const notificationInterval = setInterval(() => {
        const notifications = generateRandomNotification(role);
        if (notifications) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(notifications)}\n\n`)
          );
        }
      }, 10000); // Send notification every 10 seconds

      // Heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, 30000); // Every 30 seconds

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(notificationInterval);
        clearInterval(heartbeatInterval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Generate random notifications based on role
function generateRandomNotification(role: string) {
  const random = Math.random();
  
  if (random > 0.7) { // 30% chance of generating a notification
    const sellerNotifications = [
      {
        id: `notif-${Date.now()}`,
        type: 'order',
        title: '新規注文',
        message: 'Sony α7 IV が売れました！',
        timestamp: new Date().toISOString(),
        priority: 'high',
        metadata: {
          orderId: `ORD-${Math.floor(Math.random() * 10000)}`,
          amount: 380000,
          buyer: '山田太郎'
        }
      },
      {
        id: `notif-${Date.now()}`,
        type: 'inventory',
        title: '在庫アラート',
        message: '高額商品の在庫が30日を超えました',
        timestamp: new Date().toISOString(),
        priority: 'medium',
        metadata: {
          productId: 'PRD-001',
          daysInStock: 31,
          category: 'camera_body'
        }
      },
      {
        id: `notif-${Date.now()}`,
        type: 'price',
        title: '価格変更推奨',
        message: '市場価格の変動により価格調整を推奨します',
        timestamp: new Date().toISOString(),
        priority: 'low',
        metadata: {
          productId: 'PRD-002',
          currentPrice: 450000,
          suggestedPrice: 420000
        }
      }
    ];

    const staffNotifications = [
      {
        id: `notif-${Date.now()}`,
        type: 'task',
        title: '新規タスク',
        message: '入庫待ちの商品があります',
        timestamp: new Date().toISOString(),
        priority: 'high',
        metadata: {
          taskId: `TASK-${Math.floor(Math.random() * 10000)}`,
          productCount: 3,
          deadline: new Date(Date.now() + 3600000).toISOString()
        }
      },
      {
        id: `notif-${Date.now()}`,
        type: 'alert',
        title: 'システムアラート',
        message: '在庫位置の不一致が検出されました',
        timestamp: new Date().toISOString(),
        priority: 'high',
        metadata: {
          locationId: 'A-01-01',
          expectedCount: 5,
          actualCount: 4
        }
      },
      {
        id: `notif-${Date.now()}`,
        type: 'shipping',
        title: '出荷期限',
        message: '本日出荷予定の商品があります',
        timestamp: new Date().toISOString(),
        priority: 'medium',
        metadata: {
          orderCount: 2,
          deadline: '17:00'
        }
      }
    ];

    const notifications = role === 'staff' ? staffNotifications : sellerNotifications;
    return notifications[Math.floor(Math.random() * notifications.length)];
  }

  return null;
} 