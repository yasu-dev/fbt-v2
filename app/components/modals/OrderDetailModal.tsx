'use client';

import { useState } from 'react';
import { BaseModal, NexusButton, BusinessStatusIndicator } from '../ui';
import { generateTrackingUrl, normalizeCarrierName } from '@/lib/utils/tracking';
import { useToast } from '../features/notifications/ToastProvider';
import ConfirmationModal from '../ui/ConfirmationModal';
import {
  TruckIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ClipboardDocumentCheckIcon,
  ArrowTopRightOnSquareIcon,
  TagIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const { showToast } = useToast();
  console.log('🔍 OrderDetailModal: 受信した注文データ', {
    order,
    trackingNumber: order?.trackingNumber,
    carrier: order?.carrier,
    id: order?.id,
    orderNumber: order?.orderNumber,
    isTrackingNumberTruthy: !!order?.trackingNumber
  });

  if (!order) return null;

  const handleTrackingClick = () => {
    if (order.trackingNumber && order.carrier) {
      const url = generateTrackingUrl(order.carrier, order.trackingNumber);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyTrackingNumber = async () => {
    try {
      await navigator.clipboard.writeText(order.trackingNumber);
    } catch (error) {
      console.warn('コピーに失敗しました:', error);
      // フォールバック：古いブラウザ対応
      const textArea = document.createElement('textarea');
      textArea.value = order.trackingNumber;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  // 出品取り消し確認画面表示
  const handleShowCancelConfirm = () => {
    setShowCancelConfirm(true);
  };

  // 確認後の実際の出品取り消し処理
  const handleCancelListing = async () => {
    if (!order.listingId || cancelLoading) return;

    setCancelLoading(true);
    try {
      // 出品削除APIを呼び出し（クエリパラメータでlistingIdを送信）
      const response = await fetch(`/api/listing?id=${encodeURIComponent(order.listingId)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '出品取り消しに失敗しました');
      }

      showToast({
        title: '出品取り消し完了',
        message: '出品を取り消し、商品を在庫管理に戻しました',
        type: 'success'
      });

      // 確認モーダルと詳細モーダルを閉じる
      setShowCancelConfirm(false);
      onClose();
      
      // ページリロードでデータを更新
      window.location.reload();
      
    } catch (error) {
      console.error('出品取り消しエラー:', error);
      showToast({
        title: '出品取り消しエラー',
        message: error instanceof Error ? error.message : '出品取り消し中にエラーが発生しました',
        type: 'error'
      });
    } finally {
      setCancelLoading(false);
    }
  };



  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-green-100 text-green-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: '保留中',
      confirmed: '確認済み',
      processing: '処理中',
      shipped: '配送中',
      delivered: '配送完了',
      cancelled: 'キャンセル'
    };
    return labels[status] || status;
  };

  return (
    <>
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={order.status === 'listing' ? '出品詳細' : '注文詳細'}
      size="lg"
    >
      <div className="space-y-6">
        {/* 注文基本情報 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-nexus-text-secondary mb-2">
                <TagIcon className="w-4 h-4" />
                注文番号
              </label>
              <div className="font-mono text-lg text-nexus-text-primary">
                {order.orderNumber || order.orderId}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-nexus-text-secondary mb-2">
                <UserIcon className="w-4 h-4" />
                顧客
              </label>
              <div className="text-nexus-text-primary">
                {order.customer}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-nexus-text-secondary mb-2">
                <CalendarIcon className="w-4 h-4" />
                注文日
              </label>
              <div className="text-nexus-text-primary">
                {new Date(order.orderDate || order.date).toLocaleDateString('ja-JP')}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-nexus-text-secondary mb-2">
                <CurrencyDollarIcon className="w-4 h-4" />
                販売価格
              </label>
              <div className="text-lg font-bold text-nexus-text-primary">
                ${Number(order.ebayPrice || order.listingPrice || order.sellingPrice || order.totalAmount || order.amount || 0).toLocaleString()}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-nexus-text-secondary mb-2 block">
                ステータス
              </label>
              <BusinessStatusIndicator 
                status={order.status} 
                size="md" 
                showLabel={true}
              />
            </div>

            {order.status === 'listing' && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-nexus-text-secondary mb-2">
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  eBay商品ページ
                </label>
                <a
                  href={`https://www.ebay.com/itm/${order.listingId || order.id || '123456789012'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                >
                  商品を確認
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </a>
              </div>
            )}

            {order.shippingAddress && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-nexus-text-secondary mb-2">
                  <MapPinIcon className="w-4 h-4" />
                  配送先
                </label>
                <div className="text-sm text-nexus-text-primary">
                  {order.shippingAddress}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 商品一覧 */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-nexus-text-secondary mb-3">
            <ShoppingBagIcon className="w-4 h-4" />
            注文商品
          </label>
          <div className="space-y-3">
            {order.items?.length > 0 ? (
              order.items.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-nexus-bg-secondary rounded-lg border border-nexus-border">
                  <div className="w-16 h-16 rounded border border-nexus-border overflow-hidden bg-nexus-bg-tertiary">
                    {item.productImage ? (
                      <img 
                        src={item.productImage} 
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-nexus-text-tertiary">
                        <ShoppingBagIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-nexus-text-primary">
                      {item.productName}
                    </div>
                    <div className="text-sm text-nexus-text-secondary">
                      カテゴリ: {item.category || '未分類'}
                    </div>
                    <div className="text-sm text-nexus-text-secondary">
                      数量: {item.quantity} / 単価: ${item.price?.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-nexus-text-primary">
                      ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-4 p-4 bg-nexus-bg-secondary rounded-lg border border-nexus-border">
                <div className="w-16 h-16 rounded border border-nexus-border overflow-hidden bg-nexus-bg-tertiary">
                  {order.ebayImage ? (
                    <img 
                      src={order.ebayImage} 
                      alt={order.product}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-nexus-text-tertiary">
                      <ShoppingBagIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-nexus-text-primary">{order.product || '商品情報なし'}</div>
                  {order.itemCount && (
                    <div className="text-sm text-nexus-text-secondary">商品点数: {order.itemCount}点</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 配送情報 */}
        {(order.trackingNumber || order.carrier) && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-nexus-text-secondary mb-3">
              <TruckIcon className="w-4 h-4" />
              配送情報
            </label>
            <div className="p-4 bg-nexus-bg-secondary rounded-lg border border-nexus-border">
              <div className="space-y-3">
                {order.trackingNumber && (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-nexus-text-secondary">追跡番号</div>
                      <div className="font-mono text-nexus-text-primary cursor-pointer"
                           onClick={handleCopyTrackingNumber}
                           title="クリックでコピー">
                        {order.trackingNumber}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <NexusButton
                        onClick={handleTrackingClick}
                        size="sm"
                        variant="primary"
                        icon={<ArrowTopRightOnSquareIcon className="w-4 h-4" />}
                      >
                        追跡サイト
                      </NexusButton>
                    </div>
                  </div>
                )}
                {order.carrier && (
                  <div>
                    <div className="text-sm text-nexus-text-secondary">配送業者</div>
                    <div className="text-nexus-text-primary">{normalizeCarrierName(order.carrier)}</div>
                  </div>
                )}
                
                {/* eBay通知状態 - 追跡番号がある場合のみ表示 */}
                {order.trackingNumber && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="text-xs bg-nexus-success text-white px-2 py-1 rounded w-fit">
                        eBay通知済み
                      </div>
                      <NexusButton
                        onClick={() => window.open(`https://www.ebay.com/mys/overview`, '_blank', 'noopener,noreferrer')}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        eBayで確認
                      </NexusButton>
                    </div>
                    <div className="text-xs text-nexus-text-secondary">
                      購入者にメール通知が送信されました
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* メモ・備考 */}
        {order.notes && (
          <div>
            <label className="text-sm font-medium text-nexus-text-secondary mb-2 block">
              備考
            </label>
            <div className="p-3 bg-nexus-bg-secondary rounded border border-nexus-border text-nexus-text-primary">
              <div dangerouslySetInnerHTML={{ __html: order.notes }} />
            </div>
          </div>
        )}
      </div>

      {/* フッター */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-nexus-border">
        <NexusButton
          onClick={onClose}
          variant="secondary"
        >
          閉じる
        </NexusButton>
        
        {/* 出品取り消しボタン（出品中ステータス時のみ表示） */}
        {order.status === 'listing' && (
          <NexusButton
            onClick={handleShowCancelConfirm}
            variant="danger"
            disabled={cancelLoading}
            icon={<XMarkIcon className="w-4 h-4" />}
          >
            出品取り消し
          </NexusButton>
        )}
      </div>
    </BaseModal>
    
    {/* 出品取り消し確認モーダル */}
    <ConfirmationModal
      isOpen={showCancelConfirm}
      onClose={() => setShowCancelConfirm(false)}
      onConfirm={handleCancelListing}
      title="出品取り消し確認"
      message={`eBayからの出品を取り消します。\n\n商品名: ${order.product}\n注文番号: ${order.orderNumber || order.id}\n\n※この操作により、eBayから出品が削除され、商品は在庫管理の「保管中」状態に戻ります。\n\n本当に出品を取り消しますか？`}
      confirmText="はい、取り消します"
      cancelText="いいえ、戻る"
      confirmVariant="danger"
      type="warning"
    />
    </>
  );
}

