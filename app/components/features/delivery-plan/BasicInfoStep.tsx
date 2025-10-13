'use client';

import { useState, useEffect } from 'react';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusInput from '@/app/components/ui/NexusInput';
import NexusTextarea from '@/app/components/ui/NexusTextarea';
import NexusSelect from '@/app/components/ui/NexusSelect';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

interface BasicInfoStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  isFirstStep: boolean;
}

export default function BasicInfoStep({ 
  data, 
  onUpdate, 
  onNext, 
  isFirstStep 
}: BasicInfoStepProps) {
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [formData, setFormData] = useState(data.basicInfo || {
    warehouseId: '',
    warehouseName: '',
    deliveryAddress: '',
    contactEmail: 'info@the-world-door.com', // 固定の連絡先メール
    phoneNumber: null, // 倉庫情報で代替するためnull
    notes: ''
  });

  // ログイン中のユーザー情報と倉庫情報を取得
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // ユーザー情報取得
        const userResponse = await fetch('/api/auth/session');
        const userResult = await userResponse.json();
        
        if (userResult.success && userResult.user) {
          setUser(userResult.user);
        }

        // 倉庫情報取得
        const warehouseResponse = await fetch('/api/delivery-warehouses');
        const warehouseResult = await warehouseResponse.json();
        
        if (Array.isArray(warehouseResult)) {
          setWarehouses(warehouseResult);
        }

        // デフォルト倉庫設定
        const defaultWarehouseId = 'warehouse-002'; // 株式会社THE WORLD DOOR 営業倉庫
        const defaultWarehouse = warehouseResult.find(w => w.id === defaultWarehouseId);

        // フォームの初期化
        const initialData = {
          warehouseId: data.basicInfo?.warehouseId || defaultWarehouseId,
          warehouseName: data.basicInfo?.warehouseName || (defaultWarehouse?.name || ''),
          deliveryAddress: data.basicInfo?.deliveryAddress || (defaultWarehouse?.address || ''),
          contactEmail: 'info@the-world-door.com', // 固定の連絡先メール
          phoneNumber: null, // 倉庫情報で代替するためnull
          notes: data.basicInfo?.notes || ''
        };
        setFormData(initialData);
        onUpdate({ basicInfo: initialData });

        // デフォルト倉庫を選択状態に設定
        if (defaultWarehouse && !data.basicInfo?.warehouseId) {
          setSelectedWarehouse(defaultWarehouse);
        }
        
      } catch (error) {
        console.error('[ERROR] 初期データの取得に失敗しました:', error);
        showToast({
          type: 'error',
          title: 'エラー',
          message: '初期データの取得に失敗しました'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData().catch(error => {
      console.error('[ERROR] fetchInitialData Promise rejection:', error);
    });
  }, []);

  const handleInputChange = (field: string, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onUpdate({ basicInfo: updatedData });
  };

  const handleWarehouseChange = (warehouseId: string) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    if (warehouse) {
      setSelectedWarehouse(warehouse);
      const updatedData = {
        ...formData,
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        deliveryAddress: warehouse.address || ''
      };
      setFormData(updatedData);
      onUpdate({ basicInfo: updatedData });
    }
  };

  const handleNext = () => {
    if (!formData.warehouseId) {
      showToast({
        type: 'warning',
        title: '入力エラー',
        message: '配送先倉庫が選択されていません。',
        duration: 3000
      });
      return;
    }

    if (!formData.deliveryAddress.trim()) {
      showToast({
        type: 'warning',
        title: '入力エラー',
        message: '選択された倉庫に住所情報が登録されていません。管理者にお問い合わせください。',
        duration: 5000
      });
      return;
    }

    onNext();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
        <span className="ml-2 text-nexus-text-secondary">ユーザー情報を読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-nexus-text-primary mb-4">基本情報</h2>
        <p className="text-nexus-text-secondary mb-6">納品プランの基本情報を入力してください</p>
      </div>

      {/* セラー情報表示 */}
      {user && (
        <div className="bg-nexus-bg-tertiary p-4 rounded-lg border border-nexus-border">
          <h3 className="text-lg font-medium text-nexus-text-primary mb-3">セラー情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-nexus-text-secondary">セラー名:</span>
              <span className="ml-2 text-nexus-text-primary">{user.fullName || user.username}</span>
            </div>
            {user.phoneNumber && (
              <div>
                <span className="font-medium text-nexus-text-secondary">電話番号:</span>
                <span className="ml-2 text-nexus-text-primary">{user.phoneNumber}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-nexus-text-secondary">連絡先メール:</span>
              <span className="ml-2 text-nexus-text-primary">{user.email}</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <NexusSelect
          label="配送先倉庫"
          value={formData.warehouseId}
          onChange={(e) => handleWarehouseChange(e.target.value)}
          options={warehouses.map(warehouse => ({
            value: warehouse.id,
            label: warehouse.name
          }))}
          required
          variant="nexus"
          useCustomDropdown={true}
        />

        {selectedWarehouse && (
          <div className="bg-nexus-bg-tertiary p-4 rounded-lg border border-nexus-border">
            <h4 className="text-sm font-medium text-nexus-text-primary mb-3">選択された倉庫情報</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-nexus-text-secondary">倉庫名:</span>
                <span className="ml-2 text-nexus-text-primary">{selectedWarehouse.name}</span>
              </div>

              {selectedWarehouse.address ? (
                <div>
                  <span className="font-medium text-nexus-text-secondary">配送先住所:</span>
                  <div className="ml-0 mt-1 text-nexus-text-primary bg-nexus-bg-tertiary p-2 rounded text-xs">
                    {selectedWarehouse.address}
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-yellow-700">住所情報が未登録です。管理者にお問い合わせください。</span>
                  </div>
                </div>
              )}

              {selectedWarehouse.phone && (
                <div>
                  <span className="font-medium text-nexus-text-secondary">電話:</span>
                  <span className="ml-2 text-nexus-text-primary">{selectedWarehouse.phone}</span>
                </div>
              )}

              {selectedWarehouse.email && (
                <div>
                  <span className="font-medium text-nexus-text-secondary">メール:</span>
                  <span className="ml-2 text-nexus-text-primary">{selectedWarehouse.email}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 配送先住所は倉庫情報に統合したため、個別表示は不要 */}
        {!selectedWarehouse && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  配送先情報について
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  上記の「配送先倉庫」を選択すると、その倉庫の住所や連絡先情報が表示されます。
                </p>
              </div>
            </div>
          </div>
        )}



        {/* 連絡先メールの表示は不要（別の問い合わせ窓口があるため） */}

        {/* 電話番号は倉庫情報に含まれるため入力不要 */}

        <NexusTextarea
          label="備考"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          placeholder="その他の要望や注意事項があれば入力"
          variant="nexus"
        />
      </div>

      <div className="flex justify-end pt-6">
        <NexusButton variant="primary" onClick={handleNext}>
          次へ進む
        </NexusButton>
      </div>
    </div>
  );
} 