import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from '@/app/components/features/notifications/ToastProvider';
import { ModalProvider } from '@/app/components/ui/ModalContext';
import AlertProvider from '@/app/components/ui/AlertProvider';

// データベース初期化は無効化（テスト用）
// if (typeof window === 'undefined' && process.env.SKIP_DB !== '1') {
//   import('@/lib/database').then(({ initializeDatabase }) => {
//     initializeDatabase().catch(() => {
//       // エラーは無視（すでに初期化済みの場合など）
//     });
//   });
// }

export const metadata: Metadata = {
  title: "THE WORLD DOOR - フルフィルメントサービス",
  description: "世界最先端のAI駆動型在庫管理・輸出支援システム。",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.svg',
    other: [
      {
        rel: 'icon',
        url: '/icon.svg',
      },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0064D2',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Noto+Sans+JP:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
        
        {/* Font Awesome */}
        <link 
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body suppressHydrationWarning>
        <AlertProvider>
          <ModalProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ModalProvider>
        </AlertProvider>
        
        {/* Chrome拡張機能エラーハンドリング */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window.addEventListener('unhandledrejection', function(event) {
                  if (event.reason instanceof Error) {
                    const error = event.reason;
                    if (error.message.includes('message port closed') || 
                        error.message.includes('Extension context invalidated') ||
                        (error.stack && error.stack.includes('content.js')) ||
                        (error.stack && error.stack.includes('chrome-extension://'))) {
                      event.preventDefault();
                      return;
                    }
                  }
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}