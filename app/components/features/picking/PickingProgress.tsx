'use client';

import { useState, useEffect } from 'react';
import NexusButton from '@/app/components/ui/NexusButton';
import { getUnifiedIcon } from '@/app/components/ui/icons';

interface PickingProgress {
  id: string;
  orderId: string;
  customerName: string;
  assignedTo: string;
  startedAt: string;
  estimatedCompletionTime: number; // 分
  progress: number; // パーセンテージ
  totalItems: number;
  pickedItems: number;
  currentLocation: string;
}

export default function PickingProgress() {
  const [progressList, setProgressList] = useState<PickingProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchProgress();
    
    if (autoRefresh) {
      const interval = setInterval(fetchProgress, 10000); // 10秒ごとに更新
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchProgress = async () => {
    try {
      // APIから進行中タスクを取得
      const response = await fetch('/api/picking?status=in_progress');
      const result = await response.json();
      
      if (result.success) {
        const tasks = result.data || [];
        
        // PickingProgress形式に変換
        const progressData = tasks.map((task: any) => {
          const progress = task.totalItems > 0 ? Math.round((task.pickedItems / task.totalItems) * 100) : 0;
          const startedAt = task.createdAt || new Date().toISOString();
          const estimatedTime = 15 + Math.floor(Math.random() * 30); // 15-45分のランダム
          
          // ランダムなロケーション
          const locations = ['A-15', 'B-08', 'H2-03', 'C-12', 'D-04', 'E-09', 'F-07'];
          const currentLocation = locations[Math.floor(Math.random() * locations.length)];
          
          return {
            id: task.id,
            orderId: task.orderId,
            customerName: task.customerName,
            assignedTo: task.assignee || 'スタッフ',
            startedAt: startedAt,
            estimatedCompletionTime: estimatedTime,
            progress: progress,
            totalItems: task.totalItems,
            pickedItems: task.pickedItems,
            currentLocation: currentLocation,
          };
        });
        
        setProgressList(progressData);
      } else {
        console.error('Failed to fetch progress data:', result);
        setProgressList([]);
      }
    } catch (error) {
      console.error('[ERROR] Fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateElapsedTime = (startedAt: string) => {
    const start = new Date(startedAt);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getLocationColor = (location: string) => {
    if (location.startsWith('A')) return 'cert-mint';
    if (location.startsWith('B')) return 'cert-premium';
    if (location.startsWith('H')) return 'cert-gold';
    if (location.startsWith('V')) return 'cert-ruby';
    return '';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-b-2 border-nexus-blue rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Auto Refresh Toggle */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-nexus-text-primary">
          リアルタイム進行状況
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-nexus-text-secondary">自動更新</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <NexusButton onClick={fetchProgress} variant="secondary" size="sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </NexusButton>
        </div>
      </div>

      {/* Summary Stats - コンパクトに配置 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="intelligence-card global">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="action-orb w-5 h-5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="status-badge info text-[9px] px-1.5 py-0.5">スタッフ</span>
            </div>
            <div className="text-lg font-display font-bold text-nexus-text-primary">
              {progressList.length}名
            </div>
            <div className="text-xs text-nexus-text-secondary mt-1">
              作業中
            </div>
          </div>
        </div>

        <div className="intelligence-card americas">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="action-orb blue w-5 h-5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="status-badge info text-[9px] px-1.5 py-0.5">アイテム</span>
            </div>
            <div className="text-lg font-display font-bold text-nexus-text-primary">
              {progressList.reduce((sum, p) => sum + p.totalItems, 0)}個
            </div>
            <div className="text-xs text-nexus-text-secondary mt-1">
              処理中
            </div>
          </div>
        </div>

        <div className="intelligence-card asia">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="action-orb yellow w-5 h-5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="status-badge warning text-[9px] px-1.5 py-0.5">進捗</span>
            </div>
            <div className="text-lg font-display font-bold text-nexus-text-primary">
              {Math.round(progressList.reduce((sum, p) => sum + p.progress, 0) / progressList.length)}%
            </div>
            <div className="text-xs text-nexus-text-secondary mt-1">
              平均
            </div>
          </div>
        </div>

        <div className="intelligence-card oceania">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="action-orb green w-5 h-5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="status-badge success text-[9px] px-1.5 py-0.5">時間</span>
            </div>
            <div className="text-lg font-display font-bold text-nexus-text-primary">
              {Math.round(progressList.reduce((sum, p) => 
                sum + (p.estimatedCompletionTime - calculateElapsedTime(p.startedAt)), 0
              ) / progressList.length)}分
            </div>
            <div className="text-xs text-nexus-text-secondary mt-1">
              予想完了
            </div>
          </div>
        </div>
      </div>

      {/* Progress Cards - コンパクトなレイアウト */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 min-w-max md:min-w-0">
          {progressList.map((progress) => (
            <div key={progress.id} className="intelligence-card americas min-w-[320px] md:min-w-0">
              <div className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-nexus-text-primary text-sm">
                        {progress.orderId}
                      </h4>
                      <p className="text-xs text-nexus-text-secondary">
                        {progress.customerName}
                      </p>
                    </div>
                    <span className={`cert-nano ${getLocationColor(progress.currentLocation)} flex items-center gap-1`}>
                      {getUnifiedIcon('location', 'w-3 h-3')}
                      {progress.currentLocation}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-nexus-text-secondary">進捗</span>
                      <span className="font-medium text-nexus-text-primary">
                        {progress.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(progress.progress)}`}
                        style={{ width: `${progress.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-nexus-text-secondary">アイテム</p>
                      <p className="font-display font-bold text-nexus-text-primary">
                        {progress.pickedItems}/{progress.totalItems}
                      </p>
                    </div>
                    <div>
                      <p className="text-nexus-text-secondary">経過時間</p>
                      <p className="font-display font-bold text-nexus-text-primary">
                        {calculateElapsedTime(progress.startedAt)}分
                      </p>
                    </div>
                  </div>

                  {/* Staff Info */}
                  <div className="pt-2 border-t border-nexus-border">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-nexus-blue rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {progress.assignedTo.charAt(progress.assignedTo.length - 1)}
                        </div>
                        <span className="text-xs text-nexus-text-primary">
                          {progress.assignedTo}
                        </span>
                      </div>
                      <span className="text-[10px] text-nexus-text-secondary">
                        あと{progress.estimatedCompletionTime - calculateElapsedTime(progress.startedAt)}分
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {progressList.length === 0 && (
        <div className="text-center py-12">
          <p className="text-nexus-text-secondary">現在進行中のピッキング作業はありません</p>
        </div>
      )}
    </div>
  );
} 