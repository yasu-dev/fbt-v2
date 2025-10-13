import { PrismaClient } from '@prisma/client';
import { prisma } from './database';

export interface ActivityMetadata {
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  sessionId?: string;
  oldValue?: any;
  newValue?: any;
  [key: string]: any;
}

export interface ActivityOptions {
  type: string;
  description: string;
  userId?: string;
  productId?: string;
  orderId?: string;
  metadata?: ActivityMetadata;
}

export class ActivityLogger {
  /**
   * 活動ログを記録する
   */
  static async log(options: ActivityOptions): Promise<void> {
    try {
      await prisma.activity.create({
        data: {
          type: options.type,
          description: options.description,
          userId: options.userId || null,
          productId: options.productId || null,
          orderId: options.orderId || null,
          metadata: options.metadata ? JSON.stringify(options.metadata) : null,
        },
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
      // 活動ログの記録は失敗してもメイン処理は継続する
    }
  }

  /**
   * 認証関連の活動を記録する
   */
  static async logAuth(
    type: 'login' | 'logout' | 'login_failed',
    userId: string | null,
    metadata: ActivityMetadata = {}
  ): Promise<void> {
    const descriptions = {
      login: 'ユーザーがログインしました',
      logout: 'ユーザーがログアウトしました',
      login_failed: 'ログイン試行が失敗しました',
    };

    await this.log({
      type: `auth_${type}`,
      description: descriptions[type],
      userId,
      metadata,
    });
  }

  /**
   * データ変更の活動を記録する
   */
  static async logDataChange(
    entity: 'product' | 'order' | 'inventory' | 'setting',
    action: 'create' | 'update' | 'delete',
    entityId: string,
    userId: string | null,
    changes: { oldValue?: any; newValue?: any },
    metadata: ActivityMetadata = {}
  ): Promise<void> {
    const actionDescriptions = {
      create: '作成',
      update: '更新',
      delete: '削除',
    };

    const entityDescriptions = {
      product: '商品',
      order: '注文',
      inventory: '在庫',
      setting: '設定',
    };

    const description = `${entityDescriptions[entity]}が${actionDescriptions[action]}されました`;

    const logMetadata: ActivityMetadata = {
      ...metadata,
      oldValue: changes.oldValue,
      newValue: changes.newValue,
      entityType: entity,
      action,
      entityId,
    };

    await this.log({
      type: `${entity}_${action}`,
      description,
      userId,
      productId: entity === 'product' ? entityId : undefined,
      orderId: entity === 'order' ? entityId : undefined,
      metadata: logMetadata,
    });
  }

  /**
   * 商品の状態変更を記録する
   */
  static async logProductStatusChange(
    productId: string,
    oldStatus: string,
    newStatus: string,
    userId: string | null,
    metadata: ActivityMetadata = {}
  ): Promise<void> {
    await this.logDataChange(
      'product',
      'update',
      productId,
      userId,
      {
        oldValue: { status: oldStatus },
        newValue: { status: newStatus },
      },
      {
        ...metadata,
        field: 'status',
        changeType: 'status_change',
      }
    );
  }

  /**
   * 商品の価格変更を記録する
   */
  static async logProductPriceChange(
    productId: string,
    oldPrice: number,
    newPrice: number,
    userId: string | null,
    metadata: ActivityMetadata = {}
  ): Promise<void> {
    await this.logDataChange(
      'product',
      'update',
      productId,
      userId,
      {
        oldValue: { price: oldPrice },
        newValue: { price: newPrice },
      },
      {
        ...metadata,
        field: 'price',
        changeType: 'price_change',
      }
    );
  }

  /**
   * 在庫移動を記録する
   */
  static async logInventoryMovement(
    productId: string,
    fromLocation: string | null,
    toLocation: string | null,
    userId: string | null,
    metadata: ActivityMetadata = {}
  ): Promise<void> {
    await this.log({
      type: 'inventory_movement',
      description: `在庫が移動されました: ${fromLocation || '未設定'} → ${toLocation || '未設定'}`,
      userId,
      productId,
      metadata: {
        ...metadata,
        fromLocation,
        toLocation,
        changeType: 'location_change',
      },
    });
  }

  /**
   * 注文の状態変更を記録する
   */
  static async logOrderStatusChange(
    orderId: string,
    oldStatus: string,
    newStatus: string,
    userId: string | null,
    metadata: ActivityMetadata = {}
  ): Promise<void> {
    await this.logDataChange(
      'order',
      'update',
      orderId,
      userId,
      {
        oldValue: { status: oldStatus },
        newValue: { status: newStatus },
      },
      {
        ...metadata,
        field: 'status',
        changeType: 'status_change',
      }
    );
  }

  /**
   * システム設定の変更を記録する
   */
  static async logSystemSettingChange(
    settingKey: string,
    oldValue: string,
    newValue: string,
    userId: string | null,
    metadata: ActivityMetadata = {}
  ): Promise<void> {
    await this.logDataChange(
      'setting',
      'update',
      settingKey,
      userId,
      {
        oldValue: { [settingKey]: oldValue },
        newValue: { [settingKey]: newValue },
      },
      {
        ...metadata,
        settingKey,
        changeType: 'setting_change',
      }
    );
  }

  /**
   * リクエストからメタデータを抽出する
   */
  static extractMetadataFromRequest(request: Request): ActivityMetadata {
    const headers = request.headers;
    
    return {
      ipAddress: headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown',
      userAgent: headers.get('user-agent') || 'unknown',
      referer: headers.get('referer') || undefined,
      timestamp: new Date().toISOString(),
    };
  }
}