'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import UnifiedPageHeader from '@/app/components/ui/UnifiedPageHeader';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { NexusSelect, NexusButton, NexusCard, NexusLoadingSpinner } from '@/app/components/ui';
import HierarchicalChecklistFeatureToggle from '@/app/components/features/settings/HierarchicalChecklistFeatureToggle';

interface AppSettings {
  language: string;
  theme: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  privacy: {
    profileVisibility: string;
    activityTracking: boolean;
  };
  preferences: {
    timezone: string;
    dateFormat: string;
    currency: string;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [userType, setUserType] = useState<'staff' | 'seller'>('seller');
  const [activeTab, setActiveTab] = useState<'settings' | 'notifications' | 'warehouse' | 'account' | 'features'>('notifications');
  
  // 通知設定の状態管理
  const [notificationSettings, setNotificationSettings] = useState<any>({
    product_sold: true,
    inventory_alert: true,
    return_request: true,
    payment_issue: true,
    product_issue: true,
    shipping_issue: true,
    inspection_complete: false,
    payment_received: false,
    report_ready: false,
    system_update: false,
    promotion_available: false,
    monthly_summary: false
  });
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    // 実際の実装はAPIから取得
    const mockSettings: AppSettings = {
      language: 'ja',
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        desktop: false,
      },
      privacy: {
        profileVisibility: 'private',
        activityTracking: true,
      },
      preferences: {
        timezone: 'Asia/Tokyo',
        dateFormat: 'YYYY/MM/DD',
        currency: 'JPY',
      },
    };
    setSettings(mockSettings);

    // 通知設定を取得
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      console.log('🔍 通知設定取得開始');
      setLoadingNotifications(true);
      
      const response = await fetch('/api/user/notification-settings');
      
      console.log('🔍 通知設定API応答:', response.status, response.statusText);
      const data = await response.json();
      console.log('🔍 通知設定データ:', data);
      
      if (response.ok) {
        setNotificationSettings(data.settings);
        setUserType(data.userRole === 'seller' ? 'seller' : 'staff');
        console.log('[SUCCESS] 通知設定取得成功:', data.settings);
      } else {
        console.error('[ERROR] 通知設定取得エラー:', data.error);
      }
    } catch (error) {
      console.error('[ERROR] 通知設定取得エラー:', error);
    } finally {
      setLoadingNotifications(false);
      console.log('[INFO] 通知設定取得処理完了');
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const saveNotificationSettings = async () => {
    try {
      const response = await fetch('/api/user/notification-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: notificationSettings }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast({
          title: '設定保存完了',
          message: '通知設定を保存しました',
          type: 'success'
        });
      } else {
        throw new Error(data.error || '保存に失敗しました');
      }
    } catch (error) {
      console.error('通知設定保存エラー:', error);
      showToast({
        title: '保存失敗',
        message: '通知設定の保存に失敗しました',
        type: 'error'
      });
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <NexusLoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayout userType={userType}>
      <div className="space-y-6">
        {/* 統一ヘッダー */}
        <UnifiedPageHeader
          title="設定"
          subtitle="システム設定とアカウント管理"
          userType={userType}
          iconType="settings"
        />

        {/* タブナビゲーション */}
        <div className="border-b border-nexus-border">
          <nav className="flex space-x-8" aria-label="設定タブ">
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-primary-blue text-primary-blue'
                  : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-nexus-border'
              }`}
            >
              一般設定
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-primary-blue text-primary-blue'
                  : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-nexus-border'
              }`}
            >
              通知設定
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'account'
                  ? 'border-primary-blue text-primary-blue'
                  : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-nexus-border'
              }`}
            >
              アカウント管理
            </button>
          </nav>
        </div>

        {/* 通知設定タブ */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    通知設定
                  </h2>
                  <p className="text-gray-600 mt-1">
                    受信したい通知のタイプを選択してください
                  </p>
                </div>
                <button
                  onClick={saveNotificationSettings}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  設定保存
                </button>
              </div>

              {loadingNotifications ? (
                <div className="flex justify-center py-8">
                  <div className="text-gray-500">読み込み中...</div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* 緊急度の高い通知 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                      緊急通知（推奨：ON）
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      セラーが早急にアクションを起こす必要がある重要な通知です
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">商品購入通知</h4>
                          <p className="text-sm text-gray-600">商品が売れた時の通知</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.product_sold || false}
                          onChange={(e) => handleNotificationChange('product_sold', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">在庫アラート</h4>
                          <p className="text-sm text-gray-600">在庫滞留や在庫切れアラート</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.inventory_alert || false}
                          onChange={(e) => handleNotificationChange('inventory_alert', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">返品処理</h4>
                          <p className="text-sm text-gray-600">返品要求やクレーム</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.return_request || false}
                          onChange={(e) => handleNotificationChange('return_request', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">支払い問題</h4>
                          <p className="text-sm text-gray-600">支払いエラーや未払い</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.payment_issue || false}
                          onChange={(e) => handleNotificationChange('payment_issue', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">商品問題</h4>
                          <p className="text-sm text-gray-600">商品に関する問題やクレーム</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.product_issue || false}
                          onChange={(e) => handleNotificationChange('product_issue', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">配送問題</h4>
                          <p className="text-sm text-gray-600">配送遅延やトラブル</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.shipping_issue || false}
                          onChange={(e) => handleNotificationChange('shipping_issue', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 情報通知 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-5 h-5 text-blue-500">ℹ️</span>
                      情報通知（推奨：お好みで）
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      定期的な確認で十分な情報のみの通知です
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">検品完了</h4>
                          <p className="text-sm text-gray-600">検品完了通知</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.inspection_complete || false}
                          onChange={(e) => handleNotificationChange('inspection_complete', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">入金確認</h4>
                          <p className="text-sm text-gray-600">売上金入金通知</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.payment_received || false}
                          onChange={(e) => handleNotificationChange('payment_received', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">レポート準備</h4>
                          <p className="text-sm text-gray-600">月次レポート等の準備完了</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.report_ready || false}
                          onChange={(e) => handleNotificationChange('report_ready', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">システム更新</h4>
                          <p className="text-sm text-gray-600">システムアップデートやメンテナンス</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.system_update || false}
                          onChange={(e) => handleNotificationChange('system_update', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">プロモーション情報</h4>
                          <p className="text-sm text-gray-600">キャンペーンやプロモーション</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.promotion_available || false}
                          onChange={(e) => handleNotificationChange('promotion_available', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">月次サマリー</h4>
                          <p className="text-sm text-gray-600">月次売上サマリー</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.monthly_summary || false}
                          onChange={(e) => handleNotificationChange('monthly_summary', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 一般設定タブ */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">一般設定</h2>
              
              {/* セラー向け事業者情報 */}
              {userType === 'seller' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">事業者情報</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          事業者番号
                        </label>
                        <input
                          type="text"
                          placeholder="T1234567890123"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          法人番号（法人の場合）
                        </label>
                        <input
                          type="text"
                          placeholder="1234567890123"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          主要取扱カテゴリー
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                          <option value="">選択してください</option>
                          <option value="camera">カメラ・写真機材</option>
                          <option value="watch">腕時計・アクセサリー</option>
                          <option value="electronics">電子機器</option>
                          <option value="fashion">ファッション</option>
                          <option value="collectibles">コレクタブル</option>
                        </select>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          配送元住所
                        </label>
                        <input
                          type="text"
                          placeholder="〒150-0000 東京都渋谷区..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                      設定を保存
                    </button>
                  </div>
                </div>
              )}
              
              {/* スタッフ向け一般設定 */}
              {userType === 'staff' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">システム設定</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          言語
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                          <option value="ja">日本語</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          タイムゾーン
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                          <option value="Asia/Tokyo">Asia/Tokyo</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                      設定を保存
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* アカウント管理タブ */}
        {activeTab === 'account' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">アカウント管理</h2>
              
              <div className="space-y-8">
                {/* プライバシー設定 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">プライバシー設定</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">プロフィール公開設定</h4>
                        <p className="text-sm text-gray-600">他のユーザーへのプロフィール表示</p>
                      </div>
                      <select className="px-3 py-1 border border-gray-300 rounded-lg">
                        <option value="private">非公開</option>
                        <option value="team">チームのみ</option>
                        <option value="public">公開</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">アクティビティ追跡</h4>
                        <p className="text-sm text-gray-600">操作履歴の記録</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                
                {/* データ管理 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">データ管理</h3>
                  <div className="space-y-4">
                    <button className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">データエクスポート</h4>
                          <p className="text-sm text-gray-600">すべてのデータをダウンロード</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </div>
                    </button>
                    
                    {userType === 'seller' && (
                      <button className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">取引履歴ダウンロード</h4>
                            <p className="text-sm text-gray-600">売上・支払い履歴のCSVエクスポート</p>
                          </div>
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* 危険ゾーン */}
                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-4">危険ゾーン</h3>
                  <div className="space-y-4 p-4 border-2 border-red-200 rounded-lg bg-red-50">
                    <button className="w-full text-left p-4 bg-white rounded-lg hover:bg-red-100 transition-colors border border-red-300">
                      <div>
                        <h4 className="font-medium text-red-600">アカウント無効化</h4>
                        <p className="text-sm text-gray-600">一時的にアカウントを無効化します</p>
                      </div>
                    </button>
                    
                    <button className="w-full text-left p-4 bg-white rounded-lg hover:bg-red-100 transition-colors border border-red-300">
                      <div>
                        <h4 className="font-medium text-red-600">アカウント削除</h4>
                        <p className="text-sm text-gray-600">すべてのデータを完全に削除します（復元不可）</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 倉庫管理タブ */}
        {activeTab === 'warehouse' && userType === 'staff' && (
          <div style={{backgroundColor: 'purple', padding: '20px', color: 'white', fontSize: '18px'}}>
            <h2>倉庫管理タブ</h2>
            <p>倉庫管理がここに表示されます</p>
          </div>
        )}

        {/* 機能管理タブ - スタッフのみ */}
        {activeTab === 'features' && userType === 'staff' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-nexus-text-primary">機能管理</h2>
              <p className="text-nexus-text-secondary mt-2">
                新機能の有効/無効を管理できます。変更は即座に反映されます。
              </p>
            </div>
            <HierarchicalChecklistFeatureToggle />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}