/**
 * 既存のnotesフィールドを活用したカテゴリー別検品チェックリストのデータ管理ユーティリティ
 * 
 * 既存システムとの完全な互換性を保ちながら、新機能を実装
 */

interface CategoryBasedChecklistData {
  category: string;
  data: { [key: string]: any };
  lastUpdated?: string;
}

interface InspectionNotesStructure {
  // 新機能: カテゴリー別検品チェックリスト
  categoryBasedChecklist?: CategoryBasedChecklistData;
  // 既存: 一般的な検品メモ
  generalNotes?: string;
  // 既存システム用のレガシーデータ（後方互換性）
  legacyNotes?: string;
}

/**
 * カテゴリー別検品データをnotesフィールドに安全に格納
 */
export function encodeCategoryBasedChecklistToNotes(
  category: string,
  checklistData: { [key: string]: any },
  existingNotes?: string | null,
  generalNotes?: string
): string {
  try {
    let notesStructure: InspectionNotesStructure = {};

    // 既存のnotesがある場合は解析を試行
    if (existingNotes) {
      try {
        const parsed = JSON.parse(existingNotes);
        if (typeof parsed === 'object' && parsed !== null) {
          notesStructure = parsed;
        } else {
          // 既存のnotesが単純な文字列の場合はlegacyNotesとして保持
          notesStructure.legacyNotes = existingNotes;
        }
      } catch {
        // JSONパースに失敗した場合は、既存のnotesをlegacyNotesとして保持
        notesStructure.legacyNotes = existingNotes;
      }
    }

    // カテゴリー別検品データを設定
    notesStructure.categoryBasedChecklist = {
      category,
      data: checklistData,
      lastUpdated: new Date().toISOString()
    };

    // 一般メモがある場合は設定
    if (generalNotes) {
      notesStructure.generalNotes = generalNotes;
    }

    return JSON.stringify(notesStructure, null, 2);

  } catch (error) {
    console.error('[ERROR] カテゴリー別検品データのエンコードに失敗:', error);
    // フォールバック: 既存のnotesをそのまま返す
    return existingNotes || '';
  }
}

/**
 * notesフィールドからカテゴリー別検品データを安全に取得
 */
export function decodeCategoryBasedChecklistFromNotes(
  notes?: string | null
): {
  categoryBasedChecklist?: CategoryBasedChecklistData;
  generalNotes?: string;
  legacyNotes?: string;
} {
  if (!notes) {
    return {};
  }

  try {
    const parsed = JSON.parse(notes);
    if (typeof parsed === 'object' && parsed !== null) {
      return {
        categoryBasedChecklist: parsed.categoryBasedChecklist,
        generalNotes: parsed.generalNotes,
        legacyNotes: parsed.legacyNotes
      };
    } else {
      // JSONではない場合は、レガシーnotesとして扱う
      return { legacyNotes: notes };
    }
  } catch {
    // JSONパースに失敗した場合は、レガシーnotesとして扱う
    return { legacyNotes: notes };
  }
}

/**
 * 表示用のnotesテキストを取得（後方互換性のため）
 */
export function getDisplayNotes(notes?: string | null): string {
  const decoded = decodeCategoryBasedChecklistFromNotes(notes);
  
  const parts: string[] = [];
  
  if (decoded.generalNotes) {
    parts.push(decoded.generalNotes);
  }
  
  if (decoded.legacyNotes) {
    parts.push(decoded.legacyNotes);
  }
  
  if (decoded.categoryBasedChecklist?.data) {
    const checklistSummary = generateChecklistSummary(decoded.categoryBasedChecklist);
    if (checklistSummary) {
      parts.push(`[${decoded.categoryBasedChecklist.category}検品結果] ${checklistSummary}`);
    }
  }
  
  return parts.join('\n\n');
}

/**
 * カテゴリー別検品結果のサマリーを生成
 */
function generateChecklistSummary(checklistData: CategoryBasedChecklistData): string {
  try {
    const { data } = checklistData;
    const issues: string[] = [];
    
    // 各セクションをチェックして問題のある項目を抽出
    Object.keys(data).forEach(sectionKey => {
      if (sectionKey === 'notes') return; // notesは除外
      
      const section = data[sectionKey];
      if (typeof section === 'object' && section !== null) {
        Object.keys(section).forEach(itemKey => {
          if (itemKey.endsWith('_text')) return; // テキスト項目は除外
          
          if (section[itemKey] === true) {
            // 問題のある項目として記録
            const displayName = getItemDisplayName(sectionKey, itemKey);
            issues.push(displayName);
            
            // "その他"項目のテキストがある場合は追加
            const otherTextKey = `${itemKey}_text`;
            if (section[otherTextKey]) {
              issues[issues.length - 1] += `(${section[otherTextKey]})`;
            }
          }
        });
      }
    });
    
    if (issues.length === 0) {
      return '問題なし';
    }
    
    return issues.slice(0, 3).join(', ') + (issues.length > 3 ? ` 他${issues.length - 3}件` : '');
  } catch (error) {
    console.error('[ERROR] 検品サマリー生成エラー:', error);
    return '検品データ確認中';
  }
}

/**
 * 項目の表示名を取得（簡易版）
 */
function getItemDisplayName(sectionKey: string, itemKey: string): string {
  // 簡易的な表示名マッピング
  const itemNames: { [key: string]: string } = {
    'scratches': '傷',
    'scuffs': 'スレ',
    'dents': '凹み',
    'cracks': 'ひび',
    'breaks': '割れ',
    'paint_peeling': '塗装剥がれ',
    'dirt': '汚れ',
    'stickiness': 'ベタつき',
    'mold': 'カビ',
    'dust': 'ホコリ',
    'clouding': 'クモリ',
    'corrosion': '腐食',
    'other': 'その他'
  };
  
  return itemNames[itemKey] || itemKey;
}

