import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 包括的なシードデータを作成中...');

  // パスワードをハッシュ化
  const hashedPassword = await bcrypt.hash('password123', 12);

  // ユーザーデータを作成
  console.log('👥 ユーザーデータを作成中...');
  
  const seller = await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      email: 'seller@example.com',
      username: 'テストセラー',
      password: hashedPassword,
      role: 'seller',
      fullName: '田中 太郎',
      phoneNumber: '090-1234-5678',
      address: '東京都渋谷区1-1-1'
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@example.com' },
    update: {},
    create: {
      email: 'staff@example.com',
      username: 'テストスタッフ',
      password: hashedPassword,
      role: 'staff',
      fullName: '佐藤 花子',
      phoneNumber: '090-2345-6789',
      address: '東京都港区2-2-2'
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: '管理者',
      password: hashedPassword,
      role: 'admin',
      fullName: '鈴木 一郎',
      phoneNumber: '090-3456-7890',
      address: '東京都新宿区3-3-3'
    },
  });

  // 顧客ユーザーを作成
  const customers = [];
  const customerNames = [
    '高橋 美子', '山田 次郎', '渡辺 恵子', '伊藤 健太',
    '小林 由美', '加藤 大輔', '吉田 真理', '田村 智子'
  ];

  for (let i = 0; i < customerNames.length; i++) {
    const customer = await prisma.user.upsert({
      where: { email: `customer${i + 1}@example.com` },
      update: {},
      create: {
        email: `customer${i + 1}@example.com`,
        username: `顧客${i + 1}`,
        password: hashedPassword,
        role: 'customer',
        fullName: customerNames[i],
        phoneNumber: `090-${String(4000 + i).padStart(4, '0')}-${String(1000 + i).padStart(4, '0')}`,
        address: `東京都品川区${i + 1}-${i + 1}-${i + 1}`
      }
    });
    customers.push(customer);
  }

  console.log(`✅ ユーザーデータを作成しました: ${3 + customers.length}件`);

  // ロケーションデータを作成
  console.log('📍 ロケーションデータを作成中...');
  
  const locationData = [
    { code: 'A-01', name: 'A棚1段目', zone: 'A', capacity: 50 },
    { code: 'A-02', name: 'A棚2段目', zone: 'A', capacity: 50 },
    { code: 'A-03', name: 'A棚3段目', zone: 'A', capacity: 50 },
    { code: 'B-01', name: 'B棚1段目', zone: 'B', capacity: 30 },
    { code: 'B-02', name: 'B棚2段目', zone: 'B', capacity: 30 },
    { code: 'C-01', name: 'C棚1段目（高価値商品）', zone: 'C', capacity: 20 },
    { code: 'INBOUND', name: '入庫エリア', zone: 'INBOUND', capacity: 100 },
    { code: 'INSPECTION', name: '検品エリア', zone: 'INSPECTION', capacity: 50 },
    { code: 'SHIPPING', name: '出荷エリア', zone: 'SHIPPING', capacity: 80 }
  ];

  const locations = [];
  for (const loc of locationData) {
    const location = await prisma.location.upsert({
      where: { code: loc.code },
      update: {},
      create: loc
    });
    locations.push(location);
  }

  console.log(`✅ ロケーションデータを作成しました: ${locations.length}件`);

  // 商品データを作成
  console.log('📦 商品データを作成中...');
  
  const cameraProducts = [
    { name: 'Sony α7 IV', category: 'camera', price: 280000, condition: 'excellent' },
    { name: 'Sony α7R V', category: 'camera', price: 480000, condition: 'very_good' },
    { name: 'Canon EOS R6 Mark II', category: 'camera', price: 320000, condition: 'good' },
    { name: 'Canon EOS R5', category: 'camera', price: 450000, condition: 'excellent' },
    { name: 'Nikon Z9', category: 'camera', price: 650000, condition: 'excellent' },
    { name: 'Nikon Z6 II', category: 'camera', price: 220000, condition: 'good' },
    { name: 'Fujifilm X-T5', category: 'camera', price: 240000, condition: 'very_good' },
    { name: 'Fujifilm X-H2S', category: 'camera', price: 280000, condition: 'excellent' },
    { name: 'Sony FX3', category: 'camera', price: 420000, condition: 'very_good' },
    { name: 'Panasonic GH6', category: 'camera', price: 230000, condition: 'good' },
    { name: 'Canon RF 24-70mm F2.8L', category: 'camera', price: 280000, condition: 'excellent' },
    { name: 'Sony FE 85mm F1.4 GM', category: 'camera', price: 180000, condition: 'very_good' },
    { name: 'Sigma 24-70mm F2.8 DG DN Art', category: 'camera', price: 140000, condition: 'good' },
    { name: 'Tamron 28-75mm F2.8 Di III VXD G2', category: 'camera', price: 95000, condition: 'excellent' },
    { name: 'Sony FE 70-200mm F2.8 GM OSS II', category: 'camera', price: 320000, condition: 'very_good' }
  ];

  const watchProducts = [
    { name: 'Rolex Submariner', category: 'watch', price: 1200000, condition: 'excellent' },
    { name: 'Omega Speedmaster Professional', category: 'watch', price: 680000, condition: 'very_good' },
    { name: 'TAG Heuer Carrera', category: 'watch', price: 350000, condition: 'good' },
    { name: 'Seiko Prospex', category: 'watch', price: 45000, condition: 'excellent' },
    { name: 'Citizen Eco-Drive', category: 'watch', price: 35000, condition: 'very_good' },
    { name: 'Casio G-Shock', category: 'watch', price: 25000, condition: 'good' },
    { name: 'Tudor Black Bay', category: 'watch', price: 420000, condition: 'excellent' },
    { name: 'Longines Master Collection', category: 'watch', price: 280000, condition: 'very_good' },
    { name: 'Tissot PRC 200', category: 'watch', price: 65000, condition: 'good' },
    { name: 'Hamilton Khaki Field', category: 'watch', price: 85000, condition: 'excellent' },
    { name: 'Breitling Navitimer', category: 'watch', price: 650000, condition: 'very_good' },
    { name: 'IWC Portugieser', category: 'watch', price: 850000, condition: 'excellent' },
    { name: 'Jaeger-LeCoultre Reverso', category: 'watch', price: 750000, condition: 'good' },
    { name: 'Panerai Luminor', category: 'watch', price: 580000, condition: 'very_good' },
    { name: 'Zenith El Primero', category: 'watch', price: 720000, condition: 'excellent' }
  ];

  const allProducts = [...cameraProducts, ...watchProducts];
  const statuses = ['inbound', 'inspection', 'storage', 'listing', 'sold'];
  const products = [];
  const productMap = new Map();

  for (let i = 0; i < allProducts.length; i++) {
    const productData = allProducts[i];
    const sku = `${productData.category.toUpperCase()}-${String(i + 1).padStart(3, '0')}`;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];

    const product = await prisma.product.upsert({
      where: { sku: sku },
      update: {},
      create: {
        name: productData.name,
        sku: sku,
        category: productData.category,
        status: status,
        price: productData.price,
        condition: productData.condition,
        description: `${productData.name}の詳細説明。状態: ${productData.condition}`,
        sellerId: seller.id,
        currentLocationId: randomLocation.id,
        inspectedAt: Math.random() > 0.5 ? new Date() : null,
        inspectedBy: Math.random() > 0.5 ? staff.id : null,
        inspectionNotes: Math.random() > 0.5 ? '検品完了。良好な状態です。' : null
      }
    });
    
    products.push(product);
    productMap.set(sku, product.id);
  }

  console.log(`✅ 商品データを作成しました: ${products.length}件`);

  // 注文データを作成
  console.log('🛒 注文データを作成中...');
  
  const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
  const orders = [];

  for (let i = 0; i < 8; i++) {
    const customer = customers[i % customers.length];
    const orderNumber = `ORD-2024-COMP-${String(i + 1).padStart(4, '0')}`;
    const status = orderStatuses[i % orderStatuses.length];
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));

    const order = await prisma.order.create({
      data: {
        orderNumber: orderNumber,
        customerId: customer.id,
        status: status,
        totalAmount: 0, // 後で更新
        shippingAddress: customer.address,
        paymentMethod: ['credit_card', 'bank_transfer', 'paypal'][Math.floor(Math.random() * 3)],
        orderDate: orderDate,
        shippedAt: status === 'shipped' || status === 'delivered' ? orderDate : null,
        deliveredAt: status === 'delivered' ? new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000) : null
      }
    });

    // 注文アイテムを作成
    const numItems = Math.floor(Math.random() * 3) + 1;
    let totalAmount = 0;

    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity: 1,
          price: product.price
        }
      });
      totalAmount += product.price;
    }

    // 注文の合計金額を更新
    await prisma.order.update({
      where: { id: order.id },
      data: { totalAmount }
    });

    orders.push(order);
  }

  console.log(`✅ 注文データを作成しました: ${orders.length}件`);

  // アクティビティデータを作成
  console.log('📋 アクティビティデータを作成中...');
  
  const activityTypes = ['product_created', 'product_inspected', 'product_moved', 'order_created', 'order_shipped'];
  const activities = [];

  for (let i = 0; i < 12; i++) {
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const order = orders[Math.floor(Math.random() * orders.length)];
    const user = [seller, staff, admin][Math.floor(Math.random() * 3)];

    const activity = await prisma.activity.create({
      data: {
        type: type,
        description: `${type} - ${product.name}に関するアクティビティ`,
        userId: user.id,
        productId: Math.random() > 0.5 ? product.id : null,
        orderId: Math.random() > 0.5 ? order.id : null
      }
    });
    activities.push(activity);
  }

  console.log(`✅ アクティビティデータを作成しました: ${activities.length}件`);

  // 納品プランデータを作成
  console.log('📝 納品プランデータを作成中...');
  
  const planStatuses = ['draft', 'submitted', 'approved', 'in_transit', 'delivered', 'completed'];
  const deliveryPlans = [];

  for (let i = 0; i < 100; i++) {
    const planNumber = `DP-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`;
    const status = planStatuses[Math.floor(Math.random() * planStatuses.length)];
    const productCount = Math.floor(Math.random() * 5) + 1;

    const deliveryPlan = await prisma.deliveryPlan.create({
      data: {
        planNumber: planNumber,
        sellerId: seller.id,
        sellerName: seller.fullName || seller.username,
        status: status,
        deliveryAddress: `東京都中央区${i + 1}-${i + 1}-${i + 1}`,
        contactEmail: seller.email,
        phoneNumber: seller.phoneNumber,
        notes: `納品プラン ${i + 1} の備考`,
        totalItems: productCount,
        totalValue: 0 // 後で更新
      }
    });

    let totalValue = 0;
    for (let j = 0; j < productCount; j++) {
      const category = Math.random() > 0.5 ? 'camera' : 'watch';
      const estimatedValue = Math.floor(Math.random() * 500000) + 50000;
      
      await prisma.deliveryPlanProduct.create({
        data: {
          deliveryPlanId: deliveryPlan.id,
          name: `${category === 'camera' ? 'カメラ' : '腕時計'} ${j + 1}`,
          category: category,
          estimatedValue: estimatedValue,
          description: `${category}の商品。推定価格: ¥${estimatedValue.toLocaleString()}`
        }
      });

      totalValue += estimatedValue;
    }

    await prisma.deliveryPlan.update({
      where: { id: deliveryPlan.id },
      data: { totalValue }
    });

    deliveryPlans.push(deliveryPlan);
  }

  console.log(`✅ 納品プランデータを作成しました: ${deliveryPlans.length}件`);

  // ピッキングタスクデータを作成
  console.log('🎯 ピッキングタスクデータを作成中...');
  
  const priorities = ['urgent', 'high', 'normal', 'low'];
  const taskStatuses = ['pending', 'in_progress', 'completed'];
  const pickingTasks = [];

  for (let i = 0; i < 50; i++) {
    const order = orders[i % orders.length];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const status = taskStatuses[Math.floor(Math.random() * taskStatuses.length)];
    const totalItems = Math.floor(Math.random() * 5) + 1;
    const pickedItems = status === 'completed' ? totalItems : Math.floor(Math.random() * totalItems);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 7) + 1);

    const pickingTask = await prisma.pickingTask.create({
      data: {
        orderId: `COMP-${order.orderNumber}-${i}`,
        customerName: customers[i % customers.length].fullName || customers[i % customers.length].username,
        priority: priority,
        status: status,
        assignee: Math.random() > 0.5 ? staff.username : null,
        shippingMethod: ['standard', 'express', 'overnight'][Math.floor(Math.random() * 3)],
        totalItems: totalItems,
        pickedItems: pickedItems,
        dueDate: dueDate
      }
    });

    // ピッキングアイテムを作成
    for (let j = 0; j < totalItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      
      await prisma.pickingItem.create({
        data: {
          pickingTaskId: pickingTask.id,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          location: location.code,
          quantity: 1,
          pickedQuantity: j < pickedItems ? 1 : 0,
          status: j < pickedItems ? 'picked' : 'pending'
        }
      });
    }

    pickingTasks.push(pickingTask);
  }

  console.log(`✅ ピッキングタスクデータを作成しました: ${pickingTasks.length}件`);

  // 検品チェックリストデータを作成
  console.log('🔍 検品チェックリストデータを作成中...');
  
  const inspectionProducts = products.slice(0, 7);
  const inspectionChecklists = [];

  for (const product of inspectionProducts) {
    const checklist = await prisma.inspectionChecklist.create({
      data: {
        productId: product.id,
        hasScratches: Math.random() > 0.7,
        hasDents: Math.random() > 0.8,
        hasDiscoloration: Math.random() > 0.9,
        hasDust: Math.random() > 0.6,
        powerOn: Math.random() > 0.1,
        allButtonsWork: Math.random() > 0.2,
        screenDisplay: Math.random() > 0.15,
        connectivity: Math.random() > 0.25,
        lensClarity: product.category === 'camera' ? Math.random() > 0.2 : true,
        aperture: product.category === 'camera' ? Math.random() > 0.3 : true,
        focusAccuracy: product.category === 'camera' ? Math.random() > 0.25 : true,
        stabilization: product.category === 'camera' ? Math.random() > 0.4 : true,
        createdBy: staff.id,
        notes: `${product.category === 'camera' ? 'カメラ' : '腕時計'}の詳細検品を実施。全体的に良好な状態です。`
      }
    });
    inspectionChecklists.push(checklist);
  }

  console.log(`✅ 検品チェックリストデータを作成しました: ${inspectionChecklists.length}件`);

  // 出品テンプレートデータを作成
  console.log('📝 出品テンプレートデータを作成中...');
  
  const listingTemplates = [];
  const templateData = [
    {
      name: 'カメラ標準テンプレート',
      category: 'camera',
      platform: 'ebay',
      basePrice: 200000,
      condition: 'used',
      shippingMethod: 'standard',
      fields: JSON.stringify({
        title: '{brand} {model} - {condition}',
        description: 'Professional camera in {condition} condition. All functions tested.',
        keywords: ['camera', 'photography', 'professional']
      })
    },
    {
      name: '腕時計標準テンプレート',
      category: 'watch',
      platform: 'ebay',
      basePrice: 150000,
      condition: 'used',
      shippingMethod: 'express',
      fields: JSON.stringify({
        title: '{brand} {model} Watch - {condition}',
        description: 'Luxury watch in {condition} condition. Comes with original box.',
        keywords: ['watch', 'luxury', 'timepiece']
      })
    },
    {
      name: 'Amazon標準テンプレート',
      category: 'camera',
      platform: 'amazon',
      basePrice: 180000,
      condition: 'used',
      shippingMethod: 'amazon_fba',
      fields: JSON.stringify({
        title: '{brand} {model}',
        description: 'High-quality {category} in excellent working condition.',
        keywords: ['camera', 'electronics', 'photography']
      })
    }
  ];

  for (const template of templateData) {
    const listingTemplate = await prisma.listingTemplate.create({
      data: template
    });
    listingTemplates.push(listingTemplate);
  }

  console.log(`✅ 出品テンプレートデータを作成しました: ${listingTemplates.length}件`);

  // 出品データを作成
  console.log('📋 出品データを作成中...');
  
  const listingStatuses = ['draft', 'active', 'sold', 'ended'];
  const platforms = ['ebay', 'amazon', 'mercari', 'yahoo'];
  const listings = [];

  for (let i = 0; i < 10; i++) {
    const product = products[i];
    const template = listingTemplates[Math.floor(Math.random() * listingTemplates.length)];
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const status = listingStatuses[Math.floor(Math.random() * listingStatuses.length)];

    const listing = await prisma.listing.create({
      data: {
        productId: product.id,
        templateId: template.id,
        platform: platform,
        listingId: `${platform.toUpperCase()}-${Date.now()}-${i}`,
        title: `${product.name} - ${product.condition}`,
        description: `${product.name}の出品。状態: ${product.condition}`,
        price: Math.floor(product.price * (0.8 + Math.random() * 0.4)),
        status: status,
        listedAt: status !== 'draft' ? new Date() : null,
        soldAt: status === 'sold' ? new Date() : null
      }
    });
    listings.push(listing);
  }

  console.log(`✅ 出品データを作成しました: ${listings.length}件`);

  // 配送データを作成
  console.log('🚚 配送データを作成中...');
  
  const carriers = ['fedex', 'yamato', 'sagawa', 'japan-post'];
  const methods = ['standard', 'express', 'overnight'];
  const shipmentStatuses = ['pending', 'picked', 'packed', 'shipped', 'delivered'];
  const shipments = [];

  for (let i = 0; i < 8; i++) {
    const order = orders[i];
    const customer = customers[i % customers.length];
    const carrier = carriers[Math.floor(Math.random() * carriers.length)];
    const method = methods[Math.floor(Math.random() * methods.length)];
    const status = shipmentStatuses[Math.floor(Math.random() * shipmentStatuses.length)];

    const shipment = await prisma.shipment.create({
      data: {
        orderId: order.id,
        productId: products[i % products.length].id,
        trackingNumber: status !== 'pending' ? `TRK${Date.now()}${i}` : null,
        carrier: carrier,
        method: method,
        status: status,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        customerName: customer.fullName || customer.username,
        address: customer.address || '住所未設定',
        deadline: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        value: order.totalAmount,
        notes: `配送メモ ${i + 1}`,
        pickedAt: status !== 'pending' ? new Date() : null,
        packedAt: ['packed', 'shipped', 'delivered'].includes(status) ? new Date() : null,
        shippedAt: ['shipped', 'delivered'].includes(status) ? new Date() : null,
        deliveredAt: status === 'delivered' ? new Date() : null
      }
    });
    shipments.push(shipment);
  }

  console.log(`✅ 配送データを作成しました: ${shipments.length}件`);

  // タスクデータを作成
  console.log('📋 タスクデータを作成中...');
  
  const taskCategories = ['inspection', 'photography', 'listing', 'shipping'];
  const tasks = [];

  for (let i = 0; i < 50; i++) {
    const category = taskCategories[Math.floor(Math.random() * taskCategories.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const status = taskStatuses[Math.floor(Math.random() * taskStatuses.length)];
    const assignedTo = Math.random() > 0.3 ? staff.username : null;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 14));

    const task = await prisma.task.create({
      data: {
        title: `${category}タスク ${i + 1}`,
        description: `${category}に関するタスクです。優先度: ${priority}`,
        category: category,
        priority: priority,
        status: status,
        assignedTo: assignedTo,
        estimatedTime: `${Math.floor(Math.random() * 4) + 1}時間`,
        dueDate: dueDate,
        completedAt: status === 'completed' ? new Date() : null,
        notes: Math.random() > 0.5 ? `タスク ${i + 1} の備考` : null,
        metadata: JSON.stringify({
          productId: products[i % products.length].id,
          location: locations[Math.floor(Math.random() * locations.length)].code
        })
      }
    });
    tasks.push(task);
  }

  console.log(`✅ タスクデータを作成しました: ${tasks.length}件`);

  // KPIメトリクスデータを作成
  console.log('📊 KPIメトリクスデータを作成中...');
  
  const metricNames = [
    'daily_revenue', 'daily_orders', 'daily_inspections', 'daily_shipments',
    'weekly_conversion_rate', 'weekly_return_rate', 'weekly_customer_satisfaction',
    'monthly_inventory_turnover', 'monthly_profit_margin', 'monthly_new_customers'
  ];
  
  const categories = ['sales', 'operations', 'quality', 'customer'];
  const periods = ['daily', 'weekly', 'monthly'];
  const kpiMetrics = [];

  // 過去365日分のデータを作成
  for (let day = 0; day < 365; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);

    for (const metricName of metricNames) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const period = periods[Math.floor(Math.random() * periods.length)];
      const baseValue = Math.random() * 1000000;
      const value = metricName.includes('rate') ? Math.random() * 100 : baseValue;

      const metric = await prisma.kPIMetric.create({
        data: {
          name: metricName,
          category: category,
          value: value,
          unit: metricName.includes('rate') ? '%' : metricName.includes('revenue') ? 'JPY' : 'count',
          period: period,
          date: date,
          metadata: JSON.stringify({
            source: 'system',
            calculated: true,
            dayOfWeek: date.getDay()
          })
        }
      });
      
      if (day === 0) kpiMetrics.push(metric); // 最新日のみ配列に追加
    }
  }

  console.log(`✅ KPIメトリクスデータを作成しました: ${365 * metricNames.length}件`);

  // 返品データを作成
  console.log('↩️ 返品データを作成中...');
  
  const returnReasons = ['defective', 'not_as_described', 'changed_mind', 'damaged_in_shipping'];
  const returnConditions = ['unopened', 'used', 'damaged'];
  const returnStatuses = ['pending', 'approved', 'rejected', 'completed'];
  const returns = [];

  for (let i = 0; i < 3; i++) {
    const order = orders[i];
    const product = products[i];
    const customer = customers[i % customers.length];
    const reason = returnReasons[Math.floor(Math.random() * returnReasons.length)];
    const condition = returnConditions[Math.floor(Math.random() * returnConditions.length)];
    const status = returnStatuses[Math.floor(Math.random() * returnStatuses.length)];

    const returnItem = await prisma.return.create({
      data: {
        orderId: `COMP-${order.orderNumber}`,
        productId: product.id,
        reason: reason,
        condition: condition,
        customerNote: `返品理由: ${reason}。状態: ${condition}`,
        staffNote: status !== 'pending' ? `返品処理済み。状態確認完了。` : null,
        refundAmount: Math.floor(product.price * 0.9),
        status: status,
        processedBy: status !== 'pending' ? staff.username : null,
        processedAt: status !== 'pending' ? new Date() : null
      }
    });
    returns.push(returnItem);
  }

  console.log(`✅ 返品データを作成しました: ${returns.length}件`);

  // 倉庫データを作成
  console.log('🏢 倉庫データを作成中...');
  
  const warehouses = [];
  const warehouseData = [
    {
      name: '東京メイン倉庫',
      address: '東京都江東区1-1-1',
      contactPerson: '倉庫管理者',
      phoneNumber: '03-1234-5678'
    },
    {
      name: '大阪サブ倉庫',
      address: '大阪府大阪市2-2-2',
      contactPerson: '関西管理者',
      phoneNumber: '06-1234-5678'
    }
  ];

  for (const data of warehouseData) {
    const warehouse = await prisma.warehouse.create({
      data: data
    });
    warehouses.push(warehouse);
  }

  console.log(`✅ 倉庫データを作成しました: ${warehouses.length}件`);

  // 統計情報を表示
  console.log('\n🎉 包括的なシードデータ作成完了！');
  console.log('=====================================');
  console.log(`👥 ユーザー: ${3 + customers.length}件 (セラー1, スタッフ1, 管理者1, 顧客${customers.length})`);
  console.log(`📦 商品: ${products.length}件 (カメラ${cameraProducts.length}, 腕時計${watchProducts.length})`);
  console.log(`📍 ロケーション: ${locations.length}件`);
  console.log(`🛒 注文: ${orders.length}件 (様々なステータス)`);
  console.log(`📋 アクティビティ: ${activities.length}件`);
  console.log(`📝 納品プラン: ${deliveryPlans.length}件 (全ステータス含む)`);
  console.log(`🎯 ピッキングタスク: ${pickingTasks.length}件`);
  console.log(`🔍 検品チェックリスト: ${inspectionChecklists.length}件`);
  console.log(`📝 出品テンプレート: ${listingTemplates.length}件`);
  console.log(`📋 出品: ${listings.length}件`);
  console.log(`🚚 配送: ${shipments.length}件`);
  console.log(`📋 タスク: ${tasks.length}件`);
  console.log(`📊 KPIメトリクス: ${365 * metricNames.length}件 (365日分)`);
  console.log(`↩️ 返品: ${returns.length}件`);
  console.log(`🏢 倉庫: ${warehouses.length}件`);
  console.log('=====================================');
}

main()
  .then(async () => {
    console.log('✅ シードデータの作成が正常に完了しました');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ エラーが発生しました:', e);
    await prisma.$disconnect();
    process.exit(1);
  });