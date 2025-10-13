'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import PhotoUploader from './PhotoUploader';
import PhotographyRequestDisplay from '@/app/components/features/photography/PhotographyRequestDisplay';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';

export interface PhotographyOnlyFormProps {
  productId: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  model: string;
  status: string;
  imageUrl?: string;
  deliveryPlanInfo?: {
    deliveryPlanId: string;
    deliveryPlanProductId: string;
    condition?: string;
    purchasePrice?: number;
    purchaseDate?: string;
    supplier?: string;
    supplierDetails?: string;
    photographyRequests?: {
      specialPhotography: boolean;
      specialPhotographyItems: string[];
      customRequests: string;
    } | null;
    images: any[];
  };
}

export default function PhotographyOnlyForm({ productId }: PhotographyOnlyFormProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // 商品情報を実際のAPIから取得
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const productData = await response.json();
          setProduct(productData);
        } else {
          console.error('Failed to fetch product data:', response.statusText);
          showToast('商品データの取得に失敗しました', 'error');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        showToast('商品データの取得中にエラーが発生しました', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, showToast]);

  const handlePhotosUpdate = (newPhotos: string[], photoSlots?: any[]) => {
    console.log('写真データ更新:', newPhotos, '配置情報:', photoSlots);
    setPhotos(newPhotos);
    // 配置情報も保存（必要に応じて）
  };

  const handleSubmitPhotography = async () => {
    try {
      setSubmitting(true);
      console.log('撮影完了処理開始 - 写真数:', photos.length);

      // 改善：撮影専用モードでは写真0枚でも完了可能
      // 写真がない場合は確認メッセージを表示するが、処理は続行

      // 撮影データを送信
      const photographyData = {
        productId,
        photos,
        photoSlots: [], // 撮影専用モードでは配置情報は空
        notes,
        photographyDate: new Date().toISOString(),
      };

      console.log('撮影データ送信:', photographyData);

      // 撮影データをAPIに送信
      const response = await fetch(`/api/products/${productId}/photography`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photographyData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('撮影API エラーレスポンス:', response.status, errorText);
        const errorData = errorText ? JSON.parse(errorText) : {};
        throw new Error(errorData.message || `撮影データの保存に失敗しました: ${response.status}`);
      }

      const savedData = await response.json();
      console.log('撮影データ保存完了:', savedData);

      // 検品進捗を最終ステップに更新（撮影APIでもステータス更新済み）
      const progressPayload = {
        productId,
        currentStep: 4,  // 撮影完了で最終ステップ
        checklist: {},
        photos: photos,
        photoSlots: [], // 撮影専用モードでは配置情報は空
        notes: notes,
        status: 'completed'
      };
      console.log('進捗更新データ:', progressPayload);

      const progressResponse = await fetch('/api/products/inspection/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progressPayload)
      });

      if (progressResponse.ok) {
        const progressResult = await progressResponse.json();
        console.log('撮影完了後の進捗更新完了:', progressResult);
      } else {
        const progressError = await progressResponse.text();
        console.warn('進捗更新エラー:', progressResponse.status, progressError);
        console.warn('進捗更新は失敗しましたが、撮影データ保存は成功しました');
      }

      showToast({
        type: 'success',
        title: photos.length > 0 ? '撮影完了' : '撮影作業完了',
        message: photos.length > 0 
          ? `撮影が完了しました。商品は出品準備完了状態になりました。`
          : `撮影作業が完了しました（写真：${photos.length}枚）。商品は出品準備完了状態になりました。`,
        duration: 4000
      });

      // 適切な画面に戻る
      setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('from') === 'inventory') {
          // 在庫画面から来た場合は状態復元フラグ付きで在庫画面に戻る
          window.location.href = '/staff/inventory?restored=1';
        } else {
          // その他の場合は検品一覧に戻る（状態復元フラグ付き）
          window.location.href = '/staff/inspection?restored=1';
        }
      }, 2000);

    } catch (error) {
      console.error('[ERROR] Photography submission:', error);
      showToast({
        type: 'error',
        title: '撮影保存エラー',
        message: error instanceof Error ? error.message : '撮影データの保存中にエラーが発生しました',
        duration: 4000
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from') === 'inventory') {
      // 在庫画面から来た場合は状態復元フラグ付きで在庫画面に戻る
      window.location.href = '/staff/inventory?restored=1';
    } else {
      // その他の場合は検品一覧に戻る（状態復元フラグ付き）
      window.location.href = '/staff/inspection?restored=1';
    }
  };

  if (loading && !product) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-b-4 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <NexusCard className="p-6 text-center">
        <p className="text-gray-500">商品が見つかりません</p>
      </NexusCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* 商品情報カード */}
      <NexusCard className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <img
              src={product.imageUrl || '/api/placeholder/400/300'}
              alt={product.name}
              className="w-full rounded-lg"
            />
          </div>
          <div className="md:w-2/3 space-y-2">
            <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">SKU:</span>
                <span className="ml-2 font-medium">{product.sku}</span>
              </div>
              <div>
                <span className="text-gray-600">ブランド:</span>
                <span className="ml-2 font-medium">{product.brand}</span>
              </div>
              <div>
                <span className="text-gray-600">モデル:</span>
                <span className="ml-2 font-medium">{product.model}</span>
              </div>
              <div>
                <span className="text-gray-600">カテゴリ:</span>
                <span className="ml-2 font-medium">
                  {product.category === 'camera_body' ? 'カメラボディ' : product.category}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <div className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full inline-block">
                検品完了済み - 撮影のみ実施
              </div>
            </div>
          </div>
        </div>
      </NexusCard>

      {/* 撮影要望表示 */}
      <PhotographyRequestDisplay 
        photographyRequests={product.deliveryPlanInfo?.photographyRequests || null}
        className="mb-6"
      />

      {/* 撮影説明 */}
      <NexusCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">撮影について</h3>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800 mb-3">
            この商品は検品が完了しており、撮影のみを行います。
          </p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 商品の全体像が分かる写真を撮影してください</li>
            <li>• 特徴的な部分や付属品も含めて撮影してください</li>
            <li>• 十分な照明を確保してください</li>
          </ul>
        </div>
      </NexusCard>

      {/* 撮影エリア */}
      <PhotoUploader
        productId={productId}
        photos={photos}
        onUpdate={handlePhotosUpdate}
        onNext={handleSubmitPhotography} // 次へボタンで撮影完了処理
        onPrev={handleGoBack} // 戻るボタンで一覧に戻る
        onSaveAndReturn={handleSubmitPhotography} // 保存して一覧に戻る
        category={product.category}
        loading={submitting}
        nextButtonText="次へ（撮影完了）"
        mode="photography"
      />

      {/* 撮影メモ */}
      <NexusCard className="p-6">
        <h4 className="text-lg font-semibold mb-4">撮影メモ（任意）</h4>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="撮影時の特記事項があれば記入してください..."
        />
      </NexusCard>

      {/* PhotoUploaderがナビゲーションボタンを提供するため、独自ボタンは削除 */}
    </div>
  );
}