'use client';

import { useState, useEffect } from 'react';
import { NexusButton, NexusCard } from '../../ui';
import BaseModal from '../../ui/BaseModal';

interface SellerMetrics {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    target: number;
    targetProgress: number;
  };
  inventory: {
    totalValue: number;
    turnoverRate: number;
    averageDays: number;
    fastMoving: number;
    slowMoving: number;
  };
  performance: {
    listingSuccess: number;
    conversionRate: number;
    averagePrice: number;
    topCategory: string;
  };
  transactions: {
    count: number;
    volume: number;
    regions: RegionData[];
  };
}

interface RegionData {
  name: string;
  sales: number;
  growth: number;
  orders: number;
  percentage: number;
}

interface CategoryData {
  name: string;
  sales: number;
  items: number;
  avgPrice: number;
  growth: number;
  margin: number;
}

interface TimeSeriesData {
  date: string;
  sales: number;
  orders: number;
  conversion: number;
}

export default function SellerAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<SellerMetrics | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [drilldownData, setDrilldownData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // 実際のAPIからデータを取得
      const response = await fetch('/api/analytics/seller');
      if (!response.ok) {
        throw new Error('データの取得に失敗しました');
      }
      const data = await response.json();
      
      // APIレスポンスを既存のインターフェースに合わせて変換
      const transformedMetrics: SellerMetrics = {
        revenue: data.revenue,
        inventory: data.inventory,
        performance: data.performance,
        transactions: data.transactions
      };
      
      setMetrics(transformedMetrics);
      setCategoryData(data.categories);
      setTimeSeriesData(data.timeSeries);
    } catch (error) {
      console.error('Analytics data fetch error:', error);
      
      // エラー時はフォールバックのモックデータを使用
      const fallbackMetrics: SellerMetrics = {
        revenue: {
          total: 0,
          thisMonth: 0,
          lastMonth: 0,
          growth: 0,
          target: 5000000,
          targetProgress: 0
        },
        inventory: {
          totalValue: 0,
          turnoverRate: 0,
          averageDays: 0,
          fastMoving: 0,
          slowMoving: 0
        },
        performance: {
          listingSuccess: 0,
          conversionRate: 0,
          averagePrice: 0,
          topCategory: 'データなし'
        },
        transactions: {
          count: 0,
          volume: 0,
          regions: []
        }
      };
      
      setMetrics(fallbackMetrics);
      setCategoryData([]);
      setTimeSeriesData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDrilldown = (metric: string, data: any) => {
    setSelectedMetric(metric);
    setDrilldownData(data);
    setIsModalOpen(true);
  };

  const exportData = () => {
    if (!metrics) return;
    
    const exportData = {
      summary: {
        period: timeRange,
        totalRevenue: metrics.revenue.total,
        growth: metrics.revenue.growth,
        inventoryTurnover: metrics.inventory.turnoverRate
      },
      categories: categoryData,
      regions: metrics.transactions.regions,
      timeSeries: timeSeriesData,
      generatedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `seller-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="intelligence-card global">
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="intelligence-card global">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-display font-bold text-nexus-text-primary">
                セラー実績分析ダッシュボード
              </h2>
              <p className="text-nexus-text-secondary mt-2">
                売上、在庫、パフォーマンスの詳細分析とドリルダウン
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-nexus-bg-secondary rounded-lg p-1">
                {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      timeRange === range
                        ? 'bg-white text-primary-blue shadow-sm'
                        : 'text-nexus-text-secondary hover:text-nexus-text-primary'
                    }`}
                  >
                    {range === 'week' ? '週' : range === 'month' ? '月' : range === 'quarter' ? '四半期' : '年'}
                  </button>
                ))}
              </div>
              <NexusButton onClick={exportData} variant="primary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                データエクスポート
              </NexusButton>
            </div>
          </div>
        </div>
      </div>

      {/* キーメトリクス */}
      <div className="intelligence-metrics">
        <div className="unified-grid-4">
          {/* 売上成長率 */}
          <div className="intelligence-card americas cursor-pointer" onClick={() => handleDrilldown('revenue', metrics.revenue)}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-2">
                <div className="action-orb blue w-8 h-8">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="status-badge success text-xs px-2 py-1">+{metrics.revenue.growth}%</span>
              </div>
              <div className="metric-value font-display text-2xl font-bold text-nexus-text-primary">
                ¥{(metrics.revenue.total / 10000).toFixed(0)}万
              </div>
              <div className="metric-label text-nexus-text-secondary font-medium mt-1 text-sm">
                総売上高
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-nexus-text-secondary">目標達成率</span>
                <span className="font-medium text-nexus-text-primary">{metrics.revenue.targetProgress}%</span>
              </div>
              <div className="mt-1 w-full bg-nexus-bg-secondary rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(metrics.revenue.targetProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* 在庫効率 */}
          <div className="intelligence-card europe cursor-pointer" onClick={() => handleDrilldown('inventory', metrics.inventory)}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-2">
                <div className="action-orb green w-8 h-8">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <span className="status-badge info text-xs px-2 py-1">最適</span>
              </div>
              <div className="metric-value font-display text-2xl font-bold text-nexus-text-primary">
                {metrics.inventory.turnoverRate}回
              </div>
              <div className="metric-label text-nexus-text-secondary font-medium mt-1 text-sm">
                在庫回転率
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-nexus-text-secondary">平均日数</span>
                  <div className="font-medium text-nexus-text-primary">{metrics.inventory.averageDays}日</div>
                </div>
                <div>
                  <span className="text-nexus-text-secondary">滞留在庫</span>
                  <div className="font-medium text-red-600">{metrics.inventory.slowMoving}件</div>
                </div>
              </div>
            </div>
          </div>

          {/* パフォーマンス */}
          <div className="intelligence-card asia cursor-pointer" onClick={() => handleDrilldown('performance', metrics.performance)}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-2">
                <div className="action-orb w-8 h-8">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="status-badge success text-xs px-2 py-1">優良</span>
              </div>
              <div className="metric-value font-display text-2xl font-bold text-nexus-text-primary">
                {metrics.performance.conversionRate}%
              </div>
              <div className="metric-label text-nexus-text-secondary font-medium mt-1 text-sm">
                コンバージョン率
              </div>
              <div className="mt-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-nexus-text-secondary">出品成功率</span>
                  <span className="font-medium text-nexus-text-primary">{metrics.performance.listingSuccess}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-nexus-text-secondary">平均価格</span>
                  <span className="font-medium text-nexus-text-primary">¥{(metrics.performance.averagePrice / 1000).toFixed(0)}K</span>
                </div>
              </div>
            </div>
          </div>

          {/* 地域展開 */}
          <div className="intelligence-card africa cursor-pointer" onClick={() => handleDrilldown('regions', metrics.transactions.regions)}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-2">
                <div className="action-orb red w-8 h-8">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                  </svg>
                </div>
                <span className="status-badge warning text-xs px-2 py-1">拡大中</span>
              </div>
              <div className="metric-value font-display text-2xl font-bold text-nexus-text-primary">
                {metrics.transactions.regions.length}地域
              </div>
              <div className="metric-label text-nexus-text-secondary font-medium mt-1 text-sm">
                グローバル展開
              </div>
              <div className="mt-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-nexus-text-secondary">総注文数</span>
                  <span className="font-medium text-nexus-text-primary">{metrics.transactions.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-nexus-text-secondary">主要地域</span>
                  <span className="font-medium text-nexus-text-primary">
                    {metrics.transactions.regions[0]?.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* カテゴリー別パフォーマンス */}
      <div className="intelligence-card global">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-display font-bold text-nexus-text-primary">
              カテゴリー別パフォーマンス分析
            </h3>
            <span className="status-badge info">リアルタイム</span>
          </div>
          
          <div className="holo-table">
            <table className="w-full">
              <thead>
                <tr className="border-b border-nexus-border">
                  <th className="text-center p-4 font-medium text-nexus-text-secondary">カテゴリー</th>
                  <th className="text-right p-4 font-medium text-nexus-text-secondary">売上</th>
                  <th className="text-right p-4 font-medium text-nexus-text-secondary">商品数</th>
                  <th className="text-right p-4 font-medium text-nexus-text-secondary">平均価格</th>
                  <th className="text-center p-4 font-medium text-nexus-text-secondary">成長率</th>
                  <th className="text-center p-4 font-medium text-nexus-text-secondary">利益率</th>
                  <th className="text-center p-4 font-medium text-nexus-text-secondary">操作</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((category) => (
                  <tr key={category.name} className="border-b border-nexus-border hover:bg-nexus-bg-tertiary">
                    <td className="p-4">
                      <span className="font-medium text-nexus-text-primary">{category.name}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-display font-bold text-nexus-text-primary">
                        ¥{(category.sales / 10000).toFixed(0)}万
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-nexus-text-primary">{category.items}点</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-nexus-text-primary">¥{category.avgPrice.toLocaleString()}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`status-badge ${category.growth > 10 ? 'success' : category.growth > 0 ? 'info' : 'warning'} text-xs px-2 py-1`}>
                        {category.growth > 0 ? '+' : ''}{category.growth}%
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`status-badge ${category.margin > 20 ? 'success' : category.margin > 15 ? 'info' : 'warning'} text-xs px-2 py-1`}>
                        {category.margin}%
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <NexusButton
                        onClick={() => handleDrilldown('category', category)}
                        variant="default"
                        size="sm"
                      >
                        詳細分析
                      </NexusButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 地域別展開 */}
      <div className="intelligence-card global">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-display font-bold text-nexus-text-primary">
              地域別展開分析
            </h3>
            <span className="status-badge success">グローバル</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metrics.transactions.regions.map((region) => (
              <div 
                key={region.name} 
                className="intelligence-card americas cursor-pointer"
                onClick={() => handleDrilldown('region-detail', region)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-nexus-text-primary text-lg">{region.name}</h4>
                    <span className={`status-badge ${region.growth > 15 ? 'success' : region.growth > 10 ? 'info' : 'warning'} text-xs px-2 py-1`}>
                      +{region.growth}%
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-nexus-text-secondary text-sm">売上</span>
                      <span className="font-display font-bold text-nexus-text-primary">
                        ¥{(region.sales / 10000).toFixed(0)}万
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-nexus-text-secondary text-sm">注文数</span>
                      <span className="text-nexus-text-primary">{region.orders}件</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-nexus-text-secondary text-sm">シェア</span>
                      <span className="text-nexus-text-primary">{region.percentage}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 w-full bg-nexus-bg-secondary rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${region.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ドリルダウンモーダル */}
      <BaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${selectedMetric} - 詳細分析`}
        size="xl"
      >
        <div className="space-y-6">
          {selectedMetric === 'revenue' && drilldownData && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-nexus-text-primary">売上詳細分析</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="intelligence-card americas">
                  <div className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-nexus-text-primary">¥{drilldownData.thisMonth.toLocaleString()}</div>
                      <div className="text-sm text-nexus-text-secondary">今月売上</div>
                    </div>
                  </div>
                </div>
                <div className="intelligence-card europe">
                  <div className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-nexus-text-primary">¥{drilldownData.lastMonth.toLocaleString()}</div>
                      <div className="text-sm text-nexus-text-secondary">先月売上</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h5 className="text-md font-medium text-nexus-text-primary mb-2">目標達成状況</h5>
                <div className="w-full bg-nexus-bg-secondary rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full flex items-center justify-center text-white text-xs font-medium"
                    style={{ width: `${Math.min(drilldownData.targetProgress, 100)}%` }}
                  >
                    {drilldownData.targetProgress}%
                  </div>
                </div>
                <div className="flex justify-between text-sm text-nexus-text-secondary mt-1">
                  <span>現在: ¥{drilldownData.thisMonth.toLocaleString()}</span>
                  <span>目標: ¥{drilldownData.target.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {selectedMetric === 'category' && drilldownData && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-nexus-text-primary">{drilldownData.name} - 詳細分析</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="intelligence-card americas">
                  <div className="p-4 text-center">
                    <div className="text-xl font-bold text-nexus-text-primary">¥{drilldownData.sales.toLocaleString()}</div>
                    <div className="text-sm text-nexus-text-secondary">総売上</div>
                  </div>
                </div>
                <div className="intelligence-card europe">
                  <div className="p-4 text-center">
                    <div className="text-xl font-bold text-nexus-text-primary">{drilldownData.items}</div>
                    <div className="text-sm text-nexus-text-secondary">商品数</div>
                  </div>
                </div>
                <div className="intelligence-card asia">
                  <div className="p-4 text-center">
                    <div className="text-xl font-bold text-nexus-text-primary">{drilldownData.margin}%</div>
                    <div className="text-sm text-nexus-text-secondary">利益率</div>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="text-md font-medium text-nexus-text-primary mb-2">成長トレンド</h5>
                <div className="flex items-center space-x-2">
                  <div className={`text-lg font-bold ${drilldownData.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {drilldownData.growth > 0 ? '+' : ''}{drilldownData.growth}%
                  </div>
                  <span className="text-nexus-text-secondary">前期比</span>
                </div>
              </div>
            </div>
          )}

          {selectedMetric === 'regions' && drilldownData && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-nexus-text-primary">地域別展開詳細</h4>
              <div className="space-y-3">
                {drilldownData.map((region: RegionData) => (
                  <div key={region.name} className="intelligence-card global">
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-nexus-text-primary">{region.name}</div>
                        <div className="text-sm text-nexus-text-secondary">
                          {region.orders}件の注文 • シェア{region.percentage}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-nexus-text-primary">¥{region.sales.toLocaleString()}</div>
                        <div className={`text-sm ${region.growth > 10 ? 'text-green-600' : 'text-yellow-600'}`}>
                          +{region.growth}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </BaseModal>
    </div>
  );
} 