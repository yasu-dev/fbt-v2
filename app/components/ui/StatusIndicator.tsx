'use client';

import React from 'react';

type StatusType = 'optimal' | 'warning' | 'critical';

// 業務ステータス用の型定義
type BusinessStatusType = 
  | 'inbound' | 'inspection' | 'storage' | 'listing' | 'sold'
  | 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'confirmed'
  | 'processing' | 'delivered' | 'returned'
  | 'packed' | 'shipped' | 'ready_for_pickup'
  | 'approved' | 'rejected' | 'refunded'
  | 'ordered' | 'shipping'
  | 'on_hold' | 'workstation';

interface StatusIndicatorProps {
  status: StatusType;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

interface BusinessStatusIndicatorProps {
  status: BusinessStatusType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

// 業務ステータス設定 - 目に優しく見分けやすい配色（同色回避・アクション重要度別配色）
const businessStatusConfig = {
  // 【アクション重要度：高】- 目立つ暖色系（赤・オレンジ）
  sold: {
    label: '購入者決定',
    bg: 'bg-red-500 dark:bg-red-500',    // 最重要アクション - 適度な赤
    text: 'text-white dark:text-white',
    border: 'border-red-500 dark:border-red-500'
  },
  ordered: {
    label: '出荷準備中',
    bg: 'bg-orange-500 dark:bg-orange-500',
    text: 'text-white dark:text-white',
    border: 'border-orange-500 dark:border-orange-500'
  },
  processing: {
    label: '出荷準備中',
    bg: 'bg-amber-600 dark:bg-amber-600',  // オレンジ系から琥珀系に分離
    text: 'text-white dark:text-white',
    border: 'border-amber-600 dark:border-amber-600'
  },

  // 【注意喚起】- 黄・琥珀系
  on_hold: {
    label: '保留中',
    bg: 'bg-yellow-600 dark:bg-yellow-600',    // 濃い黄色で白テキストが見やすく
    text: 'text-white dark:text-white',
    border: 'border-yellow-600 dark:border-yellow-600'
  },
  returned: {
    label: '返品',
    bg: 'bg-amber-500 dark:bg-amber-500',  // 琥珀色で区別
    text: 'text-white dark:text-white',
    border: 'border-amber-500 dark:border-amber-500'
  },
  in_progress: {
    label: '梱包待ち',
    bg: 'bg-orange-400 dark:bg-orange-400',  // 薄めのオレンジ
    text: 'text-white dark:text-white',
    border: 'border-orange-400 dark:border-orange-400'
  },

  // 【進行中】- 青・紫系
  packed: {
    label: '梱包済み',
    bg: 'bg-blue-500 dark:bg-blue-500',
    text: 'text-white dark:text-white',
    border: 'border-blue-500 dark:border-blue-500'
  },
  pending: {
    label: '梱包待ち',
    bg: 'bg-purple-500 dark:bg-purple-500',  // 紫でタブと統一
    text: 'text-white dark:text-white',
    border: 'border-purple-500 dark:border-purple-500'
  },

  // 【完了系】- 緑系（明度・彩度で区別）
  shipping: {
    label: '出荷済み',
    bg: 'bg-green-500 dark:bg-green-500',    // 標準緑
    text: 'text-white dark:text-white',
    border: 'border-green-500 dark:border-green-500'
  },
  shipped: {
    label: '出荷済み',
    bg: 'bg-lime-600 dark:bg-lime-600',    // ライム系で区別
    text: 'text-white dark:text-white',
    border: 'border-lime-600 dark:border-lime-600'
  },
  delivered: {
    label: '配送完了',
    bg: 'bg-emerald-500 dark:bg-emerald-500', // エメラルド
    text: 'text-white dark:text-white',
    border: 'border-emerald-500 dark:border-emerald-500'
  },
  confirmed: {
    label: '受注確定',
    bg: 'bg-green-600 dark:bg-green-600',    // 濃い緑
    text: 'text-white dark:text-white',
    border: 'border-green-600 dark:border-green-600'
  },
  completed: {
    label: '梱包完了',
    bg: 'bg-emerald-600 dark:bg-emerald-600',
    text: 'text-white dark:text-white',
    border: 'border-emerald-600 dark:border-emerald-600'
  },
  approved: {
    label: '承認済み',
    bg: 'bg-teal-500 dark:bg-teal-500', // ティール系で明確に区別
    text: 'text-white dark:text-white',
    border: 'border-teal-500 dark:border-teal-500'
  },

  // 【待機・保管系】- シアン・冷色系（色相で区別）
  inbound: {
    label: '入庫待ち',
    bg: 'bg-cyan-500 dark:bg-cyan-500',
    text: 'text-white dark:text-white',
    border: 'border-cyan-500 dark:border-cyan-500'
  },
  storage: {
    label: '保管中',
    bg: 'bg-teal-600 dark:bg-teal-600',    // 濃いティール
    text: 'text-white dark:text-white',
    border: 'border-teal-600 dark:border-teal-600'
  },
  listing: {
    label: '出品中',
    bg: 'bg-sky-500 dark:bg-sky-500',      // スカイブルー
    text: 'text-white dark:text-white',
    border: 'border-sky-500 dark:border-sky-500'
  },
  inspection: {
    label: '保管作業中',
    bg: 'bg-cyan-600 dark:bg-cyan-600',    // 濃いシアン
    text: 'text-white dark:text-white',
    border: 'border-cyan-600 dark:border-cyan-600'
  },
  workstation: {
    label: '出荷準備中',
    bg: 'bg-orange-600 dark:bg-orange-600',  // 他と区別するため濃いオレンジ
    text: 'text-white dark:text-white',
    border: 'border-orange-600 dark:border-orange-600'
  },
  ready_for_pickup: {
    label: '配送完了',
    bg: 'bg-emerald-500 dark:bg-emerald-500', // エメラルドでタブと統一
    text: 'text-white dark:text-white',
    border: 'border-emerald-500 dark:border-emerald-500'
  },

  // 【エラー・拒否系】- 赤系（明度で区別）
  cancelled: {
    label: 'キャンセル',
    bg: 'bg-red-600 dark:bg-red-600',        // 濃い赤
    text: 'text-white dark:text-white',
    border: 'border-red-600 dark:border-red-600'
  },
  rejected: {
    label: '不合格',
    bg: 'bg-rose-500 dark:bg-rose-500',      // ローズ系で区別
    text: 'text-white dark:text-white',
    border: 'border-rose-500 dark:border-rose-500'
  },

  // 【その他】- グレー系
  refunded: {
    label: '返金済み',
    bg: 'bg-slate-500 dark:bg-slate-500',    // 明るめのスレート
    text: 'text-white dark:text-white',
    border: 'border-slate-500 dark:border-slate-500'
  }
};

// インジケーター色を取得するヘルパー関数 - 目に優しい配色版
function getIndicatorColor(status: BusinessStatusType): string {
  const colorMap: Record<BusinessStatusType, string> = {
    // 【アクション重要度：高】- 目立つ暖色（薄め）
    sold: 'bg-red-300',
    ordered: 'bg-orange-300',
    processing: 'bg-amber-300',

    // 【注意喚起】- 黄・琥珀系（薄め）
    on_hold: 'bg-yellow-300',
    returned: 'bg-amber-300',
    in_progress: 'bg-orange-200',

    // 【進行中】- 青・紫系
    packed: 'bg-blue-300',
    pending: 'bg-purple-200',

    // 【完了系】- 緑系（色相で区別）
    shipping: 'bg-green-300',
    shipped: 'bg-lime-300',
    delivered: 'bg-emerald-300',
    confirmed: 'bg-green-400',
    completed: 'bg-emerald-400',
    approved: 'bg-teal-300',

    // 【待機・保管系】- シアン・冷色系（色相で区別）
    inbound: 'bg-cyan-300',
    storage: 'bg-teal-400',
    listing: 'bg-sky-300',
    inspection: 'bg-cyan-400',
    workstation: 'bg-orange-400',
    ready_for_pickup: 'bg-indigo-300',

    // 【エラー・拒否系】- 赤系（色相で区別）
    cancelled: 'bg-red-400',
    rejected: 'bg-rose-300',

    // 【その他】- グレー系
    refunded: 'bg-slate-300'
  };

  return colorMap[status] || 'bg-gray-300';
}

export default function StatusIndicator({
  status,
  label,
  size = 'md',
  showLabel = true,
  className = ''
}: StatusIndicatorProps) {

  const statusConfig = {
    optimal: {
      color: 'bg-nexus-green',
      glow: 'shadow-[0_0_20px_rgba(134,184,23,0.7)]',
      textColor: 'text-nexus-green',
      ring: 'ring-nexus-green/30'
    },
    warning: {
      color: 'bg-nexus-yellow', 
      glow: 'shadow-[0_0_20px_rgba(255,206,0,0.7)]',
      textColor: 'text-nexus-yellow',
      ring: 'ring-nexus-yellow/30'
    },
    critical: {
      color: 'bg-nexus-red',
      glow: 'shadow-[0_0_20px_rgba(229,50,56,0.7)]', 
      textColor: 'text-nexus-red',
      ring: 'ring-nexus-red/30'
    },
    normal: {
      color: 'bg-gray-500',
      glow: 'shadow-[0_0_20px_rgba(107,114,128,0.7)]',
      textColor: 'text-gray-500',
      ring: 'ring-gray-500/30'
    }
  };

  const sizeConfig = {
    sm: {
      indicator: 'w-3 h-3',
      text: 'text-xs',
      gap: 'gap-2'
    },
    md: {
      indicator: 'w-4 h-4',
      text: 'text-sm',
      gap: 'gap-3'
    },
    lg: {
      indicator: 'w-5 h-5', 
      text: 'text-base',
      gap: 'gap-4'
    }
  };

  const config = statusConfig[status] || statusConfig.normal;
  const sizing = sizeConfig[size] || sizeConfig.md;

  return (
    <div className={`
      status-nexus
      inline-flex items-center 
      ${sizing.gap}
      ${className}
    `}>
      {/* ステータスインジケーター */}
      <div className={`
        nexus-indicator
        ${sizing.indicator}
        ${config.color}
        ${config.glow}
        rounded-full
        relative
        ring-4 ${config.ring}
        transition-all duration-300
      `}>
        {/* 内部グロー */}
        <div className={`
          absolute inset-0.5
          ${config.color}
          rounded-full
          opacity-60
        `} />
        
        {/* 中心ポイント */}
        <div className={`
          absolute inset-1
          bg-white
          rounded-full
          opacity-80
        `} />
      </div>

      {/* ラベル */}
      {showLabel && (
        <span className={`
          font-bold
          ${sizing.text}
          ${config.textColor}
          tracking-wide
        `}>
          {label}
        </span>
      )}
    </div>
  );
}

// 業務ステータス表示コンポーネント
export function BusinessStatusIndicator({
  status,
  size = 'md',
  showLabel = true,
  className = ''
}: BusinessStatusIndicatorProps) {
  const config = businessStatusConfig[status] || {
    label: '不明',
    bg: 'bg-gray-800 dark:bg-gray-800',
    text: 'text-white dark:text-white',
    border: 'border-gray-800 dark:border-gray-800'
  };
  
  if (!status) {
    console.warn(`Status is undefined in BusinessStatusIndicator`);
    return <span className="status-badge neutral">不明</span>;
  }
  
  // 未定義のステータスが来た場合の警告ログ
  if (!businessStatusConfig[status]) {
    console.warn(`Undefined status in BusinessStatusIndicator: "${status}"`);
  }

  const sizeConfig = {
    sm: { padding: 'px-2 py-1', text: 'text-xs', indicator: 'w-1.5 h-1.5' },
    md: { padding: 'px-3 py-1.5', text: 'text-xs', indicator: 'w-2 h-2' },
    lg: { padding: 'px-4 py-2', text: 'text-sm', indicator: 'w-2.5 h-2.5' }
  };

  const sizing = sizeConfig[size];

  return (
    <span
      className={`
        inline-flex items-center gap-2
        ${sizing.padding}
        ${sizing.text}
        font-black font-display
        rounded-lg
        border-2
        uppercase
        tracking-widest
        transition-all duration-300
        whitespace-nowrap
        hover:scale-105
        ${config.bg}
        ${config.text}
        ${config.border}
        ${className}
      `}
    >
      {/* ステータスインジケーター - 非表示 */}
      {/* <div className={`
        ${sizing.indicator}
        rounded-full
        flex-shrink-0
        ${getIndicatorColor(status)}
      `} /> */}
      
      {showLabel ? config.label : ''}
    </span>
  );
}