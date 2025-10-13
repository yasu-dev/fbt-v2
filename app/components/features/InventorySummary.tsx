'use client';

import { useState, useEffect } from 'react';
import { ApiClient, API_CONFIG } from '@/lib/api-config';

interface InventoryStats {
  statusStats: Record<string, number>;
  categoryStats: Record<string, number>;
  totalValue: number;
  totalItems: number;
}

export default function InventorySummary() {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const data = await ApiClient.get<any>(API_CONFIG.endpoints.inventory.stats);
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch inventory stats:', err);
      setError('在庫統計の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // 30秒ごとに自動更新
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="intelligence-card global">
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-3"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="intelligence-card global">
        <div className="p-8">
          <div className="text-red-500 text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm">{error}</p>
            <button 
              onClick={fetchStats}
              className="mt-3 nexus-button primary text-xs px-3 py-1.5"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case '入庫': return 'bg-blue-500';
      case '検品': return 'bg-yellow-500';
      case '保管': return 'bg-green-500';
      case '出品': return 'bg-nexus-blue';
      case '受注': return 'bg-orange-500';
      case '出荷': return 'bg-indigo-500';
      case '配送': return 'bg-cyan-500';
      case '購入者決定': return 'bg-gray-500';
      case '返品': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'カメラ本体':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'レンズ':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12a3 3 0 106 0 3 3 0 00-6 0z" />
          </svg>
        );
      case '腕時計':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'アクセサリ':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Overall Stats */}
      <div className="intelligence-card global">
        <div className="p-8">
          <div className="mb-3">
            <h3 className="text-lg font-display font-bold text-nexus-text-primary">在庫サマリー</h3>
            <p className="text-nexus-text-secondary mt-0.5 text-xs">リアルタイム在庫状況</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="intelligence-card americas">
              <div className="p-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="action-orb blue w-8 h-8">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="status-badge info text-[10px] px-1.5 py-0.5">総計</span>
                </div>
                <div className="metric-value font-display text-xl font-bold text-nexus-text-primary">
                  {stats.totalItems.toLocaleString()}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 text-xs">
                  総在庫数
                </div>
              </div>
            </div>

            <div className="intelligence-card europe">
              <div className="p-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="action-orb green w-8 h-8">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge success text-[10px] px-1.5 py-0.5">価値</span>
                </div>
                <div className="metric-value font-display text-xl font-bold text-nexus-text-primary">
                  ¥{stats.totalValue.toLocaleString()}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 text-xs">
                  総在庫価値
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="intelligence-card global">
        <div className="p-8">
          <div className="mb-3">
            <h3 className="text-base font-display font-bold text-nexus-text-primary">ステータス別在庫</h3>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {Object.entries(stats.statusStats).map(([status, count]) => (
              <div key={status} className="intelligence-card americas">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`}></div>
                    <span className="text-base font-display font-bold text-nexus-text-primary">
                      {count}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-nexus-text-secondary">
                    {status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="intelligence-card global">
        <div className="p-8">
          <div className="mb-3">
            <h3 className="text-base font-display font-bold text-nexus-text-primary">カテゴリー別在庫</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(stats.categoryStats).map(([category, count]) => (
              <div key={category} className="intelligence-card asia">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-2">
                    <div className="action-orb w-7 h-7">
                      {getCategoryIcon(category)}
                    </div>
                    <span className="text-lg font-display font-bold text-nexus-text-primary">
                      {count}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-nexus-text-secondary">
                    {category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="text-center text-nexus-text-muted text-[10px]">
        <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        30秒ごとに自動更新
      </div>
    </div>
  );
}