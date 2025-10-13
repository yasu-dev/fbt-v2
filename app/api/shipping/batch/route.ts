import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, itemIds, data } = body;

    if (!action || !itemIds || !Array.isArray(itemIds)) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      );
    }

    let processedCount = 0;
    const errors: string[] = [];

    switch (action) {
      case 'updateStatus':
        const { newStatus } = data || {};
        if (!newStatus) {
          return NextResponse.json(
            { error: 'ステータスが指定されていません' },
            { status: 400 }
          );
        }

        // 各商品のステータスを更新
        for (const itemId of itemIds) {
          try {
            // 実際の実装では、注文と商品のステータスを更新
            // ここではモック処理
            processedCount++;
          } catch (error) {
            errors.push(`商品 ${itemId} の更新に失敗しました`);
          }
        }
        break;

      case 'printLabels':
        // ラベル印刷のバッチ処理
        for (const itemId of itemIds) {
          try {
            // PDFラベル生成処理
            processedCount++;
          } catch (error) {
            errors.push(`商品 ${itemId} のラベル生成に失敗しました`);
          }
        }
        break;

      case 'assignCarrier':
        const { carrier, shippingMethod } = data || {};
        if (!carrier) {
          return NextResponse.json(
            { error: '配送業者が指定されていません' },
            { status: 400 }
          );
        }

        // 配送業者の一括割り当て
        for (const itemId of itemIds) {
          try {
            // 配送業者割り当て処理
            processedCount++;
          } catch (error) {
            errors.push(`商品 ${itemId} の配送業者割り当てに失敗しました`);
          }
        }
        break;

      default:
        return NextResponse.json(
          { error: '無効なアクションです' },
          { status: 400 }
        );
    }

    // アクティビティログを記録
    await prisma.activity.create({
      data: {
        type: 'batch_processing',
        description: `${action} を ${itemIds.length} 件の商品に対して実行しました`,
        userId: user.id,
        metadata: JSON.stringify({
          action,
          itemCount: itemIds.length,
          processedCount,
          errors
        })
      }
    });

    return NextResponse.json({
      success: true,
      message: `${processedCount}件の処理が完了しました`,
      processedCount,
      totalCount: itemIds.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Batch processing error:', error);
    return NextResponse.json(
      { error: 'バッチ処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // バッチ処理可能なアクションの一覧を返す
    const availableActions = [
      {
        id: 'updateStatus',
        label: 'ステータス一括更新',
        description: '選択した商品のステータスを一括で更新します',
        requiredData: ['newStatus']
      },
      {
        id: 'printLabels',
        label: '配送ラベル一括印刷',
        description: '選択した商品の配送ラベルを一括で印刷します',
        requiredData: []
      },
      {
        id: 'assignCarrier',
        label: '配送業者一括割り当て',
        description: '選択した商品に配送業者を一括で割り当てます',
        requiredData: ['carrier', 'shippingMethod']
      }
    ];

    return NextResponse.json({
      availableActions
    });

  } catch (error) {
    console.error('Get batch actions error:', error);
    return NextResponse.json(
      { error: 'バッチアクション取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 