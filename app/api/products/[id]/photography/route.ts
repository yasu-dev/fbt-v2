import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

// 撮影済み画像データを取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await AuthService.getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const productId = params.id;
    if (!productId) {
      return NextResponse.json(
        { error: '商品IDが必要です' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // metadataから撮影データを取得
    const metadata = product.metadata ? 
      (typeof product.metadata === 'string' ? JSON.parse(product.metadata) : product.metadata) 
      : {};
    const photos = metadata.photos || [];
    const photographyCompleted = metadata.photographyCompleted || false;

    return NextResponse.json({
      success: true,
      data: {
        productId,
        photos,
        photographyCompleted,
        photographyDate: metadata.photographyDate,
        photographyBy: metadata.photographyBy,
        totalCount: photos.length
      }
    });

  } catch (error) {
    console.error('[ERROR] Get Photography Data:', error);
    return NextResponse.json(
      { error: '撮影データの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[DEBUG] Photography POST request received for product:', params.id);
    
    // デモ環境用の認証処理
    let user;
    try {
      user = await AuthService.requireRole(request, ['staff', 'admin']);
      console.log('[DEBUG] User authenticated:', user?.username);
    } catch (authError) {
      console.log('[INFO] 認証エラー - デモ環境として続行:', authError);
      user = { 
        id: 'demo-user', 
        username: 'デモスタッフ',
        role: 'staff'
      };
    }
    
    const productId = params.id;

    const body = await request.json();
    const { photos, notes, photoSlots } = body;
    console.log('[DEBUG] Photography request body:', { photos: photos?.length, notes, photoSlots: photoSlots?.length, productId });

    if (!productId) {
      return NextResponse.json(
        { error: '商品IDが必要です' },
        { status: 400 }
      );
    }

    console.log('[DEBUG] Searching for product with ID:', productId);
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      console.log('[ERROR] Product not found:', productId);
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }
    
    console.log('[DEBUG] Found product:', { id: product.id, name: product.name, status: product.status });

    // Update metadata to mark photography as completed and save photos
    const currentMetadata = product.metadata ? 
      (typeof product.metadata === 'string' ? JSON.parse(product.metadata) : product.metadata)
      : {};
    const updatedMetadata = {
      ...currentMetadata,
      photographyCompleted: true,
      photographyDate: new Date().toISOString(),
      photographyBy: user.username,
      photos: photos || [], // 撮影画像データを保存
      photoSlots: photoSlots || [], // 写真の配置情報を保存
    };

    // Update product with photography data (ステータスは検品進捗APIで管理)
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        metadata: JSON.stringify(updatedMetadata),
        // 撮影完了時はステータス変更せず、検品進捗で管理
        // status: productのステータスは検品進捗APIで自動更新
        // Add photography-related fields if needed
        ...(notes && { 
          inspectionNotes: (product.inspectionNotes || '') + 
            (product.inspectionNotes ? '\n\n【撮影メモ】\n' : '【撮影メモ】\n') + notes 
        }),
      },
    });

    console.log('[DEBUG] Photography data saved successfully - progress update handled by frontend');
    
    console.log('[DEBUG] Product updated successfully:', { 
      id: updatedProduct.id, 
      status: updatedProduct.status,
      photosInMetadata: updatedMetadata.photos?.length 
    });

    // Log photography completion activity
    try {
      await prisma.activity.create({
        data: {
          productId: productId,
          userId: user.id || 'demo-user',
          type: 'photography_completed',
          description: `商品の撮影が完了しました（写真${photos?.length || 0}枚）`,
          metadata: JSON.stringify({
            photosCount: photos?.length || 0,
            notes: notes || '',
          }),
        },
      });
      console.log('[DEBUG] Activity logged successfully');
    } catch (activityError) {
      console.warn('[WARN] Failed to log activity:', activityError);
      // アクティビティログの失敗は全体の処理を停止させない
    }

    const response = {
      success: true,
      message: '撮影データが保存されました',
      data: {
        product: updatedProduct,
        photosCount: photos?.length || 0,
      },
    };
    
    console.log('[DEBUG] Photography API response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('[ERROR] Save Photography Data:', error);
    return NextResponse.json(
      { error: '撮影データの保存中にエラーが発生しました' },
      { status: 500 }
    );
  }
}