import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';
import { getWorkflowProgress, getNextAction, ShippingStatus } from '@/lib/utils/workflow';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: '注文IDが必要です' },
        { status: 400 }
      );
    }

    // 注文情報を取得（実際の実装では注文データベースから取得）
    const mockOrder = {
      id: orderId,
      orderNumber: 'ORD-2024-0628-001',
      status: 'processing' as const,
      shippingStatus: 'storage' as ShippingStatus,
      items: [
        {
          id: 'item-001',
          productName: 'Canon EOS R5 ボディ',
          productSku: 'TWD-CAM-001',
          status: 'storage'
        }
      ]
    };

    // ワークフロー進捗情報を生成
    const workflowProgress = getWorkflowProgress(mockOrder.shippingStatus);
    const nextAction = getNextAction(mockOrder.shippingStatus);

    // 推奨アクションを生成
    const recommendedActions = [];
    switch (mockOrder.shippingStatus) {
      case 'storage':
        recommendedActions.push({
          action: 'pick',
          label: 'ピッキングを開始',
          description: '商品を保管場所からピッキングして梱包してください'
        });
        break;
      case 'packed':
        recommendedActions.push({
          action: 'print',
          label: 'ラベル印刷',
          description: '配送ラベルを印刷してください'
        });
        recommendedActions.push({
          action: 'ship',
          label: '出荷処理',
          description: '配送業者に引き渡して出荷を完了してください'
        });
        break;
      case 'shipped':
        // 出荷済みの場合はアクションなし
        break;
    }

    return NextResponse.json({
      orderId,
      orderNumber: mockOrder.orderNumber,
      currentStatus: mockOrder.shippingStatus,
      workflowProgress,
      nextAction,
      recommendedActions,
      estimatedCompletion: calculateEstimatedCompletion(mockOrder.shippingStatus)
    });

  } catch (error) {
    console.error('Get workflow status error:', error);
    return NextResponse.json(
      { error: 'ワークフロー情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

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
    const { orderId, action, data } = body;

    if (!orderId || !action) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      );
    }

    // アクションに基づいてワークフローを進める
    let newStatus: ShippingStatus;
    let actionDescription: string;

    switch (action) {
      case 'complete_picking':
        newStatus = 'packed';
        actionDescription = 'ピッキング・梱包を完了しました';
        break;
      case 'complete_packing':
        newStatus = 'packed';
        actionDescription = '梱包を完了しました';
        break;
      case 'complete_shipping':
        newStatus = 'shipped';
        actionDescription = '出荷処理を完了しました';
        break;
      default:
        return NextResponse.json(
          { error: '無効なアクションです' },
          { status: 400 }
        );
    }

    // ステータス更新（実際の実装では注文データベースを更新）
    // ここではモック処理

    // アクティビティログを記録
    await prisma.activity.create({
      data: {
        type: 'workflow_update',
        description: `注文 ${orderId} で ${actionDescription}`,
        userId: user.id,
        metadata: JSON.stringify({
          orderId,
          action,
          previousStatus: 'storage' as ShippingStatus,  // TODO: 実際の実装ではデータベースから取得
          newStatus,
          data
        })
      }
    });

    // 更新後のワークフロー情報を返す
    const updatedProgress = getWorkflowProgress(newStatus);
    const nextAction = getNextAction(newStatus);

    return NextResponse.json({
      success: true,
      message: actionDescription,
      orderId,
      newStatus,
      workflowProgress: updatedProgress,
      nextAction
    });

  } catch (error) {
    console.error('Update workflow error:', error);
    return NextResponse.json(
      { error: 'ワークフロー更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 推定完了時間を計算する関数
function calculateEstimatedCompletion(currentStatus: ShippingStatus): string {
  const estimatedMinutes: Record<ShippingStatus, number> = {
    'storage': 20,
    'packed': 10,
    'shipped': 0
  };

  const minutes = estimatedMinutes[currentStatus] || 0;
  if (minutes === 0) return '完了済み';

  const now = new Date();
  const estimatedTime = new Date(now.getTime() + minutes * 60000);
  return `約${minutes}分後（${estimatedTime.getHours()}:${String(estimatedTime.getMinutes()).padStart(2, '0')}頃）`;
} 