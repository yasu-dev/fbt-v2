'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import NexusTextarea from '@/app/components/ui/NexusTextarea';
import {
  getCategoryChecklistStructure,
  initializeCategoryChecklistData,
  CategoryChecklistStructure,
  ChecklistSection,
  ChecklistItem
} from '@/lib/constants/inspection-items';

interface CategoryBasedInspectionChecklistProps {
  category: string;
  data: { [key: string]: any };
  onChange: (data: { [key: string]: any }) => void;
  readOnly?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

export default function CategoryBasedInspectionChecklist({
  category,
  data,
  onChange,
  readOnly = false,
  verifiedBy,
  verifiedAt,
}: CategoryBasedInspectionChecklistProps) {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const [structure, setStructure] = useState<CategoryChecklistStructure | null>(null);

  useEffect(() => {
    // カテゴリー変更時にチェックリスト構造を更新
    const categoryStructure = getCategoryChecklistStructure(category);
    setStructure(categoryStructure);

    // データが空の場合は初期データを設定
    if (!data || Object.keys(data).length === 0) {
      const initialData = initializeCategoryChecklistData(category);
      onChange(initialData);
    }

    // すべてのセクションを最初は展開状態にする
    const expandedState: { [key: string]: boolean } = {};
    categoryStructure.sections.forEach(section => {
      expandedState[section.sectionKey] = true;
    });
    setExpandedSections(expandedState);
  }, [category]);

  const handleItemCheck = (sectionKey: string, itemKey: string, checked: boolean) => {
    if (readOnly) return;

    const updatedData = { ...data };
    if (!updatedData[sectionKey]) {
      updatedData[sectionKey] = {};
    }
    updatedData[sectionKey][itemKey] = checked;

    console.log(`[DEBUG] CategoryBasedChecklist: チェック変更 - ${sectionKey}.${itemKey}:`, {
      checked,
      section: sectionKey,
      item: itemKey,
      currentData: updatedData[sectionKey]
    });

    onChange(updatedData);
  };

  const handleOtherTextChange = (sectionKey: string, itemKey: string, text: string) => {
    if (readOnly) return;

    const updatedData = { ...data };
    if (!updatedData[sectionKey]) {
      updatedData[sectionKey] = {};
    }
    updatedData[sectionKey][`${itemKey}_text`] = text;

    console.log(`[DEBUG] CategoryBasedChecklist: その他テキスト変更 - ${sectionKey}.${itemKey}_text:`, text);

    onChange(updatedData);
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const getItemValue = (sectionKey: string, itemKey: string): boolean => {
    return data[sectionKey]?.[itemKey] || false;
  };

  const getOtherTextValue = (sectionKey: string, itemKey: string): string => {
    return data[sectionKey]?.[`${itemKey}_text`] || '';
  };

  const renderChecklistItem = (section: ChecklistSection, item: ChecklistItem) => {
    const isChecked = getItemValue(section.sectionKey, item.key);
    const otherText = getOtherTextValue(section.sectionKey, item.key);

    return (
      <div key={`${section.sectionKey}_${item.key}`} className="space-y-2">
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => handleItemCheck(section.sectionKey, item.key, e.target.checked)}
              disabled={readOnly}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            />
            <div>
              <span className="text-sm font-medium text-nexus-text-primary">
                {item.label}
              </span>
              {item.description && (
                <p className="text-xs text-nexus-text-secondary mt-0.5">
                  {item.description}
                </p>
              )}
            </div>
          </label>
        </div>

        {/* "その他"項目の場合、チェックされた時にテキスト入力フィールドを表示 */}
        {item.hasOtherInput && isChecked && (
          <div className="ml-6">
            <NexusTextarea
              placeholder={`${item.label}の詳細を入力してください`}
              value={otherText}
              onChange={(e) => handleOtherTextChange(section.sectionKey, item.key, e.target.value)}
              rows={2}
              disabled={readOnly}
              className="text-sm"
              variant="nexus"
            />
          </div>
        )}
      </div>
    );
  };

  const renderSection = (section: ChecklistSection) => {
    const isExpanded = expandedSections[section.sectionKey] || false;

    return (
      <div key={section.sectionKey} className="border border-nexus-border rounded-lg">
        <button
          type="button"
          onClick={() => toggleSection(section.sectionKey)}
          className="w-full px-4 py-3 flex items-center justify-between bg-nexus-bg-secondary hover:bg-nexus-bg-tertiary transition-colors rounded-t-lg"
        >
          <h3 className="text-sm font-semibold text-nexus-text-primary">
            ■ {section.sectionName}
          </h3>
          <div className="flex items-center space-x-2">
            {/* チェック済み項目数を表示 */}
            <span className="text-xs text-nexus-text-secondary">
              {section.items.filter(item => getItemValue(section.sectionKey, item.key)).length}/{section.items.length}
            </span>
            {isExpanded ? (
              <ChevronUpIcon className="h-4 w-4 text-nexus-text-secondary" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-nexus-text-secondary" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="p-4 space-y-3 border-t border-nexus-border">
            {section.items.map(item => renderChecklistItem(section, item))}
          </div>
        )}
      </div>
    );
  };

  if (!structure) {
    return (
      <div className="text-center py-4">
        <p className="text-nexus-text-secondary">検品項目を読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-nexus-text-primary">
            検品チェックリスト - {structure.categoryName}
          </h2>
          <p className="text-sm text-nexus-text-secondary mt-1">
            該当する項目をチェックしてください。問題がない項目はチェック不要です。
          </p>
        </div>

        {/* 検証情報 */}
        {verifiedBy && verifiedAt && (
          <div className="text-right">
            <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              ✓ 検証済み
            </div>
            <p className="text-xs text-nexus-text-secondary mt-1">
              {verifiedBy} - {new Date(verifiedAt).toLocaleDateString('ja-JP')}
            </p>
          </div>
        )}
      </div>

      {/* チェックリストセクション */}
      <div className="space-y-3">
        {structure.sections.map(section => renderSection(section))}
      </div>

      {/* 全体のメモ欄 */}
      <div className="border-t border-nexus-border pt-4">
        <h3 className="text-sm font-semibold text-nexus-text-primary mb-2">
          検品メモ・特記事項
        </h3>
        <NexusTextarea
          placeholder="検品に関する追加情報や特記事項があれば入力してください"
          value={data.notes || ''}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          rows={3}
          disabled={readOnly}
          variant="nexus"
        />
      </div>

      {/* 読み取り専用の場合の表示 */}
      {readOnly && (
        <div className="border-t border-nexus-border pt-4">
          <p className="text-xs text-nexus-text-secondary text-center">
            この検品チェックリストは確認専用です
          </p>
        </div>
      )}
    </div>
  );
}