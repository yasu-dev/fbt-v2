import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ActivityMetadata {
  previousValue?: string | number;
  newValue?: string | number;
  location?: string;
  condition?: string;
  price?: number;
  marketplace?: string;
  reason?: string;
  notes?: string;
  [key: string]: any;
}

export interface ActivityRecord {
  type: string;
  description: string;
  userId?: string;
  productId?: string;
  orderId?: string;
  metadata?: ActivityMetadata;
}

/**
 * Activity記録の標準化されたヘルパー関数
 */
export class ActivityRecorder {
  /**
   * 商品入庫時のActivity記録
   */
  static async recordProductReceived(
    productId: string,
    userId: string,
    metadata?: ActivityMetadata
  ) {
    return await this.createActivity({
      type: 'product_received',
      description: '商品が入庫されました',
      userId,
      productId,
      metadata: {
        location: metadata?.location,
        condition: metadata?.condition,
        notes: metadata?.notes,
        ...metadata
      }
    });
  }

  /**
   * 検品開始時のActivity記録
   */
  static async recordInspectionStarted(
    productId: string,
    userId: string,
    metadata?: ActivityMetadata
  ) {
    return await this.createActivity({
      type: 'inspection_started',
      description: '検品作業を開始しました',
      userId,
      productId,
      metadata: {
        startedAt: new Date().toISOString(),
        ...metadata
      }
    });
  }

  /**
   * 検品完了時のActivity記録
   */
  static async recordInspectionCompleted(
    productId: string,
    userId: string,
    metadata?: ActivityMetadata
  ) {
    return await this.createActivity({
      type: 'inspection_completed',
      description: '検品作業が完了しました',
      userId,
      productId,
      metadata: {
        completedAt: new Date().toISOString(),
        condition: metadata?.condition,
        notes: metadata?.notes,
        ...metadata
      }
    });
  }

  /**
   * 撮影開始時のActivity記録
   */
  static async recordPhotographyStarted(
    productId: string,
    userId: string,
    metadata?: ActivityMetadata
  ) {
    return await this.createActivity({
      type: 'photography_started',
      description: '商品撮影を開始しました',
      userId,
      productId,
      metadata: {
        startedAt: new Date().toISOString(),
        ...metadata
      }
    });
  }

  /**
   * 撮影完了時のActivity記録
   */
  static async recordPhotographyCompleted(
    productId: string,
    userId: string,
    metadata?: ActivityMetadata
  ) {
    return await this.createActivity({
      type: 'photography_completed',
      description: '商品撮影が完了しました',
      userId,
      productId,
      metadata: {
        completedAt: new Date().toISOString(),
        imageCount: metadata?.imageCount,
        ...metadata
      }
    });
  }

  /**
   * 出品開始時のActivity記録
   */
  static async recordListingStarted(
    productId: string,
    userId: string,
    metadata?: ActivityMetadata
  ) {
    return await this.createActivity({
      type: 'listing_started',
      description: '商品出品を開始しました',
      userId,
      productId,
      metadata: {
        marketplace: metadata?.marketplace,
        price: metadata?.price,
        ...metadata
      }
    });
  }

  /**
   * 出品完了時のActivity記録
   */
  static async recordListingCompleted(
    productId: string,
    userId: string,
    metadata?: ActivityMetadata
  ) {
    return await this.createActivity({
      type: 'listing_completed',
      description: '商品出品が完了しました',
      userId,
      productId,
      metadata: {
        marketplace: metadata?.marketplace,
        price: metadata?.price,
        listingUrl: metadata?.listingUrl,
        ...metadata
      }
    });
  }

  /**
   * 価格変更時のActivity記録
   */
  static async recordPriceUpdated(
    productId: string,
    userId: string,
    previousPrice: number,
    newPrice: number,
    metadata?: ActivityMetadata
  ) {
    return await this.createActivity({
      type: 'price_updated',
      description: `価格を ¥${previousPrice.toLocaleString()} から ¥${newPrice.toLocaleString()} に変更しました`,
      userId,
      productId,
      metadata: {
        previousPrice,
        newPrice,
        reason: metadata?.reason,
        ...metadata
      }
    });
  }

  /**
   * ステータス更新時のActivity記録
   */
  static async recordStatusUpdated(
    productId: string,
    userId: string,
    previousStatus: string,
    newStatus: string,
    metadata?: ActivityMetadata
  ) {
    const statusMap: { [key: string]: string } = {
      'inbound': '入庫',
      'inspection': '検品',
      'storage': '保管',
      'listing': '出品',
      'ordered': '受注',
      'shipping': '出荷',
      'delivery': '配送',
      'sold': '売約済み',
      'returned': '返品',
      'cancelled': 'キャンセル'
    };

    return await this.createActivity({
      type: 'status_updated',
      description: `ステータスを ${statusMap[previousStatus] || previousStatus} から ${statusMap[newStatus] || newStatus} に更新しました`,
      userId,
      productId,
      metadata: {
        previousStatus,
        newStatus,
        reason: metadata?.reason,
        ...metadata
      }
    });
  }

  /**
   * ロケーション移動時のActivity記録
   */
  static async recordLocationMoved(
    productId: string,
    userId: string,
    fromLocation: string,
    toLocation: string,
    metadata?: ActivityMetadata
  ) {
    return await this.createActivity({
      type: 'location_moved',
      description: `ロケーションを ${fromLocation} から ${toLocation} に移動しました`,
      userId,
      productId,
      metadata: {
        fromLocation,
        toLocation,
        reason: metadata?.reason,
        ...metadata
      }
    });
  }

  /**
   * 注文受付時のActivity記録
   */
  static async recordOrderReceived(
    productId: string,
    orderId: string,
    metadata?: ActivityMetadata
  ) {
    return await this.createActivity({
      type: 'order_received',
      description: '商品が注文されました',
      productId,
      orderId,
      metadata: {
        orderNumber: metadata?.orderNumber,
        customerName: metadata?.customerName,
        totalAmount: metadata?.totalAmount,
        ...metadata
      }
    });
  }

  /**
   * 発送完了時のActivity記録
   */
  static async recordOrderShipped(
    productId: string,
    orderId: string,
    metadata?: ActivityMetadata
  ) {
    return await this.createActivity({
      type: 'order_shipped',
      description: '商品が発送されました',
      productId,
      orderId,
      metadata: {
        trackingNumber: metadata?.trackingNumber,
        carrier: metadata?.carrier,
        shippedAt: new Date().toISOString(),
        ...metadata
      }
    });
  }

  /**
   * 配送完了時のActivity記録
   */
  static async recordOrderDelivered(
    productId: string,
    orderId: string,
    metadata?: ActivityMetadata
  ) {
    return await this.createActivity({
      type: 'order_delivered',
      description: '商品が配送完了しました',
      productId,
      orderId,
      metadata: {
        deliveredAt: new Date().toISOString(),
        ...metadata
      }
    });
  }

  /**
   * 返品受付時のActivity記録
   */
  static async recordProductReturned(
    productId: string,
    orderId: string,
    userId: string,
    metadata?: ActivityMetadata
  ) {
    return await this.createActivity({
      type: 'product_returned',
      description: '商品の返品を受け付けました',
      userId,
      productId,
      orderId,
      metadata: {
        returnReason: metadata?.reason,
        condition: metadata?.condition,
        refundAmount: metadata?.refundAmount,
        ...metadata
      }
    });
  }

  /**
   * 商品キャンセル時のActivity記録
   */
  static async recordProductCancelled(
    productId: string,
    userId: string,
    metadata?: ActivityMetadata
  ) {
    return await this.createActivity({
      type: 'product_cancelled',
      description: '商品がキャンセルされました',
      userId,
      productId,
      metadata: {
        reason: metadata?.reason,
        cancelledAt: new Date().toISOString(),
        ...metadata
      }
    });
  }

  /**
   * 基本のActivity作成関数
   */
  private static async createActivity(record: ActivityRecord) {
    try {
      const activity = await prisma.activity.create({
        data: {
          type: record.type,
          description: record.description,
          userId: record.userId || null,
          productId: record.productId || null,
          orderId: record.orderId || null,
          metadata: record.metadata ? JSON.stringify(record.metadata) : null
        },
        include: {
          user: {
            select: { id: true, username: true, email: true }
          },
          product: {
            select: { id: true, name: true, sku: true }
          }
        }
      });

      console.log(`[ActivityRecorder] Activity recorded: ${record.type} for product ${record.productId}`);
      return activity;
    } catch (error) {
      console.error('[ActivityRecorder] Failed to create activity:', error);
      throw error;
    }
  }

  /**
   * 商品に関連するすべてのActivity記録を取得
   */
  static async getProductActivities(productId: string) {
    return await prisma.activity.findMany({
      where: { productId },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  /**
   * Activity記録の統計情報を取得
   */
  static async getActivityStats(productId: string) {
    const activities = await this.getProductActivities(productId);
    
    const stats = {
      totalActivities: activities.length,
      lastActivity: activities[activities.length - 1],
      activityTypes: activities.reduce((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number }),
      timeline: activities.map(activity => ({
        date: activity.createdAt,
        type: activity.type,
        description: activity.description,
        user: activity.user?.username || 'システム'
      }))
    };

    return stats;
  }
}