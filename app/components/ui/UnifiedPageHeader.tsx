'use client';

import React from 'react';
import { getUnifiedIcon, IconType } from './icons';
import { NexusButton } from './index';

interface ActionButton {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant: 'primary' | 'secondary';
}

interface UnifiedPageHeaderProps {
  title: string;
  subtitle?: string;
  userType: 'seller' | 'staff';
  actions?: React.ReactNode | ActionButton[];
  iconType?: IconType; // 新しく追加: 各ページに対応するアイコンタイプ
}

/**
 * 統一されたページヘッダーコンポーネント
 * 全画面で同じスタイル、レイアウトを使用し、各ページに対応するアイコンを表示
 */
export default function UnifiedPageHeader({
  title,
  subtitle,
  userType,
  actions,
  iconType
}: UnifiedPageHeaderProps) {
  // アイコンが指定されていない場合のフォールバック（既存の動作を維持）
  const headerIcon = iconType ? (
    getUnifiedIcon(iconType, "w-8 h-8 text-nexus-text-primary flex-shrink-0")
  ) : (
    // フォールバック用のデフォルトアイコン（従来の黄色アイコンから変更）
    <svg 
      className="w-8 h-8 text-nexus-text-primary flex-shrink-0" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
      />
    </svg>
  );

  return (
    <div className="bg-white rounded-xl border border-nexus-border" data-testid="unified-page-header">
      {/* 統一されたパディング */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* タイトルセクション - 統一レイアウト */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* 統一されたアイコン（各ページごとに異なる） */}
            {headerIcon}
            <div className="min-w-0">
              {/* 統一されたタイトルスタイル */}
              <h1 className="text-3xl font-display font-bold text-nexus-text-primary truncate">
                {title}
              </h1>
              {/* 統一されたサブタイトルスタイル */}
              {subtitle && (
                <p className="mt-2 text-nexus-text-secondary truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* アクションボタン */}
          {actions && (
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
              {Array.isArray(actions)
                ? actions.map((action, index) => (
                    <NexusButton
                      key={index}
                      variant={action.variant}
                      onClick={action.onClick}
                      icon={action.icon}
                    >
                      {action.label}
                    </NexusButton>
                  ))
                : actions
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 