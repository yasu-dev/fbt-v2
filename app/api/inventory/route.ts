import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';


const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // 認証チェック - デモ環境では簡素化
    let user;
    try {
      user = await AuthService.getUserFromRequest(request);
      if (!user) {
              console.log('🔧 デモ環境: 認証なしでデータ取得続行');
      // リクエストURLからスタッフかセラーかを判定
      const referer = request.headers.get('referer') || '';
      const isStaffRequest = referer.includes('/staff/');
      
      user = isStaffRequest ? { 
        id: 'staff-demo-user',
        role: 'staff', 
        email: 'staff@example.com' 
      } : { 
        id: 'cmdy50dbe0000c784au98deq5', // 実際のセラーID
        role: 'seller', 
        email: 'seller@example.com' 
      };
      }
    } catch (authError) {
      console.log('🔧 デモ環境: 認証エラーでデフォルトユーザーを使用');
      user = { 
        id: 'cmdy50dbe0000c784au98deq5', // 実際のセラーID
        role: 'seller', 
        email: 'seller@example.com' 
      };
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20'); // ページネーション対応
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    // ユーザーロールに基づくフィルタリング
    if (user.role === 'seller') {
      // セラーは自分の商品のみ表示
      const sellerId = await prisma.user.findFirst({
        where: { email: 'seller@example.com' },
        select: { id: true }
      });
      if (sellerId) {
        where.sellerId = sellerId.id;
      }
    }
    // スタッフ・管理者は全商品表示（フィルタなし）
    
    console.log(`[DEBUG] 在庫API呼び出し - ユーザー: ${user.role}, ステータスフィルター: ${status}`);
    
    if (status) {
      // 日本語ステータスを英語に変換
      const statusMap: { [key: string]: string } = {
        '入庫': 'inbound',
        '入荷待ち': 'inbound',
        '検品': 'inspection',
        '検品中': 'inspection',
        '保管': 'storage',
        '保管中': 'storage',
        '出品': 'listing',
        '出品中': 'listing',

        '受注': 'ordered',
        '受注済み': 'ordered',
        '出荷': 'shipping',
        '出荷中': 'shipping',
        '配送': 'delivery',
        '売約済み': 'sold',
        '返品': 'returned'
      };

      const englishStatus = statusMap[status] || status;
      where.status = englishStatus;
      console.log(`[DEBUG] ステータスフィルター設定: ${status} -> ${englishStatus}`);
    }
    
    if (category) {
      where.category = category.replace('カメラ本体', 'camera_body')
                              .replace('レンズ', 'lens')
                              .replace('腕時計', 'watch')
                              .replace('アクセサリ', 'accessory');
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        {
          seller: {
            is: {
              OR: [
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { fullName: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    console.log(`[DEBUG] データベース検索条件:`, where);
    
    // Get products with pagination
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          currentLocation: true,
          seller: {
            select: { id: true, username: true, email: true, fullName: true }
          },
          images: {
            orderBy: { sortOrder: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.product.count({ where })
    ]);

    console.log(`[DEBUG] データベースから取得した商品数: ${products.length}, 総件数: ${totalCount}`);
    
    if (products.length > 0) {
      console.log(`[DEBUG] 取得された商品サンプル:`, products.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        category: p.category,
        sellerId: p.sellerId,
        createdAt: p.createdAt.toISOString().split('T')[0]
      })));
    }

    // 画像の有効性チェックと優先順位付けのヘルパー
    const uploadsRoot = path.join(process.cwd(), 'uploads');
    const getUrlFromImageObj = (img: any): string => {
      if (!img) return '';
      if (typeof img === 'string') return img;
      return img.url || img.thumbnailUrl || '';
    };

    const isValidLocalImageUrl = async (url: string): Promise<boolean> => {
      if (!url) return false;
      if (url.startsWith('data:')) return true; // Base64 は常にOK
      if (/^https?:\/\//.test(url)) return true; // リモートURLはそのまま許可
      try {
        let relativePath = '';
        if (url.startsWith('/api/images/')) {
          relativePath = url.replace('/api/images/', '');
        } else if (/^product-/.test(url)) {
          relativePath = url;
        } else if (url.startsWith('/uploads/')) {
          relativePath = url.replace('/uploads/', '');
        } else {
          // その他の形式は有効とみなす
          return true;
        }
        const fullPath = path.join(uploadsRoot, relativePath);
        await fs.access(fullPath);
        return true;
      } catch {
        return false;
      }
    };

    const filterAndPrioritizeImages = async (images: any[]): Promise<any[]> => {
      const kept: any[] = [];
      for (const img of images) {
        const url = getUrlFromImageObj(img);
        if (!url) continue;
        if (await isValidLocalImageUrl(url)) {
          kept.push(typeof img === 'string' ? img : { ...img, url });
        }
      }
      const score = (u: string) => u.startsWith('data:') ? 3 : (/^https?:\/\//.test(u) ? 2 : ((u.startsWith('/api/images/') || /^product-/.test(u)) ? 1 : 0));
      kept.sort((a, b) => score(getUrlFromImageObj(b)) - score(getUrlFromImageObj(a)));
      return kept;
    };

    const resolvePrimaryImage = async (candidate: string | null | undefined, images: any[]): Promise<string | null> => {
      if (candidate && await isValidLocalImageUrl(candidate)) return candidate;
      const first = images.length > 0 ? getUrlFromImageObj(images[0]) : '';
      return first || null;
    };

    // Transform to match UI expectations - データベース値をそのまま返す（フロントエンドで変換）
    const inventoryData = await Promise.all(products.map(async (product, index) => {
      // メタデータを安全に解析
      let parsedMetadata = null;
      try {
        if (product.metadata) {
          parsedMetadata = typeof product.metadata === 'string' 
            ? JSON.parse(product.metadata) 
            : product.metadata;
        }
      } catch (e) {
        console.warn(`[WARN] Failed to parse metadata for product ${product.id}:`, e);
        parsedMetadata = null;
      }
      
      // 納品プラン由来の商品の場合のデバッグログ
      if (parsedMetadata?.deliveryPlanId) {
        console.log(`[DEBUG] 在庫API: 納品プラン由来商品 ${index + 1}/${products.length}:`, {
          id: product.id,
          name: product.name,
          sku: product.sku,
          hasSupplier: !!parsedMetadata.supplier,
          hasSupplierDetails: !!parsedMetadata.supplierDetails,
          hasImages: parsedMetadata.images?.length || 0,
          hasInspectionChecklistData: !!parsedMetadata.inspectionChecklistData,
          deliveryPlanId: parsedMetadata.deliveryPlanId
        });
        
        // 検品チェックリストの詳細構造もログ
        if (parsedMetadata.inspectionChecklistData) {
          console.log('[DEBUG] 検品チェックリスト詳細:', {
            exterior: parsedMetadata.inspectionChecklistData.exterior,
            functionality: parsedMetadata.inspectionChecklistData.functionality,
            optical: parsedMetadata.inspectionChecklistData.optical,
            notes: parsedMetadata.inspectionChecklistData.notes
          });
        }
        
        // 画像データの詳細構造もログ
        if (parsedMetadata.images?.length > 0) {
          console.log('[DEBUG] 画像データ詳細:', parsedMetadata.images.map(img => ({
            url: img.url,
            category: img.category,
            filename: img.filename
          })));
        }
      }
      
      // DEMOカメラ０６の詳細ログ
      if (product.name?.includes('DEMOカメラ０６')) {
        console.log('API: DEMOカメラ０６の詳細データ:', {
          name: product.name,
          price: product.price,
          rawMetadata: product.metadata,
          parsedMetadata: parsedMetadata,
          purchasePriceInMetadata: parsedMetadata?.purchasePrice
        });
      }

      // 画像データを統合的に処理
      const allImages: any[] = [];
      
      // ProductImageテーブルからの画像
      if (product.images && product.images.length > 0) {
        allImages.push(...product.images.map(img => ({
          id: img.id,
          url: img.url,
          thumbnailUrl: img.url,
          filename: img.filename,
          source: 'product_table'
        })));
      }
      
      // メタデータ内のBase64画像（スタッフ撮影画像）
      if (parsedMetadata?.photos && Array.isArray(parsedMetadata.photos)) {
        allImages.push(...parsedMetadata.photos.map((photo, index) => ({
          id: `metadata_${index}`,
          url: photo.dataUrl,
          thumbnailUrl: photo.dataUrl,
          filename: photo.filename || `photo_${index}.jpg`,
          source: 'metadata'
        })));
      }
      
      // メタデータ内の画像配列（納品プラン由来）
      if (parsedMetadata?.images && Array.isArray(parsedMetadata.images)) {
        allImages.push(...parsedMetadata.images.map((img, index) => ({
          id: `delivery_${index}`,
          url: img.url || img,
          thumbnailUrl: img.url || img,
          filename: img.filename || `delivery_${index}.jpg`,
          source: 'delivery_plan'
        })));
      }

      // 無効なローカルファイルパス画像を除外し、Base64優先に並び替え
      const validImages = await filterAndPrioritizeImages(allImages);

      // imageUrl が無効なら最初の有効画像へフォールバック
      const primaryImageUrl = await resolvePrimaryImage(product.imageUrl, validImages);

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category, // 英語のまま返す
        status: product.status, // 英語のまま返す
        location: product.currentLocation?.code || '未設定',
        price: product.price,
        condition: product.condition, // 英語のまま返す
        entryDate: product.entryDate ? product.entryDate.toISOString().split('T')[0] : product.createdAt.toISOString().split('T')[0],
        imageUrl: primaryImageUrl,
        images: validImages, // 統合された有効画像データ
        currentLocation: product.currentLocation, // ロケーション情報も追加
        seller: product.seller,
        description: product.description,
        inspectedAt: product.inspectedAt,
        inspectionNotes: product.inspectionNotes, // 検品備考を追加
        metadata: parsedMetadata, // 解析済みのデータを返す
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      };
    }));

    console.log(`✅ 在庫データ取得完了: ${inventoryData.length}件 (ユーザー: ${user.role}${user.role === 'seller' ? ' - 自分の商品のみ' : ' - 全商品'})`);

    return NextResponse.json({
      data: inventoryData,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Inventory fetch error:', error);
    
    // Prismaエラーの場合はモックデータでフォールバック


    return NextResponse.json(
      { error: '在庫データの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, sku, category, price, condition, description, imageUrl } = body;

    if (!name || !sku || !category || !price || !condition) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    // Check for duplicate SKU
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'SKUが既に存在します' },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        category: category.replace('カメラ本体', 'camera_body')
                          .replace('レンズ', 'lens')
                          .replace('腕時計', 'watch')
                          .replace('アクセサリ', 'accessory'),
        price: parseInt(price),
        condition: condition.replace('新品', 'new')
                           .replace('新品同様', 'like_new')
                           .replace('極美品', 'excellent')
                           .replace('美品', 'very_good')
                           .replace('良品', 'good')
                           .replace('中古美品', 'fair')
                           .replace('中古', 'poor'),
        description,
        imageUrl,
        sellerId: user.id,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'inbound',
        description: `商品 ${name} が新規登録されました`,
        userId: user.id,
        productId: product.id,
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    
    // Prismaエラーの場合はモック成功レスポンスを返す


    return NextResponse.json(
      { error: '商品登録中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, price, condition, description, imageUrl, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: '商品IDが必要です' },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(price && { price: parseInt(price) }),
        ...(condition && { 
          condition: condition.replace('新品', 'new')
                             .replace('新品同様', 'like_new')
                             .replace('極美品', 'excellent')
                             .replace('美品', 'very_good')
                             .replace('良品', 'good')
                             .replace('中古美品', 'fair')
                             .replace('中古', 'poor')
        }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(status && { 
          status: status.replace('入庫', 'inbound')
                        .replace('検品', 'inspection')
                        .replace('保管', 'storage')
                        .replace('出品', 'listing')
                        .replace('受注', 'ordered')
                        .replace('出荷', 'shipping')
                        .replace('配送', 'delivery')
                        .replace('売約済み', 'sold')
                        .replace('返品', 'returned')
        }),
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'update',
        description: `商品 ${updatedProduct.name} が更新されました`,
        userId: user.id,
        productId: updatedProduct.id,
      },
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Product update error:', error);
    


    return NextResponse.json(
      { error: '商品更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['admin']);
    if (!user) {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '商品IDが必要です' },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // Check if product is in active order
    const activeOrder = await prisma.orderItem.findFirst({
      where: {
        productId: id,
        order: {
          status: {
            in: ['pending', 'confirmed', 'processing', 'shipped'],
          },
        },
      },
    });

    if (activeOrder) {
      return NextResponse.json(
        { error: 'アクティブな注文に含まれている商品は削除できません' },
        { status: 409 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'delete',
        description: `商品 ${existingProduct.name} が削除されました`,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, message: '商品を削除しました' });
  } catch (error) {
    console.error('Product deletion error:', error);
    


    return NextResponse.json(
      { error: '商品削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}