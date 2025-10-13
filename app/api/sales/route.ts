import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Sales API: Prismaクエリ開始');
    
    // ページネーションパラメータ
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // ユーザー種別を判定（セラーの場合はListingデータを返す）
    const referer = request.headers.get('referer') || '';
    const isSellerRequest = !referer.includes('/staff/');
    
    // セラーの場合はListingデータを返す
    if (isSellerRequest) {
      console.log('📊 Sales API: セラー用Listingデータを取得');
      
      // ステータスフィルタリング処理
      const statusFilter = searchParams.get('status');
      let listingStatusFilter = {};
      
      if (statusFilter && statusFilter !== 'all') {
        // 販売管理用ステータスフィルタリング
        if (statusFilter === 'listing') {
          // 出品中: activeでラベル未生成
          listingStatusFilter = {
            status: { in: ['active'] }
          };
        } else if (statusFilter === 'sold') {
          // 購入者決定: soldでラベル未生成
          listingStatusFilter = {
            status: { in: ['sold'] }
          };
        } else if (statusFilter === 'processing') {
          // 出荷準備中: draft, inactive, expired, pending
          listingStatusFilter = {
            status: { in: ['draft', 'inactive', 'expired', 'pending'] }
          };
        } else if (statusFilter === 'shipped') {
          // 配送中: activeでラベル生成済み
          listingStatusFilter = {
            status: { in: ['active'] }
          };
        } else if (statusFilter === 'delivered') {
          // 配送完了: soldでラベル生成済み
          listingStatusFilter = {
            status: { in: ['sold'] }
          };
        }
      }
      
      const [listings, listingProducts, totalListingCount, totalProductCount] = await Promise.all([
        // 既存のListingテーブルから出品データを取得
        prisma.listing.findMany({
          where: Object.keys(listingStatusFilter).length > 0 ? listingStatusFilter : {},
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
          include: {
            product: {
              include: {
                images: true,
                orderItems: {
                  include: {
                    order: true
                  },
                  take: 1 // 最新の注文のみ取得
                }
              }
            }
          }
        }),
        // Productテーブルからstatus='listing'の商品を取得（Listingがない場合用）
        prisma.product.findMany({
          where: { 
            status: 'listing',
            listings: {
              none: {} // Listingテーブルにレコードがない商品のみ
            }
          },
          take: limit,
          skip: offset,
          include: {
            images: true,
            orderItems: {
              include: {
                order: true
              },
              take: 1
            }
          },
          orderBy: { updatedAt: 'desc' }
        }),
        prisma.listing.count({ 
          where: Object.keys(listingStatusFilter).length > 0 ? listingStatusFilter : {}
        }),
        prisma.product.count({
          where: { 
            status: 'listing',
            listings: {
              none: {}
            }
          }
        })
      ]);

      // Productテーブルから取得した商品を擬似Listingオブジェクトに変換
      const pseudoListings = listingProducts.map(product => ({
        id: `pseudo-${product.id}`, // 擬似ListingID
        productId: product.id,
        platform: 'ebay',
        listingId: `PENDING-${product.id}`,
        title: product.name,
        description: product.description || '',
        price: product.price,
        status: 'active', // 擬似的に'active'として扱う
        listedAt: product.updatedAt, // 商品更新日時を出品日時として使用
        createdAt: product.updatedAt,
        updatedAt: product.updatedAt,
        soldAt: null,
        templateId: null,
        imageUrl: product.images?.[0]?.url || product.imageUrl, // 画像URLを追加
        product: product
      }));

      // ListingとPseudo-Listingをマージ（重複除去）
      const productIdSet = new Set();
      const allListings = [];
      
      // 既存のListingを優先追加
      for (const listing of listings) {
        if (!productIdSet.has(listing.productId)) {
          productIdSet.add(listing.productId);
          allListings.push(listing);
        }
      }
      
      // Pseudo-Listingは重複しない場合のみ追加
      for (const pseudoListing of pseudoListings) {
        if (!productIdSet.has(pseudoListing.productId)) {
          productIdSet.add(pseudoListing.productId);
          allListings.push(pseudoListing);
        }
      }
      
      const totalCount = allListings.length;
      
      // Listingデータを販売管理画面用に変換（ステータスマッピング適用）
      const statusMapping = {
        'draft': 'processing',        // 下書き → 出荷準備中
        'active': 'listing',          // 出品中 → 出品中
        'inactive': 'processing',     // 非公開 → 出荷準備中  
        'sold': 'sold',               // 売却済み → 購入者決定
        'expired': 'processing',      // 期限切れ → 出荷準備中
        'pending': 'processing'       // 保留中 → 出荷準備中
      };
      
      const uploadsRoot = path.join(process.cwd(), 'uploads');
      const isHttp = (u: string) => /^https?:\/\//.test(u || '');
      const isValidLocalImageUrl = async (url: string): Promise<boolean> => {
        if (!url) return false;
        if (url.startsWith('data:') || isHttp(url)) return true;
        try {
          let relative = '';
          if (url.startsWith('/api/images/')) relative = url.replace('/api/images/', '');
          else if (url.startsWith('/uploads/')) relative = url.replace('/uploads/', '');
          else if (/^product-/.test(url)) relative = url; else return true;
          const full = path.join(uploadsRoot, relative);
          await fs.access(full);
          return true;
        } catch { return false; }
      };

      const pickBestImage = async (listing: any): Promise<string> => {
        // 候補を列挙（Base64/HTTP優先）
        const candidates: string[] = [];
        try {
          if (listing.product?.metadata) {
            const md = typeof listing.product.metadata === 'string' ? JSON.parse(listing.product.metadata) : listing.product.metadata;
            if (Array.isArray(md?.photos) && md.photos.length > 0) {
              const p = md.photos[0];
              if (p?.dataUrl) candidates.push(p.dataUrl);
            }
            if (Array.isArray(md?.images) && md.images.length > 0) {
              const im = md.images[0];
              candidates.push((im?.url || im) as string);
            }
          }
        } catch {}
        candidates.push(
          listing.product?.images?.[0]?.url,
          listing.product?.imageUrl
        );
        for (const c of candidates) {
          if (c && await isValidLocalImageUrl(c)) return c;
        }
        return '/api/placeholder/96/96';
      };

      let recentOrders = await Promise.all(allListings.map(async (listing) => {
        // 関連する注文データを取得
        const relatedOrder = listing.product?.orderItems?.[0]?.order;
        const isLabelGenerated = relatedOrder?.trackingNumber ? true : false;
        
        // ステータス判定ロジック
        let displayStatus = statusMapping[listing.status as keyof typeof statusMapping] || 'processing';
        
        // shippingStatusカラムからステータスを確認
        const shippingStatus = listing.shippingStatus;
        
        // shippingStatusまたはラベル生成済みに基づいてステータス判定
        if (shippingStatus === 'delivered') {
          displayStatus = 'delivered';
        } else if (shippingStatus === 'shipped' || isLabelGenerated) {
          if (listing.status === 'active') {
            displayStatus = 'shipped';
          } else if (listing.status === 'sold') {
            displayStatus = 'delivered';
          }
        }
        
        const bestImage = await pickBestImage(listing);

        return {
          id: relatedOrder?.id || listing.id, // 注文IDが優先、なければListing ID
          listingId: listing.id, // 出品IDも保持
          orderNumber: relatedOrder?.orderNumber || `LST-${listing.id.slice(-8).toUpperCase()}`,
          customer: relatedOrder?.customerName || listing.platform,
          product: listing.title,
          ebayTitle: listing.title,
          ebayImage: bestImage,
          totalAmount: relatedOrder?.totalAmount || listing.price,
          status: displayStatus,
          itemCount: relatedOrder?.items?.length || 1,
          orderDate: relatedOrder?.orderDate?.toISOString() || listing.createdAt.toISOString(),
          platform: listing.platform,
          viewCount: listing.viewCount,
          watchCount: listing.watchCount,
          condition: listing.condition,
          description: listing.description,
          items: [{
            productName: listing.product?.name || listing.title,
            category: listing.product?.category || 'その他',
            quantity: 1,
            price: relatedOrder?.totalAmount || listing.price,
            productImage: bestImage
          }],
          labelGenerated: isLabelGenerated,
          trackingNumber: relatedOrder?.trackingNumber || null,
          carrier: relatedOrder?.carrier || null,
          // ラベル生成時に必要な情報を追加
          orderId: relatedOrder?.id, // 注文ID
          productId: listing.productId, // 商品ID
          realProductId: listing.productId, // 実際の商品ID（テスト機能用）
          shippingAddress: relatedOrder?.shippingAddress || '住所未設定'
        };
      }));
      
      // フィルターに応じてラベル生成状況で絞り込み
      if (statusFilter === 'listing') {
        // 出品中: Listing.status='active' または Product.status='listing' でラベル未生成
        recentOrders = recentOrders.filter(order => {
          const listing = allListings.find(l => l.id === order.listingId);
          const relatedOrder = listing?.product?.orderItems?.[0]?.order;
          const isListing = (listing?.status === 'active' || listing?.product?.status === 'listing');
          const noTracking = !relatedOrder?.trackingNumber;
          return isListing && noTracking;
        });
      } else if (statusFilter === 'sold') {
        // 購入者決定: soldでラベル未生成
        recentOrders = recentOrders.filter(order => {
          const listing = allListings.find(l => l.id === order.listingId);
          const relatedOrder = listing?.product?.orderItems?.[0]?.order;
          return listing.status === 'sold' && !relatedOrder?.trackingNumber;
        });
      } else if (statusFilter === 'shipped') {
        // 配送中: activeでラベル生成済みまたはシッピングステータスがshipped
        recentOrders = recentOrders.filter(order => {
          const listing = allListings.find(l => l.id === order.listingId);
          const relatedOrder = listing?.product?.orderItems?.[0]?.order;
          const hasShippingStatus = listing?.shippingStatus === 'shipped';
          return listing.status === 'active' && (relatedOrder?.trackingNumber || hasShippingStatus);
        });
      } else if (statusFilter === 'delivered') {
        // 配送完了: shippingStatusでdeliveredまたはsoldでラベル生成済み
        recentOrders = recentOrders.filter(order => {
          const listing = allListings.find(l => l.id === order.listingId);
          const relatedOrder = listing?.product?.orderItems?.[0]?.order;
          const isDelivered = listing?.shippingStatus === 'delivered';
          return isDelivered || (listing.status === 'sold' && relatedOrder?.trackingNumber);
        });
      }
      
      return NextResponse.json({
        _dataSource: 'prisma-listing',
        overview: {
          totalSales: allListings.reduce((sum, l) => sum + l.price, 0),
          monthlySales: allListings.filter(l => 
            l.createdAt >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          ).reduce((sum, l) => sum + l.price, 0),
          dailySales: allListings.filter(l =>
            l.createdAt >= new Date(new Date().setHours(0, 0, 0, 0))
          ).reduce((sum, l) => sum + l.price, 0),
          totalOrders: totalCount,
          averageOrderValue: totalCount > 0 ? Math.round(allListings.reduce((sum, l) => sum + l.price, 0) / totalCount) : 0
        },
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount: totalCount,
          limit: limit
        },
        recentOrders,
        topProducts: [],
        salesByCategory: [],
        salesByStatus: recentOrders.reduce((acc, order) => {
          const existing = acc.find(s => s.status === order.status);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ status: order.status, count: 1 });
          }
          return acc;
        }, [] as any[]),
        chartData: {
          monthly: [],
          daily: []
        }
      });
    }
    
    // 売上データをPrismaから取得
    const [
      totalSales,
      monthlySales,
      dailySales,
      recentOrders,
      topProducts,
      salesByCategory,
      salesByStatus,
      totalOrderCount
    ] = await Promise.all([
      // 総売上額
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ['delivered', 'completed'] } }
      }),
      
      // 月次売上
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { in: ['delivered', 'completed'] },
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      // 日次売上
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { in: ['delivered', 'completed'] },
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // 最近の注文
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          customer: { select: { username: true } },
          items: {
            include: {
              product: { 
                select: { 
                  name: true, 
                  category: true,
                  imageUrl: true,
                  images: {
                    select: { url: true },
                    take: 1,
                    orderBy: { order: 'asc' }
                  }
                }
              }
            }
          }
        }
      }),
      
      // 人気商品（売上件数順）
      prisma.orderItem.groupBy({
        by: ['productId'],
        _count: { productId: true },
        _sum: { price: true, quantity: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 10
      }),
      
      // カテゴリ別売上（後で処理）
      Promise.resolve([]),
      
      // ステータス別注文数
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      
      // 注文総数（ページネーション用）
      prisma.order.count()
    ]);

    console.log('✅ Sales API: Prisma基本クエリ完了');
    console.log(`注文データ取得件数: ${recentOrders.length}`);
    
    // 人気商品の詳細情報を取得
    const productIds = topProducts.map(item => item.productId);
    const productDetails = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, category: true, imageUrl: true }
    });

    console.log(`商品詳細取得件数: ${productDetails.length}`);

    // 売上データを構築
    const salesData = {
      _dataSource: 'prisma', // データソースを明示
      overview: {
        totalSales: totalSales._sum.totalAmount || 0,
        monthlySales: monthlySales._sum.totalAmount || 0,
        dailySales: dailySales._sum.totalAmount || 0,
        totalOrders: recentOrders.length,
        averageOrderValue: totalSales._sum.totalAmount && recentOrders.length 
          ? Math.round((totalSales._sum.totalAmount || 0) / recentOrders.length)
          : 0
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrderCount / limit),
        totalCount: totalOrderCount,
        limit: limit
      },
      recentOrders: recentOrders.map(order => {
        const firstItem = order.items[0];
        const productImage = firstItem?.product?.images?.[0]?.url || firstItem?.product?.imageUrl;
        
        const orderData = {
          id: order.id,
          orderNumber: order.orderNumber,
          customer: order.customer.username,
          product: order.items[0]?.product.name || '商品なし', // 商品名を追加
          ebayImage: productImage, // 商品画像を追加
          totalAmount: order.totalAmount,
          status: order.status,
          itemCount: order.items.length,
          orderDate: order.orderDate.toISOString(),
          trackingNumber: order.trackingNumber, // 追跡番号を追加
          carrier: order.carrier, // 配送業者を追加
          shippingAddress: order.shippingAddress, // 配送先住所を追加
          items: order.items.map(item => ({
            productName: item.product.name,
            category: item.product.category,
            quantity: item.quantity,
            price: item.price,
            productImage: item.product?.images?.[0]?.url || item.product?.imageUrl // 商品画像を追加
          }))
        };
        console.log(`注文 ${orderData.orderNumber}: 商品「${orderData.product}」追跡番号「${orderData.trackingNumber}」`);
        return orderData;
      }),
      topProducts: topProducts.map(item => {
        const product = productDetails.find(p => p.id === item.productId);
        return {
          id: item.productId,
          name: product?.name || '商品名不明',
          category: product?.category || 'その他',
          imageUrl: product?.imageUrl || '/api/placeholder/150/150',
          salesCount: item._count.productId,
          totalSales: item._sum.price || 0,
          totalQuantity: item._sum.quantity || 0
        };
      }),
      salesByStatus: salesByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
        label: getStatusLabel(item.status)
      })),
      monthlyTrend: generateMonthlyTrend(), // 簡単な月次トレンド
      categoryBreakdown: await getCategoryBreakdown()
    };

    console.log('🎉 Sales API: Prismaデータ正常取得完了！');
    return NextResponse.json(salesData);
  } catch (error) {
    console.error('Sales API error - Prismaでのデータ取得に失敗:', error);
    console.error('エラーの詳細:', JSON.stringify(error, null, 2));
    
    // フォールバック用のモックデータを返す（Prismaでデータ取得できない場合）
    const mockSalesData = {
      _dataSource: 'mock', // データソースを明示
      overview: {
        totalSales: 15750000,
        monthlySales: 3200000,
        dailySales: 180000,
        totalOrders: 87,
        averageOrderValue: 181034
      },
      recentOrders: [
        {
          id: 'ORD-2024-COMP-0008',
          orderNumber: 'ORD-2024-COMP-0008',
          customer: '顧客',
          product: 'Canon EOS R5 Full Frame Mirrorless Camera Body - Excellent Condition',
          totalAmount: 450000,
          status: 'delivered',
          itemCount: 1,
          orderDate: '2024-01-15',
          labelGenerated: true,
          trackingNumber: '1Z9999W99999999999',
          carrier: 'fedex',
          items: [{ productName: 'Canon EOS R5 Full Frame Mirrorless Camera Body - Excellent Condition', category: 'camera_body', quantity: 1, price: 450000, productImage: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=300&h=300&fit=crop' }]
        },
        {
          id: 'ORD-2024-COMP-0007',
          orderNumber: 'ORD-2024-COMP-0007',
          customer: '顧客',
          product: 'Sony Alpha a7R IV Mirrorless Camera - 61MP Full Frame',
          totalAmount: 398000,
          status: 'shipped',
          itemCount: 1,
          orderDate: '2024-01-14',
          labelGenerated: true,
          trackingNumber: '9612020987654312345',
          carrier: 'fedex',
          items: [{ productName: 'Sony Alpha a7R IV Mirrorless Camera - 61MP Full Frame', category: 'camera_body', quantity: 1, price: 398000, productImage: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300&h=300&fit=crop' }]
        },
        {
          id: 'ORD-2024-COMP-0006',
          orderNumber: 'ORD-2024-COMP-0006',
          customer: '顧客',
          product: 'Rolex Submariner Date 41mm Stainless Steel - Mint Condition',
          totalAmount: 1200000,
          status: 'cancelled',
          itemCount: 1,
          orderDate: '2024-01-13',
          labelGenerated: false,
          items: [{ productName: 'Rolex Submariner Date 41mm Stainless Steel - Mint Condition', category: 'watch', quantity: 1, price: 1200000, productImage: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=300&h=300&fit=crop' }]
        },
        {
          id: 'ORD-2024-COMP-0005',
          orderNumber: 'ORD-2024-COMP-0005',
          customer: '顧客',
          product: 'Nikon D850 DSLR Camera with 24-120mm Lens Kit - Professional Grade',
          totalAmount: 280000,
          status: 'processing',
          itemCount: 1,
          orderDate: '2024-01-13',
          labelGenerated: true,
          trackingNumber: '3811-2345-6789',
          carrier: 'yamato',
          items: [{ productName: 'Nikon D850 DSLR Camera with 24-120mm Lens Kit - Professional Grade', category: 'lens', quantity: 1, price: 280000, productImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=300&fit=crop' }]
        },
        {
          id: 'ORD-2024-COMP-0004',
          orderNumber: 'ORD-2024-COMP-0004',
          customer: '顧客',
          product: 'TAG Heuer Carrera Calibre 16 Chronograph - Steel & Rose Gold',
          totalAmount: 350000,
          status: 'processing',
          itemCount: 1,
          orderDate: '2024-01-12',
          labelGenerated: false,
          carrier: 'sagawa',
          items: [{ productName: 'TAG Heuer Carrera Calibre 16 Chronograph - Steel & Rose Gold', category: 'watch', quantity: 1, price: 350000, productImage: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=300&h=300&fit=crop' }]
        },
        {
          id: 'ORD-2024-COMP-0003',
          orderNumber: 'ORD-2024-COMP-0003',
          customer: '顧客',
          product: 'IWC Portugieser Automatic 40mm Stainless Steel - Blue Dial',
          totalAmount: 680000,
          status: 'processing',
          itemCount: 1,
          orderDate: '2024-01-11',
          labelGenerated: true,
          trackingNumber: '1234567890123',
          carrier: 'japanpost',
          items: [{ productName: 'IWC Portugieser Automatic 40mm Stainless Steel - Blue Dial', category: 'watch', quantity: 1, price: 680000, productImage: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=300&h=300&fit=crop' }]
        },
        {
          id: 'ORD-2024-COMP-0002',
          orderNumber: 'ORD-2024-COMP-0002',
          customer: '顧客',
          product: 'Fujifilm X-T4 Mirrorless Camera with 18-55mm Lens - Black',
          totalAmount: 220000,
          status: 'processing',
          itemCount: 1,
          orderDate: '2024-01-10',
          labelGenerated: false,
          items: [{ productName: 'Fujifilm X-T4 Mirrorless Camera with 18-55mm Lens - Black', category: 'camera', quantity: 1, price: 220000, productImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=300&h=300&fit=crop' }]
        },
        {
          id: 'ORD-2024-COMP-0001',
          orderNumber: 'ORD-2024-COMP-0001',
          customer: '顧客',
          product: 'Panasonic Lumix GH5 4K Video Camera - Content Creator Special',
          totalAmount: 598000,
          status: 'delivered',
          itemCount: 1,
          orderDate: '2024-01-09',
          labelGenerated: true,
          items: [{ productName: 'Panasonic Lumix GH5 4K Video Camera - Content Creator Special', category: 'camera_body', quantity: 1, price: 598000, productImage: 'https://images.unsplash.com/photo-1514016810987-c59c4e3d6d29?w=300&h=300&fit=crop' }]
        }
      ],
      topProducts: [],
      monthlyTrend: generateMonthlyTrend(),
      categoryBreakdown: [
        { category: 'camera_body', sales: 8900000, units: 22, percentage: 56.5 },
        { category: 'lens', sales: 4200000, units: 35, percentage: 26.7 },
        { category: 'watch', sales: 2650000, units: 7, percentage: 16.8 }
      ]
    };
    
    return NextResponse.json(mockSalesData);
  }
}

// ステータスラベルを取得
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '保留中',
    confirmed: '確認済み',
    processing: '処理中',
    shipped: '発送済み',
    delivered: '配送完了',
    completed: '完了',
    cancelled: 'キャンセル',
    returned: '返品'
  };
  return labels[status] || status;
}

// 月次トレンドを生成（過去12ヶ月）
function generateMonthlyTrend() {
  const months = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: date.toISOString().substring(0, 7), // YYYY-MM
      sales: Math.floor(Math.random() * 1000000) + 500000, // ダミーデータ
      orders: Math.floor(Math.random() * 100) + 50
    });
  }
  
  return months;
}

// カテゴリ別売上分析
async function getCategoryBreakdown() {
  try {
    const categoryStats = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { price: true, quantity: true }
    });

    // 商品情報を取得してカテゴリでグループ化
    const productIds = categoryStats.map(stat => stat.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, category: true }
    });

    const categoryMap: Record<string, { sales: number; quantity: number }> = {};
    
    categoryStats.forEach(stat => {
      const product = products.find(p => p.id === stat.productId);
      const category = product?.category || 'その他';
      
      if (!categoryMap[category]) {
        categoryMap[category] = { sales: 0, quantity: 0 };
      }
      
      categoryMap[category].sales += stat._sum.price || 0;
      categoryMap[category].quantity += stat._sum.quantity || 0;
    });

    return Object.entries(categoryMap).map(([category, data]) => ({
      category,
      sales: data.sales,
      quantity: data.quantity,
      percentage: 0 // 計算は後で追加可能
    }));
  } catch (error) {
    console.error('Category breakdown error:', error);
    return [];
  }
}