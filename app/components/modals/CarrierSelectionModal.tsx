import React, { useState, useEffect, useRef } from 'react';
import { BaseModal, NexusCard, NexusButton, NexusRadioGroup } from '@/app/components/ui';
import { TruckIcon, CheckIcon, CurrencyYenIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Carrier {
  id: string;
  name: string;
  active: boolean;
  defaultRate: number;
  trackingUrl: string;
  apiKey: string;
  notes: string;
  logo?: string;
  supportedServices?: string[];
}

interface CarrierSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCarrierSelect: (carrier: Carrier, service: string) => void;
  item?: any; // 配送対象の商品情報
}

export default function CarrierSelectionModal({
  isOpen,
  onClose,
  onCarrierSelect,
  item
}: CarrierSelectionModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedCarrierRef = useRef<HTMLDivElement>(null);
  const [selectedCarrierId, setSelectedCarrierId] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('standard');
  const [loading, setLoading] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  // 利用可能な配送業者一覧
  const [carriers] = useState<Carrier[]>([
    {
      id: 'fedex',
      name: 'FedEx',
      active: true,
      defaultRate: 1200,
      trackingUrl: 'https://www.fedex.com/apps/fedextrack/',
      apiKey: 'configured', // 実際のAPIキーは環境変数から取得
      notes: 'API連携対応・国際配送対応',
      supportedServices: ['standard', 'express', 'priority']
    },
    {
      id: 'dhl',
      name: 'DHL',
      active: true,
      defaultRate: 1800,
      trackingUrl: 'https://www.dhl.com/jp-ja/home/tracking.html',
      apiKey: '',
      notes: '国際宅配便・伝票作成Webサイトにジャンプ',
      supportedServices: ['standard', 'express']
    },
    {
      id: 'ems',
      name: 'EMS',
      active: true,
      defaultRate: 1500,
      trackingUrl: 'https://trackings.post.japanpost.jp/services/srv/search/',
      apiKey: '',
      notes: '国際スピード郵便・伝票作成Webサイトにジャンプ',
      supportedServices: ['standard', 'express']
    },
    {
      id: 'others',
      name: 'その他（eBay SpeedPAK、クロネコヤマトなど）',
      active: true,
      defaultRate: 1000,
      trackingUrl: '',
      apiKey: '',
      notes: 'その他配送業者・各社伝票作成サイトを利用',
      supportedServices: ['standard']
    }
  ]);

  // アクティブな配送業者のみフィルタ
  const activeCarriers = carriers.filter(carrier => carrier.active);

  // スクロール位置のリセット
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  // モーダルを開いた時の初期化
  useEffect(() => {
    if (isOpen) {
      setSelectedCarrierId('');
      setSelectedService('standard');
      setLoading(false);
    }
  }, [isOpen]);

  // 配送サービスのオプション取得
  const getServiceOptions = (carrierId: string) => {
    const carrier = carriers.find(c => c.id === carrierId);
    if (!carrier?.supportedServices) return [];

    const serviceNames: Record<string, string> = {
      standard: '通常配送',
      express: '速達配送',
      priority: '優先配送',
      cool: 'クール便',
      collect_on_delivery: '代金引換',
      large_item: '大型商品配送',
      fragile: '割れ物注意',
      security: 'セキュリティ配送'
    };

    return carrier.supportedServices.map(service => ({
      value: service,
      label: serviceNames[service] || service
    }));
  };

  const handleCarrierSelect = async () => {
    if (!selectedCarrierId) return;

    const selectedCarrier = carriers.find(c => c.id === selectedCarrierId);
    if (!selectedCarrier) return;

    setLoading(true);
    
    try {
      // 配送業者とサービスを返す
      onCarrierSelect(selectedCarrier, selectedService);
    } catch (error) {
      console.error('配送業者選択エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // 配送業者の料金計算（商品価値とサービスに基づく）
  const calculateShippingRate = (carrier: Carrier, service?: string) => {
    const serviceType = service || selectedService;
    let baseRate = carrier.defaultRate;
    
    // 商品価値に基づく配送料金調整
    if (item?.value) {
      const valueMultiplier = item.value > 50000 ? 1.5 : 1.0;
      baseRate = Math.ceil(baseRate * valueMultiplier);
    }
    
    // サービスタイプによる料金調整
    const serviceMultipliers: Record<string, number> = {
      standard: 1.0,
      express: 1.6,
      priority: 2.0,
      cool: 1.3,
      collect_on_delivery: 1.2,
      large_item: 1.4,
      fragile: 1.2,
      security: 1.8
    };
    
    const multiplier = serviceMultipliers[serviceType] || 1.0;
    return Math.ceil(baseRate * multiplier);
  };

  const selectedCarrier = carriers.find(c => c.id === selectedCarrierId);

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="配送業者選択"
      size="lg"
    >
      <div 
        ref={scrollContainerRef}
        className="space-y-6 max-h-[70vh] overflow-y-auto px-4"
      >
        {/* 商品情報 */}
        {item && (
          <div className="bg-nexus-bg-tertiary p-4 rounded-lg border border-nexus-border">
            <h4 className="text-sm font-medium text-nexus-text-primary mb-2">配送対象商品</h4>
            <div className="space-y-1 text-sm text-nexus-text-secondary">
              <div><span className="font-medium">商品名:</span> {item.productName}</div>
              <div><span className="font-medium">注文番号:</span> {item.orderNumber}</div>
              <div><span className="font-medium">配送先:</span> {item.shippingAddress}</div>
              {item.value && (
                <div><span className="font-medium">商品価値:</span> ${item.value.toLocaleString()}</div>
              )}
            </div>
          </div>
        )}

        {/* 配送業者選択 */}
        <div>
          <h3 className="text-lg font-semibold text-nexus-text-primary mb-4">
            配送業者を選択してください
          </h3>
          
          <div className="grid gap-4">
            {activeCarriers.map((carrier) => (
              <NexusCard
                key={carrier.id}
                className={`cursor-pointer transition-all duration-300 ease-out ${
                  selectedCarrierId === carrier.id
                    ? 'ring-2 ring-nexus-primary border-nexus-primary bg-nexus-primary/5 shadow-lg transform scale-[1.02]'
                    : 'hover:border-nexus-primary/50 hover:shadow-md hover:bg-gray-50/50 transform hover:scale-[1.01] active:scale-[0.99]'
                }`}
                onClick={() => {
                  setIsSelecting(true);
                  setSelectedCarrierId(carrier.id);
                  
                  // 選択時のフィードバック効果
                  setTimeout(() => {
                    setIsSelecting(false);
                    // 選択された詳細情報にスクロール
                    setTimeout(() => {
                      if (selectedCarrierRef.current) {
                        selectedCarrierRef.current.scrollIntoView({
                          behavior: 'smooth',
                          block: 'nearest'
                        });
                      }
                    }, 100);
                  }, 200);
                }}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    {/* カスタムラジオボタン */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      selectedCarrierId === carrier.id
                        ? 'border-nexus-primary bg-nexus-primary'
                        : 'border-nexus-border'
                    }`}>
                      {selectedCarrierId === carrier.id && (
                        <CheckIcon className="w-4 h-4 text-white" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-lg ${
                        selectedCarrierId === carrier.id
                          ? 'bg-nexus-primary/20 text-nexus-primary'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <TruckIcon className="w-6 h-6" />
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-nexus-text-primary text-lg">
                          {carrier.name}
                        </h4>
                        <div
                          className="text-sm text-nexus-text-secondary mt-1"
                          dangerouslySetInnerHTML={{ __html: carrier.notes }}
                        />
                        <div className="flex items-center space-x-3 mt-2">
                          <div className="flex items-center space-x-1 text-xs text-nexus-text-secondary">
                            <ClockIcon className="w-4 h-4" />
                            <span>
                              {carrier.id === 'fedex' ? '1-3営業日' : 
                               carrier.id === 'dhl' ? '2-5営業日' :
                               carrier.id === 'ems' ? '3-6営業日' : '応相談'}
                            </span>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            carrier.id === 'fedex' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {carrier.id === 'fedex' ? 'API連携' : '手動生成'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <CurrencyYenIcon className="w-5 h-5 text-nexus-text-secondary" />
                      <span className="text-2xl font-bold text-nexus-text-primary">
                        {calculateShippingRate(carrier, 'standard').toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-nexus-text-secondary mt-1">
                      配送料金（税込・通常配送）
                    </div>
                  </div>
                </div>
              </NexusCard>
            ))}
          </div>
        </div>


        {/* 選択された配送業者の詳細セクション */}
        {selectedCarrier && (
          <NexusCard
            ref={selectedCarrierRef}
            className="bg-gradient-to-r from-nexus-primary/5 to-blue-50/50 border-2 border-nexus-primary/30 shadow-lg animate-in slide-in-from-top duration-500 ease-out transform"
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-nexus-primary flex items-center justify-center">
                  <CheckIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-nexus-text-primary text-xl">
                    選択中: {selectedCarrier.name}
                  </h4>
                  <p className="text-sm text-nexus-text-secondary mt-1">
                    配送サービスを選択してください
                  </p>
                </div>
              </div>

              {/* 配送サービス選択 */}
              {getServiceOptions(selectedCarrierId).length > 0 && (
                <div className="mb-6">
                  <NexusRadioGroup
                    name="shipping-service"
                    value={selectedService}
                    onChange={setSelectedService}
                    options={getServiceOptions(selectedCarrierId).map(option => ({
                      ...option,
                      description: option.value === 'express' ? '追加料金あり' :
                                  option.value === 'priority' ? '最高速配送' :
                                  '標準的な配送オプション'
                    }))}
                    variant="enterprise"
                    className="bg-white/50 p-4 rounded-lg"
                  />
                </div>
              )}

              {/* 料金とサマリー情報 */}
              <div className="bg-white/70 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-nexus-text-secondary">配送料金（税込）:</span>
                  <div className="flex items-center space-x-1">
                    <CurrencyYenIcon className="w-4 h-4 text-nexus-text-secondary" />
                    <span className="font-bold text-xl text-nexus-text-primary">
                      {calculateShippingRate(selectedCarrier, selectedService).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {selectedService !== 'standard' && (
                  <div className="flex items-center justify-between text-sm bg-yellow-50 p-2 rounded">
                    <span className="text-yellow-800">通常配送との差額:</span>
                    <span className="font-bold text-yellow-800">
                      +¥{(calculateShippingRate(selectedCarrier, selectedService) - calculateShippingRate(selectedCarrier, 'standard')).toLocaleString()}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-nexus-text-secondary">配送日数:</span>
                  <span className="text-sm text-nexus-text-primary">
                    {(() => {
                      const baseDays = selectedCarrier.id === 'fedex' ? '1-3営業日' : 
                                      selectedCarrier.id === 'dhl' ? '2-5営業日' :
                                      selectedCarrier.id === 'ems' ? '3-6営業日' : '応相談';
                      
                      if (selectedService === 'express') {
                        return selectedCarrier.id === 'fedex' ? '1-2営業日' :
                               selectedCarrier.id === 'dhl' ? '1-3営業日' :
                               selectedCarrier.id === 'ems' ? '2-4営業日' : '短縮可能';
                      } else if (selectedService === 'priority') {
                        return '翌日配送';
                      }
                      return baseDays;
                    })()}
                  </span>
                </div>

                {selectedCarrier.trackingUrl && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-nexus-text-secondary">追跡サービス:</span>
                    <span className="text-sm text-nexus-primary font-medium">利用可能</span>
                  </div>
                )}

                {selectedCarrier.id === 'fedex' && (
                  <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg border border-green-200">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-800 font-medium">
                      API連携でラベル自動生成されます
                    </span>
                  </div>
                )}
              </div>
            </div>
          </NexusCard>
        )}
      </div>

      {/* フッターボタン */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-nexus-border">
        {/* 選択サマリー */}
        <div className="flex items-center space-x-2 text-sm">
          {selectedCarrier ? (
            <div className="flex items-center space-x-2 text-nexus-text-secondary">
              <CheckIcon className="w-4 h-4 text-green-600" />
              <span>
                {selectedCarrier.name} ({getServiceOptions(selectedCarrierId).find(s => s.value === selectedService)?.label || '通常配送'})
              </span>
            </div>
          ) : (
            <span className="text-nexus-text-secondary">配送業者を選択してください</span>
          )}
        </div>

        <div className="flex space-x-3">
          <NexusButton
            onClick={onClose}
            variant="default"
            disabled={loading}
          >
            キャンセル
          </NexusButton>
          <NexusButton
            onClick={handleCarrierSelect}
            variant="primary"
            disabled={!selectedCarrierId || loading}
            className={`transition-all duration-200 ${
              selectedCarrierId 
                ? 'bg-nexus-primary hover:bg-nexus-primary/90 shadow-lg' 
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>生成中...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <TruckIcon className="w-4 h-4" />
                <span>ラベル生成</span>
              </div>
            )}
          </NexusButton>
        </div>
      </div>
    </BaseModal>
  );
} 