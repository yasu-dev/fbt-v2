'use client';

import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import UnifiedPageHeader from '@/app/components/ui/UnifiedPageHeader';
import QRCodeModal from '../../components/QRCodeModal';
import ItemDetailModal from '../../components/ItemDetailModal';
import ProductEditModal from '../../components/ProductEditModal';
import ProductMoveModal from '../../components/ProductMoveModal';
import ProductInfoModal from '../../components/modals/ProductInfoModal';
import BarcodeScanner from '../../components/features/BarcodeScanner';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  XMarkIcon,
  CheckIcon,
  CubeIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { ContentCard, BusinessStatusIndicator, Pagination, NexusLoadingSpinner } from '@/app/components/ui';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import NexusButton from '@/app/components/ui/NexusButton';
import ProductImage from '@/app/components/ui/ProductImage';
import NexusSelect from '@/app/components/ui/NexusSelect';
import NexusInput from '@/app/components/ui/NexusInput';
import BaseModal from '@/app/components/ui/BaseModal';

import { useModal } from '@/app/components/ui/ModalContext';
import ListingFormModal from '@/app/components/modals/ListingFormModal';
import { checkListingEligibility, filterListableItems } from '@/lib/utils/listing-eligibility';
import { useCategories, useProductStatuses, useProductConditions, useLocations, getNameByKey, translateStatusToJapanese } from '@/lib/hooks/useMasterData';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  originalCategory?: string; // 元の英語カテゴリーを保持用
  status: 'inbound' | 'inspection' | 'storage' | 'listing' | 'sold';
  location: string;
  price: number;
  condition: string;
  imageUrl?: string;
  entryDate: string;
  assignedStaff?: string;
  lastModified: string;
  qrCode?: string;
  notes?: string;
  quantity: number;
  lastChecked: string;
  value?: number;
  images?: string[];
  inspectedAt?: string; // 検品日時を追加
  photographyDate?: string; // 撮影日時を追加
  seller?: { id: string; username: string; email: string }; // セラー情報を追加
  inspectionNotes?: string; // 検品備考を追加
  // 同梱情報フィールド追加
  bundleId?: string;
  isBundleItem?: boolean;
  bundleTrackingNumber?: string;
  bundlePeers?: string[]; // 同梱対象の他商品ID
}

export default function StaffInventoryPage() {
  const barcodeScannerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const { setIsAnyModalOpen } = useModal();
  const router = useRouter();
  
  // 同梱情報統合処理
  const integrateBundleInfo = async (inventoryItems: InventoryItem[]) => {
    try {
      console.log('🔍 同梱情報統合開始:', inventoryItems.length, '件の商品');
      
      // 出荷管理APIから同梱Shipmentを取得
      const shippingResponse = await fetch('/api/orders/shipping?page=1&limit=100&status=all');
      if (!shippingResponse.ok) {
        console.warn('同梱情報取得失敗: Shipping API error');
        return;
      }
      
      const shippingData = await shippingResponse.json();
      const bundleShipments = shippingData.items.filter((item: any) => item.isBundle);
      
      console.log('🔍 同梱Shipment数:', bundleShipments.length);
      
      if (bundleShipments.length === 0) return;
      
      // 各Inventory Itemに同梱情報を統合
      for (const inventoryItem of inventoryItems) {
        for (const bundleShipment of bundleShipments) {
          const bundleItems = bundleShipment.bundledItems || [];
          const matchedItem = bundleItems.find((bi: any) => 
            bi.productId === inventoryItem.id || 
            bi.id === inventoryItem.id
          );
          
          if (matchedItem) {
            inventoryItem.bundleId = bundleShipment.bundleId;
            inventoryItem.isBundleItem = true;
            inventoryItem.bundleTrackingNumber = bundleShipment.trackingNumber;
            inventoryItem.bundlePeers = bundleItems
              .filter((bi: any) => bi.productId !== inventoryItem.id && bi.id !== inventoryItem.id)
              .map((bi: any) => bi.product || bi.productName);
              
            console.log(`[SUCCESS] 同梱情報統合: ${inventoryItem.name} → Bundle: ${inventoryItem.bundleId}`);
            break;
          }
        }
      }
      
    } catch (error) {
      console.error('同梱情報統合エラー:', error);
    }
  };
  const searchParams = useSearchParams();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // 一括画像ダウンロード用のstate
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [isProductInfoModalOpen, setIsProductInfoModalOpen] = useState(false);
  const [selectedProductForInfo, setSelectedProductForInfo] = useState<any>(null);
  
  // マスタデータの取得
  const { categories, loading: categoriesLoading } = useCategories();
  const { statuses: productStatuses, loading: statusesLoading } = useProductStatuses();
  const { conditions: productConditions, loading: conditionsLoading } = useProductConditions();
  const { locations: locationMasters, loading: locationsLoading } = useLocations();
  
  // ページネーション状態
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [paginatedItems, setPaginatedItems] = useState<InventoryItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 状態を保存する関数
  const saveCurrentState = () => {
    try {
      const state = {
        selectedStatus,
        selectedCategory,
        selectedLocation,
        searchQuery,
        viewMode,
        currentPage,
        itemsPerPage,
        timestamp: Date.now()
      };
      sessionStorage.setItem('inventoryListState', JSON.stringify(state));
      console.log('🔄 在庫画面の状態を保存しました:', state);
    } catch (error) {
      console.error('[ERROR] Failed to save inventory state:', error);
    }
  };

  // 保存された状態を復元する関数
  const restoreSavedState = () => {
    try {
      const savedState = sessionStorage.getItem('inventoryListState');
      if (savedState) {
        const state = JSON.parse(savedState);
        
        // 1時間以内のデータのみ復元（古いデータは無視）
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - state.timestamp < oneHour) {
          setSelectedStatus(state.selectedStatus || 'all');
          setSelectedCategory(state.selectedCategory || 'all');
          setSelectedLocation(state.selectedLocation || 'all');
          setSearchQuery(state.searchQuery || '');
          setViewMode(state.viewMode || 'table');
          setCurrentPage(state.currentPage || 1);
          setItemsPerPage(state.itemsPerPage || 20);
          
          // 状態復元を通知
          showToast({
            type: 'info',
            title: '前回の表示状態を復元しました',
            message: 'フィルター・検索条件が復元されました',
            duration: 3000
          });
          
          console.log('🔄 在庫画面の状態を復元しました:', state);
          
          // 復元後はsessionStorageから削除
          sessionStorage.removeItem('inventoryListState');
        }
      }
    } catch (error) {
      console.error('[ERROR] Failed to restore inventory state:', error);
    }
  };

  // コンポーネント初期化時に状態復元をチェック
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('restored') === '1') {
      restoreSavedState();
      
      // URLからrestoredパラメーターを削除（履歴に残さない）
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // APIから実際のデータを取得
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        
        // ページングパラメーターを含めてAPIリクエスト
        const searchParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString()
        });
        
        if (selectedStatus !== 'all' && selectedStatus !== 'listable') {
          searchParams.set('status', selectedStatus);
        }
        if (selectedCategory !== 'all') {
          searchParams.set('category', selectedCategory);
        }
        if (searchQuery.trim()) {
          searchParams.set('search', searchQuery);
        }
        
        const response = await fetch(`/api/inventory?${searchParams.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch inventory data');
        }
        const data = await response.json();
        
        // APIレスポンスからページネーション情報を取得
        const paginationInfo = data.pagination || {};
        
        // APIレスポンスの形式に合わせてデータを変換（英語→日本語変換）
        const inventoryItems: InventoryItem[] = data.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          originalCategory: item.category, // 元の英語カテゴリーを保持
          category: item.category,
          status: item.status, // 英語ステータスをそのまま保持（BusinessStatusIndicator用）
          statusOriginal: item.status,
          statusDisplay: item.status.replace('inbound', '入庫待ち')
                            .replace('inspection', '保管作業中')
                            .replace('storage', '保管中')
                            .replace('listing', '出品中')
                            .replace('ordered', '出荷準備中')
                            .replace('shipping', '出荷済み')

                            .replace('sold', '購入者決定')
                            .replace('returned', '返品')
                            .replace('on_hold', '保留中'),
          location: item.location || '未設定',
          price: item.price || 0,
          condition: item.condition,
          conditionDisplay: getNameByKey(productConditions, item.condition),
          entryDate: item.entryDate || item.createdAt?.split('T')[0] || '2024-01-01',
          assignedStaff: undefined,
          seller: item.seller ? {
            id: item.seller.id,
            username: item.seller.username,
            email: item.seller.email,
            fullName: (item.seller as any).fullName,
          } : undefined,
          lastModified: item.updatedAt || new Date().toISOString(),
          qrCode: `QR-${item.sku}`,
          notes: item.description || '',
          quantity: 1,
          lastChecked: item.updatedAt || new Date().toISOString(),
          inspectedAt: item.inspectedAt || null,
          photographyDate: item.photographyDate || null,
          imageUrl: item.imageUrl || item.images?.[0] || null, // セラーがアップロードした画像を優先
          images: item.images || [], // セラーがアップロードした全画像
          inspectionNotes: item.inspectionNotes || null, // 検品備考を追加
          // 同梱情報フィールド（初期値）
          bundleId: item.bundleId || null,
          isBundleItem: item.isBundleItem || false,
          bundleTrackingNumber: item.bundleTrackingNumber || null,
          bundlePeers: item.bundlePeers || []
        }));
        
        // 同梱情報を統合
        await integrateBundleInfo(inventoryItems);
        
        // サーバーサイドページネーションのため、取得したデータをそのまま表示
        setItems(inventoryItems);
        setFilteredItems(inventoryItems);
        setPaginatedItems(inventoryItems); // 取得したデータを直接設定
        
        // ページネーション情報を設定
        setTotalItems(paginationInfo.total || inventoryItems.length);
        setTotalPages(paginationInfo.pages || 1);
        
        console.log(`[SUCCESS] スタッフ在庫データ取得完了: ${inventoryItems.length}件 (ページ: ${currentPage}/${paginationInfo.pages || 1})`);
        console.log('📊 ページネーション情報:', paginationInfo);
        console.log('🔍 ステータス別分布:', inventoryItems.reduce((acc: any, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {}));
      } catch (error) {
        console.error('在庫データ取得エラー:', error);
        showToast({
          title: 'データ取得エラー',
          message: '在庫データの取得に失敗しました',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    const shouldFetch = !locationsLoading;
    if (shouldFetch) {
      fetchInventoryData();
    }
  }, [currentPage, itemsPerPage, selectedStatus, selectedCategory, searchQuery, locationsLoading]);

  // クライアント側でのフィルタリング（出品可能など特別なフィルターのみ）
  useEffect(() => {
    let filtered = items;

    // 出品可能フィルターはクライアント側で処理
    if (selectedStatus === 'listable') {
      filtered = filterListableItems(filtered);
      setFilteredItems(filtered);
      setPaginatedItems(filtered);
    } else if (selectedLocation !== 'all') {
      filtered = items.filter(item => item.location === selectedLocation);
      setFilteredItems(filtered);
      setPaginatedItems(filtered);
    } else {
      // その他のフィルターはサーバー側で処理済み
      setFilteredItems(items);
      setPaginatedItems(items);
    }
    
    // フィルタ変更時は最初のページに戻る（サーバーサイドページネーションの場合は再取得される）
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [items, selectedStatus, selectedLocation, currentPage]);

  // URLパラメータから商品IDを取得して情報表示モーダルを開く
  useEffect(() => {
    const viewProductId = searchParams.get('viewProduct');
    if (viewProductId && items.length > 0) {
      // 商品情報を詳細に取得
      fetchProductDetail(viewProductId);
    }
  }, [searchParams, items]);

  // 商品詳細情報を取得してモーダルを開く
  const fetchProductDetail = async (productId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}`);
      
      if (!response.ok) {
        throw new Error('商品情報の取得に失敗しました');
      }

      const productData = await response.json();
      
      // ProductInfoModalで使用する形式に変換
      const formattedProduct = {
        id: productData.id,
        name: productData.name,
        sku: productData.sku,
        category: productData.category,
        status: productData.status,
        condition: productData.condition,
        price: productData.price,
        description: productData.description,
        imageUrl: productData.imageUrl,
        entryDate: productData.entryDate,
        inspectedAt: productData.inspectedAt,
        inspectedBy: productData.inspectedBy,
        inspectionNotes: productData.inspectionNotes,
        currentLocation: productData.currentLocation,
        seller: productData.seller,
        images: productData.images,
        updatedAt: productData.updatedAt,
        metadata: productData.metadata,
      };

      setSelectedProductForInfo(formattedProduct);
      setIsProductInfoModalOpen(true);
      
      showToast({
        type: 'success',
        title: '商品情報を表示',
        message: `${productData.name} の詳細情報を表示しています`,
        duration: 2000
      });
      
    } catch (error) {
      console.error('商品詳細取得エラー:', error);
      showToast({
        type: 'error',
        title: 'エラー',
        message: '商品情報の取得に失敗しました',
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  // 情報表示モーダルを閉じる
  const handleCloseProductInfoModal = () => {
    setIsProductInfoModalOpen(false);
    setSelectedProductForInfo(null);
    // URLパラメータをクリア
    router.replace('/staff/inventory');
  };

  // カテゴリーオプション（納品プラン作成と統一）
  const categoryOptions = useMemo(() => {
    if (categories.length === 0) {
      return [
        { value: 'all', label: 'すべてのカテゴリー' },
        { value: 'camera', label: 'カメラ' },
        { value: 'watch', label: '腕時計' }
      ];
    }

    return [
      { value: 'all', label: 'すべてのカテゴリー' },
      ...categories
        .filter((category) => ['camera', 'watch'].includes(category.key))
        .map((category) => ({ value: category.key, label: category.nameJa }))
    ];
  }, [categories]);

  // サーバーサイドページネーションのため、クライアント側ページング処理は不要
  // paginatedItemsはAPI取得時に直接設定される

  // バーコードスキャナーモーダルのスクロール位置リセット
  useEffect(() => {
    if (isBarcodeScannerOpen) {
      // ページ全体を最上部にスクロール - 正しいスクロールコンテナを対象
      const scrollContainer = document.querySelector('.page-scroll-container');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      } else {
        window.scrollTo(0, 0);
      }
      
      if (barcodeScannerRef.current) {
        barcodeScannerRef.current.scrollTop = 0;
      }
    }
  }, [isBarcodeScannerOpen]);

  const updateItemStatus = (itemId: string, newStatus: InventoryItem['status']) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, status: newStatus, lastModified: new Date().toISOString() }
        : item
    ));
  };

  const updateItemLocation = (itemId: string, newLocation: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, location: newLocation, lastModified: new Date().toISOString() }
        : item
    ));
  };

  const handleEditSave = (updatedItem: InventoryItem) => {
    setItems(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    showToast({
      title: '商品更新完了',
      message: `${updatedItem.name} の情報を更新しました`,
      type: 'success'
    });
  };

  const handleMove = (itemId: string, newLocation: string, reason: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, location: newLocation, lastModified: new Date().toISOString() }
        : item
    ));
    showToast({
      title: '商品移動完了',
      message: `商品を${newLocation}に移動しました`,
      type: 'success'
    });
  };

  const handleListingSuccess = (listing: any) => {
    // 出品成功時に商品ステータスを更新
    setItems(prev => prev.map(item => 
      item.id === selectedItem?.id 
        ? { ...item, status: 'listing', lastModified: new Date().toISOString() }
        : item
    ));
  };

  const handleBarcodeScanned = (barcode: string, productData?: any) => {
    if (productData) {
      // APIから商品データが取得できた場合
      const foundItem = items.find(item => item.sku === productData.sku);
      if (foundItem) {
        setSelectedItem(foundItem);
        setIsDetailModalOpen(true);
        setIsAnyModalOpen(true); // 業務フロー制御
        setIsBarcodeScannerOpen(false);
        showToast({
          title: '商品発見',
          message: `${foundItem.name} の詳細を表示しています`,
          type: 'success'
        });
      } else {
        // APIから取得した商品データをInventoryItem形式に変換
        const convertedItem: InventoryItem = {
          id: productData.id,
          name: productData.name,
          sku: productData.sku,
          category: productData.category,
          status: productData.status as any,
          location: productData.location,
          price: productData.price,
          condition: productData.condition,
          entryDate: productData.createdAt,
          lastModified: productData.updatedAt,
          qrCode: productData.qrCode,
          notes: productData.description,
          quantity: 1,
          lastChecked: productData.updatedAt,
          imageUrl: productData.imageUrl,
          assignedStaff: '山本 達也',
          inspectedAt: productData.inspectedAt || null, // 検品日時を追加
          photographyDate: productData.photographyDate || null, // 撮影日時を追加
        };
        setSelectedItem(convertedItem);
        setIsDetailModalOpen(true);
        setIsBarcodeScannerOpen(false);
        showToast({
          title: '商品発見',
          message: `${convertedItem.name} の詳細を表示しています`,
          type: 'success'
        });
      }
    } else {
      // APIから商品データが取得できない場合、手動検索
      const foundItem = items.find(item => 
        item.sku === barcode || item.qrCode === barcode
      );
      if (foundItem) {
        setSelectedItem(foundItem);
        setIsDetailModalOpen(true);
        setIsBarcodeScannerOpen(false);
        showToast({
          title: '商品発見',
          message: `${foundItem.name} の詳細を表示しています`,
          type: 'success'
        });
      } else {
        showToast({
          title: '商品が見つかりません',
          message: `バーコード: ${barcode} に対応する商品が見つかりません`,
          type: 'warning'
        });
      }
    }
  };

  const handleQRCode = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsQRModalOpen(true);
  };

  // 選択した商品の画像を一括ダウンロード
  const handleBulkDownload = async () => {
    if (selectedItems.length === 0) {
      showToast({
        type: 'warning',
        title: '商品未選択',
        message: 'ダウンロードする商品を選択してください',
        duration: 3000
      });
      return;
    }

    setBulkDownloading(true);

    try {
      let totalFiles = 0;
      let successCount = 0;

      // 各商品の画像を順次ダウンロード
      for (const productId of selectedItems) {
        try {
          const product = items.find(item => item.id === productId);
          if (!product) continue;

          const response = await fetch('/api/images/download', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId: productId,
              downloadType: 'zip',
              includeMetadata: true
            }),
          });

          if (response.ok) {
            const blob = await response.blob();

            // ファイルサイズをチェック（空でないか）
            if (blob.size > 100) { // 100バイト以上なら有効なZIPファイルとみなす
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${product.name}_images.zip`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);

              successCount++;
              totalFiles++;

              // ダウンロード間隔を設ける（ブラウザの制限回避）
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        } catch (error) {
          console.error(`商品 ${productId} の画像ダウンロードエラー:`, error);
        }
      }

      if (successCount > 0) {
        showToast({
          type: 'success',
          title: '一括ダウンロード完了',
          message: `${successCount}件の商品画像をダウンロードしました`,
          duration: 3000
        });
      } else {
        showToast({
          type: 'warning',
          title: 'ダウンロード対象なし',
          message: '選択した商品にダウンロード可能な画像がありませんでした',
          duration: 3000
        });
      }

      // 選択をクリア
      setSelectedItems([]);

    } catch (error) {
      console.error('一括ダウンロードエラー:', error);
      showToast({
        type: 'error',
        title: 'ダウンロード失敗',
        message: '一括ダウンロード中にエラーが発生しました',
        duration: 5000
      });
    } finally {
      setBulkDownloading(false);
    }
  };





  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <NexusLoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* 統一ヘッダー */}
        <UnifiedPageHeader
          title="在庫管理"
          subtitle="全セラーの商品を管理・モニタリング"
          userType="staff"
          iconType="inventory"
        />

        {/* スタッフ在庫管理 - 統合版 */}
        <div className="intelligence-card oceania">
          

          
          {/* フィルター部分（完全保持） */}
          <div className="p-6 border-b border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <NexusInput
                  type="text"
                  label="検索"
                  placeholder="商品名・SKU・セラー名で検索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <NexusSelect
                  label="ステータス"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  data-testid="status-filter"
                  options={[
                    { value: 'all', label: 'すべてのステータス' },
                    { value: 'inbound', label: '入庫待ち' },
                    { value: 'inspection', label: '保管作業中' },
                    { value: 'storage', label: '保管中' },
                    { value: 'listing', label: '出品中' },
                    { value: 'sold', label: '購入者決定' },
                    { value: 'cancelled', label: 'キャンセル' },
                    { value: 'returned', label: '返品' },
                    { value: 'on_hold', label: '保留中' },
                    { value: 'shipping', label: '出荷済み' }
                  ]}
                  useCustomDropdown={true}
                />
              </div>

              <div>
                <NexusSelect
                  label="カテゴリー"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  options={categoryOptions}
                  useCustomDropdown={true}
                />
              </div>

              <div>
                <NexusSelect
                  label="保管場所"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  options={[
                    { value: 'all', label: 'すべて' },
                    ...locationMasters
                      .map((location) => ({
                        value: location.code,
                        label: `${location.code}（${location.name}）`
                      }))
                  ]}
                  useCustomDropdown={true}
                  disabled={locationsLoading}
                />
              </div>
            </div>
          </div>
          
          {/* テーブル部分 */}
          <div className="p-6">
            {/* 一括アクション */}
            {selectedItems.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-blue-900">
                      {selectedItems.length}件の商品を選択中
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <NexusButton
                      onClick={handleBulkDownload}
                      disabled={bulkDownloading}
                      variant="secondary"
                      size="sm"
                      icon={<ArrowDownTrayIcon className="w-4 h-4" />}
                    >
                      {bulkDownloading ? '画像取得中...' : '画像一括ダウンロード'}
                    </NexusButton>
                    <NexusButton
                      onClick={() => setSelectedItems([])}
                      variant="outline"
                      size="sm"
                      icon={<XMarkIcon className="w-4 h-4" />}
                    >
                      選択解除
                    </NexusButton>
                  </div>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="holo-table">
                              <thead className="holo-header">
                  <tr>
                    <th className="p-4 text-center text-xs font-medium text-nexus-text-secondary uppercase tracking-wider whitespace-nowrap">画像</th>
                    <th className="p-4 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider">商品名</th>
                    <th className="p-4 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider whitespace-nowrap">SKU</th>
                    <th className="p-4 text-center text-xs font-medium text-nexus-text-secondary uppercase tracking-wider whitespace-nowrap">カテゴリー</th>
                    <th className="p-4 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider whitespace-nowrap">セラー名</th>
                    <th className="p-4 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider whitespace-nowrap">保管場所</th>
                    <th className="p-4 text-center text-xs font-medium text-nexus-text-secondary uppercase tracking-wider whitespace-nowrap">更新日</th>
                    <th className="p-4 text-center text-xs font-medium text-nexus-text-secondary uppercase tracking-wider whitespace-nowrap">ステータス</th>
                    <th className="p-4 text-center text-xs font-medium text-nexus-text-secondary uppercase tracking-wider whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                              <tbody>
                  {paginatedItems.map((item) => (
                    <tr 
                      key={item.id} 
                      className={`border-b border-nexus-border hover:bg-nexus-bg-tertiary transition-colors ${item.isBundleItem ? 'bg-blue-50 border-l-4 border-l-blue-400' : ''}`}
                    >
                      <td className="p-4">
                        <div className="flex justify-center">
                          <div className="w-20 h-20 overflow-hidden rounded-lg border border-nexus-border bg-gray-100">
                            {(item.imageUrl || (item.images && item.images.length > 0)) ? (
                              <img
                                src={item.imageUrl || item.images[0].url || item.images[0].thumbnailUrl || item.images[0]}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                title="商品画像"
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
                        <div className="font-medium text-sm text-nexus-text-primary">{item.name}</div>
                        {item.isBundleItem && (
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center gap-1 text-xs">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                📦 同梱対象
                              </span>
                              {item.bundleTrackingNumber && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                  {item.bundleTrackingNumber}
                                </span>
                              )}
                            </div>
                            {item.bundlePeers && item.bundlePeers.length > 0 && (
                              <div className="text-xs text-blue-600">
                                同梱相手: {item.bundlePeers.join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-sm text-nexus-text-primary">{item.sku}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-sm text-nexus-text-primary">{getNameByKey(categories, item.category) || item.category}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-nexus-text-primary">{item.seller?.fullName || item.seller?.username || item.seller?.email || '未設定'}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-nexus-text-primary">{item.location}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-sm text-nexus-text-secondary">
                          {new Date(item.lastModified).toLocaleDateString('ja-JP')}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <BusinessStatusIndicator status={item.status} size="sm" />
                      </td>
                      <td className="p-4 text-center">
                        <NexusButton
                          onClick={() => {
                            setSelectedItem(item);
                            setIsDetailModalOpen(true);
                          }}
                          size="sm"
                          variant="secondary"
                          icon={<EyeIcon className="w-4 h-4" />}
                        >
                          詳細
                        </NexusButton>
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {/* ページネーション */}
            {/* サーバーサイドページネーション対応 */}
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

        {filteredItems.length === 0 && (
          <div className="intelligence-card global">
            <div className="p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-nexus-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-nexus-text-primary">商品が見つかりません</h3>
              <p className="mt-1 text-sm text-nexus-text-secondary">
                フィルター条件を変更するか、新しい商品を登録してください。
              </p>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          itemId={selectedItem?.id || ''}
          itemName={selectedItem?.name || ''}
          itemSku={selectedItem?.sku || ''}
        />

        {/* Item Detail Modal */}
        <ItemDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          item={selectedItem}
          onStartInspection={(item) => {
            setIsDetailModalOpen(false);
            // 状態を保存してから検品画面に遷移
            saveCurrentState();
            window.location.href = `/staff/inspection/${item.id}?from=inventory`;
          }}
          onStartPhotography={(item) => {
            setIsDetailModalOpen(false);
            // 状態を保存してから撮影専用モードで検品画面に遷移
            saveCurrentState();
            window.location.href = `/staff/inspection/${item.id}?mode=photography&from=inventory`;
          }}
          onStartListing={(item) => {
            setIsDetailModalOpen(false);
            // 出品モーダルを開く
            setIsListingModalOpen(true);
          }}
        />

        {/* Product Edit Modal */}
        <ProductEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          item={selectedItem}
          onSave={handleEditSave}
        />

        {/* Product Move Modal */}
        <ProductMoveModal
          isOpen={isMoveModalOpen}
          onClose={() => setIsMoveModalOpen(false)}
          item={selectedItem}
          onMove={handleMove}
        />

        {/* Listing Form Modal */}
        <ListingFormModal
          isOpen={isListingModalOpen}
          onClose={() => setIsListingModalOpen(false)}
          product={selectedItem ? {
            id: selectedItem.id,
            name: selectedItem.name,
            sku: selectedItem.sku,
            category: selectedItem.category,
            price: selectedItem.price,
            condition: selectedItem.condition,
            description: selectedItem.notes,
            imageUrl: selectedItem.imageUrl
          } : null}
          onSuccess={handleListingSuccess}
        />

        {/* Product Info Modal (for storage completed products) */}
        <ProductInfoModal
          isOpen={isProductInfoModalOpen}
          onClose={handleCloseProductInfoModal}
          product={selectedProductForInfo}
          onMove={(productId) => {
            // ProductInfoModalを閉じる
            handleCloseProductInfoModal();
            // 移動対象商品を設定してMoveModalを開く
            const productForMove = items.find(item => item.id === productId);
            if (productForMove) {
              setSelectedItem(productForMove);
              setIsMoveModalOpen(true);
            }
          }}
        />

        {/* Barcode Scanner Modal */}
        {isBarcodeScannerOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-[10001] p-4 pt-8">
            <div className="intelligence-card global max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 overflow-y-auto max-h-full" ref={barcodeScannerRef}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-nexus-text-primary">バーコードスキャン</h3>
                  <NexusButton
                    onClick={() => setIsBarcodeScannerOpen(false)}
                    variant="default"
                    size="sm"
                    icon={<XMarkIcon className="w-4 h-4" />}
                  >
                    閉じる
                  </NexusButton>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-nexus-text-secondary">
                    商品のバーコードをスキャンすると、自動的に商品詳細が表示されます。
                  </p>
                </div>
                <BarcodeScanner
                  onScan={handleBarcodeScanned}
                  placeholder="商品バーコードをスキャン（日本語対応）"
                  scanType="product"
                  enableDatabaseLookup={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}