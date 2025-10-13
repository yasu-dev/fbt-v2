import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

// 保管場所の詳細を取得するAPI
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const locationId = params.id;

    if (!locationId) {
      return NextResponse.json(
        { error: '保管場所IDが指定されていません' },
        { status: 400 }
      );
    }

    // 保管場所を取得
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      return NextResponse.json(
        { error: '保管場所が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: location.id,
      code: location.code,
      name: location.name,
      zone: location.zone,
      capacity: location.capacity,
      currentCount: location.currentCount,
      description: location.description,
      isActive: location.isActive,
      createdAt: location.createdAt.toISOString(),
      updatedAt: location.updatedAt.toISOString(),
    });

  } catch (error) {
    console.error('保管場所取得エラー:', error);
    return NextResponse.json(
      { error: '保管場所の取得に失敗しました' },
      { status: 500 }
    );
  }
}
