'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import UnifiedPageHeader from '@/app/components/ui/UnifiedPageHeader';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import NexusButton from '@/app/components/ui/NexusButton';
import {
  ArchiveBoxIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

interface PackagingItem {
  id: string;
  productName: string;
  productSku: string;
  orderNumber: string;
  customer: string;
  shippingAddress: string;
  status: 'pending' | 'packed';
  dueDate: string;
  location?: string;
  isBundle?: boolean;
  bundleId?: string;
  bundledItems?: PackagingItem[];
}

export default function PackagingPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<PackagingItem[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'packed'>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackagingItems();
  }, []);

  const fetchPackagingItems = async () => {
    try {
      const response = await fetch('/api/shipping');
      if (response.ok) {
        const data = await response.json();
        // Convert shipping items to packaging items
        const packagingItems: PackagingItem[] = data.items
          .filter((item: any) => ['picked', 'workstation', 'packed'].includes(item.status))
          .map((item: any) => ({
            id: item.id,
            productName: item.productName,
            productSku: item.productSku,
            orderNumber: item.orderNumber,
            customer: item.customer,
            shippingAddress: item.shippingAddress,
            status: item.status === 'packed' ? 'packed' : 'pending',
            dueDate: item.dueDate,
            location: item.location,
            isBundle: item.isBundle || item.isBundleItem,
            bundleId: item.bundleId,
            bundledItems: item.bundledItems
          }));
        setItems(packagingItems);
      }
    } catch (error) {
      console.error('Error fetching packaging items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePackItem = async (item: PackagingItem) => {
    try {
      const response = await fetch('/api/shipping', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          status: 'packed',
          action: 'pack'
        })
      });

      if (response.ok) {
        setItems(prev => prev.map(i =>
          i.id === item.id ? { ...i, status: 'packed' } : i
        ));
        showToast({
          type: 'success',
          title: '梱包完了',
          message: `${item.productName}の梱包が完了しました`
        });
      }
    } catch (error) {
      console.error('Error packing item:', error);
      showToast({
        type: 'error',
        title: 'エラー',
        message: '梱包処理に失敗しました'
      });
    }
  };

  const filteredItems = items.filter(item => item.status === activeTab);

  const headerActions = (
    <div className="flex gap-2">
      <NexusButton
        variant={activeTab === 'pending' ? 'primary' : 'default'}
        size="md"
        onClick={() => setActiveTab('pending')}
        icon={<ArchiveBoxIcon className="w-5 h-5" />}
      >
        梱包待ち
      </NexusButton>
      <NexusButton
        variant={activeTab === 'packed' ? 'primary' : 'default'}
        size="md"
        onClick={() => setActiveTab('packed')}
        icon={<CheckCircleIcon className="w-5 h-5" />}
      >
        梱包済み
      </NexusButton>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout userType="staff">
        <div className="space-y-6">
          <div className="intelligence-card global">
            <div className="p-8">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-12 w-12 border-b-4 border-nexus-yellow rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        <UnifiedPageHeader
          title="梱包管理"
          subtitle="ピッキング完了商品の梱包処理"
          userType="staff"
          iconType="packaging"
          actions={headerActions}
        />

        <div className="intelligence-card global">
          <div className="p-6">
            <div className="space-y-4">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-nexus-bg-tertiary rounded-full flex items-center justify-center mb-4">
                    {activeTab === 'pending' ? (
                      <ArchiveBoxIcon className="w-12 h-12 text-nexus-text-tertiary" />
                    ) : (
                      <CheckCircleIcon className="w-12 h-12 text-nexus-text-tertiary" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-nexus-text-primary mb-2">
                    {activeTab === 'pending' ? '梱包待ちの商品はありません' : '梱包済みの商品はありません'}
                  </h3>
                  <p className="text-nexus-text-secondary">
                    {activeTab === 'pending' ?
                      'ピッキングが完了した商品がここに表示されます' :
                      '梱包が完了した商品がここに表示されます'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-4 ${
                        item.isBundle ? 'bg-blue-50 border-blue-200' : 'bg-white border-nexus-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {item.isBundle && (
                              <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                <CubeIcon className="w-3 h-3 mr-1" />
                                同梱
                              </div>
                            )}
                            <h3 className="font-medium text-nexus-text-primary">
                              {item.productName}
                            </h3>
                          </div>
                          <div className="text-sm text-nexus-text-secondary space-y-1">
                            <div>SKU: {item.productSku}</div>
                            <div>注文番号: {item.orderNumber}</div>
                            <div>顧客: {item.customer}</div>
                            {item.location && <div>ロケーション: {item.location}</div>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {activeTab === 'pending' && (
                            <NexusButton
                              variant="primary"
                              size="sm"
                              onClick={() => handlePackItem(item)}
                              icon={<ArchiveBoxIcon className="w-4 h-4" />}
                            >
                              梱包完了
                            </NexusButton>
                          )}
                          {activeTab === 'packed' && (
                            <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              梱包済み
                            </div>
                          )}
                        </div>
                      </div>

                      {item.bundledItems && item.bundledItems.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-blue-200">
                          <h4 className="text-sm font-medium text-blue-800 mb-2">同梱商品:</h4>
                          <div className="space-y-1">
                            {item.bundledItems.map((bundledItem, index) => (
                              <div key={index} className="text-sm text-blue-700 pl-4">
                                • {bundledItem.productName} ({bundledItem.productSku})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}