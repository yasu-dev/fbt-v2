import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import archiver from 'archiver';
import fs from 'fs/promises';
import path from 'path';

export const GET = requireAuth(async (req: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const productIds = searchParams.get('productIds');
    const imageId = searchParams.get('imageId');
    const productId = searchParams.get('productId');
    const imageIds = searchParams.get('imageIds'); // 選択された画像IDのリスト

    if (!productIds && !imageId) {
      return NextResponse.json(
        { error: 'productIds または imageId が必要です' },
        { status: 400 }
      );
    }

    // 単体画像のダウンロード
    if (imageId && productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          images: true
        }
      });

      if (!product) {
        return NextResponse.json(
          { error: '商品が見つかりません' },
          { status: 404 }
        );
      }

      // アクセス権限チェック（スタッフと管理者は全てのダウンロードを許可）
      if (user.role === 'seller') {
        // セラーの場合は簡易チェック（商品の存在確認のみ）
      }

      // ProductImageテーブルとmetadata.photosの両方から画像を検索
      let image = product.images.find((img: any) => img.id === imageId);
      let isStaffPhoto = false;

      if (!image) {
        // metadataからスタッフ撮影画像を検索
        const metadata = product.metadata ?
          (typeof product.metadata === 'string' ? JSON.parse(product.metadata) : product.metadata)
          : {};
        const staffPhotos = metadata.photos || [];
        const staffPhotoIndex = staffPhotos.findIndex((photo: any, index: number) =>
          `staff_${index}` === imageId
        );

        if (staffPhotoIndex !== -1) {
          const staffPhoto = staffPhotos[staffPhotoIndex];
          const dataUrl = typeof staffPhoto === 'string' ? staffPhoto : staffPhoto.dataUrl;
          image = {
            id: imageId,
            filename: (typeof staffPhoto === 'object' ? staffPhoto.filename : null) || 'staff_photo.jpg',
            url: dataUrl,
            mimeType: (typeof staffPhoto === 'object' ? staffPhoto.mimeType : null) || 'image/jpeg'
          };
          isStaffPhoto = true;
        }
      }

      if (!image) {
        return NextResponse.json(
          { error: '画像が見つかりません' },
          { status: 404 }
        );
      }

      try {
        // ProductImageから画像URLを取得
        if (image.url) {
          if (image.url.startsWith('data:')) {
            // Base64データの場合
            const base64Data = image.url.split(',')[1];
            if (!base64Data) {
              throw new Error('Base64データが無効です');
            }

            const imageBuffer = Buffer.from(base64Data, 'base64');
            const mimeType = image.url.split(',')[0].split(':')[1].split(';')[0];

            return new NextResponse(imageBuffer, {
              headers: {
                'Content-Type': mimeType,
                'Content-Disposition': `attachment; filename="${image.filename}"`,
              },
            });
          } else if (image.url.startsWith('/api/images/')) {
            // ファイルパスの場合 - /api/images/product-0-1758375525688/general/1758375526331-gansn7rnq-i.jpg
            // パスからファイルシステムパスを構築
            const relativePath = image.url.replace('/api/images/', '');
            const filePath = path.join(process.cwd(), 'uploads', relativePath);

            try {
              await fs.access(filePath);
              const fileBuffer = await fs.readFile(filePath);

              // ファイル拡張子からContent-Typeを決定
              const ext = path.extname(image.filename).toLowerCase();
              let contentType = 'application/octet-stream';
              switch (ext) {
                case '.jpg':
                case '.jpeg':
                  contentType = 'image/jpeg';
                  break;
                case '.png':
                  contentType = 'image/png';
                  break;
                case '.gif':
                  contentType = 'image/gif';
                  break;
                case '.webp':
                  contentType = 'image/webp';
                  break;
              }

              return new NextResponse(fileBuffer, {
                headers: {
                  'Content-Type': contentType,
                  'Content-Disposition': `attachment; filename="${image.filename}"`,
                },
              });
            } catch (fileError) {
              console.error('ファイル読み込みエラー:', fileError);
              throw new Error('ファイルが見つかりません');
            }
          } else {
            throw new Error('サポートされていない画像形式です');
          }
        } else {
          throw new Error('画像データが見つかりません');
        }
      } catch (error) {
        console.error('画像処理エラー:', error);
        return NextResponse.json(
          { error: 'ダウンロード可能な画像データがありません' },
          { status: 404 }
        );
      }
    }

    // 複数商品のZIPダウンロード
    if (productIds) {
      // 単一商品IDの場合も配列として扱う
      const ids = productIds.includes(',') ? productIds.split(',') : [productIds];
      const products = await prisma.product.findMany({
        where: { id: { in: ids } },
        include: {
          images: true
        }
      });

      if (products.length === 0) {
        return NextResponse.json(
          { error: '商品が見つかりません' },
          { status: 404 }
        );
      }

      // アクセス権限チェック（スタッフと管理者は全てのダウンロードを許可）
      if (user.role === 'seller') {
        // セラーの場合は簡易チェック（商品の存在確認のみ）
      }

      // ZIPファイル作成
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      const chunks: Buffer[] = [];
      archive.on('data', (chunk) => chunks.push(chunk));
      archive.on('error', (err) => {
        throw err;
      });

      let hasImages = false;

      // 選択された画像IDのリストを解析
      const selectedImageIds = imageIds ? imageIds.split(',') : null;

      for (const product of products) {
        // ProductImageテーブルから画像を処理
        for (const image of product.images) {
          // 画像IDが選択リストに含まれているかチェック（選択リストが指定されている場合）
          if (selectedImageIds && !selectedImageIds.includes(image.id)) {
            continue; // 選択されていない画像はスキップ
          }

          try {
            if (image.url) {
              let imageBuffer: Buffer | null = null;

              if (image.url.startsWith('data:')) {
                // Base64データの場合
                const base64Data = image.url.split(',')[1];
                if (base64Data) {
                  imageBuffer = Buffer.from(base64Data, 'base64');
                }
              } else if (image.url.startsWith('/api/images/')) {
                // ファイルパスの場合
                const relativePath = image.url.replace('/api/images/', '');
                const filePath = path.join(process.cwd(), 'uploads', relativePath);
                console.log(`[DEBUG] 画像処理中: ${image.filename}`);
                console.log(`[DEBUG] 元URL: ${image.url}`);
                console.log(`[DEBUG] 相対パス: ${relativePath}`);
                console.log(`[DEBUG] 構築されたファイルパス: ${filePath}`);

                try {
                  await fs.access(filePath);
                  imageBuffer = await fs.readFile(filePath);
                  console.log(`[DEBUG] ファイル読み込み成功: ${image.filename}`);
                } catch (fileError) {
                  console.log(`[WARN] 画像ファイルスキップ: ${image.filename} Error: ${fileError.message}`);
                  console.log(`[DEBUG] アクセス失敗したパス: ${filePath}`);
                  continue;
                }
              }

              if (imageBuffer) {
                const filename = image.filename || `${product.name}_seller_${image.id}.jpg`;
                archive.append(imageBuffer, {
                  name: `${product.name}/seller/${filename}`
                });
                hasImages = true;
              }
            }
          } catch (error) {
            console.log(`[WARN] セラー画像データの処理に失敗: ${product.id}/${image.id}`);
          }
        }

        // metadataからスタッフ撮影画像を処理
        try {
          const metadata = product.metadata ?
            (typeof product.metadata === 'string' ? JSON.parse(product.metadata) : product.metadata)
            : {};
          const staffPhotos = metadata.photos || [];

          for (let index = 0; index < staffPhotos.length; index++) {
            const photo = staffPhotos[index];
            const staffImageId = `staff_${index}`;

            // 画像IDが選択リストに含まれているかチェック（選択リストが指定されている場合）
            if (selectedImageIds && !selectedImageIds.includes(staffImageId)) {
              continue; // 選択されていない画像はスキップ
            }

            try {
              // Handle both object format {dataUrl: "data:..."} and direct string format "data:..."
              const dataUrl = typeof photo === 'string' ? photo : photo.dataUrl;
              if (dataUrl && dataUrl.startsWith('data:')) {
                const base64Data = dataUrl.split(',')[1];
                if (base64Data) {
                  const imageBuffer = Buffer.from(base64Data, 'base64');
                  const filename = (typeof photo === 'object' ? photo.filename : null) || `staff_photo_${index + 1}.jpg`;
                  archive.append(imageBuffer, {
                    name: `${product.name}/staff/${filename}`
                  });
                  hasImages = true;
                }
              }
            } catch (error) {
              console.log(`[WARN] スタッフ画像データの処理に失敗: ${product.id}/staff_${index}`);
            }
          }
        } catch (error) {
          console.log(`[WARN] スタッフ画像メタデータの処理に失敗: ${product.id}`);
        }
      }

      if (!hasImages) {
        return NextResponse.json(
          { error: 'ダウンロード可能な画像データがありません' },
          { status: 404 }
        );
      }

      await archive.finalize();

      const zipBuffer = Buffer.concat(chunks);

      return new NextResponse(zipBuffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename="product_images.zip"',
        },
      });
    }

  } catch (error) {
    console.error('画像ダウンロードエラー:', error);
    console.error('エラーの詳細:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: '画像のダウンロードに失敗しました' },
      { status: 500 }
    );
  }
});

// 画像一覧取得API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: '商品IDが必要です' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // ProductImageテーブルからセラーアップロード画像を取得
    const sellerImages = product.images.map((image: any) => {
      const hasData = !!(image.url && (image.url.startsWith('data:') || image.url.startsWith('/api/images/')));
      return {
        id: image.id,
        filename: image.filename,
        category: image.category || 'seller',
        hasData: hasData,
        previewUrl: image.url && image.url.startsWith('data:') ? image.url : (image.url && image.url.startsWith('/api/images/') ? image.url : null),
        size: image.size || 0,
        mimeType: image.mimeType || 'image/jpeg',
        source: 'seller'
      };
    });

    // metadataからスタッフ撮影画像を取得
    const metadata = product.metadata ?
      (typeof product.metadata === 'string' ? JSON.parse(product.metadata) : product.metadata)
      : {};
    const staffPhotos = metadata.photos || [];

    const staffImages = staffPhotos.map((photo: any, index: number) => {
      // Handle both object format {dataUrl: "data:..."} and direct string format "data:..."
      const dataUrl = typeof photo === 'string' ? photo : photo.dataUrl;
      const hasData = !!(dataUrl && dataUrl.startsWith('data:'));
      return {
        id: `staff_${index}`,
        filename: (typeof photo === 'object' ? photo.filename : null) || `staff_photo_${index + 1}.jpg`,
        category: 'photography',
        hasData: hasData,
        previewUrl: hasData ? dataUrl : null,
        size: (typeof photo === 'object' ? photo.size : null) || 0,
        mimeType: (typeof photo === 'object' ? photo.mimeType : null) || 'image/jpeg',
        source: 'staff'
      };
    });

    // 両方の画像を結合
    const availableImages = [...sellerImages, ...staffImages];
    const availableCount = availableImages.filter((img: any) => img.hasData).length;

    return NextResponse.json({
      success: true,
      images: availableImages,
      totalImages: availableImages.length,
      availableImages: availableCount
    });

  } catch (error) {
    console.error('画像一覧取得エラー:', error);
    return NextResponse.json(
      { error: '画像一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}