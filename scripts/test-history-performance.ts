import { PrismaClient } from '@prisma/client';
import { performance } from 'perf_hooks';

const prisma = new PrismaClient();

interface PerformanceResult {
  testName: string;
  duration: number;
  recordCount: number;
  avgTimePerRecord: number;
  status: 'success' | 'error';
  error?: string;
}

/**
 * 商品履歴API最適化のパフォーマンステスト
 */
export class HistoryPerformanceTester {
  private results: PerformanceResult[] = [];

  /**
   * 単一商品の履歴取得テスト
   */
  async testSingleProductHistory(productId: string): Promise<PerformanceResult> {
    const testName = `single_product_history_${productId}`;
    const startTime = performance.now();

    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
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

      const endTime = performance.now();
      const duration = endTime - startTime;

      if (!product) {
        return {
          testName,
          duration,
          recordCount: 0,
          avgTimePerRecord: 0,
          status: 'error',
          error: 'Product not found'
        };
      }

      const totalRecords = 
        product.activities.length + 
        product.movements.length + 
        product.orderItems.length;

      const result: PerformanceResult = {
        testName,
        duration,
        recordCount: totalRecords,
        avgTimePerRecord: totalRecords > 0 ? duration / totalRecords : 0,
        status: 'success'
      };

      this.results.push(result);
      return result;

    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      const result: PerformanceResult = {
        testName,
        duration,
        recordCount: 0,
        avgTimePerRecord: 0,
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      };

      this.results.push(result);
      return result;
    }
  }

  /**
   * 複数商品の履歴取得テスト
   */
  async testMultipleProductsHistory(productIds: string[]): Promise<PerformanceResult> {
    const testName = `multiple_products_history_${productIds.length}`;
    const startTime = performance.now();

    try {
      const promises = productIds.map(id => this.testSingleProductHistory(id));
      const results = await Promise.all(promises);

      const endTime = performance.now();
      const duration = endTime - startTime;
      const totalRecords = results.reduce((sum, r) => sum + r.recordCount, 0);

      const result: PerformanceResult = {
        testName,
        duration,
        recordCount: totalRecords,
        avgTimePerRecord: totalRecords > 0 ? duration / totalRecords : 0,
        status: results.every(r => r.status === 'success') ? 'success' : 'error'
      };

      this.results.push(result);
      return result;

    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      const result: PerformanceResult = {
        testName,
        duration,
        recordCount: 0,
        avgTimePerRecord: 0,
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      };

      this.results.push(result);
      return result;
    }
  }

  /**
   * Activity記録のパフォーマンステスト
   */
  async testActivityCreation(count: number = 100): Promise<PerformanceResult> {
    const testName = `activity_creation_${count}`;
    const startTime = performance.now();

    try {
      // テスト用商品を取得
      const product = await prisma.product.findFirst();
      if (!product) {
        throw new Error('No products found for testing');
      }

      // テスト用ユーザーを取得
      const user = await prisma.user.findFirst();
      if (!user) {
        throw new Error('No users found for testing');
      }

      const activities = [];
      for (let i = 0; i < count; i++) {
        activities.push({
          type: 'test_activity',
          description: `Performance test activity ${i + 1}`,
          userId: user.id,
          productId: product.id,
          metadata: JSON.stringify({
            testIndex: i + 1,
            timestamp: new Date().toISOString()
          })
        });
      }

      await prisma.activity.createMany({
        data: activities
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // テストデータをクリーンアップ
      await prisma.activity.deleteMany({
        where: {
          type: 'test_activity',
          productId: product.id
        }
      });

      const result: PerformanceResult = {
        testName,
        duration,
        recordCount: count,
        avgTimePerRecord: duration / count,
        status: 'success'
      };

      this.results.push(result);
      return result;

    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      const result: PerformanceResult = {
        testName,
        duration,
        recordCount: 0,
        avgTimePerRecord: 0,
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      };

      this.results.push(result);
      return result;
    }
  }

  /**
   * データベース統計情報の取得
   */
  async getDatabaseStats() {
    const stats = {
      products: await prisma.product.count(),
      activities: await prisma.activity.count(),
      movements: await prisma.inventoryMovement.count(),
      orders: await prisma.order.count(),
      orderItems: await prisma.orderItem.count()
    };

    return stats;
  }

  /**
   * 全体的なパフォーマンステストの実行
   */
  async runFullPerformanceTest(): Promise<{
    summary: any;
    details: PerformanceResult[];
    databaseStats: any;
  }> {
    console.log('🚀 商品履歴API パフォーマンステスト開始...');

    // データベース統計を取得
    const databaseStats = await this.getDatabaseStats();
    console.log('📊 データベース統計:', databaseStats);

    // テスト対象の商品を取得
    const products = await prisma.product.findMany({
      take: 5,
      select: { id: true, name: true }
    });

    if (products.length === 0) {
      throw new Error('No products found for testing');
    }

    console.log(`📋 テスト対象商品: ${products.length}件`);

    // 個別商品テスト
    console.log('🔍 単一商品履歴取得テスト実行中...');
    for (const product of products) {
      await this.testSingleProductHistory(product.id);
    }

    // 複数商品テスト
    console.log('🔍 複数商品履歴取得テスト実行中...');
    await this.testMultipleProductsHistory(products.map(p => p.id));

    // Activity作成テスト
    console.log('🔍 Activity作成パフォーマンステスト実行中...');
    await this.testActivityCreation(50);

    // 結果の集計
    const summary = {
      totalTests: this.results.length,
      successfulTests: this.results.filter(r => r.status === 'success').length,
      failedTests: this.results.filter(r => r.status === 'error').length,
      averageDuration: this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length,
      totalRecords: this.results.reduce((sum, r) => sum + r.recordCount, 0),
      averageTimePerRecord: this.results
        .filter(r => r.recordCount > 0)
        .reduce((sum, r) => sum + r.avgTimePerRecord, 0) / 
        this.results.filter(r => r.recordCount > 0).length || 0
    };

    console.log('✅ パフォーマンステスト完了');
    console.log('📈 テスト結果サマリー:', summary);

    return {
      summary,
      details: this.results,
      databaseStats
    };
  }

  /**
   * 結果をファイルに出力
   */
  async saveResultsToFile(filename: string = 'performance-test-results.json') {
    const results = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.results.length,
        successfulTests: this.results.filter(r => r.status === 'success').length,
        failedTests: this.results.filter(r => r.status === 'error').length,
        averageDuration: this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length,
        totalRecords: this.results.reduce((sum, r) => sum + r.recordCount, 0)
      },
      details: this.results,
      databaseStats: await this.getDatabaseStats()
    };

    const fs = require('fs');
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`📄 テスト結果を ${filename} に保存しました`);
  }
}

// 実行スクリプト（直接実行時）
if (require.main === module) {
  async function runTest() {
    const tester = new HistoryPerformanceTester();
    
    try {
      await tester.runFullPerformanceTest();
      await tester.saveResultsToFile();
    } catch (error) {
      console.error('❌ テスト実行中にエラーが発生しました:', error);
    } finally {
      await prisma.$disconnect();
    }
  }

  runTest();
}