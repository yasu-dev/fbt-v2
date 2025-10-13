'use client';

import { useState, useRef, useEffect } from 'react';
import { BaseModal, NexusButton, NexusInput, NexusSelect, NexusTextarea, NexusCard, BusinessStatusIndicator } from './ui';
import { useToast } from './features/notifications/ToastProvider';
import { CheckIcon, XMarkIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  status: string;
  price: number;
  stock: number;
  location: string;
  description?: string;
  images?: string[];
  specifications?: Record<string, string>;
  history?: Array<{
    date: string;
    action: string;
    user: string;
    details: string;
  }>;
}

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { showToast } = useToast();

  // スクロール位置のリセット
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  const handleEditProduct = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      // フォームデータの取得をシミュレート
      const editData = {
        id: product?.id,
        name: '更新された商品名', // 実際はフォームから取得
        category: '更新されたカテゴリ', // 実際はフォームから取得
        description: '更新された商品説明', // 実際はフォームから取得
        updatedAt: new Date().toISOString()
      };
      
      // バリデーション
      if (!editData.name || !editData.category) {
        showToast({
          title: 'バリデーションエラー',
          message: '商品名とカテゴリは必須項目です',
          type: 'warning'
        });
        return;
      }
      
      // API呼び出しシミュレーション
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 商品データの更新をシミュレート
      const updatedProduct = {
        ...product,
        ...editData
      };
      
      // ローカルストレージに保存（永続化）
      const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
      const updatedProducts = existingProducts.map((p: any) => 
        p.id === product?.id ? updatedProduct : p
      );
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      
      // 成功メッセージ
      showToast({
        title: '更新完了',
        message: '商品情報を正常に更新しました',
        type: 'success'
      });
      
      setIsEditModalOpen(false);
      // 商品更新ログを記録
      const updateLog = {
        action: 'product_updated',
        timestamp: new Date().toISOString(),
        productId: updatedProduct.id,
        user: 'current_user',
        changes: Object.keys(updatedProduct)
      };
      const logs = JSON.parse(localStorage.getItem('productUpdateLogs') || '[]');
      logs.push(updateLog);
      localStorage.setItem('productUpdateLogs', JSON.stringify(logs));
      
    } catch (error) {
      console.error('商品更新エラー:', error);
      showToast({
        title: '更新エラー',
        message: '商品情報の更新に失敗しました。もう一度お試しください。',
        type: 'error'
      });
    }
  };

  if (!isOpen || !product) return null;

  // メタデータから実際の情報を取得
  const getMetadata = () => {
    try {
      if (product.metadata) {
        return typeof product.metadata === 'string'
          ? JSON.parse(product.metadata)
          : product.metadata;
      }
    } catch (error) {
      console.warn('メタデータ解析エラー:', error);
    }
    return {};
  };

  const metadata = getMetadata();

  // 実際の履歴データを取得（API呼び出しまたはメタデータから）
  const getProductHistory = () => {
    const history = [];

    if (product.entryDate) {
      history.push({
        date: new Date(product.entryDate).toLocaleString('ja-JP'),
        action: '入庫',
        user: 'システム',
        details: '商品受入完了'
      });
    }

    if (product.inspectedAt && product.inspectedBy) {
      history.push({
        date: new Date(product.inspectedAt).toLocaleString('ja-JP'),
        action: '検品',
        user: product.inspectedBy,
        details: product.inspectionNotes || '検品完了'
      });
    }

    if (metadata.photographyDate) {
      history.push({
        date: new Date(metadata.photographyDate).toLocaleString('ja-JP'),
        action: '撮影',
        user: metadata.photographyBy || 'スタッフ',
        details: '商品撮影完了'
      });
    }

    if (product.updatedAt) {
      history.push({
        date: new Date(product.updatedAt).toLocaleString('ja-JP'),
        action: '更新',
        user: 'システム',
        details: '商品情報更新'
      });
    }

    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // 実際の仕様データを取得
  const getProductSpecs = () => {
    const specs = {};

    if (product.category) {
      const categoryLabels = {
        camera: 'カメラ',
        watch: '腕時計',
        other: 'その他'
      };
      specs['カテゴリー'] = categoryLabels[product.category] || product.category;
    }

    if (product.condition) {
      const conditionLabels = {
        new: '新品',
        like_new: '新品同様',
        excellent: '優良',
        very_good: '美品',
        good: '良好',
        fair: '普通',
        poor: '要修理'
      };
      specs['コンディション'] = conditionLabels[product.condition] || product.condition;
    }

    if (metadata.packaging?.weight) {
      const weight = parseFloat(metadata.packaging.weight);
      const unit = metadata.packaging.weightUnit || 'kg';
      specs['重量'] = `${weight.toFixed(1)}${unit}`;
    }

    if (metadata.packaging?.dimensions) {
      specs['サイズ'] = metadata.packaging.dimensions;
    }

    if (product.sku) {
      specs['SKU'] = product.sku;
    }

    if (product.currentLocation) {
      specs['保管場所'] = product.currentLocation.code || product.currentLocation;
    }

    return specs;
  };

  const productHistory = getProductHistory();
  const productSpecs = getProductSpecs();

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
              title={product.name || '商品詳細'}
      size="xl"
      className="max-h-[90vh] overflow-hidden"
    >
      <div className="p-6">
        <div className="mb-4">
            <p className="text-sm text-nexus-text-secondary">
              SKU: {product.sku || '不明'}
            </p>
            {(() => {
              try {
                const md = (product as any).metadata ? (typeof (product as any).metadata === 'string' ? JSON.parse((product as any).metadata) : (product as any).metadata) : {};
                const serial = md?.serialNumber || md?.deliveryPlanInfo?.serialNumber;
                return serial ? (
                  <p className="text-sm text-nexus-text-secondary mt-1">
                    シリアル番号: <span className="font-mono">{serial}</span>
                  </p>
                ) : null;
              } catch {
                return null;
              }
            })()}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-nexus-border mb-6">
          {[
            { id: 'details', label: '詳細情報' },
            { id: 'specs', label: '仕様' },
            { id: 'history', label: '履歴' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-nexus-blue border-b-2 border-nexus-blue'
                  : 'text-nexus-text-secondary hover:text-nexus-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]" ref={scrollContainerRef}>
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      商品名
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white">{product.name || '商品名不明'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      カテゴリー
                    </label>
                    <p className="text-gray-900 dark:text-white">{product.category || 'カテゴリ不明'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      価格
                    </label>
                    <p className="text-2xl font-bold text-green-600">
                      ¥{(product.price || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      在庫数
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white">{(product.stock || 0)}点</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      保管場所
                    </label>
                    <p className="text-gray-900 dark:text-white">{product.location || 'ロケーション不明'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ステータス
                    </label>
                    <BusinessStatusIndicator
                      status={product.status}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* Image placeholder */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-nexus-text-primary mb-3">
                  商品画像
                </label>
                <div className="bg-nexus-bg-secondary rounded-lg h-64 flex items-center justify-center border border-nexus-border">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-nexus-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-nexus-text-secondary">画像データなし</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-nexus-text-primary mb-4">
                商品仕様
              </h3>
              <div className="holo-table">
                <table className="w-full">
                  <thead className="holo-header">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium">項目</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">詳細</th>
                    </tr>
                  </thead>
                  <tbody className="holo-body">
                    {Object.entries(productSpecs).map(([key, value]) => (
                      <tr key={key} className="holo-row">
                        <td className="py-3 px-4">
                          <span className="font-medium text-nexus-text-secondary">{key}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-nexus-text-primary">{value}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-nexus-text-primary mb-4">
                商品履歴
              </h3>
              <div className="holo-table">
                <table className="w-full">
                  <thead className="holo-header">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium">アクション</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">詳細</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">担当者</th>
                      <th className="text-right py-3 px-4 text-sm font-medium">日時</th>
                    </tr>
                  </thead>
                  <tbody className="holo-body">
                    {productHistory.length > 0 ? productHistory.map((item, index) => (
                      <tr key={index} className="holo-row">
                        <td className="py-3 px-4">
                          <span className="font-medium text-nexus-blue">{item.action}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-nexus-text-primary">{item.details === '詳細なし' ? '' : item.details}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-nexus-text-secondary">{item.user}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-nexus-text-secondary">{item.date}</span>
                        </td>
                      </tr>
                    )) : (
                      <tr className="holo-row">
                        <td colSpan={4} className="py-6 px-4 text-center text-nexus-text-secondary">
                          履歴データがありません
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <NexusButton
            onClick={onClose}
            variant="default"
          >
            閉じる
          </NexusButton>
          <NexusButton
            onClick={handleEditProduct}
            variant="primary"
          >
            編集
          </NexusButton>
        </div>
      </div>

      {/* Product Edit Modal */}
      <BaseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="商品情報編集"
        size="md"
      >
        <div className="space-y-6">
          <NexusInput
            type="text"
            label="商品名"
            defaultValue={product?.name}
            variant="nexus"
          />
          
          <NexusSelect
            label="カテゴリ"
            defaultValue={product?.category}
            variant="nexus"
            options={[
              { value: 'カメラ本体', label: 'カメラ本体' },
              { value: 'レンズ', label: 'レンズ' },
              { value: '時計', label: '時計' },
              { value: 'アクセサリー', label: 'アクセサリー' }
            ]}
          />
          
          <NexusTextarea
            label="商品説明"
            rows={3}
            placeholder="商品の詳細説明を入力"
            variant="nexus"
          />
          
          <div className="text-right space-x-2">
            <NexusButton onClick={() => setIsEditModalOpen(false)}>
              キャンセル
            </NexusButton>
            <NexusButton onClick={handleSaveEdit} variant="primary">
              保存
            </NexusButton>
          </div>
        </div>
      </BaseModal>
    </BaseModal>
  );
}