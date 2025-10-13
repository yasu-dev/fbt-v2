'use client';

import { useEffect } from 'react';
import { NexusButton } from '@/app/components/ui';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('[GLOBAL ERROR] Error caught:', error);
    
    // ページロード時にunhandled promise rejectionのリスナーを設定
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
        
        console.error('[UNHANDLED PROMISE] Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      } else {
        console.error('[UNHANDLED PROMISE] Non-error rejection:', event.reason);
      }
      
      console.error('[UNHANDLED PROMISE] Promise rejected:', event.reason);
      event.preventDefault(); // デフォルトの処理（コンソールエラー出力）を防止
    };

    const handleError = (event: ErrorEvent) => {
      console.error('[GLOBAL ERROR] Error event:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    };

    // リスナーを登録
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      window.addEventListener('error', handleError);
    }

    // クリーンアップ関数
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        window.removeEventListener('error', handleError);
      }
    };
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-nexus-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-nexus-red mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-display font-bold text-nexus-text-primary mb-4">
              システムエラーが発生しました
            </h1>
            <p className="text-nexus-text-secondary mb-2">
              申し訳ございません。予期しないエラーが発生しました。
            </p>
            <p className="text-sm text-nexus-text-muted mb-6">
              エラー詳細: {error.message}
            </p>
            <div className="space-y-3">
              <NexusButton
                onClick={() => reset()}
                variant="primary"
                className="w-full"
              >
                再試行
              </NexusButton>
              <NexusButton
                onClick={() => window.location.href = '/'}
                variant="secondary"
                className="w-full"
              >
                ホームに戻る
              </NexusButton>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 