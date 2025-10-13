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
 * 新システム専用テストデータ作成API
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[HIERARCHICAL TEST DATA] テストデータ作成開始');
    
    // 既存データをクリア（テスト用）
    await hierarchicalPrisma.hierarchicalInspectionResponse.deleteMany();
    await hierarchicalPrisma.hierarchicalInspectionChecklist.deleteMany();
    await hierarchicalPrisma.product.deleteMany();
    await hierarchicalPrisma.deliveryPlanProduct.deleteMany();
    
    // テスト用ユーザー作成（存在確認）
    let testUser = await hierarchicalPrisma.user.findFirst({
      where: { email: 'test-hierarchical@example.com' }
    });
    
    if (!testUser) {
      testUser = await hierarchicalPrisma.user.create({
        data: {
          username: 'テスト検品者',
          email: 'test-hierarchical@example.com',
          fullName: 'テスト検品者（階層型）',
          role: 'staff'
        }
      });
    }
    
    // テスト用商品作成
    const testProducts = await hierarchicalPrisma.product.createMany({
      data: [
        {
          name: 'Canon EOS R5 テスト商品',
          sku: 'HIER-TEST-001',
          category: 'camera_body',
          status: 'inspection',
        },
        {
          name: 'Nikon Z9 テスト商品',
          sku: 'HIER-TEST-002',
          category: 'camera_body',
          status: 'inspection',
        },
        {
          name: 'Canon RF 24-70mm F2.8 L IS USM テストレンズ',
          sku: 'HIER-TEST-003',
          category: 'lens',
          status: 'inspection',
        }
      ]
    });
    
    // テスト用検品チェックリスト作成
    const products = await hierarchicalPrisma.product.findMany();
    
    const testChecklists = [];
    
    for (const product of products) {
      // サンプルの階層型検品データ
      const sampleResponses = {
        camera_body_exterior: {
          body_scratches: { booleanValue: true },
          body_dirt: { booleanValue: false },
          body_other: { textValue: `${product.name}の外観に軽微な使用感あり` }
        },
        viewfinder: {
          vf_dust: { booleanValue: true },
          vf_fog: { booleanValue: false }
        },
        optical: {
          opt_dust_particles: { booleanValue: true },
          opt_other: { textValue: '光学系内に微細なホコリ数点あり、撮影への影響なし' }
        },
        exposure_function: {
          exp_working: { booleanValue: true },
          exp_not_working: { booleanValue: false }
        },
        accessories: {
          acc_battery: { booleanValue: true },
          acc_case: { booleanValue: product.category === 'camera_body' },
          acc_manual: { booleanValue: false }
        }
      };
      
      const checklist = await hierarchicalPrisma.hierarchicalInspectionChecklist.create({
        data: {
          productId: product.id,
          createdBy: testUser.id,
          notes: `テスト用検品データ: ${product.name}`,
        }
      });
      
      // 回答データを保存
      for (const [categoryId, categoryData] of Object.entries(sampleResponses)) {
        for (const [itemId, itemData] of Object.entries(categoryData)) {
          await hierarchicalPrisma.hierarchicalInspectionResponse.create({
            data: {
              checklistId: checklist.id,
              categoryId,
              itemId,
              booleanValue: (itemData as any).booleanValue || null,
              textValue: (itemData as any).textValue || null,
            }
          });
        }
      }
      
      testChecklists.push(checklist);
    }
    
    console.log(`[HIERARCHICAL TEST DATA] ${testChecklists.length}件のテスト検品チェックリストを作成完了`);
    
    return NextResponse.json({
      success: true,
      message: '新システム専用テストデータが作成されました',
      data: {
        userCreated: testUser.id,
        productsCreated: products.length,
        checklistsCreated: testChecklists.length
      }
    });
    
  } catch (error) {
    console.error('[HIERARCHICAL TEST DATA ERROR]:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create test data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
