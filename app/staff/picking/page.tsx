'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import UnifiedPageHeader from '@/app/components/ui/UnifiedPageHeader';
import PickingListManager from '@/app/components/features/picking/PickingListManager';
import PickingProgress from '@/app/components/features/picking/PickingProgress';
import PickingHistory from '@/app/components/features/picking/PickingHistory';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

interface PickingStats {
  totalProducts: number;
  pendingProducts: number;
  readyForPackingProducts: number;
  completedProducts: number;
  combinableGroups: number;
}

export default function PickingPage() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<'active' | 'progress' | 'history'>('active');
  const [stats, setStats] = useState<PickingStats>({
    totalProducts: 0,
    pendingProducts: 0,
    readyForPackingProducts: 0,
    completedProducts: 0,
    combinableGroups: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  useEffect(() => {
    fetchPickingStats();
    
    // ロケーション一覧から遷移してきた場合
    if (searchParams.get('from') === 'location') {
      setShowWelcomeMessage(true);
      showToast({
        type: 'info',
        title: 'ピッキングリスト作成済み',
        message: '作成したピッキングリストが下部に表示されています。商品を選択してピッキングを開始してください。',
        duration: 5000
      });
    }
  }, [searchParams]);

  const fetchPickingStats = async () => {
    try {
      const response = await fetch('/api/picking');
      const result = await response.json();
      
      if (result.success && result.stats) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error fetching picking stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userType="staff">
        <div className="space-y-6">
          <div className="intelligence-card global">
            <div className="p-8">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-12 w-12 border-b-4 border-nexus-yellow rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const headerActions = (
    <button className="nexus-button primary">
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
      </svg>
      バーコードスキャン
    </button>
  );

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* 統一ヘッダー */}
        <UnifiedPageHeader
          title="ピッキングリスト"
          subtitle="eBay購入商品の効率的なピッキング管理"
          userType="staff"
          iconType="picking"
          actions={headerActions}
        />

        {/* Welcome Message for Location Flow */}
        {showWelcomeMessage && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="action-orb blue flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">ピッキングリストが作成されました</h3>
                <p className="text-blue-800 mb-3">
                  ロケーション一覧から作成したピッキングリストが下部の「アクティブなピッキング」セクションに表示されています。
                </p>
                <div className="bg-white/60 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">🔄 作業フロー</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                    <li>下部のリストから商品を選択（チェックボックス）</li>
                    <li>「ピッキング開始」ボタンをクリック</li>
                    <li>指定されたロケーションから商品を物理的にピッキング</li>
                    <li>バーコードスキャンで確認後、梱包作業へ</li>
                  </ol>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button 
                    onClick={() => setShowWelcomeMessage(false)}
                    className="text-sm text-blue-700 hover:text-blue-800 underline"
                  >
                    このメッセージを閉じる
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="intelligence-card global">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-nexus-text-secondary">ピッキング待ち</p>
                  <p className="text-2xl font-display font-bold text-nexus-text-primary">
                    {stats.pendingProducts}
                  </p>
                </div>
                <div className="action-orb yellow">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="intelligence-card global">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-nexus-text-secondary">梱包待ち</p>
                  <p className="text-2xl font-display font-bold text-nexus-text-primary">
                    {stats.readyForPackingProducts}
                  </p>
                </div>
                <div className="action-orb blue">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="intelligence-card global">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-nexus-text-secondary">出荷完了</p>
                  <p className="text-2xl font-display font-bold text-nexus-text-primary">
                    {stats.completedProducts}
                  </p>
                </div>
                <div className="action-orb green">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="intelligence-card global">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-nexus-text-secondary">同梱可能グループ</p>
                  <p className="text-2xl font-display font-bold text-nexus-text-primary">
                    {stats.combinableGroups}
                  </p>
                </div>
                <div className="action-orb">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="flex space-x-1 bg-nexus-bg-secondary p-1 rounded-lg mb-4 sm:mb-6">
              {[
                { 
                  key: 'active', 
                  label: 'ピッキングリスト', 
                  icon: (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
                    </svg>
                  )
                },
                { 
                  key: 'progress', 
                  label: '進行状況', 
                  icon: (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                },
                { 
                  key: 'history', 
                  label: '完了履歴', 
                  icon: (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setViewMode(tab.key as any)}
                  className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 ${
                    viewMode === tab.key
                      ? 'bg-nexus-bg-primary text-nexus-yellow shadow-sm'
                      : 'text-nexus-text-secondary hover:text-nexus-text-primary'
                  }`}
                >
                  <div className="text-blue-600">{tab.icon}</div>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.slice(0, 2)}</span>
                </button>
              ))}
            </div>

            {/* Content based on view mode */}
            {viewMode === 'active' && <PickingListManager />}
            {viewMode === 'progress' && <PickingProgress />}
            {viewMode === 'history' && <PickingHistory />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 