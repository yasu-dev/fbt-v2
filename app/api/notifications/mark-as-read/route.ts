import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 通知を既読にする
export async function POST(request: NextRequest) {
  try {
    const { notificationId } = await request.json();

    if (!notificationId) {
      return NextResponse.json({ error: 'notificationId is required' }, { status: 400 });
    }

    console.log(`📧 通知を既読にマーク: ${notificationId}`);

    // データベースで通知のステータスを更新
    await prisma.$executeRaw`
      UPDATE notifications
      SET "read" = true, updatedAt = datetime('now')
      WHERE id = ${notificationId}
    `;

    console.log(`✅ 通知 ${notificationId} を既読にしました`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('既読更新エラー:', error);
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }
}