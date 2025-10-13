import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 商品画像付きシードデータを作成中...');

  // パスワードをハッシュ化
  const hashedPassword = await bcrypt.hash('password123', 12);

  // セラーユーザーを作成
  const seller = await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      email: 'seller@example.com',
      username: 'テストセラー',
      password: hashedPassword,
      role: 'seller',
    },
  });
  console.log('✅ セラーユーザーを作成しました:', seller.email);

  // スタッフユーザーを作成
  const staff = await prisma.user.upsert({
    where: { email: 'staff@example.com' },
    update: {},
    create: {
      email: 'staff@example.com',
      username: 'テストスタッフ',
      password: hashedPassword,
      role: 'staff',
    },
  });
  console.log('✅ スタッフユーザーを作成しました:', staff.email);

  // ページネーション用に十分な数のデモ商品データを作成（要件：camera, watch, other + 全ステータス）
  const demoProducts = [
    // カメラカテゴリ - 全ステータスを網羅
    { name: 'Sony α7 IV ボディ', sku: 'CAM-001', category: 'camera', price: 328000, status: 'inbound', condition: 'very_good' },
    { name: 'Canon EOS R5 ボディ', sku: 'CAM-002', category: 'camera', price: 398000, status: 'inspection', condition: 'excellent' },
    { name: 'Nikon Z9 ボディ', sku: 'CAM-003', category: 'camera', price: 598000, status: 'storage', condition: 'excellent' },
    { name: 'FUJIFILM X-T5 ボディ', sku: 'CAM-004', category: 'camera', price: 198000, status: 'listing', condition: 'very_good' },
    { name: 'Canon EOS R6 Mark II', sku: 'CAM-005', category: 'camera', price: 298000, status: 'ordered', condition: 'very_good' },
    { name: 'Sony α7R V ボディ', sku: 'CAM-006', category: 'camera', price: 438000, status: 'shipping', condition: 'excellent' },
    { name: 'Nikon Z6 II ボディ', sku: 'CAM-007', category: 'camera', price: 228000, status: 'sold', condition: 'good' },
    { name: 'Leica Q2', sku: 'CAM-008', category: 'camera', price: 658000, status: 'returned', condition: 'excellent' },
    { name: 'Panasonic S5 II', sku: 'CAM-009', category: 'camera', price: 215000, status: 'storage', condition: 'fair' },
    { name: 'Canon EOS R3 ボディ', sku: 'CAM-010', category: 'camera', price: 698000, status: 'inbound', condition: 'excellent' },
    { name: 'Sony α1 ボディ', sku: 'CAM-011', category: 'camera', price: 798000, status: 'inspection', condition: 'excellent' },
    { name: 'Nikon Z7 II ボディ', sku: 'CAM-012', category: 'camera', price: 298000, status: 'storage', condition: 'very_good' },
    { name: 'FUJIFILM GFX100S', sku: 'CAM-013', category: 'camera', price: 748000, status: 'listing', condition: 'excellent' },
    { name: 'Canon EOS R10 ボディ', sku: 'CAM-014', category: 'camera', price: 92800, status: 'ordered', condition: 'good' },
    { name: 'Sony α7C ボディ', sku: 'CAM-015', category: 'camera', price: 198000, status: 'shipping', condition: 'very_good' },
    { name: 'Nikon Z f ボディ', sku: 'CAM-016', category: 'camera', price: 218000, status: 'sold', condition: 'excellent' },
    { name: 'OLYMPUS E-M1X', sku: 'CAM-017', category: 'camera', price: 128000, status: 'storage', condition: 'good' },
    { name: 'Panasonic GH6', sku: 'CAM-018', category: 'camera', price: 248000, status: 'listing', condition: 'very_good' },
    
    // 腕時計カテゴリ - 全ステータスを網羅
    { name: 'Rolex Submariner Date', sku: 'WATCH-001', category: 'watch', price: 1580000, status: 'inbound', condition: 'excellent' },
    { name: 'Omega Speedmaster Professional', sku: 'WATCH-002', category: 'watch', price: 758000, status: 'inspection', condition: 'very_good' },
    { name: 'Rolex GMT-Master II', sku: 'WATCH-003', category: 'watch', price: 1890000, status: 'storage', condition: 'excellent' },
    { name: 'Grand Seiko SBGA211', sku: 'WATCH-004', category: 'watch', price: 658000, status: 'listing', condition: 'excellent' },
    { name: 'Patek Philippe Nautilus', sku: 'WATCH-005', category: 'watch', price: 12800000, status: 'ordered', condition: 'excellent' },
    { name: 'Audemars Piguet Royal Oak', sku: 'WATCH-006', category: 'watch', price: 8900000, status: 'shipping', condition: 'very_good' },
    { name: 'Rolex Day-Date 40', sku: 'WATCH-007', category: 'watch', price: 4280000, status: 'sold', condition: 'excellent' },
    { name: 'Omega Planet Ocean', sku: 'WATCH-008', category: 'watch', price: 480000, status: 'returned', condition: 'good' },
    { name: 'TAG Heuer Carrera', sku: 'WATCH-009', category: 'watch', price: 350000, status: 'storage', condition: 'fair' },
    { name: 'Breitling Navitimer', sku: 'WATCH-010', category: 'watch', price: 680000, status: 'storage', condition: 'excellent' },
    { name: 'IWC Pilot\'s Watch', sku: 'WATCH-011', category: 'watch', price: 520000, status: 'listing', condition: 'very_good' },
    { name: 'Tudor Black Bay', sku: 'WATCH-012', category: 'watch', price: 280000, status: 'storage', condition: 'good' },
    { name: 'Casio G-Shock MR-G', sku: 'WATCH-013', category: 'watch', price: 98000, status: 'inspection', condition: 'good' },
    { name: 'Longines Master Collection', sku: 'WATCH-014', category: 'watch', price: 180000, status: 'ordered', condition: 'very_good' },
    { name: 'Zenith Chronomaster', sku: 'WATCH-015', category: 'watch', price: 780000, status: 'shipping', condition: 'excellent' },
    
    // その他カテゴリ - 全ステータスを網羅  
    { name: 'Manfrotto 三脚 MT055', sku: 'OTHER-001', category: 'other', price: 35000, status: 'inbound', condition: 'good' },
    { name: 'Godox ストロボ AD600', sku: 'OTHER-002', category: 'other', price: 85000, status: 'inspection', condition: 'very_good' },
    { name: 'SanDisk CFexpress 128GB', sku: 'OTHER-003', category: 'other', price: 45000, status: 'storage', condition: 'excellent' },
    { name: 'Lowepro カメラバッグ', sku: 'OTHER-004', category: 'other', price: 28000, status: 'listing', condition: 'good' },
    { name: 'Peak Design ストラップ', sku: 'OTHER-005', category: 'other', price: 8500, status: 'ordered', condition: 'excellent' },
    { name: 'DJI Ronin-S ジンバル', sku: 'OTHER-006', category: 'other', price: 98000, status: 'shipping', condition: 'very_good' },
    { name: 'RODE VideoMic Pro', sku: 'OTHER-007', category: 'other', price: 35000, status: 'sold', condition: 'good' },
    { name: 'Sekonic 露出計', sku: 'OTHER-008', category: 'other', price: 58000, status: 'returned', condition: 'fair' },
    { name: 'Profoto B10 ストロボ', sku: 'OTHER-009', category: 'other', price: 168000, status: 'storage', condition: 'poor' },
    { name: 'Wacom Cintiq Pro 24', sku: 'OTHER-010', category: 'other', price: 298000, status: 'storage', condition: 'very_good' },
    { name: 'Atomos Ninja V', sku: 'OTHER-011', category: 'other', price: 78000, status: 'listing', condition: 'excellent' },
    { name: 'Blackmagic Video Assist', sku: 'OTHER-012', category: 'other', price: 48000, status: 'inspection', condition: 'good' },
  ];

  // 商品とその画像を作成
  console.log('📦 商品データと画像を作成中...');
  for (let i = 0; i < demoProducts.length; i++) {
    const productData = demoProducts[i];
    
    // 商品作成
    const product = await prisma.product.upsert({
      where: { sku: productData.sku },
      update: {},
      create: {
        ...productData,
        sellerId: seller.id,
        entryDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // 過去30日以内
      },
    });
    
    // 各商品に複数の画像を追加（画像URLはプレースホルダー）
    const imageCount = Math.floor(Math.random() * 4) + 2; // 2-5枚の画像
    for (let j = 0; j < imageCount; j++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: `https://picsum.photos/400/300?random=${product.id}-${j}`,
          thumbnailUrl: `https://picsum.photos/150/150?random=${product.id}-${j}`,
          filename: `${product.sku}-image-${j + 1}.jpg`,
          size: 250000 + Math.floor(Math.random() * 750000), // 250KB-1MB
          mimeType: 'image/jpeg',
          category: j === 0 ? 'main' : 'detail',
          description: j === 0 ? 'メイン商品画像' : `詳細画像 ${j}`,
          sortOrder: j,
        },
      });
    }
    
    console.log(`✅ 商品を作成: ${product.name} (${imageCount}枚の画像付き)`);
  }

  // ロケーション作成
  const locations = [
    { code: 'STD-A-01', name: '標準棚 A-01', zone: 'A', capacity: 50 },
    { code: 'STD-A-02', name: '標準棚 A-02', zone: 'A', capacity: 50 },
    { code: 'HUM-01', name: '防湿庫 01', zone: 'H', capacity: 20 },
    { code: 'VAULT-01', name: '金庫室 01', zone: 'V', capacity: 10 },
    { code: 'PROC-01', name: '検品エリア 01', zone: 'P', capacity: 100 },
  ];

  for (const loc of locations) {
    await prisma.location.upsert({
      where: { code: loc.code },
      update: {},
      create: loc,
    });
    console.log(`✅ ロケーションを作成: ${loc.name}`);
  }

  // 追加のユーザー作成（顧客）
  console.log('👥 顧客ユーザーを作成中...');
  const customers = [];
  for (let i = 1; i <= 10; i++) {
    const customer = await prisma.user.upsert({
      where: { email: `customer${i}@example.com` },
      update: {},
      create: {
        email: `customer${i}@example.com`,
        username: `顧客${i}`,
        password: await bcrypt.hash('customer123', 12),
        role: 'customer',
      },
    });
    customers.push(customer);
  }

  // 納品プランデータを作成
  console.log('📦 納品プランデータを作成中...');
  const deliveryStatuses = ['下書き', '発送待ち', '発送済み'];
  const deliveryPlans = [];
  
  for (let i = 0; i < 50; i++) {
    const status = deliveryStatuses[i % deliveryStatuses.length];
    const deliveryPlan = await prisma.deliveryPlan.create({
      data: {
        planNumber: `DP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${(i + 1).toString().padStart(3, '0')}`,
        sellerId: seller.id,
        sellerName: `セラー${(i % 3) + 1}`,
        status: status,
        deliveryAddress: `東京都渋谷区${i + 1}-${i + 2}-${i + 3} テストビル ${100 + i}号室`,
        contactEmail: `delivery${i + 1}@example.com`,
        phoneNumber: `090-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
        notes: status === '発送済み' ? `追跡番号: JP${Math.floor(Math.random() * 1000000000000).toString().padStart(13, '0')}` : 
               status === '下書き' ? '下書き保存中の納品プラン' : '発送準備中',
        totalItems: Math.floor(Math.random() * 5) + 1,
        totalValue: Math.floor(Math.random() * 500000) + 100000,
        shippedAt: status === '発送済み' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
    deliveryPlans.push(deliveryPlan);

    // 各納品プランに商品を関連付け
    const productCount = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < productCount; j++) {
      await prisma.deliveryPlanProduct.create({
        data: {
          deliveryPlanId: deliveryPlan.id,
          name: `テスト商品 ${i}-${j}`,
          category: ['カメラ', '腕時計', 'その他'][Math.floor(Math.random() * 3)],
          estimatedValue: Math.floor(Math.random() * 200000) + 50000,
          description: `商品説明 ${i}-${j}`,
        },
      });
    }
  }

  // 注文データを作成
  console.log('🛒 注文データを作成中...');
  const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  const orders = [];
  
  // 商品IDを取得
  const allProducts = await prisma.product.findMany();
  
  for (let i = 0; i < 100; i++) {
    const customer = customers[i % customers.length];
    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
    const itemCount = Math.floor(Math.random() * 3) + 1;
    
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-2024-${(i + 1).toString().padStart(4, '0')}`,
        customerId: customer.id,
        status: status,
        totalAmount: 0, // 後で更新
        shippingAddress: `${customer.username}様宅\n東京都${['新宿区', '渋谷区', '港区', '中央区'][i % 4]}${i + 1}-${i + 2}-${i + 3}`,
        paymentMethod: ['credit_card', 'bank_transfer', 'paypal'][i % 3],
        notes: status === 'shipped' ? `配送中: 追跡番号 ${Math.floor(Math.random() * 1000000000)}` : null,
        trackingNumber: status === 'shipped' || status === 'delivered' ? `TRK${Math.floor(Math.random() * 1000000)}` : null,
        carrier: status === 'shipped' || status === 'delivered' ? ['ヤマト運輸', '佐川急便', '日本郵便'][i % 3] : null,
        orderDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        shippedAt: status === 'shipped' || status === 'delivered' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
        deliveredAt: status === 'delivered' ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000) : null,
      },
    });
    orders.push(order);

    // 注文アイテムを作成
    let totalAmount = 0;
    for (let j = 0; j < itemCount; j++) {
      const randomProduct = allProducts[Math.floor(Math.random() * allProducts.length)];
      const quantity = Math.floor(Math.random() * 2) + 1;
      const price = randomProduct.price;
      
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: randomProduct.id,
          quantity: quantity,
          price: price,
        },
      });
      totalAmount += price * quantity;
    }

    // 注文の合計金額を更新
    await prisma.order.update({
      where: { id: order.id },
      data: { totalAmount },
    });
  }

  // 追加のロケーションデータを作成
  console.log('📍 ロケーションデータを拡充中...');
  const additionalLocations = [
    { code: 'STD-B-01', name: '標準棚 B-01', zone: 'B', capacity: 30 },
    { code: 'STD-B-02', name: '標準棚 B-02', zone: 'B', capacity: 30 },
    { code: 'HUM-02', name: '防湿庫 02', zone: 'H', capacity: 25 },
    { code: 'HUM-03', name: '防湿庫 03', zone: 'H', capacity: 20 },
    { code: 'VAULT-02', name: '金庫室 02', zone: 'V', capacity: 15 },
    { code: 'PROC-02', name: '検品エリア 02', zone: 'P', capacity: 50 },
    { code: 'SHIP-01', name: '出荷エリア 01', zone: 'S', capacity: 100 },
    { code: 'TEMP-01', name: '一時保管 01', zone: 'T', capacity: 200 },
  ];

  for (const loc of additionalLocations) {
    await prisma.location.upsert({
      where: { code: loc.code },
      update: {},
      create: loc,
    });
  }

  // アクティビティデータを作成
  console.log('📋 アクティビティデータを作成中...');
  const activities = [
    {
      type: 'order_created',
      description: '新規注文が作成されました',
      userId: customers[0].id,
      orderId: orders[0]?.id,
    },
    {
      type: 'product_shipped',
      description: '商品が出荷されました',
      userId: staff.id,
      productId: allProducts[0]?.id,
    },
    {
      type: 'delivery_plan_created',
      description: '納品プランが作成されました',
      userId: seller.id,
    },
  ];

  for (const activity of activities) {
    if (activity.orderId || activity.productId || (!activity.orderId && !activity.productId)) {
      await prisma.activity.create({
        data: activity,
      });
    }
  }

  console.log('🎉 シードデータの作成が完了しました！');
  console.log(`📦 商品: ${demoProducts.length}件 (カメラ、腕時計、その他の全カテゴリー・全ステータス)`);
  console.log('📸 各商品に2-5枚の画像を付与');
  console.log(`📍 ロケーション: ${5 + additionalLocations.length}件`);
  console.log(`📋 納品プラン: ${deliveryPlans.length}件`);
  console.log(`🛒 注文データ: ${orders.length}件`);
  console.log(`👥 顧客ユーザー: ${customers.length}件`);
  console.log('');
  console.log('📧 ログイン情報:');
  console.log('セラー: seller@example.com / password123');
  console.log('スタッフ: staff@example.com / password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ エラーが発生しました:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
