'use client';

import { useState, useEffect } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusSelect from '@/app/components/ui/NexusSelect';
import NexusTextarea from '@/app/components/ui/NexusTextarea';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { 
  MapPinIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  model: string;
  status: string;
}

interface InspectionData {
  productId: string;
  checklist: {
    exterior: {
      scratches: boolean;
      dents: boolean;
      discoloration: boolean;
      dust: boolean;
    };
    functionality: {
      powerOn: boolean;
      allButtonsWork: boolean;
      screenDisplay: boolean;
      connectivity: boolean;
    };
    optical?: {
      lensClarity: boolean;
      aperture: boolean;
      focusAccuracy: boolean;
      stabilization: boolean;
    };
  };
  photos: string[];
  notes: string;
  inspectionDate: string;
  inspectorId: string;
  result: 'passed' | 'failed' | 'conditional';
  skipPhotography?: boolean;
}

export interface InspectionResultProps {
  product: Product;
  inspectionData: InspectionData;
  onNotesChange: (notes: string) => void;
  onSubmit: (locationId?: string) => Promise<void>;
  onPrev: () => void;
  loading: boolean;
}

interface Location {
  id: string;
  code: string;
  name: string;
  zone: string;
  capacity?: number;
  _count?: { products: number };
}

export default function InspectionResult({
  product,
  inspectionData,
  onNotesChange,
  onSubmit,
  onPrev,
  loading,
}: InspectionResultProps) {
  const { showToast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [loadingLocations, setLoadingLocations] = useState(true);

  // ロケーションデータを取得
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations');
        if (response.ok) {
          const data = await response.json();
          setLocations(data);
        } else {
          console.error('Failed to fetch locations');
          showToast({
            type: 'warning',
            title: 'ロケーション取得エラー',
            message: 'ロケーション情報の取得に失敗しました'
          });
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        showToast({
          type: 'error',
          title: 'ロケーション取得エラー',
          message: 'ロケーション情報の取得中にエラーが発生しました'
        });
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [showToast]);

  // カテゴリに基づく推奨ロケーション
  const getRecommendedLocation = () => {
    if (product.category === 'camera_body' || product.category === 'lens') {
      return locations.find(loc => loc.zone === 'H') || null; // 防湿庫
    } else if (product.category === 'watch') {
      return locations.find(loc => loc.zone === 'V') || null; // 金庫室
    }
    return locations.find(loc => loc.zone === 'A') || null; // 標準棚
  };

  const recommendedLocation = getRecommendedLocation();

  // 保管場所選択時の自動設定
  useEffect(() => {
    if (recommendedLocation && !selectedLocation) {
      setSelectedLocation(recommendedLocation.id);
    }
  }, [recommendedLocation, selectedLocation]);

  // 完了ボタンハンドラー
  const handleSubmit = async () => {
    if (!selectedLocation) {
      showToast({
        type: 'warning',
        title: '保管場所未選択',
        message: '商品の保管場所を選択してください'
      });
      return;
    }
    await onSubmit(selectedLocation);
  };



  // チェック項目の集計
  const getChecklistSummary = () => {
    const allChecks = Object.values(inspectionData.checklist).flatMap(category =>
      Object.entries(category || {})
    );
    const passedChecks = allChecks.filter(([_, value]) => value === true);
    const failedChecks = allChecks.filter(([_, value]) => value === false);
    
    return {
      total: allChecks.length,
      passed: passedChecks.length,
      failed: failedChecks.length,
      percentage: Math.round((passedChecks.length / allChecks.length) * 100),
    };
  };

  const summary = getChecklistSummary();

  // 検品結果の判定
  const getResultStatus = () => {
    if (summary.percentage >= 90) {
      return { label: 'A級品', color: 'status-badge success' };
    } else if (summary.percentage >= 70) {
      return { label: 'B級品', color: 'status-badge warning' };
    } else {
      return { label: 'C級品', color: 'status-badge error' };
    }
  };

  const resultStatus = getResultStatus();

  const checklistLabels = {
    exterior: {
      title: '外観チェック',
      items: {
        scratches: '傷の有無',
        dents: 'へこみ',
        discoloration: '変色・退色',
        dust: 'ホコリ・汚れ',
      },
    },
    functionality: {
      title: '機能チェック',
      items: {
        powerOn: '電源ON/OFF',
        allButtonsWork: 'ボタン動作',
        screenDisplay: '画面表示',
        connectivity: '接続端子',
      },
    },
    optical: {
      title: '光学系チェック',
      items: {
        lensClarity: 'レンズ透明度',
        aperture: '絞り動作',
        focusAccuracy: 'フォーカス精度',
        stabilization: '手ぶれ補正',
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* 検品結果サマリー */}
      <NexusCard className="p-6 border-2 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">検品結果サマリー</h3>
          <div className={`px-6 py-2 rounded-full font-bold ${resultStatus.bg} ${resultStatus.color}`}>
            {resultStatus.label}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NexusCard className="p-4 text-center">
            <p className="text-3xl font-display font-bold text-nexus-text-primary">{summary.total}</p>
            <p className="text-sm text-nexus-text-secondary">検査項目数</p>
          </NexusCard>
          <NexusCard className="p-4 text-center border-green-200">
            <p className="text-3xl font-display font-bold text-green-600">{summary.passed}</p>
            <p className="text-sm text-nexus-text-secondary">合格項目</p>
          </NexusCard>
          <NexusCard className="p-4 text-center border-red-200">
            <p className="text-3xl font-display font-bold text-red-600">{summary.failed}</p>
            <p className="text-sm text-nexus-text-secondary">不合格項目</p>
          </NexusCard>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">合格率</span>
            <span className="text-sm font-bold text-gray-900">{summary.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${
                summary.percentage >= 90
                  ? 'bg-green-500'
                  : summary.percentage >= 70
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${summary.percentage}%` }}
            />
          </div>
        </div>
      </NexusCard>

      {/* 商品情報 */}
      <NexusCard className="p-6">
        <h4 className="text-lg font-semibold mb-4">商品情報</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">商品名</p>
            <p className="font-medium">{product.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">SKU</p>
            <p className="font-medium">{product.sku}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ブランド</p>
            <p className="font-medium">{product.brand}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">モデル</p>
            <p className="font-medium">{product.model}</p>
          </div>
        </div>
      </NexusCard>

      {/* 保管場所選択セクション */}
      <NexusCard className="p-6 border-2 border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <MapPinIcon className="w-6 h-6 text-green-600" />
          <h4 className="text-lg font-semibold text-gray-900">保管場所の設定</h4>
        </div>
        
        <div className="space-y-4">
          {/* 推奨ロケーション表示 */}
          {recommendedLocation && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-medium text-blue-900 mb-1">推奨保管場所</h5>
                  <p className="text-sm text-blue-800">
                    {product.category === 'camera_body' || product.category === 'lens' 
                      ? 'カメラ・レンズは湿度管理が重要なため、防湿庫での保管を推奨します。'
                      : product.category === 'watch'
                      ? '高価値商品のため、セキュリティの高い金庫室での保管を推奨します。'
                      : '標準的な棚での保管が適しています。'
                    }
                  </p>
                  <p className="text-sm font-medium text-blue-900 mt-1">
                    推奨: {recommendedLocation.name} ({recommendedLocation.code})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ロケーション選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              保管場所 <span className="text-red-500">*</span>
            </label>
            
            {loadingLocations ? (
              <div className="flex items-center justify-center p-4 border border-gray-200 rounded-lg">
                <div className="animate-spin h-5 w-5 border-b-2 border-blue-500 rounded-full"></div>
                <span className="ml-2 text-gray-600">ロケーション情報を取得中...</span>
              </div>
            ) : (
              <NexusSelect
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full"
                required
              >
                <option value="">保管場所を選択してください</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.code}) 
                    {location._count && ` - ${location._count.products}個保管中`}
                    {location.capacity && ` / 容量${location.capacity}`}
                  </option>
                ))}
              </NexusSelect>
            )}
          </div>

          {/* 選択されたロケーションの詳細表示 */}
          {selectedLocation && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              {(() => {
                const selected = locations.find(loc => loc.id === selectedLocation);
                if (!selected) return null;
                
                return (
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-900">
                        選択中: {selected.name}
                      </p>
                      <p className="text-sm text-green-800">
                        ゾーン: {selected.zone} | コード: {selected.code}
                        {selected._count && selected.capacity && (
                          ` | 使用率: ${Math.round((selected._count.products / selected.capacity) * 100)}%`
                        )}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </NexusCard>

      {/* チェックリスト詳細 */}
      <NexusCard className="p-6">
        <h4 className="text-lg font-semibold mb-4">チェックリスト詳細</h4>
        <div className="space-y-4">
          {Object.entries(inspectionData.checklist).map(([categoryKey, categoryData]) => {
            const categoryLabel = checklistLabels[categoryKey as keyof typeof checklistLabels];
            if (!categoryLabel || !categoryData) return null;

            return (
              <div key={categoryKey} className="border rounded-lg p-4">
                <h5 className="font-medium mb-3">{categoryLabel.title}</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(categoryData).map(([itemKey, value]) => {
                    const itemLabel = categoryLabel.items[itemKey as keyof typeof categoryLabel.items];
                    return (
                      <div key={itemKey} className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center ${
                            value ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        >
                          {value ? (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm">{itemLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </NexusCard>

      {/* 撮影写真 */}
      <NexusCard className="p-6">
        <h4 className="text-lg font-semibold mb-4">撮影写真（{inspectionData.photos.length}枚）</h4>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {inspectionData.photos.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`検品写真 ${index + 1}`}
              className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90"
              onClick={() => window.open(photo, '_blank')}
            />
          ))}
        </div>
      </NexusCard>

      {/* 検品メモ */}
      <NexusCard className="p-6">
        <h4 className="text-lg font-semibold mb-4">検品メモ</h4>
        <NexusTextarea
          value={inspectionData.notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="検品時の気になる点や特記事項があれば記載してください"
          rows={4}
          className="w-full"
        />
      </NexusCard>

      {/* 確認事項 */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="w-6 h-6 mr-3 text-yellow-600 flex-shrink-0">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-yellow-800">送信前の確認</h4>
            <ul className="text-sm text-yellow-700 mt-2 space-y-1">
              <li>• すべての検品項目を正確にチェックしましたか？</li>
              <li>• 必要な写真はすべて撮影しましたか？</li>
              <li>• 特記事項がある場合は備考欄に記入しましたか？</li>
            </ul>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex justify-between gap-4">
        <NexusButton
          onClick={onPrev}
          variant="secondary"
          size="lg"
          disabled={loading}
        >
          戻る
        </NexusButton>
        
        <NexusButton
          onClick={handleSubmit}
          variant="primary"
          size="lg"
          disabled={loading || !selectedLocation}
          className="min-w-[180px] text-center justify-center px-6"
        >
          {loading ? '処理中...' : '次へ（検品完了）'}
        </NexusButton>
      </div>
    </div>
  );
} 