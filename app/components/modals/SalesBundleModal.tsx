'use client';

import { useState } from 'react';
import { BaseModal, NexusButton } from '../ui';
import { NexusTextarea } from '@/app/components/ui';
import { 
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SalesOrderItem {
  id: string;
  listingId: string;
  productId: string;
  product: string;
  orderNumber: string;
  totalAmount: number;
  customer: string;
  status: string;
}

interface SalesBundleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bundleData: { notes: string }) => void;
  items: SalesOrderItem[];
}

export default function SalesBundleModal({
  isOpen,
  onClose,
  onConfirm,
  items
}: SalesBundleModalProps) {
  const [notes, setNotes] = useState('');
  
  const handleConfirm = () => {
    onConfirm({ notes });
    setNotes('');
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  const totalValue = items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="同梱発送設定"
      size="md"
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* 注意アラート */}
        <div className="bg-nexus-blue/10 border-2 border-nexus-blue/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-nexus-blue flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-nexus-blue">同梱発送設定について</h4>
              <p className="text-sm text-nexus-text-primary mt-1">
                選択された商品を同一パッケージで発送するよう設定します。設定後はスタッフが同梱して梱包・発送します。
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
                        <h4 className="font-medium text-nexus-text-primary">{item.product}</h4>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-nexus-text-secondary ml-8">
                        <div>注文番号: {item.orderNumber}</div>
                        <div>購入者: {item.customer}</div>
                        <div>金額: ¥{item.totalAmount.toLocaleString()}</div>
                      </div>
                    </div>
                    <span className="text-sm px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                      購入者決定
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
            <span className="text-sm font-medium text-nexus-text-primary">合計金額</span>
            <span className="text-lg font-semibold text-nexus-text-primary">
              ¥{totalValue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 備考入力 */}
        <div>
          <label className="block text-sm font-medium text-nexus-text-primary mb-2">
            同梱に関する備考（任意）
          </label>
          <NexusTextarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="同梱時の注意事項や特別な指示があれば入力してください"
            rows={3}
            variant="nexus"
          />
        </div>

        {/* 処理後の状態説明 */}
        <div className="bg-nexus-green/10 border-2 border-nexus-green/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-nexus-green flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-nexus-green">設定後の処理</h4>
              <p className="text-sm text-nexus-text-primary mt-1">
                スタッフが出荷管理で同梱設定を確認し、一つのパッケージで梱包・発送します。
              </p>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex justify-end gap-3 pt-4 border-t border-nexus-border">
          <NexusButton
            onClick={handleClose}
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
            同梱設定する
          </NexusButton>
        </div>
      </div>
    </BaseModal>
  );
}


