'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import UnifiedPageHeader from '@/app/components/ui/UnifiedPageHeader';
import { ContentCard, NexusLoadingSpinner } from '@/app/components/ui';
import { BusinessStatusIndicator } from '@/app/components/ui/StatusIndicator';
import Pagination from '@/app/components/ui/Pagination';
import { ReturnInspection } from '@/app/components/features/returns/ReturnInspection';
import { ReturnRelistingFlow } from '@/app/components/features/returns/ReturnRelistingFlow';
import { ArchiveBoxIcon, ClockIcon, ArrowTrendingUpIcon, ExclamationCircleIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import BaseModal from '@/app/components/ui/BaseModal';
import NexusButton from '@/app/components/ui/NexusButton';
import { useSystemSetting } from '@/lib/hooks/useMasterData';

interface ReturnItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  customer: string;
  returnReason: string;
  returnDate: string;
  originalCondition: string;
  returnedCondition: string;
  status: 'pending' | 'inspecting' | 'approved' | 'rejected' | 'refunded';
  inspector: string;
  customerNote: string;
  refundAmount: string;
  photos?: File[];
  inspectionNote?: string;
  finalDecision?: 'resell' | 'repair' | 'dispose';
}

interface ReturnCategory {
  id: string;
  label: string;
  action: string;
}

interface ReturnsData {
  returns: {
    id: string;
    orderId: string;
    productId: string;
    reason: string;
    condition: string;
    customerNote?: string;
    staffNote?: string;
    refundAmount: number;
    status: string;
    processedBy?: string;
    processedAt?: string;
    createdAt: string;
  }[];
  stats: {
    total: number;
    pending: number;
    approved: number;
    completed: number;
    rejectionRate: number;
  };
  reasonBreakdown: {
    reason: string;
    count: number;
    percentage: number;
  }[];
}

export default function ReturnsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  // マスタデータの取得（全てのuseStateより前に配置）
  const { setting: returnStatuses } = useSystemSetting('return_statuses');
  
  const [returnsData, setReturnsData] = useState<ReturnsData | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(null);
  const [inspectionPhotos, setInspectionPhotos] = useState<File[]>([]);
  const [inspectionNote, setInspectionNote] = useState('');
  const [finalDecision, setFinalDecision] = useState<'resell' | 'repair' | 'dispose' | ''>('');
  const [viewMode, setViewMode] = useState<'list' | 'inspection' | 'history'>('list');
  const [filter, setFilter] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUnsellableModalOpen, setIsUnsellableModalOpen] = useState(false);
  const [isRelistingModalOpen, setIsRelistingModalOpen] = useState(false);
  const [selectedRelistingItem, setSelectedRelistingItem] = useState<ReturnItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<ReturnItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // ページネーション状態
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);



  // マウント状態の管理
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchReturnsData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/returns');
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setReturnsData(data);
      } catch (err) {
        console.error('Returns data fetch error:', err);
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
        
        // フォールバック用のモックデータ
        const mockReturnsData = {
          returns: [
            {
              id: 'return-001',
              orderId: 'ORD-2024-0627-001',
              productId: 'TWD-CAM-001',
              reason: '商品不良',
              condition: 'B',
              customerNote: 'ファインダーに汚れがあります',
              staffNote: '',
              refundAmount: 2800000,
              status: 'pending',
              processedBy: '',
              processedAt: '',
              createdAt: '2024-06-27T00:00:00Z'
            }
          ],
          stats: {
            total: 1,
            pending: 1,
            approved: 0,
            completed: 0,
            rejectionRate: 0
          },
          reasonBreakdown: [
            {
              reason: '商品不良',
              count: 1,
              percentage: 100
            }
          ]
        };
        setReturnsData(mockReturnsData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReturnsData();
  }, [mounted]);

  // フィルタリングとページネーション計算（全てのHookを早期returnより前に配置）
  const filteredReturns = useMemo(() => {
    if (!returnsData) return [];
    const allReturns: ReturnItem[] = returnsData ? [
      ...returnsData.returns.map(item => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        productName: `商品 ${item.productId}`,
        customer: `顧客 ${item.orderId}`,
        returnReason: item.reason,
        status: item.status as 'pending' | 'inspecting' | 'approved' | 'rejected' | 'refunded',
        returnDate: new Date(item.createdAt).toLocaleDateString('ja-JP'),
        originalCondition: 'A',
        returnedCondition: 'B',
        inspector: item.processedBy || '',
        customerNote: item.customerNote || '',
        refundAmount: `¥${item.refundAmount.toLocaleString()}`,
        photos: []
      })),
      {
        id: 'return-002',
        orderId: 'ORD-2024-0628-002',
        productId: 'CAN-5D4-002',
        productName: 'Canon EOS 5D Mark IV (ボディ)',
        customer: '田中 太郎',
        returnReason: '商品不良',
        returnDate: '2024-06-28',
        originalCondition: 'A+',
        returnedCondition: 'B',
        status: 'pending',
        inspector: '',
        customerNote: 'シャッターが動作しません',
        refundAmount: '¥298,000',
        inspectionNote: '',
        finalDecision: undefined
      },
      {
        id: 'return-003',
        orderId: 'ORD-2024-0629-003',
        productId: 'SON-A7R4-003',
        productName: 'Sony α7R IV (ボディ)',
        customer: '顧客',
        returnReason: '誤注文',
        returnDate: '2024-06-29',
        originalCondition: 'A+',
        returnedCondition: 'A+',
        status: 'approved',
        inspector: '検査担当',
        customerNote: '他の機種を注文したかった',
        refundAmount: '¥348,000',
        inspectionNote: '未使用品。問題なし。',
        finalDecision: 'resell'
      },
      {
        id: 'return-004',
        orderId: 'ORD-2024-0630-004',
        productId: 'NIK-D850-004',
        productName: 'Nikon D850 (ボディ)',
        customer: '鈴木 一郎',
        returnReason: 'サイズ不適合',
        returnDate: '2024-06-30',
        originalCondition: 'B+',
        returnedCondition: 'B',
        status: 'rejected',
        inspector: '検査担当',
        customerNote: '想像より大きすぎました',
        refundAmount: '¥0',
        inspectionNote: '使用感あり。返品不可条件に該当。',
        finalDecision: 'dispose'
      },
      {
        id: 'return-005',
        orderId: 'ORD-2024-0701-005',
        productId: 'FUJ-XT4-005',
        productName: 'Fujifilm X-T4 (ボディ)',
        customer: '高橋 美咲',
        returnReason: '配送破損',
        returnDate: '2024-07-01',
        originalCondition: 'A',
        returnedCondition: 'C',
        status: 'refunded',
        inspector: '検査担当',
        customerNote: '箱が潰れていて、レンズに傷がありました',
        refundAmount: '¥198,000',
        inspectionNote: '配送中の破損確認。保険申請済み。',
        finalDecision: 'repair'
      }
    ] : [];

    return filter === 'all' ? allReturns : 
      filter === 'completed' ? allReturns.filter(r => ['approved', 'rejected', 'refunded'].includes(r.status)) :
      allReturns.filter(r => r.status === filter);
  }, [filter, returnsData]);

  const paginatedReturns = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredReturns.slice(startIndex, endIndex);
  }, [filteredReturns, currentPage, itemsPerPage]);

  const totalItems = filteredReturns.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleStartInspection = (returnItem: ReturnItem) => {
    setSelectedRelistingItem(returnItem);
    setIsRelistingModalOpen(true);
    showToast({
      title: '検品開始',
      message: `${returnItem.productName}の検品・再出品業務フローを開始します`,
      type: 'info'
    });
  };

  const handlePhotoUpload = (files: FileList | null) => {
    if (files) {
      const newPhotos = Array.from(files);
      setInspectionPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setInspectionPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompleteInspection = () => {
    if (!selectedReturn) return;
    
    if (!finalDecision) {
      showToast({
        title: '判定未選択',
        message: '最終判定を選択してください',
        type: 'warning'
      });
      return;
    }
    
    showToast({
      title: '検品完了',
      message: `${selectedReturn.productName}の返品検品が完了しました (判定: ${getDecisionLabel(finalDecision)}) (倉庫保管中)`,
      type: 'success'
    });
    
    setSelectedReturn(null);
    setInspectionNote('');
    setFinalDecision('');
  };

  const handleUnsellableList = () => {
    showToast({
      title: '再販不可リスト',
      message: '再販不可商品リストを表示します。',
      type: 'info'
    });
    setIsUnsellableModalOpen(false);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '入庫待ち';
      case 'inspecting': return '保管作業中';
      case 'approved': return '承認済み';
      case 'rejected': return '拒否';
      case 'refunded': return '返金完了';
      default: return status;
    }
  };

  const getDecisionLabel = (decision: string) => {
    switch (decision) {
      case 'resell': return '再販可能';
      case 'repair': return '修理必要';
      case 'dispose': return '廃棄';
      default: return decision;
    }
  };

  const handleViewDetails = (returnItem: ReturnItem) => {
    setSelectedDetailItem(returnItem);
    setIsDetailModalOpen(true);
  };

  const handleApproveReturn = (returnItem: ReturnItem) => {
    showToast({
      title: '返品承認',
      message: `${returnItem.productName}の返品を承認しました`,
      type: 'success'
    });
  };

  const handleRejectReturn = (returnItem: ReturnItem) => {
    showToast({
      title: '返品拒否',
      message: `${returnItem.productName}の返品を拒否しました`,
      type: 'warning'
    });
  };

  const handleProcessRefund = (returnItem: ReturnItem) => {
    showToast({
      title: '返金処理',
      message: `${returnItem.refundAmount}の返金処理を開始しました`,
      type: 'success'
    });
  };

  const handleStartRelisting = (returnItem: ReturnItem) => {
    setSelectedRelistingItem(returnItem);
    setIsRelistingModalOpen(true);
    showToast({
      title: '再出品業務フロー',
      message: `${returnItem.productName}の再出品業務フローを開始します`,
      type: 'info'
    });
  };

  const headerActions = (
    <NexusButton
      onClick={() => setIsUnsellableModalOpen(true)}
      variant="primary"
      icon={<ExclamationCircleIcon className="w-5 h-5" />}
    >
      再販不可リスト
    </NexusButton>
  );

  if (!mounted) {
    return (
      <DashboardLayout userType="staff">
        <div className="space-y-6">
          <UnifiedPageHeader
            title="返品管理"
            subtitle="返品商品の検品と再出品を管理します"
            userType="staff"
            iconType="returns"
          />
          <div className="flex items-center justify-center min-h-[400px]">
            <NexusLoadingSpinner size="lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout userType="staff">
        <div className="space-y-6">
          <UnifiedPageHeader
            title="返品管理"
            subtitle="返品商品の検品と再出品を管理します"
            userType="staff"
          />
          <div className="flex items-center justify-center min-h-[400px]">
            <NexusLoadingSpinner size="lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userType="staff">
        <div className="space-y-6">
          <UnifiedPageHeader
            title="返品管理"
            subtitle="返品商品の検品と再出品を管理します"
            userType="staff"
          />
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <ExclamationCircleIcon className="w-16 h-16 text-nexus-red mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-nexus-text-primary mb-2">
                データの取得に失敗しました
              </h3>
              <p className="text-nexus-text-secondary mb-4">{error}</p>
              <NexusButton
                onClick={() => window.location.reload()}
                variant="primary"
              >
                再試行
              </NexusButton>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }



  if (!mounted) {
    return (
      <DashboardLayout userType="staff">
        <div className="space-y-6">
          <UnifiedPageHeader
            title="返品管理"
            subtitle="返品商品の検品と再出品を管理します"
            userType="staff"
            iconType="returns"
          />
          <div className="flex items-center justify-center min-h-[400px]">
            <NexusLoadingSpinner size="lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout userType="staff">
        <div className="space-y-6">
          <UnifiedPageHeader
            title="返品管理"
            subtitle="返品商品の検品と再出品を管理します"
            userType="staff"
            iconType="returns"
          />
          <div className="flex items-center justify-center min-h-[400px]">
            <NexusLoadingSpinner size="lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userType="staff">
        <div className="space-y-6">
          <UnifiedPageHeader
            title="返品管理"
            subtitle="返品商品の検品と再出品を管理します"
            userType="staff"
            iconType="returns"
          />
          <ContentCard>
            <div className="text-center py-12">
              <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">エラーが発生しました</h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => window.location.reload()}
                >
                  再読み込み
                </button>
              </div>
            </div>
          </ContentCard>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* 統一ヘッダー */}
        <UnifiedPageHeader
          title="返品管理"
          subtitle="顧客からの返品リクエストを処理"
          userType="staff"
          iconType="returns"
          actions={headerActions}
        />



        {/* 返品検品メインコンテンツ */}
        <div className="space-y-6">
            {selectedReturn ? (
              <>
                <button
                  onClick={() => setSelectedReturn(null)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                  返品リストに戻る
                </button>
                <ReturnInspection />
              </>
            ) : (
              <>


                {/* 返品リスト */}
                {!isUnsellableModalOpen && !isRelistingModalOpen && !isDetailModalOpen && (
                  <div className="intelligence-card oceania">

                    <div className="p-6">
                      
                      {/* フィルター */}
                      <div className="flex gap-1 bg-nexus-bg-secondary p-1 rounded-lg mb-6">
                        <button
                          onClick={() => setFilter('all')}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            filter === 'all' 
                              ? 'bg-nexus-bg-primary text-nexus-yellow shadow-sm' 
                              : 'text-nexus-text-secondary hover:text-nexus-text-primary'
                          }`}
                        >
                          すべて
                        </button>
                        {(returnStatuses?.parsedValue ? returnStatuses.parsedValue : [
                          { key: 'pending', nameJa: '入庫待ち' },
                          { key: 'inspecting', nameJa: '保管作業中' },
                          { key: 'completed', nameJa: '完了' }
                        ]).map((status: any) => (
                          <button
                            key={status.key}
                            onClick={() => setFilter(status.key)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                              filter === status.key 
                                ? 'bg-nexus-bg-primary text-nexus-yellow shadow-sm' 
                                : 'text-nexus-text-secondary hover:text-nexus-text-primary'
                            }`}
                          >
                            {status.nameJa}
                          </button>
                        ))}
                      </div>
                      
                      <div className="holo-table">
                        <table className="w-full">
                          <thead className="holo-header">
                            <tr>
                              <th className="text-left py-3 px-4">注文ID</th>
                              <th className="text-left py-3 px-4">商品</th>
                              <th className="text-left py-3 px-4">返品日</th>
                              <th className="text-left py-3 px-4">理由</th>
                              <th className="text-left py-3 px-4">顧客</th>
                              <th className="text-center py-3 px-4">ステータス</th>
                              <th className="text-center py-3 px-4">操作</th>
                            </tr>
                          </thead>
                          <tbody className="holo-body">
                            {paginatedReturns.map((item) => (
                              <tr key={item.id} className="holo-row">
                                <td className="py-4 px-4 font-mono text-sm">{item.orderId}</td>
                                <td className="py-4 px-4 font-medium">{item.productName}</td>
                                <td className="py-4 px-4">{item.returnDate}</td>
                                <td className="py-4 px-4">{item.returnReason}</td>
                                <td className="py-4 px-4">{item.customer}</td>
                                <td className="text-center py-4 px-4">
                                  <BusinessStatusIndicator 
                                    status={
                                      item.status === 'inspecting' ? 'inspection' :
                                      item.status === 'approved' ? 'completed' :
                                      item.status === 'rejected' ? 'cancelled' :
                                      item.status === 'refunded' ? 'completed' :
                                      item.status
                                    } 
                                  />
                                </td>
                                <td className="text-center py-4 px-4">
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      onClick={() => handleViewDetails(item)}
                                      className="nexus-button text-sm"
                                    >
                                      詳細
                                    </button>
                                    {item.status === 'pending' && (
                                      <button
                                        onClick={() => handleStartInspection(item)}
                                        className="nexus-button primary text-sm"
                                      >
                                        検品開始
                                      </button>
                                    )}
                                    {item.status === 'inspecting' && (
                                      <>
                                        <button
                                          onClick={() => handleApproveReturn(item)}
                                          className="nexus-button primary text-sm"
                                        >
                                          承認
                                        </button>
                                        <button
                                          onClick={() => handleRejectReturn(item)}
                                          className="nexus-button text-sm"
                                        >
                                          拒否
                                        </button>
                                      </>
                                    )}
                                    {item.status === 'approved' && (
                                      <button
                                        onClick={() => handleProcessRefund(item)}
                                        className="nexus-button primary text-sm"
                                      >
                                        返金処理
                                      </button>
                                    )}
                                    {item.status === 'refunded' && (
                                      <button
                                        onClick={() => handleStartRelisting(item)}
                                        className="nexus-button primary text-sm"
                                      >
                                        再出品
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* ページネーション */}
                      {totalItems > 0 && (
                        <div className="mt-6 pt-4 border-t border-nexus-border">
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={setItemsPerPage}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>



        {/* Unsellable Items Modal */}
        <BaseModal
          isOpen={isUnsellableModalOpen}
          onClose={() => setIsUnsellableModalOpen(false)}
          title="再販不可商品リスト"
          size="lg"
        >
          <div className="space-y-6">
            <div className="text-sm text-nexus-text-secondary">
              販売できない商品の一覧です。破損、欠陥、法的問題等で再販不可となった商品を表示しています。
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-nexus-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-nexus-text-secondary">商品名</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-nexus-text-secondary">理由</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-nexus-text-secondary">日付</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-nexus-text-secondary">処理</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-nexus-border">
                    <td className="py-3 px-4 text-sm text-nexus-text-primary">Canon EOS R5（破損品）</td>
                    <td className="py-3 px-4 text-sm text-nexus-text-secondary">配送中破損・修理不能</td>
                    <td className="py-3 px-4 text-sm text-nexus-text-secondary">2024-06-25</td>
                    <td className="py-3 px-4 text-sm">
                      <BusinessStatusIndicator status="storage" />
                    </td>
                  </tr>
                  <tr className="border-b border-nexus-border">
                    <td className="py-3 px-4 text-sm text-nexus-text-primary">Rolex Submariner（偽物）</td>
                    <td className="py-3 px-4 text-sm text-nexus-text-secondary">真贋鑑定で偽物判定</td>
                    <td className="py-3 px-4 text-sm text-nexus-text-secondary">2024-06-24</td>
                    <td className="py-3 px-4 text-sm">
                      <BusinessStatusIndicator status="inspection" />
                    </td>
                  </tr>
                  <tr className="border-b border-nexus-border">
                    <td className="py-3 px-4 text-sm text-nexus-text-primary">iPhone 15 Pro（水没）</td>
                    <td className="py-3 px-4 text-sm text-nexus-text-secondary">水没による基板損傷</td>
                    <td className="py-3 px-4 text-sm text-nexus-text-secondary">2024-06-23</td>
                    <td className="py-3 px-4 text-sm">
                      <BusinessStatusIndicator status="storage" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="text-right">
              <NexusButton onClick={handleUnsellableList} variant="primary">
                詳細管理画面へ
              </NexusButton>
            </div>
          </div>
        </BaseModal>

        {/* 再出品業務フローモーダル */}
        <BaseModal
          isOpen={isRelistingModalOpen}
          onClose={() => {
            setIsRelistingModalOpen(false);
            setSelectedRelistingItem(null);
          }}
          title={`再出品業務フロー - ${selectedRelistingItem?.productName || ''}`}
          size="lg"
        >
          <div className="space-y-3">
            {selectedRelistingItem && (
              <ReturnRelistingFlow />
            )}
          </div>
        </BaseModal>

        {/* 詳細表示モーダル */}
        <BaseModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedDetailItem(null);
          }}
          title={`返品詳細 - ${selectedDetailItem?.productName || ''}`}
          size="lg"
        >
          <div className="space-y-3">
            {selectedDetailItem && (
              <div className="space-y-3">
                {/* 基本情報 */}
                <div className="intelligence-card global">
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-nexus-text-primary mb-3">基本情報</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-nexus-text-secondary">注文番号</label>
                        <p className="text-nexus-text-primary font-mono text-sm">{selectedDetailItem.orderId}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-nexus-text-secondary">商品ID</label>
                        <p className="text-nexus-text-primary font-mono text-sm">{selectedDetailItem.productId}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-nexus-text-secondary">商品名</label>
                        <p className="text-nexus-text-primary text-sm">{selectedDetailItem.productName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-nexus-text-secondary">顧客</label>
                        <p className="text-nexus-text-primary text-sm">{selectedDetailItem.customer}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 返品情報 */}
                <div className="intelligence-card global">
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-nexus-text-primary mb-3">返品情報</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-nexus-text-secondary">返品日</label>
                        <p className="text-nexus-text-primary text-sm">{selectedDetailItem.returnDate}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-nexus-text-secondary">返品理由</label>
                        <p className="text-nexus-text-primary text-sm">{selectedDetailItem.returnReason}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-nexus-text-secondary">元の状態</label>
                        <p className="text-nexus-text-primary text-sm">{selectedDetailItem.originalCondition}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-nexus-text-secondary">返品時状態</label>
                        <p className="text-nexus-text-primary text-sm">{selectedDetailItem.returnedCondition}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ステータス・処理情報 */}
                <div className="intelligence-card global">
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-nexus-text-primary mb-3">処理情報</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-nexus-text-secondary">現在ステータス</label>
                        <p className="text-nexus-text-primary text-sm">{getStatusLabel(selectedDetailItem.status)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-nexus-text-secondary">担当者</label>
                        <p className="text-nexus-text-primary text-sm">{selectedDetailItem.inspector}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-nexus-text-secondary">返金金額</label>
                        <p className="text-nexus-text-primary text-sm">{selectedDetailItem.refundAmount}</p>
                      </div>
                      {selectedDetailItem.finalDecision && (
                        <div>
                          <label className="text-sm font-medium text-nexus-text-secondary">最終判定</label>
                          <p className="text-nexus-text-primary text-sm">{getDecisionLabel(selectedDetailItem.finalDecision)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 顧客メモ */}
                {selectedDetailItem.customerNote && (
                  <div className="intelligence-card global">
                    <div className="p-4">
                      <h3 className="text-base font-semibold text-nexus-text-primary mb-3">顧客メモ</h3>
                      <p className="text-nexus-text-primary text-sm whitespace-pre-wrap">{selectedDetailItem.customerNote}</p>
                    </div>
                  </div>
                )}

                {/* 検品メモ */}
                {selectedDetailItem.inspectionNote && (
                  <div className="intelligence-card global">
                    <div className="p-4">
                      <h3 className="text-base font-semibold text-nexus-text-primary mb-3">検品メモ</h3>
                      <p className="text-nexus-text-primary text-sm whitespace-pre-wrap">{selectedDetailItem.inspectionNote}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </BaseModal>
      </div>
    </DashboardLayout>
  );
}
