'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import NexusCard from '@/app/components/ui/NexusCard';

// Chart.jsの登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface InventoryAnalyticsProps {
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export default function InventoryAnalytics({ dateRange }: InventoryAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    // 実際の実装では、APIから分析データを取得
    setTimeout(() => {
      setAnalyticsData(generateMockData());
      setLoading(false);
    }, 1000);
  }, [dateRange]);

  // モックデータ生成
  const generateMockData = () => {
    return {
      turnoverRate: {
        current: 4.2,
        previous: 3.8,
        trend: '+10.5%'
      },
      slowMoving: 15,
      totalValue: 45820000,
      categories: {
        camera: { count: 45, value: 28500000 },
        watch: { count: 23, value: 15200000 },
        accessory: { count: 120, value: 2120000 }
      }
    };
  };

  // 在庫回転率の推移グラフデータ
  const turnoverChartData = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    datasets: [
      {
        label: '在庫回転率',
        data: [3.2, 3.5, 3.8, 4.0, 3.9, 4.2],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
      {
        label: '業界平均',
        data: [3.0, 3.0, 3.1, 3.1, 3.2, 3.2],
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        borderDash: [5, 5],
        tension: 0.1,
      }
    ],
  };

  const turnoverChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '在庫回転率の推移',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '回転率'
        }
      }
    }
  };

  // カテゴリ別在庫構成
  const categoryChartData = {
    labels: ['カメラ', '時計', 'アクセサリー'],
    datasets: [
      {
        label: '在庫金額',
        data: [28500000, 15200000, 2120000],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(249, 115, 22, 1)',
        ],
        borderWidth: 1,
      }
    ],
  };

  const categoryChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'カテゴリ別在庫構成',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = ((value / 45820000) * 100).toFixed(1);
            return `${label}: ¥${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
  };

  // 滞留期間別在庫分析
  const ageChartData = {
    labels: ['0-30日', '31-60日', '61-90日', '91-180日', '180日以上'],
    datasets: [
      {
        label: '商品数',
        data: [65, 32, 18, 12, 8],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: '在庫金額（百万円）',
        data: [25, 12, 8, 6, 3],
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      }
    ],
  };

  const ageChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '滞留期間別在庫分析',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      }
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <NexusCard key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </NexusCard>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIサマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <NexusCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">在庫回転率</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData.turnoverRate.current}
              </p>
              <p className="text-sm text-green-600 mt-1">
                {analyticsData.turnoverRate.trend}
              </p>
            </div>
            <div className="text-blue-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
            </div>
          </div>
        </NexusCard>

        <NexusCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">滞留在庫数</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData.slowMoving}
              </p>
              <p className="text-sm text-orange-600 mt-1">90日以上</p>
            </div>
            <div className="text-orange-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
          </div>
        </NexusCard>

        <NexusCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">在庫総額</p>
              <p className="text-2xl font-bold text-gray-900">
                ¥{(analyticsData.totalValue / 1000000).toFixed(1)}M
              </p>
              <p className="text-sm text-gray-500 mt-1">135商品</p>
            </div>
            <div className="text-green-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
          </div>
        </NexusCard>

        <NexusCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">高収益商品率</p>
              <p className="text-2xl font-bold text-gray-900">18.5%</p>
              <p className="text-sm text-green-600 mt-1">+2.3%</p>
            </div>
            <div className="text-nexus-blue">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </NexusCard>
      </div>

      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 在庫回転率の推移 */}
        <NexusCard className="p-6">
          <Line options={turnoverChartOptions} data={turnoverChartData} />
        </NexusCard>

        {/* カテゴリ別在庫構成 */}
        <NexusCard className="p-6">
          <Doughnut options={categoryChartOptions} data={categoryChartData} />
        </NexusCard>

        {/* 滞留期間別在庫分析 */}
        <NexusCard className="p-6">
          <Bar options={ageChartOptions} data={ageChartData} />
        </NexusCard>

        {/* 収益性分析 */}
        <NexusCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">収益性分析</h3>
          <div className="space-y-4">
            {Object.entries({
              '高収益商品': { count: 25, percentage: 18.5, color: 'green' },
              '標準収益商品': { count: 78, percentage: 57.8, color: 'blue' },
              '低収益商品': { count: 32, percentage: 23.7, color: 'red' }
            }).map(([label, data]) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{label}</span>
                  <span>{data.count}商品 ({data.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-${data.color}-500`}
                    style={{ width: `${data.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              高収益商品の割合を増やすことで、在庫効率を改善できます
            </p>
          </div>
        </NexusCard>
      </div>

      {/* 詳細分析テーブル */}
      <NexusCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">滞留在庫詳細</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  商品名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  カテゴリ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  在庫日数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  在庫金額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  推奨アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                {
                  sku: 'TWD-2024-015',
                  name: 'Nikon D850 ボディ',
                  category: 'カメラ',
                  days: 156,
                  value: 280000,
                  action: '価格見直し'
                },
                {
                  sku: 'TWD-2024-023',
                  name: 'Canon EF 70-200mm F2.8',
                  category: 'レンズ',
                  days: 134,
                  value: 195000,
                  action: 'セット販売検討'
                },
                {
                  sku: 'TWD-2024-041',
                  name: 'Omega Seamaster',
                  category: '時計',
                  days: 98,
                  value: 520000,
                  action: 'プロモーション'
                }
              ].map((item) => (
                <tr key={item.sku}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.days > 120 ? 'bg-red-100 text-red-800' : 'bg-orange-600 text-white'
                    }`}>
                      {item.days}日
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ¥{item.value.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    {item.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </NexusCard>
    </div>
  );
} 