import { ProductMetadata } from '@/types/api';

// 商品のメタデータを解析して検品・撮影状況を判定するユーティリティ

export function parseProductMetadata(metadataJson?: string | any): ProductMetadata {
  if (!metadataJson) return {};
  
  // すでにオブジェクトの場合はそのまま返す
  if (typeof metadataJson === 'object') {
    return metadataJson as ProductMetadata;
  }
  
  // 文字列の場合はJSONパースを試行
  if (typeof metadataJson === 'string') {
    try {
      return JSON.parse(metadataJson) as ProductMetadata;
    } catch (error) {
      console.error('Failed to parse product metadata:', error);
      return {};
    }
  }
  
  console.warn('Invalid metadata format:', typeof metadataJson, metadataJson);
  return {};
}

export function isInspectionCompleted(metadata: ProductMetadata): boolean {
  return metadata.inspectionCompleted === true;
}

export function isPhotographyCompleted(metadata: ProductMetadata): boolean {
  return metadata.photographyCompleted === true;
}

export function isPhotographySkipped(metadata: ProductMetadata): boolean {
  return metadata.skipPhotography === true;
}

export function isPhotographyPending(metadata: ProductMetadata): boolean {
  return isInspectionCompleted(metadata) && 
         !isPhotographyCompleted(metadata) && 
         !isPhotographySkipped(metadata);
}

export function getInspectionPhotographyStatus(metadata: ProductMetadata): {
  inspectionStatus: 'pending' | 'completed';
  photographyStatus: 'pending' | 'completed' | 'skipped' | 'not_required';
  canStartPhotography: boolean;
  displayStatus: string;
} {
  const inspectionCompleted = isInspectionCompleted(metadata);
  const photographyCompleted = isPhotographyCompleted(metadata);
  const photographySkipped = isPhotographySkipped(metadata);

  return {
    inspectionStatus: inspectionCompleted ? 'completed' : 'pending',
    photographyStatus: photographyCompleted 
      ? 'completed' 
      : photographySkipped 
        ? 'skipped' 
        : inspectionCompleted 
          ? 'pending' 
          : 'not_required',
    canStartPhotography: inspectionCompleted && !photographyCompleted && !photographySkipped,
    displayStatus: inspectionCompleted
      ? photographyCompleted
        ? '検品・撮影完了'
        : photographySkipped
          ? '検品完了（撮影スキップ）'
          : '撮影待ち'
      : '入庫待ち'
  };
}

// 検品・撮影フローの進行状況を%で取得
export function getInspectionPhotographyProgress(metadata: ProductMetadata): {
  percentage: number;
  description: string;
} {
  const inspectionCompleted = isInspectionCompleted(metadata);
  const photographyCompleted = isPhotographyCompleted(metadata);
  const photographySkipped = isPhotographySkipped(metadata);

  if (!inspectionCompleted) {
    return { percentage: 0, description: '入庫待ち' };
  }

  if (photographySkipped) {
    return { percentage: 100, description: '検品完了（撮影スキップ）' };
  }

  if (photographyCompleted) {
    return { percentage: 100, description: '検品・撮影完了' };
  }

  return { percentage: 50, description: '撮影待ち' };
}

// 商品ステータスのフィルタリング用
export function filterProductsByInspectionPhotographyStatus(
  products: any[],
  filter: 'all' | 'inspection_pending' | 'photography_pending' | 'completed'
): any[] {
  return products.filter(product => {
    const metadata = parseProductMetadata(product.metadata);
    const status = getInspectionPhotographyStatus(metadata);

    switch (filter) {
      case 'inspection_pending':
        return status.inspectionStatus === 'pending';
      case 'photography_pending':
        return status.photographyStatus === 'pending';
      case 'completed':
        return status.inspectionStatus === 'completed' && 
               (status.photographyStatus === 'completed' || status.photographyStatus === 'skipped');
      case 'all':
      default:
        return true;
    }
  });
}

// ステップ名を取得するユーティリティ
export function getStepName(step: number): string {
  switch (step) {
    case 1: return '検品項目';
    case 2: return '写真撮影';
    case 3: return '梱包・ラベル';
    case 4: return '棚保管';
    default: return '不明';
  }
}

// バーコードスキャン時の遷移先自動判断
export interface ScanDestination {
  step: number;
  tab: string;
  message: string;
  reason: string;
  modalType?: 'info' | 'inspection'; // 情報表示専用か検品編集かを判定
}

export function determineBarcodeDestination(product: any): ScanDestination {
  const metadata = parseProductMetadata(product.metadata);
  
  console.log('[DEBUG] バーコードスキャン判定:', {
    productId: product.id,
    status: product.status,
    metadata: metadata,
    inspectionCompleted: metadata.inspectionCompleted,
    currentStep: metadata.currentStep,
    currentLocationId: product.currentLocationId
  });

  // 1. 保管完了済み（検品・棚保管両方完了）→ 情報表示専用モーダル
  if (product.status === 'storage' && 
      product.currentLocationId && 
      metadata.currentStep >= 4) {
    return {
      step: 4,
      tab: 'info',
      message: `${product.name} の商品情報を表示します`,
      reason: '保管完了済み・情報表示専用',
      modalType: 'info'
    };
  }

  // 2. 納品直後（検品未実施）→ 検品項目タブ
  if (product.status === 'pending_inspection' || 
      product.status === 'inbound' ||
      (!metadata.inspectionCompleted && product.status === 'inspecting')) {
    return {
      step: 1,
      tab: 'inspection',
      message: `${product.name} の検品項目画面へ移動します`,
      reason: '納品直後・検品未実施',
      modalType: 'inspection'
    };
  }
  
  // 3. 検品完了済み（棚保管が必要）→ 棚保管タブ  
  if ((product.status === 'inspecting' && metadata.inspectionCompleted) ||
      (product.status === 'storage' && !product.currentLocationId) ||
      metadata.currentStep >= 4) {
    return {
      step: 4,
      tab: 'storage',
      message: `${product.name} の棚保管画面へ移動します`,
      reason: '検品完了済み・棚保管処理',
      modalType: 'inspection'
    };
  }
  
  // 4. 検品中の場合、現在のステップに応じて判定
  if (product.status === 'inspecting' && metadata.currentStep) {
    const step = metadata.currentStep;
    return {
      step: step,
      tab: step >= 4 ? 'storage' : 'inspection',
      message: `${product.name} の${getStepName(step)}画面へ移動します`,
      reason: `検品中・ステップ${step}継続`,
      modalType: 'inspection'
    };
  }
  
  // 5. デフォルト：検品項目タブから開始
  return {
    step: 1,
    tab: 'inspection',  
    message: `${product.name} の検品項目画面へ移動します`,
    reason: 'デフォルト判定・検品開始',
    modalType: 'inspection'
  };
}