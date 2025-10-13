'use client';

import { BaseModal, NexusButton } from '../ui';
import { 
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
interface ShippingItem {
  id: string;
  productName: string;
  productSku: string;
  orderNumber: string;
  customer: string;
  shippingAddress: string;
  status: 'storage' | 'picked' | 'workstation' | 'packed' | 'shipped' | 'ready_for_pickup';
  dueDate: string;
  inspectionNotes?: string;
  trackingNumber?: string;
  shippingMethod: string;
  value: number;
  location?: string;
  productImages?: string[];
  inspectionImages?: string[];
  
  // 同梱関連フィールド
  isBundle?: boolean;
  bundledItems?: ShippingItem[];
  isBundled?: boolean;
  bundleId?: string;
}

interface BundlePackingConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  items: ShippingItem[];
}

export default function BundlePackingConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  items
}: BundlePackingConfirmModalProps) {
  
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const totalValue = items.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="同梱梱包確認"
      size="md"
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* 注意アラート */}
        <div className="bg-nexus-yellow/10 border-2 border-nexus-yellow/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-nexus-yellow flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-nexus-yellow">同梱梱包について</h4>
              <p className="text-sm text-nexus-text-primary mt-1">
                選択された商品を一つのパッケージにまとめて梱包します。梱包後は分離できませんのでご注意ください。
              </p>
            </div>
          </div>
        </div>

        {/* 商品一覧 */}
        <div>
          <h3 className="text-lg font-semibold text-nexus-text-primary mb-4 flex items-center gap-2">
            <CubeIcon className="w-5 h-5" />
            同梱対象商品 ({items.length}件)
          </h3>
          
          <div className="bg-nexus-bg-secondary rounded-lg border border-nexus-border">
            <div className="divide-y divide-nexus-border">
              {items.map((item, index) => (
                <div key={item.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-nexus-blue text-white text-xs font-medium rounded-full">
                          {index + 1}
                        </span>
                        <h4 className="font-medium text-nexus-text-primary">{item.productName}</h4>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-nexus-text-secondary ml-8">
                        {item.location && (
                          <div className="font-medium text-nexus-text-primary">
                            ロケーション: {item.location}
                          </div>
                        )}
                        {item.productSku && (
                          <div>
                            管理番号: {item.productSku.split('-').slice(0, 3).join('-')}
                          </div>
                        )}
                        {item.value && <div>価値: ${item.value.toLocaleString()}</div>}
                      </div>
                    </div>
                    <span className="text-sm px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
                      梱包待ち
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 合計情報 */}
        <div className="bg-nexus-bg-tertiary rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-nexus-text-primary">合計商品価値</span>
            <span className="text-lg font-semibold text-nexus-text-primary">
              ${totalValue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 処理後の状態説明 */}
        <div className="bg-nexus-green/10 border-2 border-nexus-green/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-nexus-green flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-nexus-green">処理後の状態</h4>
              <p className="text-sm text-nexus-text-primary mt-1">
                すべての商品が「梱包済み」ステータスに更新され、一つの同梱パッケージとして管理されます。
              </p>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex justify-end gap-3 pt-4 border-t border-nexus-border">
          <NexusButton
            onClick={onClose}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <XMarkIcon className="w-4 h-4" />
            キャンセル
          </NexusButton>
          
          <NexusButton
            onClick={handleConfirm}
            variant="primary"
            className="flex items-center gap-2"
          >
            <CubeIcon className="w-4 h-4" />
            同梱梱包開始
          </NexusButton>
        </div>
      </div>
    </BaseModal>
  );
}