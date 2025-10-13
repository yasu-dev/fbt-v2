import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * タイムスタンプ動画記録を取得
 */
export const GET = requireAuth(async (req: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const orderId = searchParams.get('orderId');
    const type = searchParams.get('type');

    const where: any = {};
    
    if (productId) where.productId = productId;
    if (orderId) where.orderId = orderId;
    if (type) where.type = type;

    const records = await (prisma as any).videoRecord.findMany({
      where,
      include: {
        staff: {
          select: {
            id: true,
            username: true,
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          }
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedRecords = records.map((record: any) => ({
      ...record,
      staffName: record.staff.username,
      timestamps: record.timestamps ? JSON.parse(record.timestamps) : [],
    }));

    return NextResponse.json({ records: formattedRecords });
  } catch (error) {
    console.error('Timestamp video records fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timestamp video records' },
      { status: 500 }
    );
  }
});

/**
 * タイムスタンプ動画記録を登録
 */
export const POST = requireAuth(async (req: NextRequest, { user }) => {
  try {
    const data = await req.json();
    
    // スタッフユーザーのみ動画記録を作成可能
    if (user.role !== 'staff' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { productId, orderId, type, sessionId, timestamps, s3VideoPath, notes } = data;

    if (!timestamps || !Array.isArray(timestamps) || timestamps.length === 0) {
      return NextResponse.json(
        { error: 'タイムスタンプが必要です' },
        { status: 400 }
      );
    }

    // タイムスタンプをJSON文字列として保存
    const timestampJson = JSON.stringify(timestamps);

    const record = await (prisma as any).videoRecord.create({
      data: {
        productId: productId || null,
        orderId: orderId || null,
        type: type || 'other',
        sessionId: sessionId || null,
        timestamps: timestampJson,
        s3VideoPath: s3VideoPath || null,
        staffId: user.id,
        notes: notes || null,
      }
    });

    return NextResponse.json({
      success: true,
      record: {
        ...record,
        timestamps: JSON.parse(record.timestamps || '[]')
      }
    });
  } catch (error) {
    console.error('Timestamp video record creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create timestamp video record' },
      { status: 500 }
    );
  }
});

/**
 * タイムスタンプ動画記録を更新
 */
export const PUT = requireAuth(async (req: NextRequest, { user }) => {
  try {
    const data = await req.json();
    const { id, timestamps, notes } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'レコードIDが必要です' },
        { status: 400 }
      );
    }

    if (user.role !== 'staff' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const updateData: any = {};
    
    if (timestamps) {
      updateData.timestamps = JSON.stringify(timestamps);
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const record = await (prisma as any).videoRecord.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      record: {
        ...record,
        timestamps: JSON.parse(record.timestamps || '[]')
      }
    });
  } catch (error) {
    console.error('Timestamp video record update error:', error);
    return NextResponse.json(
      { error: 'Failed to update timestamp video record' },
      { status: 500 }
    );
  }
});

/**
 * タイムスタンプ動画記録を削除
 */
export const DELETE = requireAuth(async (req: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'レコードIDが必要です' },
        { status: 400 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await (prisma as any).videoRecord.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'タイムスタンプ動画記録を削除しました'
    });
  } catch (error) {
    console.error('Timestamp video record deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete timestamp video record' },
      { status: 500 }
    );
  }
}); 