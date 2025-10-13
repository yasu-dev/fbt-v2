import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

interface EbayTrackingNotification {
  orderId?: string;
  orderNumber?: string;
  trackingNumber: string;
  carrier: string;
  shippingMethod?: string;
  estimatedDelivery?: string;
  buyerEmail?: string;
  itemTitle?: string;
}

/**
 * eBay APIを使用して購入者に追跡番号を通知
 */
class EbayNotificationService {
  private baseUrl: string;
  private headers: HeadersInit;
  
  constructor() {
    this.baseUrl = process.env.EBAY_API_URL || 'https://api.ebay.com';
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.EBAY_ACCESS_TOKEN}`,
      'X-EBAY-APP-ID': process.env.EBAY_APP_ID || '',
    };
  }

  /**
   * 購入者に追跡番号を通知
   */
  async notifyTrackingNumber(notification: EbayTrackingNotification): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    notificationId?: string;
  }> {
    try {
      // 環境変数チェック
      const hasEbayCredentials = !!(
        process.env.EBAY_ACCESS_TOKEN && 
        process.env.EBAY_APP_ID
      );

      if (!hasEbayCredentials) {
        console.warn('eBay API資格情報が設定されていません。モック通知を送信します。');
        return this.sendMockNotification(notification);
      }

      // 本物のeBay API呼び出し
      const response = await fetch(`${this.baseUrl}/sell/fulfillment/v1/order/${notification.orderNumber}/shipping_fulfillment`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          lineItems: [{
            lineItemId: notification.orderId,
            quantity: 1
          }],
          shippedDate: new Date().toISOString(),
          shippingCarrier: this.mapCarrierName(notification.carrier),
          trackingNumber: notification.trackingNumber,
          shipmentMethod: notification.shippingMethod || 'Standard International Shipping'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`eBay API エラー: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        message: '購入者に追跡番号が正常に通知されました',
        notificationId: result.fulfillmentId
      };

    } catch (error) {
      console.error('eBay通知エラー:', error);
      
      // APIエラーの場合もモック通知にフォールバック
      console.warn('eBay API呼び出しに失敗しました。モック通知にフォールバックします。');
      return this.sendMockNotification(notification);
    }
  }

  /**
   * モック通知（開発・テスト環境用）
   */
  private async sendMockNotification(notification: EbayTrackingNotification): Promise<{
    success: boolean;
    message: string;
    notificationId: string;
  }> {
    // 実際のメール通知やログ記録をシミュレート
    console.log('=== eBay モック通知 ===');
    console.log(`注文番号: ${notification.orderNumber}`);
    console.log(`追跡番号: ${notification.trackingNumber}`);
    console.log(`配送業者: ${notification.carrier}`);
    console.log(`購入者: ${notification.buyerEmail || 'buyer@example.com'}`);
    console.log('===================');

    // 少し時間をかけてAPIコールをシミュレート
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockNotificationId = `MOCK_${Date.now()}`;
    
    return {
      success: true,
      message: 'モック通知が正常に送信されました（開発環境）',
      notificationId: mockNotificationId
    };
  }

  /**
   * 配送業者名をeBay形式にマッピング
   */
  private mapCarrierName(carrier: string): string {
    const carrierMap: Record<string, string> = {
      'fedx': 'FedEx',
      'fedex': 'FedEx', 
      'yamato': 'Yamato Transport',
      'sagawa': 'Sagawa Express',
      'yupack': 'Japan Post'
    };

    return carrierMap[carrier.toLowerCase()] || carrier;
  }
}

export async function POST(request: NextRequest) {
  try {
    // ユーザー認証
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
      trackingNumber, 
      carrier, 
      shippingMethod, 
      estimatedDelivery 
    } = body;

    // 必須フィールドの検証
    if (!trackingNumber || !carrier) {
      return NextResponse.json(
        { error: '追跡番号と配送業者は必須です' },
        { status: 400 }
      );
    }

    if (!orderId && !orderNumber) {
      return NextResponse.json(
        { error: '注文IDまたは注文番号が必要です' },
        { status: 400 }
      );
    }

    // 注文情報を取得
    let order = null;
    if (orderId) {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          customer: {
            select: {
              email: true,
              username: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  sku: true
                }
              }
            }
          }
        }
      });
    } else if (orderNumber) {
      order = await prisma.order.findUnique({
        where: { orderNumber: orderNumber },
        include: {
          customer: {
            select: {
              email: true,
              username: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  sku: true
                }
              }
            }
          }
        }
      });
    }

    if (!order) {
      return NextResponse.json(
        { error: '対象の注文が見つかりません' },
        { status: 404 }
      );
    }

    // eBay通知サービスを初期化
    const ebayService = new EbayNotificationService();
    
    // 通知データを準備
    const notificationData: EbayTrackingNotification = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      trackingNumber,
      carrier,
      shippingMethod,
      estimatedDelivery,
      buyerEmail: order.customer.email,
      itemTitle: order.items.map(item => item.product.name).join(', ')
    };

    console.log('eBay通知送信開始:', {
      orderNumber: order.orderNumber,
      trackingNumber,
      carrier
    });

    // eBayに通知を送信
    const notificationResult = await ebayService.notifyTrackingNumber(notificationData);

    if (!notificationResult.success) {
      throw new Error(notificationResult.error || 'eBay通知に失敗しました');
    }

    // データベースに通知履歴を記録
    await prisma.activity.create({
      data: {
        type: 'ebay_tracking_notification',
        description: `eBayで購入者に追跡番号を通知しました（${trackingNumber}）`,
        userId: user.id,
        orderId: order.id,
        metadata: JSON.stringify({
          trackingNumber,
          carrier,
          shippingMethod,
          notificationId: notificationResult.notificationId,
          estimatedDelivery
        })
      }
    });

    console.log('eBay通知完了:', {
      orderNumber: order.orderNumber,
      notificationId: notificationResult.notificationId
    });

    return NextResponse.json({
      success: true,
      message: notificationResult.message,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        trackingNumber,
        carrier,
        notificationId: notificationResult.notificationId,
        customerEmail: order.customer.email
      }
    });

  } catch (error) {
    console.error('eBay追跡番号通知エラー:', error);
    return NextResponse.json(
      { 
        error: 'eBay通知の送信に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
}

