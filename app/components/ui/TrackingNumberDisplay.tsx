'use client';

import React from 'react';
import { 
  ClipboardDocumentIcon,
  ArrowTopRightOnSquareIcon 
} from '@heroicons/react/24/outline';
import { generateTrackingUrl, formatTrackingNumber, normalizeCarrierName, isValidTrackingNumber } from '@/lib/utils/tracking';
import { useToast } from '../features/notifications/ToastProvider';

interface TrackingNumberDisplayProps {
  trackingNumber: string;
  carrier?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCopyButton?: boolean;
  showTrackingButton?: boolean;
  showCarrierName?: boolean;
  displayFormat?: 'full' | 'short' | 'minimal';
}

export default function TrackingNumberDisplay({
  trackingNumber,
  carrier = '',
  className = '',
  size = 'md',
  showCopyButton = true,
  showTrackingButton = true,
  showCarrierName = false,
  displayFormat = 'full'
}: TrackingNumberDisplayProps) {
  const { showToast } = useToast();

  if (!trackingNumber) {
    return null;
  }

  const formattedNumber = formatTrackingNumber(trackingNumber, carrier);
  const trackingUrl = generateTrackingUrl(carrier, trackingNumber);
  const carrierName = normalizeCarrierName(carrier);
  const isValid = isValidTrackingNumber(trackingNumber, carrier);

  // サイズ設定
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  // 表示形式に応じて追跡番号を調整
  const displayNumber = displayFormat === 'short' && trackingNumber.length > 8 
    ? `${trackingNumber.slice(0, 4)}...${trackingNumber.slice(-4)}`
    : displayFormat === 'minimal' && trackingNumber.length > 6
    ? `...${trackingNumber.slice(-6)}`
    : formattedNumber;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trackingNumber);
      showToast({
        title: 'コピー完了',
        message: `追跡番号をクリップボードにコピーしました`,
        type: 'success'
      });
    } catch (error) {
      showToast({
        title: 'コピー失敗',
        message: 'クリップボードへのコピーに失敗しました',
        type: 'error'
      });
    }
  };

  const handleTrackingClick = () => {
    if (trackingUrl && trackingUrl !== '#') {
      window.open(trackingUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // フルバージョン（詳細表示）
  if (displayFormat === 'full') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex flex-col gap-1">
          {showCarrierName && carrier && (
            <div className="text-xs text-nexus-text-secondary">
              {carrierName}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className={`font-mono bg-nexus-bg-tertiary border rounded ${sizeClasses[size]} ${
              isValid ? 'text-nexus-text-primary' : 'text-nexus-text-secondary'
            }`}>
              {displayNumber}
            </span>
            <div className="flex items-center gap-1">
              {showCopyButton && (
                <button
                  onClick={handleCopy}
                  className="p-1 text-nexus-text-secondary hover:text-nexus-primary hover:bg-nexus-bg-secondary rounded transition-colors"
                  title="クリップボードにコピー"
                >
                  <ClipboardDocumentIcon className={iconSizeClasses[size]} />
                </button>
              )}
              {showTrackingButton && trackingUrl !== '#' && (
                <button
                  onClick={handleTrackingClick}
                  className="p-1 text-nexus-text-secondary hover:text-nexus-primary hover:bg-nexus-bg-secondary rounded transition-colors"
                  title={`${carrierName}で追跡`}
                >
                  <ArrowTopRightOnSquareIcon className={iconSizeClasses[size]} />
                </button>
              )}
            </div>
          </div>
        </div>
        <span className="text-xs bg-nexus-success text-white px-2 py-1 rounded">
          eBay通知済み
        </span>
      </div>
    );
  }

  // コンパクトバージョン（テーブル内など）
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <span 
          className={`font-mono bg-nexus-bg-tertiary border rounded cursor-pointer hover:bg-nexus-bg-secondary transition-colors ${sizeClasses[size]} ${
            isValid ? 'text-nexus-text-primary' : 'text-nexus-text-secondary'
          }`}
          onClick={handleCopy}
          title="クリップボードにコピー"
        >
          {displayNumber}
        </span>
        {showTrackingButton && trackingUrl !== '#' && (
          <button
            onClick={handleTrackingClick}
            className={`px-2 py-1 bg-nexus-primary text-white rounded hover:bg-nexus-primary-dark transition-colors ${
              size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
            }`}
            title={`${carrierName}で配送状況を確認`}
          >
            追跡確認
          </button>
        )}
      </div>
      {displayFormat !== 'minimal' && (
        <span className="text-xs text-nexus-success">
          eBay通知済み
        </span>
      )}
    </div>
  );
}

// 高度なトラッキング表示コンポーネント（追跡状態付き）
interface AdvancedTrackingDisplayProps extends TrackingNumberDisplayProps {
  orderStatus?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export function AdvancedTrackingDisplay({
  trackingNumber,
  carrier = '',
  orderStatus = '',
  shippedAt,
  deliveredAt,
  className = '',
  ...props
}: AdvancedTrackingDisplayProps) {
  if (!trackingNumber) {
    return null;
  }

  const trackingUrl = generateTrackingUrl(carrier, trackingNumber);
  const carrierName = normalizeCarrierName(carrier);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-nexus-text-secondary">追跡番号:</span>
          <TrackingNumberDisplay
            trackingNumber={trackingNumber}
            carrier={carrier}
            displayFormat="full"
            {...props}
          />
        </div>
      </div>
      
      {/* 配送状況 */}
      <div className="text-sm space-y-1">
        {shippedAt && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-nexus-primary rounded-full"></span>
            <span>発送済み: {new Date(shippedAt).toLocaleDateString('ja-JP')}</span>
          </div>
        )}
        {deliveredAt && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-nexus-success rounded-full"></span>
            <span>到着済み: {new Date(deliveredAt).toLocaleDateString('ja-JP')}</span>
          </div>
        )}
        {!deliveredAt && shippedAt && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-nexus-warning rounded-full animate-pulse"></span>
            <span>配送中</span>
          </div>
        )}
      </div>

      {/* 追跡リンクボタン */}
      {trackingUrl !== '#' && (
        <button
          onClick={() => window.open(trackingUrl, '_blank', 'noopener,noreferrer')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-nexus-primary text-white rounded hover:bg-nexus-primary-dark transition-colors"
        >
          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          {carrierName}サイトで配送状況を確認
        </button>
      )}
    </div>
  );
}
