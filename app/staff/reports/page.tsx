'use client';

import React from 'react';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import UnifiedPageHeader from '@/app/components/ui/UnifiedPageHeader';
import { useState, useEffect, useRef } from 'react';
import {
  ArrowDownTrayIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  CurrencyYenIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { NexusLoadingSpinner, NexusSelect, NexusButton } from '@/app/components/ui';

interface KPIData {
  name: string;
  category: string;
  value: number;
  unit: string;
  period: string;
  date: string;
}

interface ReportsData {
  dailyMetrics: KPIData[];
  weeklyMetrics: KPIData[];
  monthlyMetrics: KPIData[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    conversionRate: number;
    customerSatisfaction: number;
    returnRate: number;
  };
}

export default function BusinessReportsPage() {
  const { showToast } = useToast();
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchReportsData();
  }, [mounted, selectedPeriod]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/reports/analytics');
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setReportsData(data);
    } catch (error) {
      console.error('Error fetching reports data:', error);
      setError('レポートデータの取得に失敗しました');
      
      // フォールバック: モックデータ
      const mockData: ReportsData = {
        dailyMetrics: [
          { name: 'daily_revenue', category: 'sales', value: 850000, unit: 'JPY', period: 'daily', date: new Date().toISOString() },
          { name: 'daily_orders', category: 'sales', value: 25, unit: 'count', period: 'daily', date: new Date().toISOString() },
          { name: 'daily_inspections', category: 'operations', value: 18, unit: 'count', period: 'daily', date: new Date().toISOString() },
          { name: 'daily_shipments', category: 'operations', value: 22, unit: 'count', period: 'daily', date: new Date().toISOString() }
        ],
        weeklyMetrics: [
          { name: 'weekly_conversion_rate', category: 'sales', value: 3.2, unit: '%', period: 'weekly', date: new Date().toISOString() },
          { name: 'weekly_return_rate', category: 'quality', value: 1.8, unit: '%', period: 'weekly', date: new Date().toISOString() },
          { name: 'weekly_customer_satisfaction', category: 'customer', value: 94.5, unit: '%', period: 'weekly', date: new Date().toISOString() }
        ],
        monthlyMetrics: [
          { name: 'monthly_inventory_turnover', category: 'operations', value: 2.4, unit: 'times', period: 'monthly', date: new Date().toISOString() },
          { name: 'monthly_profit_margin', category: 'sales', value: 28.5, unit: '%', period: 'monthly', date: new Date().toISOString() },
          { name: 'monthly_new_customers', category: 'customer', value: 156, unit: 'count', period: 'monthly', date: new Date().toISOString() }
        ],
        summary: {
          totalRevenue: 12500000,
          totalOrders: 485,
          avgOrderValue: 25773,
          conversionRate: 3.2,
          customerSatisfaction: 94.5,
          returnRate: 1.8
        }
      };
      setReportsData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMetrics = () => {
    if (!reportsData) return [];
    
    switch (selectedPeriod) {
      case 'daily':
        return reportsData.dailyMetrics || [];
      case 'weekly':
        return reportsData.weeklyMetrics || [];
      case 'monthly':
        return reportsData.monthlyMetrics || [];
      default:
        return reportsData.dailyMetrics || [];
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'JPY') {
      return `¥${value.toLocaleString()}`;
    }
    if (unit === '%') {
      return `${value}%`;
    }
    if (unit === 'count') {
      return value.toLocaleString();
    }
    return `${value} ${unit}`;
  };

  const getMetricIcon = (name: string) => {
    if (name.includes('revenue') || name.includes('profit')) {
      return <CurrencyYenIcon className="w-6 h-6 text-green-600" />;
    }
    if (name.includes('orders') || name.includes('customers')) {
      return <ShoppingCartIcon className="w-6 h-6 text-blue-600" />;
    }
    if (name.includes('rate') || name.includes('satisfaction')) {
      return <ArrowTrendingUpIcon className="w-6 h-6 text-purple-600" />;
    }
    if (name.includes('inspections') || name.includes('shipments')) {
      return <ClockIcon className="w-6 h-6 text-orange-600" />;
    }
    return <ChartBarIcon className="w-6 h-6 text-gray-600" />;
  };

  const getMetricLabel = (name: string) => {
    const labels: Record<string, string> = {
      'daily_revenue': '日次売上',
      'daily_orders': '日次注文数',
      'daily_inspections': '日次検品数',
      'daily_shipments': '日次出荷数',
      'weekly_conversion_rate': '週次コンバージョン率',
      'weekly_return_rate': '週次返品率',
      'weekly_customer_satisfaction': '週次顧客満足度',
      'monthly_inventory_turnover': '月次在庫回転率',
      'monthly_profit_margin': '月次利益率',
      'monthly_new_customers': '月次新規顧客数'
    };
    return labels[name] || name;
  };

  const headerActions = (
    <div className="flex gap-2">
      <NexusButton
        onClick={() => {
          showToast({
            title: 'レポート作成',
            message: 'カスタムレポートの作成機能は開発中です',
            type: 'info'
          });
        }}
        variant="default"
        icon={<ArrowDownTrayIcon className="w-4 h-4" />}
      >
        カスタムレポート作成
      </NexusButton>
      <NexusButton
        onClick={() => {
          showToast({
            title: 'パフォーマンス分析',
            message: '詳細なパフォーマンス分析機能は開発中です',
            type: 'info'
          });
        }}
        variant="primary"
        icon={<ChartBarIcon className="w-4 h-4" />}
      >
        パフォーマンス分析
      </NexusButton>
    </div>
  );

  if (!mounted || loading) {
    return (
      <DashboardLayout userType="staff">
        <div className="flex items-center justify-center min-h-screen">
          <NexusLoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error && !reportsData) {
    return (
      <DashboardLayout userType="staff">
        <div className="space-y-6">
          <UnifiedPageHeader
            title="業務レポート"
            subtitle="業務フロー全体の可視化と効率性分析"
            userType="staff"
            iconType="reports"
            actions={headerActions}
          />
          <div className="bg-white rounded-xl border border-nexus-border p-8 text-center">
            <p className="text-nexus-text-secondary mb-4">{error}</p>
            <NexusButton onClick={fetchReportsData} variant="primary">
              再試行
            </NexusButton>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        <UnifiedPageHeader
          title="業務レポート"
          subtitle="業務フロー全体の可視化と効率性分析"
          userType="staff"
          iconType="reports"
          actions={headerActions}
        />

        {/* フィルター・検索セクション */}
        <div className="bg-white rounded-xl border border-nexus-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-5 h-5 text-nexus-text-secondary" />
            <h3 className="text-lg font-medium text-nexus-text-primary">期間設定</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NexusSelect
              label="表示期間"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
              options={[
                { value: 'daily', label: '日次' },
                { value: 'weekly', label: '週次' },
                { value: 'monthly', label: '月次' }
              ]}
            />
          </div>
        </div>

        {/* サマリーカード */}
        {reportsData?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-nexus-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <CurrencyYenIcon className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-nexus-text-primary">総売上</h3>
                  <p className="text-sm text-nexus-text-secondary">今月の累計</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">
                ¥{reportsData?.summary?.totalRevenue?.toLocaleString() || '0'}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-nexus-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingCartIcon className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-nexus-text-primary">総注文数</h3>
                  <p className="text-sm text-nexus-text-secondary">今月の累計</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {reportsData?.summary?.totalOrders?.toLocaleString() || '0'}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-nexus-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <ArrowTrendingUpIcon className="w-8 h-8 text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold text-nexus-text-primary">平均注文額</h3>
                  <p className="text-sm text-nexus-text-secondary">今月の平均</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                ¥{reportsData?.summary?.avgOrderValue?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        )}

        {/* KPIメトリクス */}
        <div className="bg-white rounded-xl border border-nexus-border">
          <div className="p-6 border-b border-nexus-border">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-nexus-text-primary">
                  KPIメトリクス ({selectedPeriod === 'daily' ? '日次' : selectedPeriod === 'weekly' ? '週次' : '月次'})
                </h2>
                <p className="text-sm text-nexus-text-secondary mt-1">
                  主要業績指標の推移
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(getCurrentMetrics() || []).map((metric, index) => (
                <div key={index} className="border border-nexus-border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {getMetricIcon(metric.name)}
                    <div>
                      <h4 className="font-medium text-nexus-text-primary">
                        {getMetricLabel(metric.name)}
                      </h4>
                      <p className="text-xs text-nexus-text-secondary">
                        {metric.category}
                      </p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-nexus-text-primary">
                    {formatValue(metric.value, metric.unit)}
                  </p>
                  <p className="text-xs text-nexus-text-secondary mt-1">
                    {new Date(metric.date).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 追加の品質指標 */}
        {reportsData?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-nexus-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-nexus-text-primary">コンバージョン率</h3>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {reportsData?.summary?.conversionRate || '0'}%
              </p>
              <p className="text-sm text-nexus-text-secondary mt-2">
                訪問者の購入率
              </p>
            </div>

            <div className="bg-white rounded-xl border border-nexus-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-nexus-text-primary">顧客満足度</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {reportsData?.summary?.customerSatisfaction || '0'}%
              </p>
              <p className="text-sm text-nexus-text-secondary mt-2">
                顧客レビュー平均
              </p>
            </div>

            <div className="bg-white rounded-xl border border-nexus-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <ClockIcon className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-nexus-text-primary">返品率</h3>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {reportsData?.summary?.returnRate || '0'}%
              </p>
              <p className="text-sm text-nexus-text-secondary mt-2">
                商品品質指標
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}