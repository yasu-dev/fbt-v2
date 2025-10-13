'use client';

import React from 'react';
import { ReactNode } from 'react';

type RegionType = 'americas' | 'europe' | 'asia' | 'africa' | 'oceania' | 'global';

interface NexusCardProps {
  children: ReactNode;
  region?: RegionType;
  title?: string;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
  gradient?: boolean;
}

export default function NexusCard({
  children,
  region = 'americas',
  title,
  subtitle,
  onClick,
  className = '',
  gradient = true
}: NexusCardProps) {
  
  const baseClasses = `
    bg-white
    border border-nexus-border
    rounded-xl
    shadow-sm
    transition-all duration-200 ease-out
  `;

  // 統一されたカードスタイル（地域別カラーリングは使用しない）
  const regionClasses = {
    americas: '',
    europe: '', 
    asia: '',
    africa: '',
    oceania: '',
    global: ''
  };

  const combinedClasses = `
    ${baseClasses}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={combinedClasses} onClick={onClick}>
      {/* ヘッダー部分 */}
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-bold text-nexus-text-primary mb-2">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-nexus-text-secondary">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* メインコンテンツ */}
      <div>
        {children}
      </div>
    </div>
  );
}