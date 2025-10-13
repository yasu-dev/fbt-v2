'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import BaseModal from '@/app/components/ui/BaseModal';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusCheckbox from '@/app/components/ui/NexusCheckbox';
import Pagination from '@/app/components/ui/Pagination';
import { useRouter } from 'next/navigation';
import { ClipboardDocumentListIcon, CubeIcon, PlusIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import LocationCreateForm from './LocationCreateForm';
import ProductImage from '@/app/components/ui/ProductImage';

interface Location {
  code: string;
  name: string;
  type: 'standard' | 'controlled' | 'secure' | 'processing';
  capacity: number;
  used: number;
  temperature?: string;
  humidity?: string;
  products: ProductInLocation[];
}

interface ProductInLocation {
  id: string;
  name: string;
  sku: string;
  category: string;
  registeredAt: string;
  registeredBy: string;
  imageUrl?: string | null;
}



interface LocationListProps {
  searchQuery?: string;
  onProductMove?: (productId: string, productName: string) => void;
}

export default function LocationList({ searchQuery = '', onProductMove }: LocationListProps) {
  const modalScrollRef = useRef<HTMLDivElement>(null);
  const [locations, setLocations] = useState<Location[]>([]);

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'shipping'>('shipping');
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [shippingData, setShippingData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [editForm, setEditForm] = useState({ code: '', name: '', capacity: '', isActive: true });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPickingModalOpen, setIsPickingModalOpen] = useState(false);
  const [selectedPickingItems, setSelectedPickingItems] = useState<any[]>([]);
  const [selectedLocationName, setSelectedLocationName] = useState<string>('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // ページネーション状態（リストビュー用）
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // ソート状態
  const [sortField, setSortField] = useState<'code' | 'name' | 'products' | null>('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { showToast } = useToast();
  const router = useRouter();

  // ロケーションコード専用ソート関数（A-1-1, A-1-2, ..., B-1-6順）
  const sortLocationCode = (codeA: string, codeB: string): number => {
    const parseLocationCode = (code: string) => {
      const match = code.match(/^([A-Z])-(\d+)-(\d+)$/);
      if (!match) return { zone: 'Z', section: 999, position: 999 }; // 無効なコードは最後に
      return {
        zone: match[1],
        section: parseInt(match[2]),
        position: parseInt(match[3])
      };
    };

    const a = parseLocationCode(codeA);
    const b = parseLocationCode(codeB);

    // ゾーン（A, B, C...）で比較
    if (a.zone !== b.zone) {
      return a.zone.localeCompare(b.zone);
    }
    // セクション（1, 2, 3...）で比較
    if (a.section !== b.section) {
      return a.section - b.section;
    }
    // ポジション（1, 2, 3...）で比較
    return a.position - b.position;
  };

  // ソート機能のハンドラー
  const handleSort = (field: 'code' | 'name' | 'products') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // ソートアイコンコンポーネント
  const SortIcon = ({ field }: { field: 'code' | 'name' | 'products' }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    if (sortDirection === 'asc') {
      return (
        <svg className="w-4 h-4 ml-1 text-nexus-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 ml-1 text-nexus-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
        </svg>
      );
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchLocations();

    fetchShippingData();
  }, []);

  // Filter locations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLocations(locations);
    } else {
      const filtered = locations.filter(location =>
        (location.code?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (location.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        location.products.some(product =>
          (product.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (product.sku?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (product.id?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        )
      );
      setFilteredLocations(filtered);
    }
  }, [searchQuery, locations]);

  // ソートとページネーション計算
  const sortedAndPaginatedLocations = useMemo(() => {
    let sortedLocations = [...filteredLocations];

    if (sortField) {
      sortedLocations.sort((a, b) => {
        let valueA: any, valueB: any;

        switch (sortField) {
          case 'code':
            valueA = a.code || '';
            valueB = b.code || '';
            break;
          case 'name':
            valueA = a.name || '';
            valueB = b.name || '';
            break;
          case 'products':
            valueA = a.products?.length || 0;
            valueB = b.products?.length || 0;
            break;
          default:
            valueA = a.code || '';
            valueB = b.code || '';
        }

        if (sortField === 'products') {
          // 数値ソート
          return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
        } else if (sortField === 'code') {
          // ロケーションコード専用ソート（A-1-1, A-1-2, ..., B-1-6順）
          const comparison = sortLocationCode(valueA, valueB);
          return sortDirection === 'asc' ? comparison : -comparison;
        } else {
          // 文字列ソート
          const comparison = valueA.localeCompare(valueB, 'ja');
          return sortDirection === 'asc' ? comparison : -comparison;
        }
      });
    }

    // リストビューの場合はページネーション適用
    if (viewMode === 'list') {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return sortedLocations.slice(startIndex, endIndex);
    }

    return sortedLocations;
  }, [filteredLocations, currentPage, itemsPerPage, viewMode, sortField, sortDirection]);

  const totalItems = viewMode === 'list' ? filteredLocations.length : 0;
  const totalPages = viewMode === 'list' ? Math.ceil(totalItems / itemsPerPage) : 0;

  // モーダルが開いたときにスクロール位置をリセット
  useEffect(() => {
    if (selectedLocation) {
      // ページ全体を最上部にスクロール - 正しいスクロールコンテナを対象
      const scrollContainer = document.querySelector('.page-scroll-container');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      } else {
        window.scrollTo(0, 0);
      }
      
      if (modalScrollRef.current) {
        modalScrollRef.current.scrollTop = 0;
      }
    }
  }, [selectedLocation]);

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      if (response.ok) {
        const data = await response.json();
        const fetchedLocations = data.map((location: any) => ({
          code: location.code,
          name: location.name,
          type: mapLocationTypeFromApi(location.zone),
          capacity: location.capacity || 50,
          used: location._count?.products || 0,
          products: (location.products || []).map((product: any) => ({
            id: product.id,
            name: product.name,
            sku: product.sku,
            category: product.category,
            registeredAt: product.createdAt,
            registeredBy: product.seller?.username || 'システム',
            imageUrl: product.images?.[0]?.url || product.images?.[0]?.thumbnailUrl || null
          }))
        }));
        setLocations(fetchedLocations);
        setFilteredLocations(fetchedLocations);
        return;
      }
      
      // APIエラー時のフォールバック
      console.error('Failed to fetch locations from API');
      const mockLocations: Location[] = [
        {
          code: 'STD-A-01',
          name: '標準棚A-01',
          type: 'standard',
          capacity: 50,
          used: 32,
          products: [
            {
              id: 'TWD-2024-001',
              name: 'Canon EOS R5 ボディ',
              sku: 'CAM-001',
              category: 'camera_body',
              registeredAt: '2024-01-20T10:00:00',
              registeredBy: 'セラーA',
            },
            {
              id: 'TWD-2024-003',
              name: 'Nikon Z9 ボディ',
              sku: 'CAM-003',
              category: 'camera_body',
              registeredAt: '2024-01-19T15:00:00',
              registeredBy: 'セラーB',
            },
          ],
        },
        {
          code: 'HUM-01',
          name: '防湿庫01',
          type: 'controlled',
          capacity: 30,
          used: 25,
          temperature: '22°C',
          humidity: '45%',
          products: [
            {
              id: 'TWD-2024-002',
              name: 'Sony FE 24-70mm F2.8 GM',
              sku: 'LENS-001',
              category: 'lens',
              registeredAt: '2024-01-18T14:00:00',
              registeredBy: 'セラーC',
            },
          ],
        },
        {
          code: 'VAULT-01',
          name: '金庫室01',
          type: 'secure',
          capacity: 10,
          used: 5,
          products: [],
        },
        {
          code: 'INSP-A',
          name: '検品室A',
          type: 'processing',
          capacity: 100,
          used: 15,
          products: [],
        },
      ];

      setLocations(mockLocations);
      setFilteredLocations(mockLocations);
    } catch (error) {
      console.error('[ERROR] Fetch locations:', error);
    } finally {
      setLoading(false);
    }
  };



  const fetchShippingData = async () => {
    try {
      console.log('🔍 ピッキングデータ取得開始');

      // 1. 全てのロケーションを取得
      const locationsResponse = await fetch('/api/locations');
      const allLocations = locationsResponse.ok ? await locationsResponse.json() : [];
      console.log(`📍 全ロケーション数: ${allLocations.length}`);

      // 2. ピッキングタスクデータを取得
      const response = await fetch('/api/picking');
      if (response.ok) {
        const data = await response.json();
        console.log('📡 ピッキングAPIレスポンス:', {
          success: data.success,
          tasksLength: data.tasks?.length || 0,
          statisticsTotal: data.statistics?.total || 0
        });

        // ピッキングタスクを出荷リスト形式に変換（同梱情報統合）
        const pickingItems = (data.tasks || []).flatMap((task: any) =>
          (task.items || []).map((item: any) => {
            const safeProductId = item.productId || item.id || `pick-${item.id}`;
            console.log(`📦 ピッキングアイテム処理: ${item.productName} (${safeProductId})`);
            // APIから取得した同梱情報をそのまま使用
            const isBundleItem = item.isBundleItem === true;
            const bundleTrackingNumber = item.bundleTrackingNumber || task.bundleTrackingNumber;
            const bundlePeers = item.bundlePeers || task.bundlePeers || [];

            // 同梱対象商品のデバッグログ（汎用化）
            const isTestProduct = /camera\d+|テストカメラ\d+|XYZcamera\d+/i.test(item.productName || '');
            if (isTestProduct) {
              console.log('🔍 同梱対象商品のAPI変換処理:', {
                productName: item.productName,
                originalIsBundleItem: item.isBundleItem,
                processedIsBundleItem: isBundleItem,
                bundleTrackingNumber: bundleTrackingNumber,
                bundlePeers: bundlePeers
              });
            }

            return {
              id: safeProductId,
              orderId: task.orderId,
              productId: safeProductId,
              productName: item.productName,
              customer: task.customerName,
              sellerName: item.sellerName || task.sellerName || 'セラー名不明',
              locationCode: item.location,
              locationName: item.locationName ? `${item.location}（${item.locationName}）` : `ロケーション ${item.location}`,
              status: 'ピッキング待ち', // 全てピッキング待ちに統一
              sku: item.sku,
              // 商品画像を追加
              productImage: item.productImage || item.imageUrl || '/api/placeholder/64/64',
              // 同梱情報を追加（APIから取得したデータをそのまま使用）
              bundleId: item.bundleId || task.bundleId || null,
              bundleTrackingNumber: bundleTrackingNumber,
              isBundleItem: isBundleItem,
              bundlePeers: bundlePeers
            };
          })
        );

        console.log(`✅ ピッキングアイテム変換完了: ${pickingItems.length}件`);

        // 3. 全ロケーションとピッキングデータをマージ
        const groupedByLocation = groupShippingDataByLocationWithAll(pickingItems, allLocations);
        console.log(`📍 全ロケーション別グループ数: ${groupedByLocation.length}`);

        setShippingData(groupedByLocation);
        return;
      } else {
        console.error('❌ ピッキングAPIエラー:', response.status, response.statusText);
      }
      
      // フォールバック: モックデータ
          const mockShippingData = [
        {
          id: "ship-001",
          orderId: "ORD-2024-0628-001",
          productId: "TWD-CAM-011",
          productName: "Nikon Z8",
              customer: "顧客A",
              sellerName: "セラー名不明",
          locationCode: "A-01",
          locationName: "A棚1段目",
          status: "ピッキング待ち",
          productImage: "/api/placeholder/64/64"
        },
        {
          id: "ship-002",
          orderId: "ORD-2024-0628-002",
          productId: "TWD-LEN-005",
          productName: "Canon RF 24-70mm F2.8",
              customer: "顧客B",
              sellerName: "セラー名不明",
          locationCode: "B-01",
          locationName: "B棚1段目",
          status: "ピッキング待ち",
          productImage: "/api/placeholder/64/64"
        },
        {
          id: "ship-003",
          orderId: "ORD-2024-0628-003",
          productId: "TWD-WATCH-001",
          productName: "Rolex Submariner",
              customer: "顧客C",
              sellerName: "セラー名不明",
          locationCode: "C-01",
          locationName: "C棚1段目（高価値商品）",
          status: "ピッキング待ち",
          productImage: "/api/placeholder/64/64"
        }
      ];
      const groupedData = allLocations.length > 0
        ? groupShippingDataByLocationWithAll(mockShippingData, allLocations)
        : groupShippingDataByLocation(mockShippingData);
      setShippingData(groupedData);
    } catch (error) {
      console.error('[ERROR] Fetch shipping data:', error);
      // エラー時もモックデータを表示
      const mockShippingData = [
        {
          id: "ship-001",
          orderId: "ORD-2024-0628-001",
          productId: "TWD-CAM-011",
          productName: "Nikon Z8",
          customer: "顧客A",
          sellerName: "セラー名不明",
          locationCode: "A-01",
          locationName: "A棚1段目",
          status: "ピッキング待ち",
          productImage: "/api/placeholder/64/64"
        },
        {
          id: "ship-002",
          orderId: "ORD-2024-0628-002",
          productId: "TWD-LEN-005",
          productName: "Canon RF 24-70mm F2.8",
          customer: "顧客B",
          sellerName: "セラー名不明",
          locationCode: "B-01",
          locationName: "B棚1段目",
          status: "ピッキング待ち",
          productImage: "/api/placeholder/64/64"
        }
      ];
      const groupedData = allLocations.length > 0
        ? groupShippingDataByLocationWithAll(mockShippingData, allLocations)
        : groupShippingDataByLocation(mockShippingData);
      setShippingData(groupedData);
    }
  };

  const groupShippingDataByLocation = (shippingItems: any[]) => {
    const grouped = shippingItems.reduce((acc, item) => {
      const locationKey = item.locationCode || 'NO_LOCATION';
      if (!acc[locationKey]) {
        acc[locationKey] = {
          locationCode: item.locationCode || 'NO_LOCATION',
          locationName: item.locationName || '未設定',
          items: []
        };
      }
      acc[locationKey].items.push(item);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  };

  // 全ロケーションとピッキングデータをマージする関数
  const groupShippingDataByLocationWithAll = (pickingItems: any[], allLocations: any[]) => {
    console.log('🔄 全ロケーションとピッキングデータのマージ開始');

    // まずピッキングデータをロケーション別にグループ化
    const pickingGrouped = pickingItems.reduce((acc, item) => {
      const locationKey = item.locationCode || 'NO_LOCATION';
      if (!acc[locationKey]) {
        acc[locationKey] = [];
      }
      acc[locationKey].push(item);
      return acc;
    }, {} as Record<string, any[]>);

    console.log(`📦 ピッキングデータのロケーション数: ${Object.keys(pickingGrouped).length}`);

    // 全ロケーションに対してデータを作成
    const result = allLocations.map((location) => {
      const locationCode = location.code;
      const pickingItemsForLocation = pickingGrouped[locationCode] || [];

      // ロケーション名の生成（APIで取得した正式名称を使用）
      const locationName = location.name ?
        `${locationCode}（${location.name}）` :
        `${locationCode}（ロケーション名未設定）`;

      console.log(`📍 ロケーション処理: ${locationCode} - ピッキング件数: ${pickingItemsForLocation.length}`);

      return {
        locationCode: locationCode,
        locationName: locationName,
        items: pickingItemsForLocation
      };
    });

    // ロケーションコード昇順でソート
    const sorted = result.sort((a, b) => sortLocationCode(a.locationCode, b.locationCode));
    console.log(`✅ 全ロケーション処理完了: ${sorted.length}件`);

    return sorted;
  };

  const getLocationTypeLabel = (zone: string) => {
    switch (zone) {
      case 'A':
      case 'B':
      case 'C':
        return { label: '標準棚', badge: 'info' };
      case 'H':
        return { label: '防湿庫', badge: 'warning' };
      case 'T':
        return { label: '温度管理庫', badge: 'warning' };
      case 'V':
        return { label: '金庫室', badge: 'danger' };
      case 'P':
        return { label: '作業エリア', badge: 'success' };
      default:
        return { label: '標準棚', badge: 'info' };
    }
  };

  const getOccupancyStatus = (used: number, capacity: number) => {
    const percentage = (used / capacity) * 100;
    if (percentage >= 90) return 'critical';
    if (percentage >= 70) return 'monitoring';
    return 'optimal';
  };

  const mapLocationTypeFromApi = (zone: string) => {
    switch (zone?.toLowerCase()) {
      case 'h': return 'controlled'; // 防湿庫
      case 't': return 'controlled'; // 温度管理庫
      case 'v': return 'secure'; // 金庫室
      case 'p': return 'processing'; // 作業エリア
      case 's': return 'processing'; // 一時保管エリア
      case 'r': return 'processing'; // 返品処理エリア
      case 'a': return 'standard'; // Zone A
      case 'b': return 'standard'; // Zone B
      case 'c': return 'standard'; // Zone C
      default: return 'standard'; // その他標準棚
    }
  };

  const handleCreateLocation = async (locationData: any) => {
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationData)
      });
      
      if (response.ok) {
        showToast({
          type: 'success',
          title: 'ロケーション作成完了',
          message: `${locationData.name}を作成しました`,
          duration: 3000
        });
        fetchLocations(); // データを再取得
      } else {
        throw new Error('ロケーション作成に失敗しました');
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'エラー',
        message: 'ロケーション作成中にエラーが発生しました',
        duration: 4000
      });
    }
  };


  const handleDeleteLocation = async (locationCode: string) => {
    setLocationToDelete(locationCode);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteLocation = async () => {
    if (!locationToDelete) return;

    try {
      const response = await fetch(`/api/locations?code=${locationToDelete}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showToast({
          type: 'success',
          title: 'ロケーション削除完了',
          message: 'ロケーションを削除しました',
          duration: 3000
        });
        fetchLocations(); // データを再取得
        setSelectedLocation(null); // 選択状態をクリア
        setIsDeleteModalOpen(false);
        setLocationToDelete(null);
      } else {
        throw new Error('ロケーション削除に失敗しました');
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'エラー',
        message: 'ロケーション削除中にエラーが発生しました',
        duration: 4000
      });
    }
  };

  const handleEditLocation = async (location: Location) => {
    setEditingLocation(location);
    setEditForm({
      code: location.code,
      name: location.name,
      capacity: location.capacity.toString(),
      isActive: location.zone !== 'P' // 作業エリア以外はアクティブ状態を編集可能
    });
    setIsEditModalOpen(true);
  };

  const confirmEditLocation = async () => {
    if (!editingLocation) return;

    try {
      const response = await fetch('/api/locations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalCode: editingLocation.code, // 元のコードで検索
          code: editForm.code, // 新しいコード
          name: editForm.name,
          capacity: parseInt(editForm.capacity),
          isActive: editForm.isActive
        })
      });

      if (response.ok) {
        showToast({
          type: 'success',
          title: 'ロケーション更新完了',
          message: 'ロケーション情報を更新しました',
          duration: 3000
        });
        fetchLocations(); // データを再取得
        setIsEditModalOpen(false);
        setEditingLocation(null);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'ロケーション更新に失敗しました');
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'エラー',
        message: error instanceof Error ? error.message : 'ロケーション更新中にエラーが発生しました',
        duration: 4000
      });
    }
  };

  if (!mounted || loading) {
    return (
      <div className="intelligence-card global">
        <div className="p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-12 w-12 border-b-4 border-nexus-yellow rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="intelligence-card oceania">
        <div className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-display font-bold text-nexus-text-primary">ロケーション一覧</h2>

            {/* 追加ボタン */}
            <NexusButton
              onClick={() => setIsAddModalOpen(true)}
              variant="primary"
              size="sm"
              icon={<PlusIcon className="w-4 h-4" />}
            >
              新規追加
            </NexusButton>
            
            {/* ビューモード切り替え */}
            <div className="flex gap-1 bg-nexus-bg-secondary p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-nexus-bg-primary text-nexus-yellow shadow-sm'
                    : 'text-nexus-text-secondary hover:text-nexus-text-primary'
                }`}
              >
                グリッド
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-nexus-bg-primary text-nexus-yellow shadow-sm'
                    : 'text-nexus-text-secondary hover:text-nexus-text-primary'
                }`}
              >
                リスト
              </button>

              <button
                onClick={() => setViewMode('shipping')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'shipping'
                    ? 'bg-nexus-bg-primary text-nexus-yellow shadow-sm'
                    : 'text-nexus-text-secondary hover:text-nexus-text-primary'
                }`}
              >
                ピッキングリスト
              </button>
            </div>
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="mb-4 p-3 bg-nexus-bg-secondary rounded-lg border border-nexus-border">
              <p className="text-sm text-nexus-text-secondary">
                「<span className="font-medium text-nexus-text-primary">{searchQuery}</span>」の検索結果: 
                <span className="font-medium text-nexus-yellow ml-1">{filteredLocations.length}件</span>
              </p>
            </div>
          )}

          {/* グリッドビュー */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedAndPaginatedLocations.map((location) => {
                const typeInfo = getLocationTypeLabel(location.zone);
                const occupancyStatus = getOccupancyStatus(location.used, location.capacity);
                return (
                  <div
                    key={location.code}
                    className="holo-card p-6 cursor-pointer"
                    onClick={() => setSelectedLocation(location)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-nexus-text-primary">{location.name}</h3>
                        <p className="text-sm text-nexus-text-secondary font-mono">{location.code}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditLocation(location);
                          }}
                          className="p-2 text-nexus-text-secondary hover:text-nexus-yellow hover:bg-nexus-bg-secondary rounded-lg transition-colors"
                          title="編集"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <span className={`status-badge ${typeInfo.badge}`}>
                          {typeInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* 使用状況 */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-nexus-text-secondary">使用状況</span>
                        <div className="flex items-center gap-2">
                          <div className={`status-orb status-${occupancyStatus}`} />
                          <span className="font-medium text-sm">
                            {location.used}/{location.capacity}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-nexus-bg-secondary rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            occupancyStatus === 'critical' ? 'bg-nexus-red' :
                            occupancyStatus === 'monitoring' ? 'bg-nexus-yellow' :
                            'bg-nexus-green'
                          }`}
                          style={{
                            width: `${(location.used / location.capacity) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* 環境情報 */}
                    {location.type === 'controlled' && (
                      <div className="flex gap-4 text-sm text-nexus-text-secondary">
                        {location.temperature && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-nexus-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 6v6l4.24 4.24a1 1 0 11-1.42 1.42L12 14h-1a5 5 0 110-10h1z" />
                            </svg>
                            {location.temperature}
                          </span>
                        )}
                        {location.humidity && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            {location.humidity}
                          </span>
                        )}
                      </div>
                    )}

                    {/* 商品数 */}
                    <div className="mt-3 text-sm text-nexus-text-secondary">
                      保管商品: <span className="font-medium text-nexus-text-primary">{location.products.length}件</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* リストビュー */}
          {viewMode === 'list' && (
            <div className="holo-table">
              <table className="w-full">
                <thead className="holo-header">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-nexus-bg-secondary transition-colors"
                      onClick={() => handleSort('code')}
                    >
                      <div className="flex items-center">
                        コード
                        <SortIcon field="code" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-nexus-bg-secondary transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        名前
                        <SortIcon field="name" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">タイプ</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">使用状況</th>
                    <th
                      className="px-4 py-3 text-center text-sm font-medium cursor-pointer hover:bg-nexus-bg-secondary transition-colors"
                      onClick={() => handleSort('products')}
                    >
                      <div className="flex items-center justify-center">
                        商品数
                        <SortIcon field="products" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="holo-body">
                  {sortedAndPaginatedLocations.map((location) => {
                    const typeInfo = getLocationTypeLabel(location.zone);
                    const occupancyStatus = getOccupancyStatus(location.used, location.capacity);
                    return (
                      <tr
                        key={location.code}
                        className="holo-row cursor-pointer"
                        onClick={() => setSelectedLocation(location)}
                      >
                        <td className="px-4 py-4 text-sm font-mono">{location.code}</td>
                        <td className="px-4 py-4 text-sm font-medium">{location.name}</td>
                        <td className="px-4 py-4 text-sm">
                          <span className={`status-badge ${typeInfo.badge}`}>
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-nexus-bg-secondary rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  occupancyStatus === 'critical' ? 'bg-nexus-red' :
                                  occupancyStatus === 'monitoring' ? 'bg-nexus-yellow' :
                                  'bg-nexus-green'
                                }`}
                                style={{
                                  width: `${(location.used / location.capacity) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-medium">
                              {location.used}/{location.capacity}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-center font-display">
                          {location.products.length}
                        </td>
                        <td className="px-4 py-4 text-sm text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditLocation(location);
                            }}
                            className="p-2 text-nexus-text-secondary hover:text-nexus-yellow hover:bg-nexus-bg-secondary rounded-lg transition-colors"
                            title="編集"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* ページネーション（リストビュー用） */}
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
          )}



          {/* ピッキングリストビュー */}
          {viewMode === 'shipping' && (
            <div className="space-y-6">
              {shippingData.length === 0 ? (
                <div className="text-center p-8 text-nexus-text-secondary">
                  ピッキング対象の商品はありません
                  <p className="text-sm mt-2">ラベル準備完了後、商品がここに表示されます</p>
                  {searchQuery && (
                    <div className="mt-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-nexus-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-sm font-medium text-nexus-yellow">
                        「{searchQuery}」の検索結果を表示するには、「グリッド」または「リスト」ビューに切り替えてください。
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* 検索結果がある場合の注意メッセージ */}
                  {searchQuery && filteredLocations.length > 0 && (
                    <div className="holo-card p-4 border-l-4 border-nexus-yellow">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-nexus-yellow flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <div>
                          <p className="font-medium text-nexus-text-primary">
                            検索結果: 「{searchQuery}」で{filteredLocations.length}件のロケーションが見つかりました
                          </p>
                          <p className="text-sm text-nexus-text-secondary mt-1">
                            詳細を確認するには「グリッド」または「リスト」ビューに切り替えてください。
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {shippingData.filter(locationGroup => {
                  // ピッキング待ちの商品があるロケーションのみ表示（ピッキング済みは除外）
                  const activeItems = locationGroup.items.filter((item: any) =>
                    item.status === 'ピッキング待ち'
                  );

                  // ピッキング対象がないロケーションも表示（0件として）
                  
                  // 検索条件でフィルタリング
                  if (!searchQuery) return true;
                  
                  return (locationGroup.locationCode?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                    (locationGroup.locationName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                    locationGroup.items.some((item: any) =>
                      (item.productName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                      (item.productId?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                      (item.sku?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                      (item.sku?.split('-').slice(0, 3).join('-').toLowerCase() || '').includes(searchQuery.toLowerCase())
                    );
                }).sort((a, b) => {
                  // ピッキングリストでもロケーションコード昇順ソート（A-1-1, A-1-2, ..., B-1-6）
                  return sortLocationCode(a.locationCode || '', b.locationCode || '');
                }).map((locationGroup) => {
                  const activeItems = locationGroup.items.filter((item: any) =>
                    item.status === 'ピッキング待ち'
                  );
                  const completedItems = []; // ピッキング済み商品は表示しない
                  
                  return (
                  <div key={locationGroup.locationCode} className="holo-card p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-nexus-text-primary flex items-center gap-3">
                        <svg className="w-5 h-5 text-nexus-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {locationGroup.locationName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-nexus-text-secondary mt-1">
                        <span>
                          未処理: <span className="font-medium text-nexus-yellow">{activeItems.length}件</span>
                        </span>
                        {completedItems.length > 0 && (
                          <span>
                            処理済み: <span className="font-medium text-green-600">{completedItems.length}件</span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {activeItems.map((item: any) => {
                        // デバッグ用ログ - 詳細版（汎用化）
                        const isTestProduct = /camera\d+|テストカメラ\d+|XYZcamera\d+/i.test(item.productName || '');
                        if (isTestProduct) {
                          console.log('🔍 同梱対象商品の表示データ（詳細）:', {
                            productName: item.productName,
                            isBundleItem: item.isBundleItem,
                            bundleTrackingNumber: item.bundleTrackingNumber,
                            bundlePeers: item.bundlePeers,
                            bundleId: item.bundleId,
                            willShowBlueBackground: item.isBundleItem ? 'YES' : 'NO',
                            locationCode: item.locationCode,
                            locationName: item.locationName
                          });
                        }
                        return (
                        <div
                          key={item.id}
                          className={`flex justify-between items-start p-6 rounded-xl border-2 transition-all duration-200 ${
                            item.isBundleItem
                              ? 'bg-blue-200 border-blue-600 border-4 shadow-xl transform hover:scale-[1.02]'
                              : 'bg-nexus-bg-secondary border-nexus-border hover:shadow-md'
                          }`}
                          style={{
                            backgroundColor: item.isBundleItem
                              ? '#dbeafe' : undefined,
                            borderColor: item.isBundleItem
                              ? '#2563eb' : undefined
                          }}
                        >
                          <div className="flex items-start gap-3 flex-1">
                                {/* 商品選択チェックボックス */}
                            {item.status === 'ピッキング待ち' && (
                              <div className="mt-1">
                                <NexusCheckbox
                                  checked={selectedProductIds.includes(item.id) || selectedProductIds.includes(item.productId)}
                                  onChange={(e) => {
                                    const targetId = item.productId || item.id;
                                    if (e.target.checked) {
                                      setSelectedProductIds(prev => [...prev, targetId]);
                                    } else {
                                      setSelectedProductIds(prev => prev.filter(id => id !== targetId));
                                    }
                                  }}
                                  variant="nexus"
                                  size={item.isBundleItem ? "lg" : "md"}
                                />
                              </div>
                            )}
                            {/* 商品画像 */}
                            <div className="flex-shrink-0">
                              <div className="w-16 h-16 rounded border border-nexus-border overflow-hidden bg-nexus-bg-secondary">
                                {item.productImage ? (
                                  <img
                                    src={item.productImage}
                                    alt={item.productName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-nexus-text-tertiary">
                                    <ClipboardDocumentListIcon className="w-5 h-5" />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className={`font-semibold ${item.isBundleItem ? 'text-lg text-blue-900' : 'text-base text-nexus-text-primary'}`}>
                                  {item.productName}
                                </h4>
                                {item.sku && (
                                  <span className={`font-mono px-3 py-1 rounded-lg ${
                                    item.isBundleItem
                                      ? 'text-sm bg-blue-200 text-blue-800 font-medium'
                                      : 'text-xs bg-nexus-bg-primary text-nexus-text-secondary'
                                  }`}>
                                    {item.sku.split('-').slice(0, 3).join('-')}
                                  </span>
                                )}
                                {/* 同梱バッジ */}
                                {item.isBundleItem && (
                                  <span className="inline-flex items-center gap-1 text-sm px-4 py-2 bg-blue-600 text-white rounded-full font-bold shadow-md">
                                    <CubeIcon className="w-4 h-4" />
                                    同梱対象
                                  </span>
                                )}
                              </div>
                              
                              {/* 同梱情報表示 - 大幅改善 */}
                              {item.isBundleItem && (
                                <div className="mt-3 p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl border-2 border-blue-300 shadow-inner">
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                                      <span className="text-base font-bold text-blue-900">
                                        📋 追跡番号: {item.bundleTrackingNumber}
                                      </span>
                                    </div>
                                    {item.bundlePeers && item.bundlePeers.length > 0 && (
                                      <div className="flex items-start gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                                        <div>
                                          <div className="text-sm font-semibold text-blue-800 mb-1">🔗 同梱相手商品:</div>
                                          <div className="bg-white p-2 rounded-lg border border-blue-200">
                                            <span className="text-base font-medium text-blue-900">
                                              {item.bundlePeers.join(', ')}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    <div className="bg-amber-100 border-l-4 border-amber-500 p-3 rounded-r-lg">
                                      <div className="flex items-center gap-2 text-amber-800">
                                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.768 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <span className="text-base font-bold">
                                          ⚠️ 同じ追跡番号の商品をまとめてピッキングしてください
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div className="mt-2 text-sm space-y-1">
                                <div className="text-nexus-text-secondary font-mono">
                                  商品SKU: <span className="font-medium text-nexus-text-primary">{item.sku || 'N/A'}</span>
                                </div>
                                {item.productId && (
                                  <div className="text-nexus-text-secondary font-mono">
                                    商品ID: <span className="font-medium text-nexus-text-primary">{item.productId}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-4 border-t border-nexus-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {activeItems.length > 0 && (
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={activeItems.every(item => selectedProductIds.includes(item.id))}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                      const newIds = activeItems.map(item => item.productId || item.id);
                                      setSelectedProductIds(prev => [...new Set([...prev, ...newIds])]);
                                    } else {
                                      const activeItemIds = activeItems.map(item => item.productId || item.id);
                                      setSelectedProductIds(prev => prev.filter(id => !activeItemIds.includes(id)));
                                    }
                                }}
                                className="w-4 h-4 text-nexus-yellow bg-nexus-bg-primary border-nexus-border rounded focus:ring-nexus-yellow focus:ring-2"
                              />
                              <span className="text-sm text-nexus-text-secondary">
                                このロケーションの全商品を選択
                              </span>
                            </div>
                          )}
                          {selectedProductIds.filter(id => 
                            activeItems.some(item => item.id === id || item.productId === id)
                          ).length > 0 && (
                            <span className="text-sm font-medium text-nexus-text-primary">
                              {selectedProductIds.filter(id => 
                                activeItems.some(item => item.id === id || item.productId === id)
                              ).length}件選択済み
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <NexusButton
                            variant="default"
                            size="sm"
                            onClick={() => {
                              const currentLocationSelectedIds = selectedProductIds.filter(id => 
                                activeItems.some(item => item.id === id || item.productId === id)
                              );
                              if (currentLocationSelectedIds.length > 0) {
                                setSelectedProductIds(prev => prev.filter(id => !currentLocationSelectedIds.includes(id)));
                              }
                            }}
                            disabled={selectedProductIds.filter(id => 
                              activeItems.some(item => item.id === id || item.productId === id)
                            ).length === 0}
                          >
                            選択解除
                          </NexusButton>
                          <NexusButton
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              const selectedItemsFromThisLocation = activeItems.filter(item =>
                                selectedProductIds.includes(item.id) || selectedProductIds.includes(item.productId)
                              );
                              setSelectedPickingItems(selectedItemsFromThisLocation);
                              setSelectedLocationName(locationGroup.locationName);
                              setIsPickingModalOpen(true);
                            }}
                            disabled={selectedProductIds.filter(id =>
                              activeItems.some(item => item.id === id || item.productId === id)
                            ).length === 0}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            選択商品をピッキング完了
                            ({selectedProductIds.filter(id =>
                              activeItems.some(item => item.id === id || item.productId === id)
                            ).length})
                          </NexusButton>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })
                }
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ロケーション詳細モーダル */}
      {selectedLocation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-[10001] p-4 pt-8">
          <div className="intelligence-card global max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-8 border-b border-nexus-border">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-display font-bold text-nexus-text-primary">
                    {selectedLocation.name}
                  </h3>
                  <p className="text-nexus-text-secondary font-mono">{selectedLocation.code}</p>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="action-orb"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]" ref={modalScrollRef}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-3 text-nexus-text-primary">基本情報</h4>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-nexus-text-secondary">タイプ:</dt>
                      <dd>
                        <span className={`status-badge ${getLocationTypeLabel(selectedLocation.zone).badge}`}>
                          {getLocationTypeLabel(selectedLocation.zone).label}
                        </span>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-nexus-text-secondary">容量:</dt>
                      <dd className="font-medium">{selectedLocation.capacity}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-nexus-text-secondary">使用中:</dt>
                      <dd className="font-medium">{selectedLocation.used}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-nexus-text-secondary">空き:</dt>
                      <dd className="font-medium">{selectedLocation.capacity - selectedLocation.used}</dd>
                    </div>
                  </dl>
                </div>

                {selectedLocation.type === 'controlled' && (
                  <div>
                    <h4 className="font-semibold mb-3 text-nexus-text-primary">環境情報</h4>
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-nexus-text-secondary">温度:</dt>
                        <dd className="font-medium">{selectedLocation.temperature || '-'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-nexus-text-secondary">湿度:</dt>
                        <dd className="font-medium">{selectedLocation.humidity || '-'}</dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-nexus-text-primary">
                  保管商品 ({selectedLocation.products.length}件)
                </h4>
                {selectedLocation.products.length > 0 ? (
                  <div className="holo-table">
                    <div className="holo-body">
                      {selectedLocation.products.map((product) => (
                        <div key={product.id} className="holo-row p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                              <ProductImage
                                src={product.imageUrl}
                                alt={product.name}
                                size="md"
                              />
                              <div>
                                <p className="font-medium text-nexus-text-primary">{product.name}</p>
                                <p className="text-sm text-nexus-text-secondary font-mono">
                                  ID: {product.id} | SKU: {product.sku}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-sm font-medium">{product.registeredBy}</p>
                                <p className="text-sm text-nexus-text-secondary">
                                  {new Date(product.registeredAt).toLocaleDateString('ja-JP', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit'
                                  })}
                                </p>
                              </div>
                              {onProductMove && product.category && !product.category.includes('shipping') && !product.category.includes('processing') && (
                                <NexusButton
                                  onClick={() => onProductMove(product.id, product.name)}
                                  variant="secondary"
                                  size="sm"
                                  icon={<ArrowRightIcon className="h-4 w-4" />}
                                >
                                  移動
                                </NexusButton>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-nexus-text-secondary text-center py-8">
                    このロケーションに商品はありません
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <BaseModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setLocationToDelete(null);
        }}
        title="ロケーション削除の確認"
        size="md"
      >
        <div>
          <p className="text-nexus-text-primary mb-4">
            このロケーションを削除しますか？
          </p>
          <p className="text-nexus-text-secondary text-sm mb-6">
            この操作は元に戻せません。
          </p>
          <div className="flex justify-end gap-3">
            <NexusButton
              onClick={() => {
                setIsDeleteModalOpen(false);
                setLocationToDelete(null);
              }}
              variant="default"
            >
              キャンセル
            </NexusButton>
            <NexusButton
              onClick={confirmDeleteLocation}
              variant="danger"
            >
              削除する
            </NexusButton>
          </div>
        </div>
      </BaseModal>

      {/* ピッキング完了確認モーダル */}
      <BaseModal
        isOpen={isPickingModalOpen}
        onClose={() => {
          setIsPickingModalOpen(false);
          setSelectedPickingItems([]);
          setSelectedLocationName('');
        }}
        title="ピッキング完了確認"
        size="lg"
      >
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-nexus-text-primary mb-2">
              {selectedLocationName}の選択商品
            </h3>
            <p className="text-sm text-nexus-text-secondary">
              以下の{selectedPickingItems.length}件の商品のピッキング作業完了を確認します
            </p>
          </div>

          {/* 商品リスト - 視認性重視のカード形式 */}
          <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
            {selectedPickingItems.map((item, index) => (
              <div
                key={item.id}
                className={`
                  relative p-6 rounded-xl border-2 transition-all duration-200
                  ${item.isBundleItem
                    ? 'bg-blue-50 border-blue-300 shadow-lg'
                    : 'bg-white border-green-300 shadow-md'
                  }
                  hover:shadow-xl hover:scale-[1.02]
                `}
              >
                {/* 商品番号バッジは非表示（UI統一のため削除） */}


                <div className="space-y-4">
                  {/* 商品名 - 最も重要な情報として大きく表示 */}
                  <div>
                    <h3 className={`text-xl font-bold leading-tight ${
                      item.isBundleItem ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {item.productName}
                    </h3>
                    {item.isBundleItem && (
                      <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
                        <CubeIcon className="w-4 h-4" />
                        同梱対象商品
                      </span>
                    )}
                  </div>

                  {/* 管理番号 - ラベル照合用の重要情報 */}
                  {item.sku && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span className="text-sm font-semibold text-yellow-800">商品ラベル記載番号</span>
                      </div>
                      <div className="mt-2 font-mono text-lg font-black text-yellow-900 bg-yellow-200 px-3 py-2 rounded border">
                        {item.sku.split('-').slice(0, 3).join('-')}
                      </div>
                    </div>
                  )}

                  {/* ロケーション情報 */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium">
                      ロケーション: {selectedLocationName}
                    </span>
                  </div>

                  {/* 同梱情報（該当商品のみ） */}
                  {item.isBundleItem && item.bundleTrackingNumber && (
                    <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
                      <div className="text-sm font-semibold text-blue-800 mb-1">
                        📦 同梱追跡番号: {item.bundleTrackingNumber}
                      </div>
                      {item.bundlePeers && item.bundlePeers.length > 0 && (
                        <div className="text-sm text-blue-700">
                          同梱相手: {item.bundlePeers.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 商品ラベル照合作業の説明 */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-bold text-amber-800">ラベル照合作業</h4>
            </div>
            <div className="space-y-3 text-sm text-amber-800">
              <div className="bg-white border border-amber-200 rounded p-3">
                <div className="font-semibold mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>確認手順:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1">
                  <li className="font-medium">梱包された実物商品を準備</li>
                  <li className="font-medium">商品ラベルの「管理番号」を確認</li>
                  <li className="font-medium">上記カードの「商品ラベル記載番号」と照合</li>
                  <li className="font-medium">商品名が一致することを確認</li>
                </ol>
              </div>
              <div className="flex items-center gap-2 text-amber-700 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                全商品の目視照合完了後、「ピッキング完了を確認」ボタンを押してください
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-nexus-text-secondary">
              ※ 出荷管理画面で詳細な作業指示を確認できます
            </p>
            <div className="flex gap-3">
              <NexusButton
                onClick={() => {
                  setIsPickingModalOpen(false);
                  setSelectedPickingItems([]);
                  setSelectedLocationName('');
                }}
                variant="default"
              >
                キャンセル
              </NexusButton>
              <NexusButton
                onClick={async () => {
                  try {
                    // ピッキング完了を処理
                    const productIds = selectedPickingItems
                      .map(item => item.productId || item.id)
                      .filter(id => id && id !== 'undefined');
                    
                    if (productIds.length === 0) {
                      showToast({
                        type: 'error',
                        title: 'エラー',
                        message: '有効な商品IDが見つかりません',
                        duration: 4000
                      });
                      return;
                    }

                    console.log('🚀 ピッキング完了処理開始:', {
                      productIds,
                      selectedItems: selectedPickingItems.length,
                      locationName: selectedLocationName,
                      validProductCount: productIds.length
                    });
                    
                    const requestBody = {
                      productIds,
                      action: 'complete_picking',
                      // 先頭に英数記号を含む棚コードのみ抽出（例: "A-01"）
                      locationCode: (selectedLocationName.match(/[A-Z]-\d{2}/)?.[0]) || selectedLocationName.split(' ')[0] || 'UNKNOWN',
                      locationName: selectedLocationName
                    };
                    
                    console.log('📤 POST リクエスト送信:', requestBody);
                    
                    const response = await fetch('/api/picking', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(requestBody)
                    });

                    if (response.ok) {
                      const result = await response.json();
                      
                      // 選択された商品のIDをクリア
                      const processedIds = selectedPickingItems.map(item => item.id);
                      setSelectedProductIds(prev => prev.filter(id => !processedIds.includes(id)));

                      showToast({
                        type: 'success',
                        title: 'ピッキング完了',
                        message: `${selectedLocationName}の商品${selectedPickingItems.length}件のピッキングが完了しました`,
                        duration: 4000
                      });

                      // データを再取得してリストを更新
                      fetchShippingData();

                      // 出荷管理画面へ遷移（作成した商品を強調表示）
                      const includeId = productIds[0];
                      router.push(`/staff/shipping?status=workstation&includeProductId=${encodeURIComponent(includeId)}`);
                    } else {
                      throw new Error('ピッキング完了処理に失敗しました');
                    }
                  } catch (error) {
                    console.error('Error completing picking:', error);
                    showToast({
                      type: 'error',
                      title: 'エラー',
                      message: 'ピッキング完了処理中にエラーが発生しました',
                      duration: 4000
                    });
                  }
                  
                  setIsPickingModalOpen(false);
                  setSelectedPickingItems([]);
                  setSelectedLocationName('');
                }}
                variant="primary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
ピッキング完了を確認
              </NexusButton>
            </div>
          </div>
        </div>
      </BaseModal>

      {/* 編集モーダル */}
      <BaseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingLocation(null);
        }}
        title="ロケーション編集"
        size="md"
      >
        <div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-nexus-text-primary mb-2">
                ロケーションコード
              </label>
              <input
                type="text"
                value={editForm.code}
                onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:outline-none focus:border-nexus-yellow focus:ring-2 focus:ring-nexus-yellow/20 text-nexus-text-primary font-mono"
                placeholder="例: STD-A-01"
              />
              <p className="text-xs text-nexus-text-secondary mt-1">
                英数字とハイフンのみ使用可能
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-text-primary mb-2">
                ロケーション名
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:outline-none focus:border-nexus-yellow focus:ring-2 focus:ring-nexus-yellow/20 text-nexus-text-primary"
                placeholder="ロケーション名を入力"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-text-primary mb-2">
                容量
              </label>
              <input
                type="number"
                value={editForm.capacity}
                onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })}
                className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:outline-none focus:border-nexus-yellow focus:ring-2 focus:ring-nexus-yellow/20 text-nexus-text-primary"
                placeholder="容量を入力"
                min="0"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={editForm.isActive}
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                className="w-4 h-4 text-nexus-yellow bg-nexus-bg-primary border-nexus-border rounded focus:ring-nexus-yellow focus:ring-2"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-nexus-text-primary">
                アクティブ状態
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <NexusButton
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingLocation(null);
              }}
              variant="default"
            >
              キャンセル
            </NexusButton>
            <NexusButton
              onClick={confirmEditLocation}
              variant="primary"
            >
              更新する
            </NexusButton>
          </div>
        </div>
      </BaseModal>

      {/* 追加モーダル */}
      <BaseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="新しいロケーションを追加"
        size="lg"
      >
        <LocationCreateForm
          onCreateComplete={() => {
            setIsAddModalOpen(false);
            fetchLocations(); // データを再取得
          }}
        />
      </BaseModal>
    </div>
  );
} 