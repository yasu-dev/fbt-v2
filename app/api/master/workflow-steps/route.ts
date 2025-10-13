import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: ワークフローステップ一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowType = searchParams.get('workflowType');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where: any = {};
    if (workflowType) {
      where.workflowType = workflowType;
    }
    if (!includeInactive) {
      where.isActive = true;
    }

    const steps = await prisma.workflowStep.findMany({
      where,
      orderBy: [
        { workflowType: 'asc' },
        { order: 'asc' },
      ],
      select: {
        id: true,
        workflowType: true,
        key: true,
        nameJa: true,
        nameEn: true,
        order: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: steps,
      count: steps.length,
    });

  } catch (error) {
    console.error('Error fetching workflow steps:', error);
    return NextResponse.json(
      { success: false, error: 'ワークフローステップの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST: ワークフローステップ作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowType, key, nameJa, nameEn, order, description } = body;

    // バリデーション
    if (!workflowType || !key || !nameJa || !nameEn || order === undefined) {
      return NextResponse.json(
        { success: false, error: 'workflowType、key、nameJa、nameEn、orderは必須です' },
        { status: 400 }
      );
    }

    // 重複チェック
    const existing = await prisma.workflowStep.findUnique({
      where: { 
        workflowType_key: {
          workflowType,
          key,
        }
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'このワークフロータイプ・キーは既に存在します' },
        { status: 409 }
      );
    }

    const step = await prisma.workflowStep.create({
      data: {
        workflowType,
        key,
        nameJa,
        nameEn,
        order,
        description: description || null,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: step,
      message: 'ワークフローステップを作成しました',
    });

  } catch (error) {
    console.error('Error creating workflow step:', error);
    return NextResponse.json(
      { success: false, error: 'ワークフローステップの作成に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT: ワークフローステップ更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, workflowType, key, nameJa, nameEn, order, description, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'IDは必須です' },
        { status: 400 }
      );
    }

    const existing = await prisma.workflowStep.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'ワークフローステップが見つかりません' },
        { status: 404 }
      );
    }

    // ワークフロータイプ・キー重複チェック（自分以外）
    if ((workflowType && workflowType !== existing.workflowType) || 
        (key && key !== existing.key)) {
      const duplicate = await prisma.workflowStep.findUnique({
        where: { 
          workflowType_key: {
            workflowType: workflowType || existing.workflowType,
            key: key || existing.key,
          }
        },
      });

      if (duplicate && duplicate.id !== id) {
        return NextResponse.json(
          { success: false, error: 'このワークフロータイプ・キーは既に存在します' },
          { status: 409 }
        );
      }
    }

    const step = await prisma.workflowStep.update({
      where: { id },
      data: {
        workflowType: workflowType || existing.workflowType,
        key: key || existing.key,
        nameJa: nameJa || existing.nameJa,
        nameEn: nameEn || existing.nameEn,
        order: order !== undefined ? order : existing.order,
        description: description !== undefined ? description : existing.description,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      data: step,
      message: 'ワークフローステップを更新しました',
    });

  } catch (error) {
    console.error('Error updating workflow step:', error);
    return NextResponse.json(
      { success: false, error: 'ワークフローステップの更新に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE: ワークフローステップ削除（論理削除）
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

    const step = await prisma.workflowStep.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      data: step,
      message: 'ワークフローステップを削除しました',
    });

  } catch (error) {
    console.error('Error deleting workflow step:', error);
    return NextResponse.json(
      { success: false, error: 'ワークフローステップの削除に失敗しました' },
      { status: 500 }
    );
  }
}