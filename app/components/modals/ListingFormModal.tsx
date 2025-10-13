'use client';

import { useState, useEffect, useRef } from 'react';
import { BaseModal, NexusButton, NexusSelect, NexusInput, NexusTextarea, NexusCheckbox } from '@/app/components/ui';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { useRouter } from 'next/navigation';
import TemplateEditor from '@/app/components/features/listing/TemplateEditor';
import {
  PhotoIcon,
  VideoCameraIcon,
  ShoppingCartIcon,
  GlobeAltIcon,
  PlusIcon,
  MinusIcon,
  InformationCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { FileCode, Edit3, Loader2, RefreshCw, Eye } from 'lucide-react';
import { 
  ebayListingTemplates, 
  TemplateFields, 
  defaultTemplateFields,
  applyFieldsToTemplate 
} from '@/lib/templates/ebay-listing-templates';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  condition: string;
  description?: string;
  imageUrl?: string;
}

interface ListingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess?: (listing: any) => void;
}

// 言語設定
const translations = {
  en: {
    title: 'eBay Listing',
    languageToggle: 'Language',
    photosVideo: 'PHOTOS & VIDEO',
    photosVideoDesc: 'You can add up to 24 photos and a 1-minute video. Buyers want to see all details and angles.',
    dragDropFiles: 'Drag and drop files',
    uploadFromComputer: 'Upload from computer',
    itemTitle: 'TITLE',
    itemTitleLabel: 'Item title',
    subtitle: 'Subtitle (optional)',
    customLabel: 'Custom label (SKU)',
    itemCategory: 'ITEM CATEGORY',
    filmCameras: 'Film Cameras',
    cameraPhoto: 'in Cameras & Photo > Film Photography',
    storeCategory: 'Store category',
    itemSpecifics: 'ITEM SPECIFICS',
    required: 'Required',
    buyersNeed: 'Buyers need these details to find your item.',
    brand: 'Brand',
    type: 'Type',
    model: 'Model',
    upc: 'UPC',
    format: 'Format',
    color: 'Color',
    focusType: 'Focus Type',
    series: 'Series',
    features: 'Features',
    mpn: 'MPN',
    unitQuantity: 'Unit Quantity',
    unitType: 'Unit Type',
    countryManufacture: 'Country/Region of Manufacture',
    yearManufactured: 'Year Manufactured',
    warranty: 'Manufacturer Warranty',
    itemWeight: 'Item Weight',
    californiaProp65: 'California Prop 65 Warning',
    itemHeight: 'Item Height',
    itemLength: 'Item Length',
    itemWidth: 'Item Width',
    addCustom: 'Add custom item specific',
    showLess: 'Show less',
    variations: 'VARIATIONS',
    variationsDesc: 'Save time and money by listing multiple variations of your item in one multi-quantity, fixed price listing.',
    condition: 'CONDITION',
    itemCondition: 'Item condition',
    used: 'Used',
    conditionDescription: 'Condition description',
    description: 'DESCRIPTION',
    writeDescription: 'Write a detailed description of your item, or save time and let AI draft it for you',
    useAiDescription: 'Use AI description',
    pricing: 'PRICING',
    formatLabel: 'Format',
    buyItNow: 'Buy It Now',
    itemPrice: 'Item price',
    quantity: 'Quantity',
    paymentPolicy: 'Payment policy',
    allowOffers: 'Allow offers',
    buyersInterested: 'Buyers interested in your item can make you offers -- you can accept, counter or decline.',
    minimumOffer: 'Minimum offer (optional)',
    autoAccept: 'Auto-accept (optional)',
    scheduleYourListing: 'Schedule your listing',
    listingGoesLive: 'Your listing goes live immediately, unless you select a time and date you want it to start.',
    promoteYourListing: 'PROMOTE YOUR LISTING',
    driveMoreSales: 'Drive sales by boosting your listing into more visible positions.',
    general: 'General',
    priority: 'Priority',
    moreVisibility100: '100% more visibility, on average.',
    moreVisibility200: '200% more visibility, on average.',
    basicAccess: 'Basic access to ad placements across eBay',
    payPerSale: 'Pay per sale - only pay a fee when an item sells',
    accelerateSales: 'Accelerate sales on any type of listing, especially useful on low quantity listings',
    preferentialRanking: 'Preferential ranking in ad placements across eBay',
    payPerClick: 'Pay per click - only pay for clicks on your ads',
    multiplySales: 'Multiply sales on multi-quantity listings, especially useful in highly competitive categories',
    helpMeChoose: 'Help me choose',
    charity: 'CHARITY',
    listForFree: 'List it for free.',
    finalValueFee: 'A final value fee applies when your item sells.',
    cancel: 'Cancel',
    listIt: 'List it',
    saveForLater: 'Save for later',
    preview: 'Preview',
    // Item Specifics options
    canon: 'Canon',
    enterNumber: 'Enter number',
    enterYourOwn: 'Enter your own',
    silver: 'Silver',
    black: 'Black',
    gray: 'Gray',
    manual: 'Manual',
    auto: 'Auto',
    autoManual: 'Auto & Manual',
    compact: 'Compact',
    mm35: '35 mm',
    mm50: '50 mm',
    aps: 'APS',
    unit: 'Unit',
    japan: 'Japan',
    taiwan: 'Taiwan',
    china: 'China',
    s1980: '1980s',
    s1970: '1970s',
    s1960: '1960s',
    month1: '1 Month',
    year1: '1 Year'
  },
  ja: {
    title: 'eBay出品',
    languageToggle: '言語',
    photosVideo: '写真・動画',
    photosVideoDesc: '最大24枚の写真と1分間の動画を追加できます。購入者は詳細と全ての角度を見たがります。',
    dragDropFiles: 'ファイルをドラッグ&ドロップ',
    uploadFromComputer: 'コンピューターからアップロード',
    itemTitle: 'タイトル',
    itemTitleLabel: 'アイテムタイトル',
    subtitle: 'サブタイトル（オプション）',
    customLabel: 'カスタムラベル（SKU）',
    itemCategory: 'アイテムカテゴリ',
    filmCameras: 'フィルムカメラ',
    cameraPhoto: 'カメラ・写真 > フィルム写真',
    storeCategory: 'ストアカテゴリ',
    itemSpecifics: 'アイテム詳細',
    required: '必須',
    buyersNeed: '購入者がアイテムを見つけるためにこれらの詳細が必要です。',
    brand: 'ブランド',
    type: 'タイプ',
    model: 'モデル',
    upc: 'UPC',
    format: 'フォーマット',
    color: '色',
    focusType: 'フォーカスタイプ',
    series: 'シリーズ',
    features: '機能',
    mpn: 'MPN',
    unitQuantity: '単位数量',
    unitType: '単位タイプ',
    countryManufacture: '製造国・地域',
    yearManufactured: '製造年',
    warranty: 'メーカー保証',
    itemWeight: 'アイテム重量',
    californiaProp65: 'カリフォルニア州プロポジション65警告',
    itemHeight: 'アイテム高さ',
    itemLength: 'アイテム長さ',
    itemWidth: 'アイテム幅',
    addCustom: 'カスタム項目を追加',
    showLess: '表示を減らす',
    variations: 'バリエーション',
    variationsDesc: '複数のバリエーションを1つの固定価格リストに掲載することで時間とお金を節約できます。',
    condition: '状態',
    itemCondition: 'アイテムの状態',
    used: '中古',
    conditionDescription: '状態の説明',
    description: '説明',
    writeDescription: 'アイテムの詳細な説明を記述するか、時間を節約してAIに下書きを作成させてください',
    useAiDescription: 'AI説明を使用',
    pricing: '価格設定',
    formatLabel: 'フォーマット',
    buyItNow: '今すぐ購入',
    itemPrice: 'アイテム価格',
    quantity: '数量',
    paymentPolicy: '支払いポリシー',
    allowOffers: 'オファーを許可',
    buyersInterested: 'あなたのアイテムに興味のある購入者はオファーを出すことができます。受諾、カウンター、または拒否することができます。',
    minimumOffer: '最低オファー（オプション）',
    autoAccept: '自動受諾（オプション）',
    scheduleYourListing: 'リスティングのスケジュール',
    listingGoesLive: '時間と日付を選択しない限り、リスティングは即座に公開されます。',
    promoteYourListing: 'リスティング促進',
    driveMoreSales: 'リスティングをより見やすい位置に押し上げることで売上を促進します。',
    general: '一般',
    priority: '優先',
    moreVisibility100: '平均して100%多くの可視性。',
    moreVisibility200: '平均して200%多くの可視性。',
    basicAccess: 'eBay全体の広告配置への基本アクセス',
    payPerSale: '売上毎に支払い - アイテムが売れた時のみ手数料を支払う',
    accelerateSales: '任意のタイプのリスティングで売上を加速、特に少量リスティングに有用',
    preferentialRanking: 'eBay全体の広告配置で優先ランキング',
    payPerClick: 'クリック毎に支払い - あなたの広告のクリックのみに支払う',
    multiplySales: '複数数量リスティングで売上を倍増、特に競争の激しいカテゴリで有用',
    helpMeChoose: '選択の手助け',
    charity: 'チャリティ',
    listForFree: '無料で出品。',
    finalValueFee: 'アイテムが売れた時に最終価値手数料が適用されます。',
    cancel: 'キャンセル',
    listIt: '出品する',
    saveForLater: '後で保存',
    preview: 'プレビュー',
    // Item Specifics options
    canon: 'Canon',
    enterNumber: '番号を入力',
    enterYourOwn: '独自に入力',
    silver: 'シルバー',
    black: 'ブラック',
    gray: 'グレー',
    manual: 'マニュアル',
    auto: 'オート',
    autoManual: 'オート・マニュアル',
    compact: 'コンパクト',
    mm35: '35 mm',
    mm50: '50 mm',
    aps: 'APS',
    unit: 'ユニット',
    japan: '日本',
    taiwan: '台湾',
    china: '中国',
    s1980: '1980年代',
    s1970: '1970年代',
    s1960: '1960年代',
    month1: '1ヶ月',
    year1: '1年'
  }
};

export default function ListingFormModal({ 
  isOpen, 
  onClose, 
  product, 
  onSuccess 
}: ListingFormModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  
  // 言語設定
  const [language, setLanguage] = useState<'en' | 'ja'>('en');
  const t = translations[language];
  
  // フォーム状態
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [customSpecifics, setCustomSpecifics] = useState<Array<{id: string, name: string, value: string}>>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'shipping' | 'seller'>('description');
  
  // Photos & Video
  const [photos, setPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  
  // Image Upload Methods - 統合選択用
  const [photographyImages, setPhotographyImages] = useState<string[]>([]);
  const [selectedPhotographyImages, setSelectedPhotographyImages] = useState<string[]>([]);
  const [loadingPhotography, setLoadingPhotography] = useState(false);
  const [photographyError, setPhotographyError] = useState<string | null>(null);
  const [allSelectedImages, setAllSelectedImages] = useState<Array<{url: string, source: 'computer' | 'photography', file?: File}>>([]);
  const [mainDisplayImage, setMainDisplayImage] = useState<string | null>(null);
  const [previewMainImage, setPreviewMainImage] = useState<string | null>(null);

  // Title
  const [itemTitle, setItemTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  
  // Item Category
  const [category, setCategory] = useState('film-cameras');
  const [storeCategory, setStoreCategory] = useState('film-camera');
  
  // Item Specifics
  const [brand, setBrand] = useState('Canon');
  const [type, setType] = useState('');
  const [model, setModel] = useState('');
  const [upc, setUpc] = useState('');
  const [format, setFormat] = useState('35 mm');
  const [color, setColor] = useState('Silver');
  const [focusType, setFocusType] = useState('Manual');
  const [series, setSeries] = useState('Compact');
  const [features, setFeatures] = useState('');
  const [mpn, setMpn] = useState('');
  const [unitQuantity, setUnitQuantity] = useState('');
  const [unitType, setUnitType] = useState('Unit');
  const [countryManufacture, setCountryManufacture] = useState('Japan');
  const [yearManufactured, setYearManufactured] = useState('1980s');
  const [warranty, setWarranty] = useState('1 Month');
  const [itemWeight, setItemWeight] = useState('');
  const [californiaProp65, setCaliforniaProp65] = useState('');
  const [itemHeight, setItemHeight] = useState('');
  const [itemLength, setItemLength] = useState('');
  const [itemWidth, setItemWidth] = useState('');
  const [showLessSpecifics, setShowLessSpecifics] = useState(false);
  
  // Condition
  const [condition, setCondition] = useState('Used');
  const [conditionDescription, setConditionDescription] = useState('');
  
  // Description
  const [description, setDescription] = useState('');
  const [useTemplate, setUseTemplate] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  
  // Template editing states
  const [selectedTemplateId, setSelectedTemplateId] = useState('template1');
  const [templateFields, setTemplateFields] = useState<TemplateFields>(defaultTemplateFields);
  const [templatePreviewHtml, setTemplatePreviewHtml] = useState('');
  const [isTemplatePreviewMode, setIsTemplatePreviewMode] = useState(false);
  const [templateOpticsChecks, setTemplateOpticsChecks] = useState({
    noFungus: true,
    noHaze: true,
    noScratches: true,
    fewDust: true,
    noProblem: true
  });
  const [templateOpticsAdditionalComment, setTemplateOpticsAdditionalComment] = useState('');
  
  // Refs for scroll synchronization
  const templateEditRef = useRef<HTMLDivElement>(null);
  const templatePreviewRef = useRef<HTMLDivElement>(null);
  
  // Pricing
  const [formatType, setFormatType] = useState('Buy It Now');
  const [itemPrice, setItemPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [paymentPolicy, setPaymentPolicy] = useState('PayPal [57 listings]');
  const [allowOffers, setAllowOffers] = useState(true);
  const [minimumOffer, setMinimumOffer] = useState(0);
  const [autoAccept, setAutoAccept] = useState(0);
  const [scheduleYourListing, setScheduleYourListing] = useState(false);
  
  // Promotion
  const [generalPromotion, setGeneralPromotion] = useState(false);
  const [priorityPromotion, setPriorityPromotion] = useState(false);

  // 商品変更時の初期化
  useEffect(() => {
    if (product) {
      setItemTitle(product.name);
      setCustomLabel(product.sku);
      setItemPrice(product.price);
      setCondition(product.condition);
      setDescription(product.description || '');
      
      // メタデータからシリアル番号を取得
      let productSerialNumber = product.sku; // デフォルトはSKU
      try {
        const metadata = product.metadata ? 
          (typeof product.metadata === 'string' ? JSON.parse(product.metadata) : product.metadata) : {};
        const serial = metadata?.serialNumber || metadata?.deliveryPlanInfo?.serialNumber;
        if (serial) {
          productSerialNumber = serial;
        }
      } catch (err) {
        console.error('シリアル番号取得エラー:', err);
      }
      
      // テンプレートフィールドを商品情報で初期化
      setTemplateFields({
        ...defaultTemplateFields,
        itemTitle: product.name,
        serialNumber: productSerialNumber
      });
      
      // 撮影済み画像を取得
      fetchPhotographyImages(product.id);
    }
  }, [product]);

  // テンプレートプレビューHTMLを更新
  useEffect(() => {
    if (useTemplate) {
      const selectedTemplate = ebayListingTemplates.find(t => t.id === selectedTemplateId);
      if (selectedTemplate) {
        const html = applyFieldsToTemplate(selectedTemplate.html, templateFields);
        setTemplatePreviewHtml(html);
        setDescription(html); // メインのdescriptionも更新
      }
    }
  }, [selectedTemplateId, templateFields, useTemplate]);

  // Opticsフィールドを更新
  useEffect(() => {
    if (useTemplate) {
      const opticsText = `Beautiful condition.<br>
${templateOpticsChecks.noFungus ? 'There is no fungus.<br>' : ''}
${templateOpticsChecks.noHaze ? 'There is no haze.<br>' : ''}
${templateOpticsChecks.noScratches ? 'There is no scratches.<br>' : ''}
${templateOpticsChecks.fewDust ? 'There is a few dust.<br>' : ''}
${templateOpticsChecks.noProblem ? '<strong>No problem in the shooting.</strong>' : ''}${templateOpticsAdditionalComment ? '<br>' + templateOpticsAdditionalComment.replace(/\n/g, '<br>') : ''}`;
      
      setTemplateFields(prev => ({ ...prev, optics: opticsText }));
    }
  }, [templateOpticsChecks, templateOpticsAdditionalComment, useTemplate]);

  // メイン表示画像を設定
  useEffect(() => {
    if (photographyImages.length > 0 && !mainDisplayImage) {
      setMainDisplayImage(photographyImages[0]);
    }
  }, [photographyImages, mainDisplayImage]);

  // プレビューのメイン画像を設定
  useEffect(() => {
    if (showPreview && allSelectedImages.length > 0) {
      setPreviewMainImage(allSelectedImages[0].url);
    }
  }, [showPreview, allSelectedImages]);

  // 撮影済み画像を取得
  const fetchPhotographyImages = async (productId: string) => {
    try {
      setLoadingPhotography(true);
      setPhotographyError(null);
      
      const response = await fetch(`/api/products/${productId}/photography`);
      if (!response.ok) {
        throw new Error('撮影データの取得に失敗しました');
      }
      
      const data = await response.json();
      if (data.success && data.data.photos) {
        setPhotographyImages(data.data.photos);
      }
    } catch (error) {
      console.error('Photography images fetch error:', error);
      setPhotographyError(error instanceof Error ? error.message : '撮影データの取得に失敗しました');
    } finally {
      setLoadingPhotography(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // 統合選択リストに追加
    const newImages = files.map(file => ({
      url: URL.createObjectURL(file),
      source: 'computer' as const,
      file: file
    }));

    setAllSelectedImages(prev => [...prev, ...newImages].slice(0, 24));
    setPhotos(prev => [...prev, ...files].slice(0, 24));
  };

  // 統合画像選択処理
  const handleImageSelect = (imageUrl: string, source: 'computer' | 'photography', file?: File) => {
    setAllSelectedImages(prev => {
      const isSelected = prev.some(img => img.url === imageUrl);
      if (isSelected) {
        return prev.filter(img => img.url !== imageUrl);
      } else {
        // 最大24枚まで選択可能
        if (prev.length >= 24) {
          return prev;
        }
        return [...prev, { url: imageUrl, source, file }];
      }
    });

    // 撮影画像の場合は既存のstateも更新
    if (source === 'photography') {
      setSelectedPhotographyImages(prev => {
        const isSelected = prev.includes(imageUrl);
        if (isSelected) {
          return prev.filter(url => url !== imageUrl);
        } else {
          if (prev.length >= 24) {
            return prev;
          }
          return [...prev, imageUrl];
        }
      });
    }
  };

  // 撮影済み画像の選択処理（後方互換性のため）
  const handlePhotographyImageSelect = (imageUrl: string) => {
    handleImageSelect(imageUrl, 'photography');
  };

  // サムネイルクリックで大きな画像を表示
  const handleThumbnailClick = (imageUrl: string) => {
    console.log('🖼️ handleThumbnailClick 呼び出し:', imageUrl);
    console.log('🔍 現在のmainDisplayImage:', mainDisplayImage);
    setMainDisplayImage(imageUrl);
    console.log('✅ setMainDisplayImage 実行完了');
  };

  // プレビューサムネイルクリックでメイン画像を変更
  const handlePreviewThumbnailClick = (imageUrl: string) => {
    console.log('🎯 プレビューサムネイルクリック:', imageUrl);
    setPreviewMainImage(imageUrl);
    console.log('✅ プレビューメイン画像を更新:', imageUrl);
  };

  // 撮影済み画像を全選択/全解除
  const handleSelectAllPhotography = () => {
    const photographySelected = allSelectedImages.filter(img => img.source === 'photography');
    if (photographySelected.length === photographyImages.length) {
      // 撮影画像を全解除（他のソースの画像は保持）
      setAllSelectedImages(prev => prev.filter(img => img.source !== 'photography'));
    } else {
      // 撮影画像を全選択
      const newPhotographyImages = photographyImages.slice(0, 24).map(url => ({
        url,
        source: 'photography' as const
      }));
      setAllSelectedImages(prev => [
        ...prev.filter(img => img.source !== 'photography'),
        ...newPhotographyImages
      ]);
    }
  };

  // スクロール連動機能
  const handleTemplateScroll = (source: 'edit' | 'preview') => {
    return (e: React.UIEvent<HTMLDivElement>) => {
      const sourceElement = e.target as HTMLDivElement;
      const targetElement = source === 'edit' ? templatePreviewRef.current : templateEditRef.current;
      
      if (targetElement && sourceElement) {
        const scrollRatio = sourceElement.scrollTop / (sourceElement.scrollHeight - sourceElement.clientHeight);
        const targetScrollTop = scrollRatio * (targetElement.scrollHeight - targetElement.clientHeight);
        targetElement.scrollTop = targetScrollTop;
      }
    };
  };

  // テンプレートフィールド変更ハンドラー
  const handleTemplateFieldChange = (fieldName: keyof TemplateFields, value: string) => {
    setTemplateFields(prev => ({ ...prev, [fieldName]: value }));
  };

  // テンプレートリセット処理
  const handleTemplateReset = () => {
    setTemplateFields(defaultTemplateFields);
    setTemplateOpticsChecks({
      noFungus: true,
      noHaze: true,
      noScratches: true,
      fewDust: true,
      noProblem: true
    });
    setTemplateOpticsAdditionalComment('');
  };

  const handleSubmit = async () => {
    if (!product) {
      setError('Product information is missing');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 統合画像選択から画像を分類
      const computerImages = allSelectedImages.filter(img => img.source === 'computer' && img.file).map(img => img.file!);
      const photographyImageUrls = allSelectedImages.filter(img => img.source === 'photography').map(img => img.url);

      const listingData = {
        productId: product.id,
        // Photos & Video - 統合選択対応
        photos: computerImages,
        photographyImages: photographyImageUrls,
        allSelectedImages: allSelectedImages, // 統合選択データも送信
        video: video,
        // Title
        title: itemTitle,
        subtitle: subtitle,
        customLabel: customLabel,
        // Category
        category: category,
        storeCategory: storeCategory,
        // Item Specifics
        brand: brand,
        type: type,
        model: model,
        upc: upc,
        format: format,
        color: color,
        focusType: focusType,
        series: series,
        features: features,
        mpn: mpn,
        unitQuantity: unitQuantity,
        unitType: unitType,
        countryManufacture: countryManufacture,
        yearManufactured: yearManufactured,
        warranty: warranty,
        itemWeight: itemWeight,
        californiaProp65: californiaProp65,
        itemHeight: itemHeight,
        itemLength: itemLength,
        itemWidth: itemWidth,
        customSpecifics: customSpecifics,
        // Condition
        condition: condition,
        conditionDescription: conditionDescription,
        // Description
        description: description,
        // Pricing
        formatType: formatType,
        price: itemPrice,
        quantity: quantity,
        paymentPolicy: paymentPolicy,
        allowOffers: allowOffers,
        minimumOffer: minimumOffer,
        autoAccept: autoAccept,
        scheduleYourListing: scheduleYourListing,
        // Promotion
        generalPromotion: generalPromotion,
        priorityPromotion: priorityPromotion
      };

      // 開発環境では直接モック処理を実行
      console.log('🔍 開発環境: モック出品処理を実行中');
      
      // モック出品処理（開発環境用）
      const mockListingId = `MOCK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const result = {
        success: true,
        listingId: mockListingId,
        url: `https://www.ebay.com/itm/${mockListingId}`,
        message: '開発環境での模擬出品が完了しました',
        productId: product.id,
        title: listingData.title || product.name,
        price: listingData.price
      };
      
      console.log('🎉 開発環境: モック出品完了', result);
      
      // 出品データをListingテーブルに作成し、商品ステータスを更新
      try {
        const listingCreateResponse = await fetch(`/api/listing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            platform: 'ebay',
            customSettings: {
              title: listingData.title || product.name,
              description: listingData.description,
              price: listingData.price
            }
          })
        });
        
        if (listingCreateResponse.ok) {
          const listingResult = await listingCreateResponse.json();
          console.log('[SUCCESS] Listingテーブルにレコードを作成し、商品ステータスを"出品中"に更新しました', listingResult);
          result.listingId = listingResult.data?.id;
          result.success = true;
          result.message = '出品処理が正常に完了しました';
        } else {
          const errorResult = await listingCreateResponse.json();
          console.error('[ERROR] Listing作成に失敗しました:', listingCreateResponse.status, errorResult);
          
          // エラーの場合は例外を投げて、外側のcatchでハンドリング
          throw new Error(errorResult.error || 'Listing作成に失敗しました');
        }
      } catch (error) {
        console.error('[ERROR] Listing作成エラー:', error);
        // エラーを再度投げて外側のcatchでハンドリング
        throw error;
      }

      showToast({
        title: language === 'ja' ? '出品完了' : 'Listing Complete',
        message: language === 'ja' 
          ? `${product.name} をeBayに出品しました。在庫リストでステータスをご確認ください。` 
          : `${product.name} has been listed on eBay. Please check status in inventory list.`,
        type: 'success'
      });

      if (onSuccess) {
        onSuccess(result);
      }

      onClose();
      
      // 出品完了後、在庫リスト画面へ遷移
      setTimeout(() => {
        router.push('/inventory');
      }, 1000);

    } catch (error: any) {
      console.error('Listing error:', error);
      setError(error.message || 'An error occurred during listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !product) return null;

  // テンプレートエディタを表示
  if (showTemplateEditor) {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={language === 'ja' ? 'eBay出品テンプレート編集' : 'eBay Listing Template Editor'}
        size="xl"
        showBusinessFlow={false}
      >
        <div className="h-[70vh]">
          <TemplateEditor
            initialDescription={description}
            onSave={(html) => {
              setDescription(html);
              setShowTemplateEditor(false);
              showToast({
                title: language === 'ja' ? 'テンプレート適用完了' : 'Template Applied',
                message: language === 'ja' ? 'テンプレートが適用されました' : 'Template has been applied',
                type: 'success'
              });
            }}
            onCancel={() => setShowTemplateEditor(false)}
          />
        </div>
      </BaseModal>
    );
  }

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={t.title}
        size="xl"
      >
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Language Toggle */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t.title}</h2>
            <div className="flex items-center space-x-2">
              <GlobeAltIcon className="w-4 h-4" />
              <span className="text-sm">{t.languageToggle}:</span>
              <button
                onClick={() => setLanguage(language === 'en' ? 'ja' : 'en')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  language === 'en' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  language === 'ja' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                日本語
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-8">
            {/* PHOTOS & VIDEO */}
            <section>
              <h3 className="text-lg font-semibold mb-2">{t.photosVideo}</h3>
              <p className="text-sm text-gray-600 mb-4">
                ローカルPCからアップロードまたは撮影済み画像から選択（最大24枚）
                <span className="ml-2 text-blue-600 font-medium">
                  選択済み: {allSelectedImages.length}/24
                </span>
              </p>

              {/* Computer Upload Section */}
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-700">ローカルPCから画像をアップロード</h4>
                  </div>
                  <div className="text-center">
                    <PhotoIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500 mb-4 text-sm">{t.dragDropFiles}</p>
                    <label className="inline-block">
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <span className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
                        ファイルを選択
                      </span>
                    </label>
                  </div>
                </div>

                {/* Photography Images Section */}
                <div className="border-2 border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-700">撮影済み画像から選択</h4>
                    {photographyImages.length > 0 && (
                      <button
                        onClick={handleSelectAllPhotography}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        {allSelectedImages.filter(img => img.source === 'photography').length === photographyImages.length ? '全解除' : '全選択'}
                      </button>
                    )}
                  </div>
                  {loadingPhotography ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">撮影済み画像を読み込み中...</p>
                    </div>
                  ) : photographyError ? (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-600 mb-2">{photographyError}</p>
                      <button
                        onClick={() => product && fetchPhotographyImages(product.id)}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        再読み込み
                      </button>
                    </div>
                  ) : photographyImages.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-gray-600">この商品の撮影済み画像はありません</p>
                      <p className="text-gray-500 text-sm mt-1">撮影工程で商品の撮影を完了してください</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Main Image Display */}
                      {mainDisplayImage && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">画像プレビュー（現在: {mainDisplayImage ? mainDisplayImage.substring(mainDisplayImage.lastIndexOf('/') + 1, mainDisplayImage.lastIndexOf('/') + 10) + '...' : 'なし'}）</h5>
                          <div className="aspect-square max-w-sm mx-auto">
                            <img
                              src={mainDisplayImage}
                              alt="メイン表示画像"
                              className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                            />
                          </div>
                        </div>
                      )}

                      {/* Thumbnail Grid */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">サムネイル一覧（クリックでプレビューを変更）</h5>
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-3 max-h-64 overflow-y-auto">
                      {photographyImages.map((imageUrl, index) => {
                        const isSelected = allSelectedImages.some(img => img.url === imageUrl);
                        return (
                          <div
                            key={index}
                            onClick={() => {
                              console.log('🔥 親divクリック:', imageUrl);
                              handleThumbnailClick(imageUrl);
                            }}
                            className={`aspect-square relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                              isSelected
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : mainDisplayImage === imageUrl
                                  ? 'border-yellow-500 ring-2 ring-yellow-200'
                                  : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <img
                              src={imageUrl}
                              alt={`撮影画像 ${index + 1}`}
                              className="w-full h-full object-cover cursor-pointer bg-red-100"
                              onClick={(e) => {
                                console.log('🖼️ 画像直接クリック:', imageUrl);
                                e.stopPropagation();
                                handleThumbnailClick(imageUrl);
                              }}
                            />
                            {/* Selection checkbox overlay */}
                            <div
                              className="absolute top-1 left-1 w-5 h-5 bg-white bg-opacity-90 rounded border-2 border-gray-300 hover:border-blue-500 cursor-pointer flex items-center justify-center z-10"
                              onClick={(e) => {
                                console.log('☑️ チェックボックスクリック:', imageUrl);
                                e.stopPropagation();
                                handleImageSelect(imageUrl, 'photography');
                              }}
                            >
                              {isSelected && (
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded pointer-events-none">
                              撮影
                            </div>
                          </div>
                        );
                      })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Images Preview - All Sources */}
              {allSelectedImages.length > 0 && (
                <div className="mt-4 border-2 border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-700">
                      選択済み画像 ({allSelectedImages.length}/24)
                    </h4>
                    <button
                      onClick={() => setAllSelectedImages([])}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 text-red-600"
                    >
                      全て削除
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                    {allSelectedImages.map((image, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded border relative group">
                        <img
                          src={image.url}
                          alt={`選択画像 ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                        />
                        <button
                          onClick={() => {
                            setAllSelectedImages(prev => prev.filter((_, i) => i !== index));
                            // 撮影画像の場合は別のstateからも削除
                            if (image.source === 'photography') {
                              setSelectedPhotographyImages(prev => prev.filter(url => url !== image.url));
                            } else {
                              setPhotos(prev => prev.filter(file => URL.createObjectURL(file) !== image.url));
                            }
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                          {image.source === 'computer' ? 'PC' : '撮影'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* TITLE */}
            <section>
              <h3 className="text-lg font-semibold mb-4">{t.itemTitle}</h3>
              <div className="space-y-4">
                <div>
                  <NexusInput
                    label={t.itemTitleLabel}
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    placeholder={product?.name}
                    maxLength={80}
                  />
                  <p className="text-xs text-gray-500 mt-1">{itemTitle.length}/80</p>
                </div>
                <div>
                  <NexusInput
                    label={`${t.subtitle} — $2.20`}
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    maxLength={55}
                  />
                  <p className="text-xs text-gray-500 mt-1">{subtitle.length}/55</p>
                </div>
                <div>
                  <NexusInput
                    label={t.customLabel}
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    placeholder={product?.sku}
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-500 mt-1">{customLabel.length}/50</p>
                </div>
              </div>
            </section>

            {/* ITEM CATEGORY */}
            <section>
              <h3 className="text-lg font-semibold mb-4">{t.itemCategory}</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">{t.filmCameras}</p>
                  <p className="text-sm text-gray-600">{t.cameraPhoto}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t.storeCategory}</label>
                  <NexusSelect
                    value={storeCategory}
                    onChange={(e) => setStoreCategory(e.target.value)}
                    options={[
                      { value: 'film-camera', label: 'film camera' }
                    ]}
                  />
                </div>
              </div>
            </section>

            {/* ITEM SPECIFICS */}
            <section>
              <h3 className="text-lg font-semibold mb-2">{t.itemSpecifics}</h3>
              <div className="mb-4">
                <p className="text-sm font-medium">{t.required}</p>
                <p className="text-sm text-gray-600">{t.buyersNeed}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NexusSelect
                  label={t.brand}
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  options={[
                    { value: 'Canon', label: t.canon }
                  ]}
                />
                <NexusSelect
                  label={t.type}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  options={[
                    { value: 'slr', label: 'SLR' },
                    { value: 'rangefinder', label: 'Rangefinder' },
                    { value: 'compact', label: 'Compact' },
                    { value: 'instant', label: 'Instant' },
                    { value: 'point-shoot', label: 'Point & Shoot' }
                  ]}
                />
                <NexusSelect
                  label={t.model}
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  options={[
                    { value: 'ae-1', label: 'AE-1' },
                    { value: 'a-1', label: 'A-1' },
                    { value: 'f-1', label: 'F-1' },
                    { value: 't90', label: 'T90' },
                    { value: 'other', label: t.enterYourOwn }
                  ]}
                />
                <NexusInput
                  label={t.upc}
                  value={upc}
                  onChange={(e) => setUpc(e.target.value)}
                  placeholder={t.enterNumber}
                />
                <NexusSelect
                  label={`${t.format} — ~196K searches`}
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  options={[
                    { value: '35 mm', label: t.mm35 },
                    { value: '50 mm', label: t.mm50 },
                    { value: 'APS', label: t.aps }
                  ]}
                />
                <NexusSelect
                  label={`${t.color} — ~62K searches`}
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  options={[
                    { value: 'Silver', label: t.silver },
                    { value: 'Black', label: t.black },
                    { value: 'Gray', label: t.gray }
                  ]}
                />
                <NexusSelect
                  label={`${t.focusType} — ~33.2K searches`}
                  value={focusType}
                  onChange={(e) => setFocusType(e.target.value)}
                  options={[
                    { value: 'Manual', label: t.manual },
                    { value: 'Auto', label: t.auto },
                    { value: 'Auto & Manual', label: t.autoManual }
                  ]}
                />
                <NexusSelect
                  label={`${t.series} — Trending`}
                  value={series}
                  onChange={(e) => setSeries(e.target.value)}
                  options={[
                    { value: 'Compact', label: t.compact }
                  ]}
                />
                <NexusSelect
                  label={`${t.features} — Trending`}
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  options={[
                    { value: 'built-in-flash', label: 'Built-in Flash' },
                    { value: 'timer', label: 'Timer' },
                    { value: 'auto-exposure', label: 'Auto Exposure' },
                    { value: 'tripod-mount', label: 'Tripod Mount' },
                    { value: 'light-meter', label: 'Light Meter' }
                  ]}
                />
                <NexusInput
                  label={t.mpn}
                  value={mpn}
                  onChange={(e) => setMpn(e.target.value)}
                  placeholder="e.g. AE-1, A-1"
                />
                <NexusInput
                  label={t.unitQuantity}
                  value={unitQuantity}
                  onChange={(e) => setUnitQuantity(e.target.value)}
                  placeholder={t.enterYourOwn}
                />
                <NexusSelect
                  label={t.unitType}
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value)}
                  options={[
                    { value: 'Unit', label: t.unit }
                  ]}
                />
                <NexusSelect
                  label={`${t.countryManufacture} — ~12.7K searches`}
                  value={countryManufacture}
                  onChange={(e) => setCountryManufacture(e.target.value)}
                  options={[
                    { value: 'Japan', label: t.japan },
                    { value: 'Taiwan', label: t.taiwan },
                    { value: 'China', label: t.china }
                  ]}
                />
                <NexusSelect
                  label={`${t.yearManufactured} — ~564 searches`}
                  value={yearManufactured}
                  onChange={(e) => setYearManufactured(e.target.value)}
                  options={[
                    { value: '1980s', label: t.s1980 },
                    { value: '1970s', label: t.s1970 },
                    { value: '1960s', label: t.s1960 }
                  ]}
                />
                <NexusSelect
                  label={t.warranty}
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  options={[
                    { value: '1 Month', label: t.month1 },
                    { value: '1 Year', label: t.year1 }
                  ]}
                />
                {!showLessSpecifics && (
                  <>
                    <NexusInput
                      label={t.itemWeight}
                      value={itemWeight}
                      onChange={(e) => setItemWeight(e.target.value)}
                      placeholder={t.enterYourOwn}
                    />
                    <NexusTextarea
                      label={t.californiaProp65}
                      value={californiaProp65}
                      onChange={(e) => setCaliforniaProp65(e.target.value)}
                      placeholder={t.enterYourOwn}
                      rows={2}
                    />
                    <NexusInput
                      label={t.itemHeight}
                      value={itemHeight}
                      onChange={(e) => setItemHeight(e.target.value)}
                      placeholder={t.enterYourOwn}
                    />
                    <NexusInput
                      label={t.itemLength}
                      value={itemLength}
                      onChange={(e) => setItemLength(e.target.value)}
                      placeholder={t.enterYourOwn}
                    />
                    <NexusInput
                      label={t.itemWidth}
                      value={itemWidth}
                      onChange={(e) => setItemWidth(e.target.value)}
                      placeholder={t.enterYourOwn}
                    />
                  </>
                )}

                {/* カスタム項目 */}
                {customSpecifics.map((spec) => (
                  <div key={spec.id} className="col-span-2 grid grid-cols-2 gap-4">
                    <NexusInput
                      label="カスタム項目名"
                      value={spec.name}
                      onChange={(e) => {
                        const updated = customSpecifics.map(s => 
                          s.id === spec.id ? { ...s, name: e.target.value } : s
                        );
                        setCustomSpecifics(updated);
                      }}
                      placeholder="例: レンズマウント"
                    />
                    <div className="relative">
                      <NexusInput
                        label="値"
                        value={spec.value}
                        onChange={(e) => {
                          const updated = customSpecifics.map(s => 
                            s.id === spec.id ? { ...s, value: e.target.value } : s
                          );
                          setCustomSpecifics(updated);
                        }}
                        placeholder="例: Canon FD"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCustomSpecifics(customSpecifics.filter(s => s.id !== spec.id));
                        }}
                        className="absolute right-2 top-8 text-red-500 hover:text-red-700"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    const newId = `custom-${Date.now()}`;
                    setCustomSpecifics([...customSpecifics, { id: newId, name: '', value: '' }]);
                  }}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  {t.addCustom}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLessSpecifics(!showLessSpecifics)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                >
                  {showLessSpecifics ? <PlusIcon className="w-4 h-4 mr-1" /> : <MinusIcon className="w-4 h-4 mr-1" />}
                  {t.showLess}
                </button>
              </div>
            </section>

            {/* VARIATIONS */}
            <section>
              <h3 className="text-lg font-semibold mb-2">{t.variations}</h3>
              <p className="text-sm text-gray-600 mb-4">{t.variationsDesc}</p>
            </section>

            {/* CONDITION */}
            <section>
              <h3 className="text-lg font-semibold mb-4">{t.condition}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.itemCondition}</label>
                  <div className="text-sm font-medium">{t.used}</div>
                </div>
                <div>
                  <NexusTextarea
                    label={t.conditionDescription}
                    value={conditionDescription}
                    onChange={(e) => setConditionDescription(e.target.value)}
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500 mt-1">{conditionDescription.length}/1000</p>
                </div>
              </div>
            </section>

            {/* DESCRIPTION */}
            <section>
              <h3 className="text-lg font-semibold mb-4">{t.description}</h3>
              <div className="space-y-4">
                {/* テンプレート使用オプション */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {language === 'ja' ? 'プロフェッショナルテンプレートを使用' : 'Use Professional Template'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <NexusCheckbox
                      checked={useTemplate}
                      onChange={(e) => setUseTemplate(e.target.checked)}
                      label=""
                    />
                    {useTemplate && (
                      <NexusButton
                        size="sm"
                        onClick={() => setShowTemplateEditor(true)}
                        className="bg-gradient-to-r from-[#0064D2] to-[#0078FF] text-white"
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        {language === 'ja' ? 'テンプレート編集' : 'Edit Template'}
                      </NexusButton>
                    )}
                  </div>
                </div>

                {/* 通常のテキストエリア（テンプレート未使用時） */}
                {!useTemplate && (
                  <>
                    <NexusTextarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t.writeDescription}
                      rows={8}
                      maxLength={4000}
                    />
                    <p className="text-xs text-gray-500">{description.length}/4000</p>
                  </>
                )}

                {/* テンプレート使用時の編集・プレビュー */}
                {useTemplate && (
                  <div className="border rounded-lg overflow-hidden bg-white">
                    {/* テンプレート選択 */}
                    <div className="p-3 bg-gray-50 border-b">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'ja' ? 'テンプレート選択' : 'Template Selection'}
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {ebayListingTemplates.map((template) => (
                          <div
                            key={template.id}
                            onClick={() => setSelectedTemplateId(template.id)}
                            className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                              selectedTemplateId === template.id
                                ? 'border-blue-500 shadow-lg scale-105'
                                : 'border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            <img
                              src={template.coverImage}
                              alt={template.name}
                              className="w-full h-12 object-cover"
                            />
                            <div className="p-1 text-xs text-center font-medium">
                              {template.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ヘッダーコントロール */}
                    <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">
                          {language === 'ja' ? 'テンプレート編集・プレビュー' : 'Template Editor & Preview'}
                        </h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsTemplatePreviewMode(!isTemplatePreviewMode)}
                            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 text-white text-sm"
                          >
                            {isTemplatePreviewMode ? (
                              <>
                                <Edit3 className="w-4 h-4" />
                                {language === 'ja' ? '編集に戻る' : 'Edit'}
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4" />
                                {language === 'ja' ? 'プレビュー' : 'Preview'}
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleTemplateReset}
                            className="px-2 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-1 text-white text-sm"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 編集・プレビューエリア */}
                    <div className="flex h-96 overflow-hidden">
                      {/* 左側：編集フォーム */}
                      <div 
                        ref={templateEditRef}
                        className={`${isTemplatePreviewMode ? 'hidden' : 'flex'} md:flex flex-col w-full md:w-1/2 p-4 overflow-y-auto bg-white border-r`}
                        onScroll={handleTemplateScroll('edit')}
                      >
                        <div className="space-y-3">
                          {/* Item Title */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              {language === 'ja' ? '商品タイトル' : 'Item Title'}
                            </label>
                            <NexusInput
                              value={templateFields.itemTitle}
                              onChange={(e) => handleTemplateFieldChange('itemTitle', e.target.value)}
                              placeholder="例: Canon AE-1 Program 35mm Film Camera"
                              size="sm"
                            />
                          </div>

                          {/* Total Condition */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              {language === 'ja' ? '全体の状態' : 'Total Condition'}
                            </label>
                            <NexusSelect
                              value={templateFields.totalCondition}
                              onChange={(e) => handleTemplateFieldChange('totalCondition', e.target.value)}
                              size="sm"
                            >
                              <option value="Mint condition">Mint condition (新品同様)</option>
                              <option value="Near Mint condition">Near Mint condition (極美品)</option>
                              <option value="Excellent condition">Excellent condition (美品)</option>
                              <option value="Very Good condition">Very Good condition (良品)</option>
                              <option value="Good condition">Good condition (並品)</option>
                              <option value="Fair condition">Fair condition (難あり)</option>
                            </NexusSelect>
                          </div>

                          {/* Serial Number */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              {language === 'ja' ? 'シリアル番号' : 'Serial Number'}
                            </label>
                            <NexusInput
                              value={templateFields.serialNumber}
                              onChange={(e) => handleTemplateFieldChange('serialNumber', e.target.value)}
                              placeholder="例: 1234567"
                              size="sm"
                            />
                          </div>

                          {/* Appearance */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              {language === 'ja' ? '外観' : 'Appearance'}
                            </label>
                            <NexusTextarea
                              value={templateFields.appearance.replace(/<br>/g, '\n')}
                              onChange={(e) => handleTemplateFieldChange('appearance', e.target.value.replace(/\n/g, '<br>'))}
                              rows={3}
                              placeholder="外観の状態を詳しく記載"
                              size="sm"
                            />
                          </div>

                          {/* Optics */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              {language === 'ja' ? '光学系 (カメラ・レンズ用)' : 'Optics'}
                            </label>
                            <div className="space-y-1 p-2 bg-gray-50 rounded-lg text-xs">
                              <NexusCheckbox
                                checked={templateOpticsChecks.noFungus}
                                onChange={(e) => setTemplateOpticsChecks(prev => ({ ...prev, noFungus: e.target.checked }))}
                                label="No fungus (カビなし)"
                                size="sm"
                              />
                              <NexusCheckbox
                                checked={templateOpticsChecks.noHaze}
                                onChange={(e) => setTemplateOpticsChecks(prev => ({ ...prev, noHaze: e.target.checked }))}
                                label="No haze (くもりなし)"
                                size="sm"
                              />
                              <NexusCheckbox
                                checked={templateOpticsChecks.noScratches}
                                onChange={(e) => setTemplateOpticsChecks(prev => ({ ...prev, noScratches: e.target.checked }))}
                                label="No scratches (キズなし)"
                                size="sm"
                              />
                              <NexusCheckbox
                                checked={templateOpticsChecks.fewDust}
                                onChange={(e) => setTemplateOpticsChecks(prev => ({ ...prev, fewDust: e.target.checked }))}
                                label="Few dust (チリ少量)"
                                size="sm"
                              />
                              <NexusCheckbox
                                checked={templateOpticsChecks.noProblem}
                                onChange={(e) => setTemplateOpticsChecks(prev => ({ ...prev, noProblem: e.target.checked }))}
                                label="No problem in shooting (撮影に問題なし)"
                                size="sm"
                              />
                            </div>
                            <NexusTextarea
                              value={templateOpticsAdditionalComment}
                              onChange={(e) => setTemplateOpticsAdditionalComment(e.target.value)}
                              rows={2}
                              placeholder="追加コメント（オプション）"
                              className="mt-1"
                              size="sm"
                            />
                          </div>

                          {/* Functional */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              {language === 'ja' ? '動作状態' : 'Functional'}
                            </label>
                            <NexusSelect
                              value={templateFields.functional}
                              onChange={(e) => handleTemplateFieldChange('functional', e.target.value)}
                              size="sm"
                            >
                              <option value="It works properly.">It works properly (正常動作)</option>
                              <option value="It works with minor issues.">It works with minor issues (軽微な問題あり)</option>
                              <option value="It has some issues.">It has some issues (問題あり)</option>
                              <option value="For parts only.">For parts only (部品取り)</option>
                              <option value="Not tested.">Not tested (動作未確認)</option>
                            </NexusSelect>
                          </div>

                          {/* Bundled Items */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              {language === 'ja' ? '付属品' : 'Bundled Items'}
                            </label>
                            <NexusTextarea
                              value={templateFields.bundledItems.replace(/<br>/g, '\n')}
                              onChange={(e) => handleTemplateFieldChange('bundledItems', e.target.value.replace(/\n/g, '<br>'))}
                              rows={3}
                              placeholder="付属品を記載（例: Camera body, Lens cap, Strap...）"
                              size="sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 右側：プレビュー */}
                      <div 
                        ref={templatePreviewRef}
                        className={`${isTemplatePreviewMode ? 'w-full' : 'hidden'} md:block md:w-1/2 p-4 bg-gray-50 overflow-y-auto`}
                        onScroll={handleTemplateScroll('preview')}
                      >
                        <div className="h-full flex flex-col">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="text-xs font-medium text-gray-700">
                              {language === 'ja' ? 'プレビュー' : 'Preview'}
                            </h5>
                          </div>
                          <div className="flex-1 bg-white rounded-lg shadow-inner overflow-auto border">
                            {templatePreviewHtml ? (
                              <div
                                dangerouslySetInnerHTML={{ __html: templatePreviewHtml }}
                                className="w-full min-h-full p-2"
                                style={{ 
                                  fontSize: '11px',
                                  lineHeight: '1.4',
                                  fontFamily: 'Verdana, sans-serif'
                                }}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
                                {language === 'ja' ? 'プレビューを生成中...' : 'Generating preview...'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI生成ボタン（テンプレート未使用時のみ） */}
                {!useTemplate && (
                  <button
                    type="button"
                    onClick={async () => {
                      setIsGeneratingAI(true);
                      try {
                        // AI説明生成のシミュレーション
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        
                        const aiDescription = `【${product?.name}】

■ 商品の特徴
・${brand}製の${type || 'カメラ'}です
・カラー: ${color}
・フォーカスタイプ: ${focusType}
・フォーマット: ${format}
${features ? `・特徴: ${features}` : ''}

■ 商品の状態
・${condition}品です
${conditionDescription ? `・${conditionDescription}` : ''}

■ 付属品
・本体のみ（写真に写っているものが全てです）

■ 発送について
・丁寧に梱包して発送いたします
・追跡番号付きで安心

■ 注意事項
・中古品のため、神経質な方はご遠慮ください
・返品・返金は商品説明と著しく異なる場合のみ対応いたします`;
                        
                        setDescription(aiDescription);
                        showToast({
                          title: language === 'ja' ? 'AI説明生成完了' : 'AI Description Generated',
                          message: language === 'ja' ? '商品説明が自動生成されました' : 'Product description has been generated',
                          type: 'success'
                        });
                      } catch (error) {
                        showToast({
                          title: language === 'ja' ? 'エラー' : 'Error',
                          message: language === 'ja' ? 'AI説明の生成に失敗しました' : 'Failed to generate AI description',
                          type: 'error'
                        });
                      } finally {
                        setIsGeneratingAI(false);
                      }
                    }}
                    disabled={isGeneratingAI}
                    className="flex items-center px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingAI ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {language === 'ja' ? '生成中...' : 'Generating...'}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {t.useAiDescription}
                      </>
                    )}
                  </button>
                )}
              </div>
            </section>

            {/* PRICING */}
            <section>
              <h3 className="text-lg font-semibold mb-4">{t.pricing}</h3>
              <div className="space-y-4">
                <NexusSelect
                  label={t.formatLabel}
                  value={formatType}
                  onChange={(e) => setFormatType(e.target.value)}
                  options={[
                    { value: 'Buy It Now', label: t.buyItNow }
                  ]}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NexusInput
                    label={t.itemPrice}
                    type="number"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(Number(e.target.value))}
                    placeholder="$"
                  />
                  <NexusInput
                    label={t.quantity}
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                  />
                </div>
                <NexusSelect
                  label={t.paymentPolicy}
                  value={paymentPolicy}
                  onChange={(e) => setPaymentPolicy(e.target.value)}
                  options={[
                    { value: 'PayPal [57 listings]', label: 'PayPal [57 listings]' }
                  ]}
                />
                <div className="flex items-center justify-between py-4">
                  <div>
                    <div className="font-medium">{t.allowOffers}</div>
                    <div className="text-sm text-gray-600">{t.buyersInterested}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAllowOffers(!allowOffers)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                      allowOffers ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        allowOffers ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {allowOffers && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <NexusInput
                      label={t.minimumOffer}
                      type="number"
                      value={minimumOffer}
                      onChange={(e) => setMinimumOffer(Number(e.target.value))}
                      placeholder="$"
                    />
                    <NexusInput
                      label={t.autoAccept}
                      type="number"
                      value={autoAccept}
                      onChange={(e) => setAutoAccept(Number(e.target.value))}
                      placeholder="$"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between py-4">
                  <div>
                    <div className="font-medium">{t.scheduleYourListing}</div>
                    <div className="text-sm text-gray-600">{t.listingGoesLive}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setScheduleYourListing(!scheduleYourListing)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                      scheduleYourListing ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        scheduleYourListing ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* PROMOTE YOUR LISTING */}
            <section>
              <h3 className="text-lg font-semibold mb-2">{t.promoteYourListing}</h3>
              <p className="text-sm text-gray-600 mb-6">{t.driveMoreSales}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">{t.general}</h4>
                    <button
                      type="button"
                      onClick={() => setGeneralPromotion(!generalPromotion)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                        generalPromotion ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          generalPromotion ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="text-green-600 font-medium text-sm mb-2">▲ {t.moreVisibility100}</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ {t.basicAccess}</li>
                    <li>✓ {t.payPerSale}</li>
                    <li>✓ {t.accelerateSales}</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">{t.priority}</h4>
                    <button
                      type="button"
                      onClick={() => setPriorityPromotion(!priorityPromotion)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                        priorityPromotion ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          priorityPromotion ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="text-green-600 font-medium text-sm mb-2">▲ {t.moreVisibility200}</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ {t.preferentialRanking}</li>
                    <li>✓ {t.payPerClick}</li>
                    <li>✓ {t.multiplySales}</li>
                  </ul>
                </div>
              </div>
              <div className="text-center mt-4">
                <button type="button" className="text-sm text-blue-600 hover:text-blue-800 underline">
                  ⓘ {t.helpMeChoose}
                </button>
              </div>
            </section>

            {/* CHARITY */}
            <section>
              <h3 className="text-lg font-semibold mb-4">{t.charity}</h3>
            </section>
          </div>

          {/* Final section */}
          <div className="mt-8 text-center">
            <h3 className="text-xl font-semibold mb-2">{t.listForFree}</h3>
            <p className="text-sm text-gray-600 mb-6">{t.finalValueFee}</p>
          </div>

          {/* Footer buttons */}
          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
            <NexusButton
              onClick={handleSubmit}
              variant="primary"
              icon={<ShoppingCartIcon className="w-4 h-4" />}
              disabled={!itemTitle || isSubmitting}
              className="px-8 py-3"
            >
              {isSubmitting ? (language === 'ja' ? '出品中...' : 'Listing...') : t.listIt}
            </NexusButton>
            <NexusButton
              onClick={() => {
                // 後で保存機能のシミュレーション
                showToast({
                  title: language === 'ja' ? '下書き保存' : 'Draft Saved',
                  message: language === 'ja' ? '出品情報を下書きとして保存しました' : 'Listing has been saved as draft',
                  type: 'success'
                });
              }}
              className="px-8 py-3"
            >
              {t.saveForLater}
            </NexusButton>
            <NexusButton
              onClick={() => {
                setActiveTab('description'); // プレビュー表示時は常に商品説明タブから開始
                setShowPreview(true);
              }}
              className="px-8 py-3"
            >
              {t.preview}
            </NexusButton>
          </div>
        </div>
      </BaseModal>
      
      {/* プレビューモーダル */}
      {showPreview && (
        <BaseModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title={language === 'ja' ? 'eBay出品プレビュー' : 'eBay Listing Preview'}
          size="xl"
        >
          <div className="p-6">
            {/* eBayスタイルのプレビュー */}
            <div className="max-w-4xl mx-auto">
              {/* タイトルセクション */}
              <h1 className="text-2xl font-bold mb-2">{itemTitle || product?.name}</h1>
              {subtitle && <h2 className="text-lg text-gray-600 mb-4">{subtitle}</h2>}
              
              {/* 画像と基本情報 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* 画像セクション */}
                <div>
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4">
                    {previewMainImage ? (
                      <img
                        src={previewMainImage}
                        alt="Product"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : allSelectedImages.length > 0 ? (
                      <img
                        src={allSelectedImages[0].url}
                        alt="Product"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : product?.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt="Product"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <PhotoIcon className="w-24 h-24 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {allSelectedImages.length > 1 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          全 {allSelectedImages.length} 枚の画像
                        </span>
                      </div>
                      <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                        {allSelectedImages.map((image, index) => (
                          <div
                            key={index}
                            className={`aspect-square bg-gray-100 rounded relative cursor-pointer border-2 transition-all ${
                              previewMainImage === image.url
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                            onClick={() => handlePreviewThumbnailClick(image.url)}
                          >
                            <img
                              src={image.url}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover rounded"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs px-1 text-center">
                              {index + 1}
                            </div>
                            <div className="absolute top-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                              {image.source === 'computer' ? 'PC' : '撮影'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 価格と購入情報 */}
                <div>
                  <div className="bg-gray-50 rounded-lg p-6 mb-4">
                    <div className="text-3xl font-bold mb-2">
                      {formatType === 'Buy It Now' ? `$${itemPrice.toLocaleString()}` : `開始価格: $${itemPrice.toLocaleString()}`}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      {allowOffers && '価格交渉可'}
                    </div>
                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 mb-2">
                      {formatType === 'Buy It Now' ? '今すぐ購入' : '入札する'}
                    </button>
                    <button className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50">
                      ウォッチリストに追加
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">状態:</span>
                      <span className="font-medium">{condition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">数量:</span>
                      <span className="font-medium">{quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">商品番号:</span>
                      <span className="font-medium">{customLabel || product?.sku}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* タブセクション */}
              <div className="border-t pt-6">
                <div className="flex space-x-8 mb-6">
                  <button 
                    onClick={() => setActiveTab('description')}
                    className={`font-medium pb-2 transition-colors ${
                      activeTab === 'description' 
                        ? 'text-blue-600 border-b-2 border-blue-600' 
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    商品説明
                  </button>
                  <button 
                    onClick={() => setActiveTab('shipping')}
                    className={`font-medium pb-2 transition-colors ${
                      activeTab === 'shipping' 
                        ? 'text-blue-600 border-b-2 border-blue-600' 
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    配送と支払い
                  </button>
                  <button 
                    onClick={() => setActiveTab('seller')}
                    className={`font-medium pb-2 transition-colors ${
                      activeTab === 'seller' 
                        ? 'text-blue-600 border-b-2 border-blue-600' 
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    販売者情報
                  </button>
                </div>
                
                {/* タブコンテンツ */}
                {activeTab === 'description' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-bold mb-4">商品の詳細</h3>
                      <dl className="space-y-2">
                        <div className="flex">
                          <dt className="text-gray-600 w-32">ブランド:</dt>
                          <dd className="font-medium">{brand}</dd>
                        </div>
                        {type && (
                          <div className="flex">
                            <dt className="text-gray-600 w-32">タイプ:</dt>
                            <dd className="font-medium">{type}</dd>
                          </div>
                        )}
                        {model && (
                          <div className="flex">
                            <dt className="text-gray-600 w-32">モデル:</dt>
                            <dd className="font-medium">{model}</dd>
                          </div>
                        )}
                        <div className="flex">
                          <dt className="text-gray-600 w-32">フォーマット:</dt>
                          <dd className="font-medium">{format}</dd>
                        </div>
                        <div className="flex">
                          <dt className="text-gray-600 w-32">カラー:</dt>
                          <dd className="font-medium">{color}</dd>
                        </div>
                        <div className="flex">
                          <dt className="text-gray-600 w-32">フォーカス:</dt>
                          <dd className="font-medium">{focusType}</dd>
                        </div>
                        {features && (
                          <div className="flex">
                            <dt className="text-gray-600 w-32">機能:</dt>
                            <dd className="font-medium">{features}</dd>
                          </div>
                        )}
                        {countryManufacture && (
                          <div className="flex">
                            <dt className="text-gray-600 w-32">製造国:</dt>
                            <dd className="font-medium">{countryManufacture}</dd>
                          </div>
                        )}
                        {yearManufactured && (
                          <div className="flex">
                            <dt className="text-gray-600 w-32">製造年:</dt>
                            <dd className="font-medium">{yearManufactured}</dd>
                          </div>
                        )}
                        {warranty && (
                          <div className="flex">
                            <dt className="text-gray-600 w-32">保証:</dt>
                            <dd className="font-medium">{warranty}</dd>
                          </div>
                        )}
                        {customSpecifics.map((spec) => (
                          spec.name && spec.value && (
                            <div key={spec.id} className="flex">
                              <dt className="text-gray-600 w-32">{spec.name}:</dt>
                              <dd className="font-medium">{spec.value}</dd>
                            </div>
                          )
                        ))}
                      </dl>
                    </div>
                    
                    <div>
                      <h3 className="font-bold mb-4">商品説明</h3>
                      <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px]">
                        {description ? (
                          useTemplate ? (
                            <div
                              dangerouslySetInnerHTML={{ __html: description }}
                              style={{ 
                                fontSize: '12px',
                                lineHeight: '1.4',
                                fontFamily: 'Verdana, sans-serif'
                              }}
                            />
                          ) : (
                            <div className="whitespace-pre-wrap text-sm">
                              {description}
                            </div>
                          )
                        ) : (
                          <div className="text-gray-500 text-sm">
                            商品説明が入力されていません
                          </div>
                        )}
                      </div>
                      {conditionDescription && (
                        <>
                          <h4 className="font-bold mt-6 mb-2">状態の詳細</h4>
                          <div className="whitespace-pre-wrap text-sm bg-gray-50 rounded-lg p-3">
                            {conditionDescription}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === 'shipping' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-bold mb-4">配送オプション</h3>
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">国際配送 (FedEx)</span>
                            <span className="font-bold">送料無料</span>
                          </div>
                          <p className="text-sm text-gray-600">配送期間: 7-14営業日</p>
                          <p className="text-sm text-gray-600">追跡番号付き</p>
                        </div>
                        <div className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">エクスプレス配送</span>
                            <span className="font-bold">¥2,500</span>
                          </div>
                          <p className="text-sm text-gray-600">配送期間: 3-5営業日</p>
                          <p className="text-sm text-gray-600">追跡番号付き・保険付き</p>
                        </div>
                      </div>
                      
                      <h3 className="font-bold mb-4 mt-6">配送先</h3>
                      <div className="space-y-2">
                        <p>✓ アメリカ、カナダ</p>
                        <p>✓ ヨーロッパ全域</p>
                        <p>✓ オーストラリア、ニュージーランド</p>
                        <p>✓ アジア太平洋地域</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-bold mb-4">支払い方法</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">PP</div>
                          <span>PayPal</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">V</div>
                          <span>Visa</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-5 bg-orange-600 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                          <span>Mastercard</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">AE</div>
                          <span>American Express</span>
                        </div>
                      </div>
                      
                      <h3 className="font-bold mb-4 mt-6">支払い条件</h3>
                      <div className="space-y-2 text-sm">
                        <p>• 落札後48時間以内にお支払いください</p>
                        <p>• PayPalでの即時決済をお勧めします</p>
                        <p>• 支払い確認後、1-2営業日以内に発送</p>
                        <p>• 税関手続きは購入者負担となります</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'seller' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-bold mb-4">販売者情報</h3>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xl font-bold text-blue-600">WD</span>
                          </div>
                          <div>
                            <h4 className="font-semibold">THE WORLD DOOR</h4>
                            <p className="text-sm text-gray-600">Professional Camera Equipment Dealer</p>
                            <div className="flex items-center mt-2">
                              <div className="flex text-yellow-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <StarIcon key={i} className="h-4 w-4 fill-current" />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600 ml-2">4.9 (1,847件の評価)</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <h5 className="font-medium mb-2">連絡先情報</h5>
                          <p className="text-sm text-gray-600">東京都、日本</p>
                          <p className="text-sm text-gray-600">contact@theworlddoor.com</p>
                          <p className="text-sm text-gray-600">営業時間: 平日 9:00-18:00 (JST)</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-bold mb-4">販売実績</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">総販売数:</span>
                          <span className="font-medium">12,450件</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ポジティブ評価:</span>
                          <span className="font-medium text-green-600">99.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">登録年:</span>
                          <span className="font-medium">2018年</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">専門分野:</span>
                          <span className="font-medium">カメラ・時計</span>
                        </div>
                      </div>
                      
                      <h3 className="font-bold mb-4 mt-6">返品・交換ポリシー</h3>
                      <div className="text-sm space-y-2">
                        <p><strong>返品可能期間:</strong> 商品到着後30日以内</p>
                        <p><strong>返品条件:</strong> 商品説明と著しく異なる場合</p>
                        <p><strong>返品送料:</strong> 販売者都合の場合は販売者負担</p>
                        <p><strong>返金:</strong> PayPal経由で3-5営業日以内</p>
                      </div>
                      
                      <h3 className="font-bold mb-4 mt-6">品質保証</h3>
                      <div className="text-sm space-y-2">
                        <p>• 専門鑑定士による真贋保証</p>
                        <p>• 動作確認済み商品のみ販売</p>
                        <p>• 丁寧な梱包と迅速な発送</p>
                        <p>• アフターサポート完備</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* プレビューフッター */}
            <div className="mt-8 pt-6 border-t flex justify-center space-x-4">
              <NexusButton
                onClick={() => setShowPreview(false)}
                variant="primary"
                className="px-8"
              >
                編集に戻る
              </NexusButton>
              <NexusButton
                onClick={() => {
                  setShowPreview(false);
                  handleSubmit();
                }}
                className="px-8"
                disabled={!itemTitle || isSubmitting}
              >
                このまま出品する
              </NexusButton>
            </div>
          </div>
        </BaseModal>
      )}
    </>
  );
}