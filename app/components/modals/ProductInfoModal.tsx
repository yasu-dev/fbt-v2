"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Package, MapPin, Calendar, User, FileText, Tag, ArrowRight, ArrowDown } from 'lucide-react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { useModal } from '@/app/components/ui/ModalContext';
import NexusButton from '@/app/components/ui/NexusButton';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

// 商品情報表示用の型定義
interface ProductInfo {
  id: string;
  name: string;
  sku: string;
  category: string;
  status: string;
  condition: string;
  price: number;
  description?: string;
  imageUrl?: string;
  entryDate: string;
  inspectedAt?: string;
  inspectedBy?: string;
  inspectionNotes?: string;
  notes?: string;
  metadata?: any;
  currentLocation?: {
    id: string;
    code: string;
    name: string;
    zone: string;
  };
  seller?: {
    id: string;
    username: string;
  };
  images?: Array<{
    id: string;
    url: string;
    thumbnailUrl?: string;
    description?: string;
  }>;
  updatedAt: string;
}

interface ProductInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductInfo | null;
  onMove?: (productId: string) => void;
}

export default function ProductInfoModal({ isOpen, onClose, product, onMove }: ProductInfoModalProps) {
  
  // 商品説明（検品メモの再掲）表示フラグ：重複回避のため既定で非表示
  const SHOW_PRODUCT_DESCRIPTION_FROM_INSPECTION_NOTES = false;

  // 重量データを取得（安全なメタデータアクセス）
  const getWeightInfo = () => {
    try {
      if (!product?.metadata) return null;

      const metadata = typeof product.metadata === 'string'
        ? JSON.parse(product.metadata)
        : product.metadata;

      if (metadata?.packaging?.weight) {
        const weight = parseFloat(metadata.packaging.weight);
        const unit = metadata.packaging.weightUnit || 'kg';
        return isNaN(weight) ? null : `${weight.toFixed(1)}${unit}`;
      }
    } catch (error) {
      console.warn('重量データの解析エラー:', error);
    }
    return null;
  };
  const { setIsAnyModalOpen } = useModal();
  const { showToast } = useToast();

  // モーダル開閉時の業務フロー制御
  useEffect(() => {
    if (isOpen) {
      setIsAnyModalOpen(true);
    } else {
      setIsAnyModalOpen(false);
    }
    
    // クリーンアップ
    return () => setIsAnyModalOpen(false);
  }, [isOpen, setIsAnyModalOpen]);

  const [inspectionNotesFresh, setInspectionNotesFresh] = useState<string | null>(null);

  // 画像ダウンロード関連のstate
  const [availableImages, setAvailableImages] = useState<any[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [downloadingImages, setDownloadingImages] = useState(false);

  useEffect(() => {
    let aborted = false;
    const fetchLatest = async () => {
      try {
        if (isOpen && product?.id) {
          const res = await fetch(`/api/products/${product.id}`);
          if (!res.ok) return;
          const data = await res.json();
          if (!aborted) setInspectionNotesFresh(data?.inspectionNotes ?? null);
        }
      } catch {}
    };
    fetchLatest();
    return () => { aborted = true; };
  }, [isOpen, product?.id]);

  // 画像一覧を取得
  const fetchAvailableImages = async (productId: string) => {
    setLoadingImages(true);
    try {
      const response = await fetch(`/api/images/download?productId=${productId}`);
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

  // 画像取得useEffect
  useEffect(() => {
    if (isOpen && product?.id) {
      fetchAvailableImages(product.id);
    }
  }, [isOpen, product?.id]);

  // ZIP形式で画像をダウンロード
  const handleDownloadImages = async (imageIds?: string[]) => {
    if (!product) return;

    setDownloadingImages(true);
    try {
      const response = await fetch('/api/images/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          imageIds: imageIds,
          downloadType: 'zip',
          includeMetadata: true
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${product.name}_images.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        showToast({
          type: 'success',
          title: 'ダウンロード完了',
          message: '画像をZIPファイルでダウンロードしました',
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

  if (!isOpen || !product) return null;

  // カテゴリの日本語ラベル（納品プラン作成と統一）
  const categoryLabels: Record<string, string> = {
    camera: 'カメラ',
    watch: '腕時計',
    other: 'その他',
  };

  // ステータスの日本語ラベル
  const statusLabels: Record<string, string> = {
    pending_inspection: '入庫待ち',
    inspecting: '検査中',
    storage: '保管中',
    completed: '検品完了',
    failed: '検品不合格',
    listed: '出品中',
    sold: '売却済み',
  };

  // コンディションの日本語ラベル（納品プランと統一）
  const conditionLabels: Record<string, string> = {
    new: '新品',
    like_new: '新品同様',
    excellent: '優良',
    very_good: '美品',
    good: '良好',
    fair: '普通',
    poor: '要修理',
    unknown: 'コンディション不明',
  };

  // ステータスに応じたスタイル
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'storage':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 価格のフォーマット
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price);
  };

  // HTMLタグとスタイル・スクリプト内容を除去してプレーンテキストとして表示するヘルパー関数
  const stripHtmlTags = (text: string): string => {
    // HTMLタグとその内容を除去し、HTMLエンティティをデコード
    return text
      // <style>から</style>までの内容を完全に除去
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      // <script>から</script>までの内容を完全に除去
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      // 残りのHTMLタグを除去
      .replace(/<[^>]*>/g, '')
      // HTMLエンティティをデコード
      .replace(/&nbsp;/g, ' ') // &nbsp;をスペースに変換
      .replace(/&lt;/g, '<') // &lt;を<に変換
      .replace(/&gt;/g, '>') // &gt;を>に変換
      .replace(/&amp;/g, '&') // &amp;を&に変換
      .replace(/&quot;/g, '"') // &quot;を"に変換
      .replace(/&#x27;/g, "'") // &#x27;を'に変換
      .replace(/&#39;/g, "'") // &#39;を'に変換
      // CSS記述の残存部分を除去（{...}の形式）
      .replace(/\{[^}]*\}/g, '')
      // 連続する空白・改行を1つにまとめる
      .replace(/\s+/g, ' ')
      // 前後の空白を除去
      .trim();
  };

  // 納品プランラベルダウンロード機能（安全なメタデータアクセス）
  const handleDownloadDeliveryPlanLabel = async () => {
    try {
      // 商品のメタデータから納品プランIDを取得
      let planId = null;
      try {
        if (!product?.metadata) {
          throw new Error('メタデータが存在しません');
        }

        const metadata = typeof product.metadata === 'string'
          ? JSON.parse(product.metadata)
          : product.metadata;

        planId = metadata?.deliveryPlanInfo?.planId || metadata?.planId;
      } catch (e) {
        console.warn('Failed to parse metadata for delivery plan ID:', e);
      }

      if (!planId) {
        showToast({
          type: 'warning',
          title: 'ラベル取得不可',
          message: '納品プランのラベル情報が見つかりません',
          duration: 4000
        });
        return;
      }

      showToast({
        type: 'info',
        title: 'ラベル生成中',
        message: '納品プランのラベルを生成しています...',
        duration: 2000
      });

      const response = await fetch(`/api/delivery-plan/${planId}/barcode-pdf`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ラベルの生成に失敗しました');
      }

      const result = await response.json();
      
      if (!result.success || !result.base64Data) {
        throw new Error(result.message || 'PDFデータの取得に失敗しました');
      }

      // PDFをダウンロード
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${result.base64Data}`;
      link.download = result.fileName || `delivery-plan-label-${product.sku}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast({
        type: 'success',
        title: 'ラベルダウンロード完了',
        message: '納品プランのラベルをダウンロードしました',
        duration: 3000
      });
    } catch (error) {
      console.error('Label download error:', error);
      showToast({
        type: 'error',
        title: 'ラベルダウンロードエラー',
        message: error instanceof Error ? error.message : 'ラベルのダウンロードに失敗しました',
        duration: 5000
      });
    }
  };

  const handleMoveProduct = () => {
    if (product && onMove) {
      onMove(product.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">商品情報</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 商品画像セクション */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                {/* メイン画像 */}
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {product.imageUrl || (product.images && product.images.length > 0) ? (
                    <Image
                      src={product.imageUrl || product.images![0].url}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="h-16 w-16" />
                    </div>
                  )}
                </div>

                {/* サブ画像（もしあれば） */}
                {product.images && product.images.length > 1 && (
                  <div className="grid grid-cols-3 gap-2">
                    {product.images.slice(1, 4).map((image) => (
                      <div key={image.id} className="aspect-square bg-gray-100 rounded overflow-hidden">
                        <Image
                          src={image.thumbnailUrl || image.url}
                          alt={image.description || `${product.name} 追加画像`}
                          width={120}
                          height={120}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* 画像ダウンロードボタン */}
                <div className="space-y-2">
                  {loadingImages ? (
                    <div className="flex justify-center py-2">
                      <div className="animate-spin h-4 w-4 border-b-2 border-blue-600 rounded-full"></div>
                    </div>
                  ) : availableImages.length > 0 ? (
                    <div className="space-y-2">
                      <NexusButton
                        onClick={() => handleDownloadImages()}
                        disabled={downloadingImages}
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        icon={<ArrowDown className="h-4 w-4" />}
                      >
                        {downloadingImages ? 'ダウンロード中...' : `画像をダウンロード (${availableImages.filter(img => img.available).length}件)`}
                      </NexusButton>
                      <p className="text-xs text-gray-500 text-center">
                        ZIP形式で全画像をダウンロードします
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 text-center">
                      ダウンロード可能な画像がありません
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 商品詳細情報セクション */}
            <div className="lg:col-span-2 space-y-6">
              {/* 基本情報 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">基本情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">商品名</label>
                    <p className="text-gray-900 font-medium">{product.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">SKU</label>
                    <p className="text-gray-900 font-mono">{product.sku}</p>
                  </div>
                  {(() => {
                    try {
                      const md = product.metadata ? (typeof product.metadata === 'string' ? JSON.parse(product.metadata) : product.metadata) : {};
                      const serial = md?.serialNumber || md?.deliveryPlanInfo?.serialNumber;
                      console.log('[DEBUG] ProductInfoModal シリアル確認:', { metadata: md, serial, productId: product.id });
                      return serial ? (
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-600">シリアル番号</label>
                          <p className="text-gray-900 font-mono">{serial}</p>
                        </div>
                      ) : null;
                    } catch (e) {
                      console.log('[DEBUG] ProductInfoModal シリアル解析エラー:', e);
                      return null;
                    }
                  })()}
                  <div>
                    <label className="text-sm font-medium text-gray-600">カテゴリ</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{categoryLabels[product.category] || product.category}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">コンディション</label>
                    <p className="text-gray-900">{conditionLabels[product.condition] || product.condition}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">出品価格</label>
                    <p className="text-gray-900 font-semibold mt-1">{formatPrice(product.price)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">ステータス</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mt-1 ${getStatusStyle(product.status)}`}>
                      {statusLabels[product.status] || product.status}
                    </span>
                  </div>
                  {getWeightInfo() && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">重量</label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-900">{getWeightInfo()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 検品・撮影・保管プロセス情報 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">検品・撮影・保管プロセス</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.inspectedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">検品完了日時</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-900">{formatDate(product.inspectedAt)}</span>
                      </div>
                    </div>
                  )}
                  {product.inspectedBy && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">検品者</label>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-900">{product.inspectedBy}</span>
                      </div>
                    </div>
                  )}
                  {product.currentLocation && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600">保管場所</label>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-900">
                          {product.currentLocation.code} - {product.currentLocation.name}
                          <span className="text-gray-500 ml-2">({product.currentLocation.zone})</span>
                        </span>
                      </div>
                    </div>
                  )}
                  {/* 撮影情報を追加 */}
                  {(() => {
                    try {
                      if (!product?.metadata) return null;
                      const metadata = typeof product.metadata === 'string'
                        ? JSON.parse(product.metadata)
                        : product.metadata;

                      if (metadata?.photographyDate) {
                        return (
                          <div>
                            <label className="text-sm font-medium text-gray-600">撮影完了日時</label>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="h-4 w-4 text-purple-600" />
                              <span className="text-gray-900">{formatDate(metadata.photographyDate)}</span>
                            </div>
                          </div>
                        );
                      }
                    } catch (e) {
                      console.warn('撮影日時の取得に失敗:', e);
                    }
                    return null;
                  })()}

                  {product.inspectionNotes && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600">検品メモ</label>
                      <div className="bg-red-100 border border-red-300 p-3 rounded-lg mt-1">
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-red-600 mt-0.5" />
                          <div className="max-h-32 overflow-y-auto">
                            <p className="text-red-800 text-sm leading-relaxed whitespace-pre-wrap break-words font-medium">
                              {stripHtmlTags(product.inspectionNotes)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 商品説明（内装梱包の備考を表示） - 重複回避のため既定で非表示 */}
              {SHOW_PRODUCT_DESCRIPTION_FROM_INSPECTION_NOTES && (inspectionNotesFresh || product.inspectionNotes) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">商品説明</h3>
                  <div className="max-h-48 overflow-y-auto">
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {stripHtmlTags(inspectionNotesFresh || product.inspectionNotes!)}
                    </p>
                  </div>
                </div>
              )}

              {/* 一般メモ（もしあれば） */}
              {product.notes && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">メモ</h3>
                  <div className="max-h-48 overflow-y-auto">
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {stripHtmlTags(product.notes)}
                    </p>
                  </div>
                </div>
              )}

              {/* タイムスタンプ情報 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">履歴情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">入庫日</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{formatDate(product.entryDate)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">最終更新</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{formatDate(product.updatedAt)}</span>
                    </div>
                  </div>
                  {product.seller && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600">出品者</label>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-900">{product.seller.username}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-between">
            <div className="flex gap-2">
              {/* 納品プランラベルダウンロードボタン */}
              {product.status === 'completed' && (
                <NexusButton
                  onClick={handleDownloadDeliveryPlanLabel}
                  variant="primary"
                  icon={<DocumentArrowDownIcon className="h-4 w-4" />}
                  size="sm"
                >
                  納品プランラベルDL
                </NexusButton>
              )}
              {/* 商品移動ボタン - 棚保管完了後の商品（検品完了済み）に表示 */}
              {onMove && product && (product.status === 'completed' || product.status === 'storage' || product.status === 'inspecting') && (
                <NexusButton
                  onClick={handleMoveProduct}
                  variant="secondary"
                  icon={<ArrowRight className="h-4 w-4" />}
                  size="sm"
                >
                  ロケーション移動
                </NexusButton>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


