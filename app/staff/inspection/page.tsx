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
import InspectionDetailModal from '@/app/components/modals/InspectionDetailModal';
import { parseProductMetadata, getInspectionPhotographyStatus } from '@/lib/utils/product-status';
import { getInspectionWorkflowProgress, getInspectionNextAction, InspectionStatus } from '@/lib/utils/workflow';
import WorkflowProgress from '@/app/components/ui/WorkflowProgress';

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
  status: 'pending_inspection' | 'inspecting' | 'completed' | 'failed' | 'storage';
  receivedDate: string;

  imageUrl?: string;
  images?: any[]; // 統合された画像データ配列
  metadata?: string; // メタデータフィールド追加
}

type SortField = 'name' | 'sku' | 'category' | 'receivedDate' | 'status';
type SortDirection = 'asc' | 'desc';
type BusinessStatus = 'inbound' | 'inspection' | 'storage' | 'completed' | 'rejected' | 'pending' | 'processing' | 'on_hold';

// *** モックデータを完全に削除 - SQLiteデータベースのみ使用 ***

const categoryLabels = {
  camera: 'カメラ',
  watch: '腕時計'
};

// ステータス変換関数（BusinessStatusIndicatorに合わせる）
const convertStatusToBusinessStatus = (status: string): BusinessStatus => {
  console.log(`[DEBUG] ステータス変換: ${status}`);

  switch (status) {
    case 'inbound':
      return 'inbound';  // 入庫待ち
    case 'pending_inspection':
      return 'inbound';  // 入庫待ち
    case 'inspection':
      return 'inspection';  // 保管作業中
    case 'inspecting':
      return 'inspection';  // 保管作業中（DB実際の値）
    case 'storage':
      return 'storage';  // 保管中（StatusIndicatorの定義に合わせる）
    case 'ordered':
      return 'processing';  // 出荷準備中
    case 'workstation':
      return 'processing';  // 梱包作業中
    case 'packed':
      return 'processing';  // 梱包完了
    case 'shipping':
      return 'completed';  // 出荷済み（完了）
    case 'shipped':
      return 'completed';  // 出荷済み（完了）
    case 'delivered':
      return 'completed';  // 配送完了
    case 'completed':
      return 'completed';  // 完了
    case 'rejected':
      return 'on_hold';  // 拒否も保留表示に統一
    case 'failed':
      return 'on_hold';  // 不合格は保留中（黄）で統一表示
    case 'on_hold':
      return 'on_hold';  // 保留中
    default:
      console.warn(`[WARN] 未定義ステータス: ${status} → inboundにフォールバック`);
      return 'inbound';
  }
};

export default function InspectionPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [selectedInspectionProduct, setSelectedInspectionProduct] = useState<Product | null>(null);
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
        const allInventoryData = result.data || [];

        // 検品管理ではキャンセル商品を除外
        const inventoryData = allInventoryData.filter(product => product.status !== 'cancelled');

        console.log(`[DEBUG] 検品ページ: SQLiteから${allInventoryData.length}件取得、キャンセル除外後${inventoryData.length}件`);
        
        // 在庫データを検品用データに変換
        const inspectionProducts: Product[] = inventoryData.map((item: any) => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          status: convertInventoryStatusToInspectionStatus(item.status),
          receivedDate: item.entryDate,
          imageUrl: item.imageUrl || '/api/placeholder/150/150',
          images: item.images || [], // 統合された画像データを追加
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
        console.log('[DEBUG] 進捗データ取得結果:', list ? JSON.stringify(list, null, 2) : 'データなし');
        
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
        
        console.log('[DEBUG] 進捗データマッピング結果:', mapped ? JSON.stringify(mapped, null, 2) : 'データなし');
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
  const convertInventoryStatusToInspectionStatus = (inventoryStatus: string): 'pending_inspection' | 'inspecting' | 'completed' | 'failed' | 'storage' => {
    switch (inventoryStatus) {
      case 'inbound':
        return 'pending_inspection';
      case 'inspection':
        return 'inspecting';
      case 'inspecting':
        return 'inspecting';
      case 'storage':
        return 'storage';
      case 'ordered':
        return 'completed';  // 出荷準備完了
      case 'workstation':
        return 'completed';  // 梱包作業完了
      case 'packed':
        return 'completed';  // 梱包完了
      case 'shipping':
        return 'completed';  // 出荷完了
      case 'shipped':
        return 'completed';  // 出荷済み
      case 'delivered':
        return 'completed';  // 配送完了
      case 'sold':
        return 'completed';  // 販売完了
      case 'completed':
        return 'completed';
      case 'failed':
        return 'failed';
      case 'rejected':
        return 'failed';
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

  // 統計データ計算（検索・追加フィルタを反映）
  const matchesSearch = (p: Product) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q)
    );
  };

  const matchesExtraStatus = (p: Product) => {
    // 追加のセレクトなどがある場合に備えた拡張（現状は全件）
    return selectedStatus === 'all' || p.status === selectedStatus;
  };

  const baseForCounts = products.filter(p => matchesSearch(p) && matchesExtraStatus(p));

  const inspectionStats = {
    total: baseForCounts.length,
    pending: baseForCounts.filter(p => p.status === 'pending_inspection').length,
    inspecting: baseForCounts.filter(p => p.status === 'inspecting').length,
    completed: baseForCounts.filter(p => p.status === 'completed').length,
    failed: baseForCounts.filter(p => p.status === 'failed').length,
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

  // 進捗ステップ表示用の関数（StatusIndicatorの配色ルールと統一）
  const getProgressStepDisplay = (productId: string) => {
    const progress = progressData[productId];
    if (!progress) {
      return { label: '未開始', color: 'bg-slate-100 text-slate-800' };
    }

    switch (progress.currentStep) {
      case 1:
        return { label: '検品項目', color: 'bg-cyan-100 text-cyan-800' };
      case 2:
        return { label: '動画記録', color: 'bg-amber-100 text-amber-800' };
      case 3:
        return { label: '写真撮影', color: 'bg-purple-100 text-purple-800' };
      case 4:
        return { label: '確認完了', color: 'bg-green-100 text-green-800' };
      default:
        return { label: '未開始', color: 'bg-slate-100 text-slate-800' };
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

  // 検品ステータス更新関数
  const updateInspectionStatus = async (productId: string, newStatus: string) => {
    try {
      console.log(`[DEBUG] ステータス更新開始: ${productId} → ${newStatus}`);
      
      const response = await fetch('/api/products/inspection', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId, 
          status: newStatus 
        })
      });

      console.log(`[DEBUG] ステータス更新レスポンス: ${response.status}`);

      if (response.ok) {
        const result = await response.json();
        console.log(`[DEBUG] ステータス更新成功:`, result);
        
        // 商品リストのステータスを更新（強制的な再レンダリング含む）
        setProducts(prev => {
          console.log(`[DEBUG] setProducts実行前: 対象商品のステータス=`, prev.find(p => p.id === productId)?.status);

          const updated = prev.map(product =>
            product.id === productId
              ? {
                  ...product,
                  status: newStatus as any,
                  // キーを変更して強制的に再レンダリングを促す
                  lastUpdated: new Date().toISOString()
                }
              : product
          );

          console.log(`[DEBUG] setProducts実行後: 対象商品のステータス=`, updated.find(p => p.id === productId)?.status);
          console.log(`[DEBUG] 変換後のBusinessStatus=`, convertStatusToBusinessStatus(newStatus));

          return updated;
        });

        // SQLiteデータベースから最新データを再取得して同期を確保
        setTimeout(() => {
          fetchProductsFromDatabase();
        }, 500);

        showToast({
          type: 'success',
          title: 'ステータス更新',
          message: `商品のステータスを「${newStatus}」に更新しました`,
          duration: 3000
        });
      } else {
        const errorData = await response.text();
        console.error(`[ERROR] ステータス更新失敗: ${response.status} - ${errorData}`);
        throw new Error(`ステータス更新に失敗しました (${response.status})`);
      }
    } catch (error) {
      console.error('Status update error:', error);
      showToast({
        type: 'error',
        title: 'エラー',
        message: error instanceof Error ? error.message : 'ステータス更新中にエラーが発生しました',
        duration: 4000
      });
    }
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
    // 保存された進捗のステップで再開（保存して一覧に戻るボタンで保存された状態）
    const stepQuery = progress && progress.currentStep ? `?step=${progress.currentStep}` : '';
    window.location.href = `/staff/inspection/${product.id}${stepQuery}`;
  };

  // 検品処理モーダルを開く
  const handleOpenInspectionModal = (product: Product) => {
    setSelectedInspectionProduct(product);
    setIsInspectionModalOpen(true);
  };

  // モーダル用のステータス更新関数（既存のupdateInspectionStatusをラップ）
  const handleModalStatusUpdate = async (productId: string, newStatus: string) => {
    await updateInspectionStatus(productId, newStatus);
  };

  // 商品詳細表示（保管完了済みは情報表示専用モーダル）
  const handleViewProduct = (product: Product) => {
    const metadata = parseProductMetadata(product.metadata);
    
    // 保管完了済み商品の場合は在庫管理ページで情報表示専用モーダルを開く
    if (product.status === 'storage' || 
        (product.status === 'completed' && metadata.currentStep >= 4)) {
      // 状態を保存してから在庫管理ページの情報表示モーダルに遷移
      saveCurrentState();
      window.location.href = `/staff/inventory?viewProduct=${product.id}`;
    } else {
      // その他の場合は従来通り検品画面に遷移
      saveCurrentState();
      window.location.href = `/staff/inspection/${product.id}`;
    }
  };

  // 不合格商品削除関数
  const handleDeleteFailedProduct = async (product: Product) => {
    try {
      const response = await fetch(`/api/inventory/failed-product-delete?id=${product.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '商品の削除に失敗しました');
      }

      // 商品リストから削除
      setProducts(prev => prev.filter(p => p.id !== product.id));

      showToast({
        type: 'success',
        title: '商品削除完了',
        message: `${product.name}を削除しました`,
        duration: 3000
      });

    } catch (error) {
      console.error('Failed product deletion error:', error);
      showToast({
        type: 'error',
        title: '削除エラー',
        message: error instanceof Error ? error.message : '商品削除中にエラーが発生しました',
        duration: 4000
      });
    }
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



  // ステータス選択肢（検品管理画面専用）
  const statusOptions = [
    { value: 'all', label: 'すべてのステータス' },
    { value: 'pending_inspection', label: '入庫待ち' },  // 納品管理の出荷準備中・出荷済みに対応
    { value: 'inspecting', label: '保管作業中' },
    { value: 'completed', label: '梱包完了' },  // ラベルを変更
    { value: 'storage', label: '保管中' }
  ];

  // 検品・撮影状況選択肢（ステップベース）
  const inspectionPhotoStatusOptions = [
    { value: 'all', label: 'すべての状況' },
    { value: 'not_started', label: '未開始' },
    { value: 'step_1', label: '検品項目' },
    { value: 'step_2', label: '写真撮影' },
    { value: 'step_3', label: '梱包・ラベル' },
    { value: 'step_4', label: '棚保管' },
    { value: 'completed', label: '梱包完了' }
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
          subtitle="商品の検品作業を管理・実施"
          userType="staff"
          iconType="inspection"
        />

        {/* 検品管理 - 統合版 */}
        <div className="intelligence-card global">
          <div className="p-8">
            {/* 検索フィルター（検索のみ表示） */}
            <div className="p-6 mb-6">
              <div className="max-w-md">
                <NexusInput
                  type="text"
                  label="検索"
                  placeholder="商品名・SKUで検索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* タブビュー部分 */}
            {/* タブヘッダー */}
            <div className="border-b border-nexus-border mb-6">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {[
                { id: 'all', label: '全体', count: inspectionStats.total, status: 'all' },
                { id: 'pending_inspection', label: '入庫待ち', count: inspectionStats.pending, status: 'inbound' },
                { id: 'inspecting', label: '保管作業中', count: inspectionStats.inspecting, status: 'inspection' },
                { id: 'completed', label: '梱包完了', count: inspectionStats.completed, status: 'completed' },
                { id: 'failed', label: '保留中', count: inspectionStats.failed, status: 'on_hold' },
              ].map((tab) => {
                // StatusIndicatorの配色と完全に合わせる
                const getTabBadgeStyle = (status: string, isActive: boolean) => {
                  // StatusIndicatorの統一ルールに合わせたタブバッジ配色
                  const statusColors = {
                    all: {
                      normal: 'bg-gray-500 text-white border border-gray-400',
                      active: 'bg-gray-700 text-white border-2 border-gray-600'
                    },
                    inbound: {
                      normal: 'bg-cyan-500 text-white border border-cyan-400',
                      active: 'bg-cyan-700 text-white border-2 border-cyan-600'
                    },
                    inspection: {
                      normal: 'bg-cyan-600 text-white border border-cyan-500',
                      active: 'bg-cyan-800 text-white border-2 border-cyan-700'
                    },
                    completed: {
                      normal: 'bg-emerald-600 text-white border border-emerald-500',
                      active: 'bg-emerald-800 text-white border-2 border-emerald-700'
                    },
                    on_hold: {
                      normal: 'bg-yellow-600 text-white border border-yellow-500',
                      active: 'bg-yellow-600 text-white border-2 border-yellow-500' // アクティブでも黄色を維持
                    },
                  };
                  return statusColors[status] ?
                    (isActive ? statusColors[status].active : statusColors[status].normal) :
                    statusColors.all.normal;
                };

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300
                      ${activeTab === tab.id
                        ? 'border-nexus-blue text-nexus-blue'
                        : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-gray-300'
                      }
                    `}
                  >
                    {tab.label}
                    <span className={`
                      ml-2 inline-flex items-center px-2.5 py-1 rounded-lg
                      text-xs font-black font-display uppercase tracking-wider
                      transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105
                      ${getTabBadgeStyle(tab.status, activeTab === tab.id)}
                    `}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
              </nav>
            </div>

            <div className="overflow-x-auto">
                <table className="holo-table">
                <thead className="holo-header">
                  <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-nexus-text-secondary uppercase tracking-wider w-20">画像</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider">商品名</th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('sku')}
                  >
                    <div className="flex items-center gap-1">
                      SKU
                      {getSortIcon('sku')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center gap-1">
                      カテゴリー
                      {getSortIcon('category')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('receivedDate')}
                  >
                    <div className="flex items-center gap-1">
                      受領日
                      {getSortIcon('receivedDate')}
                    </div>
                  </th>

                  <th className="px-6 py-3 text-center text-xs font-medium text-nexus-text-secondary uppercase tracking-wider">ステータス</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-nexus-text-secondary uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => (
                  <React.Fragment key={product.id}>
                    <tr className="border-b border-nexus-border hover:bg-nexus-bg-tertiary">
                      <td className="py-3 px-2 sm:px-4">
                        <div className="flex justify-center">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-lg border border-nexus-border bg-gray-100">
                            <img
                              src={(() => {
                                // 統合された画像データから最初の画像を取得
                                if (product.images && product.images.length > 0) {
                                  const firstImage = product.images[0];
                                  return firstImage.url || firstImage.thumbnailUrl || firstImage;
                                }

                                // フォールバック: imageUrlまたはプレースホルダー
                                return product.imageUrl || '/api/placeholder/60/60';
                              })()}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => { e.currentTarget.src = '/api/placeholder/60/60'; }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <div className="font-medium text-nexus-text-primary text-sm truncate">{product.name}</div>
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
                          <div className="flex flex-col items-center space-y-1">
                            {(() => {
                              const convertedStatus = convertStatusToBusinessStatus(product.status);
                              
                              // メタデータから詳細ステータス説明を取得
                              let statusDescription = '';
                              try {
                                if (product.metadata) {
                                  const metadata = typeof product.metadata === 'string' 
                                    ? JSON.parse(product.metadata) 
                                    : product.metadata;
                                  statusDescription = metadata.statusDescription || '';
                                }
                              } catch (e) {
                                console.warn('Failed to parse metadata for status description');
                              }
                              
                              console.log(`[DEBUG] UI表示: 商品=${product.name}, 元ステータス=${product.status}, 変換後=${convertedStatus}, 詳細=${statusDescription}`);
                              
                              return (
                                <>
                                  <BusinessStatusIndicator
                                    key={`status-${product.id}-${product.status}-${product.lastUpdated || Date.now()}`}
                                    status={convertedStatus as any}
                                    size="sm"
                                  />
                                  {statusDescription && (
                                    <div className="text-xs text-gray-600 text-center px-2 py-1 bg-gray-50 rounded">
                                      {statusDescription}
                                    </div>
                                  )}
                                </>
                              );
                            })()}
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

                            if (product.status === 'inspecting') {
                              // 保管作業中の場合は、「再開する」ボタン
                              return (
                                <NexusButton 
                                  size="sm" 
                                  variant="primary"
                                  onClick={() => handleContinueInspection(product)}
                                  title="保存された進捗から再開"
                                >
                                  <ArrowPathIcon className="w-4 h-4" />
                                  <span className="hidden sm:inline ml-1">再開する</span>
                                </NexusButton>
                              );
                            }

                            if (product.status === 'completed') {
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

                            if (product.status === 'failed') {
                              return (
                                <div className="flex gap-1">
                                  <NexusButton
                                    size="sm"
                                    variant="default"
                                    icon={<EyeIcon className="w-4 h-4" />}
                                    onClick={() => handleViewProduct(product)}
                                  >
                                    <span className="hidden sm:inline">詳細</span>
                                    <span className="sm:hidden sr-only">詳細</span>
                                  </NexusButton>
                                  <NexusButton
                                    size="sm"
                                    variant="danger"
                                    icon={<XMarkIcon className="w-4 h-4" />}
                                    onClick={() => handleDeleteFailedProduct(product)}
                                    title="保留中商品を削除"
                                  >
                                    <span className="hidden sm:inline">削除</span>
                                  </NexusButton>
                                </div>
                              );
                            }

                            return null;
                          })()}
                        </div>
                      </td>
                    </tr>
                    
                    {/* 詳細展開行 - 出荷管理と統一されたデザイン */}
                    {expandedRows.includes(product.id) && (
                      <tr className="bg-nexus-bg-secondary">
                        <td colSpan={7} className="p-6">
                          <div className="space-y-4">
                            {/* ワークフロー進捗表示 - 統一コンポーネント使用 */}
                            <WorkflowProgress 
                              steps={getInspectionWorkflowProgress(
                                product.status as InspectionStatus, 
                                progressData[product.id]
                              )}
                              className="mb-6"
                            />
                            
                            {/* 商品詳細情報と次のアクション - 出荷管理と統一デザイン */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* 商品詳細情報 */}
                              <div className="bg-nexus-bg-primary rounded-lg p-4 border border-nexus-border">
                                <h4 className="text-sm font-medium text-nexus-text-primary mb-3 flex items-center gap-2">
                                  <InformationCircleIcon className="w-4 h-4" />
                                  商品情報
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-nexus-text-secondary">SKU</span>
                                    <code className="bg-nexus-bg-tertiary px-2 py-1 rounded text-xs font-mono">
                                          {product.sku}
                                        </code>
                                      </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-nexus-text-secondary">受領日</span>
                                    <span className="text-nexus-text-primary">{product.receivedDate}</span>
                                      </div>

                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-nexus-text-secondary">カテゴリ</span>
                                    <span className="text-nexus-text-primary">
                                            {categoryLabels[product.category as keyof typeof categoryLabels] || product.category}
                                          </span>
                                        </div>
                                  {/* 進捗情報があれば表示 */}
                                  {progressData[product.id]?.lastUpdated && (
                                    <div className="mt-3 pt-3 border-t border-nexus-border">
                                      <div className="flex items-center gap-2 text-xs text-nexus-text-secondary">
                                        <ClockIcon className="w-3 h-3" />
                                        <span>前回更新: {new Date(progressData[product.id].lastUpdated).toLocaleString('ja-JP')}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* 次のアクション */}
                              <div className="bg-nexus-bg-primary rounded-lg p-4 border border-nexus-border">
                                <h4 className="text-sm font-medium text-nexus-text-primary mb-3">次のアクション</h4>
                                <p className="text-sm text-nexus-text-secondary mb-3">
                                  {getInspectionNextAction(product.status as InspectionStatus, progressData[product.id])}
                                </p>
                                
                                                                {/* アクションボタン */}
                                <div className="flex gap-2 flex-wrap">
                                  {product.status === 'pending_inspection' && (
                                    <NexusButton
                                      size="sm"
                                      variant="primary"
                                      onClick={() => handleStartInspection(product)}
                                      className="flex items-center gap-1"
                                    >
                                      <Play className="w-3 h-3" />
                                      検品開始
                                    </NexusButton>
                                  )}
                                  {product.status === 'inspecting' && (
                                    <NexusButton
                                      size="sm"
                                      variant="primary"
                                      onClick={() => handleContinueInspection(product)}
                                      className="flex items-center gap-1"
                                      title="保存された進捗から再開"
                                    >
                                      <ArrowPathIcon className="w-3 h-3" />
                                      再開する
                                    </NexusButton>
                                  )}
                                  {product.status === 'completed' && (
                                    <NexusButton
                                      size="sm"
                                      variant="default"
                                      onClick={() => handleViewProduct(product)}
                                      className="flex items-center gap-1"
                                    >
                                      <EyeIcon className="w-3 h-3" />
                                      詳細
                                    </NexusButton>
                                  )}
                                  {product.status === 'failed' && (
                                    <div className="flex gap-1 flex-wrap">
                                      <NexusButton
                                        size="sm"
                                        variant="default"
                                        onClick={() => handleViewProduct(product)}
                                        className="flex items-center gap-1"
                                      >
                                        <EyeIcon className="w-3 h-3" />
                                        詳細
                                      </NexusButton>
                                      <NexusButton
                                        size="sm"
                                        variant="danger"
                                        onClick={() => handleDeleteFailedProduct(product)}
                                        className="flex items-center gap-1"
                                        title="保留中商品を削除"
                                      >
                                        <XMarkIcon className="w-3 h-3" />
                                        削除
                                      </NexusButton>
                                    </div>
                                  )}
                                </div>
                                          </div>
                                        </div>
                            
                            {/* 検品ステータス別の詳細情報表示 */}
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-nexus-text-secondary">
                                <div>ID: {product.id}</div>
                                <div className="flex flex-col space-y-1">
                                  <div>
                                    状態: {(() => {
                                      const convertedStatus = convertStatusToBusinessStatus(product.status);
                                      
                                      // メタデータから詳細ステータス説明を取得
                                      let statusDescription = '';
                                      try {
                                        if (product.metadata) {
                                          const metadata = typeof product.metadata === 'string' 
                                            ? JSON.parse(product.metadata) 
                                            : product.metadata;
                                          statusDescription = metadata.statusDescription || '';
                                        }
                                      } catch (e) {
                                        console.warn('Failed to parse metadata for status description');
                                      }
                                      
                                      console.log(`[DEBUG] モバイルUI表示: 商品=${product.name}, 元ステータス=${product.status}, 変換後=${convertedStatus}, 詳細=${statusDescription}`);
                                      
                                      return (
                                        <BusinessStatusIndicator
                                          key={`detail-status-${product.id}-${product.status}-${product.lastUpdated || Date.now()}`}
                                          status={convertedStatus as any}
                                          size="sm"
                                          showLabel={true}
                                        />
                                      );
                                    })()}
                                  </div>
                                  {(() => {
                                    // メタデータから詳細ステータス説明を取得
                                    let statusDescription = '';
                                    try {
                                      if (product.metadata) {
                                        const metadata = typeof product.metadata === 'string' 
                                          ? JSON.parse(product.metadata) 
                                          : product.metadata;
                                        statusDescription = metadata.statusDescription || '';
                                      }
                                    } catch (e) {
                                      // エラーは無視
                                    }
                                    
                                    return statusDescription ? (
                                      <div className="text-xs text-gray-600 px-2 py-1 bg-gray-50 rounded">
                                        {statusDescription}
                                      </div>
                                    ) : null;
                                  })()}
                                </div>
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
              <div className="mt-6 pt-6 px-6">
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
        </div>

        {/* 検品詳細モーダル */}
        <InspectionDetailModal
          isOpen={isInspectionModalOpen}
          onClose={() => {
            setIsInspectionModalOpen(false);
            setSelectedInspectionProduct(null);
          }}
          product={selectedInspectionProduct}
          onStatusUpdate={handleModalStatusUpdate}
          onContinueInspection={handleContinueInspection}
        />
      </div>
    </DashboardLayout>
  );
}