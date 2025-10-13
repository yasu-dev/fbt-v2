'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import UnifiedPageHeader from '@/app/components/ui/UnifiedPageHeader';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusInput from '@/app/components/ui/NexusInput';
import NexusSelect from '@/app/components/ui/NexusSelect';
import { BusinessStatusIndicator } from '@/app/components/ui/StatusIndicator';
import { NexusLoadingSpinner } from '@/app/components/ui';
import Pagination from '@/app/components/ui/Pagination';
import {
  BookOpenIcon,
  CameraIcon,
  XMarkIcon,
  CheckIcon,
  ClipboardDocumentListIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  SparklesIcon,
  PhotoIcon,
  ArchiveBoxIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import { 
  AlertCircle, 
  Package,
  Camera,
  Archive,
  Store,
  CheckCircle2,
  Clock4,
  Play,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import BaseModal from '@/app/components/ui/BaseModal';
import NexusTextarea from '@/app/components/ui/NexusTextarea';
import { parseProductMetadata, getInspectionPhotographyStatus } from '@/lib/utils/product-status';

interface ChecklistItem {
  id: string;
  label: string;
  type: 'boolean' | 'rating' | 'measurement';
  required: boolean;
  value?: any;
  notes?: string;
}

interface ChecklistCategory {
  name: string;
  items: ChecklistItem[];
}

interface ChecklistTemplate {
  id: string;
  name: string;
  categories: ChecklistCategory[];
}

interface InspectionTask {
  id: string;
  title: string;
  productId: string;
  productName: string;
  type: 'camera' | 'watch' | 'lens' | 'accessory';

  assignee: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  location: string;
  value: string;
  category: string;
}

interface InspectionData {
  checklistTemplates: {
    [key: string]: ChecklistTemplate;
  };
  inspectionHistory: any[];
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  model: string;
  status: 'pending_inspection' | 'inspecting' | 'completed' | 'failed';
  receivedDate: string;

  imageUrl?: string;
  metadata?: string; // メタデータフィールド追加
}

type SortField = 'name' | 'sku' | 'category' | 'receivedDate' | 'status';
type SortDirection = 'asc' | 'desc';
type BusinessStatus = 'inbound' | 'inspection' | 'completed' | 'rejected' | 'pending' | 'processing';

// *** モックデータを完全に削除 - SQLiteデータベースのみ使用 ***

const categoryLabels = {
  camera: 'カメラ',
  watch: '腕時計'
};

// ステータス変換関数（BusinessStatusIndicatorに合わせる）
const convertStatusToBusinessStatus = (status: string): BusinessStatus => {
  switch (status) {
    case 'inbound':
      return 'inbound';  // 入荷待ち
    case 'inspection':
      return 'inspection';  // 検品中
    case 'storage':
      return 'completed';  // 完了
    case 'rejected':
      return 'rejected';  // 拒否
    default:
      return 'inbound';
  }
};

export default function InspectionPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [progressData, setProgressData] = useState<{[key: string]: {currentStep: number, lastUpdated: string}}>({});
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');



  // ステップ名を取得するヘルパー関数
  const getStepName = (step: number): string => {
    switch (step) {
      case 1: return '検品項目';
      case 2: return '写真撮影';
      case 3: return '梱包・ラベル';
      case 4: return '棚保管';
      default: return '不明';
    }
  };

  // *** モックデータのステータス更新機能を削除 - SQLiteデータベース更新のみ ***

  // フィルター・ソート・ページング状態
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [selectedInspectionPhotoStatus, setSelectedInspectionPhotoStatus] = useState<string>('all'); // 検品・撮影状況フィルター追加
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('receivedDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // 保存された状態を復元する関数
  const restoreSavedState = () => {
    try {
      // *** モックデータ復元処理を削除 - SQLiteからの取得のみ ***

      const savedState = sessionStorage.getItem('inspectionListState');
      if (savedState) {
        const state = JSON.parse(savedState);
        
        // 1時間以内のデータのみ復元（古いデータは無視）
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - state.timestamp < oneHour) {
          setSelectedStatus(state.selectedStatus || 'all');
          setSelectedCategory(state.selectedCategory || 'all');
    
          setSelectedInspectionPhotoStatus(state.selectedInspectionPhotoStatus || 'all');
          setSearchQuery(state.searchQuery || '');
          setSortField(state.sortField || 'receivedDate');
          setSortDirection(state.sortDirection || 'desc');
          setCurrentPage(state.currentPage || 1);
          
          // 状態復元を通知
          showToast({
            type: 'info',
            title: '前回の表示状態を復元しました',
            message: 'フィルター・検索条件が復元されています',
            duration: 3000
          });
          
          // 復元後はsessionStorageから削除
          sessionStorage.removeItem('inspectionListState');
        }
      }
    } catch (error) {
      console.error('[ERROR] Failed to restore saved state:', error);
    }
  };

  // SQLiteデータベースから商品データを取得する関数
  const fetchProductsFromDatabase = async () => {
    try {
      console.log('[DEBUG] 検品ページ: SQLiteから商品データを取得開始');
      setLoading(true);
      
      const response = await fetch('/api/inventory?limit=100');
      if (response.ok) {
        const result = await response.json();
        const inventoryData = result.data || [];
        
        console.log(`[DEBUG] 検品ページ: SQLiteから${inventoryData.length}件の商品データを取得`);
        
        // 在庫データを検品用データに変換
        const inspectionProducts: Product[] = inventoryData.map((item: any) => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          brand: item.metadata?.brand || 'Unknown',
          model: item.metadata?.model || 'Unknown', 
          status: convertInventoryStatusToInspectionStatus(item.status),
          receivedDate: item.entryDate,
          imageUrl: item.imageUrl || '/api/placeholder/150/150',
          metadata: item.metadata
        }));
        
        console.log(`[DEBUG] 検品ページ: ${inspectionProducts.length}件の商品データを設定完了`);
        setProducts(inspectionProducts);
      } else {
        console.error('[ERROR] 検品ページ: 商品データ取得失敗', response.status);
        setProducts([]);
      }
    } catch (error) {
      console.error('[ERROR] 検品ページ: 商品データ取得エラー', error);
      setProducts([]);
      showToast({
        type: 'error',
        title: 'データ読み込みエラー',
        message: '商品データの取得に失敗しました',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // 進捗データを読み込む関数
  const loadProgressData = async () => {
    try {
      const response = await fetch('/api/products/inspection/progress/all');
      if (response.ok) {
        const list = await response.json();
        console.log('[DEBUG] 進捗データ取得結果:', JSON.stringify(list, null, 2));
        
        // APIは配列を返すため、製品IDをキーにしたマップへ整形
        const mapped: { [key: string]: { currentStep: number; lastUpdated: string } } = {};
        (list || []).forEach((item: any) => {
          if (item?.productId) {
            mapped[item.productId] = {
              currentStep: item.currentStep,
              lastUpdated: item.lastUpdated || item.updatedAt || new Date().toISOString()
            };
          }
        });
        
        console.log('[DEBUG] 進捗データマッピング結果:', JSON.stringify(mapped, null, 2));
        setProgressData(mapped);
        
        // 商品ステータスから進捗を推定する機能を追加
        estimateProgressFromProductStatus();
      }
    } catch (error) {
      console.error('[ERROR] Failed to load progress data:', error);
      // エラーの場合は商品ステータスから進捗を推定
      estimateProgressFromProductStatus();
    }
  };

  // 商品ステータスから進捗を推定する関数
  const estimateProgressFromProductStatus = () => {
    if (products.length === 0) return;
    
    const estimatedProgress: { [key: string]: { currentStep: number; lastUpdated: string } } = {};
    
    products.forEach(product => {
      let estimatedStep = 0;
      
      switch (product.status) {
        case 'pending_inspection':
          estimatedStep = 0;
          break;
        case 'inspecting':
          // メタデータから詳細な進捗を判定
          const metadata = parseProductMetadata(product.metadata);
          if (metadata.photographyCompleted) {
            estimatedStep = 4;
          } else if (metadata.inspectionCompleted) {
            estimatedStep = 2;
          } else {
            estimatedStep = 1;
          }
          break;
        case 'completed':
          estimatedStep = 4;
          break;
        default:
          estimatedStep = 0;
      }
      
      if (estimatedStep > 0) {
        estimatedProgress[product.id] = {
          currentStep: estimatedStep,
          lastUpdated: new Date().toISOString()
        };
      }
    });
    
    console.log('[DEBUG] ステータスから推定した進捗:', JSON.stringify(estimatedProgress, null, 2));
    
    // 既存の進捗データと統合
    setProgressData(prev => ({
      ...estimatedProgress,
      ...prev // 既存のデータを優先
    }));
  };

  // InventoryのstatusをInspectionのstatusに変換する関数
  const convertInventoryStatusToInspectionStatus = (inventoryStatus: string): 'pending_inspection' | 'inspecting' | 'completed' | 'failed' => {
    switch (inventoryStatus) {
      case 'inbound':
        return 'pending_inspection';
      case 'inspection':
        return 'inspecting';
      case 'storage':
        return 'completed';
      default:
        return 'pending_inspection';
    }
  };

  // コンポーネント初期化時に状態復元とデータ読み込み
  useEffect(() => {
    const initializeData = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('restored') === '1') {
      restoreSavedState();
      
      // URLからrestoredパラメーターを削除（履歴に残さない）
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
    
      // SQLiteデータベースから商品データを取得
      await fetchProductsFromDatabase();

      // 商品データ取得後に進捗データを読み込み
      await loadProgressData();
    };
    
    initializeData();
  }, []); // 初回のみ実行

  // 商品データが変更されたときに進捗を再推定
  useEffect(() => {
    if (products.length > 0) {
      estimateProgressFromProductStatus();
    }
  }, [products]);

  // 統計データ計算
  const inspectionStats = {
    total: products.length,
    pending: products.filter(p => p.status === 'pending_inspection').length,
    inspecting: products.filter(p => p.status === 'inspecting').length,
    completed: products.filter(p => p.status === 'completed').length,
    failed: products.filter(p => p.status === 'failed').length,
  };

  // タブごとのフィルタリング
  const tabFilters: Record<string, (product: Product) => boolean> = {
    'all': () => true,
    'pending_inspection': (product) => product.status === 'pending_inspection',
    'inspecting': (product) => product.status === 'inspecting',
    'completed': (product) => product.status === 'completed',
    'failed': (product) => product.status === 'failed',
  };

  // フィルタリング
  let filteredProducts = products.filter(product => {
    const tabMatch = tabFilters[activeTab] ? tabFilters[activeTab](product) : true;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.model.toLowerCase().includes(searchQuery.toLowerCase());
    
    return tabMatch && matchesStatus && matchesCategory && matchesSearch;
  });

  // 検品・撮影状況によるフィルタリング（ステップベース）
  if (selectedInspectionPhotoStatus !== 'all') {
    filteredProducts = filteredProducts.filter(product => {
      const progress = progressData[product.id];
      
      if (selectedInspectionPhotoStatus === 'not_started') {
        // 未開始 = プログレスデータがない
        return !progress;
      }
      
      if (selectedInspectionPhotoStatus === 'completed') {
        // 完了 = ステップ4まで完了している
        return progress && progress.currentStep >= 4;
      }
      
      if (selectedInspectionPhotoStatus.startsWith('step_')) {
        const stepNumber = parseInt(selectedInspectionPhotoStatus.replace('step_', ''));
        // 指定されたステップが現在のステップ
        return progress && progress.currentStep === stepNumber;
      }
      
      return true;
    });
  }

  // ソート
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let valueA: any = a[sortField];
    let valueB: any = b[sortField];
    
    if (sortField === 'receivedDate') {
      valueA = new Date(valueA);
      valueB = new Date(valueB);
    }
    
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // ページネーション
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  // ソート処理
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // ソートアイコン
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUpIcon className="w-4 h-4 opacity-30" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUpIcon className="w-4 h-4" /> : 
      <ChevronDownIcon className="w-4 h-4" />;
  };

  // 進捗ステップ表示用の関数
  const getProgressStepDisplay = (productId: string) => {
    const progress = progressData[productId];
    if (!progress) {
      return { label: '未開始', color: 'bg-gray-100 text-gray-800' };
    }
    
    switch (progress.currentStep) {
      case 1:
        return { label: '検品項目', color: 'bg-blue-100 text-blue-800' };
      case 2:
        return { label: '動画記録', color: 'bg-amber-100 text-amber-800' };
      case 3:
        return { label: '写真撮影', color: 'bg-purple-100 text-purple-800' };
      case 4:
        return { label: '確認完了', color: 'bg-green-100 text-green-800' };
      default:
        return { label: '未開始', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // 現在の画面状態を保存する関数
  const saveCurrentState = () => {
    const currentState = {
      selectedStatus,
      selectedCategory,
      selectedInspectionPhotoStatus,
      searchQuery,
      currentPage,
      sortField,
      sortDirection,
      timestamp: Date.now()
    };
    
    sessionStorage.setItem('inspectionListState', JSON.stringify(currentState));
  };

  // 検品開始（ページ遷移に統一）
  const handleStartInspection = (product: Product) => {
    saveCurrentState();
    window.location.href = `/staff/inspection/${product.id}`;
  };

  // 検品続行（ページ遷移に統一）
  const handleContinueInspection = (product: Product) => {
    saveCurrentState();
    const progress = progressData[product.id];
    // 梱包・ラベル（ステップ3）で中断している場合のみ、棚保管（ステップ4）に直接遷移
    const shouldJumpToStorage = progress && progress.currentStep === 3;
    const stepQuery = shouldJumpToStorage ? '?step=4' : '';
    window.location.href = `/staff/inspection/${product.id}${stepQuery}`;
  };

  // 商品詳細表示（統一化により不使用）
  const handleViewProduct = (product: Product) => {
    // 詳細表示も統一のため、検品画面に遷移
    saveCurrentState();
    window.location.href = `/staff/inspection/${product.id}`;
  };

  // 行の展開/折りたたみ
  const toggleRowExpansion = (productId: string) => {
    setExpandedRows(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // カテゴリー選択肢
  const categoryOptions = [
    { value: 'all', label: 'すべてのカテゴリー' },
    ...Object.entries(categoryLabels).map(([key, label]) => ({ value: key, label }))
  ];



  // ステータス選択肢
  const statusOptions = [
    { value: 'all', label: 'すべてのステータス' },
    { value: 'pending_inspection', label: '入荷待ち' },
    { value: 'inspecting', label: '検品中' },
    { value: 'completed', label: '完了' },
    { value: 'failed', label: '不合格' }
  ];

  // 検品・撮影状況選択肢（ステップベース）
  const inspectionPhotoStatusOptions = [
    { value: 'all', label: 'すべての状況' },
    { value: 'not_started', label: '未開始' },
    { value: 'step_1', label: '検品項目' },
    { value: 'step_2', label: '写真撮影' },
    { value: 'step_3', label: '梱包・ラベル' },
    { value: 'step_4', label: '棚保管' },
    { value: 'completed', label: '完了' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <NexusLoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* 統一ヘッダー */}
        <UnifiedPageHeader
          title="検品管理"
          subtitle="商品の検品状況を管理できます"
          userType="staff"
          iconType="inspection"
        />

        {/* フィルター・検索セクション */}
        <div className="bg-white rounded-xl border border-nexus-border p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="w-5 h-5 text-nexus-text-secondary" />
            <h3 className="text-lg font-medium text-nexus-text-primary">フィルター・検索</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <NexusSelect
              label="ステータス"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={statusOptions}
            />

            <NexusSelect
              label="検品・撮影状況"
              value={selectedInspectionPhotoStatus}
              onChange={(e) => setSelectedInspectionPhotoStatus(e.target.value)}
              options={inspectionPhotoStatusOptions}
            />

            <NexusSelect
              label="カテゴリー"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={categoryOptions}
            />



            <NexusInput
              type="text"
              label="検索"
              placeholder="商品名・SKU・ブランドで検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>



        {/* ステータス別タブビュー */}
        <div className="bg-white rounded-xl border border-nexus-border p-4 sm:p-6">
          {/* タブヘッダー */}
          <div className="border-b border-nexus-border mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {[
                { id: 'all', label: '全体', count: inspectionStats.total },
                { id: 'pending_inspection', label: '入庫待ち', count: inspectionStats.pending },
                { id: 'inspecting', label: '検品中', count: inspectionStats.inspecting },
                { id: 'completed', label: '完了', count: inspectionStats.completed },
                { id: 'failed', label: '不合格', count: inspectionStats.failed },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-nexus-blue text-nexus-blue'
                      : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === tab.id ? 'bg-nexus-blue text-white' : 'bg-nexus-bg-secondary text-nexus-text-secondary'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-nexus-text-primary">検品リスト</h3>
              <p className="text-nexus-text-secondary mt-1 text-sm">
                {filteredProducts.length}件中 {Math.min(itemsPerPage, filteredProducts.length - (currentPage - 1) * itemsPerPage)}件を表示
              </p>
            </div>
          </div>
            
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-nexus-border">
                  <th className="text-left py-3 px-2 sm:px-4 text-sm font-medium text-nexus-text-secondary">商品情報</th>
                  <th 
                    className="text-left py-3 px-2 sm:px-4 text-sm font-medium text-nexus-text-secondary cursor-pointer hover:bg-nexus-bg-tertiary"
                    onClick={() => handleSort('sku')}
                  >
                    <div className="flex items-center gap-1">
                      SKU
                      {getSortIcon('sku')}
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-2 sm:px-4 text-sm font-medium text-nexus-text-secondary cursor-pointer hover:bg-nexus-bg-tertiary"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center gap-1">
                      カテゴリー
                      {getSortIcon('category')}
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-2 sm:px-4 text-sm font-medium text-nexus-text-secondary cursor-pointer hover:bg-nexus-bg-tertiary"
                    onClick={() => handleSort('receivedDate')}
                  >
                    <div className="flex items-center gap-1">
                      受領日
                      {getSortIcon('receivedDate')}
                    </div>
                  </th>

                  <th className="text-center py-3 px-2 sm:px-4 text-sm font-medium text-nexus-text-secondary">ステータス</th>
                  <th className="text-center py-3 px-2 sm:px-4 text-sm font-medium text-nexus-text-secondary">アクション</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => (
                  <React.Fragment key={product.id}>
                    <tr className="border-b border-nexus-border hover:bg-nexus-bg-tertiary">
                      <td className="py-3 px-2 sm:px-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <img
                            src={product.imageUrl || '/api/placeholder/60/60'}
                            alt={product.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-nexus-text-primary text-sm truncate">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <span className="font-mono text-xs sm:text-sm text-nexus-text-primary">{product.sku}</span>
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <span className="text-xs sm:text-sm text-nexus-text-primary">
                          {categoryLabels[product.category as keyof typeof categoryLabels] || product.category}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <span className="text-xs sm:text-sm text-nexus-text-primary">{product.receivedDate}</span>
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <div className="space-y-2">
                          <div className="flex justify-center">
                            <BusinessStatusIndicator 
                              status={convertStatusToBusinessStatus(product.status) as any}
                              size="sm"
                            />
                          </div>
                          <button
                            onClick={() => toggleRowExpansion(product.id)}
                            className="text-xs text-nexus-blue hover:text-nexus-blue-dark flex items-center gap-1 mx-auto"
                          >
                            <span>詳細を{expandedRows.includes(product.id) ? '隠す' : '見る'}</span>
                            <svg 
                              className={`w-3 h-3 transform transition-transform ${expandedRows.includes(product.id) ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <div className="flex justify-center gap-1 sm:gap-2">
                          {(() => {
                            const metadata = parseProductMetadata(product.metadata);
                            const inspectionPhotoStatus = getInspectionPhotographyStatus ? getInspectionPhotographyStatus(metadata) : null;

                            if (product.status === 'pending_inspection') {
                              return (
                                <NexusButton 
                                  size="sm" 
                                  variant="primary"
                                  onClick={() => handleStartInspection(product)}
                                >
                                  <span className="hidden sm:inline">検品開始</span>
                                  <span className="sm:hidden">開始</span>
                                </NexusButton>
                              );
                            }

                            if (product.status === 'inspecting') {
                              return (
                                <NexusButton 
                                  size="sm" 
                                  variant="primary"
                                  onClick={() => handleContinueInspection(product)}
                                >
                                  <span className="hidden sm:inline">続ける</span>
                                  <span className="sm:hidden">続行</span>
                                </NexusButton>
                              );
                            }

                            if (inspectionPhotoStatus?.canStartPhotography) {
                              return (
                                <NexusButton 
                                  size="sm" 
                                  variant="primary" 
                                  icon={<CameraIcon className="w-4 h-4" />}
                                  onClick={() => {
                                    saveCurrentState();
                                    window.location.href = `/staff/inspection/${product.id}?mode=photography`;
                                  }}
                                >
                                  <span className="hidden sm:inline">撮影</span>
                                  <span className="sm:hidden">撮影</span>
                                </NexusButton>
                              );
                            }

                            if (product.status === 'completed' || product.status === 'failed') {
                              return (
                                <NexusButton
                                  size="sm"
                                  variant="default"
                                  icon={<EyeIcon className="w-4 h-4" />}
                                  onClick={() => handleViewProduct(product)}
                                >
                                  <span className="hidden sm:inline">詳細</span>
                                  <span className="sm:hidden sr-only">詳細</span>
                                </NexusButton>
                              );
                            }

                            return null;
                          })()}
                        </div>
                      </td>
                    </tr>
                    
                    {/* 詳細展開行 */}
                    {expandedRows.includes(product.id) && (
                      <tr className="bg-nexus-bg-secondary">
                        <td colSpan={6} className="p-6">
                          <div className="space-y-4">
                            {/* 検品進捗表示 - リッチデザイン */}
                            <div className="bg-gradient-to-br from-nexus-bg-primary to-nexus-bg-secondary rounded-xl p-5 border border-nexus-border shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <div className="p-2 bg-nexus-blue/10 rounded-lg">
                                      <ClipboardDocumentListIcon className="w-5 h-5 text-nexus-blue" />
                                    </div>
                                    <h4 className="text-base font-semibold text-nexus-text-primary">検品進捗</h4>
                                  </div>
                                  <div className="text-xs text-nexus-text-secondary bg-nexus-bg-tertiary px-2 py-1 rounded-full">
                                    ID: {product.id.slice(-6)}
                                  </div>
                                </div>

                                {(() => {
                                  const progress = progressData[product.id];
                                  const currentStep = progress?.currentStep || 0;
                                  const lastUpdated = progress?.lastUpdated;
                                  
                                  return (
                                    <div className="space-y-4">
                                      {/* 統一されたプログレスバー */}
                                      <div className="relative">
                                        <div className="w-full bg-nexus-bg-tertiary rounded-full h-3 overflow-hidden border">
                                          <div 
                                            className={`h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden ${
                                              currentStep === 0 ? 'bg-gray-300' :
                                              currentStep >= 4 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                              'bg-gradient-to-r from-nexus-blue to-blue-600'
                                            }`}
                                            style={{ 
                                              width: `${Math.max(8, (currentStep / 4) * 100)}%`
                                            }}
                                          >
                                            {currentStep > 0 && currentStep < 4 && (
                                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                                            )}
                                      </div>
                                        </div>
                                        
                                        {/* プログレス数値 */}
                                        <div className="absolute -top-8 right-0 text-xs font-mono text-nexus-text-secondary bg-nexus-bg-primary px-2 py-1 rounded border">
                                          {Math.min(currentStep, 4)}/4
                                        </div>
                                      </div>
                                      
                                      {/* 現在のステータス表示 - 統一デザイン */}
                                      <div className="bg-nexus-bg-primary rounded-lg p-3 border border-nexus-border/50">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            {currentStep === 0 && (
                                              <>
                                                <div className="p-2 bg-gray-100 rounded-full">
                                                  <Clock4 className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <div>
                                                  <span className="text-sm font-medium text-gray-700">検品待機中</span>
                                                  <p className="text-xs text-gray-500">開始準備完了</p>
                                                </div>
                                              </>
                                            )}
                                            {currentStep === 1 && (
                                              <>
                                                <div className="p-2 bg-nexus-blue/10 rounded-full animate-pulse">
                                                  <Package className="w-4 h-4 text-nexus-blue" />
                                                </div>
                                                <div>
                                                  <span className="text-sm font-medium text-nexus-blue">検品項目確認中</span>
                                                  <p className="text-xs text-nexus-blue/70">チェックリスト作業中</p>
                                                </div>
                                              </>
                                            )}
                                            {currentStep === 2 && (
                                              <>
                                                <div className="p-2 bg-purple-100 rounded-full animate-pulse">
                                                  <Camera className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <div>
                                                  <span className="text-sm font-medium text-purple-600">写真撮影中</span>
                                                  <p className="text-xs text-purple-600/70">商品画像記録中</p>
                                                </div>
                                              </>
                                            )}
                                            {currentStep === 3 && (
                                              <>
                                                <div className="p-2 bg-orange-100 rounded-full animate-pulse">
                                                  <Archive className="w-4 h-4 text-orange-600" />
                                                </div>
                                                <div>
                                                  <span className="text-sm font-medium text-orange-600">梱包・ラベル作業中</span>
                                                  <p className="text-xs text-orange-600/70">保管準備中</p>
                                                </div>
                                              </>
                                            )}
                                            {currentStep >= 4 && (
                                              <>
                                                <div className="p-2 bg-green-100 rounded-full relative">
                                                  <Store className="w-4 h-4 text-green-600" />
                                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
                                                </div>
                                                <div>
                                                  <span className="text-sm font-medium text-green-600">検品完了</span>
                                                  <p className="text-xs text-green-600/70">出品準備完了</p>
                                                </div>
                                              </>
                                            )}
                                          </div>
                                          
                                          <div className="text-right">
                                            <div className="text-xs font-mono text-nexus-text-secondary bg-nexus-bg-tertiary px-2 py-1 rounded">
                                              {Math.min(currentStep, 4)}/4
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                        
                                        {/* ステップフローチャート - 統一デザイン */}
                                        <div className="bg-nexus-bg-secondary rounded-lg p-4 border border-nexus-border/30">
                                          <div className="flex items-center justify-between relative">
                                            {[
                                              { id: 1, name: '検品', icon: Package, color: 'nexus-blue' },
                                              { id: 2, name: '撮影', icon: Camera, color: 'purple-600' },
                                              { id: 3, name: '梱包', icon: Archive, color: 'orange-600' },
                                              { id: 4, name: '保管', icon: Store, color: 'green-600' }
                                            ].map((step, index) => {
                                              const StepIcon = step.icon;
                                              const isCompleted = currentStep >= step.id;
                                              const isCurrent = currentStep === step.id;
                                              const isPending = currentStep < step.id;
                                              
                                              return (
                                                <div key={step.id} className="flex flex-col items-center relative">
                                                  {/* ステップアイコン */}
                                                  <div className={`
                                                    relative p-3 rounded-xl border-2 transition-all duration-300 shadow-sm
                                                    ${isCompleted 
                                                      ? 'bg-green-500 border-green-500 shadow-green-500/20' 
                                                      : isCurrent && step.id === 1
                                                        ? 'bg-nexus-blue/10 border-nexus-blue shadow-lg animate-pulse'
                                                        : isCurrent && step.id === 2
                                                        ? 'bg-purple-100 border-purple-600 shadow-lg animate-pulse'
                                                        : isCurrent && step.id === 3
                                                        ? 'bg-orange-100 border-orange-600 shadow-lg animate-pulse'
                                                        : isCurrent && step.id === 4
                                                        ? 'bg-green-100 border-green-600 shadow-lg animate-pulse'
                                                        : 'bg-nexus-bg-primary border-nexus-border/50'
                                                    }
                                                  `}>
                                                    {isCompleted ? (
                                                      <CheckCircle2 className="w-5 h-5 text-white" />
                                                    ) : (
                                                      <StepIcon className={`w-5 h-5 ${
                                                        isCurrent && step.id === 1
                                                          ? 'text-nexus-blue'
                                                          : isCurrent && step.id === 2
                                                          ? 'text-purple-600'
                                                          : isCurrent && step.id === 3
                                                          ? 'text-orange-600'
                                                          : isCurrent && step.id === 4
                                                          ? 'text-green-600'
                                                          : isPending 
                                                            ? 'text-nexus-text-tertiary' 
                                                            : 'text-nexus-text-secondary'
                                                      }`} />
                                                    )}
                                                    
                                                    {/* 現在進行中のパルスエフェクト */}
                                                    {isCurrent && (
                                                      <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-xl animate-pulse" />
                                                    )}
                                                  </div>
                                                  
                                                  {/* ステップ名 */}
                                                  <span className={`mt-2 text-xs font-medium text-center ${
                                                    isCompleted 
                                                      ? 'text-green-600' 
                                                      : isCurrent && step.id === 1
                                                        ? 'text-nexus-blue'
                                                        : isCurrent && step.id === 2
                                                        ? 'text-purple-600'
                                                        : isCurrent && step.id === 3
                                                        ? 'text-orange-600'
                                                        : isCurrent && step.id === 4
                                                        ? 'text-green-600'
                                                        : 'text-nexus-text-tertiary'
                                                  }`}>
                                                    {step.name}
                                      </span>
                                                  
                                                  {/* 接続線 */}
                                      {index < 3 && (
                                                    <div className={`absolute top-6 left-full w-12 h-0.5 -translate-y-1/2 transition-colors duration-300 ${
                                                      currentStep > step.id 
                                                        ? 'bg-green-500' 
                                                        : 'bg-nexus-border'
                                                    }`} style={{ transform: 'translateX(50%) translateY(-50%)' }} />
                                      )}
                                    </div>
                                  );
                                })}
                                          </div>
                              </div>
                            </div>

                                      {/* 最終更新時刻 - 統一デザイン */}
                                      {lastUpdated && (
                                        <div className="bg-nexus-bg-primary border border-nexus-border/30 rounded-lg p-3">
                                          <div className="flex items-center gap-2 text-xs text-nexus-text-tertiary">
                                            <ClockIcon className="w-4 h-4" />
                                            <span>最終更新:</span>
                                            <time className="font-mono text-nexus-text-secondary">
                                              {new Date(lastUpdated).toLocaleString('ja-JP')}
                                            </time>
                                            <div className="ml-auto flex items-center gap-1">
                                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                              <span>同期済み</span>
                                            </div>
                                          </div>
                                        </div>
                                  )}
                                </div>
                                  );
                                })()}
                              </div>
                              
                            {/* 商品詳細情報 - リッチデザイン */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-gradient-to-br from-nexus-bg-primary to-nexus-bg-secondary rounded-xl p-5 border border-nexus-border shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <div className="p-2 bg-nexus-blue/10 rounded-lg">
                                      <InformationCircleIcon className="w-5 h-5 text-nexus-blue" />
                                </div>
                                    <h4 className="text-base font-semibold text-nexus-text-primary">商品情報</h4>
                                  </div>
                                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                    product.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                    product.status === 'inspecting' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    product.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-gray-50 text-gray-700 border-gray-200'
                                  }`}>
                                    {product.status === 'pending_inspection' ? '入庫待ち' :
                                     product.status === 'inspecting' ? '検品中' :
                                     product.status === 'completed' ? '完了' :
                                     product.status === 'failed' ? '不合格' : product.status}
                                  </div>
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="bg-nexus-bg-primary rounded-lg p-3 border border-nexus-border/30">
                                    <div className="grid grid-cols-1 gap-2 text-sm">
                                      <div className="flex items-center justify-between py-1">
                                        <span className="text-nexus-text-tertiary font-medium">SKU</span>
                                        <code className="bg-nexus-bg-tertiary px-2 py-1 rounded text-xs font-mono text-nexus-text-primary">
                                          {product.sku}
                                        </code>
                                      </div>
                                      <div className="flex items-center justify-between py-1">
                                        <span className="text-nexus-text-tertiary font-medium">受領日</span>
                                        <span className="text-nexus-text-secondary">{product.receivedDate}</span>
                                      </div>
                                      <div className="flex items-center justify-between py-1">
                                        <span className="text-nexus-text-tertiary font-medium">ブランド</span>
                                        <span className="text-nexus-text-secondary font-medium">{product.brand}</span>
                                      </div>
                                      <div className="flex items-center justify-between py-1">
                                        <span className="text-nexus-text-tertiary font-medium">モデル</span>
                                        <span className="text-nexus-text-secondary">{product.model}</span>
                                      </div>
                                      <div className="flex items-center justify-between py-1">
                                        <span className="text-nexus-text-tertiary font-medium">カテゴリ</span>
                                        <div className="flex items-center gap-2">
                                          <div className="w-3 h-3 bg-nexus-blue/20 rounded-full"></div>
                                          <span className="text-nexus-text-secondary">
                                            {categoryLabels[product.category as keyof typeof categoryLabels] || product.category}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {product.metadata && (() => {
                                    const metadata = parseProductMetadata(product.metadata);
                                    return Object.keys(metadata).length > 0 ? (
                                      <div className="mt-3 pt-3 border-t border-gray-200">
                                        <strong className="block mb-2">追加情報</strong>
                                        <div className="grid grid-cols-1 gap-1 text-xs">
                                          {metadata.deliveryPlanId && (
                                            <div><span className="text-gray-600 w-20 inline-block">納品プラン:</span> <span className="font-mono">{metadata.deliveryPlanId}</span></div>
                                          )}
                                          {metadata.supplier && (
                                            <div><span className="text-gray-600 w-20 inline-block">仕入先:</span> {metadata.supplier}</div>
                                          )}
                                          {metadata.condition && (
                                            <div><span className="text-gray-600 w-20 inline-block">コンディション:</span> {metadata.condition}</div>
                                          )}
                                          {metadata.hasInspectionChecklist && (
                                            <div className="text-blue-600 font-medium">✓ セラー検品データ入力済み</div>
                                          )}
                                        </div>
                                      </div>
                                    ) : null;
                                  })()}
                                </div>
                              </div>
                              
                              <div className="bg-gradient-to-br from-nexus-bg-primary to-nexus-bg-secondary rounded-xl p-5 border border-nexus-border shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                  <div className="p-2 bg-amber-100 rounded-lg">
                                    <SparklesIcon className="w-5 h-5 text-amber-600" />
                                  </div>
                                  <h4 className="text-base font-semibold text-nexus-text-primary">次のアクション</h4>
                                </div>
                                
                                {(() => {
                                  const progress = progressData[product.id];
                                  const metadata = parseProductMetadata(product.metadata);
                                  const inspectionPhotoStatus = getInspectionPhotographyStatus ? getInspectionPhotographyStatus(metadata) : null;
                                  
                                  return (
                                    <div className="space-y-3">
                                      {product.status === 'pending_inspection' && (
                                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                          <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-500 rounded-full">
                                              <Play className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="flex-1">
                                              <h5 className="text-sm font-semibold text-blue-900 mb-1">検品開始準備完了</h5>
                                              <p className="text-xs text-blue-700 leading-relaxed">
                                                「検品開始」ボタンをクリックして、商品の検品チェックリストを開始してください。
                                                品質確認、写真撮影、梱包までの工程を順次進めていきます。
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {product.status === 'inspecting' && (
                                        <div className="bg-nexus-blue/5 rounded-lg p-4 border border-nexus-blue/20">
                                          <div className="flex items-start gap-3">
                                            <div className="p-2 bg-nexus-blue rounded-full animate-pulse">
                                              <ArrowPathIcon className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="flex-1">
                                              <h5 className="text-sm font-semibold text-nexus-blue mb-2">
                                                {progress && progress.currentStep === 1 && '検品項目の確認中'}
                                                {progress && progress.currentStep === 2 && '商品写真の撮影中'}
                                                {progress && progress.currentStep === 3 && '梱包・ラベル作業中'}
                                                {progress && progress.currentStep === 4 && '棚への保管作業中'}
                                                {!progress && '作業継続可能'}
                                              </h5>
                                              <p className="text-xs text-nexus-blue/80 leading-relaxed">
                                                {progress && progress.currentStep === 1 && 'チェックリスト項目を確認し、商品の状態を詳細にチェックしてください。外観、機能、付属品の確認を行います。'}
                                                {progress && progress.currentStep === 2 && '商品の全体、細部、付属品の写真を複数角度から撮影してください。品質記録として保存されます。'}
                                                {progress && progress.currentStep === 3 && '適切な梱包材を選択し、商品ラベルを正確に貼付してください。保管準備を完了させます。'}
                                                {progress && progress.currentStep === 4 && '指定された棚位置に商品を保管してください。在庫管理システムに反映されます。'}
                                                {!progress && '前回の中断した作業から再開できます。「続ける」ボタンで作業を継続してください。'}
                                              </p>
                                              {progress?.lastUpdated && (
                                                <div className="mt-2 flex items-center gap-2 text-xs text-nexus-blue/60 bg-white/50 px-3 py-2 rounded border">
                                                  <ClockIcon className="w-3 h-3" />
                                                  <span>前回作業: {new Date(progress.lastUpdated).toLocaleString('ja-JP')}</span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {product.status === 'completed' && (
                                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                          <div className="flex items-start gap-3">
                                            <div className="p-2 bg-green-500 rounded-full relative">
                                              <CheckCircle2 className="w-4 h-4 text-white" />
                                              <div className="absolute -inset-1 bg-green-500 rounded-full animate-ping opacity-20"></div>
                                            </div>
                                            <div className="flex-1">
                                              <h5 className="text-sm font-semibold text-green-900 mb-1">検品完了</h5>
                                              <p className="text-xs text-green-700 leading-relaxed">
                                                すべての検品工程が正常に完了しました。品質基準をクリアし、商品は出品準備が整っています。
                                                出品管理画面で商品情報を確認し、販売を開始できます。
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {product.status === 'failed' && (
                                        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                          <div className="flex items-start gap-3">
                                            <div className="p-2 bg-red-500 rounded-full animate-pulse">
                                              <AlertTriangle className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="flex-1">
                                              <h5 className="text-sm font-semibold text-red-900 mb-1">検品不合格</h5>
                                              <p className="text-xs text-red-700 leading-relaxed">
                                                検品の結果、品質基準を満たしていません。商品の状態を再確認し、
                                                修理・クリーニングまたは返却処理を検討してください。管理者に報告が必要です。
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {inspectionPhotoStatus?.canStartPhotography && (
                                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                          <div className="flex items-start gap-3">
                                            <div className="p-2 bg-purple-500 rounded-full animate-pulse">
                                              <PhotoIcon className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="flex-1">
                                              <h5 className="text-sm font-semibold text-purple-900 mb-1">撮影準備完了</h5>
                                              <p className="text-xs text-purple-700 leading-relaxed">
                                                検品が完了しており、商品写真の撮影が可能です。「撮影」ボタンから
                                                高品質な商品画像の撮影を開始し、出品用の写真を準備してください。
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {paginatedProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 px-2 sm:px-4 text-center text-nexus-text-secondary text-sm">
                      {filteredProducts.length === 0 ? 
                        (searchQuery || selectedStatus !== 'all' || selectedCategory !== 'all' || selectedInspectionPhotoStatus !== 'all'
                          ? '検索条件に一致する商品がありません' 
                          : '検品対象商品がありません'
                        ) : '表示するデータがありません'
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ページネーション */}
          {filteredProducts.length > 0 && (
            <div className="mt-6 pt-4 border-t border-nexus-border">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredProducts.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          )}
        </div>

        {/* 検品モーダル - 使用停止（ページ遷移に統一） */}
        {false && (
          <BaseModal
            isOpen={false}
            onClose={() => {}}
            title="商品検品"
            size="lg"
          >
            <div>
              <p className="text-center text-gray-500">
                検品機能はページ遷移に統一されました
              </p>
            </div>
          </BaseModal>
        )}
      </div>
    </DashboardLayout>
  );
}