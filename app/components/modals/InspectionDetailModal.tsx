'use client';

import { useState } from 'react';
import BaseModal from '@/app/components/ui/BaseModal';
import NexusButton from '@/app/components/ui/NexusButton';
import ConfirmationModal from '@/app/components/ui/ConfirmationModal';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { 
  CheckCircleIcon,
  XMarkIcon,
  InformationCircleIcon,
  CalendarIcon,
  TagIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  status: 'pending_inspection' | 'inspecting' | 'completed' | 'failed';
  receivedDate: string;
  brand?: string;
  model?: string;
  imageUrl?: string;
  metadata?: string;
}

interface InspectionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onStatusUpdate: (productId: string, newStatus: string) => Promise<void>;
  onContinueInspection?: (product: Product) => void;
}

export default function InspectionDetailModal({ 
  isOpen, 
  onClose, 
  product, 
  onStatusUpdate,
  onContinueInspection 
}: InspectionDetailModalProps) {
  const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = useState(false);
  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  if (!product) return null;

  const categoryLabels: Record<string, string> = {
    camera: 'カメラ',
    watch: '腕時計',
    other: 'その他',
  };

  const statusLabels: Record<string, string> = {
    pending_inspection: '入庫待ち',
    inspecting: '保管作業中',
    completed: '検品完了',
    failed: '検品不合格'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_inspection':
        return 'bg-amber-100 text-amber-800';
      case 'inspecting':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCompleteInspection = async () => {
    setIsCompleteConfirmOpen(false);
    setIsLoading(true);
    
    try {
      console.log(`[DEBUG] 検品完了処理開始: 商品ID=${product.id}, 現在のステータス=${product.status}`);
      await onStatusUpdate(product.id, 'completed');
      
      showToast({
        type: 'success',
        title: '検品完了',
        message: `商品「${product.name}」の検品を完了しました`,
        duration: 3000
      });
      
      onClose();
    } catch (error) {
      console.error('検品完了エラー:', error);
      showToast({
        type: 'error',
        title: 'エラー',
        message: '検品完了処理中にエラーが発生しました',
        duration: 4000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectInspection = async () => {
    setIsRejectConfirmOpen(false);
    setIsLoading(true);
    
    try {
      console.log(`[DEBUG] 検品不合格処理開始: 商品ID=${product.id}`);
      await onStatusUpdate(product.id, 'failed');
      
      showToast({
        type: 'success',
        title: '検品不合格',
        message: `商品「${product.name}」を不合格にしました`,
        duration: 3000
      });
      
      onClose();
    } catch (error) {
      console.error('検品不合格エラー:', error);
      showToast({
        type: 'error',
        title: 'エラー',
        message: '検品不合格処理中にエラーが発生しました',
        duration: 4000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueInspection = () => {
    if (onContinueInspection) {
      onContinueInspection(product);
    }
    onClose();
  };

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="検品処理"
        subtitle={`商品の検品状況を管理します`}
        size="lg"
        data-testid="inspection-detail-modal"
      >
        <div className="space-y-6">
          {/* 商品情報セクション */}
          <div className="bg-nexus-bg-secondary rounded-lg p-4 border border-nexus-border">
            <h4 className="text-sm font-medium text-nexus-text-primary mb-3 flex items-center gap-2">
              <InformationCircleIcon className="w-4 h-4" />
              商品情報
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-nexus-text-secondary">商品名</span>
                  <span className="text-nexus-text-primary font-medium">{product.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-nexus-text-secondary">SKU</span>
                  <code className="bg-nexus-bg-tertiary px-2 py-1 rounded text-xs font-mono">
                    {product.sku}
                  </code>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-nexus-text-secondary">カテゴリー</span>
                  <span className="text-nexus-text-primary">{categoryLabels[product.category] || product.category}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-nexus-text-secondary">受領日</span>
                  <span className="text-nexus-text-primary">{product.receivedDate}</span>
                </div>
                {product.brand && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-nexus-text-secondary">ブランド</span>
                    <span className="text-nexus-text-primary">{product.brand}</span>
                  </div>
                )}
                {product.model && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-nexus-text-secondary">モデル</span>
                    <span className="text-nexus-text-primary">{product.model}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 現在のステータス */}
          <div className="bg-nexus-bg-secondary rounded-lg p-4 border border-nexus-border">
            <h4 className="text-sm font-medium text-nexus-text-primary mb-3 flex items-center gap-2">
              <ClipboardDocumentCheckIcon className="w-4 h-4" />
              検品ステータス
            </h4>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(product.status)}`}>
                {statusLabels[product.status] || product.status}
              </span>
              {product.status === 'inspecting' && (
                <span className="text-sm text-nexus-text-secondary">
                  検品が開始されています
                </span>
              )}
            </div>
          </div>

          {/* 警告メッセージ（不合格選択時） */}
          {product.status === 'inspecting' && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-medium text-yellow-800">重要な判断</h5>
                  <p className="text-sm text-yellow-700 mt-1">
                    検品完了または不合格の判断は慎重に行ってください。不合格の場合は返却処理が必要となります。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex justify-between gap-4 pt-4 border-t border-nexus-border">
            <NexusButton
              onClick={onClose}
              variant="default"
              size="lg"
              disabled={isLoading}
            >
              キャンセル
            </NexusButton>
            
            <div className="flex gap-3">
              {product.status === 'inspecting' && onContinueInspection && (
                <NexusButton
                  onClick={handleContinueInspection}
                  variant="primary"
                  size="lg"
                  disabled={isLoading}
                  icon={<ClipboardDocumentCheckIcon className="w-5 h-5" />}
                >
                  検品を続ける
                </NexusButton>
              )}
              
              {product.status === 'inspecting' && (
                <>
                  <NexusButton
                    onClick={() => setIsRejectConfirmOpen(true)}
                    variant="danger"
                    size="lg"
                    disabled={isLoading}
                    icon={<XMarkIcon className="w-5 h-5" />}
                  >
                    検品不合格
                  </NexusButton>
                  
                  <NexusButton
                    onClick={() => setIsCompleteConfirmOpen(true)}
                    variant="success"
                    size="lg"
                    disabled={isLoading}
                    icon={<CheckCircleIcon className="w-5 h-5" />}
                  >
                    検品完了
                  </NexusButton>
                </>
              )}
            </div>
          </div>
        </div>
      </BaseModal>

      {/* 検品完了確認モーダル */}
      <ConfirmationModal
        isOpen={isCompleteConfirmOpen}
        onClose={() => setIsCompleteConfirmOpen(false)}
        onConfirm={handleCompleteInspection}
        title="検品完了の確認"
        message={`以下の商品の検品を完了します。よろしいですか？\n\n商品名: ${product.name}\nSKU: ${product.sku}\n\n※完了後は出品可能状態になります。`}
        confirmText="検品完了"
        cancelText="キャンセル"
        confirmVariant="primary"
        type="question"
      />

      {/* 検品不合格確認モーダル */}
      <ConfirmationModal
        isOpen={isRejectConfirmOpen}
        onClose={() => setIsRejectConfirmOpen(false)}
        onConfirm={handleRejectInspection}
        title="検品不合格の確認"
        message={`以下の商品を不合格にします。よろしいですか？\n\n商品名: ${product.name}\nSKU: ${product.sku}\n\n※不合格の場合は返却処理が必要になります。`}
        confirmText="不合格にする"
        cancelText="キャンセル"
        confirmVariant="danger"
        type="warning"
      />
    </>
  );
}
