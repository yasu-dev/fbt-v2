'use client';

import { useState } from 'react';
import { BaseModal, NexusButton, NexusInput } from '../ui';

interface PeriodOption {
  id: string;
  label: string;
  getValue: () => { startDate: Date; endDate: Date };
}

interface AnalyticsPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: Date, endDate: Date, label: string) => void;
  title?: string;
}

export default function AnalyticsPeriodModal({
  isOpen,
  onClose,
  onApply,
  title = "期間選択"
}: AnalyticsPeriodModalProps) {
  const [selectedOption, setSelectedOption] = useState<string>('this_week');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekStart.getDate() + 6);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setDate(lastWeekStart.getDate() + 6);

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  const thisQuarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
  const thisQuarterEnd = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3 + 3, 0);

  const periodOptions: PeriodOption[] = [
    {
      id: 'today',
      label: '今日',
      getValue: () => ({ startDate: today, endDate: today })
    },
    {
      id: 'yesterday',
      label: '昨日',
      getValue: () => ({ startDate: yesterday, endDate: yesterday })
    },
    {
      id: 'this_week',
      label: '今週',
      getValue: () => ({ startDate: thisWeekStart, endDate: thisWeekEnd })
    },
    {
      id: 'last_week',
      label: '先週',
      getValue: () => ({ startDate: lastWeekStart, endDate: lastWeekEnd })
    },
    {
      id: 'this_month',
      label: '今月',
      getValue: () => ({ startDate: thisMonthStart, endDate: thisMonthEnd })
    },
    {
      id: 'last_month',
      label: '先月',
      getValue: () => ({ startDate: lastMonthStart, endDate: lastMonthEnd })
    },
    {
      id: 'this_quarter',
      label: '今四半期',
      getValue: () => ({ startDate: thisQuarterStart, endDate: thisQuarterEnd })
    },
    {
      id: 'last_7_days',
      label: '過去7日間',
      getValue: () => {
        const start = new Date(today);
        start.setDate(today.getDate() - 6);
        return { startDate: start, endDate: today };
      }
    },
    {
      id: 'last_30_days',
      label: '過去30日間',
      getValue: () => {
        const start = new Date(today);
        start.setDate(today.getDate() - 29);
        return { startDate: start, endDate: today };
      }
    }
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleApply = () => {
    if (isCustom) {
      if (!customStartDate || !customEndDate) {
        return;
      }
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      onApply(startDate, endDate, 'カスタム期間');
    } else {
      const option = periodOptions.find(opt => opt.id === selectedOption);
      if (option) {
        const { startDate, endDate } = option.getValue();
        onApply(startDate, endDate, option.label);
      }
    }
    onClose();
  };

  const getPreviewText = () => {
    if (isCustom) {
      if (customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        return `${formatDate(start)} ～ ${formatDate(end)}`;
      }
      return 'カスタム期間を選択してください';
    } else {
      const option = periodOptions.find(opt => opt.id === selectedOption);
      if (option) {
        const { startDate, endDate } = option.getValue();
        return `${formatDate(startDate)} ～ ${formatDate(endDate)}`;
      }
      return '';
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* プリセット期間選択 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-nexus-text-primary">期間選択</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsCustom(false)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  !isCustom
                    ? 'bg-nexus-primary text-white'
                    : 'bg-nexus-bg-secondary text-nexus-text-secondary hover:bg-nexus-bg-tertiary'
                }`}
              >
                プリセット
              </button>
              <button
                onClick={() => setIsCustom(true)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  isCustom
                    ? 'bg-nexus-primary text-white'
                    : 'bg-nexus-bg-secondary text-nexus-text-secondary hover:bg-nexus-bg-tertiary'
                }`}
              >
                カスタム
              </button>
            </div>
          </div>

          {!isCustom ? (
            <div className="grid grid-cols-3 gap-3">
              {periodOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`p-4 text-left border rounded-lg transition-all ${
                    selectedOption === option.id
                      ? 'border-nexus-primary bg-nexus-primary/5 text-nexus-primary'
                      : 'border-nexus-border hover:border-nexus-primary/30 text-nexus-text-primary'
                  }`}
                >
                  <div className="font-medium mb-1">{option.label}</div>
                  <div className="text-xs text-nexus-text-secondary">
                    {(() => {
                      const { startDate, endDate } = option.getValue();
                      return `${startDate.toLocaleDateString('ja-JP')} ～ ${endDate.toLocaleDateString('ja-JP')}`;
                    })()}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                    開始日
                  </label>
                  <NexusInput
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    variant="nexus"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                    終了日
                  </label>
                  <NexusInput
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    variant="nexus"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* プレビュー */}
        <div className="bg-nexus-bg-secondary rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-nexus-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium text-nexus-text-secondary">選択した期間</span>
          </div>
          <p className="text-lg font-semibold text-nexus-text-primary">
            {getPreviewText()}
          </p>
        </div>

        {/* フッターボタン */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-nexus-border">
          <NexusButton onClick={onClose} variant="default">
            キャンセル
          </NexusButton>
          <NexusButton
            onClick={handleApply}
            variant="primary"
            disabled={isCustom && (!customStartDate || !customEndDate)}
          >
            適用
          </NexusButton>
        </div>
      </div>
    </BaseModal>
  );
} 