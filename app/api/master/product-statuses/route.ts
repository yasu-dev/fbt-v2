import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: 商品ステータス一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const statuses = await prisma.productStatus.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        key: true,
        nameJa: true,
        nameEn: true,
        description: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: statuses,
      count: statuses.length,
    });

  } catch (error) {
    console.error('Error fetching product statuses:', error);
    return NextResponse.json(
      { success: false, error: '商品ステータスの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST: 商品ステータス作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, nameJa, nameEn, description, sortOrder } = body;

    // バリデーション
    if (!key || !nameJa || !nameEn) {
      return NextResponse.json(
        { success: false, error: 'key、nameJa、nameEnは必須です' },
        { status: 400 }
      );
    }

    // 重複チェック
    const existing = await prisma.productStatus.findUnique({
      where: { key },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'このキーは既に存在します' },
        { status: 409 }
      );
    }

    const status = await prisma.productStatus.create({
      data: {
        key,
        nameJa,
        nameEn,
        description: description || null,
        sortOrder: sortOrder || 0,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: status,
      message: '商品ステータスを作成しました',
    });

  } catch (error) {
    console.error('Error creating product status:', error);
    return NextResponse.json(
      { success: false, error: '商品ステータスの作成に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT: 商品ステータス更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, key, nameJa, nameEn, description, sortOrder, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'IDは必須です' },
        { status: 400 }
      );
    }

    const existing = await prisma.productStatus.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: '商品ステータスが見つかりません' },
        { status: 404 }
      );
    }

    // キー重複チェック（自分以外）
    if (key && key !== existing.key) {
      const duplicate = await prisma.productStatus.findUnique({
        where: { key },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, error: 'このキーは既に存在します' },
          { status: 409 }
        );
      }
    }

    const status = await prisma.productStatus.update({
      where: { id },
      data: {
        key: key || existing.key,
        nameJa: nameJa || existing.nameJa,
        nameEn: nameEn || existing.nameEn,
        description: description !== undefined ? description : existing.description,
        sortOrder: sortOrder !== undefined ? sortOrder : existing.sortOrder,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      data: status,
      message: '商品ステータスを更新しました',
    });

  } catch (error) {
    console.error('Error updating product status:', error);
    return NextResponse.json(
      { success: false, error: '商品ステータスの更新に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE: 商品ステータス削除（論理削除）
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

    const status = await prisma.productStatus.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      data: status,
      message: '商品ステータスを削除しました',
    });

  } catch (error) {
    console.error('Error deleting product status:', error);
    return NextResponse.json(
      { success: false, error: '商品ステータスの削除に失敗しました' },
      { status: 500 }
    );
  }
}