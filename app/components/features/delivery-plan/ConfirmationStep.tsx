'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusCard from '@/app/components/ui/NexusCard';
import PhotographyRequestDisplay from '@/app/components/features/photography/PhotographyRequestDisplay';
import HierarchicalChecklistDisplay from './HierarchicalChecklistDisplay';

import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { useIsHierarchicalChecklistEnabled } from '@/lib/hooks/useHierarchicalChecklistFeature';
import { ExternalLink } from 'lucide-react';
import { getCategoryLabel } from '@/lib/utils/category';

interface ConfirmationStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onPrev: () => void;
  onSubmit: () => void;
  isLastStep: boolean;
  loading: boolean;
}

export default function ConfirmationStep({ 
  data, 
  onUpdate, 
  onPrev, 
  onSubmit,
  isLastStep,
  loading
}: ConfirmationStepProps) {
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(data.confirmation?.agreedToTerms || false);
  
  // 🎛️ フィーチャーフラグ：階層型検品チェックリストの有効/無効
  const isHierarchicalEnabled = useIsHierarchicalChecklistEnabled();
  console.log(`[ConfirmationStep] 階層型検品チェックリスト: ${isHierarchicalEnabled ? '有効(新システム)' : '無効(既存システム)'}`);

  // コンポーネント表示時にスクロール位置を最上部に設定 - 確実な実装
  useEffect(() => {
    console.log('[ConfirmationStep] 確認画面表示、スクロール最上部へ');
    
    const scrollToTop = () => {
      // DashboardLayout内のスクロールコンテナを取得
      const scrollContainer = document.querySelector('.page-scroll-container');
      if (scrollContainer) {
        console.log('[ConfirmationStep] スクロールコンテナ発見、最上部へ移動');
        // 即座に最上部に移動（確認画面なので確実性最優先）
        scrollContainer.scrollTop = 0;
        
        // 確実性のため追加でもう一度実行
        setTimeout(() => {
          scrollContainer.scrollTop = 0;
        }, 50);
      } else {
        console.log('[ConfirmationStep] スクロールコンテナ未発見、windowスクロール使用');
        // フォールバック
        window.scrollTo(0, 0);
      }
    };

    // 即座に実行
    scrollToTop();
    
    // DOM準備完了後に再実行（確実性を最大化）
    const timeoutId1 = setTimeout(scrollToTop, 100);
    const timeoutId2 = setTimeout(scrollToTop, 200);
    
    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
    };
  }, []);

  // ログイン中のユーザー情報を取得
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const result = await response.json();
        
        if (result.success && result.user) {
          setUser(result.user);
        }
      } catch (error) {
        console.error('[ERROR] ユーザー情報の取得に失敗しました:', error);
      }
    };

    fetchUserInfo().catch(error => {
      console.error('[ERROR] fetchUserInfo Promise rejection:', error);
    });
  }, []);

  const handleTermsChange = (checked: boolean) => {
    setAgreedToTerms(checked);
    onUpdate({ 
      confirmation: { 
        agreedToTerms: checked, 
        generateBarcodes: true // 常にtrue
      } 
    });
  };

  const handleSubmit = () => {
    if (!agreedToTerms) {
      showToast({
        type: 'warning',
        title: '同意が必要',
        message: '利用規約とプライバシーポリシーに同意してください'
      });
      return;
    }
    onSubmit();
  };



  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-nexus-text-primary mb-4">確認・出力</h2>
        <p className="text-nexus-text-secondary mb-6">入力内容を確認して、納品プランを作成してください</p>
      </div>

      {/* 基本情報確認 */}
      <NexusCard className="p-6">
        <h3 className="text-lg font-medium text-nexus-text-primary mb-4">基本情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-nexus-text-secondary">セラー名:</span>
            <span className="ml-2 text-nexus-text-primary">{user?.fullName || user?.username || '未取得'}</span>
          </div>
          {user?.phoneNumber && (
            <div>
              <span className="font-medium text-nexus-text-secondary">電話番号:</span>
              <span className="ml-2 text-nexus-text-primary">{user.phoneNumber}</span>
            </div>
          )}
          <div>
            <span className="font-medium text-nexus-text-secondary">連絡先メール:</span>
            <span className="ml-2 text-nexus-text-primary">{user?.email || '未取得'}</span>
          </div>
          <div className="md:col-span-2">
            <span className="font-medium text-nexus-text-secondary">配送先倉庫:</span>
            <span className="ml-2 text-nexus-text-primary">{data.basicInfo?.warehouseName || '未選択'}</span>
          </div>
{/* 納品先住所は配送先倉庫で明確になるため、重複を避けるため非表示 */}
          {data.basicInfo?.notes && (
            <div className="md:col-span-2">
              <span className="font-medium text-nexus-text-secondary">備考:</span>
              <span
                className="ml-2 text-nexus-text-primary"
                dangerouslySetInnerHTML={{ __html: data.basicInfo.notes }}
              />
            </div>
          )}
        </div>
      </NexusCard>

      {/* 商品一覧確認 */}
      <NexusCard className="p-6">
        <h3 className="text-lg font-medium text-nexus-text-primary mb-4">登録商品一覧</h3>
        {data.products && data.products.length > 0 ? (
          <div className="space-y-4">
            {data.products.map((product: any, index: number) => (
              <NexusCard key={index} className="p-4 border-l-4 border-primary-blue bg-nexus-bg-tertiary">
                <div className="mb-2">
                  <h4 className="font-medium text-nexus-text-primary">{product.name}</h4>
                </div>
                
                {/* 商品基本情報 */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-nexus-text-secondary mb-4">
                  <div>
                    <span className="font-medium">カテゴリ:</span> 
                    {getCategoryLabel(product.category)}
                  </div>
                  <div>
                    <span className="font-medium">コンディション:</span> 
                    {product.condition === 'excellent' ? '優良' :
                     product.condition === 'very_good' ? '美品' :
                     product.condition === 'good' ? '良好' :
                     product.condition === 'fair' ? '普通' :
                     product.condition === 'poor' ? '要修理' : product.condition}
                  </div>
                  <div>
                    <span className="font-medium">購入価格:</span> 
                    ¥{product.purchasePrice?.toLocaleString() || '0'}
                  </div>
                  {product.purchaseDate && (
                    <div>
                      <span className="font-medium">仕入日:</span> {product.purchaseDate}
                    </div>
                  )}
                  {product.supplier && (
                    <div>
                      <span className="font-medium">仕入先:</span> {product.supplier}
                    </div>
                  )}
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
                            {image.category === 'product' ? '商品画像' :
                             image.category === 'package' ? '箱' :
                             image.category === 'accessory' ? '付属品' :
                             image.category === 'document' ? '書類' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 撮影要望表示 */}
                <div className="mb-4">
                  <PhotographyRequestDisplay
                    photographyRequests={typeof product.photographyRequest === 'string' 
                      ? JSON.parse(product.photographyRequest) 
                      : (product.photographyRequest || null)}
                    className=""
                  />
                </div>

                {/* プレミアム梱包表示 */}
                {console.log(`[DEBUG] 確認画面 商品${product.name} プレミアム梱包:`, product.premiumPacking)}
                {(product.premiumPacking === true || product.premiumPacking === 'true') && (
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

                {/* 検品チェックリスト表示 - フィーチャーフラグで新旧システム切り替え */}
                <div className="mb-4 border-t pt-4">
                  <div className="flex items-center mb-2">
                    <h5 className="text-sm font-medium text-nexus-text-primary">
                      検品チェックリスト（該当項目のみ表示）
                    </h5>
                  </div>

                  {/* フィーチャーフラグによる条件分岐 */}
                  {isHierarchicalEnabled ? (
                    /* ========== 新システム: 階層型検品チェックリスト表示 ========== */
                    product.hierarchicalInspectionData ? (
                      <HierarchicalChecklistDisplay 
                        data={product.hierarchicalInspectionData} 
                      />
                    ) : (
                      <div className="text-gray-500 text-sm py-4">
                        階層型検品データが未入力です
                      </div>
                    )
                  ) : (
                    /* ========== 既存システム: 統一検品チェックリスト表示 ========== */
                    product.inspectionChecklist ? (
                      <>
                        {/* 既存システムの表示をそのまま維持 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {/* 外装項目 */}
                      <div>
                        <h6 className="text-xs font-medium text-nexus-text-secondary mb-2">外装項目</h6>
                        <div className="space-y-1 text-xs">
                          <div className={product.inspectionChecklist.exterior?.scratches ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.exterior?.scratches ? '✓ 傷' : '○ 傷なし'}
                          </div>
                          <div className={product.inspectionChecklist.exterior?.dents ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.exterior?.dents ? '✓ 凹み' : '○ 凹みなし'}
                          </div>
                          <div className={product.inspectionChecklist.exterior?.discoloration ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.exterior?.discoloration ? '✓ スレ' : '○ スレなし'}
                          </div>
                          <div className={product.inspectionChecklist.exterior?.dust ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.exterior?.dust ? '✓ 汚れ' : '○ 汚れなし'}
                          </div>
                        </div>
                      </div>
                      
                      {/* 機能項目 */}
                      <div>
                        <h6 className="text-xs font-medium text-nexus-text-secondary mb-2">機能項目</h6>
                        <div className="space-y-1 text-xs">
                          <div className={product.inspectionChecklist.functionality?.powerOn ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.functionality?.powerOn ? '✓ 作動' : '○ 作動なし'}
                          </div>
                          <div className={product.inspectionChecklist.functionality?.allButtonsWork ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.functionality?.allButtonsWork ? '✓ 不動' : '○ 不動なし'}
                          </div>
                          <div className={product.inspectionChecklist.functionality?.screenDisplay ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.functionality?.screenDisplay ? '✓ クモリ' : '○ クモリなし'}
                          </div>
                          <div className={product.inspectionChecklist.functionality?.connectivity ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.functionality?.connectivity ? '✓ カビ' : '○ カビなし'}
                          </div>
                        </div>
                      </div>

                      {/* 光学系・その他項目 */}
                      <div>
                        <h6 className="text-xs font-medium text-nexus-text-secondary mb-2">光学系・その他項目</h6>
                        <div className="space-y-1 text-xs">
                          <div className={product.inspectionChecklist.optical?.lensClarity ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.optical?.lensClarity ? '✓ チリホコリ' : '○ チリホコリなし'}
                          </div>
                          <div className={product.inspectionChecklist.optical?.aperture ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.optical?.aperture ? '✓ キズ' : '○ キズなし'}
                          </div>
                          <div className={product.inspectionChecklist.optical?.focusAccuracy ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.optical?.focusAccuracy ? '✓ バッテリー' : '○ バッテリーなし'}
                          </div>
                          <div className={product.inspectionChecklist.optical?.stabilization ? 'text-red-600' : 'text-green-600'}>
                            {product.inspectionChecklist.optical?.stabilization ? '✓ ケース' : '○ ケースなし'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 検品メモ */}
                    {product.inspectionChecklist.notes && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <span className="text-xs font-medium text-yellow-800">検品メモ:</span>
                        <div
                          className="text-xs text-yellow-700 mt-1"
                          dangerouslySetInnerHTML={{ __html: product.inspectionChecklist.notes }}
                        />
                      </div>
                    )}
                      </>
                    ) : (
                      <div className="text-gray-500 text-sm py-4">
                        検品データが未入力です
                      </div>
                    )
                  )}
                </div>

                {/* 仕入詳細 */}
                {product.supplierDetails && (
                  <div className="mt-3">
                    <h6 className="text-sm font-medium text-nexus-text-primary">仕入詳細</h6>
                    <div
                      className="mt-1 p-3 bg-nexus-bg-tertiary border border-nexus-border rounded-lg text-sm text-nexus-text-primary"
                      data-testid="supplier-details-box"
                    >
                      {product.supplierDetails}
                    </div>
                  </div>
                )}
              </NexusCard>
            ))}
            <NexusCard className="p-4 border-2 border-primary-blue bg-nexus-bg-tertiary">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-nexus-text-primary">登録商品数:</span>
                <span className="text-xl font-bold text-primary-blue">
                  {data.products.length}点
                </span>
              </div>
            </NexusCard>
          </div>
        ) : (
          <p className="text-nexus-text-secondary">商品が登録されていません</p>
        )}
      </NexusCard>

      {/* 出力情報 */}
      <NexusCard className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-medium text-nexus-text-primary mb-4">出力内容</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-800">バーコードラベル</h4>
              <p className="text-sm text-blue-700">商品管理用のバーコードラベルPDFを自動生成します</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-800">納品プラン詳細</h4>
              <p className="text-sm text-blue-700">商品情報、検品チェックリスト等を含む納品プランを作成します</p>
            </div>
          </div>
        </div>
      </NexusCard>

      {/* 規約同意 */}
      <NexusCard className="p-6 bg-yellow-50 border-yellow-200">
        <h3 className="text-lg font-medium text-nexus-text-primary mb-4">利用規約・プライバシーポリシーへの同意</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => handleTermsChange(e.target.checked)}
              className="w-4 h-4 text-primary-blue border-nexus-border rounded focus:ring-primary-blue flex-shrink-0"
            />
            <label className="ml-3 text-sm text-nexus-text-primary leading-relaxed">
              <span className="text-red-500">*</span> 
              THE WORLD DOORの
              <Link 
                href="/terms" 
                target="_blank" 
                className="text-primary-blue hover:text-blue-700 underline inline-flex items-center mx-1"
              >
                利用規約
                <ExternalLink className="w-3 h-3 ml-1" />
              </Link>
              および
              <Link 
                href="/privacy-policy" 
                target="_blank" 
                className="text-primary-blue hover:text-blue-700 underline inline-flex items-center mx-1"
              >
                プライバシーポリシー
                <ExternalLink className="w-3 h-3 ml-1" />
              </Link>
              に同意します
            </label>
          </div>
        </div>
      </NexusCard>

      <div className="flex justify-between pt-6">
        <NexusButton variant="default" onClick={onPrev} disabled={loading}>
          前に戻る
        </NexusButton>
        <NexusButton 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={loading || !agreedToTerms}
        >
          {loading ? '作成中...' : '納品プランを作成'}
        </NexusButton>
      </div>
    </div>
  );
} 