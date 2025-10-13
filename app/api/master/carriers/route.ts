import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: 配送業者一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const carriers = await prisma.carrier.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        key: true,
        name: true,
        nameJa: true,
        defaultRate: true,
        trackingUrl: true,
        supportedServices: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // JSON文字列をパースして返す
    const parsedCarriers = carriers.map(carrier => ({
      ...carrier,
      supportedServices: carrier.supportedServices 
        ? JSON.parse(carrier.supportedServices) 
        : [],
    }));

    return NextResponse.json({
      success: true,
      data: parsedCarriers,
      count: parsedCarriers.length,
    });

  } catch (error) {
    console.error('Error fetching carriers:', error);
    return NextResponse.json(
      { success: false, error: '配送業者の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST: 配送業者作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, name, nameJa, defaultRate, trackingUrl, supportedServices, sortOrder } = body;

    // バリデーション
    if (!key || !name) {
      return NextResponse.json(
        { success: false, error: 'key、nameは必須です' },
        { status: 400 }
      );
    }

    // 重複チェック
    const existing = await prisma.carrier.findUnique({
      where: { key },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'このキーは既に存在します' },
        { status: 409 }
      );
    }

    const carrier = await prisma.carrier.create({
      data: {
        key,
        name,
        nameJa: nameJa || name,
        defaultRate: defaultRate || 0,
        trackingUrl: trackingUrl || null,
        supportedServices: supportedServices 
          ? JSON.stringify(supportedServices) 
          : null,
        sortOrder: sortOrder || 0,
        isActive: true,
      },
    });

    // レスポンス時にパース
    const parsedCarrier = {
      ...carrier,
      supportedServices: carrier.supportedServices 
        ? JSON.parse(carrier.supportedServices) 
        : [],
    };

    return NextResponse.json({
      success: true,
      data: parsedCarrier,
      message: '配送業者を作成しました',
    });

  } catch (error) {
    console.error('Error creating carrier:', error);
    return NextResponse.json(
      { success: false, error: '配送業者の作成に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT: 配送業者更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, key, name, nameJa, defaultRate, trackingUrl, supportedServices, sortOrder, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'IDは必須です' },
        { status: 400 }
      );
    }

    const existing = await prisma.carrier.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: '配送業者が見つかりません' },
        { status: 404 }
      );
    }

    // キー重複チェック（自分以外）
    if (key && key !== existing.key) {
      const duplicate = await prisma.carrier.findUnique({
        where: { key },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, error: 'このキーは既に存在します' },
          { status: 409 }
        );
      }
    }

    const carrier = await prisma.carrier.update({
      where: { id },
      data: {
        key: key || existing.key,
        name: name || existing.name,
        nameJa: nameJa !== undefined ? nameJa : existing.nameJa,
        defaultRate: defaultRate !== undefined ? defaultRate : existing.defaultRate,
        trackingUrl: trackingUrl !== undefined ? trackingUrl : existing.trackingUrl,
        supportedServices: supportedServices !== undefined 
          ? JSON.stringify(supportedServices)
          : existing.supportedServices,
        sortOrder: sortOrder !== undefined ? sortOrder : existing.sortOrder,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
    });

    // レスポンス時にパース
    const parsedCarrier = {
      ...carrier,
      supportedServices: carrier.supportedServices 
        ? JSON.parse(carrier.supportedServices) 
        : [],
    };

    return NextResponse.json({
      success: true,
      data: parsedCarrier,
      message: '配送業者を更新しました',
    });

  } catch (error) {
    console.error('Error updating carrier:', error);
    return NextResponse.json(
      { success: false, error: '配送業者の更新に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE: 配送業者削除（論理削除）
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'IDは必須です' },
        { status: 400 }
      );
    }

    const carrier = await prisma.carrier.update({
      where: { id },
      data: { isActive: false },
    });

    // レスポンス時にパース
    const parsedCarrier = {
      ...carrier,
      supportedServices: carrier.supportedServices 
        ? JSON.parse(carrier.supportedServices) 
        : [],
    };

    return NextResponse.json({
      success: true,
      data: parsedCarrier,
      message: '配送業者を削除しました',
    });

  } catch (error) {
    console.error('Error deleting carrier:', error);
    return NextResponse.json(
      { success: false, error: '配送業者の削除に失敗しました' },
      { status: 500 }
    );
  }
}