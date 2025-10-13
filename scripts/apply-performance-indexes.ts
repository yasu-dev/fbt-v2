import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * パフォーマンス最適化のためのインデックス適用スクリプト
 */
async function applyPerformanceIndexes() {
  console.log('🚀 パフォーマンス最適化インデックスの適用を開始します...');

  try {
    // 1. Activityテーブルのインデックス
    console.log('📊 Activityテーブルのインデックスを作成中...');
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_activities_product_id_created_at 
      ON activities(productId, createdAt DESC)
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_activities_user_id_created_at 
      ON activities(userId, createdAt DESC)
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_activities_order_id_created_at 
      ON activities(orderId, createdAt DESC)
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_activities_type_created_at 
      ON activities(type, createdAt DESC)
    `;

    // 2. InventoryMovementテーブルのインデックス
    console.log('📦 InventoryMovementテーブルのインデックスを作成中...');
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id_created_at 
      ON inventory_movements(productId, createdAt DESC)
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_inventory_movements_locations_created_at 
      ON inventory_movements(fromLocationId, toLocationId, createdAt DESC)
    `;

    // 3. OrderItemテーブルのインデックス
    console.log('🛒 OrderItemテーブルのインデックスを作成中...');
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_order_items_product_id 
      ON order_items(productId)
    `;

    // 4. Orderテーブルのインデックス
    console.log('📋 Orderテーブルのインデックスを作成中...');
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_orders_shipped_at 
      ON orders(shippedAt DESC)
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_orders_delivered_at 
      ON orders(deliveredAt DESC)
    `;

    // 5. Productテーブルのインデックス
    console.log('🏷️ Productテーブルのインデックスを作成中...');
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_products_updated_at 
      ON products(updatedAt DESC)
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_products_seller_id_updated_at 
      ON products(sellerId, updatedAt DESC)
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_products_status_updated_at 
      ON products(status, updatedAt DESC)
    `;

    // 6. 統計の更新
    console.log('📈 データベース統計を更新中...');
    await prisma.$executeRaw`ANALYZE`;

    console.log('✅ パフォーマンス最適化インデックスの適用が完了しました');

    // 適用されたインデックスの確認
    console.log('🔍 作成されたインデックスを確認中...');
    const indexes = await prisma.$queryRaw`
      SELECT name, sql FROM sqlite_master 
      WHERE type='index' 
      AND tbl_name IN ('activities', 'inventory_movements', 'order_items', 'orders', 'products')
      AND name LIKE 'idx_%'
      ORDER BY tbl_name, name
    ` as Array<{ name: string; sql: string }>;

    console.log(`📋 適用されたインデックス数: ${indexes.length}`);
    indexes.forEach((index, i) => {
      console.log(`  ${i + 1}. ${index.name}`);
    });

    return {
      success: true,
      indexesCreated: indexes.length,
      indexes: indexes.map(idx => idx.name)
    };

  } catch (error) {
    console.error('❌ インデックス適用中にエラーが発生しました:', error);
    throw error;
  }
}

/**
 * インデックスの効果を確認するためのクエリテスト
 */
async function testQueryPerformance() {
  console.log('🧪 クエリパフォーマンステストを実行中...');

  const testResults = [];

  try {
    // テスト1: 商品履歴取得クエリ
    const productCount = await prisma.product.count();
    if (productCount > 0) {
      const product = await prisma.product.findFirst();
      if (product) {
        const startTime = Date.now();
        
        await prisma.product.findUnique({
          where: { id: product.id },
          include: {
            activities: {
              include: {
                user: {
                  select: { id: true, username: true, email: true }
                }
              },
              orderBy: { createdAt: 'asc' }
            },
            movements: {
              include: {
                fromLocation: true,
                toLocation: true
              },
              orderBy: { createdAt: 'asc' }
            },
            orderItems: {
              include: {
                order: {
                  select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    orderDate: true,
                    shippedAt: true,
                    deliveredAt: true
                  }
                }
              }
            }
          }
        });

        const endTime = Date.now();
        testResults.push({
          test: 'product_history_query',
          duration: endTime - startTime,
          productId: product.id
        });
      }
    }

    // テスト2: Activity検索クエリ
    const startTime2 = Date.now();
    await prisma.activity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true }
        },
        product: {
          select: { id: true, name: true, sku: true }
        }
      }
    });
    const endTime2 = Date.now();
    testResults.push({
      test: 'recent_activities_query',
      duration: endTime2 - startTime2
    });

    console.log('📊 パフォーマンステスト結果:');
    testResults.forEach(result => {
      console.log(`  ${result.test}: ${result.duration}ms`);
    });

    return testResults;

  } catch (error) {
    console.error('❌ パフォーマンステスト中にエラーが発生しました:', error);
    return [];
  }
}

// 実行スクリプト（直接実行時）
async function main() {
  try {
    // インデックス適用
    const indexResult = await applyPerformanceIndexes();
    
    // パフォーマンステスト
    const performanceResults = await testQueryPerformance();
    
    console.log('\n🎉 最適化作業が完了しました！');
    console.log(`📈 作成されたインデックス: ${indexResult.indexesCreated}個`);
    console.log('📊 パフォーマンステスト完了');
    
  } catch (error) {
    console.error('❌ 実行中にエラーが発生しました:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { applyPerformanceIndexes, testQueryPerformance };