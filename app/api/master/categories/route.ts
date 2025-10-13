import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: カテゴリー一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const categories = await prisma.category.findMany({
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
      data: categories,
      count: categories.length,
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'カテゴリーの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST: カテゴリー作成
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
    const existing = await prisma.category.findUnique({
      where: { key },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'このキーは既に存在します' },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
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
      data: category,
      message: 'カテゴリーを作成しました',
    });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'カテゴリーの作成に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT: カテゴリー更新
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

    // 存在チェック
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'カテゴリーが見つかりません' },
        { status: 404 }
      );
    }

    // キー重複チェック（自分以外）
    if (key && key !== existing.key) {
      const duplicate = await prisma.category.findUnique({
        where: { key },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, error: 'このキーは既に存在します' },
          { status: 409 }
        );
      }
    }

    const category = await prisma.category.update({
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
      data: category,
      message: 'カテゴリーを更新しました',
    });

  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'カテゴリーの更新に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE: カテゴリー削除（論理削除）
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

    const category = await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: 'カテゴリーを削除しました',
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'カテゴリーの削除に失敗しました' },
      { status: 500 }
    );
  }
}