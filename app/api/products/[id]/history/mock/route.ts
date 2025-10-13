import { NextRequest, NextResponse } from 'next/server';

/**
 * 商品履歴API - モックデータ版
 * パフォーマンス比較用の実装
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  try {
    const productId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // モックデータ生成（固定データ）
    const mockHistoryData = generateMockHistory(productId, page, limit);

    // レスポンス生成
    const endTime = Date.now();
    const processingTime = endTime - startTime;

    const response = {
      product: {
        id: productId,
        name: 'サンプル商品',
        sku: 'MOCK-001'
      },
      history: mockHistoryData.items,
      pagination: {
        page,
        limit,
        total: mockHistoryData.total,
        totalPages: Math.ceil(mockHistoryData.total / limit),
        hasMore: page * limit < mockHistoryData.total
      },
      performance: {
        processingTime,
        itemCount: mockHistoryData.items.length,
        queryCount: 0, // モックなのでクエリなし
        cacheHit: true
      }
    };

    // パフォーマンスヘッダーを追加
    const headers = new Headers();
    headers.set('X-Processing-Time', processingTime.toString());
    headers.set('X-Item-Count', mockHistoryData.items.length.toString());
    headers.set('X-Query-Count', '0');
    headers.set('X-Data-Type', 'mock');

    return NextResponse.json(response, { headers });

  } catch (error) {
    console.error('モック履歴取得エラー:', error);
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    return NextResponse.json(
      { 
        error: 'モック履歴データの取得に失敗しました',
        performance: { processingTime, error: true }
      },
      { status: 500 }
    );
  }
}

function generateMockHistory(productId: string, page: number, limit: number) {
  // 固定のモックデータ（実際のデータ構造をシミュレート）
  const baseHistoryItems = [
    {
      id: 'mock-1',
      type: 'activity',
      action: '商品登録',
      description: '商品がシステムに登録されました',
      user: 'システム',
      timestamp: '2024-01-15T10:00:00.000Z',
      metadata: { activityType: 'product_created' }
    },
    {
      id: 'mock-2',
      type: 'activity',
      action: '検品開始',
      description: '検品プロセスが開始されました',
      user: '田中太郎',
      timestamp: '2024-01-15T11:30:00.000Z',
      metadata: { activityType: 'inspection_started' }
    },
    {
      id: 'mock-3',
      type: 'activity',
      action: '検品完了',
      description: '検品が完了しました - 良好な状態',
      user: '田中太郎',
      timestamp: '2024-01-15T12:45:00.000Z',
      metadata: { activityType: 'inspection_completed' }
    },
    {
      id: 'mock-4',
      type: 'inventory_movement',
      action: '在庫移動',
      description: '受入エリア → 保管エリアA',
      user: '佐藤花子',
      timestamp: '2024-01-15T13:15:00.000Z',
      metadata: { 
        fromLocationCode: 'RECV-01',
        toLocationCode: 'STORE-A01',
        notes: '検品完了後の移動'
      }
    },
    {
      id: 'mock-5',
      type: 'activity',
      action: '撮影完了',
      description: '商品撮影が完了しました',
      user: '鈴木一郎',
      timestamp: '2024-01-16T09:20:00.000Z',
      metadata: { activityType: 'photography_completed' }
    },
    {
      id: 'mock-6',
      type: 'listing',
      action: '出品',
      description: 'eBay: 高品質カメラレンズ',
      user: 'システム',
      timestamp: '2024-01-16T14:30:00.000Z',
      metadata: {
        platform: 'eBay',
        price: 50000,
        status: 'active'
      }
    },
    {
      id: 'mock-7',
      type: 'order',
      action: '注文',
      description: '注文番号: ORD-2024-001 (確認済み)',
      user: '顧客A',
      timestamp: '2024-01-20T16:45:00.000Z',
      metadata: {
        orderNumber: 'ORD-2024-001',
        quantity: 1,
        price: 50000,
        status: 'confirmed'
      }
    },
    {
      id: 'mock-8',
      type: 'activity',
      action: '入金確認',
      description: '支払いが確認されました',
      user: 'システム',
      timestamp: '2024-01-20T17:00:00.000Z',
      metadata: { activityType: 'payment_received' }
    },
    {
      id: 'mock-9',
      type: 'inventory_movement',
      action: '在庫移動',
      description: '保管エリアA → 出荷エリア',
      user: '山田三郎',
      timestamp: '2024-01-21T10:15:00.000Z',
      metadata: {
        fromLocationCode: 'STORE-A01',
        toLocationCode: 'SHIP-01',
        notes: '出荷準備のための移動'
      }
    },
    {
      id: 'mock-10',
      type: 'shipment',
      action: '配送',
      description: 'ヤマト運輸 - 出荷完了',
      user: 'システム',
      timestamp: '2024-01-21T15:30:00.000Z',
      metadata: {
        trackingNumber: '1234-5678-9012',
        carrier: 'ヤマト運輸',
        status: 'shipped'
      }
    }
  ];

  // 大量データをシミュレートするために履歴を複製
  const totalItems = 272; // 実際のActivity数に合わせる
  const allItems = [];
  
  for (let i = 0; i < totalItems; i++) {
    const baseItem = baseHistoryItems[i % baseHistoryItems.length];
    const item = {
      ...baseItem,
      id: `mock-${i + 1}`,
      timestamp: new Date(Date.now() - (i * 3600000)).toISOString() // 1時間ずつ過去にする
    };
    allItems.push(item);
  }

  // ページネーション処理
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = allItems.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    total: totalItems
  };
}