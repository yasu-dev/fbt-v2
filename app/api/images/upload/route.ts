import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

// 画像の最大サイズ（バイト）
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// 許可される画像形式
const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    // ユーザー認証
    const user = await AuthService.getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }
    
    console.log('[DEBUG] 画像アップロード処理開始 - ユーザー:', user.email);

    // フォームデータを取得
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    const productId = formData.get('productId') as string;
    const category = formData.get('category') as string || 'general';

    if (files.length === 0) {
      return NextResponse.json(
        { error: '画像ファイルが選択されていません' },
        { status: 400 }
      );
    }

    const uploadedImages = [];

    for (const file of files) {
      // ファイルサイズチェック
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `ファイルサイズが大きすぎます: ${file.name}` },
          { status: 400 }
        );
      }

      // ファイル形式チェック
      if (!ALLOWED_FORMATS.includes(file.type)) {
        return NextResponse.json(
          { error: `サポートされていない画像形式です: ${file.name}` },
          { status: 400 }
        );
      }

      // 実際の実装では、ここで画像をS3やCloudinary等にアップロード
      // 今回はモック実装
      const imageUrl = await uploadToStorage(file, productId, category);
      
      uploadedImages.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        url: imageUrl,
        thumbnailUrl: imageUrl, // 実際はサムネイル生成
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        productId,
        category,
      });
    }

    return NextResponse.json({
      success: true,
      images: uploadedImages,
      message: `${uploadedImages.length}枚の画像をアップロードしました`,
    });
  } catch (error) {
    console.error('[ERROR] Image Upload:', error);
    return NextResponse.json(
      { error: '画像のアップロード中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 画像をストレージにアップロード（ローカルファイルシステム実装）
async function uploadToStorage(file: File, productId: string, category: string): Promise<string> {
  try {
    // uploadsディレクトリの作成
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const productDir = path.join(uploadsDir, productId);
    const categoryDir = path.join(productDir, category);

    // ディレクトリを再帰的に作成
    await fs.mkdir(categoryDir, { recursive: true });

    // ファイル名を生成
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const filename = `${timestamp}-${randomId}-${file.name}`;
    const filePath = path.join(categoryDir, filename);

    // ファイルをバッファに変換
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ファイルを保存
    await fs.writeFile(filePath, buffer);

    console.log('[DEBUG] 画像保存完了:', filePath);

    // APIのURLを返す
    return `/api/images/${productId}/${category}/${filename}`;
  } catch (error) {
    console.error('[ERROR] 画像保存エラー:', error);
    throw new Error('画像の保存に失敗しました');
  }
}

// 画像の削除
export async function DELETE(request: NextRequest) {
  try {
    const user = await AuthService.getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { imageId } = await request.json();
    
    if (!imageId) {
      return NextResponse.json(
        { error: '画像IDが指定されていません' },
        { status: 400 }
      );
    }

    // 実際の実装では、ストレージから画像を削除
    console.log(`Deleting image: ${imageId}`);

    return NextResponse.json({
      success: true,
      message: '画像を削除しました',
    });
  } catch (error) {
    console.error('[ERROR] Image Delete:', error);
    return NextResponse.json(
      { error: '画像の削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 