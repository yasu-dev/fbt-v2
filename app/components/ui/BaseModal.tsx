import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useModal } from './ModalContext';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  'data-testid'?: string;
}

// コンパクトで効率的なサイズ設定
const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
  full: 'max-w-full mx-4'
};

export default function BaseModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
  'data-testid': dataTestId
}: BaseModalProps) {
  const { setIsAnyModalOpen } = useModal();
  const contentRef = useRef<HTMLDivElement>(null);
  // 初回モーダル表示かどうかを管理するフラグ
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(true);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // モーダル表示時にbodyのスクロールを防ぐ
      document.body.style.overflow = 'hidden';
      // グローバル状態を更新（業務フローの状態は変更しない）
      setIsAnyModalOpen(true);
      
      const scrollContainer = document.querySelector('.page-scroll-container');
      
      if (scrollContainer) {
        const currentScrollTop = scrollContainer.scrollTop;
        
        // 初回モーダル表示時は強制的に最上部に移動
        if (isFirstModalOpen) {
          scrollContainer.scrollTop = 0;
        } 
        // 2回目以降で、ユーザーが最上部にいる場合（scrollTop < 10）のみリセット
        else if (currentScrollTop < 10) {
          scrollContainer.scrollTop = 0;
        }
        // それ以外の場合は、スクロール位置をそのまま維持
        
      } else {
        // フォールバック（ログインページなど、DashboardLayoutを使用していない場合）
        if (isFirstModalOpen) {
          window.scrollTo(0, 0);
        } else if (window.pageYOffset < 10) {
          window.scrollTo(0, 0);
        }
      }
      
      // モーダルが開いたときにコンテンツエリアのスクロール位置制御
      if (contentRef.current) {
        const currentModalScrollTop = contentRef.current.scrollTop;
        
        // 初回モーダル表示時は強制的に最上部に移動
        if (isFirstModalOpen) {
          contentRef.current.scrollTop = 0;
        }
        // 2回目以降で、ユーザーがモーダル内で最上部にいる場合（scrollTop < 10）のみリセット
        else if (currentModalScrollTop < 10) {
          contentRef.current.scrollTop = 0;
        }
        // それ以外の場合は、モーダル内スクロール位置をそのまま維持
      }
      
      // クリーンアップ関数
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
        // モーダル閉時もグローバル状態をリセット
        setIsAnyModalOpen(false);
      };
    } else {
      // グローバル状態をリセット（業務フローの状態は変更しない）
      setIsAnyModalOpen(false);
      // モーダルが閉じられた際に初回フラグをリセット
      setIsFirstModalOpen(true);
    }
  }, [isOpen, onClose, setIsAnyModalOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  // ユーザーがモーダル内でスクロールした際に初回フラグをfalseに設定
  const handleModalScroll = () => {
    if (isFirstModalOpen) {
      setIsFirstModalOpen(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-start justify-center z-[10001] p-2 pt-8"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div 
        className={`
          bg-nexus-bg-primary 
          rounded-xl 
          shadow-2xl 
          w-full 
          ${sizeClasses[size]} 
          max-h-[90vh] 
          overflow-hidden 
          flex 
          flex-col
          border border-nexus-border
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
        data-testid={dataTestId}
      >
        {/* ヘッダー - paddingを削減 */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-3 border-b border-nexus-border">
            <div className="flex-1">
              {title && (
                <h2 
                  id="modal-title" 
                  className="text-lg font-semibold text-nexus-text-primary font-display"
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-nexus-text-secondary mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-nexus-bg-secondary rounded-lg transition-colors ml-3"
                aria-label="モーダルを閉じる"
              >
                <X size={18} className="text-nexus-text-secondary" />
              </button>
            )}
          </div>
        )}

        {/* コンテンツ - paddingを削減 */}
        <div className="flex-1 overflow-y-auto p-4" ref={contentRef} onScroll={handleModalScroll}>
          {children}
        </div>
      </div>
    </div>
  );
} 