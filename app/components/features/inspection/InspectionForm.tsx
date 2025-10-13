'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import InspectionChecklist from './InspectionChecklist';
import InspectionChecklistInput, { InspectionChecklistData } from './InspectionChecklistInput';
import HierarchicalInspectionChecklistInput from './HierarchicalInspectionChecklistInput';
import { useIsHierarchicalChecklistEnabled } from '@/lib/hooks/useHierarchicalChecklistFeature';
import PhotoUploader from './PhotoUploader';
import InspectionResult from './InspectionResult';
import PackagingAndLabelStep from './PackagingAndLabelStep';
import ShelfStorageStep from './ShelfStorageStep';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import ConfirmationModal from '@/app/components/ui/ConfirmationModal';
import PhotographyRequestDisplay from '@/app/components/features/photography/PhotographyRequestDisplay';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { getCategoryLabel } from '@/lib/utils/category';

export interface InspectionFormProps {
  productId: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  model: string;
  status: string;
  imageUrl?: string;
  metadata?: string;
  // 納品プラン関連情報（metadataから取得）
  deliveryPlanInfo?: {
    condition: string;
    purchasePrice: number;
    purchaseDate: string;
    supplier: string;
    supplierDetails: string;
    images: Array<{url: string, filename: string, category: string}>;
    photographyRequests?: {
      specialPhotography: boolean;
      specialPhotographyItems: string[];
      customRequests: string;
    };
  };
}

interface ExistingInspectionChecklist {
  id: string;
  productId?: string;
  deliveryPlanProductId?: string;
  hasScratches: boolean;
  hasDents: boolean;
  hasDiscoloration: boolean;
  hasDust: boolean;
  powerOn: boolean;
  allButtonsWork: boolean;
  screenDisplay: boolean;
  connectivity: boolean;
  lensClarity: boolean;
  aperture: boolean;
  focusAccuracy: boolean;
  stabilization: boolean;
  notes?: string;
  createdBy: string;
  createdAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  updatedBy?: string;
  updatedAt: string;
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
  photoSlots?: any[]; // 写真の配置情報
  notes: string;
  inspectionDate: string;
  inspectorId: string;
  result: 'passed' | 'failed' | 'conditional';
  skipPhotography?: boolean; // 撮影をスキップするかどうか
}

export default function InspectionForm({ productId }: InspectionFormProps) {
  const { showToast } = useToast();
  
  // 🎛️ フィーチャーフラグ：階層型検品チェックリストの有効/無効
  const isHierarchicalEnabled = useIsHierarchicalChecklistEnabled();
  
  const [product, setProduct] = useState<Product | null>(null);
  
  // 🆕 新システム：階層型検品データの状態管理
  const [hierarchicalInspectionData, setHierarchicalInspectionData] = useState<any>({
    responses: {},
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [existingChecklist, setExistingChecklist] = useState<ExistingInspectionChecklist | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const stepIndicatorRef = useRef<HTMLDivElement>(null);
  const [inspectionData, setInspectionData] = useState<InspectionData>({
    productId,
    checklist: {
      exterior: {
        scratches: false,
        dents: false,
        discoloration: false,
        dust: false,
      },
      functionality: {
        powerOn: false,
        allButtonsWork: false,
        screenDisplay: false,
        connectivity: false,
      },
      optical: {
        lensClarity: false,
        aperture: false,
        focusAccuracy: false,
        stabilization: false,
      },
    },
    photos: [],
    notes: '',
    inspectionDate: new Date().toISOString(),
    inspectorId: 'staff-001', // 実際はAuthから取得
    result: 'passed',
  });

  const steps = [
    { 
      id: 1, 
      title: '検品項目', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 2, 
      title: '写真撮影', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { 
      id: 3, 
      title: '梱包・ラベル', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7H21L19 2H5L3 7ZM3 7L5 21H19L21 7" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12H15" />
        </svg>
      )
    },
    { 
      id: 4, 
      title: '棚保管', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m3 0H4a2 2 0 00-2 2v14a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zM9 12h6m-6 4h6" />
        </svg>
      )
    },
  ];

  // 保存された進捗を読み込む関数
  const loadProgress = async () => {
    try {
      const response = await fetch(`/api/products/inspection/progress/${productId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const progressData = await response.json();
        
        // 保存された進捗が存在する場合は復元
        if (progressData.currentStep) {
          console.log(`[INFO] Restoring progress for product ${productId}:`, progressData);
          
          setCurrentStep(progressData.currentStep);
          setInspectionData(prev => ({
            ...prev,
            checklist: progressData.checklist || prev.checklist,
            photos: progressData.photos || prev.photos,
            photoSlots: progressData.photoSlots || prev.photoSlots,
            notes: progressData.notes || prev.notes,
          }));
          setVideoId(progressData.videoId || null);
          
          // Toast表示は別のuseEffectで行う
          return progressData;
        }
      }
      // エラーの場合は新規開始（ログは出力するが処理は継続）
      return null;
    } catch (error) {
      console.error('[INFO] No previous progress found, starting fresh:', error);
      return null;
    }
  };

  useEffect(() => {
    // 商品情報を取得と進捗復元を並行実行
    const init = async () => {
      try {
        // 商品情報とセラーが入力した検品チェックリストを取得
        const [productResponse, checklistResponse] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch(`/api/products/${productId}/inspection-checklist`)
        ]);

        if (productResponse.ok) {
          const productData = await productResponse.json();
          
          console.log('[INFO] 商品データ受信確認:', {
            hasDeliveryPlanInfo: !!productData.deliveryPlanInfo,
            deliveryPlanInfoFromAPI: JSON.stringify(productData.deliveryPlanInfo, null, 2),
            hasMetadata: !!productData.metadata,
            productName: productData.name
          });
          
          // メタデータから納品プラン情報を抽出（APIからdeliveryPlanInfoが取得されていない場合のみ）
          let enrichedProduct = { ...productData };
          
          if (productData.deliveryPlanInfo) {
            console.log('[INFO] API経由でdeliveryPlanInfo既に取得済み');
          } else if (productData.metadata) {
            console.log('[INFO] メタデータからdeliveryPlanInfo構築を開始');
            try {
              let metadata;
              
              // metadataが既にオブジェクトの場合と文字列の場合に対応
              if (typeof productData.metadata === 'string') {
                metadata = JSON.parse(productData.metadata);
              } else if (typeof productData.metadata === 'object' && productData.metadata !== null) {
                metadata = productData.metadata;
              } else {
                throw new Error('metadata is not a valid string or object');
              }
              
              console.log('[INFO] Product metadata詳細:', JSON.stringify(metadata, null, 2));
              console.log('[INFO] 撮影要望データチェック詳細:', {
                hasPhotographyRequests: !!metadata.photographyRequests,
                photographyRequestsRaw: JSON.stringify(metadata.photographyRequests, null, 2),
                photographyRequestsType: typeof metadata.photographyRequests
              });
              
              // 納品プラン関連情報を抽出して構造化（型安全処理）
              enrichedProduct.deliveryPlanInfo = {
                condition: typeof metadata.condition === 'string' ? metadata.condition : '',
                purchasePrice: typeof metadata.purchasePrice === 'number' ? metadata.purchasePrice : 0,
                purchaseDate: typeof metadata.purchaseDate === 'string' ? metadata.purchaseDate : '',
                supplier: typeof metadata.supplier === 'string' ? metadata.supplier : '',
                supplierDetails: typeof metadata.supplierDetails === 'string' ? metadata.supplierDetails : '',
                images: Array.isArray(metadata.images) ? metadata.images : [],
                photographyRequests: metadata.photographyRequests ? metadata.photographyRequests : null
              };
              
              console.log('[INFO] 納品プラン情報を抽出詳細:', JSON.stringify(enrichedProduct.deliveryPlanInfo, null, 2));
            } catch (error) {
              console.warn('[WARN] metadata解析エラー:', error);
              enrichedProduct.deliveryPlanInfo = {
                condition: '',
                purchasePrice: 0,
                purchaseDate: '',
                supplier: '',
                supplierDetails: '',
                images: []
              };
            }
          } else {
            console.log('[INFO] メタデータもdeliveryPlanInfoも存在しない - デフォルト値で初期化');
            enrichedProduct.deliveryPlanInfo = {
              condition: '',
              purchasePrice: 0,
              purchaseDate: '',
              supplier: '',
              supplierDetails: '',
              images: []
            };
          }
          
          setProduct(enrichedProduct);

          // 🆕 特別撮影項目のスロットを動的に生成
          if (enrichedProduct.deliveryPlanInfo?.photographyRequests?.specialPhotographyItems) {
            const specialItems = enrichedProduct.deliveryPlanInfo.photographyRequests.specialPhotographyItems;
            console.log('[INFO] 特別撮影項目検出:', specialItems);
            
            // 基本スロットを取得
            const baseSlots = [
              { id: 'front', label: '正面', description: '正面全体', photos: [], required: true },
              { id: 'back', label: '背面', description: '背面全体', photos: [], required: false },
              { id: 'left', label: '左側面', description: '左側全体', photos: [], required: false },
              { id: 'right', label: '右側面', description: '右側全体', photos: [], required: false },
              { id: 'top', label: '上面', description: '上から見た写真', photos: [], required: false },
              { id: 'detail', label: '詳細', description: '傷・特徴部分', photos: [], required: false },
            ];
            
            // 特別撮影項目ラベル定義
            const specialLabels: { [key: string]: string } = {
              'diagonal_45': '斜め45度',
              'functional_details': '機能詳細',
              'accessories_individual': '付属品個別',
              'macro_closeup': 'マクロ接写',
              'lighting_studio': 'スタジオ照明',
              'background_white': '白背景',
              'packaging_box': '梱包状態',
              'serial_numbers': 'シリアル番号',
              'damage_focus': '損傷焦点',
              'comparison_size': 'サイズ比較',
              // 追加項目
              'closeup': 'クローズアップ',
              'internal_structure': '内部構造',
              'accessories': '付属品',
              'other': 'その他',
            };
            
            // 特別撮影スロットを生成
            const specialSlots = specialItems.map((itemId: string) => ({
              id: `special_${itemId}`,
              label: specialLabels[itemId] || itemId,
              description: `特別撮影: ${specialLabels[itemId] || itemId}`,
              photos: [],
              required: true,
            }));
            
            console.log('[INFO] 生成された特別撮影スロット:', specialSlots);
            
            // InspectionDataのphotoSlotsを更新
            setInspectionData(prev => ({
              ...prev,
              photoSlots: [...baseSlots, ...specialSlots]
            }));
          }

          // 🆕 階層型検品データがある場合は設定
          if (enrichedProduct.deliveryPlanInfo?.hierarchicalInspectionChecklist) {
            const hierarchicalData = enrichedProduct.deliveryPlanInfo.hierarchicalInspectionChecklist;
            console.log('[INFO] 階層型検品データを設定:', hierarchicalData);
            
            // responsesを適切な形式に変換
            const convertedResponses = hierarchicalData.responses.reduce((acc: any, response: any) => {
              if (!acc[response.categoryId]) {
                acc[response.categoryId] = {};
              }
              acc[response.categoryId][response.itemId] = {
                booleanValue: response.booleanValue,
                textValue: response.textValue
              };
              return acc;
            }, {});

            setHierarchicalInspectionData({
              responses: convertedResponses,
              notes: hierarchicalData.notes || '',
              createdBy: hierarchicalData.createdBy,
              createdAt: hierarchicalData.createdAt,
              verifiedBy: hierarchicalData.verifiedBy,
              verifiedAt: hierarchicalData.verifiedAt
            });
          }
        } else {
          // デモ用フォールバック
          setProduct({
            id: productId,
            name: 'Canon EOS R5 ボディ',
            sku: `TWD-2024-${productId}`,
            category: 'camera_body',
            brand: 'Canon',
            model: 'EOS R5',
            status: 'pending_inspection',
            imageUrl: '/api/placeholder/400/300',
            deliveryPlanInfo: {
              condition: 'excellent',
              purchasePrice: 350000,
              purchaseDate: '2024-01-15',
              supplier: 'デモ仕入先',
              supplierDetails: 'デモ用の商品データです。実際の納品プランから取得される情報が表示されます。',
              images: []
            }
          });
          console.log('[DEBUG] デモ用商品データを設定 - カテゴリー: camera_body');
        }

        // セラーが入力した検品チェックリストがある場合は読み込み
        if (checklistResponse.ok) {
          const checklistData = await checklistResponse.json();
          if (checklistData) {
            setExistingChecklist(checklistData);
            
            // 既存のチェックリストデータを検品データに反映
            setInspectionData(prev => ({
              ...prev,
              checklist: {
                exterior: {
                  scratches: checklistData.hasScratches,
                  dents: checklistData.hasDents,
                  discoloration: checklistData.hasDiscoloration,
                  dust: checklistData.hasDust,
                },
                functionality: {
                  powerOn: checklistData.powerOn,
                  allButtonsWork: checklistData.allButtonsWork,
                  screenDisplay: checklistData.screenDisplay,
                  connectivity: checklistData.connectivity,
                },
                optical: {
                  lensClarity: checklistData.lensClarity,
                  aperture: checklistData.aperture,
                  focusAccuracy: checklistData.focusAccuracy,
                  stabilization: checklistData.stabilization,
                },
              },
              notes: checklistData.notes || prev.notes,
            }));

            showToast({
              type: 'info',
              title: 'セラー入力データを読み込みました',
              message: `セラー ${checklistData.createdBy} が入力した検品チェックリストを表示しています`,
              duration: 4000
            });
          }
        }

        // 保存された進捗を読み込み
        const restoredProgress = await loadProgress();
        
        // 進捗復元のトースト表示
        if (restoredProgress && !existingChecklist) {
          setTimeout(() => {
            showToast({
              type: 'info',
              title: '前回の作業を復元しました',
              message: `ステップ${restoredProgress.currentStep}「${getStepName(restoredProgress.currentStep)}」から再開します`,
              duration: 4000
            });
          }, 500); // 少し遅延させてUIの初期化を待つ
        }
        
      } catch (error) {
        console.error('[ERROR] Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [productId]);

  // クエリパラメータ step により初期表示ステップを上書き（例: ?step=4 で棚保管を開く）
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const stepParam = url.searchParams.get('step');
      if (stepParam) {
        const stepNum = parseInt(stepParam, 10);
        if ([1,2,3,4].includes(stepNum)) {
          console.log(`[InspectionForm] URLパラメータからstep=${stepNum}を設定`);
          setCurrentStep(stepNum);
          // step指定で来た場合はUI初期化が落ち着くまで待ってからタブ部分にスクロール
          setTimeout(() => {
            scrollToTabs();
          }, 500);
          
          // step=4（棚保管）の場合は追加で棚番号入力フィールドにフォーカス
          if (stepNum === 4) {
            console.log('[InspectionForm] Step 4検知: 棚番号入力フィールドフォーカス設定');
            
            // 複数のタイミングでフォーカス設定を試行
            const setShelfFocus = () => {
              const shelfInput = document.querySelector('input[placeholder*="棚番号"]') as HTMLInputElement;
              if (shelfInput) {
                console.log('[InspectionForm] 棚番号入力フィールドにフォーカス設定成功');
                shelfInput.focus();
                return true;
              }
              console.log('[InspectionForm] 棚番号入力フィールドが見つかりません');
              return false;
            };
            
            // 段階的にフォーカス設定を試行
            setTimeout(() => setShelfFocus(), 600);
            setTimeout(() => setShelfFocus(), 1000);
            setTimeout(() => setShelfFocus(), 1500);
            setTimeout(() => setShelfFocus(), 2000);
          }
        }
      }
    } catch (e) {
      // no-op
    }
  }, []);

  // ステップ名を取得するヘルパー関数
  const getStepName = (step: number): string => {
    switch (step) {
      case 1: return '検品項目';
      case 2: return '写真撮影';
      case 3: return '梱包・ラベル';
      case 4: return '棚保管';
      default: return '不明';
    }
  };

  // タブ部分にスクロールする関数
  const scrollToTabs = () => {
    if (stepIndicatorRef.current) {
      stepIndicatorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // ステップ変更時の処理
  const handleStepChange = async (stepId: number) => {
    // ステップ2（撮影）からステップ3（梱包）への移行時は撮影データを保存
    if (currentStep === 2 && stepId === 3) {
      console.log('[DEBUG] ステップ2→3: 撮影データ保存開始');
      setLoading(true);
      
      try {
        // 撮影データを保存
        const photographyData = {
          photos: inspectionData.photos,
          notes: inspectionData.notes || ''
        };

        console.log('[DEBUG] 撮影データ送信:', { productId, photographyData });

        const response = await fetch(`/api/products/${productId}/photography`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(photographyData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[ERROR] 撮影API失敗:', response.status, errorText);
          throw new Error(`撮影データ保存に失敗: ${response.status}`);
        }

        const savedData = await response.json();
        console.log('[DEBUG] 撮影データ保存完了:', savedData);

        // 検品進捗を更新（ステップ3に進行）
        console.log('[DEBUG] 検品進捗更新開始: ステップ3へ');
        const progressResponse = await fetch('/api/products/inspection/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            currentStep: 3,  // ステップ3: 梱包・ラベル
            checklist: inspectionData.checklist,
            photos: inspectionData.photos,
            notes: inspectionData.notes,
            status: 'inspection'  // 検品継続中
          })
        });

        if (!progressResponse.ok) {
          const progressError = await progressResponse.text();
          console.error('[ERROR] 検品進捗更新失敗:', progressResponse.status, progressError);
          throw new Error(`検品進捗更新に失敗: ${progressResponse.status}`);
        }

        const progressData = await progressResponse.json();
        console.log('[DEBUG] 検品進捗更新完了:', progressData);

        showToast({
          type: 'success',
          title: '撮影完了',
          message: '撮影データを保存しました。梱包・ラベル工程に進みます。',
          duration: 3000
        });

      } catch (error) {
        console.error('[ERROR] 撮影データ保存エラー:', error);
        showToast({
          type: 'error',
          title: '撮影保存エラー',
          message: error instanceof Error ? error.message : '撮影データの保存に失敗しました',
          duration: 5000
        });
        setLoading(false);
        return; // エラー時は進行を停止
      } finally {
        setLoading(false);
      }
    }

    setCurrentStep(stepId);
    // 少し遅延してからスクロール（状態更新後にスクロール）
    setTimeout(() => {
      scrollToTabs();
    }, 100);
  };

  const updateChecklist = (category: string, item: string, value: boolean) => {
    setInspectionData(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [category]: {
          ...prev.checklist[category as keyof typeof prev.checklist],
          [item]: value,
        },
      },
    }));
  };

  const updatePhotos = useCallback((photos: string[], photoSlots?: any[]) => {
    setInspectionData(prev => ({
      ...prev,
      photos,
      photoSlots: photoSlots || prev.photoSlots,
    }));
  }, []);

  // 部分保存機能（各ステップで作業を中断して保存）
  // キャンセルして一覧に戻る（保存しない）
  const handleCancelAndReturn = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancelAndReturn = () => {
    // 適切な一覧画面に戻る（保存は行わない）
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from') === 'inventory') {
      // 在庫画面から来た場合は在庫画面に戻る（状態復元なし）
      window.location.href = '/staff/inventory';
    } else {
      // その他の場合は検品一覧に戻る（状態復元なし）
      window.location.href = '/staff/inspection';
    }
  };

  const saveProgress = async (step: number) => {
    try {
      setLoading(true);
      
      // ステップ2（撮影）を保存する場合は、撮影データも一緒に保存
      if (step === 2 && inspectionData.photos && inspectionData.photos.length > 0) {
        console.log('[DEBUG] ステップ2保存: 撮影データも一緒に保存');
        
        const photographyData = {
          photos: inspectionData.photos,
          photoSlots: inspectionData.photoSlots || [],
          notes: inspectionData.notes || ''
        };

        console.log('[DEBUG] 撮影データ保存（部分保存）:', { 
          productId, 
          photos: photographyData.photos.length,
          photoSlots: photographyData.photoSlots.map(slot => ({ id: slot.id, photos: slot.photos.length }))
        });

        try {
          const response = await fetch(`/api/products/${productId}/photography`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(photographyData),
          });

          if (response.ok) {
            const savedData = await response.json();
            console.log('[DEBUG] 撮影データ保存完了（部分保存）:', savedData);
            
            showToast({
              type: 'success',
              title: '撮影データ保存完了',
              message: '撮影した画像を保存しました',
              duration: 3000
            });
          } else {
            console.warn('[WARN] 撮影データ保存失敗（部分保存）:', response.status);
          }
        } catch (photographyError) {
          console.error('[ERROR] 撮影データ保存エラー（部分保存）:', photographyError);
        }
      }
      
      const progressData = {
        productId,
        currentStep: step,
        checklist: inspectionData.checklist,
        photos: inspectionData.photos,
        photoSlots: inspectionData.photoSlots || [],
        notes: inspectionData.notes,
        videoId: videoId,
        lastUpdated: new Date().toISOString(),
        status: step === 2 && inspectionData.photos?.length > 0 ? 'inspection' : 'inspecting', // 撮影完了なら inspection
      };

      // 進捗保存API（新規作成）
      const response = await fetch(`/api/products/inspection/progress`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progressData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[ERROR] API Response Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.details || errorData.error || `進捗保存に失敗しました: ${response.status} ${response.statusText}`);
      }

      showToast({
        type: 'success',
        title: '進捗を保存しました',
        message: `ステップ${step}までの作業内容を保存しました。後で続きから再開できます。`,
        duration: 3000
      });
      
      // 適切な一覧画面に戻る（状態復元フラグ付き）
      setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('from') === 'inventory') {
          // 在庫画面から来た場合は状態復元フラグ付きで在庫画面に戻る
          window.location.href = '/staff/inventory?restored=1';
        } else {
          // その他の場合は検品一覧に戻る
          window.location.href = '/staff/inspection?restored=1';
        }
      }, 1500);
      
    } catch (error) {
      console.error('[ERROR] Progress save - Full error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      showToast({
        type: 'error',
        title: '進捗保存エラー',
        message: error instanceof Error ? error.message : '進捗保存中にエラーが発生しました。コンソールで詳細を確認してください。',
        duration: 6000
      });
    } finally {
      setLoading(false);
    }
  };

  const submitInspection = async (inspectionOnly = false, locationId?: string) => {
    try {
      setLoading(true);
      
      // 検品のみの場合はskipPhotographyフラグをセット
      const dataToValidate = inspectionOnly 
        ? { ...inspectionData, skipPhotography: true }
        : inspectionData;
      
      // バリデーション
      const validationResult = validateInspectionData(dataToValidate);
      if (!validationResult.isValid) {
        showToast({
          type: 'warning',
          title: '検品データ不備',
          message: validationResult.errors.join(', '),
          duration: 4000
        });
        setLoading(false);
        return;
      }
      
      // 検品結果を判定
      let result: 'passed' | 'failed' | 'conditional' = 'passed';
      
      if (inspectionData.checklist && Object.keys(inspectionData.checklist).length > 0) {
        const allChecks = Object.values(inspectionData.checklist).flatMap(category =>
          Object.values(category || {})
        );
        const passedChecks = allChecks.filter(check => check).length;
        const totalChecks = allChecks.length;
        
        if (totalChecks > 0) {
          if (passedChecks < totalChecks * 0.6) {
            result = 'failed';
          } else if (passedChecks < totalChecks * 0.9) {
            result = 'conditional';
          }
        }
      } else {
        // チェックリストがない場合はデフォルトで合格とする
        console.log('[INFO] No checklist data available, defaulting to passed');
      }

      // 検品結果に基づくステータス決定
      let inspectionStatus = 'inspection'; // デフォルト
      if (result === 'passed') {
        inspectionStatus = inspectionOnly ? 'inspection' : 'storage';  // 撮影も完了なら保管可能
      } else if (result === 'failed') {
        inspectionStatus = 'on_hold';  // 不合格は保留中
      } else {
        inspectionStatus = 'inspection';  // 要確認は検品継続
      }

      // PackagingAndLabelStep のローカル保存を最優先で取り込み
      let packagingNotesFromLocal = '';
      try {
        const savedPackaging = localStorage.getItem(`packaging_${productId}`);
        if (savedPackaging) {
          const parsed = JSON.parse(savedPackaging);
          if (parsed && typeof parsed.notes === 'string' && parsed.notes.trim() !== '') {
            packagingNotesFromLocal = parsed.notes.trim();
          }
        }
      } catch (e) {
        console.warn('[InspectionForm] Failed to read packaging notes from localStorage:', e);
      }

      const finalData = {
        productId,
        // 内装梱包の備考のみを唯一のソースとして優先採用
        inspectionNotes: packagingNotesFromLocal || inspectionData.notes || '',
        // コンディションは納品プラン作成時の値を保持（検品結果で変更しない）
        // condition: null, // conditionパラメータを除去
        status: inspectionStatus,
        locationId: locationId, // 保管場所IDを追加
        skipPhotography: inspectionOnly,
        photographyDate: inspectionOnly ? null : new Date().toISOString(),
      };

      console.log('[DEBUG] Sending inspection data:', finalData);
      console.log('[DEBUG] Inspection data state:', inspectionData);

      // 本番用APIコール
      const response = await fetch(`/api/products/inspection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `検品結果の保存に失敗しました: ${response.status}`);
      }

      const savedData = await response.json();

      // 検品完了時は進捗データを完了ステータスで更新
      try {
        const progressStep = inspectionOnly ? 2 : 4;  // 検品のみなら2、撮影も含むなら4
        await fetch('/api/products/inspection/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            currentStep: progressStep,
            checklist: inspectionData.checklist,
            photos: inspectionData.photos,
            notes: inspectionData.notes,
            status: inspectionStatus
          })
        });
      } catch (error) {
        console.error('[WARN] Failed to update progress data:', error);
        // エラーでも処理は継続
      }

      // モックデータ用：ステータス更新イベントを発火
      const newStatus = inspectionOnly 
        ? (result === 'passed' ? 'completed' : result === 'conditional' ? 'inspecting' : 'failed')
        : (result === 'passed' ? 'completed' : result === 'conditional' ? 'inspecting' : 'failed');
      
      const inspectionCompleteEvent = new CustomEvent('inspectionComplete', {
        detail: { productId, newStatus }
      });
      window.dispatchEvent(inspectionCompleteEvent);

      showToast({
        type: 'success',
        title: inspectionOnly ? '検品完了' : '検品・撮影完了',
        message: inspectionOnly 
          ? `検品結果を保存しました。商品ステータスが「${
              result === 'passed' ? '撮影待ち' : 
              result === 'conditional' ? '要確認' : '不合格'
            }」に更新されました。後で撮影を行ってください。`
          : `検品・撮影が完了しました。商品ステータスが「${
              result === 'passed' ? '出品準備完了' : 
              result === 'conditional' ? '要確認' : '不合格'
            }」に更新されました。`,
        duration: 2000
      });
      
      // 成功時は適切な画面に戻る（即座に遷移）
      setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('from') === 'inventory') {
          // 在庫画面から来た場合は状態復元フラグ付きで在庫画面に戻る
          window.location.href = '/staff/inventory?restored=1';
        } else {
          // その他の場合は検品一覧に戻る（状態復元フラグ付き）
          window.location.href = '/staff/inspection?restored=1';
        }
      }, 500); // 2秒から0.5秒に短縮
      
    } catch (error) {
      console.error('[ERROR] Inspection submission:', error);
      showToast({
        type: 'error',
        title: '検品保存エラー',
        message: error instanceof Error ? error.message : '検品結果の保存中にエラーが発生しました',
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  // バリデーション関数
  const validateInspectionData = (data: InspectionData) => {
    const errors: string[] = [];

    // 写真の確認（撮影をスキップしない場合のみ必要）
    if (!data.skipPhotography && data.photos.length === 0) {
      errors.push('検品写真を少なくとも1枚撮影してください');
    }

    // チェック項目は0個でも可（任意）

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  if (loading && !product) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-b-4 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <NexusCard className="p-6 text-center">
        <p className="text-gray-500">商品が見つかりません</p>
      </NexusCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* 商品情報カード */}
      <NexusCard className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/3">
            {/* 納品プラン画像を優先表示 */}
            {product.deliveryPlanInfo?.images && Array.isArray(product.deliveryPlanInfo.images) && product.deliveryPlanInfo.images.length > 0 ? (
              <div className="space-y-2">
                <img
                  src={product.deliveryPlanInfo.images[0]?.url || '/api/placeholder/400/300'}
                  alt={product.name}
                  className="w-full rounded-lg border shadow-sm"
                />
                {product.deliveryPlanInfo.images.length > 1 && (
                  <div className="grid grid-cols-3 gap-2">
                    {product.deliveryPlanInfo.images.slice(1, 4).map((image, idx) => (
                      <img
                        key={idx}
                        src={image?.url || '/api/placeholder/100/100'}
                        alt={`${product.name} ${idx + 2}`}
                        className="w-full h-16 object-cover rounded border"
                      />
                    ))}
                  </div>
                )}
                {product.deliveryPlanInfo.images.length > 4 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{product.deliveryPlanInfo.images.length - 4}枚の画像
                  </p>
                )}
                <div className="flex items-center justify-center gap-1 text-xs text-blue-600">
                  <ArchiveBoxIcon className="w-3 h-3" />
                  <span>納品プラン登録画像</span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <img
                  src={product.imageUrl || '/api/placeholder/400/300'}
                  alt={product.name}
                  className="w-full rounded-lg border"
                />
                <p className="text-xs text-gray-500 mt-2">プレースホルダー画像</p>
              </div>
            )}
          </div>
          <div className="lg:w-2/3 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
            
            {/* 基本商品情報 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">SKU:</span>
                <span className="ml-2 font-medium">{product.sku}</span>
              </div>
              <div>
                <span className="text-gray-600">カテゴリ:</span>
                <span className="ml-2 font-medium">
                  {getCategoryLabel(product.category)}
                </span>
              </div>
            </div>
 
            {/* 納品プラン詳細情報 */}
            {product.deliveryPlanInfo && (
              <div className="border-t pt-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <ArchiveBoxIcon className="w-4 h-4 text-gray-600" />
                    <span>納品プラン情報</span>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">セラー入力</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {product.deliveryPlanInfo.condition && (
                    <div>
                      <span className="text-gray-600">コンディション:</span>
                      <span className="ml-2 font-medium">
                        {(() => {
                          const conditionMapping: Record<string, string> = {
                            'excellent': '優良',
                            'very_good': '美品',
                            'good': '良好',
                            'fair': '普通',
                            'poor': '要修理'
                          };
                          return conditionMapping[product.deliveryPlanInfo.condition] || product.deliveryPlanInfo.condition;
                        })()}
                      </span>
                    </div>
                  )}
                  {product.deliveryPlanInfo.purchasePrice > 0 && (
                    <div>
                      <span className="text-gray-600">購入価格:</span>
                      <span className="ml-2 font-medium">¥{Number(product.deliveryPlanInfo.purchasePrice || 0).toLocaleString()}</span>
                    </div>
                  )}
                  {product.deliveryPlanInfo.purchaseDate && (
                    <div>
                      <span className="text-gray-600">仕入日:</span>
                      <span className="ml-2 font-medium">
                        {(() => {
                          try {
                            const date = new Date(product.deliveryPlanInfo.purchaseDate);
                            return !isNaN(date.getTime()) ? date.toLocaleDateString('ja-JP') : product.deliveryPlanInfo.purchaseDate;
                          } catch {
                            return product.deliveryPlanInfo.purchaseDate;
                          }
                        })()}
                      </span>
                    </div>
                  )}
                  {product.deliveryPlanInfo.supplier && (
                    <div>
                      <span className="text-gray-600">仕入先:</span>
                      <span className="ml-2 font-medium">{product.deliveryPlanInfo.supplier}</span>
                    </div>
                  )}
                </div>
                {product.deliveryPlanInfo.supplierDetails && (
                  <div className="mt-2">
                    <h6 className="text-sm font-medium text-nexus-text-primary">仕入詳細</h6>
                    <div className="mt-1 p-3 bg-nexus-bg-tertiary border border-nexus-border rounded-lg text-sm text-nexus-text-primary">
                      {product.deliveryPlanInfo.supplierDetails}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </NexusCard>

      {/* ステップインジケーター（タブレット最適化） */}
      <div ref={stepIndicatorRef} className="flex justify-between items-center bg-white rounded-lg p-4 shadow-sm">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => handleStepChange(step.id)}
            className={`flex-1 flex flex-col items-center p-3 rounded-lg transition-all ${
              currentStep === step.id
                ? 'bg-blue-50 text-blue-600'
                : index < currentStep
                ? 'text-green-600'
                : 'text-gray-400'
            }`}
          >
            <div className="mb-1">{step.icon}</div>
            <span className="text-sm font-medium hidden md:block">{step.title}</span>
          </button>
        ))}
      </div>

      {/* ステップコンテンツ */}
      <div className="min-h-[500px]">
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* セラーが入力した検品チェックリストがある場合は表示 */}
            {existingChecklist && (
              <NexusCard className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-blue-900">セラー入力済みの検品データ</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      セラー {existingChecklist.createdBy} が {new Date(existingChecklist.createdAt).toLocaleDateString('ja-JP')} に入力
                    </p>
                  </div>
                  <NexusButton
                    onClick={() => setIsEditMode(!isEditMode)}
                    variant="secondary"
                    size="sm"
                  >
                    {isEditMode ? '編集を終了' : '編集する'}
                  </NexusButton>
                </div>
                
                {/* フィーチャーフラグによる条件分岐 */}
                <div className="mb-4">
                  <div className="flex items-center mb-4">
                    <h4 className="text-lg font-semibold text-nexus-text-primary">検品チェックリスト</h4>

                  </div>

                  {isHierarchicalEnabled ? (
                    /* ========== 新システム: 階層型検品チェックリスト ========== */
                    <HierarchicalInspectionChecklistInput
                      data={hierarchicalInspectionData}
                      onChange={(hierarchicalData) => {
                        console.log(`[InspectionForm] 新システムデータ更新:`, hierarchicalData);
                        if (isEditMode) {
                          setHierarchicalInspectionData(hierarchicalData);
                        }
                      }}
                      readOnly={!isEditMode}
                      verifiedBy={existingChecklist?.verifiedBy}
                      verifiedAt={existingChecklist?.verifiedAt}
                    />
                  ) : (
                    /* ========== 既存システム: 統一検品チェックリスト ========== */
                    <InspectionChecklistInput
                      data={{
                        exterior: {
                          scratches: inspectionData.checklist.exterior.scratches,
                          dents: inspectionData.checklist.exterior.dents,
                          discoloration: inspectionData.checklist.exterior.discoloration,
                          dust: inspectionData.checklist.exterior.dust,
                        },
                        functionality: {
                          powerOn: inspectionData.checklist.functionality.powerOn,
                          allButtonsWork: inspectionData.checklist.functionality.allButtonsWork,
                          screenDisplay: inspectionData.checklist.functionality.screenDisplay,
                          connectivity: inspectionData.checklist.functionality.connectivity,
                        },
                        optical: {
                          lensClarity: inspectionData.checklist.optical?.lensClarity || false,
                          aperture: inspectionData.checklist.optical?.aperture || false,
                          focusAccuracy: inspectionData.checklist.optical?.focusAccuracy || false,
                          stabilization: inspectionData.checklist.optical?.stabilization || false,
                        },
                        notes: inspectionData.notes,
                      }}
                      onChange={(checklistData) => {
                        if (isEditMode) {
                          setInspectionData(prev => ({
                            ...prev,
                            checklist: {
                              exterior: checklistData.exterior,
                              functionality: checklistData.functionality,
                              optical: checklistData.optical || prev.checklist.optical,
                            },
                            notes: checklistData.notes || prev.notes,
                          }));
                        }
                      }}
                      showOptical={true}
                      readOnly={!isEditMode}
                      verifiedBy={existingChecklist?.verifiedBy}
                      verifiedAt={existingChecklist?.verifiedAt}
                    />
                  )}
                </div>
              </NexusCard>
            )}

            {/* セラーが入力していない場合は新規検品チェックリスト */}
            {!existingChecklist && (
              <NexusCard className="p-4">
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-gray-900">検品チェックリスト</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    各項目を確認してチェックしてください
                  </p>
                </div>
                
                <InspectionChecklistInput
                  data={{
                    exterior: {
                      scratches: inspectionData.checklist.exterior.scratches,
                      dents: inspectionData.checklist.exterior.dents,
                      discoloration: inspectionData.checklist.exterior.discoloration,
                      dust: inspectionData.checklist.exterior.dust,
                    },
                    functionality: {
                      powerOn: inspectionData.checklist.functionality.powerOn,
                      allButtonsWork: inspectionData.checklist.functionality.allButtonsWork,
                      screenDisplay: inspectionData.checklist.functionality.screenDisplay,
                      connectivity: inspectionData.checklist.functionality.connectivity,
                    },
                    optical: {
                      lensClarity: inspectionData.checklist.optical?.lensClarity || false,
                      aperture: inspectionData.checklist.optical?.aperture || false,
                      focusAccuracy: inspectionData.checklist.optical?.focusAccuracy || false,
                      stabilization: inspectionData.checklist.optical?.stabilization || false,
                    },
                    notes: inspectionData.notes,
                  }}
                  onChange={(checklistData) => {
                    console.log('[DEBUG] チェックリストデータ変更:', checklistData);
                    setInspectionData(prev => ({
                      ...prev,
                      checklist: {
                        exterior: checklistData.exterior,
                        functionality: checklistData.functionality,
                        optical: checklistData.optical || prev.checklist.optical,
                      },
                      notes: checklistData.notes || prev.notes,
                    }));
                  }}
                  showOptical={true}
                  readOnly={false}
                />
              </NexusCard>
            )}

            {/* アクションボタン */}
            <div className="flex justify-between">
              <div className="flex gap-3">
                <NexusButton
                  onClick={handleCancelAndReturn}
                  variant="outline"
                  size="lg"
                >
                  キャンセル（一覧に戻る）
                </NexusButton>
                <NexusButton
                  onClick={() => saveProgress(1)}
                  variant="secondary"
                  size="lg"
                >
                  保存して後で続ける
                </NexusButton>
              </div>
              <NexusButton
                onClick={() => handleStepChange(2)}
                variant="primary"
                size="lg"
              >
                次へ（写真撮影）
              </NexusButton>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            {/* 撮影要望表示 */}
            <PhotographyRequestDisplay 
              photographyRequests={product.deliveryPlanInfo?.photographyRequests || null}
              className="mb-6"
            />
            
            <PhotoUploader
              productId={productId}
              photos={inspectionData.photos}
              photoSlots={inspectionData.photoSlots}
              onUpdate={updatePhotos}
              onNext={() => handleStepChange(3)}
              onPrev={() => handleStepChange(1)}
              onSaveAndReturn={() => saveProgress(2)}
              onCancel={handleCancelAndReturn}
              category={product.category}
              loading={loading}
              photographyType={product.deliveryPlanInfo?.photographyRequests?.photographyType}
            />
          </div>
        )}

        {currentStep === 3 && (
          <PackagingAndLabelStep
            productId={productId}
            product={product}
            onNext={() => handleStepChange(4)}
            onPrev={() => handleStepChange(2)}
            onSaveAndReturn={() => saveProgress(3)}
            onCancel={handleCancelAndReturn}
            loading={loading}
          />
        )}

        {currentStep === 4 && (
          <ShelfStorageStep
            productId={productId}
            product={product}
            onComplete={(locationId) => submitInspection(false, locationId)}
            onPrev={() => handleStepChange(3)}
            onSaveAndReturn={() => saveProgress(4)}
            onCancel={handleCancelAndReturn}
            loading={loading}
          />
        )}
      </div>

      {/* キャンセル確認モーダル */}
      <ConfirmationModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={confirmCancelAndReturn}
        title="作業のキャンセル"
        message="現在の作業内容を保存せずに一覧に戻ります。

※未保存のデータは失われますが、よろしいですか？"
        confirmText="はい、戻ります"
        cancelText="続ける"
        confirmVariant="danger"
        type="warning"
      />
    </div>
  );
} 