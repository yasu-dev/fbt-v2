import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * セラーのラベル生成時にスタッフの出荷管理に商品を追加するAPI
 */
export async function POST(request: NextRequest) {
  try {
    // ユーザー認証（セラーまたはスタッフ）
    const user = await AuthService.requireRole(request, ['seller', 'staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      orderId, 
      orderNumber, 
      productName, 
      trackingNumber, 
      carrier, 
      shippingMethod,
      customer,
      shippingAddress,
      value,
      estimatedDelivery
    } = body;

    console.log('スタッフ出荷管理への連携開始:', { orderNumber, trackingNumber, carrier });

    if (!orderId && !orderNumber) {
      return NextResponse.json(
        { error: '注文IDまたは注文番号が必要です' },
        { status: 400 }
      );
    }

    if (!trackingNumber) {
      return NextResponse.json(
        { error: '追跡番号が必要です' },
        { status: 400 }
      );
    }

    // 既存の出荷データがあるかチェック
    const existingShipment = await prisma.shipment.findFirst({
      where: {
        OR: [
          { orderId: orderId },
          { orderId: orderNumber }
        ]
      }
    });

    let shipment;
    
    if (existingShipment) {
      // 既存データを更新
      shipment = await prisma.shipment.update({
        where: { id: existingShipment.id },
        data: {
          trackingNumber,
          carrier: carrier || 'その他',
          method: shippingMethod || '配送',
          status: 'pending', // セラーがラベル生成後は pending（ピッキング待ち）
          customerName: customer || existingShipment.customerName,
          address: shippingAddress || existingShipment.address,
          value: value || existingShipment.value,
          notes: `セラーがラベル生成済み (${carrier}) - ${new Date().toLocaleString()}`
        }
      });
      console.log('既存出荷データを更新しました:', shipment.id);
    } else {
      // 新規出荷データを作成
      shipment = await prisma.shipment.create({
        data: {
          orderId: orderId || orderNumber,
          productId: `prod-${orderNumber || orderId}`, // 仮のproductID
          trackingNumber,
          carrier: carrier || 'その他',
          method: shippingMethod || '配送',
          status: 'pending', // ピッキング待ち
          priority: value && value > 500000 ? 'high' : 'normal', // 高額商品は高優先度
          customerName: customer || '顧客名不明',
          address: shippingAddress || '住所不明',
          value: value || 0,
          deadline: estimatedDelivery ? new Date(estimatedDelivery) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3日後がデフォルト
          notes: `セラーがラベル生成 (${carrier}) - ${new Date().toLocaleString()}`
        }
      });
      console.log('新規出荷データを作成しました:', shipment.id);
    }

    // アクティビティログを記録
    await prisma.activity.create({
      data: {
        type: 'shipping_integration',
        description: `セラーのラベル生成により出荷管理に追加されました (追跡番号: ${trackingNumber})`,
        userId: user.id,
        metadata: JSON.stringify({
          orderId,
          orderNumber,
          trackingNumber,
          carrier,
          shipmentId: shipment.id,
          integrationSource: 'seller_label_generation'
        })
      }
    });

    console.log('スタッフ出荷管理への連携完了:', {
      shipmentId: shipment.id,
      trackingNumber,
      status: shipment.status
    });

    return NextResponse.json({
      success: true,
      message: 'スタッフ出荷管理に正常に反映されました',
      data: {
        shipmentId: shipment.id,
        orderId,
        orderNumber,
        trackingNumber,
        carrier,
        status: shipment.status,
        priority: shipment.priority
      }
    });

  } catch (error) {
    console.error('スタッフ出荷管理連携エラー:', error);
    return NextResponse.json(
      { 
        error: 'スタッフ出荷管理への連携に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
}

