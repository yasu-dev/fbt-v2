'use client';

import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
  className?: string;
}

const itemsPerPageOptions = [10, 20, 50, 100];

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  className = ''
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };



  // ページが1つしかない場合は表示しない
  if (totalPages <= 1) return null;
  if (totalItems === 0) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-6 ${className}`}>
      {/* 件数表示 */}
      <div className="flex items-center gap-6">
        <span className="text-sm text-nexus-text-secondary">
          {totalItems > 0 ? `${startItem}-${endItem}` : '0'} / {totalItems}件
        </span>
        
        {/* 表示件数選択 */}
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-nexus-text-secondary">表示件数:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-nexus-text-primary focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent min-w-[60px]"
            >
              {itemsPerPageOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ページネーション */}
      <div className="flex items-center gap-2">
        {/* 前へボタン */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            p-2 rounded-md
            ${currentPage === 1 
              ? 'text-nexus-text-disabled cursor-not-allowed' 
              : 'text-nexus-text-primary cursor-pointer'
            }
          `}
          aria-label="前のページ"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        {/* ページ番号 */}
        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-nexus-text-secondary">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium
                  ${page === currentPage
                    ? 'bg-primary-blue text-white'
                    : 'text-nexus-text-primary cursor-pointer'
                  }
                `}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* 次へボタン */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            p-2 rounded-md
            ${currentPage === totalPages 
              ? 'text-nexus-text-disabled cursor-not-allowed' 
              : 'text-nexus-text-primary cursor-pointer'
            }
          `}
          aria-label="次のページ"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
} 