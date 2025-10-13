'use client';

import { useState, useEffect } from 'react';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusInput from '@/app/components/ui/NexusInput';
import NexusSelect from '@/app/components/ui/NexusSelect';
import NexusTextarea from '@/app/components/ui/NexusTextarea';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import InspectionChecklistInput, { InspectionChecklistData } from '@/app/components/features/inspection/InspectionChecklistInput';
import HierarchicalInspectionChecklistInput from '@/app/components/features/inspection/HierarchicalInspectionChecklistInput';
import { useIsHierarchicalChecklistEnabled } from '@/lib/hooks/useHierarchicalChecklistFeature';
import EnhancedImageUploader from '@/app/components/features/EnhancedImageUploader';
import { PlusIcon, TrashIcon, PhotoIcon, CameraIcon } from '@heroicons/react/24/outline';
import { useProductConditions } from '@/lib/hooks/useMasterData';

interface ProductImage {
  id: string;
  url: string;
  filename: string;
  category: string; // 'product', 'package', 'accessory', 'document'
  description?: string;
}

interface PhotographyRequest {
  // 新しい統一構造
  photographyType?: 'standard' | 'premium' | 'none'; // 必須選択項目
  standardCount?: number; // 通常撮影枚数（固定10枚）
  premiumAddCount?: 2 | 4; // プレミアム追加枚数
  customRequests?: string; // 要望フォーム
  
  // 後方互換性のための旧構造保持
  specialPhotography?: boolean;
  specialPhotographyItems?: string[];
}

interface Product {
  name: string;
  condition: string;
  purchasePrice: number;
  purchaseDate: string;
  supplier: string;
  supplierDetails: string;
  serialNumber?: string;
  category?: string;
  images?: ProductImage[]; // 商品画像
  inspectionChecklist?: InspectionChecklistData;
  photographyRequest?: PhotographyRequest; // 撮影要望
  premiumPacking?: boolean; // プレミアム梱包オプション
}

interface ProductRegistrationStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const categoryOptions = [
  { value: 'camera', label: 'カメラ' },
  { value: 'watch', label: '腕時計' }
];

// コンディション選択肢はuseProductConditionsフックから動的に取得

const imageCategoryOptions = [
  { value: 'product', label: '商品本体' },
  { value: 'package', label: '内箱・パッケージ' },
  { value: 'accessory', label: '付属品' },
  { value: 'document', label: '書類・保証書' },
  { value: 'other', label: 'その他' }
];

const specialPhotographyOptions = [
  { value: 'diagonal_45', label: '45度斜め撮影' },
  { value: 'closeup', label: 'クローズアップ撮影' },
  { value: 'functional_details', label: '機能部分詳細撮影' },
  { value: 'internal_structure', label: '内部構造撮影' },
  { value: 'accessories_individual', label: '付属品個別撮影' }
];

export default function ProductRegistrationStep({
  data,
  onUpdate,
  onNext,
  onPrev,
  isFirstStep,
  isLastStep
}: ProductRegistrationStepProps) {
  const { showToast } = useToast();
  const { conditions: productConditions, loading: conditionsLoading } = useProductConditions();

  // 🎛️ フィーチャーフラグ：階層型検品チェックリストの有効/無効
  const isHierarchicalEnabled = useIsHierarchicalChecklistEnabled();
  console.log(`[ProductRegistration] 階層型検品チェックリスト: ${isHierarchicalEnabled ? '有効(新システム)' : '無効(既存システム)'}`);

  // コンディション選択肢をフォーマット
  const conditionOptions = productConditions.map(condition => ({
    value: condition.key,
    label: condition.nameJa
  }));

  // デフォルトで1つの空商品を含む配列を作成
  const createDefaultProduct = (): Product => ({
    name: '',
    condition: 'unused',
    purchasePrice: 0,
    purchaseDate: '',
    supplier: '',
    supplierDetails: '',
    serialNumber: '',
    category: 'camera',
    images: [],
    inspectionChecklist: {
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
      notes: '',
    },
    photographyRequest: {
      photographyType: undefined,
      standardCount: 10,
      premiumAddCount: undefined,
      customRequests: '',
      specialPhotography: false,
      specialPhotographyItems: [],
    },
    premiumPacking: false,
  });

  const defaultProducts: Product[] = [createDefaultProduct()];

  // デフォルトで1つの商品フォームを表示
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  
  console.log('[DEBUG] ProductRegistrationStep初期化:', {
    dataProducts: data.products,
    defaultWithOneProduct: true,
    productsLength: products.length
  });
  
  // 既存データがある場合は復元（初回レンダー後）
  useEffect(() => {
    if (Array.isArray(data.products) && data.products.length > 0) {
      console.log('[DEBUG] 既存データ復元:', data.products.length, '件');
      setProducts(data.products);
    }
  }, [data.products]);

  // 商品が空の場合は何も自動更新しない

  const addProduct = () => {
    console.log('[DEBUG] 商品追加開始 - 現在の商品数:', products.length);
    const newProduct: Product = {
      name: '',
      condition: 'unused',
      purchasePrice: 0,
      purchaseDate: '',
      supplier: '',
      supplierDetails: '',
      serialNumber: '',
      category: 'camera',
      images: [], // 画像配列を初期化
      inspectionChecklist: {
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
        notes: '',
      },
      photographyRequest: {
        // 新構造：デフォルトは未選択（必須選択）
        photographyType: undefined, // 必須選択のため初期値はundefined
        standardCount: 10,
        premiumAddCount: undefined,
        customRequests: '',
        // 後方互換性
        specialPhotography: false,
        specialPhotographyItems: [],
      },
      premiumPacking: false, // プレミアム梱包は任意（デフォルト：オフ）
    };
    const updatedProducts = [...products, newProduct];
    console.log('[DEBUG] 商品追加後 - 新商品数:', updatedProducts.length);
    setProducts(updatedProducts);
    onUpdate({ ...data, products: updatedProducts });
    
    // 追加のフィードバック
    showToast({
      type: 'success',
      title: '商品追加',
      message: '商品を追加しました'
    });
    console.log('[DEBUG] 商品追加完了');
  };

  const updateProduct = (index: number, field: string, value: any) => {
    const updatedProducts = products.map((product: any, i: number) => 
      i === index ? { ...product, [field]: value } : product
    );
    setProducts(updatedProducts);
    onUpdate({ ...data, products: updatedProducts });
  };

  const updateInspectionChecklist = (index: number, checklistData: InspectionChecklistData) => {
    const updatedProducts = products.map((product: any, i: number) => 
      i === index ? { ...product, inspectionChecklist: checklistData } : product
    );
    setProducts(updatedProducts);
    onUpdate({ ...data, products: updatedProducts });
  };

  // 🆕 階層型検品チェックリストデータの更新（新システム専用）
  const updateHierarchicalInspectionData = (index: number, hierarchicalData: any) => {
    console.log(`[ProductRegistration] 階層型データ更新 - 商品${index + 1}:`, hierarchicalData);
    
    const updatedProducts = products.map((product: any, i: number) => 
      i === index ? { ...product, hierarchicalInspectionData: hierarchicalData } : product
    );
    setProducts(updatedProducts);
    onUpdate({ ...data, products: updatedProducts });
    
    console.log(`[ProductRegistration] 階層型データ更新完了 - 全商品データ:`, updatedProducts);
  };

  const updatePhotographyRequest = (index: number, photographyData: PhotographyRequest) => {
    console.log(`[DEBUG] 撮影要望更新 - 商品${index + 1}:`, photographyData);
    const updatedProducts = products.map((product: any, i: number) => 
      i === index ? { ...product, photographyRequest: photographyData } : product
    );
    setProducts(updatedProducts);
    onUpdate({ ...data, products: updatedProducts });
    console.log(`[DEBUG] 撮影要望更新後 - 商品${index + 1}の状態:`, updatedProducts[index]?.photographyRequest);
  };


  // 画像アップロード関連の関数
  const handleImageUpload = async (index: number, files: File[]) => {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      
      // productIdとcategoryを追加（一意のIDを生成）
      const productId = `product-${index}-${Date.now()}`;
      formData.append('productId', productId);
      formData.append('category', 'general');
      
      console.log('[DEBUG] 画像アップロード開始:', {
        productIndex: index,
        productId,
        fileCount: files.length,
        files: files.map(f => f.name)
      });
      
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('画像のアップロードに失敗しました');
      }

      const result = await response.json();
      
      // アップロードされた画像を商品に追加
      const newImages = result.images.map((img: any) => ({
        id: img.id,
        url: img.url,
        filename: img.filename,
        category: 'product', // デフォルトカテゴリ
      }));

      const currentImages = products[index]?.images || [];
      updateProduct(index, 'images', [...currentImages, ...newImages]);

      showToast({
        type: 'success',
        title: '画像アップロード完了',
        message: `${files.length}枚の画像をアップロードしました`,
      });
    } catch (error) {
      console.error('[ERROR] 商品画像アップロードエラー:', error);
      
      let errorMessage = '画像のアップロードに失敗しました';
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          errorMessage = '画像アップロードAPIが見つかりません。管理者にお問い合わせください。';
        } else if (error.message.includes('413') || error.message.includes('size')) {
          errorMessage = 'ファイルサイズが大きすぎます。10MB以下の画像を選択してください。';
        } else if (error.message.includes('415') || error.message.includes('format')) {
          errorMessage = 'サポートされていないファイル形式です。JPEG、PNG、WebPファイルを使用してください。';
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
          errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
        } else {
          errorMessage = error.message;
        }
      }
      
      showToast({
        type: 'error',
        title: '画像アップロードエラー',
        message: errorMessage,
        duration: 6000
      });
    }
  };

  const removeImage = (productIndex: number, imageId: string) => {
    const currentImages = products[productIndex]?.images || [];
    const updatedImages = currentImages.filter((img: ProductImage) => img.id !== imageId);
    updateProduct(productIndex, 'images', updatedImages);
    
    showToast({
      type: 'success',
      title: '画像削除完了',
      message: '画像を削除しました',
    });
  };

  const updateImageCategory = (productIndex: number, imageId: string, category: string) => {
    const currentImages = products[productIndex]?.images || [];
    const updatedImages = currentImages.map((img: ProductImage) => 
      img.id === imageId ? { ...img, category } : img
    );
    updateProduct(productIndex, 'images', updatedImages);
  };

  const removeProduct = (index: number) => {
    const updatedProducts = products.filter((_: any, i: number) => i !== index);
    setProducts(updatedProducts);
    onUpdate({ ...data, products: updatedProducts });
  };

  const handleNext = () => {
    if (products.length === 0) {
      showToast({
        type: 'warning',
        title: '商品が必要',
        message: '少なくとも1つの商品を登録してください'
      });
      return;
    }
    
    const hasIncompleteProducts = products.some((product: any) => 
      !product.name || !product.condition || product.purchasePrice <= 0
    );
    
    if (hasIncompleteProducts) {
      showToast({
        type: 'warning',
        title: '入力不完全',
        message: 'すべての商品の必須項目（商品名、コンディション、購入価格）を入力してください'
      });
      return;
    }

    // 🆕 撮影要望必須選択チェック
    const hasUnselectedPhotography = products.some((product: any, index: number) => {
      const photographyType = product.photographyRequest?.photographyType;
      return !photographyType || !['standard', 'premium', 'none'].includes(photographyType);
    });
    
    if (hasUnselectedPhotography) {
      showToast({
        type: 'warning',
        title: '撮影要望の選択が必要',
        message: 'すべての商品で撮影要望（通常撮影・特別撮影・撮影不要）のいずれかを選択してください'
      });
      return;
    }

    // 🆕 特別撮影選択時の追加枚数チェック
    const hasIncompletePremiumPhotography = products.some((product: any) => {
      const request = product.photographyRequest;
      return request?.photographyType === 'premium' && !request.premiumAddCount;
    });
    
    if (hasIncompletePremiumPhotography) {
      showToast({
        type: 'warning',
        title: '特別撮影の詳細設定が必要',
        message: '特別撮影を選択した商品については、追加撮影枚数を選択してください'
      });
      return;
    }
    
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-nexus-text-primary mb-4">商品登録</h2>
        <p className="text-nexus-text-secondary mb-6">納品する商品の詳細情報を入力してください</p>
      </div>

      {console.log('[DEBUG] 商品表示判定:', {
        isArray: Array.isArray(products),
        length: products?.length,
        products: products,
        shouldShowAddButton: !Array.isArray(products) || products.length === 0
      })}
      {!Array.isArray(products) || products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-nexus-text-secondary mb-4">登録された商品がありません</p>
          <NexusButton variant="primary" onClick={addProduct} data-testid="add-product-button">
            商品を追加
          </NexusButton>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.isArray(products) && products.map((product: any, index: number) => (
            <div key={index} className="border border-nexus-border rounded-lg p-6 bg-nexus-bg-secondary">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-nexus-text-primary">商品 {index + 1}</h3>
                <NexusButton 
                  variant="danger" 
                  size="sm" 
                  onClick={() => removeProduct(index)}
                >
                  削除
                </NexusButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 必須項目 */}
                <NexusInput
                  label="商品名"
                  name="productName"
                  value={product.name}
                  onChange={(e) => updateProduct(index, 'name', e.target.value)}
                  placeholder="商品名を入力"
                  required
                  variant="nexus"
                  data-testid="product-name-input"
                />

                <NexusSelect
                  label="カテゴリー"
                  value={product.category || 'camera'}
                  onChange={(e) => updateProduct(index, 'category', e.target.value)}
                  options={categoryOptions}
                  variant="nexus"
                  useCustomDropdown={true}
                />

                <NexusSelect
                  label="コンディション"
                  value={product.condition}
                  onChange={(e) => updateProduct(index, 'condition', e.target.value)}
                  options={conditionOptions}
                  required
                  variant="nexus"
                  useCustomDropdown={true}
                />

                <NexusInput
                  label="購入価格"
                  type="number"
                  value={product.purchasePrice === 0 ? '' : product.purchasePrice.toString()}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                    const limitedValue = Math.min(value, 2147483647); // INT最大値制限
                    updateProduct(index, 'purchasePrice', limitedValue);
                  }}
                  placeholder="購入価格を入力"
                  min="0"
                  max="2147483647"
                  required
                  variant="nexus"
                />



                {/* 任意項目 */}
                <NexusInput
                  label="仕入日"
                  type="date"
                  value={product.purchaseDate}
                  onChange={(e) => updateProduct(index, 'purchaseDate', e.target.value)}
                  variant="nexus"
                />

                <NexusInput
                  label="仕入先"
                  value={product.supplier}
                  onChange={(e) => updateProduct(index, 'supplier', e.target.value)}
                  placeholder="仕入先を入力"
                  variant="nexus"
                />

              <NexusInput
                label="シリアル番号"
                value={product.serialNumber || ''}
                onChange={(e) => updateProduct(index, 'serialNumber', e.target.value)}
                placeholder="シリアル番号を入力（任意）"
                variant="nexus"
                maxLength={64}
              />

                <div className="md:col-span-2">
                  <NexusTextarea
                    label="仕入れ詳細"
                    value={product.supplierDetails}
                    onChange={(e) => updateProduct(index, 'supplierDetails', e.target.value)}
                    rows={3}
                    placeholder="仕入れに関する詳細情報があれば入力"
                    variant="nexus"
                  />
                </div>
              </div>

              {/* 商品画像アップロード */}
              <div className="mt-6 border-t pt-6">
                <h4 className="text-lg font-medium text-nexus-text-primary mb-4 flex items-center gap-2">
                  <PhotoIcon className="h-5 w-5" />
                  商品画像（任意）
                </h4>
                <p className="text-sm text-nexus-text-secondary mb-4">
                  商品本体、内箱、付属品、書類など、最大20枚まで画像をアップロードできます。
                </p>
                


                {/* 画像アップロードエリア */}
                <EnhancedImageUploader
                  maxFiles={20}
                  maxSize={10 * 1024 * 1024} // 10MB
                  acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
                  onUpload={(files: File[]) => handleImageUpload(index, files)}
                  enableEdit={false}
                  enableWatermark={false}
                  autoUpload={true}
                />
              </div>

              {/* 検品チェックリスト入力 - フィーチャーフラグで新旧システム切り替え */}
              <div className="mt-6 border-t pt-6">
                {/* フィーチャーフラグによる条件分岐 */}
                {isHierarchicalEnabled ? (
                  /* ========== 新システム: 階層型検品チェックリスト ========== */
                  <div>
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-nexus-text-primary">検品チェックリスト</h4>
                    </div>
                    <HierarchicalInspectionChecklistInput
                      data={product.hierarchicalInspectionData || {
                        responses: {},
                        notes: ''
                      }}
                      onChange={(hierarchicalData) => {
                        console.log(`[ProductRegistration] 新システム保存データ:`, hierarchicalData);
                        updateHierarchicalInspectionData(index, hierarchicalData);
                      }}
                      readOnly={false}
                    />
                  </div>
                ) : (
                  /* ========== 既存システム: 統一検品チェックリスト ========== */
                  <div>
                    <div className="flex items-center mb-4">
                      <h4 className="text-lg font-semibold text-nexus-text-primary">検品チェックリスト</h4>
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        既存システム
                      </span>
                    </div>
                    <InspectionChecklistInput
                      data={product.inspectionChecklist || {
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
                        optical: product.category === 'camera_body' || product.category === 'lens' ? {
                          lensClarity: false,
                          aperture: false,
                          focusAccuracy: false,
                          stabilization: false,
                        } : undefined,
                        notes: '',
                      }}
                      onChange={(checklistData) => updateInspectionChecklist(index, checklistData)}
                      showOptical={product.category === 'camera_body' || product.category === 'lens'}
                      readOnly={false}
                    />
                  </div>
                )}
              </div>

              {/* 撮影要望セクション */}
              <div className="mt-6 border-t pt-6">
                <h4 className="text-lg font-medium text-nexus-text-primary mb-4 flex items-center gap-3">
                  <CameraIcon className="h-5 w-5" />
                  撮影要望
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5"></span>
                    必須選択
                  </span>
                </h4>
                <p className="text-sm text-nexus-text-secondary mb-6">
                  商品の撮影方法を選択してください。いずれかの選択が必要です。
                </p>

                {(() => {
                  const currentRequest = product.photographyRequest || {
                    photographyType: undefined,
                    standardCount: 10,
                    premiumAddCount: undefined,
                    customRequests: '',
                    // 後方互換性
                    specialPhotography: false,
                    specialPhotographyItems: [],
                  };

                  return (
                    <div className="space-y-4">
                      {/* 撮影タイプ選択（ラジオボタン） */}
                      <div className="space-y-3">
                        {/* 通常撮影（10枚） */}
                        <div 
                          className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
                            currentRequest.photographyType === 'standard'
                              ? 'border-nexus-primary bg-nexus-primary/5 shadow-md'
                              : 'border-nexus-border bg-white hover:border-nexus-primary/50'
                          }`}
                          onClick={() => {
                            const newRequest = {
                              ...currentRequest,
                              photographyType: 'standard' as const,
                              premiumAddCount: undefined,
                              customRequests: '',
                            };
                            updatePhotographyRequest(index, newRequest);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center mt-0.5">
                              <input
                                type="radio"
                                name={`photography-type-${index}`}
                                value="standard"
                                checked={currentRequest.photographyType === 'standard'}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const newRequest = {
                                      ...currentRequest,
                                      photographyType: 'standard' as const,
                                      premiumAddCount: undefined,
                                      customRequests: '',
                                    };
                                    updatePhotographyRequest(index, newRequest);
                                  }
                                }}
                                className="w-4 h-4 text-nexus-primary focus:ring-nexus-primary"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-medium text-nexus-text-primary">通常撮影（10枚）</h5>
                              </div>
                              <p className="text-sm text-nexus-text-secondary">
                                正面・背面・側面・上面・下面等の標準アングルでの撮影
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 特別撮影 */}
                        <div 
                          className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
                            currentRequest.photographyType === 'premium'
                              ? 'border-nexus-primary bg-nexus-primary/5 shadow-md'
                              : 'border-nexus-border bg-white hover:border-nexus-primary/50'
                          }`}
                          onClick={() => {
                            const newRequest = {
                              ...currentRequest,
                              photographyType: 'premium' as const,
                              premiumAddCount: currentRequest.premiumAddCount || 2,
                            };
                            updatePhotographyRequest(index, newRequest);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center mt-0.5">
                              <input
                                type="radio"
                                name={`photography-type-${index}`}
                                value="premium"
                                checked={currentRequest.photographyType === 'premium'}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const newRequest = {
                                      ...currentRequest,
                                      photographyType: 'premium' as const,
                                      premiumAddCount: currentRequest.premiumAddCount || 2,
                                    };
                                    updatePhotographyRequest(index, newRequest);
                                  }
                                }}
                                className="w-4 h-4 text-nexus-primary focus:ring-nexus-primary"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-medium text-nexus-text-primary">特別撮影</h5>
                              </div>
                              <p className="text-sm text-nexus-text-secondary">
                                通常撮影＋追加撮影枚数＋カスタム要望対応
                              </p>

                              {/* 特別撮影詳細オプション（特別撮影選択時のみ表示） */}
                              {console.log(`[DEBUG] 商品${index + 1} 撮影詳細表示判定:`, {
                                photographyType: currentRequest.photographyType,
                                shouldShow: currentRequest.photographyType === 'premium'
                              })}
                              {currentRequest.photographyType === 'premium' && (
                                <div className="mt-4 pt-4 border-t border-nexus-border space-y-4">
                                  {/* 追加撮影枚数選択 */}
                                  <div>
                                    <h6 className="text-sm font-medium text-nexus-text-primary mb-3">追加撮影枚数</h6>
                                    <div className="space-y-2">
                                      {[
                                        { value: 2, label: '2枚追加', description: '重要な角度からの追加撮影' },
                                        { value: 4, label: '4枚追加', description: '詳細な状態確認用の追加撮影' }
                                      ].map((option) => (
                                        <div key={option.value} className="flex items-center gap-3">
                                          <input
                                            type="radio"
                                            id={`premium-count-${index}-${option.value}`}
                                            name={`premium-add-count-${index}`}
                                            value={option.value.toString()}
                                            checked={currentRequest.premiumAddCount === option.value}
                                            onChange={() => {
                                              const newRequest = {
                                                ...currentRequest,
                                                premiumAddCount: option.value as 2 | 4,
                                              };
                                              updatePhotographyRequest(index, newRequest);
                                            }}
                                            className="w-3 h-3 text-nexus-primary focus:ring-nexus-primary"
                                          />
                                          <label htmlFor={`premium-count-${index}-${option.value}`} className="flex-1 cursor-pointer">
                                            <div className="text-sm font-medium text-nexus-text-primary">{option.label}</div>
                                            <div className="text-xs text-nexus-text-secondary">{option.description}</div>
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* カスタム撮影要望 */}
                                  <div>
                                    <label className="block text-sm font-medium text-nexus-text-primary mb-2">
                                      撮影要望詳細（任意）
                                    </label>
                                    <NexusTextarea
                                      value={currentRequest.customRequests || ''}
                                      onChange={(e) => {
                                        const newRequest = {
                                          ...currentRequest,
                                          customRequests: e.target.value,
                                        };
                                        updatePhotographyRequest(index, newRequest);
                                      }}
                                      rows={3}
                                      placeholder="例：レンズのカビ状態を詳細に撮影、シャッター動作の確認、傷の位置を明確に等"
                                      maxLength={500}
                                      variant="nexus"
                                    />
                                    <p className="text-xs text-nexus-text-tertiary mt-1">
                                      {(currentRequest.customRequests || '').length}/500文字
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 撮影不要 */}
                        <div 
                          className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
                            currentRequest.photographyType === 'none'
                              ? 'border-nexus-primary bg-nexus-primary/5 shadow-md'
                              : 'border-nexus-border bg-white hover:border-nexus-primary/50'
                          }`}
                          onClick={() => {
                            const newRequest = {
                              ...currentRequest,
                              photographyType: 'none' as const,
                              premiumAddCount: undefined,
                              customRequests: '',
                            };
                            updatePhotographyRequest(index, newRequest);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center mt-0.5">
                              <input
                                type="radio"
                                name={`photography-type-${index}`}
                                value="none"
                                checked={currentRequest.photographyType === 'none'}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const newRequest = {
                                      ...currentRequest,
                                      photographyType: 'none' as const,
                                      premiumAddCount: undefined,
                                      customRequests: '',
                                    };
                                    updatePhotographyRequest(index, newRequest);
                                  }
                                }}
                                className="w-4 h-4 text-nexus-primary focus:ring-nexus-primary"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-medium text-nexus-text-primary">撮影不要</h5>
                              </div>
                              <p className="text-sm text-nexus-text-secondary">
                                商品撮影をスキップします
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>


                    </div>
                  );
                })()}
              </div>

              {/* プレミアム梱包オプション */}
              <div className="mt-6 border-t pt-6">
                <h4 className="text-lg font-medium text-nexus-text-primary mb-4 flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  梱包オプション（任意）
                </h4>
                <p className="text-sm text-nexus-text-secondary mb-4">
                  商品の梱包方法を選択できます。
                </p>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    product.premiumPacking
                      ? 'border-nexus-primary bg-nexus-primary/5 shadow-md'
                      : 'border-nexus-border bg-white hover:border-nexus-primary/50'
                  }`}
                  onClick={() => {
                    updateProduct(index, 'premiumPacking', !product.premiumPacking);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={product.premiumPacking || false}
                        onChange={() => {}}
                        className="w-4 h-4 text-nexus-primary focus:ring-nexus-primary rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-nexus-text-primary">プレミアム梱包</h5>
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">追加サービス</span>
                      </div>
                      <p className="text-sm text-nexus-text-secondary">
                        特別な保護材料と丁寧な梱包でお客様にお届けします
                      </p>
                      <div className="mt-2 text-xs text-nexus-text-tertiary">
                        • エアキャップによる追加保護
                        • 専用梱包材での厳重包装
                        • 取り扱い注意ラベル貼付
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="text-center">
            <NexusButton variant="secondary" onClick={addProduct}>
              商品を追加
            </NexusButton>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <NexusButton variant="default" onClick={onPrev}>
          前に戻る
        </NexusButton>
        <NexusButton variant="primary" onClick={handleNext}>
          次へ進む
        </NexusButton>
      </div>
    </div>
  );
}