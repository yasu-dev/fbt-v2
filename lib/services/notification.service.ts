import { prisma } from '@/lib/database';
import { EmailAdapter, EmailData } from './adapters/email.adapter';

export type NotificationType = 
  | 'product_sold' 
  | 'inventory_alert' 
  | 'return_request' 
  | 'payment_issue' 
  | 'product_issue' 
  | 'shipping_issue'
  | 'inspection_complete' 
  | 'payment_received' 
  | 'report_ready' 
  | 'system_update' 
  | 'promotion_available' 
  | 'monthly_summary';

export interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  metadata?: Record<string, any>;
}

export interface NotificationTemplate {
  subject: string;
  htmlTemplate: string;
  textTemplate: string;
}

export class NotificationService {
  private emailAdapter: EmailAdapter;

  constructor() {
    this.emailAdapter = new EmailAdapter();
  }

  /**
   * 通知を送信
   */
  async sendNotification(data: NotificationData): Promise<boolean> {
    try {
      console.log(`📧 通知送信開始: ${data.type} -> ユーザー: ${data.userId}`);

      // 1. ユーザー情報と通知設定を取得
      const user = await this.getUserWithSettings(data.userId);
      if (!user) {
        console.error('❌ ユーザーが見つかりません:', data.userId);
        return false;
      }

      // 2. 通知設定をチェック
      if (!this.shouldSendNotification(data.type, user.notificationSettings)) {
        console.log(`⏸️  通知設定によりスキップ: ${data.type} for ${user.email}`);
        return true; // エラーではないのでtrue
      }

      // 3. メールテンプレートを生成
      const template = this.generateEmailTemplate(data);
      
      // 4. メール送信データを準備
      const emailData: EmailData = {
        to: user.email,
        subject: template.subject,
        html: template.htmlTemplate,
        text: template.textTemplate
      };

      // 5. メール送信
      const result = await this.emailAdapter.send(emailData);
      
      if (result.success) {
        console.log(`✅ 通知送信成功: ${data.type} -> ${user.email}`);
        
        // 6. 通知履歴を保存（オプション）
        await this.saveNotificationHistory(data, user.email, result.messageId);
        
        return true;
      } else {
        console.error(`❌ 通知送信失敗: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('❌ 通知送信エラー:', error);
      return false;
    }
  }

  /**
   * ユーザー情報と通知設定を取得
   */
  private async getUserWithSettings(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          fullName: true,
          notificationSettings: true
        }
      });

      if (!user) return null;

      // 通知設定をパース（デフォルト設定を適用）
      let settings = this.getDefaultNotificationSettings();
      if (user.notificationSettings) {
        try {
          const parsedSettings = JSON.parse(user.notificationSettings);
          settings = { ...settings, ...parsedSettings };
        } catch (error) {
          console.warn('通知設定のパースエラー、デフォルト設定を使用:', error);
        }
      }

      return {
        email: user.email,
        fullName: user.fullName,
        notificationSettings: settings
      };
    } catch (error) {
      console.error('ユーザー情報取得エラー:', error);
      return null;
    }
  }

  /**
   * デフォルト通知設定
   */
  private getDefaultNotificationSettings() {
    return {
      // 緊急通知（デフォルトON）
      product_sold: true,
      inventory_alert: true,
      return_request: true,
      payment_issue: true,
      product_issue: true,
      shipping_issue: true,
      // 情報通知（デフォルトOFF）
      inspection_complete: false,
      payment_received: false,
      report_ready: false,
      system_update: false,
      promotion_available: false,
      monthly_summary: false
    };
  }

  /**
   * 通知設定に基づいて送信するかどうかを判定
   */
  private shouldSendNotification(type: NotificationType, settings: Record<string, boolean>): boolean {
    return settings[type] === true;
  }

  /**
   * メールテンプレートを生成
   */
  private generateEmailTemplate(data: NotificationData): NotificationTemplate {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';
    
    // 通知タイプ別のテンプレート
    const templates: Record<NotificationType, Partial<NotificationTemplate>> = {
      product_sold: {
        subject: '🎉 商品が売れました！',
        htmlTemplate: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">商品販売通知</h2>
            <p>おめでとうございます！商品が売れました。</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>${data.title}</h3>
              <p>${data.message}</p>
            </div>
            <a href="${baseUrl}/sales" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              売上を確認
            </a>
          </div>
        `
      },
      inventory_alert: {
        subject: '⚠️ 在庫アラート',
        htmlTemplate: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">在庫アラート</h2>
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3>${data.title}</h3>
              <p>${data.message}</p>
            </div>
            <a href="${baseUrl}/inventory" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              在庫を確認
            </a>
          </div>
        `
      },
      return_request: {
        subject: '🔄 返品要求通知',
        htmlTemplate: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d97706;">返品要求</h2>
            <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
              <h3>${data.title}</h3>
              <p>${data.message}</p>
            </div>
            <a href="${baseUrl}/returns" style="background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              返品を確認
            </a>
          </div>
        `
      },
      payment_issue: {
        subject: '💳 支払い問題通知',
        htmlTemplate: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">支払い問題</h2>
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3>${data.title}</h3>
              <p>${data.message}</p>
            </div>
            <a href="${baseUrl}/billing" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              支払いを確認
            </a>
          </div>
        `
      },
      product_issue: {
        subject: '📦 商品問題通知',
        htmlTemplate: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">商品問題</h2>
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3>${data.title}</h3>
              <p>${data.message}</p>
            </div>
            <a href="${baseUrl}/products" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              商品を確認
            </a>
          </div>
        `
      },
      shipping_issue: {
        subject: '🚚 配送問題通知',
        htmlTemplate: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">配送問題</h2>
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3>${data.title}</h3>
              <p>${data.message}</p>
            </div>
            <a href="${baseUrl}/shipping" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              配送を確認
            </a>
          </div>
        `
      },
      inspection_complete: {
        subject: '✅ 検品完了通知',
        htmlTemplate: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">検品完了</h2>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <h3>${data.title}</h3>
              <p>${data.message}</p>
            </div>
            <a href="${baseUrl}/inspection" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              検品結果を確認
            </a>
          </div>
        `
      },
      payment_received: {
        subject: '💰 入金確認通知',
        htmlTemplate: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">入金確認</h2>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <h3>${data.title}</h3>
              <p>${data.message}</p>
            </div>
            <a href="${baseUrl}/billing" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              入金を確認
            </a>
          </div>
        `
      },
      report_ready: {
        subject: '📊 レポート準備完了',
        htmlTemplate: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">レポート準備完了</h2>
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <h3>${data.title}</h3>
              <p>${data.message}</p>
            </div>
            <a href="${baseUrl}/reports" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              レポートを確認
            </a>
          </div>
        `
      },
      system_update: {
        subject: '🔧 システム更新通知',
        htmlTemplate: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">システム更新</h2>
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
              <h3>${data.title}</h3>
              <p>${data.message}</p>
            </div>
          </div>
        `
      },
      promotion_available: {
        subject: '🎁 プロモーション情報',
        htmlTemplate: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ec4899;">プロモーション情報</h2>
            <div style="background: #fdf2f8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ec4899;">
              <h3>${data.title}</h3>
              <p>${data.message}</p>
            </div>
          </div>
        `
      },
      monthly_summary: {
        subject: '📈 月次サマリー',
        htmlTemplate: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">月次サマリー</h2>
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
              <h3>${data.title}</h3>
              <p>${data.message}</p>
            </div>
            <a href="${baseUrl}/reports" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              詳細を確認
            </a>
          </div>
        `
      }
    };

    const template = templates[data.type] || {};
    
    return {
      subject: template.subject || data.title,
      htmlTemplate: template.htmlTemplate || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${data.title}</h2>
          <p>${data.message}</p>
        </div>
      `,
      textTemplate: template.textTemplate || `${data.title}\n\n${data.message}`
    };
  }

  /**
   * 通知履歴を保存
   */
  private async saveNotificationHistory(data: NotificationData, email: string, messageId?: string) {
    try {
      // 将来的な実装: 通知履歴テーブルに保存
      console.log(`💾 通知履歴保存: ${data.type} -> ${email} (MessageID: ${messageId})`);
    } catch (error) {
      console.warn('通知履歴保存エラー:', error);
    }
  }

  /**
   * 複数ユーザーに一斉通知
   */
  async sendBulkNotification(userIds: string[], data: Omit<NotificationData, 'userId'>): Promise<boolean[]> {
    const results = await Promise.all(
      userIds.map(userId => 
        this.sendNotification({ ...data, userId })
      )
    );
    
    const successCount = results.filter(r => r).length;
    console.log(`📊 一斉通知結果: ${successCount}/${userIds.length} 件成功`);
    
    return results;
  }
}

// シングルトンインスタンス
export const notificationService = new NotificationService();
