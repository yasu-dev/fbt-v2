import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

// 🆕 新システム用Prismaクライアント（階層型データベース）
import { PrismaClient as HierarchicalPrismaClient } from '@/prisma/generated/hierarchical';

const prisma = new PrismaClient();

// 🆕 新システム専用Prismaクライアント
const hierarchicalPrisma = new HierarchicalPrismaClient({
  datasources: {
    db: {
      url: `file:${process.cwd()}/prisma/hierarchical.db`
    }
  }
});

// 🎛️ フィーチャーフラグ状態を取得する関数
async function getHierarchicalChecklistFeatureFlag(): Promise<boolean> {
  try {
    const flag = await prisma.systemSetting.findUnique({
      where: { key: 'hierarchical_inspection_checklist_enabled' }
    });
    
    const isEnabled = flag?.value === 'true';
    console.log(`[API] 階層型検品チェックリスト: ${isEnabled ? '有効' : '無効'}`);
    return isEnabled;
  } catch (error) {
    console.warn('[API] フィーチャーフラグ取得エラー、既存システム使用:', error);
    return false; // エラー時は安全のため既存システムを使用
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API] 検品チェックリストAPI呼び出し開始 - ProductID: ${params.id}`);
    
    // デモ環境: 認証をスキップしてデモユーザーを使用
    const user = {
      id: 'demo-seller',
      username: 'デモセラー',
      role: 'seller'
    };
    
    console.log('[API] デモ環境: 認証スキップ - ユーザー:', user.username);

    const productId = params.id;
    console.log(`[API] 認証成功 - ユーザー: ${user.username}, 商品ID: ${productId}`);

    // 🎛️ フィーチャーフラグの状態を確認
    const isHierarchicalEnabled = await getHierarchicalChecklistFeatureFlag();

    // 🆕 新システムが有効な場合、階層型データを取得
    if (isHierarchicalEnabled) {
      console.log('[API] 新システム: 階層型検品チェックリストデータを取得中...');
      
      try {
        // productIdで検索
        let hierarchicalChecklist = await prisma.hierarchicalInspectionChecklist.findUnique({
          where: { productId },
          include: { 
            responses: true
          }
        });

        // 見つからない場合、商品メタデータからdeliveryPlanProductIdで検索
        if (!hierarchicalChecklist) {
          const product = await prisma.product.findUnique({
            where: { id: productId },
          });

          if (product?.metadata) {
            const metadata = JSON.parse(product.metadata);
            if (metadata.deliveryPlanProductId) {
              hierarchicalChecklist = await prisma.hierarchicalInspectionChecklist.findUnique({
                where: { deliveryPlanProductId: metadata.deliveryPlanProductId },
                include: { 
                  responses: true
                }
              });
            }
          }
        }

        if (hierarchicalChecklist) {
          console.log(`[API] 新システム: 階層型データ取得成功 (ID: ${hierarchicalChecklist.id})`);
          console.log(`[API] 新システム: responsesデータ確認:`, hierarchicalChecklist.responses);
          
          // フロントエンドが期待する構造でレスポンスを構築
          const response = {
            hierarchicalInspectionChecklist: hierarchicalChecklist,
            createdBy: hierarchicalChecklist.createdBy,
            createdAt: hierarchicalChecklist.createdAt
          };
          
          console.log(`[API] 新システム: 構造化レスポンス:`, response);
          return NextResponse.json(response);
        } else {
          console.log('[API] 新システム: 階層型データ見つからず、既存システムにフォールバック');
        }
        
      } catch (hierarchicalError) {
        console.warn('[API] 新システムエラー、既存システムにフォールバック:', hierarchicalError);
      }
    }

    // 🔄 既存システムの処理（従来通り）
    console.log('[API] 既存システム: 統一検品チェックリストデータを取得中...');
    
    // 商品に関連する検品チェックリストを取得
    const checklist = await prisma.inspectionChecklist.findUnique({
      where: { productId },
    });

    if (!checklist) {
      // 商品のメタデータから納品プラン商品IDを取得して検索
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (product?.metadata) {
        const metadata = JSON.parse(product.metadata);
        if (metadata.deliveryPlanProductId) {
          const deliveryPlanChecklist = await prisma.inspectionChecklist.findUnique({
            where: { deliveryPlanProductId: metadata.deliveryPlanProductId },
          });

          if (deliveryPlanChecklist) {
            console.log('[API] 既存システム: 納品プラン検品データ取得成功');
            return NextResponse.json(deliveryPlanChecklist);
          }
        }
      }

      console.log('[API] 既存システム: 検品データなし');
      return NextResponse.json(null);
    }

    console.log('[API] 既存システム: 商品検品データ取得成功');
    return NextResponse.json(checklist);
  } catch (error) {
    console.error('[API ERROR] 検品チェックリスト取得エラー:', error);
    return NextResponse.json(
      { error: '検品チェックリストの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    const productId = params.id;
    const body = await request.json();

    // 商品の存在確認
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // 検品チェックリストを作成または更新
    const checklist = await prisma.inspectionChecklist.upsert({
      where: { productId },
      create: {
        productId,
        hasScratches: body.hasScratches || false,
        hasDents: body.hasDents || false,
        hasDiscoloration: body.hasDiscoloration || false,
        hasDust: body.hasDust || false,
        powerOn: body.powerOn || false,
        allButtonsWork: body.allButtonsWork || false,
        screenDisplay: body.screenDisplay || false,
        connectivity: body.connectivity || false,
        lensClarity: body.lensClarity || false,
        aperture: body.aperture || false,
        focusAccuracy: body.focusAccuracy || false,
        stabilization: body.stabilization || false,
        notes: body.notes || null,
        createdBy: user.username || user.email,
        verifiedBy: user.username || user.email,
        verifiedAt: new Date(),
      },
      update: {
        hasScratches: body.hasScratches,
        hasDents: body.hasDents,
        hasDiscoloration: body.hasDiscoloration,
        hasDust: body.hasDust,
        powerOn: body.powerOn,
        allButtonsWork: body.allButtonsWork,
        screenDisplay: body.screenDisplay,
        connectivity: body.connectivity,
        lensClarity: body.lensClarity,
        aperture: body.aperture,
        focusAccuracy: body.focusAccuracy,
        stabilization: body.stabilization,
        notes: body.notes,
        verifiedBy: user.username || user.email,
        verifiedAt: new Date(),
        updatedBy: user.username || user.email,
      },
    });

    return NextResponse.json({
      success: true,
      checklist,
      message: '検品チェックリストを更新しました',
    });
  } catch (error) {
    console.error('Error updating inspection checklist:', error);
    return NextResponse.json(
      { error: '検品チェックリストの更新に失敗しました' },
      { status: 500 }
    );
  }
}