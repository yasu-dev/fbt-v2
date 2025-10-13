'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layouts/DashboardLayout';
import UnifiedPageHeader from '../components/ui/UnifiedPageHeader';
import { NexusButton, NexusCard, NexusLoadingSpinner } from '../components/ui';
import BaseModal from '../components/ui/BaseModal';
import ProductDetailModal from '../components/ProductDetailModal';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import AnalyticsPeriodModal from '../components/modals/AnalyticsPeriodModal';

export default function DashboardPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'revenue' | 'operations' | 'returns'>('revenue');
  const [selectedPeriod, setSelectedPeriod] = useState<{
    startDate: Date;
    endDate: Date;
    label: string;
  }>({
    startDate: new Date(),
    endDate: new Date(),
    label: '今日'
  });

  useEffect(() => {
    // 期間パラメータをAPIリクエストに含める
    const params = new URLSearchParams({
      startDate: selectedPeriod.startDate.toISOString(),
      endDate: selectedPeriod.endDate.toISOString()
    });
    
    fetch(`/api/dashboard?${params}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // カメラと時計に特化した実践的なデータ構造
        const practicalData = {

          
          // 返品理由分析データ（カメラ・時計専門）
          returnAnalysis: {
            totalReturns: 47,
            totalReturnValue: 8940000,
            categories: {
              camera: {
                returns: 28,
                value: 5640000
              },
              watch: {
                returns: 19,
                value: 3300000
              }
            },
            reasons: [
              {
                id: 'defect',
                name: '商品不良・故障',
                count: 18,
                percentage: 38.3,
                value: 3420000,
                trend: '+2.1%',
                severity: 'high',
                items: [
                  {
                    name: 'Canon EOS R5',
                    reason: 'AFセンサー不良',
                    value: 280000
                  },
                  {
                    name: 'Nikon Z9',
                    reason: 'ファインダー表示異常',
                    value: 320000
                  },
                  {
                    name: 'Rolex Submariner',
                    reason: 'リューズ不良',
                    value: 450000
                  }
                ]
              },
              {
                id: 'description',
                name: '商品説明との相違',
                count: 12,
                percentage: 25.5,
                value: 2140000,
                trend: '-1.3%',
                severity: 'medium',
                items: [
                  {
                    name: 'Sony α7R V',
                    reason: 'レンズキット内容相違',
                    value: 180000
                  },
                  {
                    name: 'Omega Speedmaster',
                    reason: 'ベルト素材相違',
                    value: 220000
                  },
                  {
                    name: 'Canon RF 70-200mm',
                    reason: 'フィルター径記載ミス',
                    value: 160000
                  }
                ]
              },
              {
                id: 'shipping',
                name: '配送時破損',
                count: 8,
                percentage: 17.0,
                value: 1520000,
                trend: '+0.8%',
                severity: 'high',
                items: [
                  {
                    name: 'Leica M11',
                    reason: '本体外装損傷',
                    value: 380000
                  },
                  {
                    name: 'TAG Heuer Carrera',
                    reason: 'ガラス面ひび',
                    value: 290000
                  },
                  {
                    name: 'Fujifilm X-T5',
                    reason: 'LCD破損',
                    value: 140000
                  }
                ]
              },
              {
                id: 'expectation',
                name: '期待値との相違',
                count: 6,
                percentage: 12.8,
                value: 960000,
                trend: '-0.5%',
                severity: 'medium',
                items: [
                  {
                    name: 'Panasonic S5 II',
                    reason: '動画性能期待値相違',
                    value: 120000
                  },
                  {
                    name: 'Citizen Eco-Drive',
                    reason: 'バッテリー持続時間相違',
                    value: 80000
                  },
                  {
                    name: 'Sigma 24-70mm',
                    reason: 'AF速度期待値相違',
                    value: 90000
                  }
                ]
              },
              {
                id: 'customer',
                name: '顧客都合',
                count: 3,
                percentage: 6.4,
                value: 900000,
                trend: '-1.2%',
                severity: 'low',
                items: [
                  {
                    name: 'Casio G-Shock',
                    reason: 'サイズ感合わず',
                    value: 45000
                  },
                  {
                    name: 'Tamron 28-75mm',
                    reason: '用途変更',
                    value: 85000
                  },
                  {
                    name: 'Seiko Prospex',
                    reason: '色味イメージ相違',
                    value: 65000
                  }
                ]
              }
            ],
            actionPlan: [
              {
                issue: '商品不良・故障',
                action: '品質管理チームによる入荷時検品強化、メーカー別品質チェック項目追加',
                responsible: '品質管理チーム',
                deadline: '2週間以内',
                expectedReduction: '30%'
              },
              {
                issue: '商品説明との相違',
                action: '商品撮影・説明文作成ガイドライン見直し、ダブルチェック体制導入',
                responsible: '商品説明チーム',
                deadline: '1週間以内',
                expectedReduction: '25%'
              },
              {
                issue: '配送時破損',
                action: '梱包材見直し、配送業者との品質改善会議、高額商品専用梱包導入',
                responsible: '物流チーム',
                deadline: '3週間以内',
                expectedReduction: '40%'
              },
              {
                issue: '期待値との相違',
                action: 'より詳細な商品仕様記載、実機レビュー動画追加',
                responsible: 'マーケティングチーム',
                deadline: '2週間以内',
                expectedReduction: '20%'
              },
              {
                issue: '顧客都合',
                action: 'サイズガイド充実、バーチャル試着機能検討',
                responsible: 'カスタマーサポート',
                deadline: '1ヶ月以内',
                expectedReduction: '15%'
              }
            ]
          },

          // 収益直結指標（カメラ・時計特化）
          revenueMetrics: {
            todayRevenue: 1240000,
            todayTarget: 1500000,
            weeklyRevenue: 8940000,
            weeklyTarget: 10000000,
            monthlyRevenue: 34560000,
            monthlyTarget: 45000000,
            cameraRevenue: 20800000,
            watchRevenue: 13760000,
            growthRate: 12.3,
            conversionRate: 3.8
          },

          // 運営効率指標
          operationalMetrics: {
            inventoryTurnover: 4.2,
            averageProcessingTime: 2.1,
            qualityScore: 96.8,
            customerSatisfaction: 4.7,
            returnRate: 2.1,
            warehouseUtilization: 78.5,
            shippingAccuracy: 99.2,
            staffProductivity: 142
          },

          // 高額商品管理
          highValueItems: [
            {
              id: 'hv-001',
              name: 'Leica M10-P ブラック',
              category: 'カメラ',
              value: 890000,
              status: '入庫待ち',
              location: 'A-01',

              daysInInventory: 3
            },
            {
              id: 'hv-002', 
              name: 'Patek Philippe Nautilus',
              category: '時計',
              value: 1200000,
              status: '出品準備',
              location: 'S-05',

              daysInInventory: 1
            },
            {
              id: 'hv-003',
              name: 'Canon EF 600mm F4',
              category: 'カメラレンズ',
              value: 680000,
              status: '価格調査',
              location: 'B-12',

              daysInInventory: 5
            }
          ]
        };

        // 期間情報をデータに追加
        const dataWithPeriod = {
          ...practicalData,
          periodInfo: {
            startDate: selectedPeriod.startDate.toLocaleDateString('ja-JP'),
            endDate: selectedPeriod.endDate.toLocaleDateString('ja-JP'),
            label: selectedPeriod.label
          }
        };
        
        setDashboardData(dataWithPeriod);
        setLoading(false);
      })
      .catch((error) => {
        console.error('[ERROR] Dashboard data fetch error:', error);
        showToast({
          type: 'error',
          title: 'データ読み込みエラー',
          message: 'ダッシュボードデータの読み込みに失敗しました。'
        });
        setLoading(false);
      });
  }, [selectedPeriod]); // 選択期間が変更されたときに再読み込み

  const handleTaskAction = (task: any) => {
    showToast({
      type: 'info',
      title: 'タスク実行',
      message: `${task.title}の処理を開始しました`
    });
  };

  const handleHighValueItemAction = (item: any) => {
    setSelectedProduct(item);
    setIsProductDetailOpen(true);
  };

  const handleReturnItemDetail = (item: any) => {
    setSelectedProduct(item);
    setIsProductDetailOpen(true);
  };



  const getUrgencyIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'urgent':
        return (
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const headerActions = (
    <>
      <div className="text-right mr-4">
        <div className="text-sm text-nexus-text-secondary">分析期間</div>
        <div className="font-medium text-nexus-text-primary">{selectedPeriod.label}</div>
      </div>
      <NexusButton
        onClick={() => window.location.reload()}
        variant="default"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        }
      >
        データ更新
      </NexusButton>
      <NexusButton
        onClick={() => setIsDatePickerOpen(true)}
        variant="primary"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      >
        期間変更
      </NexusButton>
    </>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <NexusLoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-6">
        {/* 統一ヘッダー */}
        <UnifiedPageHeader
          title="ダッシュボード"
                        subtitle="作業管理・収益・運営効率・返品分析の統合管理"
          userType="seller"
          iconType="dashboard"
          actions={headerActions}
        />

        {/* 期間情報表示 */}
        {dashboardData?.periodInfo && (
          <div className="mt-6 bg-nexus-bg-secondary rounded-lg border border-nexus-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-nexus-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <div className="text-sm text-nexus-text-secondary">分析対象期間</div>
                  <div className="font-semibold text-nexus-text-primary">
                    {dashboardData.periodInfo.label} ({dashboardData.periodInfo.startDate} ～ {dashboardData.periodInfo.endDate})
                  </div>
                </div>
              </div>
              <div className="text-sm text-nexus-text-secondary">
                最終更新: {new Date().toLocaleString('ja-JP')}
              </div>
            </div>
          </div>
        )}

        {/* タブナビゲーション */}
        <div className="mt-8 border-b border-nexus-border">
          <nav className="-mb-px flex space-x-8">

            <button
              onClick={() => setActiveTab('revenue')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'revenue'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                収益管理
              </div>
            </button>
            <button
              onClick={() => setActiveTab('operations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'operations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                運営効率
              </div>
            </button>
            <button
              onClick={() => setActiveTab('returns')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'returns'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3" />
                </svg>
                返品理由分析
                {dashboardData?.returnAnalysis?.totalReturns > 0 && (
                  <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-0.5">
                    {dashboardData.returnAnalysis.totalReturns}
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>



        {/* 収益管理タブ */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            {/* メイン指標グリッド */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 今日の売上達成度 */}
              <div className="bg-white rounded-xl border border-nexus-border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    実績
                  </span>
                </div>
                <div className="text-3xl font-bold text-nexus-text-primary mb-2">
                  ¥{dashboardData?.revenueMetrics?.todayRevenue?.toLocaleString()}
                </div>
                <div className="text-nexus-text-secondary font-medium mb-3">
                  今日の売上実績
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${Math.min((dashboardData?.revenueMetrics?.todayRevenue / dashboardData?.revenueMetrics?.todayTarget) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-nexus-text-secondary">
                  目標: ¥{dashboardData?.revenueMetrics?.todayTarget?.toLocaleString()}
                </div>
              </div>

              {/* 月間成長率 */}
              <div className="bg-white rounded-xl border border-nexus-border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    成長率
                  </span>
                </div>
                <div className="text-3xl font-bold text-nexus-text-primary mb-2">
                  +{dashboardData?.revenueMetrics?.growthRate}%
                </div>
                <div className="text-nexus-text-secondary font-medium">
                  前月比成長率
                </div>
              </div>

              {/* カメラ関連売上 */}
              <div className="bg-white rounded-xl border border-nexus-border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    カメラ
                  </span>
                </div>
                <div className="text-3xl font-bold text-nexus-text-primary mb-2">
                  ¥{dashboardData?.revenueMetrics?.cameraRevenue?.toLocaleString()}
                </div>
                <div className="text-nexus-text-secondary font-medium">
                  月間カメラ売上
                </div>
              </div>

              {/* 時計関連売上 */}
              <div className="bg-white rounded-xl border border-nexus-border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    時計
                  </span>
                </div>
                <div className="text-3xl font-bold text-nexus-text-primary mb-2">
                  ¥{dashboardData?.revenueMetrics?.watchRevenue?.toLocaleString()}
                </div>
                <div className="text-nexus-text-secondary font-medium">
                  月間時計売上
                </div>
              </div>
            </div>

            {/* 追加メトリクス */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 週間・月間売上 */}
              <div className="bg-white rounded-xl border border-nexus-border p-6">
                <h3 className="text-lg font-bold text-nexus-text-primary mb-6 flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  期間別売上実績
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-nexus-text-secondary">週間売上</span>
                    <span className="font-bold text-green-600 text-lg">¥{dashboardData?.revenueMetrics?.weeklyRevenue?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-nexus-text-secondary">月間売上</span>
                    <span className="font-bold text-blue-600 text-lg">¥{dashboardData?.revenueMetrics?.monthlyRevenue?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 成果指標 */}
              <div className="bg-white rounded-xl border border-nexus-border p-6">
                <h3 className="text-lg font-bold text-nexus-text-primary mb-6 flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  成果指標
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-nexus-text-secondary">コンバージョン率</span>
                    <span className="font-bold text-green-600 text-lg">{dashboardData?.revenueMetrics?.conversionRate}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-nexus-text-secondary">成長率</span>
                    <span className="font-bold text-blue-600 text-lg">+{dashboardData?.revenueMetrics?.growthRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 運営効率タブ */}
        {activeTab === 'operations' && (
          <div className="space-y-6">
            {/* メイン効率指標グリッド */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 処理時間効率 */}
              <div className="bg-white rounded-xl border border-nexus-border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    時間
                  </span>
                </div>
                <div className="text-3xl font-bold text-nexus-text-primary mb-2">
                  1.8日
                </div>
                <div className="text-nexus-text-secondary font-medium">
                  平均処理時間
                </div>
              </div>

              {/* 品質スコア */}
              <div className="bg-white rounded-xl border border-nexus-border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    品質
                  </span>
                </div>
                <div className="text-3xl font-bold text-nexus-text-primary mb-2">
                  98.2%
                </div>
                <div className="text-nexus-text-secondary font-medium">
                  品質達成率
                </div>
              </div>

              {/* 在庫効率 */}
              <div className="bg-white rounded-xl border border-nexus-border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    在庫
                  </span>
                </div>
                <div className="text-3xl font-bold text-nexus-text-primary mb-2">
                  4.2回
                </div>
                <div className="text-nexus-text-secondary font-medium">
                  在庫回転率（月）
                </div>
              </div>

              {/* スタッフ生産性 */}
              <div className="bg-white rounded-xl border border-nexus-border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    生産性
                  </span>
                </div>
                <div className="text-3xl font-bold text-nexus-text-primary mb-2">
                  142%
                </div>
                <div className="text-nexus-text-secondary font-medium">
                  目標達成率
                </div>
              </div>
            </div>

            {/* 詳細指標セクション - 他のタブと統一したパディング構造 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 業務効率指標 */}
              <div className="bg-white rounded-xl border border-nexus-border p-6">
                <h3 className="text-lg font-bold text-nexus-text-primary mb-6 flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  業務効率指標
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-nexus-text-secondary">検品完了率</span>
                    <span className="font-bold text-green-600 text-lg">94.5%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-nexus-text-secondary">出荷処理率</span>
                    <span className="font-bold text-blue-600 text-lg">97.8%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-nexus-text-secondary">返品処理率</span>
                    <span className="font-bold text-orange-600 text-lg">99.1%</span>
                  </div>
                </div>
              </div>

              {/* 品質・顧客満足度 */}
              <div className="bg-white rounded-xl border border-nexus-border p-6">
                <h3 className="text-lg font-bold text-nexus-text-primary mb-6 flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  品質・満足度
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-nexus-text-secondary">顧客満足度</span>
                    <span className="font-bold text-green-600 text-lg">4.7/5.0</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-nexus-text-secondary">品質不具合率</span>
                    <span className="font-bold text-red-600 text-lg">1.8%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-nexus-text-secondary">再作業率</span>
                    <span className="font-bold text-orange-600 text-lg">2.3%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 返品理由分析タブ */}
        {activeTab === 'returns' && (
          <div className="space-y-6">
            {/* 返品サマリー */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3" />
                    </svg>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-orange-600 text-white">総計</span>
                </div>
                <div className="text-2xl font-bold text-nexus-text-primary">
                  {dashboardData?.returnAnalysis?.totalReturns || '0'}
                </div>
                <div className="text-nexus-text-secondary font-medium mt-1 text-sm">
                  総返品数
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">損失</span>
                </div>
                <div className="text-2xl font-bold text-nexus-text-primary">
                  ¥{dashboardData?.returnAnalysis?.totalReturnValue?.toLocaleString() || '0'}
                </div>
                <div className="text-nexus-text-secondary font-medium mt-1 text-sm">
                  返品総額
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">カメラ</span>
                </div>
                <div className="text-2xl font-bold text-nexus-text-primary">
                  {dashboardData?.returnAnalysis?.categories?.camera?.returns || '0'}
                </div>
                <div className="text-nexus-text-secondary font-medium mt-1 text-sm">
                  カメラ返品数
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">時計</span>
                </div>
                <div className="text-2xl font-bold text-nexus-text-primary">
                  {dashboardData?.returnAnalysis?.categories?.watch?.returns || '0'}
                </div>
                <div className="text-nexus-text-secondary font-medium mt-1 text-sm">
                  時計返品数
                </div>
              </div>
            </div>

            {/* 返品理由別分析 */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-bold text-nexus-text-primary">
                    返品理由別分析
                  </h2>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-600 text-white">
                    要改善
                  </span>
                </div>
                
                <div className="space-y-4">
                  {dashboardData?.returnAnalysis?.reasons?.map((reason: any) => (
                    <div key={reason.id} className="p-6 border border-nexus-border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-nexus-text-primary">{reason.name}</h3>
                            <p className="text-sm text-nexus-text-secondary">{reason.count}件 • {reason.percentage}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-red-600">¥{reason.value.toLocaleString()}</p>
                            <p className="text-xs text-nexus-text-secondary">損失額</p>
                          </div>
                          <div className="text-center">
                            <p className={`text-sm font-bold ${reason.trend.startsWith('+') ? 'text-red-600' : 'text-green-600'}`}>
                              {reason.trend}
                            </p>
                            <p className="text-xs text-nexus-text-secondary">前月比</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(reason.severity)}`}>
                            {reason.severity === 'high' ? '高' : reason.severity === 'medium' ? '中' : '低'}
                          </span>
                        </div>
                      </div>
                      
                      {/* 具体的な返品商品例 */}
                      <div className="mt-4">
                        <p className="text-sm font-medium text-nexus-text-secondary mb-3">具体的な返品商品例:</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {reason.items?.slice(0, 3).map((item: any, index: number) => (
                            <div key={index} className="p-3 bg-nexus-bg-tertiary rounded border">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-nexus-text-primary text-sm">{item.name}</h4>
                                <span className="text-sm font-bold text-red-600">¥{item.value.toLocaleString()}</span>
                              </div>
                              <p className="text-xs text-nexus-text-secondary">{item.reason}</p>
                              <NexusButton
                                onClick={() => handleReturnItemDetail(item)}
                                variant="default"
                                size="sm"
                                className="mt-2 w-full"
                              >
                                詳細確認
                              </NexusButton>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 改善アクションプラン */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-display font-bold text-nexus-text-primary">
                    改善アクションプラン
                  </h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    実行中
                  </span>
                </div>
                
                <div className="space-y-4">
                  {dashboardData?.returnAnalysis?.actionPlan?.map((plan: any, index: number) => (
                    <div key={index} className="p-4 border border-nexus-border rounded-lg bg-blue-50">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <h4 className="font-bold text-nexus-text-primary text-sm mb-1">対象問題</h4>
                          <p className="text-sm text-nexus-text-secondary">{plan.issue}</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-nexus-text-primary text-sm mb-1">改善策</h4>
                          <p className="text-sm text-nexus-text-secondary">{plan.action}</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-nexus-text-primary text-sm mb-1">担当</h4>
                          <p className="text-sm text-nexus-text-secondary">{plan.responsible}</p>
                          <p className="text-xs text-red-600 mt-1">期限: {plan.deadline}</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-nexus-text-primary text-sm mb-1">期待効果</h4>
                          <p className="text-lg font-bold text-green-600">{plan.expectedReduction}削減</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Period Modal */}
        <AnalyticsPeriodModal
          isOpen={isDatePickerOpen}
          onClose={() => setIsDatePickerOpen(false)}
          onApply={(startDate, endDate, label) => {
            setSelectedPeriod({ startDate, endDate, label });
            showToast({
              type: 'success',
              title: '期間設定完了',
              message: `分析期間を「${label}」に設定しました`
            });
          }}
          title="詳細分析期間選択"
        />

        {/* Product Detail Modal */}
        <ProductDetailModal
          isOpen={isProductDetailOpen}
          onClose={() => setIsProductDetailOpen(false)}
          product={selectedProduct}
        />
      </div>
    </DashboardLayout>
  );
} 