'use client';

import React from 'react';
import { ReactNode } from 'react';

interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface HoloTableProps {
  columns: TableColumn[];
  data: Record<string, any>[];
  onRowClick?: (row: Record<string, any>, index: number) => void;
  className?: string;
  emptyMessage?: string;
  renderCell?: (value: any, column: TableColumn, row: Record<string, any>) => ReactNode;
}

export default function HoloTable({
  columns,
  data,
  onRowClick,
  className = '',
  emptyMessage = 'データがありません',
  renderCell
}: HoloTableProps) {

  const getAlignClass = (align?: string) => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  const renderCellContent = (value: any, column: TableColumn, row: Record<string, any>) => {
    if (renderCell) {
      return renderCell(value, column, row);
    }
    
    // デフォルトレンダリング
    if (value === null || value === undefined) {
      return <span className="text-nexus-text-muted">-</span>;
    }
    
    return <span className="text-nexus-text-primary font-medium">{value}</span>;
  };

  return (
    <div className={`holo-table-container ${className}`}>
      <table className="holo-table">
        {/* ヘッダー */}
        <thead className="holo-header">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`
                  px-8 py-6 
                  font-display font-black text-xs uppercase tracking-widest
                  text-primary-blue 
                  border-b-2 border-nexus-border
                  relative
                  ${getAlignClass(column.align)}
                `}
                style={{ width: column.width }}
              >
                <span className="relative z-10">
                  {column.label}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        {/* ボディ */}
        <tbody className="holo-body">
          {data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length}
                className="px-8 py-16 text-center"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-nexus-border rounded-nexus flex items-center justify-center">
                    <svg className="w-8 h-8 text-nexus-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-nexus-text-muted font-medium">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`
                  holo-row
                  relative
                  ${onRowClick ? 'cursor-pointer' : ''}
                  group
                `}
                onClick={() => onRowClick?.(row, rowIndex)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`
                      px-8 py-6
                      border-b border-gray-200
                      vertical-align-middle
                      relative z-10
                      ${getAlignClass(column.align)}
                    `}
                  >
                    {renderCellContent(row[column.key], column, row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}