'use client';

import { useState, useMemo } from 'react';
import { BaseModal, NexusButton, NexusCard } from '../ui';
import { useToast } from '../features/notifications/ToastProvider';
import { useSystemSetting } from '@/lib/hooks/useMasterData';
import { 
  TruckIcon,
  ClockIcon,
  CurrencyYenIcon,
  CheckCircleIcon,
  CheckIcon,
  InformationCircleIcon,
  UserGroupIcon,
  PrinterIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';

interface FedExService {
  id: string;
  name: string;
  description: string;
  deliveryTime: string;
  estimatedCost: string;
  features: string[];
  icon: React.ReactNode;
}

interface FedExServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceSelect: (serviceId: string) => void;
  orderDetails?: {
    orderId: string;
    product: string;
    weight?: string;
    destination?: string;
  };
}

const FEDEX_SERVICES: FedExService[] = [
  {
    id: 'ground',
    name: 'FedEx Ground',
    description: '陸送による経済的な配送サービス',
    deliveryTime: '1-5営業日',
    estimatedCost: '¥1,200-1,800',
    features: ['最も経済的', '陸送のため環境負荷軽減', '追跡サービス付き'],
    icon: <TruckIcon className="w-8 h-8" />
  },
  {
    id: '2day',
    name: 'FedEx 2Day',
    description: '2営業日確実配送サービス',
    deliveryTime: '2営業日',
    estimatedCost: '¥2,400-3,200',
    features: ['2営業日保証', '土曜日配送可能', 'マネーバック保証'],
    icon: <ClockIcon className="w-8 h-8" />
  },
  {
    id: 'express_saver',
    name: 'FedEx Express Saver',
    description: '翌日午後配達の速達サービス',
    deliveryTime: '翌営業日 午後3時まで',
    estimatedCost: '¥3,600-4,800',
    features: ['翌日配送', '午後3時まで配達', '優先取扱い'],
    icon: <ClockIcon className="w-8 h-8" />
  },
  {
    id: 'standard_overnight',
    name: 'FedEx Standard Overnight',
    description: '翌日午後3時まで確実配達',
    deliveryTime: '翌営業日 午後3時まで',
    estimatedCost: '¥4,800-6,400',
    features: ['翌日午後3時保証', '土曜日配送可能', 'プレミアムサービス'],
    icon: <ClockIcon className="w-8 h-8" />
  },
  {
    id: 'priority_overnight',
    name: 'FedEx Priority Overnight',
    description: '翌日午前10:30まで特急配達',
    deliveryTime: '翌営業日 午前10:30まで',
    estimatedCost: '¥6,400-8,000',
    features: ['翌日午前配達', '最高優先度', '土曜日配送可能'],
    icon: <ClockIcon className="w-8 h-8" />
  },
  {
    id: 'first_overnight',
    name: 'FedEx First Overnight',
    description: '翌日午前9時まで最速配達',
    deliveryTime: '翌営業日 午前9時まで',
    estimatedCost: '¥8,000-10,000',
    features: ['最速配送', '翌日午前9時保証', '最高優先サービス'],
    icon: <ClockIcon className="w-8 h-8" />
  }
];

export default function FedExServiceModal({
  isOpen,
  onClose,
  onServiceSelect,
  orderDetails
}: FedExServiceModalProps) {
  const { showToast } = useToast();
  const [selectedService, setSelectedService] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState(false);
  
  // APIからFedXサービスオプションを取得
  const { setting: fedexServices } = useSystemSetting('fedex_services');
  
  // システム設定からFedXサービスを取得、フォールバックあり
  const dynamicFedexServices: FedExService[] = useMemo(() => {
    return fedexServices?.parsedValue ? 
      fedexServices.parsedValue.map((service: any) => ({
        id: service.key,
        name: service.name,
        description: service.name + 'サービス',
        deliveryTime: '1-5営業日',
        estimatedCost: service.priceRange,
        features: ['追跡サービス付き'],
        icon: <TruckIcon className="w-8 h-8" />
      })) : FEDEX_SERVICES;
  }, [fedexServices]);

  const selectedServiceData = dynamicFedexServices.find(s => s.id === selectedService);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleContinue = () => {
    if (!selectedService) {
      showToast({
        title: 'サービス未選択',
        message: 'FedExサービスを選択してください',
        type: 'warning'
      });
      return;
    }
    setIsConfirming(true);
  };

  const handleConfirm = () => {
    onServiceSelect(selectedService);
    showToast({
      title: 'FedExサービス選択完了',
      message: `${selectedServiceData?.name}を選択しました`,
      type: 'success'
    });
    onClose();
    // Reset states
    setSelectedService('');
    setIsConfirming(false);
  };

  const handleBack = () => {
    if (isConfirming) {
      setIsConfirming(false);
    } else {
      onClose();
      setSelectedService('');
      setIsConfirming(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleBack}
      title={isConfirming ? 'サービス選択の確認' : 'FedEx配送サービス選択'}
      size="lg"
    >
      <div className="space-y-6">
        {/* 注文情報表示 */}
        {orderDetails && (
          <NexusCard className="bg-nexus-bg-tertiary border-nexus-border">
            <div className="p-4">
              <h3 className="font-semibold text-nexus-text-primary mb-2 flex items-center gap-2">
                <InformationCircleIcon className="w-5 h-5" />
                注文情報
              </h3>
              <div className="text-sm text-nexus-text-secondary space-y-1">
                <p><span className="font-medium">注文ID:</span> {orderDetails.orderId}</p>
                <p><span className="font-medium">商品:</span> {orderDetails.product}</p>
                {orderDetails.weight && <p><span className="font-medium">重量:</span> {orderDetails.weight}</p>}
                {orderDetails.destination && <p><span className="font-medium">配送先:</span> {orderDetails.destination}</p>}
              </div>
            </div>
          </NexusCard>
        )}

        {!isConfirming ? (
          // サービス選択画面
          <>
            <div className="text-center">
              <p className="text-nexus-text-secondary font-medium">
                配送の緊急度と予算に応じて最適なサービスをお選びください
              </p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {dynamicFedexServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleServiceSelect(service.id)}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-all duration-200
                    ${selectedService === service.id 
                      ? 'border-2 border-nexus-primary bg-nexus-primary/5 shadow-md' 
                      : 'border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* ラジオボタン */}
                    <div className="pt-1">
                      <input
                        type="radio"
                        name="fedex-service"
                        id={`service-${service.id}`}
                        checked={selectedService === service.id}
                        onChange={() => handleServiceSelect(service.id)}
                        className="w-5 h-5 text-nexus-primary focus:ring-nexus-primary"
                      />
                    </div>

                    {/* サービスアイコン */}
                    <div className={`
                      p-2 rounded-lg transition-colors flex-shrink-0
                      ${selectedService === service.id 
                        ? 'bg-nexus-primary/20 text-nexus-primary' 
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      <TruckIcon className="w-6 h-6" />
                    </div>
                    
                    {/* サービス詳細 */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor={`service-${service.id}`} className="font-bold text-nexus-text-primary cursor-pointer">
                          {service.name}
                        </label>
                        <span className="font-bold text-lg text-nexus-text-primary">
                          {service.estimatedCost}
                        </span>
                      </div>
                      
                      <p className="text-nexus-text-secondary text-sm mb-2">{service.description}</p>
                      
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-green-600">
                          <ClockIcon className="w-4 h-4" />
                          {service.deliveryTime}
                        </span>
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        {service.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-nexus-text-secondary">
                            <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 選択したサービスのサマリー */}
            {selectedService && selectedServiceData && (
              <div className="p-4 bg-blue-100 rounded-lg border-2 border-blue-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <CheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">選択中のサービス</p>
                      <p className="font-bold text-nexus-text-primary">{selectedServiceData.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 font-medium">配送料金</p>
                    <p className="font-bold text-lg text-nexus-text-primary">{selectedServiceData.estimatedCost}</p>
                  </div>
                </div>
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex gap-3 justify-end">
              <NexusButton
                variant="secondary"
                onClick={handleBack}
              >
                キャンセル
              </NexusButton>
              <NexusButton
                variant="primary"
                onClick={handleContinue}
                disabled={!selectedService}
              >
                次へ
              </NexusButton>
            </div>
          </>
        ) : (
          // 確認画面
          <>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-nexus-primary/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircleIcon className="w-10 h-10 text-nexus-primary" />
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-nexus-text-primary mb-2">
                  以下のサービスで配送ラベルを生成します
                </h3>
                <p className="text-nexus-text-secondary">
                  選択したサービスで問題ないか確認してください
                </p>
              </div>
            </div>

            {selectedServiceData && (
              <NexusCard className="bg-nexus-primary/5 border-nexus-primary/30">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-nexus-primary/20 text-nexus-primary rounded-lg">
                      {selectedServiceData.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-nexus-text-primary text-xl">
                        {selectedServiceData.name}
                      </h3>
                      <p className="text-nexus-text-secondary">
                        {selectedServiceData.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-nexus-border">
                    <div>
                      <p className="text-sm text-nexus-text-secondary mb-1">配送日数</p>
                      <p className="font-semibold text-nexus-text-primary">
                        {selectedServiceData.deliveryTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-nexus-text-secondary mb-1">配送料金</p>
                      <p className="font-bold text-lg text-nexus-primary">
                        {selectedServiceData.estimatedCost}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    {selectedServiceData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span className="text-nexus-text-primary">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </NexusCard>
            )}

            {/* 注意事項 */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex gap-3">
                <InformationCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">ご注意</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>料金は概算です。実際の料金は重量・サイズ・配送先により変動します</li>
                    <li>配送時間は営業日ベースです（土日祝日除く）</li>
                    <li>選択後にラベル生成処理が開始されます</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* この後の流れ（統一ガイダンス） */}
            <div className="p-4 bg-gradient-to-r from-nexus-primary/20 to-blue-100/50 rounded-lg border-2 border-nexus-primary/40 ring-1 ring-nexus-primary/20 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircleIcon className="w-5 h-5 text-nexus-primary" />
                <p className="text-sm font-bold text-nexus-text-primary">この後の流れ</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white/80 rounded-lg border-2 border-nexus-border p-3 flex items-start gap-3 ring-1 ring-nexus-primary/10 shadow-sm">
                  <div className="p-2 rounded-md bg-nexus-primary/20 text-nexus-primary">
                    <DocumentCheckIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-nexus-text-primary">ラベル自動生成</p>
                    <p className="text-xs text-nexus-text-secondary">選択したサービスでFedExラベルを即時作成</p>
                  </div>
                </div>
                <div className="bg-white/80 rounded-lg border-2 border-nexus-border p-3 flex items-start gap-3 ring-1 ring-nexus-primary/10 shadow-sm">
                  <div className="p-2 rounded-md bg-nexus-primary/20 text-nexus-primary">
                    <UserGroupIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-nexus-text-primary">スタッフに自動共有</p>
                    <p className="text-xs text-nexus-text-secondary">倉庫チームに通知・業務キューへ登録</p>
                  </div>
                </div>
                <div className="bg-white/80 rounded-lg border-2 border-nexus-border p-3 flex items-start gap-3 ring-1 ring-nexus-primary/10 shadow-sm">
                  <div className="p-2 rounded-md bg-nexus-primary/20 text-nexus-primary">
                    <PrinterIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-nexus-text-primary">印刷・出荷はスタッフ</p>
                    <p className="text-xs text-nexus-text-secondary">ラベル印刷〜集荷手配まで一貫対応</p>
                  </div>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex gap-3 justify-end">
              <NexusButton
                variant="secondary"
                onClick={handleBack}
              >
                戻る
              </NexusButton>
              <NexusButton
                variant="primary"
                onClick={handleConfirm}
              >
                ラベル生成を開始
              </NexusButton>
            </div>
          </>
        )}
      </div>
    </BaseModal>
  );
}