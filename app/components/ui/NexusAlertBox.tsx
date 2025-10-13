'use client';

import { useEffect, useRef } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export type AlertType = 'success' | 'warning' | 'error' | 'info';

interface AlertAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface NexusAlertBoxProps {
  isOpen: boolean;
  onClose: () => void;
  type: AlertType;
  title: string;
  message: string;
  actions?: AlertAction[];
  autoClose?: boolean;
  duration?: number;
}

export default function NexusAlertBox({
  isOpen,
  onClose,
  type,
  title,
  message,
  actions,
  autoClose = false,
  duration = 5000
}: NexusAlertBoxProps) {
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, duration, onClose]);

  // ESCキーでクローズ
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  // フォーカス管理とスクロール制御
  useEffect(() => {
    if (isOpen) {
      const scrollContainer = document.querySelector('.page-scroll-container');
      
      if (scrollContainer) {
        const currentScrollTop = scrollContainer.scrollTop;
        
        // ユーザーが最上部以外にスクロールしている場合は位置を維持
        // 最上部にいる場合（scrollTop < 10）のみリセットを実行
        if (currentScrollTop < 10) {
          scrollContainer.scrollTop = 0;
        }
        // currentScrollTop >= 10 の場合は、スクロール位置をそのまま維持
        
      } else {
        // DashboardLayoutを使用していない場合のフォールバック
        // この場合も現在位置をチェック
        if (window.pageYOffset < 10) {
          window.scrollTo(0, 0);
        }
      }
      
      if (alertRef.current) {
        alertRef.current.focus();
      }
    }
  }, [isOpen]);

  if (!isOpen || !title || !message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-600" />;
      case 'info':
        return <InformationCircleIcon className="h-6 w-6 text-blue-600" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-600" />;
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getButtonVariantStyles = (variant: string = 'primary') => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-blue text-white hover:bg-blue-700';
      case 'secondary':
        return 'bg-nexus-bg-secondary text-nexus-text-primary hover:bg-nexus-bg-tertiary border border-nexus-border';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700';
      default:
        return 'bg-primary-blue text-white hover:bg-blue-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* アラートボックス */}
      <div
        ref={alertRef}
        tabIndex={-1}
        className={`relative max-w-md w-full mx-auto rounded-lg border-2 shadow-lg ${getTypeStyles()}`}
        role="alert"
        aria-labelledby="alert-title"
        aria-describedby="alert-message"
      >
        {/* クローズボタン */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-blue rounded"
          aria-label="アラートを閉じる"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* コンテンツ */}
        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="ml-3 flex-1">
              <h3 id="alert-title" className="text-lg font-medium">
                {title}
              </h3>
              <div id="alert-message" className="mt-2 text-sm">
                {message}
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          {actions && actions.length > 0 && (
            <div className="mt-6 flex justify-end space-x-3">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.action();
                    onClose();
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue ${getButtonVariantStyles(action.variant)}`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 