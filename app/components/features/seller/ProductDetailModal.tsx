'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ShoppingCartIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  CameraIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import BaseModal from '../../ui/BaseModal';
import NexusButton from '../../ui/NexusButton';
import { BusinessStatusIndicator } from '../../ui';
import ProductInspectionDetails from './ProductInspectionDetails';
import ProductPhotographyDetails from './ProductPhotographyDetails';
import ProductStorageDetails from './ProductStorageDetails';
import CarrierSelectionModal from '../../modals/CarrierSelectionModal';
import { useToast } from '../../features/notifications/ToastProvider';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onOpenListingForm: (product: any) => void;
}

// 品質ランクバッジを生成する関数（複製）
const getConditionBadge = (condition: string) => {
  const conditionConfig: Record<string, { bg: string; text: string; label: string }> = {
    excellent: { bg: 'bg-green-800', text: 'text-white', label: '最高品質' },
    good: { bg: 'bg-blue-800', text: 'text-white', label: '高品質' },
    fair: { bg: 'bg-yellow-700', text: 'text-white', label: '標準品質' },
    poor: { bg: 'bg-red-800', text: 'text-white', label: '要注意' }
  };

  const config = conditionConfig[condition] || conditionConfig.fair;
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// ステータス変換関数（複製）
const convertStatusToKey = (status: string): string => {
  const statusMapping: Record<string, string> = {
    'inbound': 'inbound',
    'pending_inspection': 'pending_inspection', 
    'inspection': 'inspection',
    'inspecting': 'inspection',
    'photography': 'photography',
    'storage': 'storage',
    'completed': 'completed',
    'listed': 'listed',
    'sold': 'sold',
    'on_hold': 'on_hold',
    'failed': 'failed'
  };
  
  return statusMapping[status] || 'unknown';
};

// カテゴリ名の日本語表示関数
const getCategoryJapaneseName = (category: string): string => {
  const categoryMapping: Record<string, string> = {
    'camera': 'カメラ',
    'watch': '腕時計',
    'other': 'その他'
  };
  
  return categoryMapping[category] || category || '未設定';
};

// 納品プラン作成時と同じコンディション表示
const getConditionJapaneseName = (condition: string): string => {
  const conditionMapping: Record<string, string> = {
    'excellent': '優良',
    'very_good': '美品',
    'good': '良好',
    'fair': '普通',
    'poor': '要修理'
  };
  
  return conditionMapping[condition] || condition || '未設定';
};

export default function ProductDetailModal({ isOpen, onClose, product, onOpenListingForm }: ProductDetailModalProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [isShippingRequesting, setIsShippingRequesting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const { showToast } = useToast();
  const [inspectionNotesFresh, setInspectionNotesFresh] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 備考の最新値を取得（在庫リストの古いスナップショットを補正）
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

  // 履歴取得（スタッフと同仕様）
  const fetchProductHistory = async (productId: string) => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/products/${productId}/history`);
      if (response.ok) {
        const data = await response.json();
        const formattedHistory = (data.timeline || data.history || []).map((event: any) => {
          let details = '';
          if (event.metadata) {
            if (typeof event.metadata === 'object') {
              const metadata = event.metadata;
              const descriptions: string[] = [];
              if (metadata.userRole === 'system') descriptions.push('実行者: システム');
              if (metadata.userRole === 'seller') descriptions.push('実行者: セラー');
              if (metadata.userRole === 'staff') descriptions.push('実行者: スタッフ');
              if (metadata.location || metadata.locationName) descriptions.push(`保管場所: ${metadata.location || metadata.locationName}`);
              if (metadata.condition) descriptions.push(`状態: ${metadata.condition}`);
              if (metadata.price) descriptions.push(`価格: ¥${Number(metadata.price).toLocaleString()}`);
              if (metadata.newPrice) descriptions.push(`新価格: ¥${Number(metadata.newPrice).toLocaleString()}`);
              if (metadata.previousPrice) descriptions.push(`旧価格: ¥${Number(metadata.previousPrice).toLocaleString()}`);
              if (metadata.trackingNumber) descriptions.push(`追跡番号: ${metadata.trackingNumber}`);
              if (metadata.reason) descriptions.push(`理由: ${metadata.reason}`);
              if (metadata.fromLocation || metadata.fromLocationCode) descriptions.push(`移動元: ${metadata.fromLocation || metadata.fromLocationCode}`);
              if (metadata.toLocation || metadata.toLocationCode) descriptions.push(`移動先: ${metadata.toLocation || metadata.toLocationCode}`);
              if (metadata.orderNumber) descriptions.push(`注文番号: ${metadata.orderNumber}`);

              details = descriptions.join(', ') || '';
            } else {
              details = event.metadata.toString();
            }
          }

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
        setHistoryData([]);
      }
    } catch (error) {
      setHistoryData([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // 履歴タブが開かれたら取得
  useEffect(() => {
    if (isOpen && product?.id && activeTab === 'history') {
      fetchProductHistory(product.id);
    }
  }, [isOpen, product?.id, activeTab]);

  if (!product) return null;

  // キャンセル確認表示
  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  // 商品キャンセル処理
  const handleCancelConfirm = async () => {
    setShowCancelConfirm(false);
    setIsCancelling(true);

    try {
      const response = await fetch(`/api/products/${product.id}/cancel`, {
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

  // セラー出荷指示処理
  const handleShippingRequest = async (carrier: any, service: string) => {
    console.log('出荷指示開始:', { carrier, service, productId: product.id });
    setIsShippingRequesting(true);
    
    try {
      showToast({
        type: 'info',
        title: '出荷指示送信中',
        message: '配送業者への出荷指示を送信しています...',
        duration: 3000
      });

      const response = await fetch('/api/seller/shipping-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 認証はCookieセッションで行う
        },
        body: JSON.stringify({
          productId: product.id,
          shippingInfo: {
            carrier: carrier,
            service: service,
            shippingAddress: '配送先住所（セラー出荷）'
          }
        })
      });

      const result = await response.json();
      console.log('出荷指示結果:', result);

      if (result.success) {
        showToast({
          type: 'success',
          title: '出荷指示完了',
          message: result.message || '出荷指示を正常に送信しました。スタッフがピッキング作業を開始します。',
          duration: 5000
        });
        
        // モーダルを閉じる
        setIsShippingModalOpen(false);
        
        // 商品詳細モーダルも閉じる
        onClose();
        
        // ページリロード（商品リストの更新のため）
        window.location.reload();
        
      } else {
        throw new Error(result.error || '出荷指示の送信に失敗しました');
      }
    } catch (error) {
      console.error('出荷指示エラー:', error);
      showToast({
        type: 'error',
        title: 'エラー',
        message: error instanceof Error ? error.message : '出荷指示の処理中にエラーが発生しました',
        duration: 4000
      });
    } finally {
      setIsShippingRequesting(false);
    }
  };

  // 重量データを取得
  const getWeightInfo = () => {
    try {
      const metadata = typeof product.metadata === 'string' 
        ? JSON.parse(product.metadata) 
        : product.metadata;
      
      if (metadata?.packaging?.weight) {
        const weight = parseFloat(metadata.packaging.weight);
        const unit = metadata.packaging.weightUnit || 'kg';
        // 常に小数点第一位まで表示
        return `${weight.toFixed(1)}${unit}`;
      }
    } catch (error) {
      console.warn('重量データの解析エラー:', error);
    }
    return null;
  };

  const tabs = [
    {
      id: 'basic',
      label: '基本情報',
      icon: <DocumentTextIcon className="w-5 h-5" />
    },
    {
      id: 'inspection',
      label: '検品項目',
      icon: <CheckCircleIcon className="w-5 h-5" />
    },
    {
      id: 'photography',
      label: '商品画像',
      icon: <CameraIcon className="w-5 h-5" />
    },
    {
      id: 'storage',
      label: '保管先',
      icon: <BuildingStorefrontIcon className="w-5 h-5" />
    },
    {
      id: 'history',
      label: '履歴',
      icon: <DocumentTextIcon className="w-5 h-5" />
    },
    {
      id: 'notes',
      label: '備考',
      icon: <DocumentTextIcon className="w-5 h-5" />
    },
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`商品詳細 - ${product.name}`}
      size="xl"
      data-testid="product-detail-modal"
    >
      <div className="flex flex-col h-full">
        {/* タブナビゲーション */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* タブコンテンツ */}
        <div className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* 基本情報 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-nexus-text-primary mb-2">基本情報</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">商品名</span>
                      <span className="font-bold text-nexus-text-primary">{product.name || '未設定'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">SKU</span>
                      <span className="font-mono text-nexus-text-primary">{product.sku || '未設定'}</span>
                    </div>
                    {(() => {
                      try {
                        const md = typeof product.metadata === 'string' ? JSON.parse(product.metadata) : (product.metadata || {});
                        const serial = md?.serialNumber || md?.deliveryPlanInfo?.serialNumber;
                        return serial ? (
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-nexus-text-secondary">シリアル番号</span>
                            <span className="font-mono text-nexus-text-primary">{serial}</span>
                          </div>
                        ) : null;
                      } catch {
                        return null;
                      }
                    })()}
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">カテゴリー</span>
                      <span className="text-nexus-text-primary">{getCategoryJapaneseName(product.category)}</span>
                    </div>
                    {getWeightInfo() && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-nexus-text-secondary">重量</span>
                        <span className="text-nexus-text-primary">{getWeightInfo()}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-nexus-text-primary mb-2">状況・価値</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">ステータス</span>
                      <BusinessStatusIndicator 
                        status={product.status} 
                        size="sm" 
                      />
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">コンディション</span>
                      <span className="text-nexus-text-primary">{getConditionJapaneseName(product.condition)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">購入価格</span>
                      <span className="font-bold text-nexus-text-primary">
                        {(() => {
                          try {
                            const md = typeof product.metadata === 'string' ? JSON.parse(product.metadata) : (product.metadata || {});
                            const fromMetadata = (typeof md.purchasePrice === 'number' && md.purchasePrice > 0) ? md.purchasePrice : undefined;
                            const fromDeliveryPlanInfo = (md.deliveryPlanInfo && typeof md.deliveryPlanInfo.purchasePrice === 'number' && md.deliveryPlanInfo.purchasePrice > 0) ? md.deliveryPlanInfo.purchasePrice : undefined;
                            const value = (fromMetadata !== undefined) ? fromMetadata : (fromDeliveryPlanInfo !== undefined ? fromDeliveryPlanInfo : 0);
                            return `¥${Number(value).toLocaleString()}`;
                          } catch {
                            return `¥0`;
                          }
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">更新日</span>
                      <span className="text-nexus-text-secondary">
                        {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('ja-JP') : '未設定'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>


              {/* セラー向けアクションボタン */}
              {product.status === 'storage' && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-end gap-3">
                    <NexusButton
                      onClick={() => setIsShippingModalOpen(true)}
                      variant="secondary"
                      icon={<TruckIcon className="w-4 h-4" />}
                      disabled={isShippingRequesting}
                    >
                      出荷する
                    </NexusButton>
                    <NexusButton
                      onClick={() => onOpenListingForm(product)}
                      variant="primary"
                      icon={<ShoppingCartIcon className="w-4 h-4" />}
                    >
                      出品する
                    </NexusButton>
                  </div>
                </div>
              )}

              {/* 入庫待ち商品のキャンセルボタン */}
              {product.status === 'inbound' && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <NexusButton
                      onClick={onClose}
                      variant="default"
                    >
                      閉じる
                    </NexusButton>
                    <NexusButton
                      onClick={handleCancelClick}
                      variant="danger"
                      icon={<XMarkIcon className="w-4 h-4" />}
                      disabled={isCancelling}
                    >
                      {isCancelling ? 'キャンセル中...' : 'キャンセル'}
                    </NexusButton>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'inspection' && (
            <ProductInspectionDetails
              productId={product.id}
              status={product.status}
            />
          )}

          {activeTab === 'photography' && (
            <ProductPhotographyDetails
              productId={product.id}
              status={product.status}
            />
          )}

          {activeTab === 'storage' && (
            <ProductStorageDetails
              productId={product.id}
              status={product.status}
            />
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="font-bold text-nexus-text-primary">操作履歴</h4>
              {loadingHistory ? (
                <div className="flex justify-center items-center py-8 text-nexus-text-secondary">履歴を読み込み中...</div>
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
                              <span className="font-medium text-nexus-text-primary">{entry.action}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-nexus-text-secondary text-sm">{(() => {
                                const cleanedDetails = (() => {
                                  if (!entry.details) return '';
                                  // 実行者の重複記載を避ける
                                  return String(entry.details)
                                    .replace('実行者: システム', '')
                                    .replace('実行者: セラー', '')
                                    .replace('実行者: スタッフ', '')
                                    .replace(/^,\s*/,'')
                                    .replace(/,\s*,/g, ', ')
                                    .trim() || '';
                                })();
                                // 「詳細なし」テキストを空白に変更（スタッフと同様）
                                if (cleanedDetails === '詳細なし') return '';
                                return cleanedDetails;
                              })()}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-nexus-text-secondary">{entry.role}</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="holo-row">
                          <td colSpan={4} className="py-8 text-center">
                            <div className="flex flex-col items-center text-nexus-text-secondary">
                              履歴データがありません
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
            <div className="space-y-6">
              {(inspectionNotesFresh || product.inspectionNotes) && (
                <div className="border rounded-lg p-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-nexus-text-primary whitespace-pre-wrap">
                      {inspectionNotesFresh || product.inspectionNotes}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* 配送ラベル生成モーダル */}
      <CarrierSelectionModal
        isOpen={isShippingModalOpen}
        onClose={() => setIsShippingModalOpen(false)}
        onCarrierSelect={handleShippingRequest}
        item={{
          productName: product.name,
          orderNumber: `SELLER-${product.id.slice(-8)}`,
          shippingAddress: '配送先住所（セラー出荷）',
          value: product.price || 0
        }}
      />

      {/* キャンセル確認モーダル */}
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
              商品名: {product.name}
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
    </BaseModal>
  );
}
