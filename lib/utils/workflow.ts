// 出荷ワークフローのステップ定義
export const SHIPPING_WORKFLOW_STEPS = [
  {
    id: 'storage',
    label: '保管中',
    icon: 'inspection',  // 既存のアイコンを流用
    order: 1
  },
  {
    id: 'workstation',
    label: '梱包作業中',
    icon: 'shipping',
    order: 2
  },
  {
    id: 'packed',
    label: '梱包完了',
    icon: 'shipping',
    order: 3
  },
  {
    id: 'ready_for_pickup',
    label: '集荷準備完了',
    icon: 'shipping',
    order: 4
  }
];

export type ShippingStatus = 'storage' | 'picked' | 'workstation' | 'packed' | 'ready_for_pickup';

/**
 * 商品のステータスに基づいてワークフローのプログレス情報を生成
 */
export function getWorkflowProgress(currentStatus: ShippingStatus) {
  // picked ステータスは workstation ステップにマッピング
  const mappedStatus = currentStatus === 'picked' ? 'workstation' : currentStatus;
  const currentStep = SHIPPING_WORKFLOW_STEPS.find(step => step.id === mappedStatus);
  const currentOrder = currentStep?.order || 1;

  return SHIPPING_WORKFLOW_STEPS.map(step => ({
    id: step.id,
    label: step.label,
    icon: step.icon,
    status: step.order < currentOrder 
      ? 'completed' as const
      : step.order === currentOrder 
      ? 'active' as const
      : 'pending' as const
  }));
}

/**
 * ステータスラベルのマッピング
 */
export const STATUS_LABELS: Record<ShippingStatus, string> = {
  'storage': '保管中',
  'picked': '梱包作業中',
  'workstation': '梱包作業中',
  'packed': '梱包済み',
  'ready_for_pickup': '集荷準備完了'
};

/**
 * 次のアクションを取得
 */
export function getNextAction(currentStatus: ShippingStatus): string {
  switch (currentStatus) {
    case 'storage':
      return '商品をピッキングして梱包してください';
    case 'picked':
    case 'workstation':
      return '梱包作業を完了してください';
    case 'packed':
      return '出荷処理を行ってください';
    case 'ready_for_pickup':
      return '配送業者による集荷待ち';
    default:
      return '次の作業を確認してください';
  }
}

// 検品ワークフローのステップ定義
export const INSPECTION_WORKFLOW_STEPS = [
  {
    id: 'pending_inspection',
    label: '入庫待ち',
    icon: 'inspection',
    order: 1
  },
  {
    id: 'inspecting',
    label: '検品中',
    icon: 'inspection',
    order: 2
  },
  {
    id: 'photography',
    label: '撮影',
    icon: 'camera',
    order: 3
  },
  {
    id: 'completed',
    label: '完了',
    icon: 'completed',
    order: 4
  }
];

export type InspectionStatus = 'pending_inspection' | 'inspecting' | 'photography' | 'completed' | 'failed';

/**
 * 商品のステータスに基づいて検品ワークフローのプログレス情報を生成
 */
export function getInspectionWorkflowProgress(currentStatus: InspectionStatus, progressData?: { currentStep: number }) {
  // progressDataがある場合はステップベースで判定
  if (progressData && progressData.currentStep > 0) {
    return INSPECTION_WORKFLOW_STEPS.map(step => ({
      id: step.id,
      label: step.label,
      icon: step.icon,
      status: step.order < progressData.currentStep + 1
        ? 'completed' as const
        : step.order === progressData.currentStep + 1
        ? 'active' as const
        : 'pending' as const
    }));
  }

  // ステータスベースでの判定（フォールバック）
  const currentStep = INSPECTION_WORKFLOW_STEPS.find(step => step.id === currentStatus);
  const currentOrder = currentStep?.order || 1;

  // completedステータスの場合は全てのステップを完了として表示
  if (currentStatus === 'completed') {
    return INSPECTION_WORKFLOW_STEPS.map(step => ({
      id: step.id,
      label: step.label,
      icon: step.icon,
      status: 'completed' as const
    }));
  }

  return INSPECTION_WORKFLOW_STEPS.map(step => ({
    id: step.id,
    label: step.label,
    icon: step.icon,
    status: step.order < currentOrder
      ? 'completed' as const
      : step.order === currentOrder
      ? 'active' as const
      : 'pending' as const
  }));
}

/**
 * 検品ステータスラベルのマッピング
 */
export const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
  'pending_inspection': '入庫待ち',
  'inspecting': '検品中',
  'photography': '撮影中',
  'completed': '完了',
  'failed': '不合格'
};

/**
 * 検品の次のアクションを取得
 */
export function getInspectionNextAction(currentStatus: InspectionStatus, progressData?: { currentStep: number }): string {
  if (progressData && progressData.currentStep > 0) {
    switch (progressData.currentStep) {
      case 1:
        return '検品チェックリストを完了してください';
      case 2:
        return '商品写真の撮影を行ってください';
      case 3:
        return '梱包・ラベル作業を完了してください';
      case 4:
        return '棚への保管作業を行ってください';
      default:
        return '次の作業を確認してください';
    }
  }

  switch (currentStatus) {
    case 'pending_inspection':
      return '検品を開始してください';
    case 'inspecting':
      return '検品作業を続行してください';
    case 'photography':
      return '撮影作業を完了してください';
    case 'completed':
      return '検品完了。出品準備を行えます';
    case 'failed':
      return '品質基準を満たしていません。再検品または返却処理が必要です';
    default:
      return '次の作業を確認してください';
  }
}