'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BaseModal from './ui/BaseModal';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

interface ProfileMenuProps {
  userType: 'seller' | 'staff';
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement>;
}

interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar?: string;
  joinDate: string;
  lastLogin: string;
}

export default function ProfileMenu({ userType, isOpen, onClose, anchorRef }: ProfileMenuProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isProfilePage, setIsProfilePage] = useState(false);
  const { showToast } = useToast();

  // 現在のページがプロフィール設定ページかどうかを判定
  useEffect(() => {
    const currentPath = window.location.pathname;
    setIsProfilePage(currentPath === '/profile');
  }, []);

  // ユーザープロフィールデータをAPIから取得（失敗時は非表示）
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/session', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
          setProfile(null);
          return;
        }
        const data = await res.json();
        if (isMounted && data?.success && data?.user) {
          setProfile({
            name: data.user.fullName || data.user.username || data.user.email,
            email: data.user.email,
            role: data.user.role === 'admin' ? '管理者' : (data.user.role === 'staff' ? 'シニアスタッフ' : 'プレミアムセラー'),
            joinDate: new Date().toLocaleDateString('ja-JP'),
            lastLogin: new Date().toLocaleString('ja-JP')
          });
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      }
    };
    if (isOpen) fetchProfile();
    return () => { isMounted = false; };
  }, [isOpen]);

  // メニューの位置を計算
  useEffect(() => {
    if (isOpen && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  }, [isOpen, anchorRef]);

  // 外側をクリックしたときにメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          anchorRef?.current && !anchorRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  const handleLogout = async () => {
    try {
      // APIでサーバー側セッションを無効化
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch {}

      // LocalStorageのクリア
      localStorage.removeItem('userProfile');
      localStorage.removeItem('userSettings');
      localStorage.removeItem('twoFactorAuth');
      localStorage.removeItem('securityLogs');
      localStorage.removeItem('profileLogs');
      
      // セッションクリア
      sessionStorage.clear();
      
      showToast({
        title: 'ログアウト完了',
        message: 'ログアウトしました',
        type: 'success'
      });
      
      // ログインページへリダイレクト
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      showToast({
        title: 'ログアウトエラー',
        message: 'ログアウトに失敗しました',
        type: 'error'
      });
    }
  };

  const handleProfileSettings = () => {
    onClose();
    router.push('/profile');
  };

  const handleAccountSettings = () => {
    onClose();
    router.push('/settings');
  };

  if (!isOpen || !profile) return null;

  return (
    <>
      <div
        ref={menuRef}
        data-testid="profile-menu"
        className="fixed z-[10000] w-72 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
        style={{ top: `${menuPosition.top}px`, right: `${menuPosition.right}px` }}
      >
        {/* ヘッダー */}
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-lg font-bold text-blue-600">
              {isProfilePage ? 'P' : profile.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {isProfilePage ? 'プロフィール設定' : profile.name}
              </h3>
            </div>
          </div>
        </div>

        {/* プロフィール情報 */}
        <div className="p-4 space-y-3">
          <div className="space-y-2 text-xs">
            <div className="flex items-center text-gray-600">
              <svg className="w-3.5 h-3.5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <svg className="w-3.5 h-3.5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>最終ログイン: {profile.lastLogin}</span>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="border-t border-gray-200 pt-3 space-y-1">
            <button
              onClick={handleProfileSettings}
              className="w-full flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded transition-colors"
            >
              <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              プロフィール設定
            </button>
            
            <button
              onClick={handleAccountSettings}
              className="w-full flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded transition-colors"
            >
              <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              アカウント設定
            </button>
            
            {userType === 'seller' && (
              <button
                onClick={() => router.push('/billing')}
                className="w-full flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded transition-colors"
              >
                <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                請求・支払い
              </button>
            )}
            
            <div className="border-t border-gray-200 pt-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* プロフィール設定モーダル */}
      <BaseModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="プロフィール設定"
        size="lg"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
              {profile?.name.charAt(0)}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">名前</label>
              <input
                type="text"
                defaultValue={profile?.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
              <input
                type="email"
                defaultValue={profile?.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">役職</label>
            <input
              type="text"
              defaultValue={profile?.role}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={() => {
                setIsProfileModalOpen(false);
                showToast({
                  type: 'success',
                  title: 'プロフィール更新',
                  message: 'プロフィールを更新しました。'
                });
              }}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </BaseModal>

      {/* アカウント設定モーダル */}
      <BaseModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        title="アカウント設定"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">セキュリティ設定</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">現在のパスワード</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">新しいパスワード</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">パスワード確認</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">通知設定</h3>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span className="text-sm text-gray-700">メール通知を受け取る</span>
              </label>
              
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span className="text-sm text-gray-700">システム通知を受け取る</span>
              </label>
              
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span className="text-sm text-gray-700">マーケティング情報を受け取る</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsAccountModalOpen(false)}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={() => {
                setIsAccountModalOpen(false);
                showToast({
                  type: 'success',
                  title: 'アカウント設定更新',
                  message: 'アカウント設定を更新しました。'
                });
              }}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </BaseModal>
    </>
  );
} 