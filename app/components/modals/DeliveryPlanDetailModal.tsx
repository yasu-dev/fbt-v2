'use client';

import { useState } from 'react';
import BaseModal from '@/app/components/ui/BaseModal';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusCard from '@/app/components/ui/NexusCard';
import { 
  CalendarIcon, 
  TruckIcon, 
  DocumentTextIcon,
  TagIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  QrCodeIcon,
  PencilIcon,
  EyeIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import PhotographyRequestDisplay from '@/app/components/features/photography/PhotographyRequestDisplay';

interface DeliveryPlanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: number;
    deliveryId: string;
    date: string;
    status: string;
    items: number;
    value: number;
    sellerName?: string;
    deliveryAddress?: string;
    contactEmail?: string;
    phoneNumber?: string;
    notes?: string;
    products?: Array<{
      name: string;
      category: string;
      estimatedValue: number;
      description?: string;
      // 登録時の詳細項目
      purchasePrice?: number;
      condition?: string;
      purchaseDate?: string;
      supplier?: string;
      supplierDetails?: string;
      brand?: string;
      model?: string;
      serialNumber?: string;
      // 撮影要望（新構造対応）
      photographyRequests?: {
        photographyType?: 'standard' | 'premium' | 'none';
        standardCount?: number;
        premiumAddCount?: 2 | 4;
        customRequests?: string;
        // 後方互換性
        specialPhotography?: boolean;
        specialPhotographyItems?: string[];
      } | null;
      // プレミアム梱包
      premiumPacking?: boolean;
      // 商品画像
      images?: Array<{
        id: string;
        url: string;
        filename: string;
        category: string;
      }>;
    }>;
  };
  onStatusChange?: (planId: number, newStatus: string) => void;
}

const statusConfig = {
  '出荷準備中': { color: 'bg-blue-100 text-blue-800', icon: ClockIcon, label: '出荷準備中' },
  '出荷済み': { color: 'bg-green-100 text-green-800', icon: TruckIcon, label: '出荷済み' }
};

export default function DeliveryPlanDetailModal({ 
  isOpen, 
  onClose, 
  plan, 
  onStatusChange 
}: DeliveryPlanDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'status'>('overview');
  const [isStatusEditMode, setIsStatusEditMode] = useState(false);
  const [tempStatus, setTempStatus] = useState(plan.status);

  const statusInfo = statusConfig[plan.status as keyof typeof statusConfig] || statusConfig['出荷準備中'];
  const StatusIcon = statusInfo.icon;

  const handleStatusUpdate = () => {
    if (onStatusChange) {
      onStatusChange(plan.id, tempStatus);
    }
    setIsStatusEditMode(false);
  };

  const handleGenerateProductBarcode = (product: any, index: number) => {
    const barcodeData = {
      type: 'product',
      planId: plan.deliveryId,
      productIndex: index,
      productName: product.name,
      serialNumber: product.serialNumber || '',
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(barcodeData);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `product_barcode_${plan.deliveryId}_${index + 1}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`納品プラン詳細: ${plan.deliveryId}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* ステータス表示 */}
        <div className="flex items-center justify-between p-4 bg-nexus-bg-secondary rounded-lg">
          <div className="flex items-center gap-3">
            <StatusIcon className="w-6 h-6 text-nexus-text-secondary" />
            <div>
              <p className="text-sm text-nexus-text-secondary">現在のステータス</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <NexusButton
              onClick={() => setIsStatusEditMode(true)}
              icon={<PencilIcon className="w-4 h-4" />}
              size="sm"
            >
              ステータス変更
            </NexusButton>
          </div>
        </div>

        {/* ステータス変更モード */}
        {isStatusEditMode && (
          <NexusCard className="p-4">
            <h4 className="font-medium text-nexus-text-primary mb-3">ステータス変更</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {Object.entries(statusConfig).map(([status, config]) => (
                <label key={status} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={tempStatus === status}
                    onChange={(e) => setTempStatus(e.target.value)}
                    className="w-4 h-4 text-primary-blue"
                  />
                  <span className={`text-sm px-2 py-1 rounded ${config.color}`}>
                    {config.label}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <NexusButton onClick={handleStatusUpdate} variant="primary" size="sm">
                更新
              </NexusButton>
              <NexusButton onClick={() => setIsStatusEditMode(false)} size="sm">
                キャンセル
              </NexusButton>
            </div>
          </NexusCard>
        )}

        {/* タブメニュー */}
        <div className="flex border-b border-nexus-border">
          {[
            { id: 'overview', label: '概要', icon: EyeIcon },
            { id: 'products', label: '商品詳細', icon: TagIcon },
            { id: 'status', label: 'ステータス履歴', icon: ClockIcon }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'text-primary-blue border-b-2 border-primary-blue'
                  : 'text-nexus-text-secondary hover:text-nexus-text-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* タブコンテンツ */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 基本情報 */}
              <NexusCard className="p-6">
                <h4 className="font-medium text-nexus-text-primary mb-4 flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5" />
                  基本情報
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-nexus-text-secondary" />
                    <div>
                      <p className="text-sm text-nexus-text-secondary">作成日</p>
                      <p className="font-medium">{plan.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TagIcon className="w-5 h-5 text-nexus-text-secondary" />
                    <div>
                      <p className="text-sm text-nexus-text-secondary">商品数</p>
                      <p className="font-medium">{plan.items}点</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="w-5 h-5 text-nexus-text-secondary" />
                    <div>
                      <p className="text-sm text-nexus-text-secondary">総価値</p>
                      <p className="font-medium">¥{plan.value.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </NexusCard>

              {/* 連絡先情報 */}
              <NexusCard className="p-6">
                <h4 className="font-medium text-nexus-text-primary mb-4 flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  セラー情報
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-5 h-5 text-nexus-text-secondary" />
                    <div>
                      <p className="text-sm text-nexus-text-secondary">セラー名</p>
                      <p className="font-medium">{plan.sellerName || 'セラー情報なし'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="w-5 h-5 text-nexus-text-secondary" />
                    <div>
                      <p className="text-sm text-nexus-text-secondary">連絡先</p>
                      <p className="font-medium">info@the-world-door.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="w-5 h-5 text-nexus-text-secondary" />
                    <div>
                      <p className="text-sm text-nexus-text-secondary">電話番号</p>
                      <p className="font-medium">03-5542-0411（倉庫直通）</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 text-nexus-text-secondary mt-1" />
                    <div>
                      <p className="text-sm text-nexus-text-secondary">配送先住所</p>
                      <p className="font-medium">{plan.deliveryAddress || '住所未設定'}</p>
                    </div>
                  </div>
                </div>
              </NexusCard>

              {/* 備考 */}
              {plan.notes && (
                <NexusCard className="p-6">
                  <h4 className="font-medium text-nexus-text-primary mb-4">備考</h4>
                  <div
                    className="text-nexus-text-secondary"
                    dangerouslySetInnerHTML={{ __html: plan.notes }}
                  />
                </NexusCard>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-4">
              {plan.products && plan.products.length > 0 ? (
                plan.products.map((product, index) => (
                  <NexusCard key={index} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-nexus-text-primary text-lg">{product.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">{product.category}</span>
                          {product.condition && (
                            <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded">{product.condition}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="mb-2">
                          <p className="text-sm text-nexus-text-secondary">購入価格</p>
                          <p className="text-lg font-bold text-nexus-text-primary">¥{Number(product.purchasePrice || 0).toLocaleString()}</p>
                        </div>
                        <NexusButton
                          onClick={() => handleGenerateProductBarcode(product, index)}
                          size="sm"
                          variant="primary"
                          icon={<QrCodeIcon className="w-4 h-4" />}
                        >
                          バーコード発行
                        </NexusButton>
                      </div>
                    </div>

                    {/* 商品画像表示 */}
                    {product.images && product.images.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-nexus-text-primary mb-2">商品画像</h5>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                          {product.images.map((image: any) => (
                            <div key={image.id} className="relative group border border-nexus-border rounded-lg overflow-hidden">
                              <img 
                                src={image.url} 
                                alt={image.filename}
                                className="w-full h-20 object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 text-center">
                                {image.category === 'product' ? '本体' :
                                 image.category === 'package' ? '箱' :
                                 image.category === 'accessory' ? '付属品' :
                                 image.category === 'document' ? '書類' : 'その他'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {product.supplier && (
                        <div>
                          <p className="text-sm text-nexus-text-secondary">仕入先</p>
                          <p className="font-medium">{product.supplier}</p>
                        </div>
                      )}
                      {product.supplierDetails && (
                        <div>
                          <p className="text-sm text-nexus-text-secondary">仕入れ詳細</p>
                          <p className="font-medium">{product.supplierDetails}</p>
                        </div>
                      )}
                      {product.purchaseDate && (
                        <div>
                          <p className="text-sm text-nexus-text-secondary">仕入日</p>
                          <p className="font-medium">{product.purchaseDate}</p>
                        </div>
                      )}
                      {product.brand && (
                        <div>
                          <p className="text-sm text-nexus-text-secondary">ブランド</p>
                          <p className="font-medium">{product.brand}</p>
                        </div>
                      )}
                      {product.model && (
                        <div>
                          <p className="text-sm text-nexus-text-secondary">モデル</p>
                          <p className="font-medium">{product.model}</p>
                        </div>
                      )}
                      {product.serialNumber && (
                        <div>
                          <p className="text-sm text-nexus-text-secondary">シリアル番号</p>
                          <p className="font-mono text-sm">{product.serialNumber}</p>
                        </div>
                      )}
                    </div>

                    {product.description && (
                      <div className="mb-4">
                        <p className="text-sm text-nexus-text-secondary">説明</p>
                        <p className="text-sm mt-1">{product.description}</p>
                      </div>
                    )}
                    
                    {/* 撮影要望表示 */}
                    <div className="mb-4">
                      <PhotographyRequestDisplay 
                        photographyRequests={product.photographyRequests}
                        className=""
                      />
                    </div>

                    {/* プレミアム梱包表示 */}
                    {product.premiumPacking && (
                      <div className="mb-4">
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <h4 className="text-sm font-medium text-purple-800">プレミアム梱包</h4>
                          </div>
                          <p className="text-sm text-nexus-text-secondary ml-7">
                            特別な保護材料と丁寧な梱包でお客様にお届け
                          </p>
                        </div>
                      </div>
                    )}
                  </NexusCard>
                ))
              ) : (
                <div className="text-center py-8 text-nexus-text-secondary">
                  <TagIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>商品情報がありません</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-4">
              <NexusCard className="p-6">
                <h4 className="font-medium text-nexus-text-primary mb-4">ステータス履歴</h4>
                <div className="space-y-3">
                  {/* デモデータ */}
                  <div className="flex items-center gap-3 p-3 bg-nexus-bg-secondary rounded-lg">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <div className="flex-1">
                      <p className="font-medium">{plan.status}</p>
                      <p className="text-sm text-nexus-text-secondary">{plan.date} に更新</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-nexus-bg-secondary rounded-lg">
                    <ClockIcon className="w-5 h-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium">作成開始</p>
                      <p className="text-sm text-nexus-text-secondary">{plan.date} に作成</p>
                    </div>
                  </div>
                </div>
              </NexusCard>
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex gap-4 pt-4 border-t border-nexus-border">
          <NexusButton
            onClick={() => window.open(`/delivery-plan?edit=${plan.id}`, '_blank')}
            variant="primary"
            icon={<PencilIcon className="w-4 h-4" />}
          >
            編集
          </NexusButton>
          <NexusButton
            onClick={onClose}
          >
            閉じる
          </NexusButton>
        </div>
      </div>
    </BaseModal>
  );
} 