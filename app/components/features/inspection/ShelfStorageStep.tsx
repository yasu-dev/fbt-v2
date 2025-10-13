'use client';

import { useState, useRef, useEffect } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusInput from '@/app/components/ui/NexusInput';
import BaseModal from '@/app/components/ui/BaseModal';
import { ExclamationTriangleIcon, InformationCircleIcon, CheckIcon, MapPinIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

interface ShelfStorageStepProps {
  productId: string;
  product: {
    id: string;
    name: string;
    sku: string;
    brand: string;
    model: string;
  };
  onComplete: (locationId: string) => void;
  onPrev: () => void;
  onSaveAndReturn: () => void;
  onCancel?: () => void;
  loading: boolean;
}

interface StorageLocation {
  id: string;
  code: string;
  name: string;
  zone: string;
  capacity: number;
  currentCount: number;
}

export default function ShelfStorageStep({
  productId,
  product,
  onComplete,
  onPrev,
  onSaveAndReturn,
  onCancel,
  loading
}: ShelfStorageStepProps) {
  const { showToast } = useToast();
  const [scannedLocation, setScannedLocation] = useState<string>('');
  const [locationData, setLocationData] = useState<StorageLocation | null>(null);
  const [isValidatingLocation, setIsValidatingLocation] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingLocationData, setPendingLocationData] = useState<StorageLocation | null>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // ステップ表示時に棚番号入力へ自動フォーカス
  useEffect(() => {
    // DOM準備完了を待ってからフォーカス設定
    const setFocus = () => {
      if (locationInputRef.current) {
        console.log('[棚保管] 棚番号入力フィールドにフォーカス設定');
        locationInputRef.current.focus();
        
        // 既存値があれば選択して上書きしやすくする
        try {
          const inputEl = locationInputRef.current as HTMLInputElement;
          if (inputEl.value) {
            inputEl.select();
          }
        } catch (_) {
          // no-op
        }
      } else {
        console.warn('[棚保管] 棚番号入力フィールドが見つかりません');
      }
    };

    // 少し遅延してからフォーカスを設定（DOM準備完了を待つ）
    const timer = setTimeout(setFocus, 100);
    
    // さらに確実にするため、複数回試行
    const timer2 = setTimeout(setFocus, 300);
    const timer3 = setTimeout(setFocus, 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // バーコードスキャナは入力欄に直接入力する前提のため、
  // 専用UIやフローは持たず、入力欄に集約する

  // 棚番号の手動入力
  const handleLocationInput = (locationCode: string) => {
    setScannedLocation(locationCode);
    if (!locationCode.trim()) {
      setLocationData(null);
    }
  };

  // Enterキーでの確認ダイアログ表示
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && scannedLocation.trim().length > 0 && !loading) {
      handleLocationScanned();
    }
  };

  // 棚番号の検証
  const validateLocation = async (locationCode: string): Promise<StorageLocation | null> => {
    try {
      setIsValidatingLocation(true);
      
      const response = await fetch(`/api/locations/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationCode })
      });

      if (!response.ok) {
        throw new Error('棚番号の検証に失敗しました');
      }

      const location = await response.json();
      console.log('[SUCCESS] ロケーション検証成功:', location);
      setLocationData(location);
      
      // 容量チェック
      if (location.capacity && location.currentCount >= location.capacity) {
        showToast({
          type: 'warning',
          title: '棚容量不足',
          message: `棚 ${location.name} は満杯です。別の棚を選択してください。`,
          duration: 4000
        });
        return null;
      }

      showToast({
        type: 'success',
        title: '棚番号確認',
        message: `棚 ${location.name} (${location.zone}ゾーン) を確認しました。保管完了ボタンを押してください。`,
        duration: 3000
      });
      return location;
    } catch (error) {
      console.error('Location validation error:', error);
      setLocationData(null);
      showToast({
        type: 'error',
        title: '棚番号エラー',
        message: error instanceof Error ? error.message : '棚番号の検証中にエラーが発生しました',
        duration: 4000
      });
      return null;
    } finally {
      setIsValidatingLocation(false);
    }
  };

  // 棚番号スキャン後の処理
  const handleLocationScanned = async () => {
    const code = scannedLocation.trim();
    
    if (!code) {
      showToast({
        type: 'warning',
        title: '保管場所未入力',
        message: '棚番号をスキャンまたは入力してください。',
        duration: 3000
      });
      return;
    }

    // 棚番号の検証
    const validatedLocation = await validateLocation(code);
    if (!validatedLocation) {
      return; // 検証失敗時は処理を中断
    }

    // 確認ダイアログ用にデータを保存
    setPendingLocationData(validatedLocation);
    setShowConfirmDialog(true);
  };

  // 実際の保管処理
  const executeStorage = async (location: StorageLocation) => {

    try {
      // 保管処理を実行
      console.log('🚀 保管完了リクエスト送信:', {
        productId: productId,
        locationId: location.id,
        locationCode: location.code
      });

      const response = await fetch('/api/products/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productId,
          locationId: location.id,
          locationCode: location.code
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '不明なエラー' }));
        console.error('[ERROR] 保管完了APIエラー:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          sentData: {
            productId: productId,
            locationId: location.id,
            locationCode: location.code
          }
        });
        
        // 詳細なエラー情報があれば表示
        if (errorData.details) {
          console.error('[DETAILS] エラー詳細:', errorData.details);
        }
        if (errorData.code) {
          console.error('[CODE] エラーコード:', errorData.code);
        }
        if (errorData.stack) {
          console.error('[STACK] スタックトレース:', errorData.stack);
        }
        
        throw new Error(errorData.error || `保管処理に失敗しました (${response.status})`);
      }

      // 成功時の即座フィードバック
      showToast({
        type: 'success',
        title: '保管完了',
        message: `${product.name} を ${location.name} に保管しました。検品一覧に戻ります...`,
        duration: 1500
      });

      // 完了処理を呼び出し
      onComplete(location.id);
      
    } catch (error) {
      console.error('Storage completion error:', error);
      showToast({
        type: 'error',
        title: '保管エラー',
        message: error instanceof Error ? error.message : '保管処理中にエラーが発生しました',
        duration: 4000
      });
    }
  };

  // 確認ダイアログでの選択処理
  const handleConfirmChoice = async (choice: 'confirm' | 'retry' | 'cancel') => {
    if (choice === 'confirm') {
      // 「はい、保管しました」を選択
      if (pendingLocationData) {
        setShowConfirmDialog(false);
        await executeStorage(pendingLocationData);
      }
    } else if (choice === 'retry') {
      // 「スキャンのやり直し」を選択
      setShowConfirmDialog(false);
      setPendingLocationData(null);
      setScannedLocation('');
      setLocationData(null);
      
      // 入力フィールドに再フォーカス
      setTimeout(() => {
        if (locationInputRef.current) {
          locationInputRef.current.focus();
        }
      }, 100);
      
      showToast({
        type: 'info',
        title: 'スキャンをやり直してください',
        message: '棚番号を再度スキャンまたは入力してください',
        duration: 3000
      });
    } else {
      // 「処理を中止」を選択
      setShowConfirmDialog(false);
      setPendingLocationData(null);
      
      showToast({
        type: 'warning',
        title: '保管処理を中止しました',
        message: '商品の保管がキャンセルされました',
        duration: 3000
      });
    }
  };

  // 入力フィールドにフォーカス（モーダル/画面表示時）
  // スキャナはフォーカスされた入力欄へ自動で文字列を入力する前提

  return (
    <>
      <div className="space-y-6">
      <NexusCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">棚保管</h3>
        <p className="text-sm text-gray-600 mb-6">
          梱包・ラベル貼り付けが完了した商品を棚に保管します。棚のバーコードをスキャンして保管場所を登録してください。
        </p>

        {/* 商品情報表示 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2">保管対象商品</h4>
          <div className="text-sm space-y-1">
            <div><strong>SKU:</strong> {product.sku}</div>
            <div><strong>商品名:</strong> {product.name}</div>
          </div>
        </div>

        {/* 単一の入力欄（スキャン／直接入力の双方に対応） */}
        <div className="space-y-4">
          <div>
            <NexusInput
              ref={locationInputRef}
              value={scannedLocation}
              onChange={(e) => handleLocationInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="棚番号をスキャンまたは入力してください（例: A-01-001）"
              autoFocus
              disabled={isValidatingLocation || loading}
              className="w-full"
            />
            {isValidatingLocation && (
              <p className="text-sm text-blue-600 mt-2">棚番号を確認中...</p>
            )}
          </div>

          {/* 棚情報表示 */}
          {locationData && (
            <NexusCard className="p-4 bg-green-50 border-green-200">
              <h5 className="text-sm font-medium text-green-900 mb-2">✓ 保管先確認済み</h5>
              <div className="text-sm space-y-1 text-green-800">
                <div><strong>棚番号:</strong> {locationData.code}</div>
                <div><strong>棚名:</strong> {locationData.name}</div>
                <div><strong>ゾーン:</strong> {locationData.zone}</div>
                <div><strong>容量:</strong> {locationData.currentCount + 1}/{locationData.capacity}</div>
              </div>
              <div className="mt-3 text-sm text-green-700 bg-green-100 p-2 rounded">
                <strong>準備完了:</strong> 「保管場所を確認」ボタンで確認画面に進みます
              </div>
            </NexusCard>
          )}
        </div>
      </NexusCard>

      {/* 作業完了の注意事項 */}
      <NexusCard className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-yellow-900 mb-1">重要</h4>
            <p className="text-sm text-yellow-800">
              「保管場所を確認」ボタンを押すと、保管確認画面が表示されます。
              実際に商品を棚に配置してから「はい、保管しました」を選択してください。
              複数商品を同時に進行している場合は、「保存して一覧に戻る」で他の商品の作業を続けることができます。
            </p>
          </div>
        </div>
      </NexusCard>

      {/* ナビゲーションボタン */}
      <div className="flex justify-between">
        <div className="flex gap-3">
          {onCancel && (
            <NexusButton
              onClick={onCancel}
              variant="outline"
              size="lg"
              disabled={loading}
            >
              キャンセル（一覧に戻る）
            </NexusButton>
          )}
          <NexusButton
            onClick={onPrev}
            variant="secondary"
            size="lg"
            disabled={loading}
          >
            戻る
          </NexusButton>
          <NexusButton
            onClick={onSaveAndReturn}
            variant="outline"
            size="lg"
            disabled={loading}
          >
            {loading ? '保存中...' : '保存して一覧に戻る'}
          </NexusButton>
        </div>
        <NexusButton
          onClick={handleLocationScanned}
          variant="primary"
          size="lg"
          disabled={!(scannedLocation.trim().length > 0) || loading}
        >
          {loading ? '確認中...' : '保管場所を確認'}
        </NexusButton>
      </div>

      {/* 確認ダイアログ */}
      <BaseModal
        isOpen={showConfirmDialog}
        onClose={() => handleConfirmChoice('cancel')}
        title="保管確認"
        size="lg"
      >
        <div className="space-y-6">
          {/* 警告アイコンと重要メッセージ */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-900 mb-2">
                  重要：商品を確実に保管してください
                </h3>
                <p className="text-yellow-800 font-medium">
                  実際に商品を棚に配置しましたか？
                </p>
              </div>
            </div>
          </div>

          {/* 商品と棚の情報 - 強調表示 */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 space-y-4">
            <div className="border-b-2 border-blue-200 pb-4">
              <h4 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                <InformationCircleIcon className="w-5 h-5" />
                商品情報
              </h4>
              <div className="space-y-2">
                <div className="text-base">
                  <span className="text-gray-700 font-medium">SKU:</span> 
                  <span className="font-bold text-blue-800 text-lg ml-2">{product.sku}</span>
                </div>
                <div className="text-base">
                  <span className="text-gray-700 font-medium">商品名:</span> 
                  <span className="font-bold text-blue-800 text-lg ml-2">{product.name}</span>
                </div>
              </div>
            </div>
            
            {pendingLocationData && (
              <div>
                <h4 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5" />
                  保管先情報
                </h4>
                <div className="space-y-2">
                  <div className="text-base">
                    <span className="text-gray-700 font-medium">棚番号:</span> 
                    <span className="font-bold text-green-800 text-xl ml-2 bg-green-100 px-2 py-1 rounded">{pendingLocationData.code}</span>
                  </div>
                  <div className="text-base">
                    <span className="text-gray-700 font-medium">棚名:</span> 
                    <span className="font-bold text-green-800 text-lg ml-2">{pendingLocationData.name}</span>
                  </div>
                  <div className="text-base">
                    <span className="text-gray-700 font-medium">ゾーン:</span> 
                    <span className="font-bold text-green-800 text-lg ml-2">{pendingLocationData.zone}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 警告メッセージ */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">注意事項</p>
                <p>間違った棚に保管すると、多数の在庫の中から商品を探し出すことが極めて困難になります。</p>
                <p className="mt-1">必ず<span className="font-bold">物理的に商品を棚に配置してから</span>「はい、保管しました」を選択してください。</p>
              </div>
            </div>
          </div>

          {/* 3択ボタン */}
          <div className="flex flex-col gap-3">
            <NexusButton
              onClick={() => handleConfirmChoice('confirm')}
              variant="primary"
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckIcon className="w-5 h-5 mr-2" />
              はい、保管しました
            </NexusButton>
            
            <NexusButton
              onClick={() => handleConfirmChoice('retry')}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              スキャンをやり直す
            </NexusButton>
            
            <NexusButton
              onClick={() => handleConfirmChoice('cancel')}
              variant="outline"
              size="lg"
              className="w-full text-red-600 border-red-300 hover:bg-red-50"
            >
              <XMarkIcon className="w-5 h-5 mr-2" />
              処理を中止する
            </NexusButton>
          </div>
        </div>
      </BaseModal>
      </div>
    </>
  );
}