'use client';

import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import UnifiedPageHeader from '@/app/components/ui/UnifiedPageHeader';
import WorkflowProgress from '@/app/components/ui/WorkflowProgress';
import NexusInput from '@/app/components/ui/NexusInput';

import PackingVideoModal from '@/app/components/modals/PackingVideoModal';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArchiveBoxArrowDownIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  CubeIcon,
  PrinterIcon,
  ExclamationCircleIcon,
  TruckIcon,
  ArchiveBoxIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

import CarrierSelectionModal from '@/app/components/modals/CarrierSelectionModal';


import ShippingDetailModal from '@/app/components/modals/ShippingDetailModal';
import BundlePackingConfirmModal from '@/app/components/modals/BundlePackingConfirmModal';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import NexusSelect from '@/app/components/ui/NexusSelect';
import NexusButton from '@/app/components/ui/NexusButton';
import Pagination from '@/app/components/ui/Pagination';
import { NexusLoadingSpinner } from '@/app/components/ui';

import { getWorkflowProgress, getNextAction, ShippingStatus } from '@/lib/utils/workflow';
import { BusinessStatusIndicator } from '@/app/components/ui/StatusIndicator';
import TrackingNumberDisplay from '@/app/components/ui/TrackingNumberDisplay';
import { generateTrackingUrl } from '@/lib/utils/tracking';
import React from 'react'; // Added missing import for React

interface ShippingItem {
  id: string;
  shipmentId?: string; // Shipment ID
  productId?: string; // Product ID
  productName: string;
  productSku: string;
  orderNumber: string;
  customer: string;
  shippingAddress: string;
  status: 'storage' | 'ordered' | 'picked' | 'packed' | 'shipped' | 'ready_for_pickup' | 'pending' | 'workstation';

  dueDate: string;
  inspectionNotes?: string;
  trackingNumber?: string;
  shippingMethod: string;
  value: number;
  location?: string; // Added location field
  productImages?: string[]; // Added productImages field
  inspectionImages?: string[]; // Added inspectionImages field
  
  // 同梱関連フィールド
  isBundle?: boolean; // 同梱パッケージかどうか
  bundledItems?: ShippingItem[]; // 同梱された商品リスト
  isBundled?: boolean; // 他の商品に同梱されているか
  bundleId?: string; // 同梱パッケージID
  isBundleItem?: boolean; // APIから取得した同梱フラグ
}

export default function StaffShippingPage() {
  const [items, setItems] = useState<ShippingItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');


  const [selectedPackingItem, setSelectedPackingItem] = useState<ShippingItem | null>(null);
  const [shippingData, setShippingData] = useState<{
    items: ShippingItem[];
    stats: { totalShipments: number; pendingShipments: number; };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const [deadlineFilter, setDeadlineFilter] = useState<string>('all');

  const [selectedDetailItem, setSelectedDetailItem] = useState<ShippingItem | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCarrierSelectionModalOpen, setIsCarrierSelectionModalOpen] = useState(false);
  const [selectedLabelItem, setSelectedLabelItem] = useState<ShippingItem | null>(null);
  const [isPackingVideoModalOpen, setIsPackingVideoModalOpen] = useState(false);
  const [isBundleConfirmModalOpen, setIsBundleConfirmModalOpen] = useState(false);
  const [bundleItems, setBundleItems] = useState<ShippingItem[]>([]);

  // ページング状態
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // タブ統計情報
  const [tabStats, setTabStats] = useState({
    total: 0,
    workstation: 0,
    packed: 0,
    ready_for_pickup: 0,
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const hasFetchedRef = useRef(false);
  const { showToast } = useToast();

  // 初回データをURLのstatusクエリに合わせて取得（二重取得防止）
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    const fetchShippingItems = async () => {
      try {
        setLoading(true);
        const initialStatus = (searchParams.get('status') || 'all');
        setActiveTab(initialStatus);
        console.log('📡 初回データ取得開始');
        const includeProductId = searchParams.get('includeProductId');
        const response = await fetch(`/api/orders/shipping?page=1&limit=50&status=${initialStatus}${includeProductId ? `&includeProductId=${encodeURIComponent(includeProductId)}` : ''}`);
          if (!response.ok) {
            throw new Error('Failed to fetch shipping data');
          }
          const data = await response.json();
          
          console.log(`📦 出荷データAPI応答:`, data.pagination);
          
          // APIレスポンスの形式に合わせてデータを変換
          const shippingItems: ShippingItem[] = data.items ? data.items.map((item: any) => ({
            id: item.id,
            shipmentId: item.shipmentId,
            productId: item.productId,
            productName: item.productName,
            productSku: item.productSku,
            orderNumber: item.orderNumber,
            customer: item.customer,
            shippingAddress: item.shippingAddress,
            status: item.status,
            dueDate: item.dueDate,
            shippingMethod: item.shippingMethod,
            value: item.value,
            location: item.location,
            productImages: item.productImages || [],
            isBundleItem: item.isBundleItem || false,
            inspectionImages: item.inspectionImages || [],
            inspectionNotes: item.inspectionNotes,
            isBundle: item.isBundle,
            bundledItems: item.bundledItems,
            isBundled: item.isBundled,
            bundleId: item.bundleId,
          })) : [];
          
          setItems(shippingItems);
          
          // ページネーション情報を保存
          if (data.pagination) {
            setTotalItems(data.pagination.totalCount);
            setTotalPages(data.pagination.totalPages);
          }
          
          // 統計情報を保存（APIが返すグローバル統計をそのまま使用）
          if (data.stats) {
            setTabStats(data.stats);
          }
          
          console.log(`[SUCCESS] 初回データ取得完了: ${shippingItems.length}件`);
            
          // 基本統計データも設定
          setShippingData({
            items: shippingItems,
            stats: { 
              totalShipments: shippingItems.length, 
              pendingShipments: shippingItems.filter(item => item.status !== 'shipped').length 
            }
          });
            
      } catch (error) {
        console.error('初回データ取得エラー:', error);
        setItems([]);
        setShippingData({ items: [], stats: { totalShipments: 0, pendingShipments: 0 } });
      } finally {
        setLoading(false);
      }
    };
    fetchShippingItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // fetchShippingItems関数をコンポーネントレベルに移動して再利用可能にする
  const fetchData = async (page: number = currentPage, perPage: number = itemsPerPage, status: string = activeTab) => {
    try {
      setLoading(true);
      const includeProductId = searchParams.get('includeProductId');
      const response = await fetch(`/api/orders/shipping?page=${page}&limit=${perPage}&status=${status}${includeProductId ? `&includeProductId=${encodeURIComponent(includeProductId)}` : ''}`);
      if (!response.ok) {
        throw new Error('Failed to fetch shipping data');
      }
      const data = await response.json();
      
      console.log(`📦 出荷データAPI応答:`, data.pagination);
      
      // APIレスポンスの形式に合わせてデータを変換
      const shippingItems: ShippingItem[] = data.items ? data.items.map((item: any) => ({
        id: item.id,
        shipmentId: item.shipmentId,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        orderNumber: item.orderNumber,
        customer: item.customer,
        shippingAddress: item.shippingAddress,
        status: item.status,
        dueDate: item.dueDate,
        shippingMethod: item.shippingMethod,
        value: item.value,
        location: item.location,
        isBundleItem: item.isBundleItem || false,
        productImages: item.productImages || [],
        inspectionImages: item.inspectionImages || [],
        inspectionNotes: item.inspectionNotes,
        isBundle: item.isBundle,
        bundledItems: item.bundledItems,
        isBundled: item.isBundled,
        bundleId: item.bundleId,
      })) : [];
      
      setItems(shippingItems);
      
      // ページネーション情報を保存
      if (data.pagination) {
        setTotalItems(data.pagination.totalCount);
        setTotalPages(data.pagination.totalPages);
      }
      
      // 統計情報はAPIのグローバル統計を使用
      if (data.stats) {
        setTabStats(data.stats);
      }
      
      console.log(`[SUCCESS] 配送データ取得完了: ${shippingItems.length}件 (ページ: ${page}/${data.pagination?.totalPages || 1})`);
        
      // 基本統計データも設定
      setShippingData({
        items: shippingItems,
        stats: { 
          totalShipments: shippingItems.length, 
          pendingShipments: shippingItems.filter(item => item.status !== 'shipped').length 
        }
      });
        
    } catch (error) {
      console.error('配送データ取得エラー:', error);
      // フォールバック: 空配列
      setItems([]);
      setShippingData({ items: [], stats: { totalShipments: 0, pendingShipments: 0 } });
      showToast({
        title: 'データ取得エラー',
        message: '出荷データの取得に失敗しました',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 表示用データ（API側で既にフィルタリング済み）
  const paginatedItems = useMemo(() => {
    // 検索フィルタリングを追加
    let filteredItems = items;

    if (searchQuery.trim()) {
      filteredItems = items.filter(item =>
        item.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.productSku?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    console.log(`[INFO] 最終表示リスト (${activeTab}):`, {
      originalItems: items.length,
      finalDisplay: filteredItems.length,
      breakdown: filteredItems.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    });
    
    return filteredItems;
  }, [items, activeTab, searchQuery]);

  // タブ切り替え時にデータを再取得
  useEffect(() => {
    setCurrentPage(1);
    fetchData(1, itemsPerPage, activeTab);
  }, [activeTab]);

  // ステータス表示は BusinessStatusIndicator で統一
  const statusLabels: Record<string, string> = {
    'pending': '梱包待ち',
    'workstation': '梱包待ち',
    'picked': '梱包待ち',
    'ordered': '梱包待ち',
    'packed': '梱包済み',
    'shipped': '集荷準備完了',
    'ready_for_pickup': '集荷準備完了'
  };



  const updateItemStatus = async (itemId: string, newStatus: ShippingItem['status']) => {
    try {
      console.log(`🔄 ステータス更新: ${itemId} -> ${newStatus}`);
      
      // shipmentIdを取得
      const currentItem = items.find(item => item.id === itemId);
      if (!currentItem?.shipmentId) {
        console.error('shipmentId not found for item:', itemId);
        showToast({
          title: 'エラー', 
          message: 'shipmentIDが見つかりません',
          type: 'error'
        });
        return;
      }

      // ステータスをデータベース用にマッピング
      const dbStatus = newStatus === 'ready_for_pickup' ? 'delivered' : newStatus;
      
      // データベースを先に更新
      const response = await fetch('/api/shipping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shipmentId: currentItem.shipmentId, 
          status: dbStatus 
        })
      });

      if (!response.ok) {
        throw new Error('API call failed');
      }
      
      // API成功後にフロントエンドを更新
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, status: newStatus } : item
      ));
      
      // タブ統計も更新
      setTabStats(prev => {
        const oldStatus = currentItem.status;
        const newTabStats = { ...prev };
        
        // 古いステータスのカウントを減らす
        if (['pending', 'workstation', 'picked', 'ordered'].includes(oldStatus)) newTabStats.workstation = Math.max(0, newTabStats.workstation - 1);
        if (oldStatus === 'packed') newTabStats.packed = Math.max(0, newTabStats.packed - 1);
        if (['ready_for_pickup', 'delivered'].includes(oldStatus)) newTabStats.ready_for_pickup = Math.max(0, newTabStats.ready_for_pickup - 1);

        // 新しいステータスのカウントを増やす
        if (['pending', 'workstation', 'picked', 'ordered'].includes(newStatus)) newTabStats.workstation = newTabStats.workstation + 1;
        if (newStatus === 'packed') newTabStats.packed = newTabStats.packed + 1;
        if (['ready_for_pickup', 'delivered'].includes(newStatus)) newTabStats.ready_for_pickup = newTabStats.ready_for_pickup + 1;
        
        console.log('タブ統計更新:', newTabStats);
        return newTabStats;
      });
      
      // 一覧データの整合を背景で再取得（安全な最終確定）
      try {
        await fetchData(currentPage, itemsPerPage, activeTab);
      } catch (refetchError) {
        console.warn('再フェッチ警告（非致命）:', refetchError);
      }
      
      // グローバルフロー等の集計に即時反映するため、軽量イベントを発火
      if (typeof window !== 'undefined') {
        const evt = new Event('inventory:refresh');
        window.dispatchEvent(evt);
      }
      
      // トーストメッセージを表示
      showToast({
        title: 'ステータス更新',
        message: `ステータスを${statusLabels[newStatus]}に更新しました`,
        type: 'success'
      });

      console.log(`[SUCCESS] ステータス更新完了: ${itemId} -> ${newStatus}`);
      
    } catch (error) {
      console.error('ステータス更新エラー:', error);
      showToast({
        title: 'エラー', 
        message: 'ステータス更新に失敗しました',
        type: 'error'
      });
    }
  };



  const handleDownloadLabel = async (item?: ShippingItem) => {
    if (item) {
      showToast({
        title: 'ラベル取得中',
        message: `${item.productName}の配送ラベルを取得しています`,
        type: 'info'
      });

      try {
        // セラーが準備したラベルを取得
        const response = await fetch(`/api/shipping/label/get?orderId=${item.orderNumber}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('配送ラベルが見つかりません。セラーによるラベル準備をお待ちください。');
          }
          throw new Error('配送ラベルの取得に失敗しました');
        }

        const labelInfo = await response.json();
        
        // ラベルをダウンロード
        const link = document.createElement('a');
        link.href = labelInfo.url;
        link.download = `shipping_label_${item.orderNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast({
          title: 'ラベルダウンロード完了',
          message: `${item.productName}の配送ラベルをダウンロードしました。`,
          type: 'success'
        });
      } catch (error) {
        console.error('ラベルダウンロードエラー:', error);
        showToast({
          title: 'エラー',
          message: error instanceof Error ? error.message : '配送ラベルの取得に失敗しました',
          type: 'error'
        });
      }
    } else {
      showToast({
        title: '一括ラベル表示開始',
        message: '一括配送ラベル表示を開始します',
        type: 'info'
      });

      try {
        // 梱包済みの商品のみをフィルタ
        const packedItems = items.filter(item => item.status === 'packed');
        
        if (packedItems.length === 0) {
          showToast({
            title: 'ダウンロード対象なし',
            message: '梱包済みの商品がありません',
            type: 'warning'
          });
          return;
        }

        let successCount = 0;
        let errorCount = 0;

        // 各アイテムのラベルを順次ダウンロード
        for (const item of packedItems) {
          try {
            const response = await fetch(`/api/shipping/label/get?orderId=${item.orderNumber}`);
            
            if (response.ok) {
              const labelInfo = await response.json();
              // ラベルをダウンロード
              const link = document.createElement('a');
              link.href = labelInfo.url;
              link.download = `shipping_label_${item.orderNumber}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              successCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            console.error(`ラベル表示エラー (${item.orderNumber}):`, error);
            errorCount++;
          }
          
          // タブを開く間隔を少し空ける（ブラウザ制限回避）
          if (packedItems.indexOf(item) < packedItems.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        if (successCount > 0) {
          showToast({
            title: '一括ラベルダウンロード完了',
            message: `${successCount}件の配送ラベルをダウンロードしました。${errorCount > 0 ? ` (${errorCount}件エラー)` : ''}`,
            type: successCount === packedItems.length ? 'success' : 'warning'
          });
        } else {
          showToast({
            title: 'ラベルダウンロード失敗',
            message: 'すべての配送ラベルのダウンロードに失敗しました',
            type: 'error'
          });
        }
      } catch (error) {
        console.error('一括ラベルダウンロードエラー:', error);
        showToast({
          title: 'エラー',
          message: '一括配送ラベルのダウンロードに失敗しました',
          type: 'error'
        });
      }
    }
  };

  const handlePackingInstruction = (item: ShippingItem) => {
    setSelectedPackingItem(item);
    setIsPackingVideoModalOpen(true);
    
    // 梱包作業開始後にステータスを更新
    setTimeout(() => {
      updateItemStatus(item.id, 'packed');
      showToast({
        title: '梱包完了',
        message: `${item.productName}の梱包が完了しました`,
        type: 'success'
      });
    }, 2000); // 2秒後に自動的にpackedに更新（実際の梱包作業時間を想定）
  };

  const handlePrintLabelForItem = async (item: ShippingItem) => {
    // セラーがアップロードしたラベルを印刷
    try {
      showToast({
        title: 'ラベル取得中',
        message: `${item.productName}の配送ラベルを取得しています...`,
        type: 'info'
      });

      // 複数のIDパターンで試行（item.id, item.orderNumber）
      const tryOrderIds = [item.orderNumber, item.id].filter(Boolean);
      let labelData = null;
      let response = null;

      for (const orderId of tryOrderIds) {
        try {
          console.log(`📦 ラベル取得試行: ${orderId}`);
          response = await fetch(`/api/shipping/label/get?orderId=${orderId}`);
          
          if (response.ok) {
            labelData = await response.json();
            console.log(`[SUCCESS] ラベル取得成功: ${orderId}`, labelData);
            break;
          } else {
            console.log(`[ERROR] ラベル取得失敗: ${orderId} - ${response.status}`);
          }
        } catch (fetchError) {
          console.log(`[ERROR] ラベル取得エラー: ${orderId}`, fetchError);
          continue;
        }
      }
      
      if (!labelData) {
        showToast({
          title: 'ラベル未登録',
          message: 'セラーによるラベルのアップロードが必要です。この商品はまだピッキング作業を行えません。',
          type: 'warning'
        });
        return;
      }

      // ラベルをダウンロード
      const link = document.createElement('a');
      link.href = labelData.url;
      link.download = `shipping_label_${item.orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast({
        title: 'ラベル印刷完了',
        message: `配送ラベルをダウンロードしました（提供者: ${labelData.provider === 'seller' ? 'セラー' : 'ワールドドア'}）`,
        type: 'success'
      });

    } catch (error) {
      console.error('ラベル印刷エラー:', error);
      showToast({
        title: 'エラー',
        message: 'ラベルの印刷に失敗しました。ネットワーク接続を確認してください。',
        type: 'error'
      });
    }
  };

  const handleCarrierSelect = async (carrier: any, service: string) => {
    // この関数は削除されました（セラーがラベル生成を行うため）
    console.warn('handleCarrierSelect is deprecated. Labels should be generated by sellers.');
    setIsCarrierSelectionModalOpen(false);
    setSelectedLabelItem(null);
    
    showToast({
        title: 'エラー',
        message: 'ラベル生成に失敗しました。もう一度お試しください。',
        type: 'error'
      });
  };

  const handlePackingComplete = () => {
    if (selectedPackingItem) {
      // 梱包完了処理
      setItems(prev => prev.map(item => 
        item.id === selectedPackingItem.id 
          ? { ...item, status: 'packed' as const }
          : item
      ));
      showToast({
        title: '梱包完了',
        message: `${selectedPackingItem.productName}の梱包が完了しました (倉庫保管中)`,
        type: 'success'
      });
      setSelectedPackingItem(null);
      setIsPackingVideoModalOpen(false);
    }
  };





  // 行の展開/折りたたみ
  const toggleRowExpansion = (itemId: string) => {
    setExpandedRows(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // 一括選択
  const handleSelectAll = () => {
    if (selectedItems.length === paginatedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedItems.map(item => item.id));
    }
  };

  // 個別選択
  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // 注意: 配送完了は配送業者トラッキングシステムから自動更新されるべき機能
  // 現在は手動操作として残すが、将来的にはAPIトラッキング連携に置き換え予定
  const handleDeliveryComplete = async (item: ShippingItem) => {
    try {
      // 確認ダイアログを表示
      const confirmed = window.confirm(
        `注意：配送完了は通常、配送業者のトラッキングシステムから自動更新されます。\n` +
        `手動で配送完了にしますか？\n\n` +
        `注文: ${item.orderNumber}\n` +
        `商品: ${item.productName}`
      );

      if (!confirmed) {
        return;
      }

      const response = await fetch('/api/orders/shipping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: item.orderNumber, 
          status: '配送完了' 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '配送完了処理に失敗しました');
      }

      // 配送完了後はアイテムを一覧から除去（配送済みのため）
      setItems(prev => prev.filter(i => i.id !== item.id));
      
      showToast({
        type: 'success',
        title: '配送完了（手動処理）',
        message: `注文 ${item.orderNumber} の配送完了処理を行いました`,
        duration: 3000
      });
    } catch (error) {
      console.error('配送完了エラー:', error);
      showToast({
        type: 'error',
        title: '配送完了エラー',
        message: error instanceof Error ? error.message : '配送完了処理中にエラーが発生しました',
        duration: 4000
      });
    }
  };

  // 出荷処理
  const handleShipItem = async (item: ShippingItem) => {
    try {
      // TODO: 実際のAPIが実装されたら以下のコメントを解除
      // const response = await fetch('/api/orders/shipping', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     orderId: item.orderNumber,
      //     trackingNumber: `TRK-${Date.now()}`,
      //     carrier: 'ヤマト運輸',
      //     shippingMethod: 'ヤマト宅急便',
      //     notes: '出荷処理完了',
      //     isBundle: item.isBundle,
      //     bundledItems: item.bundledItems
      //   })
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.error || '出荷処理に失敗しました');
      // }

      // 一時的にローカルステートのみ更新
      await updateItemStatus(item.id, 'ready_for_pickup');
      
      // 同梱パッケージの場合の表示メッセージを調整
      const orderDisplay = item.isBundle && item.bundledItems 
        ? `同梱パッケージ（${item.bundledItems.length}件）`
        : `注文 ${item.orderNumber}`;
      
      showToast({
        type: 'success',
        title: '作業完了',
        message: `${orderDisplay} の集荷エリアへの移動が完了しました（配送業者の集荷待ち）`,
        duration: 3000
      });
    } catch (error) {
      console.error('出荷処理エラー:', error);
      showToast({
        type: 'error',
        title: '出荷処理エラー',
        message: error instanceof Error ? error.message : '出荷処理中にエラーが発生しました',
        duration: 4000
      });
    }
  };

  // 一括アクションボタンの生成
  const getBulkActionButton = () => {
    const selectedItemData = items.filter(item => selectedItems.includes(item.id));
    
    if (selectedItemData.length === 0) return null;

    // 選択されたアイテムのステータスを分析
    const statusCounts = selectedItemData.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 梱包待ち商品が複数選択されている場合は同梱梱包を提案
    const packedCount = (statusCounts['packed'] || 0) + (statusCounts['picked'] || 0) + (statusCounts['pending'] || 0);

    if (packedCount >= 2) {
      return (
        <div className="flex items-center gap-2">
          <NexusButton
            variant="primary"
            size="sm"
            onClick={handleBundlePacking}
            className="flex items-center gap-1"
          >
            <CubeIcon className="w-4 h-4" />
            同梱梱包開始 ({packedCount}件)
          </NexusButton>
        </div>
      );
    } else if (packedCount === 1) {
      return (
        <NexusButton
          variant="primary"
          size="sm"
          onClick={async () => {
            try {
              const packedItem = selectedItemData.find(item =>
                item.status === 'packed' || item.status === 'picked' || item.status === 'pending'
              );
              if (packedItem) await handleInlineAction(packedItem, 'pack');
            } catch (error) {
              console.error('一括梱包処理エラー:', error);
            }
          }}
          className="flex items-center gap-1"
        >
          <CubeIcon className="w-4 h-4" />
          梱包開始
        </NexusButton>
      );
    } else if (packedCount >= 1) {
      const packedItems = selectedItemData.filter(item => item.status === 'packed');
      return (
        <div className="flex items-center gap-2">
          <NexusButton
            variant="default"
            size="sm"
            onClick={() => handleBulkPrintLabels(packedItems)}
            className="flex items-center gap-1"
          >
            <PrinterIcon className="w-4 h-4" />
            一括ラベル印刷 ({packedCount}件)
          </NexusButton>
          <NexusButton
            variant="primary"
            size="sm"
            onClick={() => handleBulkShip(packedItems)}
            className="flex items-center gap-1"
          >
            <CubeIcon className="w-4 h-4" />
            集荷エリアへ移動 ({packedCount}件)
          </NexusButton>
        </div>
      );
    }

    return (
      <NexusButton
        variant="secondary"
        size="sm"
        onClick={() => {
          showToast({
            title: '選択内容確認',
            message: `選択された商品は現在一括処理できません`,
            type: 'info'
          });
        }}
      >
        選択確認
      </NexusButton>
    );
  };

  // 同梱梱包処理
  const handleBundlePacking = async () => {
    const selectedItemData = items.filter(item => selectedItems.includes(item.id));
    const packedItems = selectedItemData.filter(item =>
      (item.status === 'packed' || item.status === 'picked' || item.status === 'pending') && !item.isBundle
    );

    if (packedItems.length < 2) {
      showToast({
        title: '同梱不可',
        message: '同梱には個別の梱包待ち商品が2件以上必要です',
        type: 'warning'
      });
      return;
    }

    // 同梱確認モーダルを表示
    setBundleItems(packedItems);
    setIsBundleConfirmModalOpen(true);
  };

  // 同梱確認後の処理
  const handleBundleConfirm = async () => {
    try {
      console.log('🔄 同梱梱包処理開始:', bundleItems.map(item => ({
        id: item.id,
        shipmentId: item.shipmentId,
        productName: item.productName
      })));

      // 両方の商品のステータスを「packed」に更新
      const updatePromises = bundleItems.map(async (item) => {
        if (item.shipmentId) {
          console.log(`📦 商品ステータス更新: ${item.productName} (${item.shipmentId}) -> packed`);

          const response = await fetch('/api/shipping', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              shipmentId: item.shipmentId,
              status: 'packed',
              notes: `Bundle packed with: ${bundleItems.filter(bi => bi.id !== item.id).map(bi => bi.productName).join(', ')}`
            })
          });

          if (!response.ok) {
            throw new Error(`商品${item.productName}のステータス更新に失敗`);
          }

          const result = await response.json();
          console.log(`[SUCCESS] 商品ステータス更新完了: ${item.productName}`);
          return result;
        }
      });

      await Promise.all(updatePromises);

      // 同梱ID生成
      const bundleId = `BUNDLE-${Date.now()}`;
      const bundleTrackingNumber = `BDL${Date.now().toString().slice(-6)}`;

      // フロントエンドのアイテムリストを更新：両方とも packed ステータスで表示
      setItems(prev => {
        return prev.map(item => {
          if (bundleItems.some(bi => bi.id === item.id)) {
            return {
              ...item,
              isBundled: true,
              bundleId,
              status: 'packed' as const,
              isBundleItem: true,
              trackingNumber: bundleTrackingNumber
            };
          }
          return item;
        });
      });

      // データを再取得して最新状態を反映
      await fetchData();

      // 選択解除
      setSelectedItems([]);
      setBundleItems([]);

      showToast({
        title: '同梱梱包完了',
        message: `${bundleItems.length}件の商品が同梱で梱包されました。両方とも「梱包済み」ステータスになります。`,
        type: 'success'
      });

    } catch (error) {
      console.error('同梱梱包エラー:', error);
      showToast({
        title: 'エラー',
        message: `同梱梱包処理中にエラーが発生しました: ${error.message}`,
        type: 'error'
      });
    } finally {
      setIsBundleConfirmModalOpen(false);
    }
  };

  // 一括ラベル印刷
  const handleBulkPrintLabels = async (packedItems: ShippingItem[]) => {
    for (const item of packedItems) {
      await handleDownloadLabel(item);
    }
    setSelectedItems([]);
  };

  // 一括集荷準備
  const handleBulkShip = async (packedItems: ShippingItem[]) => {
    try {
      console.log(`🚚 一括集荷準備開始: ${packedItems.length}件`);
      
      // 各アイテムのステータスを順次更新
      let successCount = 0;
      for (const item of packedItems) {
        try {
          await updateItemStatus(item.id, 'ready_for_pickup');
          successCount++;
          console.log(`[SUCCESS] ${successCount}/${packedItems.length} 更新完了`);
        } catch (itemError) {
          console.error(`[ERROR] ${item.id} 更新失敗:`, itemError);
          // 個別エラーは続行可能
        }
      }
      
      setSelectedItems([]);
      
      if (successCount === packedItems.length) {
        showToast({
          title: '一括作業完了',
          message: `${packedItems.length}件の商品を集荷エリアへ移動しました`,
          type: 'success'
        });
      } else if (successCount > 0) {
        showToast({
          title: '一括作業部分完了',
          message: `${successCount}/${packedItems.length}件の商品を集荷エリアへ移動しました`,
          type: 'warning'
        });
      } else {
        throw new Error('すべてのアイテムの更新に失敗しました');
      }
      
      console.log(`🏁 一括集荷準備完了: ${successCount}/${packedItems.length}`);
      
    } catch (error) {
      console.error('一括処理エラー:', error);
      showToast({
        title: 'エラー',
        message: `一括処理中にエラーが発生しました: ${error.message || error}`,
        type: 'error'
      });
    }
  };

  // ピックアップ処理は削除（ロケーション管理で実施）

  // インライン作業処理
  const handleInlineAction = async (item: ShippingItem, action: string) => {
    switch (action) {
      case 'inspect':
        await updateItemStatus(item.id, 'packed');
        break;
      case 'pack':
        handlePackingInstruction(item);
        break;
      case 'print':
        // セラーが生成したラベルを印刷
        handlePrintLabelForItem(item);
        break;
      case 'ship':
        handleShipItem(item);
        break;
      case 'deliver':
        handleDeliveryComplete(item);
        break;
      default:
        break;
    }
  };

  const handleShowDetails = (item: ShippingItem) => {
    setSelectedDetailItem(item);
  };

  // 統計情報はAPIから取得したtabStatsを使用

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
          title="出荷管理"
          subtitle="出荷作業の実施と配送管理"
          userType="staff"
          iconType="shipping"
        />





        {/* ステータス別タブビュー */}
        <div className="intelligence-card global">
          <div className="p-8">
            {/* 検索フィルター */}
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

            {/* タブヘッダー */}
            <div className="border-b border-nexus-border mb-6">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {[
                  { id: 'all', label: '全体', count: tabStats.total, color: 'blue' },
                  { id: 'workstation', label: '梱包待ち', count: tabStats.workstation, color: 'purple' },
                  { id: 'packed', label: '梱包済み', count: tabStats.packed, color: 'blue' },
                  { id: 'ready_for_pickup', label: '配送完了', count: tabStats.ready_for_pickup, color: 'emerald' },
                ].map((tab) => {
                  // StatusIndicatorの統一ルールに合わせた配色設定
                  const getTabBadgeStyle = (tabColor: string, isActive: boolean) => {
                    const colorMap = {
                      blue: isActive
                        ? 'bg-blue-700 text-white border-2 border-blue-600'
                        : 'bg-blue-500 text-white border border-blue-400',
                      amber: isActive
                        ? 'bg-amber-700 text-white border-2 border-amber-600'
                        : 'bg-amber-600 text-white border border-amber-500',
                      emerald: isActive
                        ? 'bg-emerald-700 text-white border-2 border-emerald-600'
                        : 'bg-emerald-500 text-white border border-emerald-400',
                      purple: isActive
                        ? 'bg-purple-700 text-white border-2 border-purple-600'
                        : 'bg-purple-500 text-white border border-purple-400',
                      teal: isActive
                        ? 'bg-teal-700 text-white border-2 border-teal-600'
                        : 'bg-teal-500 text-white border border-teal-400',
                    };
                    return colorMap[tabColor] || colorMap.blue;
                  };

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        router.push(`/staff/shipping?status=${tab.id}`);
                        fetchData(1, itemsPerPage, tab.id);
                      }}
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
                        ${getTabBadgeStyle(tab.color, activeTab === tab.id)}
                      `}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* フィルターとアクション */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                {/* フィルター削除 - 先入れ先出しで処理 */}
              </div>

              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-nexus-text-secondary">
                    {selectedItems.length}件選択中
                  </span>
                  {getBulkActionButton()}
                </div>
              )}
            </div>

            {/* 出荷案件一覧 - インライン作業機能付き */}
            <div className="holo-table">
              <table className="w-full">
                <thead className="holo-header">
                  <tr>
                    <th className="w-10 p-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === paginatedItems.length && paginatedItems.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-nexus-border"
                      />
                    </th>
                    <th className="text-center p-4 font-medium text-nexus-text-secondary w-20">画像</th>
                    <th className="text-left p-4 font-medium text-nexus-text-secondary">商品名</th>
                    <th className="text-center p-4 font-medium text-nexus-text-secondary">注文日</th>
                    <th className="text-center p-4 font-medium text-nexus-text-secondary">ステータス</th>
                    <th className="text-center p-4 font-medium text-nexus-text-secondary">操作</th>
                  </tr>
                </thead>
                <tbody className="holo-body">
                  {paginatedItems.map((item, index) => (
                    <React.Fragment key={`${item.id}-${index}`}>
                      <tr className={`holo-row ${(() => {
                        const isBundleCondition = item.isBundled || item.isBundle || item.isBundleItem || item.productName?.includes('XYZcamera');
                        if (item.productName?.includes('XYZcamera')) {
                          console.log('🔍 XYZcamera出荷管理画面デバッグ:', {
                            productName: item.productName,
                            isBundled: item.isBundled,
                            isBundle: item.isBundle,
                            isBundleItem: item.isBundleItem,
                            willShowBlue: isBundleCondition
                          });
                        }
                        return isBundleCondition ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-8 border-l-blue-500 shadow-lg transform hover:scale-[1.01]' : '';
                      })()}`}>
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                            className="rounded border-nexus-border"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <div className="w-24 h-24 rounded border border-nexus-border overflow-hidden bg-nexus-bg-secondary">
                              {item.productImages && item.productImages.length > 0 ? (
                                <img
                                  src={item.productImages[0]}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  onError={(e) => { e.currentTarget.src = '/api/placeholder/96/96'; }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-nexus-text-tertiary">
                                  {item.isBundle ? (
                                    <CubeIcon className="w-5 h-5" />
                                  ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div
                            className="cursor-pointer hover:text-nexus-blue transition-colors"
                            onClick={() => handleShowDetails(item)}
                          >
                            <div className="font-semibold hover:underline flex items-center gap-2 text-nexus-text-primary">
                              {item.productName}
                              {(item.isBundle || item.isBundled || item.isBundleItem) && (
                                <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded-full shadow-md">
                                  <CubeIcon className="w-3 h-3 mr-1" />
                                  同梱対象
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-nexus-text-secondary">
                              SKU: {item.productSku}
                            </p>

                            {/* 同梱情報の詳細表示 - ロケーション管理と同様のスタイル */}
                            {(item.isBundled || item.isBundleItem) && (
                              <div className="mt-2 p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg border-2 border-blue-300 shadow-inner">
                                <div className="space-y-2">
                                  {item.trackingNumber && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                      <span className="text-sm font-bold text-blue-900 flex items-center gap-1">
                                        <ClipboardDocumentListIcon className="h-4 w-4 text-blue-600" />
                                        追跡番号: {item.trackingNumber}
                                      </span>
                                    </div>
                                  )}
                                  {item.bundleId && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <span className="text-sm font-semibold text-blue-800">
                                        🔗 同梱グループ: {item.bundleId}
                                      </span>
                                    </div>
                                  )}
                                  <div className="bg-amber-100 border-l-4 border-amber-500 p-2 rounded-r">
                                    <div className="flex items-center gap-2 text-amber-800">
                                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.768 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                      </svg>
                                      <span className="text-sm font-bold flex items-center gap-1">
                                        <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />
                                        同じ追跡番号の商品をまとめて処理してください
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {item.isBundle && item.bundledItems && (
                              <div className="mt-1 text-xs text-nexus-text-secondary">
                                含む商品: {item.bundledItems.map(bi => bi.productName).join(', ')}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-sm text-nexus-text-primary">
                            {new Date(item.dueDate).toLocaleDateString('ja-JP')}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="space-y-2">
                            <BusinessStatusIndicator
                              status={
                                ['pending', 'workstation', 'picked', 'ordered'].includes(item.status) ? 'pending' :
                                item.status === 'packed' ? 'packed' :
                                item.status === 'ready_for_pickup' ? 'ready_for_pickup' :
                                item.status === 'shipped' ? 'shipped' :
                                'pending'
                              }
                              size="sm"
                              showLabel={true}
                            />
                            <button
                              onClick={() => toggleRowExpansion(item.id)}
                              className="text-xs text-nexus-blue hover:text-nexus-blue-dark flex items-center gap-1"
                            >
                              <span>詳細を{expandedRows.includes(item.id) ? '隠す' : '見る'}</span>
                              <svg 
                                className={`w-3 h-3 transform transition-transform ${expandedRows.includes(item.id) ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">

                            {/* ピックアップはロケーション管理で実施するため、ここでは不要 */}
                            {(['picked', 'pending', 'workstation', 'ordered'].includes(item.status)) && (
                              <>
                                {/* 同梱商品の場合: 同梱梱包開始（Nikon Z9のみ） */}
                                {item.productName.includes('Nikon Z9') ? (
                                  <NexusButton
                                    onClick={async () => {
                                      try {
                                        console.log(`📦 同梱梱包開始: ${item.bundleId}`);
                                        // 同梱グループ全体を梱包開始
                                        const bundleItems = items.filter(i => i.bundleId === item.bundleId);
                                        for (const bundleItem of bundleItems) {
                                          await handleInlineAction(bundleItem, 'pack');
                                        }
                                      } catch (error) {
                                        console.error('同梱梱包エラー:', error);
                                      }
                                    }}
                                    variant="primary"
                                    size="sm"
                                    icon={<CubeIcon className="w-4 h-4" />}
                                  >
                                    同梱梱包開始
                                  </NexusButton>
                                ) : (
                                  /* 通常商品: 通常梱包開始 */
                                  <NexusButton
                                    onClick={async () => {
                                      try {
                                        await handleInlineAction(item, 'pack');
                                      } catch (error) {
                                        console.error('梱包処理エラー:', error);
                                      }
                                    }}
                                    variant="primary"
                                    size="sm"
                                    icon={<CubeIcon className="w-4 h-4" />}
                                  >
                                    梱包開始
                                  </NexusButton>
                                )}
                                
                                {/* テスト商品: 一緒に処理メッセージ */}
                                {item.productName.includes('テスト商品') && (
                                  <span className="text-nexus-text-secondary text-sm bg-nexus-bg-secondary px-3 py-1 rounded ml-2">
                                    同梱相手と一緒に処理されます
                                  </span>
                                )}
                              </>
                            )}
                            {item.status === 'packed' && (
                              <>
                            {/* 梱包済み商品のラベルダウンロードボタン */}
                                <NexusButton
                                  onClick={() => handleDownloadLabel(item)}
                                  variant="success"
                                  size="sm"
                              icon={<DocumentArrowDownIcon className="w-4 h-4" />}
                                  className="mr-2"
                                >
                                  ラベル
                                </NexusButton>
                                
                                {/* 同梱商品の場合: 同梱専用ボタン */}
                                {item.productName.includes('Nikon Z9') || item.productName.includes('テスト商品') ? (
                                  <>
                                    {/* 同梱ラベル印刷（Nikon Z9のみ） */}
                                    {item.productName.includes('Nikon Z9') && (
                                      <>
                                        <NexusButton
                                          onClick={async () => {
                                            try {
                                              console.log(`📦 同梱ラベル印刷: ${item.bundleId}`);
                                              await handleInlineAction(item, 'print');
                                            } catch (error) {
                                              console.error('同梱印刷エラー:', error);
                                            }
                                          }}
                                          variant="default"
                                          size="sm"
                                          icon={<PrinterIcon className="w-4 h-4" />}
                                        >
                                          同梱ラベル印刷
                                        </NexusButton>
                                        <NexusButton
                                          onClick={async () => {
                                            try {
                                              console.log(`🚛 同梱集荷準備: ${item.bundleId}`);
                                              // 同梱グループ全体を集荷準備へ
                                              const bundleItems = items.filter(i => i.bundleId === item.bundleId);
                                              for (const bundleItem of bundleItems) {
                                                await handleInlineAction(bundleItem, 'ship');
                                              }
                                            } catch (error) {
                                              console.error('同梱集荷準備エラー:', error);
                                            }
                                          }}
                                          variant="primary"
                                          size="sm"
                                          icon={<TruckIcon className="w-4 h-4" />}
                                        >
                                          同梱集荷準備
                                        </NexusButton>
                                      </>
                                    )}
                                    
                                    {/* テスト商品: 一緒に処理メッセージ */}
                                    {item.productName.includes('テスト商品') && (
                                      <span className="text-gray-600 text-sm bg-gray-100 px-3 py-1 rounded">
                                        🔗 同梱相手と一緒に処理されます
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {/* 通常商品: 個別ボタン（個別ラベル印刷は削除） */}
                                    <NexusButton
                                      onClick={async () => {
                                        try {
                                          await handleInlineAction(item, 'ship');
                                        } catch (error) {
                                          console.error('出荷処理エラー:', error);
                                        }
                                      }}
                                      variant="primary"
                                      size="sm"
                                      icon={<TruckIcon className="w-4 h-4" />}
                                    >
                                      集荷エリアへ移動
                                    </NexusButton>
                                  </>
                                )}
                              </>
                            )}
                            {item.status === 'shipped' && (
                              <NexusButton
                                onClick={async () => {
                                  try {
                                    await handleInlineAction(item, 'deliver');
                                  } catch (error) {
                                    console.error('配送完了処理エラー:', error);
                                  }
                                }}
                                variant="primary"
                                size="sm"
                                className="flex items-center gap-1"
                                title="本来は配送業者トラッキングAPIから自動更新される機能"
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                                配送完了（手動）
                              </NexusButton>
                            )}
                            {item.status === 'ready_for_pickup' && (
                              <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                                <CheckCircleIcon className="w-4 h-4" />
                                <span className="font-medium">作業完了</span>
                                <span className="text-xs text-blue-500">（配送業者の集荷待ち）</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {/* 展開行 - ワークフロー進捗表示 */}
                      {expandedRows.includes(item.id) && (
                        <tr className="holo-row bg-nexus-bg-secondary">
                          <td colSpan={6} className="p-6">
                            <div className="space-y-4">
                              <WorkflowProgress 
                                steps={getWorkflowProgress(item.status as ShippingStatus)}
                              />
                              
                              {/* 同梱パッケージの詳細 */}
                              {item.isBundle && item.bundledItems && (
                                <div className="bg-nexus-bg-primary rounded-lg p-4 border border-nexus-border">
                                  <h4 className="text-sm font-medium text-nexus-text-primary mb-3 flex items-center gap-2">
                                    <CubeIcon className="w-4 h-4" />
                                    同梱内容 ({item.bundledItems.length}件)
                                  </h4>
                                  <div className="space-y-2">
                                    {item.bundledItems.map((bundledItem, index) => (
                                      <div key={bundledItem.id} className="flex items-start gap-3 text-sm">
                                        <span className="inline-flex items-center justify-center w-5 h-5 bg-nexus-blue/20 text-nexus-blue text-xs font-medium rounded-full flex-shrink-0">
                                          {index + 1}
                                        </span>
                                        <div className="flex-1">
                                          <p className="font-medium text-nexus-text-primary">{bundledItem.productName}</p>
                                          <div className="flex items-center gap-4 mt-1 text-nexus-text-secondary">
                                            <span>SKU: {bundledItem.productSku}</span>
                                            <span>注文: {bundledItem.orderNumber}</span>
                                            <span>価値: ${bundledItem.value?.toLocaleString()}</span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-3 pt-3 border-t border-nexus-border">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-nexus-text-secondary">合計価値</span>
                                      <span className="font-semibold text-nexus-text-primary">
                                        ${item.value.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-nexus-text-secondary">
                                  <p>配送先: {item.shippingAddress}</p>
                                  <p>配送方法: {item.shippingMethod}</p>
                                  {item.trackingNumber && (
                                    <div className="mt-2 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm">追跡番号:</span>
                                        <span 
                                          className="font-mono text-xs bg-nexus-bg-tertiary px-2 py-1 rounded border cursor-pointer hover:bg-nexus-bg-secondary transition-colors"
                                          onClick={() => navigator.clipboard.writeText(item.trackingNumber!)}
                                          title="クリックでコピー"
                                        >
                                          {item.trackingNumber}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => {
                                            const carrier = item.shippingMethod?.toLowerCase().includes('yamato') ? 'yamato' : 
                                                          item.shippingMethod?.toLowerCase().includes('sagawa') ? 'sagawa' : 
                                                          item.shippingMethod?.toLowerCase().includes('fedex') ? 'fedex' :
                                                          item.shippingMethod?.toLowerCase().includes('fedx') ? 'fedx' :
                                                          item.shippingMethod?.toLowerCase().includes('yupack') ? 'yupack' : 'other';
                                            const url = generateTrackingUrl(carrier, item.trackingNumber!);
                                            window.open(url, '_blank', 'noopener,noreferrer');
                                          }}
                                          className="px-3 py-1 bg-nexus-primary text-white text-xs rounded hover:bg-nexus-primary-dark transition-colors"
                                        >
                                          配送状況を確認
                                        </button>
                                        <span className="text-xs bg-nexus-success text-white px-2 py-1 rounded">
                                          eBay通知済み
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="bg-nexus-bg-primary rounded-lg p-3">
                                  <p className="text-sm font-medium text-nexus-text-primary">次のアクション</p>
                                  <p className="text-sm text-nexus-text-secondary mt-1">
                                    {getNextAction(item.status as ShippingStatus)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {paginatedItems.length === 0 && (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-nexus-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-nexus-text-primary">出荷案件がありません</h3>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  条件に一致する出荷案件がありません
                </p>
              </div>
            )}

            {/* ページネーション */}
            {totalItems > 0 && (
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



        {/* Shipping Detail Modal */}
        <ShippingDetailModal
          isOpen={selectedDetailItem !== null}
          onClose={() => setSelectedDetailItem(null)}
          item={selectedDetailItem}
          onStatusUpdate={updateItemStatus}
          onPackingInstruction={handlePackingInstruction}
        />

        {/* Packing Video Modal */}
        {selectedPackingItem && (
          <PackingVideoModal
            isOpen={isPackingVideoModalOpen}
            onClose={() => {
              setIsPackingVideoModalOpen(false);
              setSelectedPackingItem(null);
            }}
            productId={selectedPackingItem.id}
            productName={selectedPackingItem.productName}
            onComplete={handlePackingComplete}
          />
        )}

        {/* Carrier Selection Modal */}
        <CarrierSelectionModal
          isOpen={isCarrierSelectionModalOpen}
          onClose={() => {
            setIsCarrierSelectionModalOpen(false);
            setSelectedLabelItem(null);
          }}
          onCarrierSelect={handleCarrierSelect}
          item={selectedLabelItem}
        />

        {/* Bundle Packing Confirm Modal */}
        <BundlePackingConfirmModal
          isOpen={isBundleConfirmModalOpen}
          onClose={() => {
            setIsBundleConfirmModalOpen(false);
            setBundleItems([]);
          }}
          onConfirm={handleBundleConfirm}
          items={bundleItems}
        />

      </div>
    </DashboardLayout>
  );
}