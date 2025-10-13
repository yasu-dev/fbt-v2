import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ページネーション表示用のテストデータ作成スクリプト
async function seedPaginationData() {
  console.log('🌱 ページネーション用データ作成開始...');

  // セラーユーザー作成
  const seller = await prisma.user.upsert({
    where: { email: 'test_seller@example.com' },
    update: {},
    create: {
      email: 'test_seller@example.com',
      username: 'test_seller',
      password: '$2b$10$hashedpassword',
      role: 'seller',
      fullName: 'テストセラー',
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'test_staff@example.com' },
    update: {},
    create: {
      email: 'test_staff@example.com',
      username: 'test_staff',
      password: '$2b$10$hashedpassword',
      role: 'staff',
      fullName: 'テストスタッフ',
    },
  });

  // 1. ロケーション データ（25件）
  console.log('📍 ロケーション作成...');
  for (let i = 1; i <= 25; i++) {
    await prisma.location.upsert({
      where: { code: `LOC-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        code: `LOC-${String(i).padStart(3, '0')}`,
        name: `倉庫エリア-${i}`,
        zone: String.fromCharCode(65 + Math.floor((i-1) / 5)), // A, B, C, D, E
        capacity: Math.floor(Math.random() * 500) + 100,
        address: `東京都品川区${i}-2-3`,
      },
    });
  }

  // 2. 商品データ（30件）
  console.log('📦 商品作成...');
  const categories = ['camera', 'lens', 'watch', 'accessory'];
  const statuses = ['inbound', 'inspection', 'storage', 'listing', 'ordered'];
  
  for (let i = 1; i <= 30; i++) {
    await prisma.product.create({
      data: {
        name: `テスト商品-${i}`,
        sku: `TEST${String(i).padStart(4, '0')}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        price: Math.floor(Math.random() * 200000) + 10000,
        condition: '中古良品',
        sellerId: seller.id,
      },
    });
  }

  // 3. 注文データ（25件）
  console.log('🛍️ 注文作成...');
  for (let i = 1; i <= 25; i++) {
    await prisma.order.create({
      data: {
        orderNumber: `TEST-${String(i).padStart(5, '0')}`,
        customerId: seller.id,
        status: ['pending', 'processing', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
        totalAmount: Math.floor(Math.random() * 100000) + 10000,
        shippingAddress: `東京都新宿区${i}-1-1`,
      },
    });
  }

  // 4. 返品データ（30件）
  console.log('🔄 返品データ作成...');
  const orders = await prisma.order.findMany();
  const products = await prisma.product.findMany();
  
  for (let i = 1; i <= 30 && i <= orders.length && i <= products.length; i++) {
    await prisma.return.create({
      data: {
        orderId: orders[i-1].id,
        productId: products[i-1].id,
        reason: ['不具合', '思っていたものと違う', '配送時の破損'][Math.floor(Math.random() * 3)],
        condition: '中古良品',
        refundAmount: Math.floor(Math.random() * 50000) + 5000,
        status: ['pending', 'approved', 'rejected', 'refunded', 'processing'][Math.floor(Math.random() * 5)],
        processedBy: i % 2 === 0 ? staff.id : null,
      },
    });
  }

  // 5. 配送プラン（25件）
  console.log('🚚 配送プラン作成...');
  for (let i = 1; i <= 25; i++) {
    await prisma.deliveryPlan.create({
      data: {
        planNumber: `PLAN-${String(i).padStart(4, '0')}`,
        sellerId: seller.id,
        sellerName: seller.fullName || 'セラー',
        status: ['draft', 'confirmed', 'in_transit', 'delivered'][Math.floor(Math.random() * 4)],
        deliveryAddress: `東京都渋谷区${i}-1-1`,
        contactEmail: `test${i}@example.com`,
        totalItems: Math.floor(Math.random() * 5) + 1,
        totalValue: Math.floor(Math.random() * 300000) + 50000,
      },
    });
  }

  // 6. 出荷データ（35件）
  console.log('📦 出荷データ作成...');
  
  // 実際に作成されたOrderのIDを取得
  const existingOrders = await prisma.order.findMany({
    select: { id: true },
    take: 25,
  });
  
  for (let i = 1; i <= 35; i++) {
    // 実在するOrderIDを使用（ローテーション）
    const orderIndex = (i - 1) % existingOrders.length;
    const actualOrderId = existingOrders[orderIndex].id;
    
    await prisma.shipment.create({
      data: {
        orderId: actualOrderId,
        carrier: ['yamato', 'sagawa', 'japan_post'][Math.floor(Math.random() * 3)],
        method: 'standard',
        status: ['pending', 'picking', 'packed', 'shipped', 'delivered'][Math.floor(Math.random() * 5)],
        priority: ['normal', 'high', 'urgent'][Math.floor(Math.random() * 3)],
        customerName: `顧客${i}`,
        address: `東京都港区${i}-2-2`,
        value: Math.floor(Math.random() * 150000) + 20000,
      },
    });
  }

  // 7. タスクデータ（40件）
  console.log('✅ タスクデータ作成...');
  const taskCategories = ['inspection', 'packaging', 'shipping', 'inventory'];
  const taskStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
  
  for (let i = 1; i <= 40; i++) {
    await prisma.task.create({
      data: {
        title: `タスク${i}`,
        description: `テストタスク${i}の詳細`,
        category: taskCategories[Math.floor(Math.random() * taskCategories.length)],
        priority: ['normal', 'high', 'urgent'][Math.floor(Math.random() * 3)],
        status: taskStatuses[Math.floor(Math.random() * taskStatuses.length)],
        assignedTo: i % 3 === 0 ? staff.id : null,
      },
    });
  }

  console.log('✅ ページネーション用データ作成完了！');
  console.log('📊 作成データ:');
  console.log('  - 25 ロケーション');
  console.log('  - 30 商品');
  console.log('  - 25 注文');
  console.log('  - 30 返品');
  console.log('  - 25 配送プラン');
  console.log('  - 35 出荷');
  console.log('  - 40 タスク');
}

// 実行
seedPaginationData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
