'use client';

import React from 'react';

type RegionColor = 'americas' | 'europe' | 'asia' | 'africa' | 'oceania' | 'global' | 'default';

interface ContentCardProps {
  title?: string;
  subtitle?: string;
  region?: RegionColor;
  children: React.ReactNode;
  className?: string;
  padding?: 'small' | 'medium' | 'large';
}

export default function ContentCard({ 
  title, 
  subtitle,
  region = 'default',
  children,
  className = '',
  padding = 'medium'
}: ContentCardProps) {
  const paddingClasses = {
    small: 'nexus-card-padding-small',
    medium: 'nexus-card-padding-medium',
    large: 'nexus-card-padding-large'
  };

  return (
    <div className={`nexus-content-card nexus-region-${region} ${paddingClasses[padding]} ${className}`}>
      {(title || subtitle) && (
        <div className="nexus-card-header">
          {title && <h2 className="nexus-card-title">{title}</h2>}
          {subtitle && <p className="nexus-card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="nexus-card-body">
        {children}
      </div>

      <style jsx>{`
        .nexus-content-card {
          background: rgba(255, 255, 255, 0.97);
          backdrop-filter: blur(25px) saturate(180%);
          border-radius: 24px;
          border: 3px solid rgba(0, 100, 210, 0.25);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.06),
            inset 0 0 0 1px rgba(255, 255, 255, 0.5);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .nexus-content-card:hover {
          transform: translateY(-4px);
          box-shadow: 
            0 16px 48px rgba(0, 0, 0, 0.12),
            inset 0 0 0 1px rgba(255, 255, 255, 0.5);
        }

        /* パディングサイズ - 全サイズで32px統一 */
        .nexus-card-padding-small {
          padding: 2rem;
        }

        .nexus-card-padding-medium {
          padding: 2rem;
        }

        .nexus-card-padding-large {
          padding: 2rem;
        }

        /* 地域別カラーリング */
        .nexus-region-americas {
          border-color: rgba(0, 100, 210, 0.35);
        }

        .nexus-region-americas::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 8px;
          background: linear-gradient(90deg, #0064D2 0%, #0078FF 100%);
        }

        .nexus-region-europe {
          border-color: rgba(229, 50, 56, 0.35);
        }

        .nexus-region-europe::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 8px;
          background: linear-gradient(90deg, #E53238 0%, #FF5252 100%);
        }

        .nexus-region-asia {
          border-color: rgba(255, 206, 0, 0.35);
        }

        .nexus-region-asia::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 8px;
          background: linear-gradient(90deg, #FFCE00 0%, #FFE066 100%);
        }

        .nexus-region-africa {
          border-color: rgba(134, 184, 23, 0.35);
        }

        .nexus-region-africa::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 8px;
          background: linear-gradient(90deg, #86B817 0%, #9CCC65 100%);
        }

        .nexus-region-oceania {
          border-color: rgba(0, 188, 212, 0.35);
        }

        .nexus-region-oceania::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 8px;
          background: linear-gradient(90deg, #00BCD4 0%, #4DD0E1 100%);
        }

        .nexus-region-global {
          border-color: rgba(123, 31, 162, 0.35);
        }

        .nexus-region-global::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 8px;
          background: linear-gradient(90deg, #7B1FA2 0%, #9C27B0 100%);
        }

        .nexus-region-default {
          border-color: rgba(0, 100, 210, 0.25);
        }

        /* カードヘッダー */
        .nexus-card-header {
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(0, 100, 210, 0.1);
        }

        .nexus-card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1A1A1A;
          margin: 0;
          font-family: 'Orbitron', 'Noto Sans JP', sans-serif;
          letter-spacing: -0.01em;
        }

        .nexus-card-subtitle {
          margin-top: 0.5rem;
          color: #666666;
          font-size: 0.875rem;
          font-family: 'Noto Sans JP', sans-serif;
        }

        /* カードボディ */
        .nexus-card-body {
          color: #1A1A1A;
          font-family: 'Noto Sans JP', sans-serif;
        }

        /* レスポンシブ対応 - モバイルでも32px統一 */
        @media (max-width: 768px) {
          .nexus-card-padding-small {
            padding: 2rem;
          }

          .nexus-card-padding-medium {
            padding: 2rem;
          }

          .nexus-card-padding-large {
            padding: 2rem;
          }

          .nexus-card-title {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
} 