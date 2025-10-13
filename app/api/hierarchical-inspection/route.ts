import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/prisma/generated/hierarchical';

// 新システム専用Prismaクライアント
const hierarchicalPrisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${process.cwd()}/prisma/hierarchical.db`
    }
  }
});

/**
 * 新しい階層型検品チェックリストシステム専用API
 * 既存システムと完全分離
 */

// 検品チェックリスト一覧取得
export async function GET(request: NextRequest) {
  try {
    console.log('[HIERARCHICAL API] 検品チェックリスト一覧取得開始');
    
    const checklists = await hierarchicalPrisma.hierarchicalInspectionChecklist.findMany({
      include: {
        responses: true,
        product: true,
        deliveryPlanProduct: true,
        createdByUser: {
          select: {
            username: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`[HIERARCHICAL API] ${checklists.length}件の検品チェックリストを取得`);
    
    return NextResponse.json({
      success: true,
      data: checklists,
      count: checklists.length
    });
    
  } catch (error) {
    console.error('[HIERARCHICAL API ERROR] 検品チェックリスト取得エラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch hierarchical inspection checklists',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 新しい検品チェックリスト作成
export async function POST(request: NextRequest) {
  try {
    console.log('[HIERARCHICAL API] 新しい検品チェックリスト作成開始');
    
    const body = await request.json();
    const {
      productId,
      deliveryPlanProductId,
      createdBy,
      responses,
      notes
    } = body;

    console.log('[HIERARCHICAL API] 受信データ:', {
      productId,
      deliveryPlanProductId,
      createdBy,
      responsesCount: responses ? Object.keys(responses).length : 0,
      notes
    });

    // トランザクション内で検品チェックリストと回答を保存
    const result = await hierarchicalPrisma.$transaction(async (tx) => {
      // テスト用ユーザーが存在しない場合は作成
      let actualUserId = createdBy;
      if (createdBy === 'test-user' || !createdBy) {
        let testUser = await tx.user.findFirst({
          where: { email: 'hierarchical-test@example.com' }
        });
        
        if (!testUser) {
          testUser = await tx.user.create({
            data: {
              username: `テスト検品者_${Date.now()}`, // ユニーク性を保証
              email: 'hierarchical-test@example.com',
              fullName: 'テスト検品者（階層型システム）',
              role: 'staff'
            }
          });
          console.log('[HIERARCHICAL API] テスト用ユーザー作成:', testUser.id);
        }
        actualUserId = testUser.id;
      }
      
      // メイン検品チェックリスト作成
      const checklist = await tx.hierarchicalInspectionChecklist.create({
        data: {
          productId,
          deliveryPlanProductId,
          createdBy: actualUserId,
          notes: notes || null,
        },
      });

      console.log('[HIERARCHICAL API] 検品チェックリスト作成完了:', checklist.id);

      // 回答データを保存
      const responseRecords = [];
      if (responses && typeof responses === 'object') {
        for (const [categoryId, categoryData] of Object.entries(responses)) {
          for (const [itemId, itemData] of Object.entries(categoryData as any)) {
            if (itemData && typeof itemData === 'object') {
              const responseRecord = await tx.hierarchicalInspectionResponse.create({
                data: {
                  checklistId: checklist.id,
                  categoryId,
                  itemId,
                  booleanValue: (itemData as any).booleanValue || null,
                  textValue: (itemData as any).textValue || null,
                },
              });
              responseRecords.push(responseRecord);
            }
          }
        }
      }

      console.log(`[HIERARCHICAL API] ${responseRecords.length}件の回答を保存完了`);

      // 完全なデータで返す
      const completeChecklist = await tx.hierarchicalInspectionChecklist.findUnique({
        where: { id: checklist.id },
        include: {
          responses: true,
          product: true,
          deliveryPlanProduct: true,
          createdByUser: {
            select: {
              username: true,
              email: true,
            }
          }
        }
      });

      return completeChecklist;
    });

    console.log('[HIERARCHICAL API] 検品チェックリスト作成・保存完了:', result?.id);

    return NextResponse.json({
      success: true,
      data: result,
      message: '階層型検品チェックリストが正常に作成されました'
    });

  } catch (error) {
    console.error('[HIERARCHICAL API ERROR] 検品チェックリスト作成エラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create hierarchical inspection checklist',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
