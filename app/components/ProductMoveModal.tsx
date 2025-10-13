'use client';

import { useState, useEffect, useRef } from 'react';
import { BaseModal, NexusButton, NexusInput } from './ui';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import {
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface ProductMoveModalProps {
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
  } | null;
  onMove: (itemId: string, newLocation: string, reason: string) => void;
}

export default function ProductMoveModal({
  isOpen,
  onClose,
  item,
  onMove
}: ProductMoveModalProps) {
  const { showToast } = useToast();
  const [newLocation, setNewLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // デバッグログ
  console.log('ProductMoveModal render:', {
    isOpen,
    showConfirmation,
    newLocation: newLocation.length,
    item: item?.name,
    willShowConfirmation: showConfirmation && isOpen && item
  });

  useEffect(() => {
    if (item && !showConfirmation) {
      setNewLocation('');
      console.log('リセット: newLocation cleared');
    }

    // モーダル開時に棚番号入力に自動フォーカス
    if (isOpen && !showConfirmation) {
      const timer = setTimeout(() => {
        if (locationInputRef.current) {
          locationInputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleSubmit = async () => {
    if (!newLocation.trim()) {
      showToast({
        type: 'error',
        title: '入力エラー',
        message: '移動先の棚番号を入力してください'
      });
      return;
    }

    if (newLocation === item.location) {
      showToast({
        type: 'error',
        title: '移動エラー',
        message: '現在の棚番号と同じです'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 移動実行
      onMove(item.id, newLocation, `棚移動: ${item.location} → ${newLocation}`);

      showToast({
        type: 'success',
        title: '商品移動完了',
        message: `${item.name} を ${newLocation} に移動しました`
      });

      onClose();
    } catch (error) {
      console.error('商品移動エラー:', error);
      showToast({
        type: 'error',
        title: '移動エラー',
        message: '商品の移動に失敗しました'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    console.log('棚番号入力変更:', value);
    setNewLocation(value);

    // バーコード読み込みを検出（通常は一度に全文字が入力される）
    if (value.length >= 5 && value.match(/^[A-Z]-\d+-\d+$/)) {
      console.log('バーコードパターン検出:', value);
      // 500ms後に確認画面に自動移行
      setTimeout(() => {
        if (value === newLocation) { // 値が変わっていない場合のみ
          console.log('自動確認画面移行:', value);
          setShowConfirmation(true);
        }
      }, 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      e.preventDefault();
      if (newLocation.trim()) {
        setShowConfirmation(true);
      }
    }
  };

  const handleConfirm = () => {
    handleSubmit();
  };

  const handleBack = () => {
    setShowConfirmation(false);
    setTimeout(() => {
      if (locationInputRef.current) {
        locationInputRef.current.focus();
      }
    }, 100);
  };

  if (showConfirmation) {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={() => handleBack()}
        title="移動確認"
        size="lg"
      >
        <div className="space-y-6">
          {/* 警告アイコンと重要メッセージ */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-900 mb-2">
                  重要：商品を確実に移動してください
                </h3>
                <p className="text-yellow-800 font-medium">
                  実際に商品を新しい棚に移動しましたか？
                </p>
              </div>
            </div>
          </div>

          {/* 商品と棚の情報 - 強調表示 */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 space-y-4">
            <div className="border-b-2 border-blue-200 pb-4">
              <h4 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 21h6" />
                </svg>
                商品情報
              </h4>
              <div className="space-y-2">
                <div className="text-base">
                  <span className="text-gray-700 font-medium">SKU:</span>
                  <span className="font-bold text-blue-800 text-lg ml-2">{item.sku}</span>
                </div>
                <div className="text-base">
                  <span className="text-gray-700 font-medium">商品名:</span>
                  <span className="font-bold text-blue-800 text-lg ml-2">{item.name}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                移動先情報
              </h4>
              <div className="space-y-2">
                <div className="text-base">
                  <span className="text-gray-700 font-medium">移動元:</span>
                  <span className="font-bold text-red-700 text-lg ml-2">{item.location}</span>
                </div>
                <div className="text-base">
                  <span className="text-gray-700 font-medium">移動先:</span>
                  <span className="font-bold text-green-800 text-xl ml-2 bg-green-100 px-2 py-1 rounded">{newLocation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 警告メッセージ */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">注意事項</p>
                <p>間違った棚に移動すると、多数の在庫の中から商品を探し出すことが極めて困難になります。</p>
                <p className="mt-1">必ず<span className="font-bold">物理的に商品を新しい棚に移動してから</span>「はい、移動しました」を選択してください。</p>
              </div>
            </div>
          </div>

          {/* 3択ボタン */}
          <div className="flex flex-col gap-3">
            <NexusButton
              onClick={handleConfirm}
              variant="primary"
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={isSubmitting}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isSubmitting ? '移動登録中...' : 'はい、移動しました'}
            </NexusButton>

            <NexusButton
              onClick={handleBack}
              variant="secondary"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              スキャンをやり直す
            </NexusButton>

            <NexusButton
              onClick={onClose}
              variant="outline"
              size="lg"
              className="w-full text-red-600 border-red-300 hover:bg-red-50"
              disabled={isSubmitting}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              処理を中止する
            </NexusButton>
          </div>
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="商品移動"
      subtitle={`${item.name} (${item.sku})`}
      size="md"
    >
      <div className="space-y-6">
        {/* 現在の保管場所 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800 mb-2">
            <span className="font-medium">現在の保管場所</span>
          </div>
          <p className="text-yellow-700 text-lg font-mono">{item.location}</p>
        </div>

        {/* 移動先入力 */}
        <div className="space-y-4">
          <NexusInput
            ref={locationInputRef}
            type="text"
            label="新しい棚番号"
            placeholder="例: A-1-5, B-2-3"
            value={newLocation}
            onChange={handleLocationChange}
            onKeyDown={handleKeyDown}
            required
            className="text-lg font-mono"
          />

          <div className="text-sm text-nexus-text-secondary">
            <p>• バーコードスキャンで自動確認画面に移動</p>
            <p>• 手動入力後 Enter キーで確認画面に移動</p>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex justify-end gap-3 pt-6 border-t border-nexus-border">
          <NexusButton
            type="button"
            onClick={onClose}
            variant="default"
          >
            キャンセル
          </NexusButton>

          <NexusButton
            onClick={() => {
              console.log('確認画面へボタン押下:', { newLocation, showConfirmation });
              console.log('setShowConfirmation(true) 実行中');
              setShowConfirmation(true);
              console.log('setShowConfirmation(true) 実行完了');
            }}
            variant="primary"
            disabled={!newLocation.trim()}
          >
            確認画面へ {!newLocation.trim() && '(無効)'}
          </NexusButton>
        </div>
      </div>
    </BaseModal>
  );
}