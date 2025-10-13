import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService, SessionUser } from '@/lib/auth';

const prisma = new PrismaClient();

interface CancelRequest {
  reason?: string;
  confirmationToken?: string;
}

interface RouteParams {
  params: {
    planId: string;
  };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  console.log(`[CANCEL-${requestId}] 🚨 納品プラン取り下げリクエスト開始`);
  console.log(`[CANCEL-${requestId}] planId: ${params.planId}`);

  try {
    // 🔒 Step 1: 厳格な認証チェック（セラーとアドミンのみ許可）
    console.log(`[CANCEL-${requestId}] Step 1: 認証チェック開始`);
    let user;
    try {
      user = await AuthService.requireRole(request, ['seller', 'admin']);
      console.log(`[CANCEL-${requestId}] ✅ 認証成功: userId=${user.id}, role=${user.role}`);
    } catch (authError) {
      console.error(`[CANCEL-${requestId}] ❌ 認証失敗:`, authError);
      return NextResponse.json(
        { 
          error: 'ログインが必要です。再度ログインしてください。',
          code: 'AUTH_REQUIRED',
          requestId 
        },
        { status: 401 }
      );
    }

    const userId = user.id;

    // 🔍 Step 2: リクエストボディの安全な解析
    console.log(`[CANCEL-${requestId}] Step 2: リクエストデータ解析`);
    let requestData: CancelRequest = {};
    
    try {
      requestData = await request.json();
      console.log(`[CANCEL-${requestId}] リクエストデータ:`, {
        hasReason: !!requestData.reason,
        reasonLength: requestData.reason?.length || 0
      });
    } catch (parseError) {
      console.warn(`[CANCEL-${requestId}] ⚠️ JSON解析エラー (空のリクエストとして処理):`, parseError);
    }

    // 🔍 Step 3: 納品プランの存在確認と権限チェック
    console.log(`[CANCEL-${requestId}] Step 3: プラン存在・権限確認`);
    
    const planId = params.planId;
    if (!planId || typeof planId !== 'string' || planId.trim().length === 0) {
      console.error(`[CANCEL-${requestId}] ❌ 無効なplanId: ${params.planId}`);
      return NextResponse.json(
        { 
          error: '無効なプランIDです。',
          code: 'INVALID_PLAN_ID',
          requestId 
        },
        { status: 400 }
      );
    }

    // planIdがDP-xxx形式の場合はplanNumberで検索、そうでない場合はidで検索
    const isPlanNumber = planId.startsWith('DP-');
    console.log(`[CANCEL-${requestId}] planId形式: ${isPlanNumber ? 'planNumber' : 'id'} = ${planId}`);
    
    // セラーは自分のプランのみ、アドミンは全てのプランにアクセス可能
    const existingPlan = await prisma.deliveryPlan.findFirst({
      where: {
        ...(isPlanNumber ? { planNumber: planId } : { id: planId }),
        ...(user.role === 'seller' ? { sellerId: userId } : {}) // アドミンは制限なし
      },
      select: {
        id: true,
        planNumber: true,
        status: true,
        sellerId: true,
        sellerName: true,
        totalItems: true,
        totalValue: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!existingPlan) {
      console.error(`[CANCEL-${requestId}] ❌ プラン未発見または権限なし: planId=${planId}, userId=${userId}, role=${user.role}`);
      const errorMessage = user.role === 'seller' 
        ? '指定された納品プランが見つからないか、あなたが作成したプランではありません。'
        : '指定された納品プランが見つかりません。';
      return NextResponse.json(
        { 
          error: errorMessage,
          code: 'PLAN_NOT_FOUND_OR_UNAUTHORIZED',
          requestId 
        },
        { status: 404 }
      );
    }

    console.log(`[CANCEL-${requestId}] ✅ プラン確認成功:`, {
      planId: existingPlan.id,
      planNumber: existingPlan.planNumber,
      status: existingPlan.status,
      totalItems: existingPlan.totalItems,
      createdAt: existingPlan.createdAt.toISOString()
    });

    // 🚫 Step 4: ステータス制限チェック（最も重要な安全チェック）
    console.log(`[CANCEL-${requestId}] Step 4: ステータス制限チェック`);
    
    if (existingPlan.status !== 'Pending') {
      console.error(`[CANCEL-${requestId}] ❌ キャンセル不可ステータス: ${existingPlan.status}`);
      
      const statusMessage = existingPlan.status === 'Shipped' 
        ? '既に発送済みのため、キャンセルできません。'
        : existingPlan.status === 'Cancelled'
        ? '既にキャンセル済みです。'
        : `現在のステータス（${existingPlan.status}）ではキャンセルできません。`;

      return NextResponse.json(
        { 
          error: statusMessage,
          code: 'INVALID_STATUS_FOR_CANCEL',
          currentStatus: existingPlan.status,
          requestId 
        },
        { status: 400 }
      );
    }

    console.log(`[CANCEL-${requestId}] ✅ ステータスチェック通過: ${existingPlan.status} → キャンセル可能`);

    // 🔍 Step 5: トランザクション前の準備
    console.log(`[CANCEL-${requestId}] Step 5: トランザクション処理準備完了`);

    // 🔄 Step 6: トランザクション処理（最大限安全）
    console.log(`[CANCEL-${requestId}] Step 6: トランザクション開始`);
    
    // キャンセルメタデータ（ログ・レスポンス用）
    const cancelMetadata = {
      cancelledAt: new Date().toISOString(),
      cancelReason: requestData.reason || null,
      cancelledBy: userId,
      cancelledByRole: user.role
    };
    
    const result = await prisma.$transaction(async (tx) => {
      // 6-1: 関連在庫アイテムを再検索（トランザクション内で安全に処理）
      console.log(`[CANCEL-${requestId}] Transaction: 関連在庫アイテム再検索`);
      
      const relatedInventoryItemsInTx = await tx.product.findMany({
        where: {
          metadata: {
            contains: `"deliveryPlanId":"${existingPlan.id}"`
          }
        },
        select: {
          id: true,
          name: true,
          sku: true,
          status: true
        }
      });

      console.log(`[CANCEL-${requestId}] Transaction内在庫アイテム数: ${relatedInventoryItemsInTx.length}件`);
      
      // 6-2: プランのステータス更新（既存フィールドを安全に活用）
      console.log(`[CANCEL-${requestId}] Transaction: プランステータス更新`);
      
      const updatedPlan = await tx.deliveryPlan.update({
        where: { id: existingPlan.id },
        data: {
          status: 'Cancelled',
          notes: requestData.reason ? `【キャンセル理由】${requestData.reason}` : '【キャンセル】理由未記入',
          updatedAt: new Date()
        }
      });

      // 6-3: 関連在庫アイテムを非アクティブ化（削除はしない = 安全）
      let updatedInventoryCount = 0;
      if (relatedInventoryItemsInTx.length > 0) {
        console.log(`[CANCEL-${requestId}] Transaction: 関連在庫アイテム非アクティブ化`);
        
        const inventoryUpdateResult = await tx.product.updateMany({
          where: {
            id: {
              in: relatedInventoryItemsInTx.map(item => item.id)
            }
          },
          data: {
            status: 'cancelled',
            updatedAt: new Date()
          }
        });
        
        updatedInventoryCount = inventoryUpdateResult.count;
        console.log(`[CANCEL-${requestId}] Transaction: ${updatedInventoryCount}件の在庫アイテムを非アクティブ化`);
      }

      return {
        updatedPlan,
        updatedInventoryCount
      };
    });

    // 📊 Step 7: 成功ログ出力
    const executionTime = Date.now() - startTime;
    console.log(`[CANCEL-${requestId}] 🎉 納品プラン取り下げ完了`, {
      planId: result.updatedPlan.id,
      planNumber: result.updatedPlan.planNumber,
      oldStatus: existingPlan.status,
      newStatus: result.updatedPlan.status,
      cancelledAt: cancelMetadata.cancelledAt,
      cancelReason: cancelMetadata.cancelReason,
      relatedInventoryUpdated: result.updatedInventoryCount,
      executionTimeMs: executionTime
    });

    // 📤 Step 8: 安全な成功レスポンス
    return NextResponse.json({
      success: true,
      message: '納品プランを正常に取り下げました。',
      data: {
        planId: result.updatedPlan.id,
        planNumber: result.updatedPlan.planNumber,
        status: result.updatedPlan.status,
        cancelledAt: cancelMetadata.cancelledAt,
        cancelReason: cancelMetadata.cancelReason,
        relatedItemsUpdated: result.updatedInventoryCount
      },
      requestId
    });

  } catch (error) {
    // 🚨 包括的エラーハンドリング
    const executionTime = Date.now() - startTime;
    console.error(`[CANCEL-${requestId}] 💥 予期しないエラー (${executionTime}ms):`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      planId: params.planId,
      executionTimeMs: executionTime
    });

    // エラーの種類に応じた適切なレスポンス
    if (error instanceof Error) {
      if (error.message.includes('P2002')) {
        return NextResponse.json(
          { 
            error: 'データベースの整合性エラーが発生しました。',
            code: 'DATABASE_CONSTRAINT_ERROR',
            requestId 
          },
          { status: 409 }
        );
      } else if (error.message.includes('P2025')) {
        return NextResponse.json(
          { 
            error: '指定されたプランが見つかりません。',
            code: 'PLAN_NOT_FOUND',
            requestId 
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: '納品プランの取り下げに失敗しました。しばらく時間をおいて再度お試しください。',
        code: 'INTERNAL_SERVER_ERROR',
        requestId
      },
      { status: 500 }
    );
  } finally {
    // 🔧 リソースクリーンアップ
    await prisma.$disconnect();
  }
}
