import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMasterData() {
  console.log('マスタデータのシードを開始します...');

  try {
    // カテゴリー
    console.log('カテゴリーをシード中...');
    const categories = [
      { key: 'camera_body', nameJa: 'カメラ本体', nameEn: 'Camera Body', sortOrder: 1 },
      { key: 'lens', nameJa: 'レンズ', nameEn: 'Lens', sortOrder: 2 },
      { key: 'watch', nameJa: '腕時計', nameEn: 'Watch', sortOrder: 3 },
      { key: 'accessory', nameJa: 'アクセサリ', nameEn: 'Accessory', sortOrder: 4 },
      { key: 'camera', nameJa: 'カメラ', nameEn: 'Camera', sortOrder: 5 },
      { key: 'electronics', nameJa: '電子機器', nameEn: 'Electronics', sortOrder: 6 },
      { key: 'fashion', nameJa: 'ファッション', nameEn: 'Fashion', sortOrder: 7 },
      { key: 'bags', nameJa: 'バッグ', nameEn: 'Bags', sortOrder: 8 },
      { key: 'jewelry', nameJa: 'ジュエリー', nameEn: 'Jewelry', sortOrder: 9 },
      { key: 'collectibles', nameJa: 'コレクション', nameEn: 'Collectibles', sortOrder: 10 },
    ];

    for (const category of categories) {
      await prisma.category.upsert({
        where: { key: category.key },
        update: category,
        create: category,
      });
    }

    // 商品ステータス
    console.log('商品ステータスをシード中...');
    const productStatuses = [
      { key: 'inbound', nameJa: '入庫待ち', nameEn: 'Inbound', sortOrder: 1 },
      { key: 'inspection', nameJa: '保管作業中', nameEn: 'Inspection', sortOrder: 2 },
      { key: 'storage', nameJa: '保管中', nameEn: 'Storage', sortOrder: 3 },
      { key: 'listing', nameJa: '出品中', nameEn: 'Listing', sortOrder: 4 },
      { key: 'ordered', nameJa: '出荷準備中', nameEn: 'Ordered', sortOrder: 5 },
      { key: 'shipping', nameJa: '出荷済み', nameEn: 'Shipping', sortOrder: 6 },
      { key: 'sold', nameJa: '購入者決定', nameEn: 'Sold', sortOrder: 7 },
      { key: 'returned', nameJa: '返品', nameEn: 'Returned', sortOrder: 8 },
      { key: 'on_hold', nameJa: '保留中', nameEn: 'On Hold', sortOrder: 9 },
    ];

    for (const status of productStatuses) {
      await prisma.productStatus.upsert({
        where: { key: status.key },
        update: status,
        create: status,
      });
    }

    // 商品状態
    console.log('商品状態をシード中...');
    const productConditions = [
      { key: 'unused', nameJa: 'Unused（新品）', nameEn: 'Unused', sortOrder: 1 },
      { key: 'top_mint', nameJa: 'Top Mint（ほぼ新品で箱や付属品付き）', nameEn: 'Top Mint', sortOrder: 2 },
      { key: 'mint', nameJa: 'Mint（ほぼ新品）', nameEn: 'Mint', sortOrder: 3 },
      { key: 'near_mint', nameJa: 'Near Mint（とてもきれいな外観、動作、光学系とも問題ないもの）', nameEn: 'Near Mint', sortOrder: 4 },
      { key: 'excellent', nameJa: 'Excellent（外観は概ねきれい、動作、光学系とも問題ないもの）', nameEn: 'Excellent', sortOrder: 5 },
      { key: 'very_good', nameJa: 'Very Good（使用はできるが、カビがひどい、強いクモリがあるなど）', nameEn: 'Very Good', sortOrder: 6 },
      { key: 'as_is', nameJa: 'As-Is（撮影はできるが、何らかの機能が不良）', nameEn: 'As-Is', sortOrder: 7 },
      { key: 'for_parts', nameJa: 'For Parts or For Repair（いわゆるジャンク品、パーツで使うもの）', nameEn: 'For Parts or For Repair', sortOrder: 8 },
      { key: 'clad', nameJa: 'CLAD\'d（整備済み）', nameEn: 'CLAD\'d', sortOrder: 9 },
      { key: 'other', nameJa: 'その他', nameEn: 'Other', sortOrder: 10 },
    ];

    for (const condition of productConditions) {
      await prisma.productCondition.upsert({
        where: { key: condition.key },
        update: condition,
        create: condition,
      });
    }

    // 配送業者
    console.log('配送業者をシード中...');
    const carriers = [
      {
        key: 'fedex',
        name: 'FedEx',
        nameJa: 'FedEx',
        defaultRate: 1200,
        trackingUrl: 'https://www.fedex.com/apps/fedextrack/',
        supportedServices: JSON.stringify(['standard', 'express', 'priority']),
        sortOrder: 1,
      },
      {
        key: 'dhl',
        name: 'DHL',
        nameJa: 'DHL',
        defaultRate: 1800,
        trackingUrl: 'https://www.dhl.com/jp-ja/home/tracking.html',
        supportedServices: JSON.stringify(['standard', 'express']),
        sortOrder: 2,
      },
      {
        key: 'ems',
        name: 'EMS',
        nameJa: 'EMS',
        defaultRate: 1500,
        trackingUrl: 'https://trackings.post.japanpost.jp/services/srv/search/',
        supportedServices: JSON.stringify(['standard', 'express']),
        sortOrder: 3,
      },
      {
        key: 'others',
        name: 'Others',
        nameJa: 'その他（eBay SpeedPAK、クロネコヤマトなど）',
        defaultRate: 1000,
        trackingUrl: '',
        supportedServices: JSON.stringify(['standard']),
        sortOrder: 4,
      },
    ];

    for (const carrier of carriers) {
      await prisma.carrier.upsert({
        where: { key: carrier.key },
        update: carrier,
        create: carrier,
      });
    }

    // ワークフローステップ
    console.log('ワークフローステップをシード中...');
    
    // 出荷ワークフロー
    const shippingSteps = [
      { workflowType: 'shipping', key: 'storage', nameJa: '保管中', nameEn: 'Storage', order: 1 },
      { workflowType: 'shipping', key: 'workstation', nameJa: '梱包作業中', nameEn: 'Workstation', order: 2 },
      { workflowType: 'shipping', key: 'packed', nameJa: '梱包完了', nameEn: 'Packed', order: 3 },
      { workflowType: 'shipping', key: 'ready_for_pickup', nameJa: '集荷準備完了', nameEn: 'Ready for Pickup', order: 4 },
    ];

    // 検品ワークフロー
    const inspectionSteps = [
      { workflowType: 'inspection', key: 'pending_inspection', nameJa: '入庫待ち', nameEn: 'Pending Inspection', order: 1 },
      { workflowType: 'inspection', key: 'inspecting', nameJa: '検品中', nameEn: 'Inspecting', order: 2 },
      { workflowType: 'inspection', key: 'photography', nameJa: '撮影', nameEn: 'Photography', order: 3 },
      { workflowType: 'inspection', key: 'completed', nameJa: '完了', nameEn: 'Completed', order: 4 },
    ];

    const allWorkflowSteps = [...shippingSteps, ...inspectionSteps];

    for (const step of allWorkflowSteps) {
      await prisma.workflowStep.upsert({
        where: { 
          workflowType_key: {
            workflowType: step.workflowType,
            key: step.key
          }
        },
        update: step,
        create: step,
      });
    }

    // システム設定
    console.log('システム設定をシード中...');
    const systemSettings = [
      {
        key: 'default_currency',
        value: 'JPY',
        description: 'デフォルト通貨',
        type: 'string',
      },
      {
        key: 'default_location_zones',
        value: JSON.stringify(['A区画', 'H区画', 'V区画', 'メンテナンス室']),
        description: '保管場所ゾーン一覧',
        type: 'json',
      },
      {
        key: 'fedex_services',
        value: JSON.stringify([
          { key: 'ground', name: 'FedEx Ground', priceRange: '¥1,200-1,800' },
          { key: '2day', name: 'FedEx 2Day', priceRange: '¥2,400-3,200' },
          { key: 'express_saver', name: 'FedEx Express Saver', priceRange: '¥3,600-4,800' },
          { key: 'standard_overnight', name: 'FedEx Standard Overnight', priceRange: '¥4,800-6,400' },
          { key: 'priority_overnight', name: 'FedEx Priority Overnight', priceRange: '¥6,400-8,000' },
          { key: 'first_overnight', name: 'FedEx First Overnight', priceRange: '¥8,000-10,000' },
        ]),
        description: 'FedExサービスオプション',
        type: 'json',
      },
      {
        key: 'analytics_periods',
        value: JSON.stringify([
          { key: 'today', nameJa: '今日', nameEn: 'Today' },
          { key: 'yesterday', nameJa: '昨日', nameEn: 'Yesterday' },
          { key: 'this_week', nameJa: '今週', nameEn: 'This Week' },
          { key: 'last_week', nameJa: '先週', nameEn: 'Last Week' },
          { key: 'this_month', nameJa: '今月', nameEn: 'This Month' },
          { key: 'last_month', nameJa: '先月', nameEn: 'Last Month' },
          { key: 'this_quarter', nameJa: '今四半期', nameEn: 'This Quarter' },
          { key: 'last_7_days', nameJa: '過去7日間', nameEn: 'Last 7 Days' },
          { key: 'last_30_days', nameJa: '過去30日間', nameEn: 'Last 30 Days' },
        ]),
        description: '分析期間オプション',
        type: 'json',
      },
      {
        key: 'inspection_checklist_appearance',
        value: JSON.stringify([
          { key: 'hasScratches', nameJa: '傷あり', nameEn: 'Has Scratches' },
          { key: 'hasDents', nameJa: 'へこみあり', nameEn: 'Has Dents' },
          { key: 'hasDiscoloration', nameJa: '変色あり', nameEn: 'Has Discoloration' },
          { key: 'hasDust', nameJa: 'ほこりあり', nameEn: 'Has Dust' },
        ]),
        description: '検品チェックリスト：外観項目',
        type: 'json',
      },
      {
        key: 'inspection_checklist_function',
        value: JSON.stringify([
          { key: 'powerOn', nameJa: '電源ON', nameEn: 'Power On' },
          { key: 'allButtonsWork', nameJa: '全ボタン動作', nameEn: 'All Buttons Work' },
          { key: 'screenDisplay', nameJa: '画面表示', nameEn: 'Screen Display' },
          { key: 'connectivity', nameJa: '接続性', nameEn: 'Connectivity' },
        ]),
        description: '検品チェックリスト：機能項目',
        type: 'json',
      },
      {
        key: 'inspection_checklist_optics',
        value: JSON.stringify([
          { key: 'lensClarity', nameJa: 'レンズ透明度', nameEn: 'Lens Clarity' },
          { key: 'aperture', nameJa: '絞り', nameEn: 'Aperture' },
          { key: 'focusAccuracy', nameJa: 'フォーカス精度', nameEn: 'Focus Accuracy' },
          { key: 'stabilization', nameJa: '手ぶれ補正', nameEn: 'Stabilization' },
        ]),
        description: '検品チェックリスト：光学項目（カメラ用）',
        type: 'json',
      },
      {
        key: 'order_statuses',
        value: JSON.stringify([
          { key: 'pending', nameJa: '保留中', nameEn: 'Pending' },
          { key: 'confirmed', nameJa: '確認済み', nameEn: 'Confirmed' },
          { key: 'processing', nameJa: '処理中', nameEn: 'Processing' },
          { key: 'shipped', nameJa: '出荷済み', nameEn: 'Shipped' },
          { key: 'delivered', nameJa: '配達完了', nameEn: 'Delivered' },
          { key: 'cancelled', nameJa: 'キャンセル', nameEn: 'Cancelled' },
          { key: 'returned', nameJa: '返品', nameEn: 'Returned' },
        ]),
        description: '注文ステータス一覧',
        type: 'json',
      },
    ];

    for (const setting of systemSettings) {
      await prisma.systemSetting.upsert({
        where: { key: setting.key },
        update: setting,
        create: setting,
      });
    }

    console.log('マスタデータのシードが完了しました！');

  } catch (error) {
    console.error('マスタデータのシード中にエラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 直接実行される場合
if (require.main === module) {
  seedMasterData()
    .then(() => {
      console.log('シード処理が正常に完了しました');
      process.exit(0);
    })
    .catch((error) => {
      console.error('シード処理でエラーが発生しました:', error);
      process.exit(1);
    });
}

export { seedMasterData };