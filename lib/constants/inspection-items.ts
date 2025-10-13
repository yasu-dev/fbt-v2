/**
 * カテゴリー別検品チェックリスト項目定義
 */

export interface ChecklistItem {
  key: string;
  label: string;
  description?: string;
  hasOtherInput?: boolean; // "その他" 項目の場合にテキスト入力フィールドを表示
}

export interface ChecklistSection {
  sectionKey: string;
  sectionName: string;
  items: ChecklistItem[];
}

export interface CategoryChecklistStructure {
  category: string;
  categoryName: string;
  sections: ChecklistSection[];
}

/**
 * カメラの検品チェックリスト項目
 */
const CAMERA_CHECKLIST: CategoryChecklistStructure = {
  category: 'camera',
  categoryName: 'カメラ',
  sections: [
    {
      sectionKey: 'camera_body_exterior',
      sectionName: 'カメラボディ外観',
      items: [
        { key: 'scratches', label: '傷', description: '目立つ傷がある場合チェック' },
        { key: 'scuffs', label: 'スレ', description: '擦り傷がある場合チェック' },
        { key: 'dents', label: '凹み', description: '凹みがある場合チェック' },
        { key: 'cracks', label: 'ひび', description: 'ひび割れがある場合チェック' },
        { key: 'breaks', label: '割れ', description: '割れがある場合チェック' },
        { key: 'paint_peeling', label: '塗装剥がれ', description: '塗装が剥がれている場合チェック' },
        { key: 'stains', label: '汚れ', description: '汚れがある場合チェック' },
        { key: 'stickiness', label: 'ベタつき', description: 'ベタつきがある場合チェック' },
        { key: 'other_exterior', label: 'その他', hasOtherInput: true }
      ]
    },
    {
      sectionKey: 'viewfinder',
      sectionName: 'ファインダー',
      items: [
        { key: 'mold', label: 'カビ', description: 'カビが見える場合チェック' },
        { key: 'dust', label: 'ホコリ', description: 'ホコリが見える場合チェック' },
        { key: 'scratches_vf', label: '傷', description: 'ファインダー内の傷' },
        { key: 'stains_vf', label: '汚れ', description: 'ファインダー内の汚れ' },
        { key: 'cloudiness', label: 'クモリ', description: 'クモリがある場合チェック' },
        { key: 'corrosion', label: '腐食', description: '腐食がある場合チェック' },
        { key: 'balsam_separation', label: 'バルサム切れ', description: 'バルサム切れがある場合チェック' }
      ]
    },
    {
      sectionKey: 'film_chamber',
      sectionName: 'フィルム室',
      items: [
        { key: 'film_chamber_condition', label: 'フィルム室内部の状況', description: 'フィルム室の状態' },
        { key: 'light_seal_deterioration', label: 'モルトの劣化', description: 'モルト（遮光材）の劣化' },
        { key: 'shutter_curtain_operation', label: 'シャッター幕動作', description: 'シャッター幕の動作確認' }
      ]
    },
    {
      sectionKey: 'lens_exterior',
      sectionName: 'レンズ',
      items: [
        { key: 'lens_scratches', label: '傷', description: 'レンズ表面の傷' },
        { key: 'lens_scuffs', label: 'スレ', description: 'レンズ表面のスレ' },
        { key: 'lens_dents', label: '凹み', description: 'レンズの凹み' },
        { key: 'lens_cracks', label: 'ひび', description: 'レンズのひび割れ' },
        { key: 'lens_breaks', label: '割れ', description: 'レンズの割れ' },
        { key: 'lens_paint_peeling', label: '塗装剥がれ', description: 'レンズ鏡筒の塗装剥がれ' },
        { key: 'lens_stains', label: '汚れ', description: 'レンズの汚れ' },
        { key: 'lens_stickiness', label: 'ベタつき', description: 'レンズのベタつき' },
        { key: 'other_lens', label: 'その他', hasOtherInput: true }
      ]
    },
    {
      sectionKey: 'optics',
      sectionName: '光学',
      items: [
        { key: 'dust_particles', label: 'チリホコリ', description: 'レンズ内のチリ・ホコリ' },
        { key: 'cloudiness_optics', label: 'クモリ', description: 'レンズ内のクモリ' },
        { key: 'mold_optics', label: 'カビ', description: 'レンズ内のカビ' },
        { key: 'balsam_separation_optics', label: 'バルサム切れ', description: 'レンズのバルサム切れ' },
        { key: 'scratches_optics', label: 'キズ', description: 'レンズ表面のキズ' },
        { key: 'stains_optics', label: '汚れ', description: 'レンズ表面の汚れ' },
        { key: 'other_optics', label: 'その他', hasOtherInput: true }
      ]
    },
    {
      sectionKey: 'exposure_function',
      sectionName: '露出機能',
      items: [
        { key: 'working', label: '作動', description: '露出機能が正常に作動する' },
        { key: 'not_working', label: '不動', description: '露出機能が作動しない' },
        { key: 'weak', label: '弱い', description: '露出機能が弱い・不安定' }
      ]
    },
    {
      sectionKey: 'accessories',
      sectionName: '付属品',
      items: [
        { key: 'battery', label: 'バッテリー', description: 'バッテリーの有無' },
        { key: 'manual', label: '説明書', description: '取扱説明書の有無' },
        { key: 'case', label: 'ケース', description: 'ケース・バッグの有無' },
        { key: 'box', label: '箱', description: '外箱の有無' },
        { key: 'strap', label: 'ストラップ', description: 'ストラップの有無' },
        { key: 'lens_cap', label: 'レンズキャップ', description: 'レンズキャップの有無' }
      ]
    },
    {
      sectionKey: 'others',
      sectionName: 'その他',
      items: [
        { key: 'other_issues', label: 'その他', hasOtherInput: true, description: '上記以外の問題や特記事項' }
      ]
    }
  ]
};

/**
 * 腕時計の検品チェックリスト項目
 */
const WATCH_CHECKLIST: CategoryChecklistStructure = {
  category: 'watch',
  categoryName: '腕時計',
  sections: [
    {
      sectionKey: 'watch_exterior',
      sectionName: '時計本体外観',
      items: [
        { key: 'scratches', label: '傷', description: 'ケース・ベルトの傷' },
        { key: 'scuffs', label: 'スレ', description: 'ケース・ベルトのスレ' },
        { key: 'dents', label: '凹み', description: 'ケース・ベルトの凹み' },
        { key: 'cracks', label: 'ひび', description: 'ケース・ガラスのひび' },
        { key: 'breaks', label: '割れ', description: 'ガラス・部品の割れ' },
        { key: 'paint_peeling', label: '塗装剥がれ', description: 'ケースの塗装剥がれ' },
        { key: 'stains', label: '汚れ', description: '汚れ・変色' },
        { key: 'stickiness', label: 'ベタつき', description: 'ベルト等のベタつき' },
        { key: 'other_exterior_watch', label: 'その他', hasOtherInput: true }
      ]
    },
    {
      sectionKey: 'dial_hands',
      sectionName: '文字盤・針',
      items: [
        { key: 'hand_discoloration', label: '針の変色', description: '針の変色・腐食' },
        { key: 'dial_stains', label: '文字盤の汚れ', description: '文字盤の汚れ・シミ' },
        { key: 'index_damage', label: 'インデックスの欠け', description: 'インデックス・数字の欠け' },
        { key: 'luminous_deterioration', label: '夜光の劣化', description: '夜光塗料の劣化・剥がれ' },
        { key: 'dial_cracks', label: 'クラック', description: '文字盤のひび・クラック' }
      ]
    },
    {
      sectionKey: 'movement_function',
      sectionName: 'ムーブメント機能',
      items: [
        { key: 'time_accuracy', label: '時刻精度', description: '時刻の精度・進み遅れ' },
        { key: 'winding_function', label: '巻き上げ機能', description: '巻き上げ機能の動作' },
        { key: 'crown_operation', label: 'リューズ動作', description: 'リューズの動作・操作感' },
        { key: 'pushbutton_operation', label: 'プッシュボタン動作', description: 'プッシュボタンの動作' },
        { key: 'date_function', label: '日付機能', description: '日付表示・切替機能' }
      ]
    },
    {
      sectionKey: 'case_bracelet',
      sectionName: 'ケース・ブレスレット',
      items: [
        { key: 'case_corrosion', label: 'ケースの腐食', description: 'ケースの腐食・錆' },
        { key: 'bracelet_stretch', label: 'ブレスレットの伸び', description: 'ブレスレットの伸び・ガタつき' },
        { key: 'buckle_malfunction', label: 'バックルの不具合', description: 'バックル・クラスプの不具合' },
        { key: 'link_missing', label: 'コマの欠損', description: 'ブレスレットコマの欠損' },
        { key: 'belt_deterioration', label: 'ベルトの劣化', description: '革ベルト等の劣化・ひび割れ' }
      ]
    },
    {
      sectionKey: 'waterproof_special',
      sectionName: '防水・特殊機能',
      items: [
        { key: 'waterproof_performance', label: '防水性能', description: '防水性能の確認' },
        { key: 'chronograph_function', label: 'クロノグラフ機能', description: 'クロノグラフ機能の動作' },
        { key: 'gmt_function', label: 'GMT機能', description: 'GMT・第2時間帯機能' },
        { key: 'rotating_bezel', label: '回転ベゼル', description: '回転ベゼルの動作' },
        { key: 'other_functions', label: 'その他機能', hasOtherInput: true, description: 'その他特殊機能' }
      ]
    },
    {
      sectionKey: 'accessories_watch',
      sectionName: '付属品',
      items: [
        { key: 'box_watch', label: '箱', description: '外箱・内箱の有無' },
        { key: 'warranty', label: '保証書', description: '保証書・ギャランティの有無' },
        { key: 'manual_watch', label: '説明書', description: '取扱説明書の有無' },
        { key: 'extra_links', label: '余りコマ', description: '余りコマの有無' },
        { key: 'tools', label: '工具', description: '専用工具の有無' },
        { key: 'original_belt', label: '純正ベルト', description: '純正ベルト・ブレスレットの有無' }
      ]
    },
    {
      sectionKey: 'others_watch',
      sectionName: 'その他',
      items: [
        { key: 'other_issues_watch', label: 'その他', hasOtherInput: true, description: '上記以外の問題や特記事項' }
      ]
    }
  ]
};

/**
 * その他カテゴリの検品チェックリスト項目
 */
const OTHER_CHECKLIST: CategoryChecklistStructure = {
  category: 'other',
  categoryName: 'その他',
  sections: [
    {
      sectionKey: 'general_exterior',
      sectionName: '外観',
      items: [
        { key: 'scratches', label: '傷', description: '目立つ傷' },
        { key: 'scuffs', label: 'スレ', description: '擦り傷' },
        { key: 'dents', label: '凹み', description: '凹み・変形' },
        { key: 'cracks', label: 'ひび', description: 'ひび割れ' },
        { key: 'breaks', label: '割れ', description: '割れ・破損' },
        { key: 'paint_peeling', label: '塗装剥がれ', description: '塗装の剥がれ' },
        { key: 'stains', label: '汚れ', description: '汚れ・シミ' },
        { key: 'stickiness', label: 'ベタつき', description: 'ベタつき・劣化' },
        { key: 'other_exterior_general', label: 'その他', hasOtherInput: true }
      ]
    },
    {
      sectionKey: 'function',
      sectionName: '機能',
      items: [
        { key: 'power_on', label: '電源ON', description: '電源が入るか' },
        { key: 'operation', label: '動作', description: '基本動作の確認' },
        { key: 'buttons', label: 'ボタン', description: 'ボタン・操作系の動作' },
        { key: 'display', label: '表示', description: '画面・表示の確認' },
        { key: 'connectivity', label: '接続性', description: '接続・通信機能' }
      ]
    },
    {
      sectionKey: 'accessories_general',
      sectionName: '付属品',
      items: [
        { key: 'manual_general', label: '説明書', description: '取扱説明書の有無' },
        { key: 'box_general', label: '箱', description: '外箱の有無' },
        { key: 'cables', label: 'ケーブル', description: '付属ケーブル類' },
        { key: 'adapters', label: 'アダプタ', description: '電源アダプタ等' },
        { key: 'other_accessories', label: 'その他付属品', hasOtherInput: true }
      ]
    },
    {
      sectionKey: 'others_general',
      sectionName: 'その他',
      items: [
        { key: 'other_issues_general', label: 'その他', hasOtherInput: true, description: '上記以外の問題や特記事項' }
      ]
    }
  ]
};

/**
 * カテゴリーに応じた検品チェックリスト構造を取得
 */
export function getCategoryChecklistStructure(category: string): CategoryChecklistStructure {
  switch (category?.toLowerCase()) {
    case 'camera':
    case 'camera_body':
    case 'lens':
      return CAMERA_CHECKLIST;
    case 'watch':
    case 'timepiece':
      return WATCH_CHECKLIST;
    case 'other':
    default:
      return OTHER_CHECKLIST;
  }
}

/**
 * カテゴリーに応じた初期チェックリストデータを生成
 */
export function initializeCategoryChecklistData(category: string): { [key: string]: any } {
  const structure = getCategoryChecklistStructure(category);
  const initialData: { [key: string]: any } = {};

  structure.sections.forEach(section => {
    initialData[section.sectionKey] = {};
    section.items.forEach(item => {
      initialData[section.sectionKey][item.key] = false;
      if (item.hasOtherInput) {
        initialData[section.sectionKey][`${item.key}_text`] = '';
      }
    });
  });

  initialData.notes = '';
  return initialData;
}

/**
 * チェックリストデータをフラット形式に変換
 * 既存のデータベース構造との互換性のため
 */
export function convertToFlatChecklist(categoryData: { [key: string]: any }): { [key: string]: any } {
  const flat: { [key: string]: any } = {};

  // 各セクションのデータをフラットにする
  Object.entries(categoryData).forEach(([sectionKey, sectionData]) => {
    if (sectionKey === 'notes') {
      flat.notes = sectionData;
    } else if (typeof sectionData === 'object' && sectionData !== null) {
      Object.entries(sectionData).forEach(([itemKey, itemValue]) => {
        flat[`${sectionKey}_${itemKey}`] = itemValue;
      });
    }
  });

  return flat;
}

/**
 * フラット形式のデータをカテゴリー構造に変換
 */
export function convertFromFlatChecklist(flatData: { [key: string]: any }, category: string): { [key: string]: any } {
  const structure = getCategoryChecklistStructure(category);
  const categoryData: { [key: string]: any } = {};

  // 各セクションの構造を初期化
  structure.sections.forEach(section => {
    categoryData[section.sectionKey] = {};
  });

  // フラットデータを構造化データに変換
  Object.entries(flatData).forEach(([key, value]) => {
    if (key === 'notes') {
      categoryData.notes = value;
    } else {
      // セクションキー_アイテムキー の形式から分離
      const parts = key.split('_');
      if (parts.length >= 2) {
        const sectionKey = parts[0] + '_' + parts[1]; // 例: camera_body_exterior
        const itemKey = parts.slice(2).join('_'); // 残りの部分
        
        if (categoryData[sectionKey]) {
          categoryData[sectionKey][itemKey] = value;
        }
      }
    }
  });

  return categoryData;
}