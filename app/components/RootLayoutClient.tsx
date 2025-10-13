'use client';

import { useEffect } from 'react';

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  useEffect(() => {
    // アプリケーション全体でのunhandled promise rejectionを監視
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Chrome拡張機能関連のエラーを無視
      if (event.reason instanceof Error) {
        const error = event.reason;
        if (error.message.includes('message port closed') || 
            error.message.includes('Extension context invalidated') ||
            error.stack?.includes('content.js') ||
            error.stack?.includes('chrome-extension://')) {
          // Chrome拡張機能関連のエラーは無視
          event.preventDefault();
          return;
        }
        
        // ログイン関連のエラーの場合は詳細をログ出力
        if (error.message.includes('login') || error.message.includes('ログイン') || error.message.includes('auth')) {
          console.error('[ROOT LAYOUT] ログイン関連エラー詳細:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
        }
      }
      
      console.error('[ROOT LAYOUT] Unhandled promise rejection:', event.reason);
      
      // エラーイベントを防止（コンソールの "Uncaught (in promise)" エラーを抑制）
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      console.error('[ROOT LAYOUT] Global error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    };

    // イベントリスナーを登録
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // クリーンアップ
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);
  return (
    <div className="app-container">
      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-blue text-white px-4 py-2 rounded-md z-50">
        メインコンテンツへスキップ
      </a>
      
      {/* Nexus Header */}
      <header className="nexus-header" role="banner">
        <div className="brand-nexus">
          <div className="brand-identity">
            <h1 className="brand-title">THE WORLD DOOR</h1>
            <p className="brand-tagline">フルフィルメントサービス</p>
          </div>
          <nav className="nexus-nav ml-auto mr-8" role="navigation" aria-label="メインナビゲーション">
            <a href="/dashboard" className="nav-pill active">ダッシュボード</a>
            <a href="/inventory" className="nav-pill">在庫管理</a>
            <a href="/timeline" className="nav-pill">タイムライン</a>
            <a href="/reports" className="nav-pill">レポート</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="timezone-widget" aria-label="タイムゾーン情報">
            <div>東京</div>
            <div className="text-xs opacity-80">GMT+9</div>
          </div>
          <button className="user-nexus" aria-label="ユーザーメニュー" aria-expanded="false">
            <div className="user-orb" aria-hidden="true">WD</div>
            <div className="text-left">
              {/* Phase1: 管理者テキストを非表示 */}
              {/* <div className="font-semibold">管理者</div> */}
              <div className="text-xs opacity-80">THE WORLD DOOR</div>
            </div>
          </button>
        </div>
      </header>
      
      {/* Main Content with proper scroll container */}
      <main id="main-content" className="nexus-display" role="main">
        <div className="page-scroll-container">
          {children}
          {/* Scroll anchor for ensuring scrollability */}
          <div className="scroll-anchor" aria-hidden="true"></div>
        </div>
      </main>
      
      {/* Intel Panel - Hidden on mobile */}
      <aside className="intel-panel hidden xl:block" role="complementary" aria-label="インテリジェンスパネル">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">市場インテリジェンス</h2>
          <div className="space-y-4">
            <div className="intelligence-card americas">
              <div className="card-header">
                <div className="region-info">
                  <span className="region-flag">🌎</span>
                  <span className="region-title">北米市場</span>
                </div>
                <span className="status-orb status-optimal">最適</span>
              </div>
              <div className="intelligence-metrics">
                <div className="intel-metric">
                  <span className="metric-name">成長率</span>
                  <span className="metric-data trend-up">+18.5%</span>
                </div>
                <div className="intel-metric">
                  <span className="metric-name">シェア</span>
                  <span className="metric-data trend-neutral">34.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
} 