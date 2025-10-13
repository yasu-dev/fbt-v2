'use client';

import { useEffect, useRef, useCallback } from 'react';
import { BusinessStatusIndicator } from './StatusIndicator';

// 業務ステータス用の型定義
type BusinessStatusType = 
  | 'inbound' | 'inspection' | 'storage' | 'listing' | 'sold'
  | 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'confirmed'
  | 'packed' | 'shipped'
  | 'approved' | 'rejected' | 'refunded';

interface UnifiedStatusDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: string;
  availableStatuses: string[];
  statusLabels: Record<string, string>;
  onStatusChange: (status: string) => void;
  title?: string;
}

export default function UnifiedStatusDropdown({
  isOpen,
  onClose,
  currentStatus,
  availableStatuses,
  statusLabels,
  onStatusChange,
  title = '次のステータスに変更'
}: UnifiedStatusDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleStatusChange = useCallback((status: string) => {
    // Status change triggered
    
    // 先にドロップダウンを閉じる
    onClose();
    
    // 少し遅延させてステータス変更を実行
    setTimeout(() => {
      onStatusChange(status);
    }, 50);
  }, [onStatusChange, onClose]);

  // 外側クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        console.log('Outside click detected, closing dropdown');
        onClose();
      }
    };

    const handleScroll = () => {
      console.log('Scroll detected, closing dropdown');
      onClose();
    };

    if (isOpen) {
      // 少し遅延させてイベントリスナーを追加
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside, true);
        document.addEventListener('scroll', handleScroll, true);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside, true);
        document.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isOpen, onClose]);

  // ESCキーでドロップダウンを閉じる
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      data-testid="unified-status-dropdown"
      className="unified-status-menu"
      style={{ pointerEvents: 'auto', zIndex: 10000 }}
    >
      <div className="unified-status-menu-header">
        <h3>{title}</h3>
      </div>
      <div className="unified-status-menu-content">
        {availableStatuses.map((status) => (
          <button
            key={status}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Option clicked:', status);
              handleStatusChange(status);
            }}
            className="unified-status-option"
            type="button"
            disabled={false}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="unified-status-option-content">
              <BusinessStatusIndicator status={status as BusinessStatusType} size="sm" />
              <span className="unified-status-option-label">{statusLabels[status]}</span>
            </div>
            <svg className="unified-status-option-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
        {availableStatuses.length === 0 && (
          <div className="unified-status-empty">
            これ以上進められるステータスはありません
          </div>
        )}
      </div>
    </div>
  );
} 