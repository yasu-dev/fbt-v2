/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // CSS変数を参照（統一性を保つ）
        'primary-blue': 'var(--primary-blue)',
        'primary-blue-light': 'var(--primary-blue-light)', 
        'primary-blue-lighter': 'var(--primary-blue-lighter)',
        'nexus-yellow': 'var(--nexus-yellow)',
        'nexus-red': 'var(--nexus-red)',
        'nexus-green': 'var(--nexus-green)',
        'nexus-purple': 'var(--nexus-purple)',
        'nexus-cyan': 'var(--nexus-cyan)',
        'nexus-background': 'var(--background)',
        'nexus-surface': 'var(--surface)',
        'nexus-bg-primary': 'var(--background)',
        'nexus-bg-secondary': 'var(--nexus-bg-secondary)',
        'nexus-bg-tertiary': 'var(--nexus-bg-tertiary)',
        'nexus-text-primary': 'var(--nexus-text-primary)',
        'nexus-text-secondary': 'var(--nexus-text-secondary)',
        'nexus-text-muted': 'var(--nexus-text-muted)',
        'nexus-border': 'var(--nexus-border)',
        
        // 地域別カラーリング (6地域システム)
        'region-americas': 'rgba(0, 100, 210, 0.35)',
        'region-europe': 'rgba(229, 50, 56, 0.35)', 
        'region-asia': 'rgba(255, 206, 0, 0.35)',
        'region-africa': 'rgba(134, 184, 23, 0.35)',
        'region-oceania': 'rgba(0, 188, 212, 0.35)',
        'region-global': 'rgba(0, 100, 210, 0.35)',
        
        // レガシー互換性
        primary: {
          500: '#0064D2',
          600: '#0052AA',
          700: '#004288',
        },
        purple: {
          500: '#7B1FA2',
          600: '#6a1b92',
        },
        red: {
          500: '#E53238',
          600: '#D12B31',
        },
        green: {
          500: '#86B817',
          600: '#74A015',
        },
        yellow: {
          500: '#FFCE00',
          600: '#E6B900',
        },
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'Inter', '-apple-system', 'system-ui', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'],
        mono: ['Orbitron', 'monospace'],
        primary: ['Noto Sans JP', 'Inter', '-apple-system', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.6875rem',  // 11px - ラベル、バッジ
        'sm': '0.75rem',    // 12px - 補助テキスト
        'base': '0.8125rem', // 13px - 標準テキスト
        'lg': '0.875rem',   // 14px - メニュー、ボタン
        'xl': '0.9375rem',  // 15px - 見出し
        '2xl': '1rem',      // 16px - 大見出し
        '3xl': '1.125rem',  // 18px - タイトル
        '4xl': '1.25rem',   // 20px - 大タイトル
      },
      // ホバーエフェクトのみ許可（@keyframes禁止準拠）
      transitionProperty: {
        'nexus': 'all',
        'nexus-hover': 'transform, background-color, border-color, opacity, box-shadow',
      },
      transitionDuration: {
        'nexus': '300ms',
      },
      transitionTimingFunction: {
        'nexus': 'ease',
      },
      screens: {
        'xs': '475px',
        'sm': '640px', 
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1400px', // 指示書のブレークポイント
        '3xl': '1600px', // 指示書のブレークポイント
        '4xl': '1920px',
      },
      spacing: {
        // 4px基準のスペーシングシステム
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px  
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '5': '1.25rem',   // 20px
        '6': '1.5rem',    // 24px
        '8': '2rem',      // 32px
        '10': '2.5rem',   // 40px
        '12': '3rem',     // 48px
        // カスタムスペーシング
        '18': '4.5rem',   // ブランドロゴサイズ用
        '21': '5.25rem',  // 各種コンポーネント用
        '85': '21.25rem', // ヘッダー高さ (85px)
        '340': '85rem',   // サイドバー幅 (340px)
      },
      borderRadius: {
        'nexus': '14px', // ボタン用
        'nexus-lg': '18px', // ロゴ用  
        'nexus-xl': '24px', // カード/テーブル用
      },
      boxShadow: {
        'nexus-header': '0 8px 32px rgba(0, 100, 210, 0.4)',
        'nexus-logo': '0 0 30px rgba(255, 206, 0, 0.8)',
        'nexus-card': '0 4px 25px rgba(0, 100, 210, 0.15)',
        'nexus-button': '0 4px 15px rgba(0, 100, 210, 0.3)',
        'nexus-button-hover': '0 6px 20px rgba(0, 100, 210, 0.4)',
      },
      backdropBlur: {
        'nexus': '25px',
      },
      backdropSaturate: {
        'nexus': '180%',
      },
    },
  },
  plugins: [],
}