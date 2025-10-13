'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ProfileMenu from '../ProfileMenu';

// Import normally since both components are client-side
import EnhancedNotificationPanel from '../EnhancedNotificationPanel';

interface SafeNexusHeaderProps {
  userType: 'seller' | 'staff';
  onSearchSubmit?: (query: string) => void;
  onNotificationClick?: () => void;
  onSettingsClick?: () => void;
  onLogout?: () => void;
  currentTime?: {
    utc: string;
    jst: string;
  };
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function SafeNexusHeader({
  userType,
  onSearchSubmit,
  onNotificationClick,
  onSettingsClick,
  onLogout,
  currentTime = { utc: '14:23', jst: '23:23' },
  onMobileMenuToggle,
  isMobileMenuOpen = false
}: SafeNexusHeaderProps) {

  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const notificationRef = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();

  // クライアントサイドのみで実行
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 通知数を取得 - クライアントサイドのみ
  useEffect(() => {
    if (!isClient || !userType) return;

    let isMounted = true;
    let interval: NodeJS.Timeout;

    const fetchNotificationCount = async () => {
      try {
        const endpoint = userType === 'staff' ? '/api/notifications/test' : `/api/notifications?role=${userType}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(endpoint, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (isMounted && Array.isArray(data)) {
          const unreadCount = data.filter((n: any) => !n.read).length;
          setNotificationCount(unreadCount);
          console.log('[DEBUG] 通知数更新:', unreadCount, '件 (エンドポイント:', endpoint, ')');
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch notification count:', error);
          setNotificationCount(0);
        }
      }
    };

    fetchNotificationCount();
    interval = setInterval(fetchNotificationCount, 60000);

    return () => {
      isMounted = false;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [userType, isClient]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSubmit) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  // ユーザータイプ切り替え
  const handleUserTypeSwitch = () => {
    const targetPath = userType === 'staff' ? '/dashboard' : '/staff/dashboard';
    router.push(targetPath);
  };

  // 外部クリックでメニューを閉じる
  useEffect(() => {
    if (!isClient) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isClient]);

  // SSR時は最小限のヘッダーを表示
  if (!isClient) {
    return (
      <header className="bg-gradient-to-r from-primary-blue via-blue-600 to-blue-800 text-white shadow-xl border-b border-blue-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">THE WORLD DOOR</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-white/80">Loading...</div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="nexus-header flex items-center justify-between relative overflow-hidden">
      {/* 背景シャインエフェクト */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 z-10">
        {/* モバイルハンバーガーメニューボタン */}
        <button
          id="mobile-menu-button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 text-white hover:bg-white/20 rounded-lg transition-all duration-200 flex-shrink-0"
          aria-label="メニューを開く"
          aria-expanded={isMobileMenuOpen}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        
        {/* ブランドロゴ（モバイルで表示） */}
        <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
          <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center text-white font-bold text-xs">
            W
          </div>
          <span className="hidden sm:block text-white font-bold text-sm">WORLD DOOR</span>
        </div>
        
        {/* 検索バー - レスポンシブ対応 - 非表示化 */}
        <div className="hidden flex-1 max-w-sm sm:max-w-md lg:max-w-xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="商品名・SKU・バーコードで検索..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 text-sm"
            />
            <button
              type="submit"
              className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2 md:gap-3 z-10 flex-shrink-0">
        {/* 日本時間表示 - レスポンシブ対応 */}
        <div className="hidden lg:block bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg px-3 py-1.5 text-white">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="font-mono text-sm font-semibold">{currentTime.jst}</div>
              <div className="text-[10px] opacity-80">日本時間</div>
            </div>
          </div>
        </div>
        
        {/* コンパクト時間表示（タブレット用） */}
        <div className="hidden md:block lg:hidden bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg px-2 py-1 text-white">
          <div className="font-mono text-xs font-semibold">{currentTime.jst}</div>
        </div>
        
        {/* 通知ボタン - レスポンシブ対応 */}
        <button
          ref={notificationRef}
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          className="relative p-1.5 sm:p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-200"
          aria-label="通知"
          data-testid="notification-bell"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {notificationCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-red-500 text-white text-[9px] sm:text-[11px] font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse"
              data-testid="notification-badge"
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>
        
        {/* ユーザータイプ切り替えボタン - テスト用のため非表示 */}
        <button
          onClick={handleUserTypeSwitch}
          className="hidden"
          title={`${userType === 'staff' ? 'セラー' : 'スタッフ'}画面に切り替え`}
        >
          <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span className="text-white text-sm">
            {userType === 'staff' ? 'セラー' : 'スタッフ'}
          </span>
        </button>

        {/* ユーザープロファイル - レスポンシブ対応 */}
        <button 
          ref={profileRef as any}
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-white/20 transition-all duration-200"
        >
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm text-white border border-white/30">
            {userType === 'staff' ? 'S' : 'U'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-white font-semibold text-sm">
              {userType === 'staff' ? 'スタッフ' : 'セラー'}
            </div>
          </div>
          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {/* 通知パネル - 条件付きで表示 */}
      {isNotificationOpen && notificationRef.current && (
        <EnhancedNotificationPanel
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          userType={userType}
          anchorRef={notificationRef}
          onNotificationUpdate={(unreadCount) => {
            setNotificationCount(unreadCount);
          }}
        />
      )}
      
      {/* プロフィールメニュー */}
      {isProfileOpen && (
        <ProfileMenu
          userType={userType}
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          anchorRef={profileRef}
        />
      )}
    </header>
  );
}