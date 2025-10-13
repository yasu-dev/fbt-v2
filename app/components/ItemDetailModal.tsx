'use client';

import { useState, useRef, useEffect } from 'react';
import { BaseModal, NexusButton, NexusCard, BusinessStatusIndicator } from './ui';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import {
  CheckIcon,
  CameraIcon,
  ShoppingCartIcon,
  LinkIcon,
  ArrowTopRightOnSquareIcon,
  TagIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { Download } from 'lucide-react';
import { parseProductMetadata, getInspectionPhotographyStatus } from '@/lib/utils/product-status';
import { checkListingEligibility } from '@/lib/utils/listing-eligibility';

interface EbayListingInfo {
  hasEbayListing: boolean;
  ebayItemId?: string;
  listingUrl?: string;
  startingPrice?: number;
  buyItNowPrice?: number;
  listedAt?: string;
  status?: string;
  ebayTitle?: string;
  ebayCategory?: string;
  ebayCondition?: string;
  ebayShippingTime?: string;
  ebayLocation?: string;
  productInfo?: {
    id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    condition: string;
    status: string;
    seller: string;
  };
  message?: string;
}

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    sku: string;
    category: string;
    status: string;
    location: string;
    price: number;
    condition: string;
    imageUrl?: string;
    entryDate: string;
    assignedStaff?: string;
    lastModified: string;
    qrCode?: string;
    notes?: string;
    metadata?: string; // メタデータフィールド追加
    inspectedAt?: string; // 検品日時
    photographyDate?: string; // 撮影日時
    seller?: { id: string; username: string; email: string; fullName?: string };
  } | null;
  onStartInspection?: (item: any) => void;
  onStartPhotography?: (item: any) => void; // 撮影開始ハンドラー追加
  onStartListing?: (item: any) => void; // 出品開始ハンドラー追加
}

export default function ItemDetailModal({ 
  isOpen, 
  onClose, 
  item, 
  onStartInspection,
  onStartPhotography,
  onStartListing
}: ItemDetailModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'notes'>('details');
  const [ebayListingInfo, setEbayListingInfo] = useState<EbayListingInfo | null>(null);
  const [loadingEbayInfo, setLoadingEbayInfo] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const { showToast } = useToast();
  const [inspectionNotesFresh, setInspectionNotesFresh] = useState<string | null>(null);
  const [serialNumber, setSerialNumber] = useState<string | null>(null);

  // 画像ダウンロード関連のstate
  const [availableImages, setAvailableImages] = useState<any[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [downloadingImages, setDownloadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // キャンセル確認表示
  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  // 商品キャンセル処理
  const handleCancelConfirm = async () => {
    if (!item) return;

    setShowCancelConfirm(false);
    setIsCancelling(true);

    try {
      const response = await fetch(`/api/products/${item.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        showToast({
          type: 'success',
          title: 'キャンセル完了',
          message: '商品をキャンセルしました',
          duration: 3000
        });

        // モーダルを閉じる
        onClose();

        // 一覧を更新（親コンポーネントで処理される）
        window.location.reload();
      } else {
        throw new Error('キャンセル処理に失敗しました');
      }
    } catch (error) {
      console.error('キャンセルエラー:', error);
      showToast({
        type: 'error',
        title: 'キャンセル失敗',
        message: 'キャンセル処理中にエラーが発生しました',
        duration: 5000
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // 商品履歴を取得
  const fetchProductHistory = async (productId: string) => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/products/${productId}/history`);
      if (response.ok) {
        const data = await response.json();
        // タイムラインデータを履歴形式に変換（詳細をわかりやすく表示）
        const formattedHistory = (data.timeline || data.history || []).map((event: any, index: number) => {
          let details = '';
          if (event.metadata) {
            if (typeof event.metadata === 'object') {
              const metadata = event.metadata;
              const descriptions: string[] = [];

              // 実行者は詳細に含めない（「実行者」列で表示）
              if (metadata.previousStatus) descriptions.push(`旧ステータス: ${metadata.previousStatus}`);
              if (metadata.newStatus) descriptions.push(`新ステータス: ${metadata.newStatus}`);
              if (metadata.fromLocation || metadata.fromLocationCode) descriptions.push(`移動元: ${metadata.fromLocation || metadata.fromLocationCode}`);
              if (metadata.toLocation || metadata.toLocationCode) descriptions.push(`移動先: ${metadata.toLocation || metadata.toLocationCode}`);
              if (metadata.location || metadata.locationName) descriptions.push(`保管場所: ${metadata.location || metadata.locationName}`);
              if (metadata.price) descriptions.push(`価格: ¥${Number(metadata.price).toLocaleString()}`);
              if (metadata.newPrice) descriptions.push(`新価格: ¥${Number(metadata.newPrice).toLocaleString()}`);
              if (metadata.previousPrice) descriptions.push(`旧価格: ¥${Number(metadata.previousPrice).toLocaleString()}`);
              if (metadata.trackingNumber) descriptions.push(`追跡番号: ${metadata.trackingNumber}`);
              if (metadata.reason) descriptions.push(`理由: ${metadata.reason}`);
              if (metadata.orderNumber) descriptions.push(`注文番号: ${metadata.orderNumber}`);
              if (metadata.carrier) descriptions.push(`配送業者: ${metadata.carrier}`);

              // 重複を除去
              details = Array.from(new Set(descriptions)).join(', ') || '';
            } else {
              details = event.metadata.toString();
            }
          }

          // 実行者ロール（システム/セラー/スタッフ）
          const role = (() => {
            const r = (event.metadata && event.metadata.userRole) || '';
            if (r === 'system') return 'システム';
            if (r === 'seller') return 'セラー';
            if (r === 'staff') return 'スタッフ';
            if (!event.user || event.user === 'システム') return 'システム';
            return 'スタッフ';
          })();

          return {
            date: new Date(event.timestamp).toLocaleString('ja-JP'),
            action: event.title,
            details: details || event.description || '',
            user: event.user || 'システム',
            type: event.type || 'unknown',
            role
          };
        }) || [];
        setHistoryData(formattedHistory);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'データの取得に失敗しました' }));
        console.error('Failed to fetch product history:', errorData);
        setHistoryData([]);
        showToast({
          type: 'warning',
          title: '履歴取得エラー',
          message: errorData.error || '商品履歴の取得に失敗しました',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error fetching product history:', error);
      setHistoryData([]);
      showToast({
        type: 'error',
        title: '履歴取得エラー',
        message: 'ネットワークエラーまたは予期しないエラーが発生しました',
        duration: 5000
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  // eBay出品情報を取得
  const fetchEbayListingInfo = async (productId: string) => {
    setLoadingEbayInfo(true);
    try {
      const response = await fetch(`/api/products/${productId}/ebay-listing`);
      if (response.ok) {
        const data = await response.json();
        setEbayListingInfo(data);
      } else {
        console.error('Failed to fetch eBay listing info');
        setEbayListingInfo({ hasEbayListing: false, message: 'eBay出品情報の取得に失敗しました' });
      }
    } catch (error) {
      console.error('Error fetching eBay listing info:', error);
      setEbayListingInfo({ hasEbayListing: false, message: 'eBay出品情報の取得中にエラーが発生しました' });
    } finally {
      setLoadingEbayInfo(false);
    }
  };

  // スクロール位置のリセット
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  // モーダルが開いた時にeBay出品情報を取得
  useEffect(() => {
    if (isOpen && item) {
      fetchEbayListingInfo(item.id);
      fetchAvailableImages(item.id);
      setSelectedImages([]); // モーダルが開くたびに選択をリセット
    }
  }, [isOpen, item]);

  // 履歴タブが選択されたときに履歴データを取得
  useEffect(() => {
    if (isOpen && item?.id && activeTab === 'history') {
      fetchProductHistory(item.id);
    }
  }, [isOpen, item?.id, activeTab]);

  // 最新の備考を補正
  useEffect(() => {
    let aborted = false;
    const fetchLatest = async () => {
      try {
        if (isOpen && item?.id) {
          const res = await fetch(`/api/products/${item.id}`);
          if (!res.ok) return;
          const data = await res.json();
          if (!aborted) setInspectionNotesFresh(data?.inspectionNotes ?? null);
          try {
            const meta = data?.metadata ? (typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata) : {};
            const serial = meta?.serialNumber || meta?.deliveryPlanInfo?.serialNumber || null;
            console.log('[DEBUG] ItemDetailModal シリアル取得:', {
              metadata: data?.metadata,
              parsedMeta: meta,
              serialNumber: serial,
              productId: item?.id
            });
            if (!aborted) setSerialNumber(serial);
          } catch (err) {
            console.error('[DEBUG] ItemDetailModal シリアルパースエラー:', err);
          }
        }
      } catch {}
    };
    fetchLatest();
    return () => { aborted = true; };
  }, [isOpen, item?.id]);

  // イベントタイプに基づく色分け
  const getTypeColor = (type: string): string => {
    const colorMap: { [key: string]: string } = {
      'received': 'bg-blue-500',
      'inspected': 'bg-green-500',
      'listed': 'bg-purple-500',
      'price_changed': 'bg-orange-500',
      'sold': 'bg-emerald-500',
      'shipped': 'bg-indigo-500',
      'returned': 'bg-red-500',
      'relisted': 'bg-yellow-500',
      'movement': 'bg-cyan-500',
      'order': 'bg-pink-500',
      'delivery': 'bg-teal-500'
    };
    return colorMap[type] || 'bg-gray-500';
  };

  if (!isOpen || !item) return null;

  // メタデータから検品・撮影状況を取得
  const metadata = parseProductMetadata(item.metadata);
  const inspectionPhotographyStatus = getInspectionPhotographyStatus(metadata);
  
  // 出品可能性を判定
  const listingEligibility = checkListingEligibility({
    status: item.status,
    inspectedAt: item.inspectedAt || (item.status === 'storage' ? new Date().toISOString() : null),
    photographyDate: item.photographyDate || null
  });


  const handleEbayLinkClick = () => {
    if (ebayListingInfo?.listingUrl) {
      window.open(ebayListingInfo.listingUrl, '_blank', 'noopener,noreferrer');
      showToast({
        type: 'info',
        title: 'eBayページを開きました',
        message: '新しいタブでeBay出品ページが開きます',
        duration: 3000
      });
    }
  };

  // 画像一覧を取得
  const fetchAvailableImages = async (productId: string) => {
    setLoadingImages(true);
    try {
      const response = await fetch('/api/images/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableImages(data.images || []);
        console.log(`[DEBUG] 利用可能な画像: ${data.availableImages}/${data.totalImages}件`);
      } else {
        console.error('画像一覧の取得に失敗しました');
        setAvailableImages([]);
      }
    } catch (error) {
      console.error('画像一覧取得エラー:', error);
      setAvailableImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  // 画像選択の切り替え
  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  // 全選択/全解除
  const toggleSelectAll = () => {
    const availableImageIds = availableImages.filter(img => img.hasData).map(img => img.id);
    if (selectedImages.length === availableImageIds.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(availableImageIds);
    }
  };

  // ZIP形式で画像をダウンロード
  const handleDownloadImages = async (imageIds?: string[]) => {
    if (!item) return;

    // 指定されたimageIdsを使用、なければ選択された画像を使用、それもなければ全ての画像を使用
    const targetImageIds = imageIds || (selectedImages.length > 0 ? selectedImages : availableImages.filter(img => img.hasData).map(img => img.id));

    if (targetImageIds.length === 0) {
      showToast({
        type: 'warning',
        title: 'ダウンロード不可',
        message: 'ダウンロードする画像が選択されていません',
        duration: 3000
      });
      return;
    }

    setDownloadingImages(true);
    try {
      // URLを構築：productIdsと選択された画像IDsを含める
      let url = `/api/images/download?productIds=${item.id}`;
      if (targetImageIds.length < availableImages.filter(img => img.hasData).length) {
        // 全画像ではなく特定の画像が選択されている場合のみimageIdsパラメータを追加
        url += `&imageIds=${targetImageIds.join(',')}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${item.name}_images.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        showToast({
          type: 'success',
          title: 'ダウンロード完了',
          message: `${targetImageIds.length}件の画像をZIPファイルでダウンロードしました`,
          duration: 3000
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ダウンロードに失敗しました');
      }
    } catch (error) {
      console.error('画像ダウンロードエラー:', error);
      showToast({
        type: 'error',
        title: 'ダウンロード失敗',
        message: error instanceof Error ? error.message : '画像のダウンロード中にエラーが発生しました',
        duration: 5000
      });
    } finally {
      setDownloadingImages(false);
    }
  };

  // 単一画像のダウンロード
  const handleDownloadSingleImage = async (imageId: string, filename: string) => {
    if (!item) return;

    try {
      const response = await fetch(`/api/images/download?productId=${item.id}&imageId=${imageId}`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // 画像の出典情報を取得
        const image = availableImages.find(img => img.id === imageId);
        const sourceText = image?.source === 'seller' ? 'セラー画像' : 'スタッフ撮影画像';

        showToast({
          type: 'success',
          title: 'ダウンロード完了',
          message: `${sourceText} ${filename} をダウンロードしました`,
          duration: 3000
        });
      } else {
        throw new Error('画像のダウンロードに失敗しました');
      }
    } catch (error) {
      console.error('単一画像ダウンロードエラー:', error);
      showToast({
        type: 'error',
        title: 'ダウンロード失敗',
        message: '画像のダウンロード中にエラーが発生しました',
        duration: 5000
      });
    }
  };



  return (
    <>
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="商品詳細"
      size="xl"
      className="max-h-[90vh] overflow-hidden"
    >
      <div className="p-6">
        <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {item.name} ({item.sku})
            </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-nexus-border mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'details', label: '詳細情報' },
              { id: 'history', label: '履歴' },
              { id: 'notes', label: '備考' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-nexus-blue text-nexus-blue'
                    : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-nexus-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[70vh]" ref={scrollContainerRef}>
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-nexus-text-primary">
                    基本情報
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        商品名
                      </label>
                      <p className="text-nexus-text-primary">{item.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        SKU
                      </label>
                      <p className="text-nexus-text-primary">{item.sku}</p>
                    </div>
                        {(() => {
                          try {
                            const fallbackMd = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : (item.metadata || {});
                            const fallbackSerial = fallbackMd?.serialNumber || fallbackMd?.deliveryPlanInfo?.serialNumber;
                            const showSerial = serialNumber || fallbackSerial || null;
                            console.log('[DEBUG] ItemDetailModal シリアル表示:', {
                              serialNumber,
                              fallbackSerial,
                              showSerial,
                              itemMetadata: item.metadata
                            });
                            return showSerial ? (
                              <div className="col-span-2">
                                <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                                  シリアル番号
                                </label>
                                <p className="text-nexus-text-primary font-mono">{showSerial}</p>
                              </div>
                            ) : null;
                          } catch {
                            return null;
                          }
                        })()}
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        カテゴリ
                      </label>
                      <p className="text-nexus-text-primary">{item.category}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        作業進捗
                      </label>
                      <div className="flex items-center space-x-2">
                        <BusinessStatusIndicator
                          status={item.status as any}
                          size="sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        価格
                      </label>
                      <p className="text-nexus-text-primary">¥{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Location and Assignment */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-nexus-text-primary">
                    保管・セラー情報
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        保管場所
                      </label>
                      <p className="text-nexus-text-primary">{item.location}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        セラー
                      </label>
                      <p className="text-nexus-text-primary">{item.seller?.fullName || item.seller?.username || item.seller?.email || '未設定'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        登録日
                      </label>
                      <p className="text-nexus-text-primary">
                        {new Date(item.entryDate).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        最終更新
                      </label>
                      <p className="text-nexus-text-primary">
                        {new Date(item.lastModified).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-nexus-text-primary">
                  商品画像
                </h3>

                {loadingImages ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin h-8 w-8 border-b-2 border-nexus-blue rounded-full"></div>
                    <span className="ml-3 text-nexus-text-secondary">画像を読み込み中...</span>
                  </div>
                ) : availableImages.length > 0 ? (
                  <div className="space-y-4">
                    {/* 全選択チェックボックス */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedImages.length === availableImages.filter(img => img.hasData).length && availableImages.filter(img => img.hasData).length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 text-nexus-blue focus:ring-nexus-blue border-gray-300 rounded"
                        />
                        <span className="text-sm text-nexus-text-secondary">
                          すべて選択 ({selectedImages.length}/{availableImages.filter(img => img.hasData).length})
                        </span>
                      </label>
                      {selectedImages.length > 0 && (
                        <NexusButton
                          onClick={() => handleDownloadImages(selectedImages)}
                          variant="primary"
                          size="sm"
                          icon={<Download className="w-4 h-4" />}
                          disabled={downloadingImages}
                        >
                          選択した画像をダウンロード ({selectedImages.length})
                        </NexusButton>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {availableImages.map((image, index) => (
                        <div
                          key={image.id}
                          className={`relative group rounded-lg border-2 overflow-hidden ${
                            image.hasData
                              ? selectedImages.includes(image.id)
                                ? 'border-nexus-blue bg-nexus-blue/10'
                                : 'border-nexus-border hover:border-nexus-blue'
                              : 'border-red-300 bg-gray-100'
                          }`}
                        >
                          {image.hasData ? (
                            <>
                              {/* チェックボックス */}
                              <div className="absolute top-2 left-2 z-10">
                                <input
                                  type="checkbox"
                                  checked={selectedImages.includes(image.id)}
                                  onChange={() => toggleImageSelection(image.id)}
                                  className="w-4 h-4 text-nexus-blue focus:ring-nexus-blue border-gray-300 rounded"
                                />
                              </div>

                              <div className="aspect-square">
                                {image.previewUrl ? (
                                  <img
                                    src={image.previewUrl}
                                    alt={`商品画像 ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <div className={`${image.previewUrl ? 'hidden' : ''} w-full h-full bg-gray-100 flex items-center justify-center`}>
                                  <div className="text-center">
                                    <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                    <p className="text-xs text-gray-600">{image.filename}</p>
                                  </div>
                                </div>
                              </div>

                              {/* ダウンロードボタン */}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                                <NexusButton
                                  onClick={() => handleDownloadSingleImage(image.id, image.filename)}
                                  variant="primary"
                                  size="sm"
                                  icon={<Download className="w-4 h-4" />}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                >
                                  ダウンロード
                                </NexusButton>
                              </div>

                              {/* カテゴリと出典バッジ */}
                              <div className="absolute top-2 right-2 space-y-1">
                                {image.source && (
                                  <div>
                                    <span className={`px-2 py-1 text-xs rounded ${
                                      image.source === 'seller'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-blue-500 text-white'
                                    }`}>
                                      {image.source === 'seller' ? 'セラー' : 'スタッフ撮影'}
                                    </span>
                                  </div>
                                )}
                                {image.category && image.category !== 'seller' && image.category !== 'photography' && (
                                  <div>
                                    <span className="bg-nexus-blue text-white px-2 py-1 text-xs rounded">
                                      {image.category}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* ファイル情報 */}
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                                <p className="text-white text-xs truncate">
                                  {image.filename}
                                </p>
                                {image.size && (
                                  <p className="text-gray-300 text-xs">
                                    {(image.size / 1024).toFixed(1)}KB
                                  </p>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="aspect-square flex items-center justify-center">
                              <div className="text-center">
                                <PhotoIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                <p className="text-xs text-gray-500">ファイル未検出</p>
                                <p className="text-xs text-gray-400 truncate">{image.filename}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="bg-nexus-bg-secondary rounded-lg p-3">
                      <div className="text-sm">
                        <div className="space-y-1">
                          <span className="block text-nexus-text-secondary">
                            利用可能な画像: {availableImages.filter(img => img.hasData).length}/{availableImages.length}件
                          </span>
                          <div className="flex space-x-4 text-xs">
                            <span className="text-green-600">
                              セラー: {availableImages.filter(img => img.hasData && img.source === 'seller').length}件
                            </span>
                            <span className="text-blue-600">
                              スタッフ撮影: {availableImages.filter(img => img.hasData && img.source === 'staff').length}件
                            </span>
                          </div>
                          {selectedImages.length > 0 && (
                            <span className="block text-nexus-blue font-medium">
                              選択中: {selectedImages.length}件
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-nexus-text-secondary">登録されている画像がありません</p>
                    <p className="text-sm text-nexus-text-secondary mt-1">
                      商品の写真撮影が完了していない可能性があります
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-nexus-text-primary">
                操作履歴
              </h3>
              {loadingHistory ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin h-8 w-8 border-b-2 border-nexus-yellow rounded-full"></div>
                  <span className="ml-3 text-nexus-text-secondary">履歴を読み込み中...</span>
                </div>
              ) : (
                <div className="holo-table overflow-y-auto max-h-[60vh]">
                  <table className="w-full">
                    <thead className="holo-header">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-medium">日時</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">アクション</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">詳細</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">実行者</th>
                      </tr>
                    </thead>
                    <tbody className="holo-body">
                      {historyData.length > 0 ? (
                        historyData.map((entry, index) => (
                          <tr key={index} className="holo-row">
                            <td className="py-3 px-4 text-nexus-text-secondary text-sm">{entry.date}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-nexus-text-primary">{entry.action}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-nexus-text-secondary text-sm">{entry.details}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-nexus-text-secondary">{entry.role}</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="holo-row">
                          <td colSpan={4} className="py-8 text-center">
                            <div className="flex flex-col items-center">
                              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-nexus-text-secondary">履歴データがありません</span>
                              <span className="text-xs text-nexus-text-secondary mt-1">商品の操作が行われると履歴が表示されます</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              {(inspectionNotesFresh || item.inspectionNotes) && (
                <div className="bg-nexus-bg-secondary rounded-lg p-4">
                  <div className="text-nexus-text-secondary whitespace-pre-wrap break-words">
                    {inspectionNotesFresh || item.inspectionNotes}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-3">
            <NexusButton
              onClick={onClose}
              variant="default"
            >
              閉じる
            </NexusButton>
            {onStartInspection && (item.status === 'inbound' || item.status === 'storage') && (
              <NexusButton
                onClick={() => onStartInspection(item)}
                variant="primary"
                icon={<CheckIcon className="w-4 h-4" />}
              >
                {item.status === 'storage' ? 'ロケーション移動' : '検品開始'}
              </NexusButton>
            )}
            {onStartPhotography && inspectionPhotographyStatus.canStartPhotography && (
              <NexusButton
                onClick={() => onStartPhotography(item)}
                variant="primary"
                icon={<CameraIcon className="w-4 h-4" />}
              >
                撮影する
              </NexusButton>
            )}
            {onStartListing && listingEligibility.canList && (
              <NexusButton
                onClick={() => onStartListing(item)}
                variant="primary"
                icon={<ShoppingCartIcon className="w-4 h-4" />}
              >
                出品する
              </NexusButton>
            )}
            {item.status === 'inbound' && (
              <NexusButton
                onClick={handleCancelClick}
                variant="danger"
                icon={<XMarkIcon className="w-4 h-4" />}
                disabled={isCancelling}
              >
                {isCancelling ? 'キャンセル中...' : 'キャンセル'}
              </NexusButton>
            )}
          </div>
        </div>
      </div>
    </BaseModal>

    {/* キャンセル確認モーダル */}
    {showCancelConfirm && (
      <BaseModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        title="商品キャンセルの確認"
        size="sm"
      >
        <div className="p-6">
          <div className="mb-6">
            <p className="text-nexus-text-primary">
              この商品をキャンセルしてもよろしいですか？
            </p>
            <p className="text-sm text-nexus-text-secondary mt-2">
              商品名: {item?.name}
            </p>
            <p className="text-sm text-red-600 mt-3">
              ※ キャンセル後は元に戻すことができません
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <NexusButton
              onClick={() => setShowCancelConfirm(false)}
              variant="default"
            >
              戻る
            </NexusButton>
            <NexusButton
              onClick={handleCancelConfirm}
              variant="danger"
              disabled={isCancelling}
            >
              キャンセル実行
            </NexusButton>
          </div>
        </div>
      </BaseModal>
    )}
  </>
  );
} 