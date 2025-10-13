'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { BaseModal, NexusButton, NexusInput } from '../ui';

interface ReportPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: Date, endDate: Date) => void;
}

export default function ReportPeriodModal({ isOpen, onClose, onApply }: ReportPeriodModalProps) {
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleApply = () => {
    onApply(new Date(startDate), new Date(endDate));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="レポート期間選択"
      size="sm"
      className="max-w-md"
    >
      <div className="mb-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
          <NexusInput
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
          <NexusInput
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <NexusButton
          onClick={onClose}
          variant="secondary"
        >
          キャンセル
        </NexusButton>
        <NexusButton
          onClick={handleApply}
          variant="primary"
        >
          適用
        </NexusButton>
      </div>
    </BaseModal>
  );
} 