'use client';

import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { BaseModal, NexusButton, NexusInput, NexusSelect, NexusTextarea, NexusLoadingSpinner } from './ui';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'product' | 'task' | 'customer';
  title: string;
  data: Record<string, any>;
}

export default function EditModal({ isOpen, onClose, type, title, data }: EditModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState(data);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const [staffOptions, setStaffOptions] = useState<{ value: string; label: string }[]>([
    { value: '', label: '選択してください' }
  ]);

  useEffect(() => {
    let mounted = true;
    const loadStaff = async () => {
      try {
        const res = await fetch('/api/user/staff', { credentials: 'include' });
        if (!mounted || !res.ok) return;
        const data = await res.json();
        if (data?.success && Array.isArray(data.staff)) {
          setStaffOptions([
            { value: '', label: '選択してください' },
            ...data.staff.map((s: any) => ({ value: s.id, label: s.name }))
          ]);
        }
      } catch {}
    };
    loadStaff();
    return () => { mounted = false; };
  }, []);

  // スクロール位置のリセット
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // バリデーション
      const validationResult = validateFormData(type, formData);
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
      const apiEndpoint = getApiEndpoint(type);
      const response = await fetch(apiEndpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formData.id,
          ...formData,
          lastModified: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`保存に失敗しました: ${response.status}`);
      }

      const result = await response.json();
      
      showToast({
        type: 'success',
        title: '保存完了',
        message: `${title}を正常に更新しました。本番環境では実際にデータが保存されます。`,
        duration: 3000
      });
      
      onClose();
      
      // 本番運用では親コンポーネントの状態を更新
      // 実際のアプリでは onUpdate コールバックを呼び出し
      
    } catch (error) {
      console.error('保存エラー:', error);
      showToast({
        type: 'error',
        title: '保存失敗',
        message: error instanceof Error ? error.message : '保存中にエラーが発生しました',
        duration: 4000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // バリデーション関数
  const validateFormData = (type: string, data: Record<string, any>) => {
    const errors: string[] = [];

    if (type === 'product') {
      if (!data.name?.trim()) errors.push('商品名は必須です');
      if (!data.sku?.trim()) errors.push('SKUは必須です');
      if (!data.category?.trim()) errors.push('カテゴリーは必須です');
      if (!data.price || isNaN(Number(data.price)) || Number(data.price) <= 0) {
        errors.push('正しい価格を入力してください');
      }
    } else if (type === 'task') {
      if (!data.title?.trim()) errors.push('タスク名は必須です');
      if (!data.category?.trim()) errors.push('カテゴリーは必須です');
      if (!data.assignee?.trim()) errors.push('担当者は必須です');
      if (!data.dueDate) errors.push('期限は必須です');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // API エンドポイント取得関数
  const getApiEndpoint = (type: string) => {
    switch (type) {
      case 'product':
        return '/api/inventory';
      case 'task':
        return '/api/staff/tasks';
      case 'customer':
        return '/api/customers';
      default:
        return '/api/generic';
    }
  };

  const renderProductForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NexusInput
          label="商品名"
          type="text"
          value={formData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
        />
        <NexusInput
          label="SKU"
          type="text"
          value={formData.sku || ''}
          onChange={(e) => handleInputChange('sku', e.target.value)}
        />
        <NexusSelect
          label="カテゴリー"
          value={formData.category || ''}
          onChange={(e) => handleInputChange('category', e.target.value)}
          options={[
            { value: "", label: "選択してください" },
            { value: "カメラ", label: "カメラ" },
            { value: "時計", label: "時計" },
            { value: "バッグ", label: "バッグ" },
            { value: "ジュエリー", label: "ジュエリー" }
          ]}
        />
        <NexusInput
          label="価格"
          type="number"
          value={formData.price || ''}
          onChange={(e) => handleInputChange('price', e.target.value)}
        />
        <NexusInput
          label="在庫数"
          type="number"
          value={formData.stock || ''}
          onChange={(e) => handleInputChange('stock', e.target.value)}
        />
        <NexusInput
          label="保管場所"
          type="text"
          value={formData.location || ''}
          onChange={(e) => handleInputChange('location', e.target.value)}
        />
      </div>
      <NexusTextarea
        label="商品説明"
        value={formData.description || ''}
        onChange={(e) => handleInputChange('description', e.target.value)}
        rows={3}
      />
    </div>
  );

  const renderTaskForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NexusInput
          label="タスク名"
          type="text"
          value={formData.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
        />
        <NexusSelect
          label="カテゴリー"
          value={formData.category || ''}
          onChange={(e) => handleInputChange('category', e.target.value)}
          options={[
            { value: "", label: "選択してください" },
            { value: "inspection", label: "検品" },
            { value: "shipping", label: "出荷" },
            { value: "returns", label: "返品処理" },

          ]}
        />
        <NexusSelect
          label="担当者"
          value={formData.assignee || ''}
          onChange={(e) => handleInputChange('assignee', e.target.value)}
          options={staffOptions}
        />
        <NexusInput
          label="期限"
          type="date"
          value={formData.dueDate || ''}
          onChange={(e) => handleInputChange('dueDate', e.target.value)}
        />

        <NexusSelect
          label="ステータス"
          value={formData.status || ''}
          onChange={(e) => handleInputChange('status', e.target.value)}
          options={[
            { value: "", label: "選択してください" },
            { value: "pending", label: "未開始" },
            { value: "in_progress", label: "進行中" },
            { value: "completed", label: "完了" },
            { value: "cancelled", label: "キャンセル" }
          ]}
        />
      </div>
      <NexusTextarea
        label="詳細説明"
        value={formData.description || ''}
        onChange={(e) => handleInputChange('description', e.target.value)}
        rows={3}
      />
    </div>
  );

  const renderForm = () => {
    switch (type) {
      case 'product':
        return renderProductForm();
      case 'task':
        return renderTaskForm();
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">このタイプの編集フォームは実装されていません</p>
          </div>
        );
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${title}の編集`}
      size="xl"
    >
      <form id="edit-form" onSubmit={handleSubmit} className="flex flex-col h-full">
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6">
          {renderForm()}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-nexus-border">
          <NexusButton
            variant="default"
            size="md"
            onClick={onClose}
          >
            キャンセル
          </NexusButton>
          <NexusButton
            variant="primary"
            size="md"
            onClick={() => document.getElementById('edit-form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <NexusLoadingSpinner size="sm" />
                <span>保存中...</span>
              </div>
            ) : (
              '保存'
            )}
          </NexusButton>
        </div>
      </form>
    </BaseModal>
  );
}