'use client';

import { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { BaseModal, NexusButton, NexusInput, NexusTextarea, NexusCheckbox } from '../ui';

interface CarrierSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
}

interface Carrier {
  id: string;
  name: string;
  active: boolean;
  defaultRate: number;
  trackingUrl: string;
  apiKey: string;
  notes: string;
}

export default function CarrierSettingsModal({ isOpen, onClose, onSave }: CarrierSettingsModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [carriers, setCarriers] = useState<Carrier[]>([
    {
      id: 'fedex',
      name: 'FedEx',
      active: true,
      defaultRate: 1200,
      trackingUrl: 'https://www.fedex.com/apps/fedextrack/',
      apiKey: 'configured',
      notes: 'API連携対応・国際配送対応'
    },
    {
      id: 'dhl',
      name: 'DHL',
      active: true,
      defaultRate: 1800,
      trackingUrl: 'https://www.dhl.com/jp-ja/home/tracking.html',
      apiKey: '',
      notes: '国際宅配便・伝票作成Webサイトにジャンプ'
    },
    {
      id: 'ems',
      name: 'EMS',
      active: true,
      defaultRate: 1500,
      trackingUrl: 'https://trackings.post.japanpost.jp/services/srv/search/',
      apiKey: '',
      notes: '国際スピード郵便・伝票作成Webサイトにジャンプ'
    },
    {
      id: 'others',
      name: 'その他（eBay SpeedPAK、クロネコヤマトなど）',
      active: true,
      defaultRate: 1000,
      trackingUrl: '',
      apiKey: '',
      notes: 'その他配送業者・各社伝票作成サイトを利用'
    }
  ]);

  // スクロール位置のリセット
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  const handleCarrierChange = (carrierId: string, field: keyof Carrier, value: any) => {
    setCarriers(prev => prev.map(carrier => 
      carrier.id === carrierId 
        ? { ...carrier, [field]: value }
        : carrier
    ));
  };

  const handleSave = () => {
    onSave({ carriers });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="配送業者設定"
      size="lg"
      className="max-w-4xl"
    >
      <div className="max-h-[90vh] overflow-y-auto" ref={scrollContainerRef}>

        
        <div className="space-y-6">
          {carriers.map((carrier) => (
            <div key={carrier.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium">{carrier.name}</h4>
                <NexusCheckbox
                  checked={carrier.active}
                  onChange={(e) => handleCarrierChange(carrier.id, 'active', e.target.checked)}
                  label="有効"
                  variant="nexus"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    基本配送料 (円)
                  </label>
                  <NexusInput
                    type="number"
                    value={carrier.defaultRate.toString()}
                    onChange={(e) => handleCarrierChange(carrier.id, 'defaultRate', parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API キー
                  </label>
                  <NexusInput
                    type="password"
                    value={carrier.apiKey}
                    onChange={(e) => handleCarrierChange(carrier.id, 'apiKey', e.target.value)}
                    placeholder="API キーを入力"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  追跡URL
                </label>
                <NexusInput
                  type="url"
                  value={carrier.trackingUrl}
                  onChange={(e) => handleCarrierChange(carrier.id, 'trackingUrl', e.target.value)}
                />
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備考
                </label>
                <NexusTextarea
                  value={carrier.notes}
                  onChange={(e) => handleCarrierChange(carrier.id, 'notes', e.target.value)}
                  rows={2}
                  placeholder="配送業者に関する備考"
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end gap-2 pt-6">
          <NexusButton
            onClick={onClose}
            variant="secondary"
          >
            キャンセル
          </NexusButton>
          <NexusButton
            onClick={handleSave}
            variant="primary"
          >
            保存
          </NexusButton>
        </div>
      </div>
    </BaseModal>
  );
} 