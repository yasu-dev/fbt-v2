import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

// デフォルトの通知設定
const DEFAULT_NOTIFICATION_SETTINGS = {
  // セラーが早急にアクションを起こす必要がある項目（デフォルト ON）
  product_sold: true,           // 商品が購入された際の通知
  inventory_alert: true,        // 在庫滞留や在庫切れアラート
  return_request: true,         // 返品要求やクレーム
  payment_issue: true,          // 支払いエラーや未払い
  product_issue: true,          // 商品に関する問題やクレーム
  shipping_issue: true,         // 配送遅延やトラブル
  
  // 情報のみの通知（デフォルト OFF）
  inspection_complete: false,   // 検品完了通知
  payment_received: false,      // 売上金入金通知
  report_ready: false,          // レポート準備完了
  system_update: false,         // システムアップデートやメンテナンス
  promotion_available: false,   // プロモーションやキャンペーン情報
  monthly_summary: false,       // 月次売上サマリー
};

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API] 通知設定取得リクエスト開始');
    console.log('🔍 [API] Authorization header:', request.headers.get('authorization'));
    
    // ユーザー認証
    const user = await AuthService.requireRole(request, ['seller', 'staff', 'admin']);
    console.log('🔍 [API] 認証結果:', user ? `${user.username} (${user.role})` : 'null');
    
    if (!user) {
      console.log('❌ [API] 認証失敗');
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    console.log('🔍 [API] データベースからユーザー情報取得開始');
    // ユーザーの通知設定を取得
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { 
        notificationSettings: true,
        role: true
      }
    });

    console.log('🔍 [API] データベース結果:', userData);

    if (!userData) {
      console.log('❌ [API] ユーザーが見つかりません');
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // 保存された設定がない場合はデフォルトを返す
    let settings = DEFAULT_NOTIFICATION_SETTINGS;
    if (userData.notificationSettings) {
      try {
        const parsedSettings = JSON.parse(userData.notificationSettings);
        console.log('🔍 [API] パース済み設定:', parsedSettings);
        // デフォルト設定とマージ（新しい通知タイプに対応）
        settings = { ...DEFAULT_NOTIFICATION_SETTINGS, ...parsedSettings };
      } catch (error) {
        console.warn('⚠️ [API] 通知設定のJSONパースに失敗しました:', error);
      }
    } else {
      console.log('🔄 [API] 保存された設定なし、デフォルト適用');
    }

    console.log('✅ [API] 最終的な設定:', settings);
    
    return NextResponse.json({
      settings,
      userRole: userData.role
    });

  } catch (error) {
    console.error('❌ [API] 通知設定取得エラー:', error);
    return NextResponse.json(
      { error: `通知設定の取得に失敗しました: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // ユーザー認証
    const user = await AuthService.requireRole(request, ['seller', 'staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { settings } = await request.json();

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: '不正な設定データです' },
        { status: 400 }
      );
    }

    // 有効な通知タイプのみを許可
    const validKeys = Object.keys(DEFAULT_NOTIFICATION_SETTINGS);
    const sanitizedSettings: Record<string, boolean> = {};
    
    for (const key of validKeys) {
      sanitizedSettings[key] = Boolean(settings[key]);
    }

    // データベースに保存
    await prisma.user.update({
      where: { id: user.id },
      data: {
        notificationSettings: JSON.stringify(sanitizedSettings)
      }
    });

    console.log(`ユーザー ${user.username} の通知設定を更新:`, sanitizedSettings);

    return NextResponse.json({
      success: true,
      settings: sanitizedSettings,
      message: '通知設定を保存しました'
    });

  } catch (error) {
    console.error('通知設定保存エラー:', error);
    return NextResponse.json(
      { error: '通知設定の保存に失敗しました' },
      { status: 500 }
    );
  }
}

