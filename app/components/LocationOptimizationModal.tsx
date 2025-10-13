'use client';

import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { BaseModal, NexusButton } from './ui';

interface LocationOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationOptimizationModal({ isOpen, onClose }: LocationOptimizationModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { showToast } = useToast();

  // スクロール位置のリセット
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  const demoItems = [
    { id: '1', name: 'Canon EOS R5', currentLocation: 'A-1-001', suggestedLocation: 'A-2-003', reason: 'アクセス頻度が高い' },
    { id: '2', name: 'Nikon D850', currentLocation: 'B-3-015', suggestedLocation: 'A-1-005', reason: 'カテゴリ統合' },
    { id: '3', name: 'Sony α7R IV', currentLocation: 'C-2-008', suggestedLocation: 'A-2-001', reason: 'ピッキング効率向上' },
  ];

  const handleOptimize = async () => {
    setIsOptimizing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setOptimizationResult({
      totalItems: demoItems.length,
      optimizedItems: demoItems.length,
      estimatedTimeSaving: '25%',
      suggestions: demoItems
    });
    setIsOptimizing(false);
  };

  const handleApplyOptimization = async () => {
    if (selectedItems.length === 0) {
      showToast({
        type: 'warning',
        title: '選択が必要',
        message: '適用する商品を選択してください'
      });
      return;
    }

    try {
      const response = await fetch('/api/location/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: selectedItems })
      });

      if (response.ok) {
        showToast({
          type: 'success',
          title: '最適化完了',
          message: `${selectedItems.length}件の商品ロケーションを最適化しました。本番環境では実際にロケーションが更新されます。`,
          duration: 4000
        });
        onClose();
        // 本番運用では親コンポーネントの状態を更新
        // window.location.reload()は削除し、適切な状態管理を使用
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'エラー',
        message: 'ロケーション最適化に失敗しました'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="ロケーション最適化"
      size="lg"
      className="max-w-4xl"
    >
      <div className="max-h-[90vh] overflow-hidden">
        <div className="flex items-center p-6 border-b">
          <SparklesIcon className="w-8 h-8 text-nexus-yellow mr-3" />
          <div>
            <div className="text-xl font-bold text-nexus-text-primary">
              AI位置最適化
            </div>
            <div className="text-nexus-text-secondary">
              商品の保管位置を最適化し、ピッキング効率を向上させます
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]" ref={scrollContainerRef}>
          {!optimizationResult ? (
            <div className="text-center py-12">
              {isOptimizing ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-nexus-yellow mb-4"></div>
                  <p className="text-nexus-text-secondary">最適化を実行中...</p>
                </div>
              ) : (
                <div>
                  <SparklesIcon className="mx-auto h-16 w-16 text-nexus-yellow mb-4" />
                  <h3 className="text-lg font-semibold mb-2">ロケーション最適化を開始</h3>
                  <p className="text-nexus-text-secondary mb-6">AI分析により、効率的な商品配置を提案します。</p>
                  <NexusButton
                    onClick={handleOptimize}
                    variant="primary"
                    size="lg"
                    icon={<SparklesIcon className="w-5 h-5" />}
                  >
                    最適化を実行
                  </NexusButton>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-nexus-bg-secondary border border-nexus-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-nexus-text-primary mb-4">最適化結果</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-nexus-green">{optimizationResult.totalItems}</p>
                    <p className="text-sm text-nexus-text-secondary">分析対象商品</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-nexus-green">{optimizationResult.optimizedItems}</p>
                    <p className="text-sm text-nexus-text-secondary">最適化提案</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-nexus-green">{optimizationResult.estimatedTimeSaving}</p>
                    <p className="text-sm text-nexus-text-secondary">時間短縮</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">最適化提案</h3>
                <div className="space-y-3">
                  {optimizationResult.suggestions.map((item: any) => (
                    <div
                      key={item.id}
                      className={`p-4 border rounded-lg cursor-pointer ${
                        selectedItems.includes(item.id) ? 'border-nexus-yellow bg-nexus-bg-secondary' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedItems(prev => 
                        prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            className="h-4 w-4 text-nexus-yellow rounded mr-3"
                          />
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-nexus-text-secondary">{item.currentLocation} → {item.suggestedLocation}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {item.reason}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between p-6 border-t">
          <NexusButton
            onClick={onClose}
            icon={<XMarkIcon className="w-5 h-5" />}
          >
            閉じる
          </NexusButton>
          {optimizationResult && (
            <NexusButton
              onClick={handleApplyOptimization}
              disabled={selectedItems.length === 0}
              variant="primary"
              icon={<SparklesIcon className="w-5 h-5" />}
            >
              選択した提案を適用 ({selectedItems.length})
            </NexusButton>
          )}
        </div>
      </div>
    </BaseModal>
  );
} 