'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
import UnifiedPageHeader from '../components/ui/UnifiedPageHeader';
import { useState, useEffect, useMemo } from 'react';
import {
  EyeIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { NexusInput, NexusButton, NexusLoadingSpinner, NexusSelect, BusinessStatusIndicator, Pagination } from '@/app/components/ui';
import BaseModal from '../components/ui/BaseModal';
import ListingFormModal from '@/app/components/modals/ListingFormModal';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { useProductStatuses, getNameByKey } from '@/lib/hooks/useMasterData';
import ProductDetailModal from '../components/features/seller/ProductDetailModal';

type SortField = 'name' | 'sku' | 'status' | 'price';
type SortDirection = 'asc' | 'desc';

// 品質ランクバッジを生成する関数
const getConditionBadge = (condition: string) => {
  const conditionConfig: Record<string, { bg: string; text: string; label: string }> = {
    unused: { bg: 'bg-emerald-800', text: 'text-white', label: '新品' },
    top_mint: { bg: 'bg-green-800', text: 'text-white', label: 'ほぼ新品' },
    mint: { bg: 'bg-green-700', text: 'text-white', label: 'ほぼ新品' },
    near_mint: { bg: 'bg-blue-800', text: 'text-white', label: '極美品' },
    excellent: { bg: 'bg-blue-700', text: 'text-white', label: '美品' },
    very_good: { bg: 'bg-indigo-700', text: 'text-white', label: '良品' },
    as_is: { bg: 'bg-yellow-700', text: 'text-white', label: '現状品' },
    for_parts: { bg: 'bg-red-800', text: 'text-white', label: 'ジャンク' },
    clad: { bg: 'bg-purple-800', text: 'text-white', label: '整備済み' }
  };

  const defaultConfig = { bg: 'bg-gray-600', text: 'text-white', label: condition };

  const config = conditionConfig[condition] || defaultConfig;

  return (
    <span className={`
      inline-flex items-center
      px-3 py-1.5
      rounded-lg
      border-2
      font-bold
      text-xs
      uppercase
      tracking-wide
      ${config.bg}
      ${config.text}
      border-current
    `}>
      {config.label}
    </span>
  );
};

export default function InventoryPage() {
  const { showToast } = useToast();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isListingFormModalOpen, setIsListingFormModalOpen] = useState(false);
  const [selectedListingProduct, setSelectedListingProduct] = useState<any>(null);
  
  // マスタデータの取得
  const { statuses: productStatuses, loading: statusesLoading } = useProductStatuses();
  
  // フィルター・ソート状態
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // ページネーション状態
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    // APIからデータを取得
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('📡 セラー在庫データ取得開始...', { currentPage, itemsPerPage });
        
        // ページングパラメーターを含めてAPIリクエスト
        const searchParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString()
        });
        
        if (selectedStatus !== 'all') {
          searchParams.set('status', selectedStatus);
        }
        if (searchQuery.trim()) {
          searchParams.set('search', searchQuery);
        }
        
        const response = await fetch(`/api/inventory?${searchParams.toString()}`);
        console.log('📡 APIレスポンス:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`API エラー: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // APIレスポンスからページネーション情報を取得
        const paginationInfo = data.pagination || {};
        
        console.log('📦 取得データ:', {
          dataKeys: Object.keys(data),
          productsCount: data.data?.length || 0,
          firstProduct: data.data?.[0]?.name || 'なし',
          paginationInfo
        });
        
        // サーバーサイドページネーションのため、取得したデータをそのまま設定
        setInventory(data.data || []);
        // DEMOカメラ06のデータ構造をデバッグ
        const demoCamera06 = data.data?.find(item => item.name?.includes('DEMOカメラ０６'));
        if (demoCamera06) {
          console.log('🔍 DEMOカメラ０６の全データ:');
          console.log('名前:', demoCamera06.name);
          console.log('価格フィールド:', demoCamera06.price);
          console.log('metadata全体:', demoCamera06.metadata);
          if (demoCamera06.metadata) {
            console.log('metadataのキー:', Object.keys(demoCamera06.metadata));
            console.log('deliveryPlanInfo:', demoCamera06.metadata.deliveryPlanInfo);
            if (demoCamera06.metadata.deliveryPlanInfo) {
              console.log('deliveryPlanInfo.purchasePrice:', demoCamera06.metadata.deliveryPlanInfo.purchasePrice);
            }
          }
          console.log('JSONダンプ:', JSON.stringify(demoCamera06.metadata, null, 2));
        }
        
        // ページネーション情報を設定
        setTotalItems(paginationInfo.total || (data.data?.length || 0));
        setTotalPages(paginationInfo.pages || 1);
      } catch (error) {
        console.error('在庫データ取得エラー:', error);
        // Toast の表示を次のフレームまで遅延
        setTimeout(() => {
          showToast({
            title: 'エラー',
            message: '在庫データの取得に失敗しました',
            type: 'error'
          });
        }, 0);
      } finally {
        setLoading(false);
      }
    };

    // 非同期関数を適切に処理
    fetchData().catch(error => {
      console.error('Fetch data error:', error);
    });
  }, [currentPage, itemsPerPage, selectedStatus, searchQuery]); // フィルター変更時も再取得


  // ステータスオプション（セラー在庫管理画面専用）
  const statusOptions = useMemo(() => {
    // セラー在庫管理画面で必要なステータスのみをフィルターオプションとして提供
    const inventoryStatusOptions = [
      { value: 'all', label: 'すべてのステータス' },
      { value: 'inbound', label: '入庫待ち' },  // 検品管理の入庫待ちに対応
      { value: 'inspection', label: '保管作業中' },  // 検品管理の保管作業中・梱包完了に対応
      { value: 'storage', label: '保管中' },  // 検品管理の保管中に対応
      { value: 'listing', label: '出品中' },
      { value: 'sold', label: '購入者決定' },
      { value: 'cancelled', label: 'キャンセル' },
      { value: 'returned', label: '返品' },
      { value: 'on_hold', label: '保留中' },
      { value: 'ordered', label: '出荷準備中' },  // 出荷準備中を追加
      { value: 'shipping', label: '出荷済み' }  // 出荷済みを追加
    ];
    
    return inventoryStatusOptions;
  }, []); // 静的なリストなので依存関係は空

  // フィルター変更時のページリセット
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [selectedStatus, searchQuery]);

  // サーバーサイドページネーション対応のため、フィルタリングはAPIで処理済み
  // クライアント側では取得したデータをそのまま使用
  const filteredInventory = inventory;

  // ソート
  const sortedInventory = useMemo(() => {
    const sorted = [...filteredInventory].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'sku':
          aValue = a.sku;
          bValue = b.sku;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'price':
          aValue = a.metadata?.purchasePrice || a.metadata?.deliveryPlanInfo?.purchasePrice || a.price || 0;
          bValue = b.metadata?.purchasePrice || b.metadata?.deliveryPlanInfo?.purchasePrice || b.price || 0;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredInventory, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4" />
    ) : (
      <ChevronDownIcon className="w-4 h-4" />
    );
  };



  const convertStatusToKey = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'inbound': 'inbound',
      'inspection': 'inspection', 
      'storage': 'storage',
      'listing': 'listing',
      'ordered': 'ordered', // 出荷準備中
      'workstation': 'ordered', // workstation → ordered（出荷準備中として表示）
      'shipping': 'shipping',
      'sold': 'sold',
      'returned': 'returned',
      'on_hold': 'on_hold'
    };
    return statusMap[status] || status;
  };

  const handleViewProduct = (product: any) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleOpenListingForm = (product: any) => {
    if (!product) {
      console.log('❌ handleOpenListingForm: product is null or undefined');
      return;
    }

    console.log('🚀 eBayリスティングフォームを開く:', { productId: product.id, productName: product.name });
    setSelectedListingProduct(product);
    setIsListingFormModalOpen(true);
    
    // 詳細モーダルが開いている場合は閉じる
    setIsDetailModalOpen(false);
    setSelectedProduct(null);
  };

  const handleListingSuccess = async () => {
    console.log('✅ eBay出品成功');
    showToast({
      title: '出品完了',
      message: 'eBayへの出品が完了しました。在庫リストを更新しています...',
      type: 'success'
    });
    
    // リスティングフォームを閉じる
    setIsListingFormModalOpen(false);
    setSelectedListingProduct(null);
    
    // インベントリを再読み込み - 出品後のステータス変更を反映
    console.log('🔄 在庫データ再読み込み中...');
    try {
      await fetchData(); // 既存のデータ取得関数を再実行
      console.log('✅ 在庫データ再読み込み完了');
    } catch (error) {
      console.error('❌ 在庫データ再読み込みエラー:', error);
    }
  };

  const handleListingFormClose = () => {
    setIsListingFormModalOpen(false);
    setSelectedListingProduct(null);
  };



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
          title="在庫管理"
          subtitle="商品の在庫状況を管理・確認"
          userType="seller"
          iconType="inventory"
        />

        {/* 商品一覧 - 統合版 */}
        <div className="intelligence-card oceania">
          
          {/* フィルター・検索部分（タイトル削除版） */}
          <div className="p-6 border-b border-nexus-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NexusSelect
                label="ステータス"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                options={statusOptions}
                useCustomDropdown={true}
              />

              <NexusInput
                type="text"
                label="検索"
                placeholder="商品名・SKU・カテゴリーで検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* テーブル */}
          <div className="p-6">
            <div className="overflow-x-auto">
            <table className="holo-table" data-testid="inventory-table">
              <thead className="holo-header">
                <tr>
                  <th className="p-4 text-center text-xs font-medium text-nexus-text-secondary uppercase tracking-wider">画像</th>
                  <th 
                    className="p-4 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      商品名
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th
                    className="p-4 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('sku')}
                  >
                    <div className="flex items-center gap-1">
                      SKU
                      {getSortIcon('sku')}
                    </div>
                  </th>
                  <th className="p-4 text-center text-xs font-medium text-nexus-text-secondary uppercase tracking-wider">カテゴリー</th>
                  <th className="p-4 text-center text-xs font-medium text-nexus-text-secondary uppercase tracking-wider">更新日</th>
                  <th 
                    className="p-4 text-center text-xs font-medium text-nexus-text-secondary uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      ステータス
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th className="p-4 text-center text-xs font-medium text-nexus-text-secondary uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody>
                {sortedInventory.map((item) => (
                  <tr 
                    key={item.id}
                    className="border-b border-nexus-border hover:bg-nexus-bg-tertiary transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex justify-center">
                        <div className="w-20 h-20 overflow-hidden rounded-lg border border-nexus-border bg-gray-100">
                          {(item.imageUrl || (item.images && item.images.length > 0)) ? (
                            <img
                              src={item.imageUrl || item.images[0].url || item.images[0].thumbnailUrl || item.images[0]}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => { e.currentTarget.src = '/api/placeholder/80/80'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-xs text-gray-400">画像なし</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-sm text-nexus-text-primary">
                        {item.name}
                      </div>
                      {/* 一覧では備考は表示しない */}
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm text-nexus-text-primary">
                        {item.sku}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm text-nexus-text-primary">
                        {getNameByKey(productStatuses, item.category) || item.category}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm text-nexus-text-secondary">
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        }) : '未設定'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <BusinessStatusIndicator 
                          status={convertStatusToKey(item.status) as any} 
                          size="sm" 
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <NexusButton
                          onClick={() => handleViewProduct(item)}
                          size="sm"
                          variant="secondary"
                          icon={<EyeIcon className="w-4 h-4" />}
                        >
                          詳細
                        </NexusButton>
                        {item.status === 'storage' && (
                          <NexusButton
                            onClick={() => handleOpenListingForm(item)}
                            size="sm"
                            variant="primary"
                            icon={<ShoppingCartIcon className="w-4 h-4" />}
                          >
                            出品
                          </NexusButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedInventory.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-nexus-text-secondary">
                      {searchQuery || selectedStatus !== 'all'
                        ? '検索条件に一致する商品がありません' 
                        : '商品データがありません'
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>

            {/* ページネーション */}
            {!loading && totalItems > 0 && (
              <div className="mt-6 pt-6 px-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              </div>
            )}
          </div>
        </div>

        {/* 商品詳細モーダル */}
        <ProductDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onOpenListingForm={handleOpenListingForm}
        />

        {/* eBayリスティングフォームモーダル */}
        <ListingFormModal
          isOpen={isListingFormModalOpen}
          onClose={handleListingFormClose}
          product={selectedListingProduct}
          onSuccess={handleListingSuccess}
        />
      </div>
    </DashboardLayout>
  );
}