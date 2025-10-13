'use client';

import React from 'react';

/**
 * 階層型検品チェックリストの確認・出力画面での表示コンポーネント
 * 8大項目37+小項目の階層構造で結果を表示
 */

interface HierarchicalChecklistDisplayProps {
  data: {
    responses: Record<string, Record<string, { booleanValue?: boolean; textValue?: string }>>;
    notes: string;
  };
}

// カテゴリ表示順序（指定された順番で表示）
const CATEGORY_ORDER = [
  'camera_body_exterior',
  'viewfinder', 
  'film_chamber',
  'lens',
  'optical',
  'exposure_function',
  'accessories'
];

// カテゴリ定義（日本語表示用）
const CATEGORIES = {
  camera_body_exterior: 'カメラボディ外観',
  viewfinder: 'ファインダー',
  film_chamber: 'フィルム室',
  lens: 'レンズ',
  optical: '光学',
  exposure_function: '露出機能',
  accessories: '付属品'
};

// アイテム定義（日本語表示用）
const ITEMS = {
  // カメラボディ外観
  body_scratches: '傷',
  body_scuffs: 'スレ',
  body_abrasion: 'スレ',
  body_dents: '凹み',
  body_cracks: 'ひび',
  body_breaks: '割れ',
  body_paint_peeling: '塗装剥がれ',
  body_dirt: '汚れ',
  body_stickiness: 'ベタつき',
  body_other: 'その他',
  
  // ファインダー
  vf_mold: 'カビ',
  vf_dust: 'ホコリ',
  vf_scratches: '傷',
  vf_dirt: '汚れ',
  vf_fog: 'クモリ',
  vf_cloudiness: 'クモリ',
  vf_corrosion: '腐食',
  vf_balsam_separation: 'バルサム切れ',
  
  // フィルム室
  fc_interior_condition: 'フィルム室内部の状況',
  fc_light_seal_deterioration: 'モルトの劣化',
  fc_shutter_curtain_operation: 'シャッター幕動作',
  
  // レンズ
  lens_scratches: '傷',
  lens_scuffs: 'スレ',
  lens_abrasion: 'スレ',
  lens_dents: '凹み',
  lens_cracks: 'ひび',
  lens_breaks: '割れ',
  lens_paint_peeling: '塗装剥がれ',
  lens_dirt: '汚れ',
  lens_stickiness: 'ベタつき',
  lens_other: 'その他',
  
  // 光学
  opt_dust_debris: 'チリホコリ',
  opt_dust_particles: 'チリホコリ',
  opt_cloudiness: 'クモリ',
  opt_fog: 'クモリ',
  opt_mold: 'カビ',
  opt_balsam_separation: 'バルサム切れ',
  opt_scratches: 'キズ',
  opt_dirt: '汚れ',
  opt_other: 'その他',
  
  // 露出機能
  exp_working: '作動',
  exp_not_working: '不動',
  exp_weak: '弱い',
  
  // 付属品
  acc_battery: 'バッテリー',
  acc_manual: '説明書',
  acc_case: 'ケース',
  acc_box: '箱',
  acc_strap: 'ストラップ',
  acc_lens_cap: 'レンズキャップ',
  
  // その他
  other_item: 'その他',
  other_general: 'その他'
};

export default function HierarchicalChecklistDisplay({ data }: HierarchicalChecklistDisplayProps) {
  if (!data || !data.responses) {
    return (
      <div className="text-gray-500 text-sm">
        階層型検品データがありません
      </div>
    );
  }

  const { responses, notes } = data;

  if (Object.keys(responses).length === 0 && !notes) {
    return (
      <div className="text-gray-500 text-sm">
        検品項目が選択されていません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {CATEGORY_ORDER.map((categoryId) => {
        const categoryData = responses[categoryId];
        
        // カテゴリデータが存在しない場合はスキップ
        if (!categoryData) return null;
        
        // カテゴリ名を日本語に変換（確実な変換処理）
        const categoryName = CATEGORIES[categoryId as keyof typeof CATEGORIES] || categoryId;
        const itemEntries = Object.entries(categoryData);

        if (itemEntries.length === 0) return null;

        return (
          <div key={categoryId} className="border rounded-lg p-3 bg-gray-50">
            <h6 className="text-sm font-semibold text-gray-900 mb-2">
              {categoryName}
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {itemEntries.map(([itemId, itemData]) => {
                // 項目名を日本語に変換（ITEMS定数を使用）
                const itemName = ITEMS[itemId as keyof typeof ITEMS] || itemId;
                const hasValue = itemData.booleanValue || itemData.textValue;
                
                if (!hasValue) return null;

                return (
                  <div
                    key={itemId}
                    className={`text-xs px-2 py-1 rounded ${
                      itemData.booleanValue ? 'text-red-700 bg-red-100' : 'text-blue-700 bg-blue-100'
                    }`}
                  >
                    {itemData.booleanValue ? (
                      <span>✓ {itemName}</span>
                    ) : itemData.textValue ? (
                      <span>📝 {itemName}: {itemData.textValue}</span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* 全体メモ */}
      {notes && (
        <div className="border rounded-lg p-3 bg-yellow-50">
          <h6 className="text-sm font-semibold text-gray-900 mb-1">
            検品メモ（任意）
          </h6>
          <p className="text-sm text-gray-700">
            {notes}
          </p>
        </div>
      )}
    </div>
  );
}
