'use client';

import { useState, useEffect } from 'react';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusCard from '@/app/components/ui/NexusCard';
import BasicInfoStep from './BasicInfoStep';
import ProductRegistrationStep from './ProductRegistrationStep';
import ConfirmationStep from './ConfirmationStep';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { useAlert } from '@/app/components/ui/AlertProvider';

interface WizardStep {
  id: number;
  title: string;
  component: React.ComponentType<any>;
}

interface DeliveryPlanData {
  basicInfo: {
    warehouseId: string;
    warehouseName: string;
    deliveryAddress: string;
    notes?: string;
  };
  products: Array<{
    name: string;
    category: 'camera_body' | 'lens' | 'watch' | 'accessory';
    brand: string;
    model: string;
    serialNumber?: string;
    estimatedValue: number;
    description?: string;
  }>;
  confirmation: {
    agreedToTerms: boolean;
    generateBarcodes: boolean;
  };
}

const steps: WizardStep[] = [
  { id: 1, title: '基本情報', component: BasicInfoStep },
  { id: 2, title: '商品登録', component: ProductRegistrationStep },
  { id: 3, title: '確認・出力', component: ConfirmationStep },
];

export default function DeliveryPlanWizard() {
  const { showToast } = useToast();
  const { showAlert } = useAlert();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planData, setPlanData] = useState<DeliveryPlanData>({
    basicInfo: {
      warehouseId: '',
      warehouseName: '',
      deliveryAddress: '',
    },
    products: [],
    confirmation: {
      agreedToTerms: false,
      generateBarcodes: true,
    },
  });

  // ステップ変更時にページトップにスクロール - 確実な実装
  useEffect(() => {
    console.log('[DeliveryPlanWizard] ステップ変更:', currentStep);
    
    // DOM準備完了まで待機してからスクロール
    const scrollToTop = () => {
      // DashboardLayout内のスクロールコンテナを取得
      const scrollContainer = document.querySelector('.page-scroll-container');
      if (scrollContainer) {
        console.log('[DeliveryPlanWizard] スクロールコンテナ発見、最上部へ移動');
        // 即座に最上部に移動（確認画面なので滑らかさより確実性を優先）
        scrollContainer.scrollTop = 0;
      } else {
        console.log('[DeliveryPlanWizard] スクロールコンテナ未発見、windowスクロール使用');
        // フォールバック
        window.scrollTo(0, 0);
      }
    };

    // 即座に実行
    scrollToTop();
    
    // DOM準備のため少し遅延してもう一度実行
    const timeoutId = setTimeout(scrollToTop, 100);
    
    return () => clearTimeout(timeoutId);
  }, [currentStep]);

  const updatePlanData = (stepData: Partial<DeliveryPlanData>) => {
    setPlanData(prev => {
      const updated = { ...prev, ...stepData };
      // productsが常に配列であることを保証
      if ('products' in stepData && !Array.isArray(updated.products)) {
        updated.products = [];
      }
      return updated;
    });
  };

  const scrollToTop = () => {
    console.log('[DeliveryPlanWizard] スクロール処理実行');
    const scrollContainer = document.querySelector('.page-scroll-container');
    if (scrollContainer) {
      console.log('[DeliveryPlanWizard] .page-scroll-container発見、スクロール実行');
      scrollContainer.scrollTop = 0;
    } else {
      console.log('[DeliveryPlanWizard] .page-scroll-container未発見、window使用');
      window.scrollTo(0, 0);
    }
  };

  const nextStep = () => {
    console.log('[DeliveryPlanWizard] nextStep実行');
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    // ステップ変更後に即座にスクロール
    setTimeout(scrollToTop, 50);
  };

  const prevStep = () => {
    console.log('[DeliveryPlanWizard] prevStep実行');
    setCurrentStep(prev => Math.max(prev - 1, 0));
    // ステップ変更後に即座にスクロール
    setTimeout(scrollToTop, 50);
  };

  const submitPlan = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[DEBUG] 送信データ:', planData);
      console.log('[DEBUG] basicInfo:', planData.basicInfo);
      console.log('[DEBUG] products:', planData.products?.length, '件');
      if (planData.products) {
        planData.products.forEach((product: any, index: number) => {
          console.log(`[DEBUG] 商品${index + 1}:`, {
            name: product?.name,
            condition: product?.condition,
            purchasePrice: product?.purchasePrice,
            photographyRequest: product?.photographyRequest,
            photographyType: product?.photographyRequest?.photographyType,
            premiumPacking: product?.premiumPacking
          });
        });
      }

      const response = await fetch('/api/delivery-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData),
      });

      const result = await response.json();
      console.log('[DEBUG] API応答:', result);
      console.log('[DEBUG] レスポンスステータス:', response.status);
      console.log('[DEBUG] レスポンスOK:', response.ok);
      
      if (!response.ok) {
        // 具体的なエラーメッセージを表示
        let errorMessage = '納品プランの作成に失敗しました。';
        
        if (result.error) {
          errorMessage = result.error;
        } else if (response.status === 400) {
          errorMessage = '入力データに問題があります。以下をご確認ください：\n' +
                       '• 配送先倉庫が選択されているか\n' +
                       '• 商品が登録されているか\n' +
                       '• 必要な情報が入力されているか';
        } else if (response.status === 401) {
          errorMessage = 'ログインが必要です。再度ログインしてください。';
        } else if (response.status === 500) {
          errorMessage = 'サーバーエラーが発生しました。しばらくしてから再度お試しください。';
        }
        
        showAlert({
          type: 'error',
          title: '納品プラン作成エラー',
          message: errorMessage,
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

      // 成功の場合
      // PDFダウンロード処理
      if (result.pdfUrl) {
        console.log('[DEBUG] PDF URL:', result.pdfUrl);
        try {
          // PDFを取得してBase64で表示
          const pdfResponse = await fetch(result.pdfUrl);
          if (pdfResponse.ok) {
            const pdfData = await pdfResponse.json();
            if (pdfData.success && pdfData.base64Data) {
              try {
                console.log('[DEBUG] PDF Base64データ長:', pdfData.base64Data.length);
                
                // Base64データをバイナリに変換
                const binaryString = atob(pdfData.base64Data);
                const bytes = new Uint8Array(binaryString.length);
                
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                
                console.log('[DEBUG] PDF バイト配列作成完了:', bytes.length, 'bytes');
                
                // PDFブロブを作成
                const pdfBlob = new Blob([bytes], { type: 'application/pdf' });
                console.log('[DEBUG] PDF Blob作成完了:', pdfBlob.size, 'bytes');
                
                // ダウンロードリンクを作成してクリック
                const pdfUrl = URL.createObjectURL(pdfBlob);
                const downloadLink = document.createElement('a');
                downloadLink.href = pdfUrl;
                downloadLink.download = `delivery-plan-${result.planId || 'unknown'}-barcodes.pdf`;
                downloadLink.style.display = 'none';
                
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                
                console.log('[DEBUG] PDFダウンロード完了');
                
                // 少し遅延してURLを解放
                setTimeout(() => {
                  URL.revokeObjectURL(pdfUrl);
                  console.log('[DEBUG] PDF URL解放完了');
                }, 2000);
                
              } catch (pdfProcessError) {
                console.error('[ERROR] PDF処理エラー:', pdfProcessError);
                throw pdfProcessError;
              }
            } else {
              console.error('[ERROR] PDF generation failed:', pdfData);
              showAlert({
                type: 'error',
                title: 'PDFダウンロードエラー',
                message: 'PDFの生成に失敗しました。',
                actions: [{ label: '確認', action: () => {}, variant: 'primary' }]
              });
            }
          } else {
            console.error('[ERROR] PDF fetch failed:', pdfResponse.status);
            showAlert({
              type: 'error',
              title: 'PDFダウンロードエラー',
              message: 'PDFの取得に失敗しました。',
              actions: [{ label: '確認', action: () => {}, variant: 'primary' }]
            });
          }
        } catch (pdfError) {
          console.error('[ERROR] PDF display error:', pdfError);
          showAlert({
            type: 'error',
            title: 'PDFダウンロードエラー',
            message: 'PDFの表示でエラーが発生しました。',
            actions: [{ label: '確認', action: () => {}, variant: 'primary' }]
          });
        }
      }
      
      // 成功メッセージ表示後、リダイレクト
      showAlert({
        type: 'success',
        title: '納品プラン作成完了',
        message: `納品プラン「${result.planId}」が正常に作成されました。`,
        actions: [
          {
            label: '納品管理画面へ',
            action: () => {
              window.location.href = '/delivery';
            },
            variant: 'primary'
          }
        ]
      });
      
    } catch (err) {
      console.error('[ERROR] 納品プラン送信エラー:', err);
      console.error('[ERROR] エラータイプ:', typeof err);
      console.error('[ERROR] エラー内容:', err);
      
      // ネットワークエラーなどの場合はアラートボックスで対処を促す
      showAlert({
        type: 'error',
        title: '接続エラー',
        message: 'サーバーとの通信に失敗しました。しばらく時間をおいて再度お試しください。',
        actions: [
          {
            label: '再試行',
            action: () => submitPlan(),
            variant: 'primary'
          },
          {
            label: '閉じる',
            action: () => {},
            variant: 'secondary'
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="max-w-4xl mx-auto">
      {/* ステップインジケーター */}
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
          >
            <div className="flex items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= index
                    ? 'bg-primary-blue text-white'
                    : 'bg-nexus-bg-tertiary text-nexus-text-secondary border border-nexus-border'
                  }
                `}
              >
                {currentStep > index ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span 
                className={`ml-2 font-medium hidden sm:inline ${
                  currentStep >= index ? 'text-primary-blue' : 'text-nexus-text-secondary'
                }`}
                data-testid={`step-${step.id}-label`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div
                  className={`h-1 rounded-full ${
                    currentStep > index ? 'bg-primary-blue' : 'bg-nexus-border'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* エラー表示 */}
      {error && (
        <NexusCard className="p-4 mb-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </NexusCard>
      )}

      {/* ステップコンテンツ */}
      <NexusCard className="p-6">
        <CurrentStepComponent
          data={planData}
          onUpdate={updatePlanData}
          onNext={nextStep}
          onPrev={prevStep}
          onSubmit={submitPlan}
          isFirstStep={currentStep === 0}
          isLastStep={currentStep === steps.length - 1}
          loading={loading}
        />
      </NexusCard>
    </div>
  );
}