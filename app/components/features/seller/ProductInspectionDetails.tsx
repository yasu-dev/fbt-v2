'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { CheckCircleIcon, XCircleIcon, MinusCircleIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { useIsHierarchicalChecklistEnabled } from '@/lib/hooks/useHierarchicalChecklistFeature';

interface ProductInspectionDetailsProps {
  productId: string;
  status: string;
}

interface InspectionItem {
  key: string;
  label: string;
  value: boolean | string | null;
  category: string;
}

interface InspectionData {
  items: InspectionItem[];
  notes: string;
  inspectedBy?: string;
  inspectedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  isHierarchical?: boolean;
}

// 既存システムの検品項目定義
const STANDARD_INSPECTION_ITEMS = [
  { key: 'scratches', label: '傷', category: '外観' },
  { key: 'dents', label: '凹み', category: '外観' },
  { key: 'discoloration', label: 'スレ', category: '外観' },
  { key: 'dust', label: '汚れ', category: '外観' },
  { key: 'powerOn', label: '作動', category: '機能' },
  { key: 'allButtonsWork', label: '不動', category: '機能' },
  { key: 'screenDisplay', label: 'クモリ', category: '機能' },
  { key: 'connectivity', label: 'カビ', category: '機能' },
  { key: 'lensClarity', label: 'チリホコリ', category: '光学系' },
  { key: 'aperture', label: 'キズ', category: '光学系' },
  { key: 'focusAccuracy', label: 'バッテリー', category: '付属品' },
  { key: 'stabilization', label: 'ケース', category: '付属品' },
];

// 階層型検品項目定義（主要項目のみ）
const HIERARCHICAL_INSPECTION_CATEGORIES = [
  {
    id: 'camera_body_exterior',
    name: 'カメラボディ外観',
    items: [
      { id: 'body_scratches', name: '傷' },
      { id: 'body_scuffs', name: 'スレ' },
      { id: 'body_dents', name: '凹み' },
      { id: 'body_cracks', name: 'ひび' },
      { id: 'body_breaks', name: '割れ' },
      { id: 'body_paint_peeling', name: '塗装剥がれ' },
      { id: 'body_dirt', name: '汚れ' },
      { id: 'body_stickiness', name: 'ベタつき' },
      { id: 'body_other', name: 'その他' },
    ],
  },
  {
    id: 'viewfinder',
    name: 'ファインダー',
    items: [
      { id: 'vf_mold', name: 'カビ' },
      { id: 'vf_dust', name: 'ホコリ' },
      { id: 'vf_scratches', name: '傷' },
      { id: 'vf_dirt', name: '汚れ' },
      { id: 'vf_fog', name: 'クモリ' },
      { id: 'vf_corrosion', name: '腐食' },
      { id: 'vf_balsam_separation', name: 'バルサム切れ' },
    ],
  },
  {
    id: 'film_chamber',
    name: 'フィルム室',
    items: [
      { id: 'fc_interior_condition', name: 'フィルム室内部の状況' },
      { id: 'fc_light_seal_deterioration', name: 'モルトの劣化' },
      { id: 'fc_shutter_curtain_operation', name: 'シャッター幕動作' },
    ],
  },
  {
    id: 'lens',
    name: 'レンズ',
    items: [
      { id: 'lens_mold', name: 'カビ' },
      { id: 'lens_dust', name: 'ホコリ' },
      { id: 'lens_scratches', name: '傷' },
      { id: 'lens_dirt', name: '汚れ' },
      { id: 'lens_fog', name: 'クモリ' },
      { id: 'lens_scuffs', name: 'スレ' },
    ],
  },
  {
    id: 'optical',
    name: '光学系',
    items: [
      { id: 'opt_dust_particles', name: 'チリホコリ' },
      { id: 'opt_fog', name: 'クモリ' },
      { id: 'opt_scratches', name: '傷' },
      { id: 'opt_dirt', name: '汚れ' },
    ],
  },
  {
    id: 'exposure_function',
    name: '露出機能',
    items: [
      { id: 'exp_working', name: '作動' },
      { id: 'exp_not_working', name: '不動' },
      { id: 'exp_weak', name: '弱い' },
    ],
  },
  {
    id: 'accessories',
    name: '付属品',
    items: [
      { id: 'acc_battery', name: 'バッテリー' },
      { id: 'acc_manual', name: '説明書' },
      { id: 'acc_case', name: 'ケース' },
      { id: 'acc_box', name: '箱' },
      { id: 'acc_strap', name: 'ストラップ' },
      { id: 'acc_lens_cap', name: 'レンズキャップ' },
    ],
  },
  // トップレベル「その他」カテゴリは廃止（各セクション内のその他テキストは存続）
];

export default function ProductInspectionDetails({ productId, status }: ProductInspectionDetailsProps) {
  const [inspectionData, setInspectionData] = useState<InspectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHierarchicalEnabled, setIsHierarchicalEnabled] = useState(false);

  useEffect(() => {
    // フィーチャーフラグを直接APIから取得
    const checkFeatureFlag = async () => {
      try {
        console.log('[DEBUG] ProductInspectionDetails - フィーチャーフラグAPI呼び出し開始');
        const response = await fetch('/api/feature-flags/hierarchical-checklist');
        console.log('[DEBUG] ProductInspectionDetails - フィーチャーフラグAPIレスポンス:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[DEBUG] ProductInspectionDetails - フィーチャーフラグデータ:', data);
          
          // APIレスポンスの構造に応じて enabled を取得
          const enabled = data?.enabled === true || data?.data?.enabled === true;
          setIsHierarchicalEnabled(enabled);
          console.log('[DEBUG] ProductInspectionDetails - フィーチャーフラグ設定:', enabled);
          console.log('[DEBUG] ProductInspectionDetails - data.enabled:', data?.enabled);
          console.log('[DEBUG] ProductInspectionDetails - data.data.enabled:', data?.data?.enabled);
        } else {
          console.warn('[DEBUG] ProductInspectionDetails - フィーチャーフラグAPI失敗:', response.status);
          setIsHierarchicalEnabled(false);
        }
      } catch (error) {
        console.error('[DEBUG] ProductInspectionDetails - フィーチャーフラグ取得失敗:', error);
        setIsHierarchicalEnabled(false);
      }
    };

    const initializeComponent = async () => {
      try {
        console.log('[DEBUG] initializeComponent - 開始');
        
        // フィーチャーフラグを取得
        const response = await fetch('/api/feature-flags/hierarchical-checklist');
        let enabledFlag = false;
        
        if (response.ok) {
          const data = await response.json();
          enabledFlag = data?.enabled === true || data?.data?.enabled === true;
          setIsHierarchicalEnabled(enabledFlag);
          console.log('[DEBUG] initializeComponent - フィーチャーフラグ確定:', enabledFlag);
        }
        
        // フィーチャーフラグの値を使って検品データを取得
        await fetchInspectionDataWithFlag(enabledFlag);
        
      } catch (error) {
        console.error('[DEBUG] initializeComponent - エラー:', error);
        setIsHierarchicalEnabled(false);
        await fetchInspectionDataWithFlag(false);
      }
    };

    initializeComponent();
  }, [productId]);

  const fetchInspectionDataWithFlag = async (hierarchicalEnabled: boolean) => {
    try {
      setLoading(true);
      
      console.log('[DEBUG] fetchInspectionDataWithFlag - データ取得開始:', { productId, hierarchicalEnabled });
    
      // デバッグ: コンポーネントの状態をwindowオブジェクトに設定
      (window as any).debugInspectionData = {
        productId,
        isHierarchicalEnabled: hierarchicalEnabled,
        step: 'fetching'
      };
      
      // 既存の検品チェックリストを取得
      const checklistResponse = await fetch(`/api/products/${productId}/inspection-checklist`);
      
      if (checklistResponse.ok) {
        const checklistData = await checklistResponse.json();
        
        console.log('[DEBUG] ProductInspectionDetails - APIレスポンス:', checklistData);
        console.log('[DEBUG] ProductInspectionDetails - 階層型データ存在確認:', !!checklistData?.hierarchicalInspectionChecklist);
        console.log('[DEBUG] ProductInspectionDetails - 階層型responses:', checklistData?.hierarchicalInspectionChecklist?.responses);
        
        // デバッグ情報をウィンドウに設定
        (window as any).debugInspectionData = {
          ...((window as any).debugInspectionData || {}),
          checklistData,
          isHierarchicalEnabled,
          hasHierarchicalData: !!checklistData?.hierarchicalInspectionChecklist?.responses,
          hasStandardData: !!checklistData?.inspectionChecklist,
          step: 'processing'
        };

        if (hierarchicalEnabled && checklistData?.hierarchicalInspectionChecklist?.responses) {
          // 階層型検品データを処理
          console.log('[DEBUG] fetchInspectionDataWithFlag - 階層型データ処理開始');
          processHierarchicalData(checklistData);
        } else if (!hierarchicalEnabled && checklistData?.inspectionChecklist) {
          // 既存システムデータを処理
          console.log('[DEBUG] fetchInspectionDataWithFlag - 既存システムデータ処理開始');
          processStandardData(checklistData.inspectionChecklist);
        } else {
          // 検品データが存在しない場合、空の項目リストを作成
          console.log('[DEBUG] fetchInspectionDataWithFlag - 検品データなし、空データ作成');
          console.log('[DEBUG] 判定条件:', {
            hierarchicalEnabled,
            hasHierarchicalResponses: !!checklistData?.hierarchicalInspectionChecklist?.responses,
            hasInspectionChecklist: !!checklistData?.inspectionChecklist
          });
          createEmptyInspectionData();
        }
      } else {
        // 検品データが存在しない場合、空の項目リストを作成
        console.log('[DEBUG] fetchInspectionDataWithFlag - API失敗、空データ作成');
        createEmptyInspectionData();
      }
    } catch (error) {
      console.error('検品データ取得エラー:', error);
      setError('検品データの取得に失敗しました');
      createEmptyInspectionData();
    } finally {
      setLoading(false);
    }
  };

  const fetchInspectionData = async () => {
    // 後方互換性のため
    await fetchInspectionDataWithFlag(isHierarchicalEnabled);
  };

  const processHierarchicalData = (data: any) => {
    console.log('[DEBUG] processHierarchicalData - 開始:', data);
    const items: InspectionItem[] = [];
    
    if (data?.hierarchicalInspectionChecklist?.responses) {
      // 階層型データを展開 - responsesが配列形式の場合
      if (Array.isArray(data.hierarchicalInspectionChecklist.responses)) {
        console.log('[DEBUG] processHierarchicalData - 配列形式のデータ処理:', data.hierarchicalInspectionChecklist.responses.length);
        
        data.hierarchicalInspectionChecklist.responses.forEach((response: any) => {
          console.log('[DEBUG] processHierarchicalData - レスポンス処理:', response);
          
          // 完全な翻訳辞書を使用
          const categoryTranslations: Record<string, string> = {
            'camera_body_exterior': 'カメラボディ外観',
            'viewfinder': 'ファインダー',
            'film_chamber': 'フィルム室',
            'lens': 'レンズ',
            'optical': '光学',
            'exposure_function': '露出機能',
            'accessories': '付属品',
            'other': 'その他'
          };
          
          const itemTranslations: Record<string, string> = {
            'body_scratches': '傷',
            'body_scuffs': 'スレ',
            'body_abrasion': 'スレ',
            'body_dents': '凹み',
            'body_cracks': 'ひび',
            'body_breaks': '割れ',
            'body_paint_peeling': '塗装剥がれ',
            'body_dirt': '汚れ',
            'body_stickiness': 'ベタつき',
            'body_other': 'その他',
            'vf_mold': 'カビ',
            'vf_dust': 'ホコリ',
            'vf_scratches': '傷',
            'vf_dirt': '汚れ',
            'vf_fog': 'クモリ',
            'vf_cloudiness': 'クモリ',
            'vf_corrosion': '腐食',
            'vf_balsam_separation': 'バルサム切れ',
            'fc_interior_condition': 'フィルム室内部の状況',
            'fc_light_seal_deterioration': 'モルトの劣化',
            'fc_shutter_curtain_operation': 'シャッター幕動作',
            'lens_scratches': '傷',
            'lens_scuffs': 'スレ',
            'lens_abrasion': 'スレ',
            'lens_dents': '凹み',
            'lens_cracks': 'ひび',
            'lens_breaks': '割れ',
            'lens_paint_peeling': '塗装剥がれ',
            'lens_dirt': '汚れ',
            'lens_stickiness': 'ベタつき',
            'lens_other': 'その他',
            'opt_dust_debris': 'チリホコリ',
            'opt_dust_particles': 'チリホコリ',
            'opt_cloudiness': 'クモリ',
            'opt_fog': 'クモリ',
            'opt_mold': 'カビ',
            'opt_balsam_separation': 'バルサム切れ',
            'opt_scratches': 'キズ',
            'opt_dirt': '汚れ',
            'opt_other': 'その他',
            'exp_working': '作動',
            'exp_not_working': '不動',
            'exp_weak': '弱い',
            'acc_battery': 'バッテリー',
            'acc_manual': '説明書',
            'acc_case': 'ケース',
            'acc_box': '箱',
            'acc_strap': 'ストラップ',
            'acc_lens_cap': 'レンズキャップ',
            'other_general': 'その他',
            'other_item': 'その他'
          };
          
          const categoryName = categoryTranslations[response.categoryId] || response.categoryId;
          const itemName = itemTranslations[response.itemId] || response.itemId;
          
          // データの正確なマッピング
          let processedValue = null;
          if (response.booleanValue !== null && response.booleanValue !== undefined) {
            processedValue = response.booleanValue;
          } else if (response.textValue !== null && response.textValue !== undefined && response.textValue.trim() !== '') {
            processedValue = response.textValue;
          }
          
          const processedItem = {
            key: `${response.categoryId}_${response.itemId}`,
            label: itemName,
            value: processedValue,
            category: categoryName,
          };
          
          console.log('[DEBUG] processHierarchicalData - マッピング結果:', {
            original: { booleanValue: response.booleanValue, textValue: response.textValue },
            processed: processedValue,
            item: processedItem
          });
          
          console.log('[DEBUG] processHierarchicalData - 処理済み項目:', processedItem);
          items.push(processedItem);
        });
      } else {
        // オブジェクト形式の場合（既存の処理）
        console.log('[DEBUG] processHierarchicalData - オブジェクト形式のデータ処理');
        HIERARCHICAL_INSPECTION_CATEGORIES.forEach(category => {
          category.items.forEach(item => {
            const responseData = data.hierarchicalInspectionChecklist.responses[category.id]?.[item.id];
            items.push({
              key: `${category.id}_${item.id}`,
              label: item.name,
              value: responseData ? (responseData.booleanValue ?? responseData.textValue ?? null) : null,
              category: category.name,
            });
          });
        });
      }
    } else {
      console.log('[DEBUG] processHierarchicalData - responsesが存在しません');
      // データがない場合は空の項目を作成
      HIERARCHICAL_INSPECTION_CATEGORIES.forEach(category => {
        category.items.forEach(item => {
          items.push({
            key: `${category.id}_${item.id}`,
            label: item.name,
            value: null,
            category: category.name,
          });
        });
      });
    }

    console.log('[DEBUG] processHierarchicalData - 最終的なitems数:', items.length);
    console.log('[DEBUG] processHierarchicalData - 最終的なitems:', items);

    const finalData = {
      items,
      notes: data?.hierarchicalInspectionChecklist?.notes || '',
      inspectedBy: data?.hierarchicalInspectionChecklist?.createdBy || data?.createdBy,
      inspectedAt: data?.hierarchicalInspectionChecklist?.createdAt || data?.createdAt,
      verifiedBy: data?.hierarchicalInspectionChecklist?.verifiedBy,
      verifiedAt: data?.hierarchicalInspectionChecklist?.verifiedAt,
      isHierarchical: true,
    };
    
    console.log('[DEBUG] processHierarchicalData - 最終データ設定:', finalData);
    (window as any).debugInspectionData = {
      ...((window as any).debugInspectionData || {}),
      processedData: finalData,
      step: 'processed'
    };
    
    setInspectionData(finalData);
  };

  const processStandardData = (data: any) => {
    console.log('[DEBUG] processStandardData - 開始:', data);
    const items: InspectionItem[] = [];
    
    // 既存システムデータを処理
    STANDARD_INSPECTION_ITEMS.forEach(item => {
      let value = null;
      
      if (data) {
        // データマッピング（プロパティ名を調整）
        switch (item.key) {
          case 'scratches':
            value = data.hasScratches;
            break;
          case 'dents':
            value = data.hasDents;
            break;
          case 'discoloration':
            value = data.hasDiscoloration;
            break;
          case 'dust':
            value = data.hasDust;
            break;
          case 'powerOn':
            value = data.powerOn;
            break;
          case 'allButtonsWork':
            value = data.allButtonsWork;
            break;
          case 'screenDisplay':
            value = data.screenDisplay;
            break;
          case 'connectivity':
            value = data.connectivity;
            break;
          case 'lensClarity':
            value = data.lensClarity;
            break;
          case 'aperture':
            value = data.aperture;
            break;
          case 'focusAccuracy':
            value = data.focusAccuracy;
            break;
          case 'stabilization':
            value = data.stabilization;
            break;
          default:
            value = null;
        }
      }
      
      console.log('[DEBUG] processStandardData - 項目処理:', { key: item.key, label: item.label, value });
      
      items.push({
        key: item.key,
        label: item.label,
        value: value,
        category: item.category,
      });
    });

    console.log('[DEBUG] processStandardData - 最終的なitems数:', items.length);
    console.log('[DEBUG] processStandardData - フィルタリング前のアイテム:', items);
    
    const finalData = {
      items,
      notes: data?.notes || '',
      inspectedBy: data?.createdBy,
      inspectedAt: data?.createdAt,
      verifiedBy: data?.verifiedBy,
      verifiedAt: data?.verifiedAt,
      isHierarchical: false,
    };
    
    console.log('[DEBUG] processStandardData - 最終データ:', finalData);
    setInspectionData(finalData);
  };

  const createEmptyInspectionData = () => {
    const items: InspectionItem[] = [];
    
    if (isHierarchicalEnabled) {
      // 階層型の空データ
      HIERARCHICAL_INSPECTION_CATEGORIES.forEach(category => {
        category.items.forEach(item => {
          items.push({
            key: `${category.id}_${item.id}`,
            label: item.name,
            value: null,
            category: category.name,
          });
        });
      });
    } else {
      // 既存システムの空データ
      STANDARD_INSPECTION_ITEMS.forEach(item => {
        items.push({
          key: item.key,
          label: item.label,
          value: null,
          category: item.category,
        });
      });
    }

    setInspectionData({
      items,
      notes: '',
      isHierarchical: isHierarchicalEnabled,
    });
  };

  const renderInspectionValue = (value: boolean | string | null) => {
    if (value === null || value === undefined) {
      return <MinusCircleIcon className="w-4 h-4 text-gray-400" />;
    }
    
    if (typeof value === 'boolean') {
      return value ? (
        <CheckCircleIcon className="w-4 h-4 text-green-500" />
      ) : (
        <XCircleIcon className="w-4 h-4 text-red-500" />
      );
    }
    
    if (typeof value === 'string') {
      return value.trim() ? (
        <span className="text-sm text-gray-700 max-w-xs truncate">{value}</span>
      ) : (
        <MinusCircleIcon className="w-4 h-4 text-gray-400" />
      );
    }
    
    return <MinusCircleIcon className="w-4 h-4 text-gray-400" />;
  };

  // チェックされた項目のみをフィルタリング
  const filterCheckedItems = (items: InspectionItem[]) => {
    return items.filter(item => {
      console.log('[DEBUG] filterCheckedItems - 項目チェック:', { label: item.label, value: item.value, type: typeof item.value });
      
      if (typeof item.value === 'boolean') {
        return item.value === true; // trueのみ表示
      }
      if (typeof item.value === 'string') {
        return item.value && item.value.trim().length > 0; // 空文字以外
      }
      return false; // null/undefinedは表示しない
    });
  };

  const getStatusBasedMessage = () => {
    if (status === 'inbound' || status === 'pending_inspection') {
      return '検品前のため、まだ項目は登録されていません';
    }
    if (status === 'inspecting') {
      return '検品中のため、一部項目が未登録の可能性があります';
    }
    if (status === 'completed' || status === 'storage') {
      return '検品完了済み';
    }
    return '検品状況を確認中';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>検品項目</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>検品項目</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const categorizedItems = inspectionData?.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, InspectionItem[]>) || {};

  // チェックされた項目のみをフィルタリングした categorizedItems
  const filteredCategorizedItems = Object.entries(categorizedItems).reduce((acc, [category, items]) => {
    console.log('[DEBUG] カテゴリ処理:', { category, itemCount: items.length });
    const checkedItems = filterCheckedItems(items);
    console.log('[DEBUG] フィルタ結果:', { category, checkedCount: checkedItems.length });
    if (checkedItems.length > 0) {
      acc[category] = checkedItems;
    }
    return acc;
  }, {} as Record<string, InspectionItem[]>);
  
  console.log('[DEBUG] 最終フィルタ結果:', filteredCategorizedItems);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>検品項目</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {getStatusBasedMessage()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.keys(filteredCategorizedItems).length === 0 ? (
          <div className="text-center py-12">
            <ClipboardDocumentCheckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">チェックされた検品項目がありません</p>
            <p className="text-xs text-gray-400 mt-2">{getStatusBasedMessage()}</p>
          </div>
        ) : (
          /* 納品管理と完全同一スタイル：HierarchicalChecklistDisplay */
          <div className="space-y-4">
            {Object.entries(filteredCategorizedItems).map(([category, items]) => (
              <div key={category} className="border rounded-lg p-3 bg-gray-50">
                <h6 className="text-sm font-semibold text-gray-900 mb-2">
                  {category}
                </h6>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {items.map((item) => {
                    const isTextValue = typeof item.value === 'string' && item.value.trim().length > 0;
                    const isBooleanValue = typeof item.value === 'boolean' && item.value === true;
                    
                    return (
                      <div key={item.key} className="text-sm text-gray-800 p-2 bg-white rounded border border-gray-200">
                        {isTextValue ? (
                          /* テキスト値の表示（青色アイコン） */
                          <div>
                            <div className="flex items-center mb-1">
                              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mr-2 flex-shrink-0">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <span className="font-medium text-gray-800">{item.label}</span>
                            </div>
                            <div className="ml-6 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                              {item.value as string}
                            </div>
                          </div>
                        ) : isBooleanValue ? (
                          /* チェック項目の表示（問題ありなので赤色アイコン） */
                          <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center mr-2 flex-shrink-0">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="font-medium text-gray-800">{item.label}</span>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {inspectionData?.notes && (
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">メモ</h4>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div
                className="text-sm text-gray-700"
                dangerouslySetInnerHTML={{ __html: inspectionData.notes }}
              />
            </div>
          </div>
        )}

        {inspectionData?.inspectedBy && (
          <div className="text-xs text-gray-500 border-t pt-3">
            検品者: {inspectionData.inspectedBy}
            {inspectionData.inspectedAt && (
              <span> | {new Date(inspectionData.inspectedAt).toLocaleDateString('ja-JP')}</span>
            )}
            {inspectionData.verifiedBy && (
              <span> | 確認者: {inspectionData.verifiedBy}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
