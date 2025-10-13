'use client';

import NexusLoadingSpinner from '@/app/components/ui/NexusLoadingSpinner';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nexus-background via-blue-50 to-blue-100">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        
        {/* メインスピナー */}
        <NexusLoadingSpinner 
          size="lg" 
          variant="primary" 
          text="データを読み込み中..."
          className="scale-150"
        />
        
        {/* サブテキスト */}
        <p className="text-gray-600 text-sm mt-2">
          THE WORLD DOORシステムに接続しています
        </p>
        
      </div>
    </div>
  );
} 