'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { BaseModal, NexusButton, NexusInput, NexusSelect, NexusTextarea } from '../ui';
import { useCategories } from '@/lib/hooks/useMasterData';

interface ProductRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: any) => void;
  initialData?: any;
}

export default function ProductRegistrationModal({ isOpen, onClose, onSubmit, initialData }: ProductRegistrationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'camera',
    condition: 'excellent',
    purchasePrice: '',
    sellingPrice: '',
    description: '',
    location: '',
    notes: ''
  });
  
  // 初期データがある場合はフォームに設定
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        name: initialData.name || '',
        sku: initialData.sku || '',
        category: initialData.category || '',
        condition: initialData.condition || 'excellent',
        purchasePrice: initialData.purchasePrice?.toString() || '',
        sellingPrice: initialData.value?.toString() || '',
        description: initialData.description || '',
        location: initialData.location || '',
        notes: initialData.notes || ''
      });
    }
  }, [initialData, isOpen]);

  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const { categories } = useCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // バリデーション
      const validationResult = validateProductData(formData);
      if (!validationResult.isValid) {
        showToast({
          type: 'warning',
          title: '入力エラー',
          message: validationResult.errors.join(', '),
          duration: 4000
        });
        setIsLoading(false);
        return;
      }

      // API呼び出し（本番運用と同じ処理）
      const response = await fetch('/api/inventory', {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(initialData ? { id: initialData.id } : {}),
          ...formData,
          price: Number(formData.sellingPrice),
          purchasePrice: Number(formData.purchasePrice),
          ...(initialData ? { updatedAt: new Date().toISOString() } : { createdAt: new Date().toISOString(), status: 'storage' })
        })
      });

      if (!response.ok) {
        throw new Error(`商品登録に失敗しました: ${response.status}`);
      }

      const result = await response.json();
      
      showToast({
        type: 'success',
        title: initialData ? '商品更新完了' : '商品登録完了',
        message: initialData ? `${formData.name}を正常に更新しました` : `${formData.name}を正常に登録しました。本番環境では在庫リストに追加されます。`,
        duration: 3000
      });

      // 親コンポーネントに通知
      onSubmit(result);
      
      // フォームリセット（新規登録の場合のみ）
      if (!initialData) {
        setFormData({
          name: '',
          sku: '',
          category: '',
          condition: 'excellent',
          purchasePrice: '',
          sellingPrice: '',
          description: '',
          location: '',
          notes: ''
        });
      }
      
      onClose();
      
    } catch (error) {
      console.error('商品登録エラー:', error);
      showToast({
        type: 'error',
        title: '登録失敗',
        message: error instanceof Error ? error.message : initialData ? '商品更新中にエラーが発生しました' : '商品登録中にエラーが発生しました',
        duration: 4000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // バリデーション関数
  const validateProductData = (data: typeof formData) => {
    const errors: string[] = [];

    if (!data.name.trim()) errors.push('商品名は必須です');
    if (!data.sku.trim()) errors.push('SKUは必須です');
    if (!data.category.trim()) errors.push('カテゴリーは必須です');
    if (!data.sellingPrice || isNaN(Number(data.sellingPrice)) || Number(data.sellingPrice) <= 0) {
      errors.push('正しい販売価格を入力してください');
    }
    if (data.purchasePrice && (isNaN(Number(data.purchasePrice)) || Number(data.purchasePrice) < 0)) {
      errors.push('正しい仕入価格を入力してください');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? '商品編集' : '新規商品登録'}
      size="md"
      className="max-w-2xl"
    >
      <div className="max-h-[90vh] overflow-y-auto">

        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">商品名 *</label>
              <NexusInput
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="例: Canon EOS R5 ボディ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
              <NexusInput
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                placeholder="例: TWD-CAM-001"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ *</label>
              <NexusSelect
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                options={[
                  { value: '', label: 'カテゴリを選択' },
                  ...categories
                    .filter((category) => ['camera', 'watch'].includes(category.key))
                    .map((category) => ({ value: category.key, label: category.nameJa }))
                ]}
              />
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状態 *</label>
              <NexusSelect
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
                options={[
                  { value: 'excellent', label: '優良' },
                  { value: 'good', label: '良好' },
                  { value: 'fair', label: '普通' },
                  { value: 'poor', label: '要修理' }
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">仕入価格 (円)</label>
              <NexusInput
                type="number"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">販売価格 (円)</label>
              <NexusInput
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">保管場所</label>
            <NexusInput
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="例: A-1-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">商品説明</label>
            <NexusTextarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="商品の詳細な説明を入力してください"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
            <NexusTextarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="内部メモや特記事項"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <NexusButton
              type="button"
              onClick={onClose}
              variant="secondary"
            >
              キャンセル
            </NexusButton>
            <NexusButton
              type="submit"
              disabled={isLoading}
              variant="primary"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  登録中...
                </div>
              ) : (
                initialData ? '更新' : '登録'
              )}
            </NexusButton>
          </div>
        </form>
      </div>
    </BaseModal>
  );
} 