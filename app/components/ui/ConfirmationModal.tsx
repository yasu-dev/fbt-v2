'use client';

import React from 'react';
import BaseModal from './BaseModal';
import NexusButton from './NexusButton';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
  type?: 'warning' | 'question' | 'danger';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = '確認',
  message,
  confirmText = 'OK',
  cancelText = 'キャンセル',
  confirmVariant = 'primary',
  type = 'question'
}: ConfirmationModalProps) {
  
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'warning':
      case 'danger':
        return <AlertCircle className="w-6 h-6 text-nexus-red" />;
      case 'question':
      default:
        return <HelpCircle className="w-6 h-6 text-primary-blue" />;
    }
  };

  const getIconBgColor = () => {
    switch (type) {
      case 'warning':
      case 'danger':
        return 'bg-red-50';
      case 'question':
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      closeOnOverlayClick={true}
    >
      <div className="p-6">
        {/* アイコンとタイトル */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`flex-shrink-0 w-12 h-12 ${getIconBgColor()} rounded-full flex items-center justify-center`}>
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-nexus-text-primary mb-2">
              {title}
            </h3>
            <div className="text-nexus-text-secondary whitespace-pre-line">
              {message}
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex justify-end gap-3 mt-6">
          <NexusButton
            onClick={handleCancel}
            variant="default"
            size="lg"
          >
            {cancelText}
          </NexusButton>
          <NexusButton
            onClick={handleConfirm}
            variant={confirmVariant}
            size="lg"
          >
            {confirmText}
          </NexusButton>
        </div>
      </div>
    </BaseModal>
  );
}
