'use client'

import React, { useState } from 'react'
import { BusinessStatusIndicator } from '@/app/components/ui/StatusIndicator'
import NexusSelect from '@/app/components/ui/NexusSelect'
import NexusButton from '@/app/components/ui/NexusButton'
import { ExclamationTriangleIcon, UserIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'

// 実際の返品データ - スタッフが管理・指導に使用
const returnItemsData = [
  {
    id: 'RET-001',
    orderId: 'ORD-2024-0625-001',
    productName: 'Canon EOS R5 ボディ',
    productSku: 'TWD-CAM-001',
    sellerId: 'SELLER-001',
    sellerName: 'セラー',
    customer: '顧客',
    returnDate: '2024-06-25',
    returnReason: '動作不良',
    returnAmount: 2800000,
    inspector: '検査担当',
    status: 'inspecting',

    location: 'A-01',
    estimatedLoss: 150000,
    relistable: false,
    sellerFault: true,
    actionRequired: '品質管理改善指導',
    previousReturns: 3
  },
  {
    id: 'RET-002', 
    orderId: 'ORD-2024-0624-003',
    productName: 'Rolex Submariner Date',
    productSku: 'TWD-WAT-007',
    sellerId: 'SELLER-002',
    sellerName: 'セラー',
    customer: '顧客',
    returnDate: '2024-06-24',
    returnReason: '商品説明相違',
    returnAmount: 1800000,
    inspector: '検査担当',
    status: 'completed',

    location: 'B-03',
    estimatedLoss: 0,
    relistable: true,
    sellerFault: true,
    actionRequired: '商品説明精度向上',
    previousReturns: 1
  },
  {
    id: 'RET-003',
    orderId: 'ORD-2024-0623-007',
    productName: 'Canon RF 24-70mm F2.8',
    productSku: 'TWD-LEN-005',
    sellerId: 'SELLER-003',
    sellerName: 'セラー',
    customer: '顧客',
    returnDate: '2024-06-23',
    returnReason: '配送時破損',
    returnAmount: 198000,
    inspector: '検査担当',
    status: 'pending',

    location: 'A-05',
    estimatedLoss: 198000,
    relistable: false,
    sellerFault: false,
    actionRequired: '梱包方法改善',
    previousReturns: 0
  },
  {
    id: 'RET-004',
    orderId: 'ORD-2024-0622-012',
    productName: 'Omega Speedmaster',
    productSku: 'TWD-WAT-012',
    sellerId: 'SELLER-002',
    sellerName: 'セラー',
    customer: '顧客',
    returnDate: '2024-06-22',
    returnReason: '顧客都合',
    returnAmount: 450000,
    inspector: '検査担当',
    status: 'completed',

    location: 'B-08',
    estimatedLoss: 0,
    relistable: true,
    sellerFault: false,
    actionRequired: 'なし',
    previousReturns: 1
  },
  {
    id: 'RET-005',
    orderId: 'ORD-2024-0621-005',
    productName: 'Sony α7R V',
    productSku: 'TWD-CAM-008',
    sellerId: 'SELLER-001',
    sellerName: 'セラー',
    customer: '顧客',
    returnDate: '2024-06-21',
    returnReason: '機能不具合',
    returnAmount: 520000,
    inspector: '検査担当',
    status: 'inspecting',

    location: 'A-02',
    estimatedLoss: 80000,
    relistable: true,
    sellerFault: true,
    actionRequired: '事前検品強化',
    previousReturns: 3
  }
]

// セラー別パフォーマンス集計
const sellerPerformanceData = [
  {
    sellerId: 'SELLER-001',
    sellerName: 'セラー',
    totalReturns: 2,
    returnRate: 4.2,
    totalLoss: 230000,
    faultReturns: 2,
    riskLevel: 'high',
    actionPlan: '品質改善指導',
    lastContact: '2024-06-20',
    nextReview: '2024-06-30'
  },
  {
    sellerId: 'SELLER-002',
    sellerName: 'セラー',
    totalReturns: 2,
    returnRate: 2.1,
    totalLoss: 0,
    faultReturns: 1,
    riskLevel: 'medium',
    actionPlan: '商品説明改善支援',
    lastContact: '2024-06-18',
    nextReview: '2024-07-15'
  },
  {
    sellerId: 'SELLER-003',
    sellerName: 'セラー',
    totalReturns: 1,
    returnRate: 1.8,
    totalLoss: 198000,
    faultReturns: 0,
    riskLevel: 'low',
    actionPlan: '梱包改善提案',
    lastContact: '2024-06-15',
    nextReview: '2024-07-30'
  }
]

// 改善アクションプラン
const improvementActions = [
  {
    issue: '動作不良・機能不具合',
    sellerGuidance: '出品前の動作確認チェックリスト実施、専門業者による事前点検推奨',
    expectedImprovement: '品質起因返品を60%削減',
    deadline: '1週間以内',
    responsible: '品質管理チーム',

  },
  {
    issue: '商品説明との相違',
    sellerGuidance: '商品撮影ガイドライン遵守、詳細仕様記載の徹底、実寸測定の義務化',
    expectedImprovement: '説明相違返品を40%削減',
    deadline: '2週間以内',
    responsible: '出品サポートチーム',
    priority: 'high'
  },
  {
    issue: '配送時破損',
    sellerGuidance: '高額商品専用梱包材使用、緩衝材増量、配送業者変更検討',
    expectedImprovement: '配送破損を70%削減',
    deadline: '1週間以内',
    responsible: '物流管理チーム',
    priority: 'high'
  }
]

export function ReturnReasonAnalysis() {
  const [statusFilter, setStatusFilter] = useState('all')

  const [sellerFilter, setSellerFilter] = useState('all')
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null)

  // 統計計算
  const totalReturns = returnItemsData.length
  const totalAmount = returnItemsData.reduce((sum, item) => sum + item.returnAmount, 0)
  const totalLoss = returnItemsData.reduce((sum, item) => sum + item.estimatedLoss, 0)
  const sellerFaultCount = returnItemsData.filter(item => item.sellerFault).length
  const pendingCount = returnItemsData.filter(item => item.status === 'pending').length
  const inspectingCount = returnItemsData.filter(item => item.status === 'inspecting').length
  const completedCount = returnItemsData.filter(item => item.status === 'completed').length
  const relistableCount = returnItemsData.filter(item => item.relistable).length
  const highRiskSellers = sellerPerformanceData.filter(seller => seller.riskLevel === 'high').length

  // フィルタリング
  const filteredItems = returnItemsData.filter(item => {
    const statusMatch = statusFilter === 'all' || item.status === statusFilter

    const sellerMatch = sellerFilter === 'all' || item.sellerId === sellerFilter
    return statusMatch && sellerMatch
  })

  const formatCurrency = (amount: number) => {
    return `¥${(amount / 10000).toFixed(0)}万`
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'pending'
      case 'inspecting': return 'inspection'
      case 'completed': return 'completed'
      default: return 'pending'
    }
  }



  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-nexus-text-secondary'
    }
  }

  const handleSellerContact = (sellerId: string) => {
    alert(`${sellerPerformanceData.find(s => s.sellerId === sellerId)?.sellerName} への連絡機能を開始します`)
  }

  const handleImprovementPlan = (sellerId: string) => {
    alert(`${sellerPerformanceData.find(s => s.sellerId === sellerId)?.sellerName} の改善計画を作成します`)
  }

  return (
    <div className="space-y-6">
      {/* 統計サマリー */}
      <div className="intelligence-metrics">
        <div className="unified-grid-4">
          <div className="intelligence-card americas">
            <div className="p-8">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="action-orb red w-6 h-6 sm:w-8 sm:h-8">
                  <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                  </svg>
                </div>
                <span className="status-badge danger text-[10px] sm:text-xs">処理中</span>
              </div>
              <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                {totalReturns}
              </div>
              <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                返品処理件数
              </div>
            </div>
          </div>

          <div className="intelligence-card europe">
            <div className="p-8">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="action-orb yellow w-6 h-6 sm:w-8 sm:h-8">
                  <ExclamationTriangleIcon className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <span className="status-badge warning text-[10px] sm:text-xs">要指導</span>
              </div>
              <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                {sellerFaultCount}
              </div>
              <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                セラー起因返品
              </div>
            </div>
          </div>

          <div className="intelligence-card asia">
            <div className="p-8">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="action-orb red w-6 h-6 sm:w-8 sm:h-8">
                  <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="status-badge danger text-[10px] sm:text-xs">損失</span>
              </div>
              <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                {formatCurrency(totalLoss)}
              </div>
              <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                推定損失額
              </div>
            </div>
          </div>

          <div className="intelligence-card africa">
            <div className="p-8">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="action-orb red w-6 h-6 sm:w-8 sm:h-8">
                  <UserIcon className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <span className="status-badge danger text-[10px] sm:text-xs">注意</span>
              </div>
              <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                {highRiskSellers}
              </div>
              <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                高リスクセラー
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* セラー別パフォーマンス管理 */}
      <div className="intelligence-card global">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-nexus-text-primary">セラー指導管理</h2>
            <span className="status-badge info">リアルタイム監視</span>
          </div>
          
          <div className="holo-table">
            <table className="w-full">
              <thead className="holo-header">
                <tr>
                  <th className="text-left py-3 px-4">セラー</th>
                  <th className="text-center py-3 px-4">返品件数</th>
                  <th className="text-center py-3 px-4">返品率</th>
                  <th className="text-right py-3 px-4">損失額</th>
                  <th className="text-center py-3 px-4">リスク</th>
                  <th className="text-left py-3 px-4">指導内容</th>
                  <th className="text-center py-3 px-4">次回レビュー</th>
                  <th className="text-center py-3 px-4">アクション</th>
                </tr>
              </thead>
              <tbody className="holo-body">
                {sellerPerformanceData.map((seller) => (
                  <tr key={seller.sellerId} className="holo-row">
                    <td className="py-4 px-4">
                      <div className="font-medium">{seller.sellerName}</div>
                      <div className="text-sm text-nexus-text-secondary">{seller.sellerId}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-medium">{seller.totalReturns}</span>
                      <div className="text-xs text-nexus-text-secondary">({seller.faultReturns}件起因)</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-medium">{seller.returnRate}%</span>
                    </td>
                    <td className="py-4 px-4 text-right font-medium">{formatCurrency(seller.totalLoss)}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(seller.riskLevel)}`}>
                        {seller.riskLevel === 'high' ? '高' : seller.riskLevel === 'medium' ? '中' : '低'}
                      </span>
                    </td>
                    <td className="py-4 px-4">{seller.actionPlan}</td>
                    <td className="py-4 px-4 text-center font-mono text-sm">{seller.nextReview}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <NexusButton
                          onClick={() => handleSellerContact(seller.sellerId)}
                          variant="primary"
                          size="sm"
                        >
                          連絡
                        </NexusButton>
                        <NexusButton
                          onClick={() => handleImprovementPlan(seller.sellerId)}
                          variant="secondary"
                          size="sm"
                        >
                          改善計画
                        </NexusButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 改善アクションプラン */}
      <div className="intelligence-card europe">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-nexus-text-primary">セラー指導プラン</h2>
            <ClipboardDocumentListIcon className="w-6 h-6 text-nexus-text-secondary" />
          </div>
          
          <div className="space-y-4">
            {improvementActions.map((action, index) => (
              <div key={index} className="bg-nexus-bg-secondary rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-nexus-text-primary mb-2">{action.issue}</h3>
                    <p className="text-sm text-nexus-text-secondary mb-3">{action.sellerGuidance}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-nexus-text-secondary">期待効果: {action.expectedImprovement}</span>
                      <span className="text-nexus-text-secondary">期限: {action.deadline}</span>
                      <span className="text-nexus-text-secondary">担当: {action.responsible}</span>
                    </div>
                  </div>

                </div>
                
                <div className="flex justify-end">
                  <NexusButton variant="primary" size="sm">
                    セラーに通知
                  </NexusButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="intelligence-card global">
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NexusSelect
              label="ステータス"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'すべて' },
                { value: 'pending', label: '入庫待ち' },
                { value: 'inspecting', label: '保管作業中' },
                { value: 'completed', label: '完了' }
              ]}
            />
            

            
            <NexusSelect
              label="セラー"
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value)}
              options={[
                { value: 'all', label: 'すべてのセラー' },
                ...sellerPerformanceData.map(seller => ({
                  value: seller.sellerId,
                  label: seller.sellerName
                }))
              ]}
            />
          </div>
        </div>
      </div>

      {/* 返品処理一覧 */}
      <div className="intelligence-card global">
        <div className="p-8">
          <h2 className="text-xl font-display font-bold text-nexus-text-primary mb-6">返品処理一覧</h2>
          <div className="holo-table">
            <table className="w-full">
              <thead className="holo-header">
                <tr>
                  <th className="text-left py-3 px-4">返品ID</th>
                  <th className="text-left py-3 px-4">商品・セラー</th>
                  <th className="text-left py-3 px-4">返品理由</th>
                  <th className="text-right py-3 px-4">金額</th>
                  <th className="text-center py-3 px-4">セラー起因</th>
                  <th className="text-center py-3 px-4">ステータス</th>
                  <th className="text-left py-3 px-4">必要アクション</th>
                  <th className="text-left py-3 px-4">担当者</th>
                </tr>
              </thead>
              <tbody className="holo-body">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="holo-row">
                    <td className="py-4 px-4 font-mono text-sm">{item.id}</td>
                    <td className="py-4 px-4">
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-sm text-nexus-text-secondary">{item.sellerName}</div>
                    </td>
                    <td className="py-4 px-4">{item.returnReason}</td>
                    <td className="py-4 px-4 text-right font-medium">{formatCurrency(item.returnAmount)}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.sellerFault ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {item.sellerFault ? 'あり' : 'なし'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <BusinessStatusIndicator status={getStatusVariant(item.status)} />
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-sm font-medium ${
                        item.actionRequired !== 'なし' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {item.actionRequired}
                      </span>
                    </td>
                    <td className="py-4 px-4">{item.inspector}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 