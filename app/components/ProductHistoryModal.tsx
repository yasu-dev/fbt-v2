'use client';

import { useState, useEffect, useRef } from 'react';
import { BaseModal, NexusButton, BusinessStatusIndicator } from './ui';
import { useToast } from './features/notifications/ToastProvider';

interface HistoryItem {
  id: string;
  type: string;
  action: string;
  description: string;
  user: string;
  timestamp: string;
  metadata?: any;
}

interface ProductHistoryResponse {
  product: {
    id: string;
    name: string;
    sku: string;
  };
  history: HistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  performance: {
    processingTime: number;
    itemCount: number;
    queryCount: number;
    cacheHit: boolean;
  };
}

interface ProductHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string | null;
  useRealData?: boolean; // trueで実データ、falseでモックデータ
}

export default function ProductHistoryModal({ 
  isOpen, 
  onClose, 
  productId, 
  useRealData = false 
}: ProductHistoryModalProps) {
  const [historyData, setHistoryData] = useState<ProductHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const { showToast } = useToast();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // データ取得
  const fetchHistory = async (page: number = 1) => {
    if (!productId) return;

    setLoading(true);
    setError(null);
    
    const startTime = Date.now();
    
    try {
      const endpoint = useRealData 
        ? `/api/products/${productId}/history?page=${page}&limit=50`
        : `/api/products/${productId}/history/mock?page=${page}&limit=50`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`API エラー: ${response.status}`);
      }
      
      const data: ProductHistoryResponse = await response.json();
      
      // クライアントサイドでの処理時間も測定
      const clientProcessingTime = Date.now() - startTime;
      
      // パフォーマンスメトリクスを記録
      const metrics = {
        ...data.performance,
        clientProcessingTime,
        totalTime: clientProcessingTime,
        networkTime: clientProcessingTime - data.performance.processingTime,
        dataType: useRealData ? 'real' : 'mock',
        responseSize: JSON.stringify(data).length,
        timestamp: new Date().toISOString()
      };
      
      setPerformanceMetrics(metrics);
      setHistoryData(data);
      setCurrentPage(page);
      
      // パフォーマンス情報をコンソールに出力
      console.log('履歴取得パフォーマンス:', metrics);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラー';
      setError(errorMessage);
      showToast({
        title: '履歴取得エラー',
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // モーダルが開かれたときにデータを取得
  useEffect(() => {
    if (isOpen && productId) {
      fetchHistory(1);
    }
  }, [isOpen, productId, useRealData]);

  // ページ変更
  const handlePageChange = (page: number) => {
    fetchHistory(page);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  // アクションタイプに応じたスタイル
  const getActionStyle = (type: string) => {
    const styles: Record<string, string> = {
      'activity': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'inventory_movement': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'order': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'listing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'shipment': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    
    return styles[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  // パフォーマンス情報の表示
  const renderPerformanceInfo = () => {
    if (!performanceMetrics) return null;
    
    return (
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div>
            <span className="text-gray-600 dark:text-gray-400">処理時間:</span>
            <span className="ml-1 font-mono text-green-600">
              {performanceMetrics.processingTime}ms
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">総時間:</span>
            <span className="ml-1 font-mono text-blue-600">
              {performanceMetrics.totalTime}ms
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">アイテム数:</span>
            <span className="ml-1 font-mono text-purple-600">
              {performanceMetrics.itemCount}件
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">データ:</span>
            <span className={`ml-1 font-mono ${
              performanceMetrics.dataType === 'real' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {performanceMetrics.dataType === 'real' ? '実データ' : 'モック'}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">クエリ数:</span>
            <span className="ml-1 font-mono text-orange-600">
              {performanceMetrics.queryCount}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">レスポンス:</span>
            <span className="ml-1 font-mono text-indigo-600">
              {(performanceMetrics.responseSize / 1024).toFixed(1)}KB
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">ネットワーク:</span>
            <span className="ml-1 font-mono text-teal-600">
              {performanceMetrics.networkTime}ms
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">キャッシュ:</span>
            <span className={`ml-1 font-mono ${
              performanceMetrics.cacheHit ? 'text-green-600' : 'text-red-600'
            }`}>
              {performanceMetrics.cacheHit ? 'HIT' : 'MISS'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`商品履歴 ${useRealData ? '(実データ)' : '(モックデータ)'}`}
      size="xl"
      className="max-h-[90vh] overflow-hidden"
    >
      <div className="p-6">
        {/* 商品情報 */}
        {historyData?.product && (
          <div className="mb-4 p-4 bg-nexus-bg-secondary rounded-lg">
            <h3 className="text-lg font-semibold text-nexus-text-primary">
              {historyData.product.name}
            </h3>
            <p className="text-sm text-nexus-text-secondary">
              SKU: {historyData.product.sku}
            </p>
          </div>
        )}

        {/* パフォーマンス情報 */}
        {renderPerformanceInfo()}

        {/* データタイプ切り替えボタン */}
        <div className="mb-4 flex gap-2">
          <NexusButton
            onClick={() => window.location.reload()}
            variant={useRealData ? "default" : "primary"}
            size="sm"
          >
            モックデータ
          </NexusButton>
          <NexusButton
            onClick={() => window.location.reload()}
            variant={useRealData ? "primary" : "default"}
            size="sm"
          >
            実データ
          </NexusButton>
        </div>

        {/* ローディング状態 */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-blue"></div>
            <span className="ml-2 text-nexus-text-secondary">読み込み中...</span>
          </div>
        )}

        {/* エラー状態 */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* 履歴データ */}
        {historyData && !loading && (
          <>
            <div className="overflow-y-auto max-h-[50vh]" ref={scrollContainerRef}>
              <div className="holo-table">
                <table className="w-full">
                  <thead className="holo-header">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium">タイプ</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">アクション</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">詳細</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">担当者</th>
                      <th className="text-right py-3 px-4 text-sm font-medium">日時</th>
                    </tr>
                  </thead>
                  <tbody className="holo-body">
                    {historyData.history.length > 0 ? historyData.history.map((item) => (
                      <tr key={item.id} className="holo-row">
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionStyle(item.type)}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-nexus-blue">{item.action}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-nexus-text-primary">{item.description}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-nexus-text-secondary">{item.user}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-nexus-text-secondary">
                            {new Date(item.timestamp).toLocaleString('ja-JP')}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr className="holo-row">
                        <td colSpan={5} className="py-6 px-4 text-center text-nexus-text-secondary">
                          履歴データがありません
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ページネーション */}
            {historyData.pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-nexus-text-secondary">
                  {historyData.pagination.total}件中 {(currentPage - 1) * historyData.pagination.limit + 1}-
                  {Math.min(currentPage * historyData.pagination.limit, historyData.pagination.total)}件を表示
                </div>
                <div className="flex gap-2">
                  <NexusButton
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    size="sm"
                  >
                    前へ
                  </NexusButton>
                  <span className="px-3 py-1 text-sm">
                    {currentPage} / {historyData.pagination.totalPages}
                  </span>
                  <NexusButton
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!historyData.pagination.hasMore}
                    size="sm"
                  >
                    次へ
                  </NexusButton>
                </div>
              </div>
            )}
          </>
        )}

        {/* フッター */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <NexusButton onClick={onClose} variant="default">
            閉じる
          </NexusButton>
        </div>
      </div>
    </BaseModal>
  );
}