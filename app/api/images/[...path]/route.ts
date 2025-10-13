import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    console.log('[DEBUG] 画像配信リクエスト:', params.path);

    if (!params.path || params.path.length === 0) {
      return NextResponse.json(
        { error: 'Invalid image path' },
        { status: 400 }
      );
    }

    // パスを結合
    const imagePath = params.path.join('/');
    console.log('[DEBUG] 画像パス:', imagePath);

    // uploads ディレクトリの画像ファイルパス
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const fullImagePath = path.join(uploadsDir, imagePath);
    
    console.log('[DEBUG] フルパス:', fullImagePath);

    try {
      // ファイルが存在するかチェック
      await fs.access(fullImagePath);
      
      // ファイルを読み込み
      const fileBuffer = await fs.readFile(fullImagePath);
      
      // MIMEタイプを決定
      const ext = path.extname(fullImagePath).toLowerCase();
      let contentType = 'image/jpeg';
      
      switch (ext) {
        case '.png':
          contentType = 'image/png';
          break;
        case '.webp':
          contentType = 'image/webp';
          break;
        case '.gif':
          contentType = 'image/gif';
          break;
        default:
          contentType = 'image/jpeg';
      }

      console.log('[DEBUG] 画像配信成功:', imagePath, 'Type:', contentType);

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    } catch (fileError) {
      console.error('[ERROR] ファイル読み込みエラー:', fileError);
      
      // プレースホルダー画像を生成 (1x1 透明PNG)
      const placeholderPng = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
        0x89, 0x00, 0x00, 0x00, 0x0B, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
        0x42, 0x60, 0x82
      ]);
      
      return new NextResponse(placeholderPng, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  } catch (error) {
    console.error('[ERROR] 画像配信エラー:', error);
    return NextResponse.json(
      { error: '画像の読み込み中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
