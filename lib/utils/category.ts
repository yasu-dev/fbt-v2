/**
 * カテゴリー関連のユーティリティ関数
 * 納品プラン作成との統一を図る
 */

// 標準カテゴリーオプション
export const CATEGORY_OPTIONS = [
  { value: 'camera', label: 'カメラ' },
  { value: 'watch', label: '腕時計' }
];

// カテゴリー選択用オプション（すべて含む）
export const CATEGORY_OPTIONS_WITH_ALL = [
  { value: 'all', label: 'すべてのカテゴリー' },
  ...CATEGORY_OPTIONS
];

// カテゴリー表示用ラベル
export const CATEGORY_LABELS: Record<string, string> = {
  camera: 'カメラ',
  watch: '腕時計'
};

/**
 * カテゴリー英語値を日本語ラベルに変換
 */
export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category;
}

/**
 * カテゴリー表示ロジック（納品プラン作成統一版）
 */
export function formatCategory(category: string): string {
  return category === 'camera' ? 'カメラ' :
         category === 'watch' ? '腕時計' : category;
}