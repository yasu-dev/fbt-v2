import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedTestData() {
  console.log('🌱 テストデータの作成を開始します...');

  try {
    // 既存のテストデータをクリーンアップ
    console.log('🧹 既存のテストデータをクリーンアップ中...');
    
    await prisma.notification.deleteMany({
      where: {
        OR: [
          { userId: { contains: 'test' } },
          { title: { contains: 'テスト' } }
        ]
      }
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          endsWith: '@test.com'
        }
      }
    });

    await prisma.product.deleteMany({
      where: {
        sku: {
          startsWith: 'TEST-'
        }
      }
    });

    // 1. テストユーザーの作成
    console.log('👥 テストユーザーを作成中...');
    
    const hashedPassword = await bcrypt.hash('password', 10);

    const sellerUser = await prisma.user.create({
      data: {
        id: 'test-seller-001',
        email: 'seller@test.com',
        username: 'test-seller',
        password: hashedPassword,
        role: 'seller',
        fullName: 'テストセラー',
        phoneNumber: '090-1234-5678',
        address: '東京都港区テスト1-2-3',
        notificationSettings: JSON.stringify({
          product_sold: true,
          inventory_alert: true,
          return_request: true,
          inspection_complete: true,
          picking_request: false // セラーはピッキング通知不要
        })
      }
    });

    const staffUser = await prisma.user.create({
      data: {
        id: 'test-staff-001',
        email: 'staff@test.com',
        username: 'test-staff',
        password: hashedPassword,
        role: 'staff',
        fullName: 'テストスタッフ',
        phoneNumber: '090-8765-4321',
        address: '東京都渋谷区テスト4-5-6',
        notificationSettings: JSON.stringify({
          product_sold: false, // スタッフは商品売上通知不要
          inventory_alert: true,
          return_request: true,
          inspection_complete: true,
          picking_request: true
        })
      }
    });

    console.log(`✅ テストユーザー作成完了: ${sellerUser.email}, ${staffUser.email}`);

    // 2. テスト用ロケーションの作成
    console.log('📍 テスト用ロケーションを作成中...');
    
    const testLocation = await prisma.location.create({
      data: {
        id: 'test-location-001',
        code: 'TEST-A1',
        name: 'テスト倉庫A棟1階',
        zone: 'A',
        capacity: 1000,
        isActive: true,
        address: '東京都江東区テスト倉庫1-1-1',
        phone: '03-1234-5678',
        email: 'warehouse@test.com'
      }
    });

    console.log(`✅ テストロケーション作成完了: ${testLocation.code}`);

    // 3. 各ワークフロー状態のテスト商品を作成
    console.log('📦 テスト商品を作成中...');
    
    const testProducts = [
      {
        sku: 'TEST-LISTING-001',
        name: 'テスト商品（出品中）Canon EOS R5',
        status: 'listing',
        category: 'camera',
        price: 450000,
        condition: 'excellent'
      },
      {
        sku: 'TEST-LISTING-002', 
        name: 'テスト商品（出品中）Sony α7R IV',
        status: 'listing',
        category: 'camera',
        price: 380000,
        condition: 'very_good'
      },
      {
        sku: 'TEST-SOLD-001',
        name: 'テスト商品（購入者決定済）Nikon Z9',
        status: 'sold',
        category: 'camera',
        price: 520000,
        condition: 'excellent'
      },
      {
        sku: 'TEST-INBOUND-001',
        name: 'テスト商品（入荷待ち）Fujifilm X-T4',
        status: 'inbound',
        category: 'camera',
        price: 180000,
        condition: 'good'
      },
      {
        sku: 'TEST-INSPECTION-001',
        name: 'テスト商品（検品中）Panasonic GH6',
        status: 'inspection',
        category: 'camera',
        price: 280000,
        condition: 'very_good'
      }
    ];

    const createdProducts = [];
    for (const productData of testProducts) {
      const product = await prisma.product.create({
        data: {
          ...productData,
          description: `${productData.name}のテスト用商品データです。E2Eテスト用に作成されました。`,
          imageUrl: '/images/test-product.jpg',
          sellerId: sellerUser.id,
          currentLocationId: testLocation.id,
          inspectedAt: ['sold', 'listing'].includes(productData.status) ? new Date() : null,
          inspectedBy: ['sold', 'listing'].includes(productData.status) ? staffUser.id : null,
          inspectionNotes: ['sold', 'listing'].includes(productData.status) ? '検品完了：問題なし' : null,
          metadata: JSON.stringify({
            testData: true,
            originalPrice: productData.price,
            estimatedShipping: '2-3日',
            brand: productData.name.split(' ')[1]?.split('（')[0] || 'TestBrand'
          })
        }
      });
      createdProducts.push(product);
      console.log(`📦 商品作成: ${product.sku} (${product.status})`);
    }

    // 4. sold状態の商品用のテスト注文を作成
    console.log('📋 テスト注文を作成中...');
    
    const soldProduct = createdProducts.find(p => p.status === 'sold');
    if (soldProduct) {
      const testOrder = await prisma.order.create({
        data: {
          orderNumber: 'TEST-ORDER-001',
          customerId: sellerUser.id, // テスト用：セラーが顧客役も兼ねる
          status: 'pending',
          totalAmount: soldProduct.price,
          shippingAddress: '〒100-0001 東京都千代田区千代田1-1-1 テストマンション101',
          paymentMethod: 'credit_card',
          notes: 'E2Eテスト用の注文データです',
          items: {
            create: [
              {
                productId: soldProduct.id,
                quantity: 1,
                price: soldProduct.price
              }
            ]
          }
        }
      });

      console.log(`📋 テスト注文作成完了: ${testOrder.orderNumber}`);
    }

    // 5. テスト用通知を作成（既読・未読のテスト用）
    console.log('🔔 テスト通知を作成中...');
    
    const testNotifications = [
      {
        type: 'product_sold',
        title: '🎉 商品売上通知（テスト）',
        message: 'テスト商品「Canon EOS R5」が売れました！',
        userId: sellerUser.id,
        read: false,
        priority: 'high' as const,
        notificationType: 'product_sold',
        action: 'sales'
      },
      {
        type: 'inventory_alert',
        title: '⚠️ 在庫アラート（テスト）',
        message: 'テスト商品の在庫が少なくなっています。',
        userId: sellerUser.id,
        read: true,
        priority: 'medium' as const,
        notificationType: 'inventory_alert',
        action: 'inventory'
      },
      {
        type: 'picking_request',
        title: '📋 ピッキング依頼（テスト）',
        message: 'テスト注文のピッキングを開始してください。',
        userId: staffUser.id,
        read: false,
        priority: 'high' as const,
        notificationType: 'picking_request',
        action: 'shipping'
      }
    ];

    for (const notificationData of testNotifications) {
      const notification = await prisma.notification.create({
        data: {
          ...notificationData,
          metadata: JSON.stringify({
            testData: true,
            createdBy: 'seed-script',
            productId: createdProducts[0].id
          })
        }
      });
      console.log(`🔔 通知作成: ${notification.title} (${notification.read ? '既読' : '未読'})`);
    }

    // 6. テスト用アクティビティログを作成
    console.log('📝 テストアクティビティを作成中...');
    
    for (const product of createdProducts) {
      await prisma.activity.create({
        data: {
          type: 'product_created',
          description: `テスト商品「${product.name}」が作成されました`,
          userId: sellerUser.id,
          productId: product.id,
          metadata: JSON.stringify({
            testData: true,
            status: product.status,
            sku: product.sku
          })
        }
      });
    }

    console.log('✅ テストデータの作成が完了しました！');
    console.log('\n📊 作成されたテストデータ:');
    console.log(`👥 ユーザー: ${testProducts.length + 2}件`);
    console.log(`📦 商品: ${createdProducts.length}件`);
    console.log(`🔔 通知: ${testNotifications.length}件`);
    console.log(`📍 ロケーション: 1件`);
    console.log('\n🧪 E2Eテストの実行準備が整いました！');

  } catch (error) {
    console.error('❌ テストデータ作成中にエラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプトを直接実行した場合
if (require.main === module) {
  seedTestData()
    .then(() => {
      console.log('🎉 テストデータのシーディングが完了しました');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 シーディングに失敗しました:', error);
      process.exit(1);
    });
}

export default seedTestData;