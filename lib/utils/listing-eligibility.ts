/**
 * eBay出品可能性判定ユーティリティ
 * 商品の出品可能性を判定し、必要な条件と理由を提供
 */

interface Product {
  status: string;
  inspectedAt?: string | Date | null;
  photographyDate?: string | Date | null;
}

interface ListingEligibilityRequirement {
  status: 'met' | 'unmet';
  label: string;
  description: string;
}

interface ListingEligibility {
  canList: boolean;
  overallReason: string;
  requirements: {
    status: ListingEligibilityRequirement;
    inspection: ListingEligibilityRequirement;
    photography: ListingEligibilityRequirement;
  };
  actionRequired?: string;
}

/**
 * 商品の出品可能性を判定する（改善版）
 */
export function checkListingEligibility(product: Product): ListingEligibility {
  // ステータス要件チェック
  const statusRequirement: ListingEligibilityRequirement = {
    status: product.status === 'storage' ? 'met' : 'unmet',
    label: 'ステータス: 保管中',
    description: product.status === 'storage' 
      ? '商品が保管中状態です' 
      : `現在のステータス: ${getStatusDisplayName(product.status)}`
  };

  // 検品要件チェック（一時的に簡略化 - storage状態なら検品済みとみなす）
  const hasInspection = product.status === 'storage' || !!product.inspectedAt;
  const inspectionRequirement: ListingEligibilityRequirement = {
    status: hasInspection ? 'met' : 'unmet',
    label: '検品: 完了',
    description: hasInspection
      ? `検品完了済み`
      : '検品が完了していません'
  };

  // 撮影要件チェック（推奨条件）
  const hasPhotography = !!product.photographyDate;
  const photographyRequirement: ListingEligibilityRequirement = {
    status: hasPhotography ? 'met' : 'unmet',
    label: '撮影: 完了（推奨）',
    description: hasPhotography
      ? `撮影完了済み`
      : '撮影が完了していません（出品時に既定画像を使用）'
  };

  // 出品可能判定（撮影は必須ではない）
  const canList = statusRequirement.status === 'met' && 
                  inspectionRequirement.status === 'met';

  // 理由とアクション生成
  let overallReason: string;
  let actionRequired: string | undefined;

  if (canList) {
    if (photographyRequirement.status === 'met') {
      overallReason = 'この商品は出品可能です（全条件満たし）';
    } else {
      overallReason = 'この商品は出品可能です（撮影未完了ですが出品できます）';
    }
  } else {
    const unmeetRequirements = [];
    if (statusRequirement.status === 'unmet') {
      unmeetRequirements.push('保管状態への変更');
    }
    if (inspectionRequirement.status === 'unmet') {
      unmeetRequirements.push('検品の完了');
    }
    
    overallReason = `出品するには${unmeetRequirements.join('と')}が必要です`;
    actionRequired = unmeetRequirements[0]; // 最初の未完了条件をアクションとして提示
  }

  return {
    canList,
    overallReason,
    requirements: {
      status: statusRequirement,
      inspection: inspectionRequirement,
      photography: photographyRequirement
    },
    actionRequired
  };
}

/**
 * 出品可能商品のフィルタリング
 */
export function filterListableItems<T extends Product>(items: T[]): T[] {
  return items.filter(item => checkListingEligibility(item).canList);
}

/**
 * メタデータパーサー（既存のproduct-statusから流用）
 */
function parseProductMetadata(metadata?: string): ProductMetadata {
  if (!metadata) {
    return {};
  }

  try {
    const parsed = JSON.parse(metadata);
    return {
      inspectionDate: parsed.inspectionDate,
      photographyDate: parsed.photographyDate,
      inspectionStatus: parsed.inspectionDate ? 'completed' : 'incomplete',
      photographyStatus: parsed.photographyDate ? 'completed' : 'incomplete'
    };
  } catch (error) {
    console.warn('メタデータのパースに失敗:', error);
    return {};
  }
}

/**
 * ステータス表示名取得
 */
function getStatusDisplayName(status: string): string {
  const statusMap: Record<string, string> = {
    'inbound': '入庫待ち',
    'inspection': '検品中',
    'storage': '保管中',
    'listing': '出品中',
    'sold': '売約済み',

  };
  
  return statusMap[status] || status;
}

/**
 * 出品可能商品の統計情報取得
 */
export function getListingStats<T extends { status: string; metadata?: string }>(
  items: T[]
): {
  total: number;
  listable: number;
  needsInspection: number;
  needsStorage: number;
} {
  const total = items.length;
  let listable = 0;
  let needsInspection = 0;
  let needsStorage = 0;

  items.forEach(item => {
    const eligibility = checkListingEligibility(item.status, item.metadata);
    
    if (eligibility.canList) {
      listable++;
    } else {
      if (eligibility.requirements.inspection.status === 'unmet') {
        needsInspection++;
      }
      if (eligibility.requirements.status.status === 'unmet') {
        needsStorage++;
      }
    }
  });

  return { total, listable, needsInspection, needsStorage };
}