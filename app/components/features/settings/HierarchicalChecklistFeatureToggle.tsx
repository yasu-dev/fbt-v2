'use client';

import { useState } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import { useHierarchicalChecklistFeature } from '@/lib/hooks/useHierarchicalChecklistFeature';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

/**
 * 階層型検品チェックリストのフィーチャーフラグ切り替えコンポーネント
 * 管理者が安全に新旧システムを切り替え可能
 */
export default function HierarchicalChecklistFeatureToggle() {
  const { showToast } = useToast();
  const { isEnabled, loading, error, toggle, refresh } = useHierarchicalChecklistFeature();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async (enabled: boolean) => {
    setIsToggling(true);
    
    try {
      const result = await toggle(enabled);
      
      showToast({
        type: 'success',
        title: '設定更新成功',
        message: `階層型検品チェックリストを${result ? '有効化' : '無効化'}しました。${result ? '新システム' : '既存システム'}が使用されます。`,
        duration: 5000
      });
      
      console.log(`[ADMIN] 階層型検品チェックリスト: ${result ? '有効' : '無効'} (管理者操作)`);
      
    } catch (err) {
      showToast({
        type: 'error',
        title: '設定更新失敗',
        message: 'フィーチャーフラグの切り替えに失敗しました。',
        duration: 5000
      });
      
      console.error('[ADMIN ERROR] フィーチャーフラグ切り替えエラー:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleRefresh = () => {
    refresh();
    showToast({
      type: 'info',
      title: '設定を再読み込み',
      message: '最新の設定を取得しました。',
      duration: 3000
    });
  };

  if (loading) {
    return (
      <NexusCard className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-blue"></div>
          <span className="ml-3 text-nexus-text-secondary">フィーチャーフラグ読み込み中...</span>
        </div>
      </NexusCard>
    );
  }

  if (error) {
    return (
      <NexusCard className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <h3 className="font-semibold text-red-700">エラーが発生しました</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
          <NexusButton
            onClick={handleRefresh}
            variant="outline"
            size="sm"
          >
            再試行
          </NexusButton>
        </div>
      </NexusCard>
    );
  }

  return (
    <NexusCard className="p-6">
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <h3 className="text-lg font-semibold text-nexus-text-primary">
            階層型検品チェックリスト
          </h3>
          <p className="text-sm text-nexus-text-secondary mt-1">
            新しい階層型検品チェックリストシステムの有効/無効を制御します。
          </p>
        </div>

        {/* 現在の状態表示 */}
        <div className="bg-nexus-bg-tertiary rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isEnabled ? (
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
              ) : (
                <div className="h-6 w-6 rounded-full bg-gray-300 mr-3"></div>
              )}
              <div>
                <h4 className="font-medium text-nexus-text-primary">
                  {isEnabled ? '新システム稼働中' : '既存システム稼働中'}
                </h4>
                <p className="text-sm text-nexus-text-secondary">
                  {isEnabled 
                    ? '8大項目37+小項目の階層型チェックリストを使用'
                    : '従来の12項目統一チェックリストを使用'
                  }
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                isEnabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isEnabled ? '有効' : '無効'}
              </span>
            </div>
          </div>
        </div>

        {/* 切り替えボタン */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h4 className="font-medium text-nexus-text-primary">システム切り替え</h4>
            <p className="text-sm text-nexus-text-secondary">
              {isEnabled 
                ? '既存システムに戻すと、12項目の統一チェックリストが使用されます。'
                : '新システムを有効にすると、8大項目の階層型チェックリストが使用されます。'
              }
            </p>
          </div>
          
          <div className="flex gap-3">
            <NexusButton
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isToggling}
            >
              最新状態を確認
            </NexusButton>
            
            <NexusButton
              onClick={() => handleToggle(!isEnabled)}
              variant={isEnabled ? "danger" : "primary"}
              disabled={isToggling}
              loading={isToggling}
            >
              {isToggling 
                ? '切り替え中...' 
                : isEnabled 
                  ? '既存システムに戻す' 
                  : '新システムを有効化'
              }
            </NexusButton>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-800">重要な注意事項</h4>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• システムの切り替えは即座に全画面に反映されます</li>
                <li>• 新システムと既存システムのデータ形式は異なります</li>
                <li>• 問題が発生した場合はいつでも既存システムに戻せます</li>
                <li>• 変更履歴は管理ログに記録されます</li>
              </ul>
            </div>
          </div>
        </div>

        {/* システム情報 */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-nexus-text-primary">既存システム：</span>
              <span className="text-nexus-text-secondary ml-2">12項目統一チェックリスト</span>
            </div>
            <div>
              <span className="font-medium text-nexus-text-primary">新システム：</span>
              <span className="text-nexus-text-secondary ml-2">8大項目37+小項目階層型</span>
            </div>
            <div>
              <span className="font-medium text-nexus-text-primary">対象画面：</span>
              <span className="text-nexus-text-secondary ml-2">納品プラン作成、検品管理</span>
            </div>
            <div>
              <span className="font-medium text-nexus-text-primary">データ保存：</span>
              <span className="text-nexus-text-secondary ml-2">独立データベース</span>
            </div>
          </div>
        </div>
      </div>
    </NexusCard>
  );
}
