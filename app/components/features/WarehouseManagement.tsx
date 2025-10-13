'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { useAlert } from '@/app/components/ui/AlertProvider';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusInput from '@/app/components/ui/NexusInput';
import NexusTextarea from '@/app/components/ui/NexusTextarea';
import BaseModal from '@/app/components/ui/BaseModal';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface WarehouseFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  notes: string;
}

export default function WarehouseManagement() {
  const { showToast } = useToast();
  const { showAlert } = useAlert();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState<WarehouseFormData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    notes: ''
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/delivery-warehouses');
      
      if (response.ok) {
        const data = await response.json();
        setWarehouses(data);
      } else {
        throw new Error('倉庫データの取得に失敗しました');
      }
    } catch (error) {
      console.error('倉庫データ取得エラー:', error);
      showAlert({
        type: 'error',
        title: '取得エラー',
        message: '倉庫データの取得に失敗しました。',
        actions: [
          {
            label: '再試行',
            action: () => fetchWarehouses(),
            variant: 'primary'
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWarehouse = () => {
    setEditingWarehouse(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      address: warehouse.address,
      phone: warehouse.phone || '',
      email: warehouse.email || '',
      notes: warehouse.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteWarehouse = (warehouse: Warehouse) => {
    showAlert({
      type: 'warning',
      title: '倉庫削除の確認',
      message: `倉庫「${warehouse.name}」を削除しますか？この操作は取り消せません。`,
      actions: [
        {
          label: '削除',
          action: () => confirmDeleteWarehouse(warehouse.id),
          variant: 'danger'
        },
        {
          label: 'キャンセル',
          action: () => {},
          variant: 'secondary'
        }
      ]
    });
  };

  const confirmDeleteWarehouse = async (warehouseId: string) => {
    try {
      const response = await fetch(`/api/delivery-warehouses?id=${warehouseId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        showToast({
          type: 'success',
          title: '削除完了',
          message: result.message || '倉庫が正常に削除されました'
        });
        fetchWarehouses();
      } else {
        throw new Error('倉庫の削除に失敗しました');
      }
    } catch (error) {
      showAlert({
        type: 'error',
        title: '削除エラー',
        message: '倉庫の削除に失敗しました。',
        actions: [
          {
            label: '確認',
            action: () => {},
            variant: 'primary'
          }
        ]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.address.trim()) {
      showAlert({
        type: 'warning',
        title: '入力エラー',
        message: '倉庫名と住所は必須項目です。',
        actions: [
          {
            label: '確認',
            action: () => {},
            variant: 'primary'
          }
        ]
      });
      return;
    }

    try {
      const url = editingWarehouse 
        ? '/api/delivery-warehouses'
        : '/api/delivery-warehouses';
      
      const method = editingWarehouse ? 'PUT' : 'POST';
      const body = editingWarehouse
        ? { ...formData, id: editingWarehouse.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const result = await response.json();
        showToast({
          type: 'success',
          title: editingWarehouse ? '更新完了' : '作成完了',
          message: result.message || '倉庫が正常に保存されました'
        });
        setIsModalOpen(false);
        fetchWarehouses();
      } else {
        const result = await response.json();
        throw new Error(result.error || '倉庫の保存に失敗しました');
      }
    } catch (error) {
      showAlert({
        type: 'error',
        title: '保存エラー',
        message: error instanceof Error ? error.message : '倉庫の保存に失敗しました。',
        actions: [
          {
            label: '確認',
            action: () => {},
            variant: 'primary'
          }
        ]
      });
    }
  };

  const handleInputChange = (field: keyof WarehouseFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
        <span className="ml-2 text-nexus-text-secondary">倉庫データを読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-nexus-text-primary">配送先倉庫管理</h2>
          <p className="text-nexus-text-secondary">納品プラン作成時に使用する配送先倉庫を管理します</p>
        </div>
        <NexusButton
          variant="primary"
          onClick={handleCreateWarehouse}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          新規倉庫追加
        </NexusButton>
      </div>

      {/* 倉庫一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((warehouse) => (
          <div key={warehouse.id} className="bg-white rounded-lg border border-nexus-border p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <BuildingOfficeIcon className="h-5 w-5 text-primary-blue" />
                <h3 className="text-lg font-medium text-nexus-text-primary">{warehouse.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <NexusButton
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEditWarehouse(warehouse)}
                >
                  <PencilIcon className="h-4 w-4" />
                </NexusButton>
                <NexusButton
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteWarehouse(warehouse)}
                >
                  <TrashIcon className="h-4 w-4" />
                </NexusButton>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPinIcon className="h-4 w-4 text-nexus-text-secondary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-nexus-text-secondary">{warehouse.address}</span>
              </div>
              
              {warehouse.phone && (
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4 text-nexus-text-secondary" />
                  <span className="text-sm text-nexus-text-secondary">{warehouse.phone}</span>
                </div>
              )}
              
              {warehouse.email && (
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="h-4 w-4 text-nexus-text-secondary" />
                  <span className="text-sm text-nexus-text-secondary">{warehouse.email}</span>
                </div>
              )}
              
              {warehouse.notes && (
                <div className="mt-3 p-2 bg-nexus-bg-tertiary rounded text-sm text-nexus-text-secondary">
                  <div dangerouslySetInnerHTML={{ __html: warehouse.notes }} />
                </div>
              )}
            </div>
          </div>
        ))}

        {warehouses.length === 0 && (
          <div className="col-span-full text-center py-12">
            <BuildingOfficeIcon className="h-12 w-12 text-nexus-text-tertiary mx-auto mb-4" />
            <p className="text-lg font-medium text-nexus-text-secondary mb-2">倉庫が登録されていません</p>
            <p className="text-sm text-nexus-text-tertiary mb-4">
              新しい配送先倉庫を追加してください
            </p>
            <NexusButton variant="primary" onClick={handleCreateWarehouse}>
              <PlusIcon className="h-4 w-4 mr-2" />
              最初の倉庫を追加
            </NexusButton>
          </div>
        )}
      </div>

      {/* 倉庫作成・編集モーダル */}
      <BaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWarehouse ? '倉庫編集' : '新規倉庫追加'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <NexusInput
            label="倉庫名"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="倉庫名を入力"
            required
            variant="nexus"
          />

          <NexusTextarea
            label="住所"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="倉庫の住所を入力"
            rows={3}
            required
            variant="nexus"
          />

          <NexusInput
            label="電話番号"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="電話番号を入力"
            variant="nexus"
          />

          <NexusInput
            label="メールアドレス"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="メールアドレスを入力"
            variant="nexus"
          />

          <NexusTextarea
            label="備考"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="その他の情報があれば入力"
            rows={3}
            variant="nexus"
          />

          <div className="flex justify-end gap-2 pt-4">
            <NexusButton
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              キャンセル
            </NexusButton>
            <NexusButton type="submit" variant="primary">
              {editingWarehouse ? '更新' : '作成'}
            </NexusButton>
          </div>
        </form>
      </BaseModal>
    </div>
  );
} 