'use client';

import { useState } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusCheckbox from '@/app/components/ui/NexusCheckbox';

export interface InspectionChecklistProps {
  category: string;
  checklist: {
    exterior: {
      scratches: boolean;
      dents: boolean;
      discoloration: boolean;
      dust: boolean;
    };
    functionality: {
      powerOn: boolean;
      allButtonsWork: boolean;
      screenDisplay: boolean;
      connectivity: boolean;
    };
    optical?: {
      lensClarity: boolean;
      aperture: boolean;
      focusAccuracy: boolean;
      stabilization: boolean;
    };
  };
  onUpdate: (category: string, item: string, value: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
  onSaveAndReturn?: () => void;
  loading?: boolean;
}

interface CheckItem {
  key: string;
  label: string;
  description: string;
}

export default function InspectionChecklist({
  category,
  checklist,
  onUpdate,
  onNext,
  onPrev,
  onSaveAndReturn,
  loading = false,
}: InspectionChecklistProps) {
  // 検品項目の定義（12項目統一・任意チェック）
  const checkItems: { [key: string]: CheckItem[] } = {
    issues: [
      { key: 'exteriorScratches', label: '傷', description: 'カメラボディの傷がある場合チェック' },
      { key: 'dentsImpacts', label: '凹み', description: 'カメラボディの凹みがある場合チェック' },
      { key: 'missingParts', label: 'スレ', description: 'カメラボディのスレがある場合チェック' },
      { key: 'dirtDust', label: '汚れ', description: 'カメラボディの汚れがある場合チェック' },
      { key: 'agingDeterioration', label: 'キズ', description: '光学系のキズがある場合チェック' },
      { key: 'functionalIssues', label: '作動', description: '露出機能が作動する場合チェック' },
      { key: 'controlIssues', label: '不動', description: '露出機能が不動の場合チェック' },
      { key: 'displayIssues', label: 'クモリ', description: 'ファインダーのクモリがある場合チェック' },
      { key: 'coreComponentIssues', label: 'チリホコリ', description: '光学系のチリホコリがある場合チェック' },
      { key: 'waterproofIssues', label: 'カビ', description: 'ファインダーのカビがある場合チェック' },
      { key: 'accessoryDiscrepancy', label: 'バッテリー', description: 'バッテリーがある場合チェック' },
      { key: 'warrantyAuthenticity', label: 'ケース', description: 'ケースがある場合チェック' },
    ],
  };

  // 一括チェック機能
  const handleBulkCheck = (sectionKey: string, checked: boolean) => {
    const section = checkItems[sectionKey];
    if (!section) return;
    
    section.forEach(item => {
      onUpdate(sectionKey, item.key, checked);
    });
  };

  const renderCheckSection = (
    sectionKey: string,
    sectionTitle: string,
    sectionIcon: React.ReactNode,
    items: CheckItem[]
  ) => {
    const sectionData = checklist[sectionKey as keyof typeof checklist];
    if (!sectionData) return null;

    return (
      <NexusCard className="p-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="w-5 h-5 mr-2 text-blue-600">
              {sectionIcon}
            </div>
            <h3 className="text-sm font-semibold">{sectionTitle}</h3>
          </div>
          <button
            onClick={() => {
              const allChecked = items.every(item => 
                sectionData[item.key as keyof typeof sectionData]
              );
              handleBulkCheck(sectionKey, !allChecked);
            }}
            className="text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
          >
            {items.every(item => sectionData[item.key as keyof typeof sectionData]) ? '全解除' : '一括チェック'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {items.map(item => {
            const isChecked = sectionData[item.key as keyof typeof sectionData] || false;
            return (
              <div
                key={item.key}
                className={`
                  p-2 rounded-md border transition-all text-xs
                  ${isChecked
                    ? 'border-green-400 bg-green-50 shadow-sm ring-1 ring-green-200'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                  }
                `}
              >
                <NexusCheckbox
                  checked={isChecked}
                  onChange={(e) => onUpdate(sectionKey, item.key, e.target.checked)}
                  label={item.label}
                  description={item.description}
                  variant="nexus"
                  size="md"
                />
              </div>
            );
          })}
        </div>
      </NexusCard>
    );
  };

  return (
    <div className="space-y-3">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
        <div className="flex items-start">
          <div className="w-4 h-4 mr-2 text-yellow-600 flex-shrink-0 mt-0.5">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-yellow-800 text-xs">検品時の注意事項</h4>
            <ul className="text-xs text-yellow-700 mt-1 space-y-0.5">
              <li>• 該当する項目のみチェックしてください（0個でも可）</li>
              <li>• 不明な点は管理者に確認してください</li>
              <li>• 一括チェックボタンで効率的に入力できます</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 統一検品チェック（12項目） */}
      {renderCheckSection(
        'issues',
        '検品チェックリスト（該当項目のみチェック）',
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>,
        checkItems.issues
      )}

      {/* 進捗表示 - 改善版 */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-3 border border-blue-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            チェック済み項目
          </span>
          <span className="text-sm font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
            {checklist.issues ? Object.values(checklist.issues).filter(v => v).length : 0} / 12 項目
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${((checklist.issues ? Object.values(checklist.issues).filter(v => v).length : 0) / 12) * 100}%`
            }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1 text-center">
          該当する項目のみチェックしてください（0個でも進行可能）
        </p>
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex justify-between gap-3 pt-2">
        {onSaveAndReturn && (
          <NexusButton
            onClick={onSaveAndReturn}
            variant="outline"
            size="md"
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            {loading ? '保存中...' : '保存して一覧に戻る'}
          </NexusButton>
        )}
        <NexusButton
          onClick={onNext}
          variant="primary"
          size="md"
          disabled={loading}
          className="flex-1 sm:flex-none"
        >
          次へ（写真撮影）
        </NexusButton>
      </div>
    </div>
  );
}