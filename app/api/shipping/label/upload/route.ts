import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // ユーザー認証 - セラーもアップロード可能に
    const user = await AuthService.requireRole(request, ['seller', 'staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // FormDataを取得
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const itemId = formData.get('itemId') as string;
    const provider = formData.get('provider') as 'seller' | 'worlddoor';
    const type = formData.get('type') as string;
    const trackingNumber = formData.get('trackingNumber') as string;
    const carrier = formData.get('carrier') as string;

    console.log('🚛 配送伝票アップロード - 受信パラメータ:', {
      itemId,
      provider,
      type,
      trackingNumber: trackingNumber ? `${trackingNumber.slice(0, 4)}***` : 'なし',
      carrier,
      fileName: file?.name,
      fileSize: file?.size
    });

    if (!file || !itemId || !provider) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      );
    }

    // ファイルサイズチェック（10MB以下）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'ファイルサイズは10MB以下にしてください' },
        { status: 400 }
      );
    }

    // ファイル形式チェック
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'PDF、JPEG、PNGファイルのみアップロード可能です' },
        { status: 400 }
      );
    }

    // 実際の実装では、ここでファイルをS3等にアップロード
    // 今回はモック実装
    const timestamp = Date.now();
    const fileName = `shipping-label-${itemId}-${timestamp}.${file.type.split('/')[1]}`;
    const fileUrl = `/api/shipping/label/download/${fileName}`;

    // 注文情報を取得してステータス更新
    try {
      // 注文を取得
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { id: itemId },
            { orderNumber: itemId }
          ]
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!order) {
        throw new Error('対象の注文が見つかりません');
      }

      // 注文ステータス、追跡番号、キャリア情報を更新
      const updateData: any = {
        status: 'processing'
      };
      
      if (trackingNumber && trackingNumber.trim()) {
        updateData.trackingNumber = trackingNumber.trim();
      }
      
      if (carrier && carrier.trim()) {
        updateData.carrier = carrier.trim();
      }
      
      await prisma.order.update({
        where: { id: order.id },
        data: updateData
      });

      // 関連商品のステータスを ordered に更新し、ピッキング用ロケーションに紐付け
      const productIds = order.items.map(item => item.productId);
      console.log('対象商品ID:', productIds);
      
      // デフォルトのピッキング用ロケーションを取得（既存のB-1-4を使用）
      console.log('B-1-4ロケーション確認中...');
      let pickingLocation = await prisma.location.findFirst({
        where: {
          code: 'B-1-4'
        }
      });

      if (!pickingLocation) {
        console.log('❌ B-1-4ピッキングロケーションが見つかりません');
        throw new Error('ピッキングロケーション(B-1-4)が存在しません');
      } else {
        console.log('✅ B-1-4ロケーション既存確認:', pickingLocation.id);
      }
      
      console.log('商品ステータス更新中...');
      try {
        const updateResult = await prisma.product.updateMany({
          where: {
            id: { in: productIds }
          },
          data: {
            status: 'ordered',
            currentLocationId: pickingLocation.id
          }
        });
        console.log('✅ 商品ステータス更新完了:', updateResult.count, '件更新');
      } catch (updateError) {
        console.error('❌ 商品ステータス更新エラー:', updateError);
        throw updateError;
      }

      // Shipmentエントリを作成（出荷準備中として）
      await prisma.shipment.create({
        data: {
          orderId: order.id,
          productId: productIds[0], // 最初の商品IDを使用
          status: 'pending', // 出荷準備中
          carrier: carrier || 'other',
          method: 'standard',
          trackingNumber: trackingNumber || null,
          customerName: order.customerName || 'Unknown Customer',
          address: order.shippingAddress || '',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日後をデフォルト期限とする
          priority: 'normal',
          value: order.totalAmount || 0,
          notes: `外部配送業者のラベルアップロード済み`,
        }
      });

      // アクティビティログを記録
      const logDescription = trackingNumber && trackingNumber.trim()
        ? `外部配送業者のラベルがアップロードされました（追跡番号: ${trackingNumber.trim()}）`
        : `外部配送業者のラベルがアップロードされました`;
        
      await prisma.activity.create({
        data: {
          type: 'label_uploaded',
          description: logDescription,
          userId: user.id,
          orderId: order.id,
          metadata: JSON.stringify({
            fileName,
            provider,
            fileSize: file.size,
            fileType: file.type,
            trackingNumber: trackingNumber?.trim() || null,
            carrier: carrier?.trim() || null
          })
        }
      });

      // ラベル生成完了時、スタッフにピッキング依頼通知を送信
      console.log('📦 [Label Upload] ピッキング依頼通知作成開始');
      
      // ピッキング担当スタッフを取得
      const pickingStaff = await prisma.user.findMany({
        where: { 
          role: 'staff',
          // 現在はすべてのスタッフに通知（将来的に department フィールドで絞り込み可能）
        }
      });

      // 各スタッフに通知を送信
      for (const staff of pickingStaff) {
        try {
          const notification = await prisma.notification.create({
            data: {
              type: 'picking_request',
              title: '📋 ピッキング依頼',
              message: `注文 ${order.orderNumber} の商品（${productIds.length}点）のピッキングを開始してください。`,
              userId: staff.id,
              read: false,
              priority: 'high',
              notificationType: 'picking_request',
              action: 'shipping',
              metadata: JSON.stringify({
                orderNumber: order.orderNumber,
                productIds,
                trackingNumber: trackingNumber?.trim() || null,
                carrier: carrier?.trim() || null,
                location: pickingLocation.name
              })
            }
          });
          
          console.log('📦 [Label Upload] ピッキング依頼通知作成完了:', notification.id, 'スタッフ:', staff.username);

          // アクティビティログに通知送信を記録
          await prisma.activity.create({
            data: {
              type: 'notification_sent',
              description: `ピッキング依頼通知を${staff.username}に送信しました（注文: ${order.orderNumber}）`,
              userId: 'system',
              orderId: order.id,
              metadata: JSON.stringify({
                notificationId: notification.id,
                notificationType: 'picking_request',
                staffId: staff.id,
                orderNumber: order.orderNumber
              })
            }
          });
        } catch (notificationError) {
          console.warn('📦 [Label Upload] スタッフ通知送信失敗（続行）:', staff.username, notificationError);
        }
      }
      
      console.log('📦 [Label Upload] 全スタッフへの通知送信完了:', pickingStaff.length, '名');

      // ログ記録
      console.log('Shipping label uploaded and status updated:', {
        orderId: order.id,
        fileName,
        provider,
        uploadedBy: user.username,
        fileSize: file.size,
        productsUpdated: productIds.length,
        trackingNumber: trackingNumber?.trim() || null,
        carrier: carrier?.trim() || null
      });

      return NextResponse.json({
        success: true,
        fileUrl,
        fileName,
        provider,
        orderId: order.id,
        productsUpdated: productIds.length,
        message: '配送伝票がアップロードされ、ピッキング開始可能になりました'
      });

    } catch (dbError) {
      console.error('データベース処理エラー:', dbError);
      // ファイルアップロードは成功したが、DB更新に失敗した場合
      return NextResponse.json({
        success: true,
        fileUrl,
        fileName,
        provider,
        warning: 'ファイルはアップロードされましたが、ステータス更新に失敗しました',
        dbError: dbError instanceof Error ? dbError.message : '不明なエラー'
      });
    }

  } catch (error) {
    console.error('Shipping label upload error:', error);
    return NextResponse.json(
      { error: '伝票のアップロード中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 