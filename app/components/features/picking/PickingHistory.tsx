'use client';

import { useState, useEffect } from 'react';
import NexusSelect from '@/app/components/ui/NexusSelect';
import { getUnifiedIcon } from '@/app/components/ui/icons';

interface PickingHistoryRecord {
  id: string;
  orderId: string;
  customerName: string;
  completedBy: string;
  completedAt: string;
  startedAt: string;
  totalItems: number;
  totalTime: number; // 分
  efficiency: number; // パーセンテージ
  shippingMethod: string;
}

export default function PickingHistory() {
  const [historyRecords, setHistoryRecords] = useState<PickingHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('today');
  const [sortBy, setSortBy] = useState<'completedAt' | 'efficiency' | 'totalTime'>('completedAt');
  const [selectedRecord, setSelectedRecord] = useState<PickingHistoryRecord | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [filterPeriod, sortBy]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // APIからデータを取得
      const response = await fetch('/api/picking/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
        setLoading(false);
        return;
      }
      
      // フォールバック用のモックデータ
      const mockHistory: PickingHistoryRecord[] = [
        {
          id: '1',
          orderId: 'ORD-2024-001',
          customerName: '顧客',
          completedBy: 'スタッフA',
          startedAt: '2024-06-28T09:00:00',
          completedAt: '2024-06-28T09:15:00',
          totalItems: 3,
          totalTime: 15,
          efficiency: 95,
          shippingMethod: 'ヤマト運輸',
        },
        {
          id: '2',
          orderId: 'ORD-2024-003',
          customerName: '顧客',
          completedBy: 'スタッフB',
          startedAt: '2024-06-28T10:30:00',
          completedAt: '2024-06-28T10:50:00',
          totalItems: 5,
          totalTime: 20,
          efficiency: 88,
          shippingMethod: '佐川急便',
        },
        {
          id: '3',
          orderId: 'ORD-2024-004',
          customerName: '顧客',
          completedBy: 'スタッフC',
          startedAt: '2024-06-28T11:00:00',
          completedAt: '2024-06-28T11:12:00',
          totalItems: 2,
          totalTime: 12,
          efficiency: 92,
          shippingMethod: '日本郵便',
        },
        {
          id: '4',
          orderId: 'ORD-2024-006',
          customerName: '顧客',
          completedBy: 'スタッフA',
          startedAt: '2024-06-28T13:00:00',
          completedAt: '2024-06-28T13:25:00',
          totalItems: 6,
          totalTime: 25,
          efficiency: 85,
          shippingMethod: 'ヤマト運輸',
        },
        {
          id: '5',
          orderId: 'ORD-2024-007',
          customerName: '顧客',
          completedBy: 'スタッフD',
          startedAt: '2024-06-28T14:00:00',
          completedAt: '2024-06-28T14:18:00',
          totalItems: 4,
          totalTime: 18,
          efficiency: 90,
          shippingMethod: 'FedEx',
        },
      ];

      // ソート
      const sorted = [...mockHistory].sort((a, b) => {
        switch (sortBy) {
          case 'completedAt':
            return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
          case 'efficiency':
            return b.efficiency - a.efficiency;
          case 'totalTime':
            return a.totalTime - b.totalTime;
          default:
            return 0;
        }
      });

      setHistoryRecords(sorted);
    } catch (error) {
      console.error('[ERROR] Fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 80) return 'text-blue-600';
    if (efficiency >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyBadge = (efficiency: number) => {
    if (efficiency >= 90) return <span className="cert-mint">優秀</span>;
    if (efficiency >= 80) return <span className="cert-premium">良好</span>;
    if (efficiency >= 70) return <span className="cert-gold">標準</span>;
    return <span className="cert-ruby">要改善</span>;
  };

  const calculateStats = () => {
    if (historyRecords.length === 0) return { avgTime: 0, avgEfficiency: 0, totalOrders: 0 };

    const totalTime = historyRecords.reduce((sum, r) => sum + r.totalTime, 0);
    const totalEfficiency = historyRecords.reduce((sum, r) => sum + r.efficiency, 0);

    return {
      avgTime: Math.round(totalTime / historyRecords.length),
      avgEfficiency: Math.round(totalEfficiency / historyRecords.length),
      totalOrders: historyRecords.length,
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-b-2 border-nexus-blue rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats - 統一されたintelligence-cardスタイル */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="intelligence-card global">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-nexus-text-secondary">本日の完了数</p>
                <p className="text-2xl font-display font-bold text-nexus-text-primary">
                  {stats.totalOrders}件
                </p>
              </div>
              <div className="action-orb green">
                {getUnifiedIcon('completion', 'w-6 h-6')}
              </div>
            </div>
          </div>
        </div>

        <div className="intelligence-card americas">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-nexus-text-secondary">平均作業時間</p>
                <p className="text-2xl font-display font-bold text-nexus-text-primary">
                  {stats.avgTime}分
                </p>
              </div>
              <div className="action-orb blue">
                {getUnifiedIcon('timeline', 'w-6 h-6')}
              </div>
            </div>
          </div>
        </div>

        <div className="intelligence-card asia">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-nexus-text-secondary">平均効率</p>
                <p className={`text-2xl font-display font-bold ${getEfficiencyColor(stats.avgEfficiency)}`}>
                  {stats.avgEfficiency}%
                </p>
              </div>
              <div className="action-orb yellow">
                {getUnifiedIcon('monitoring', 'w-6 h-6')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sort - 統一されたNexusSelectを使用 */}
      <div className="intelligence-card global">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-nexus-text-primary mb-2">
                期間フィルター
              </label>
              <NexusSelect
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                options={[
                  { value: 'today', label: '今日' },
                  { value: 'week', label: '今週' },
                  { value: 'month', label: '今月' },
                  { value: 'all', label: 'すべて' },
                ]}
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-nexus-text-primary mb-2">
                並び順
              </label>
              <NexusSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                options={[
                  { value: 'completedAt', label: '完了時刻順' },
                  { value: 'efficiency', label: '効率順' },
                  { value: 'totalTime', label: '作業時間順' },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* History Table - 簡素化されたテーブル */}
      <div className="intelligence-card global">
        <div className="p-8">
          <div className="overflow-x-auto">
            <div className="holo-table">
              <table className="w-full">
                <thead className="holo-header">
                  <tr>
                    <th className="text-left py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getUnifiedIcon('sales', 'w-4 h-4')}
                        <span>注文情報</span>
                      </div>
                    </th>
                    <th className="text-left py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getUnifiedIcon('profile', 'w-4 h-4')}
                        <span>担当者</span>
                      </div>
                    </th>
                    <th className="text-right py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {getUnifiedIcon('completion', 'w-4 h-4')}
                        <span>完了時刻</span>
                      </div>
                    </th>
                    <th className="text-center py-3 px-4">操作</th>
                  </tr>
                </thead>
                <tbody className="holo-body">
                  {historyRecords.map((record) => (
                    <tr key={record.id} className="holo-row">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-nexus-text-primary">
                            {record.orderId}
                          </p>
                          <p className="text-sm text-nexus-text-secondary">
                            {record.customerName}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-nexus-blue rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {record.completedBy.charAt(record.completedBy.length - 1)}
                          </div>
                          <span className="text-sm text-nexus-text-primary">
                            {record.completedBy}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-sm text-nexus-text-primary">
                          {new Date(record.completedAt).toLocaleTimeString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="nexus-button text-xs px-3 py-1"
                        >
                          詳細
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {historyRecords.length === 0 && (
        <div className="intelligence-card global">
          <div className="p-12 text-center">
            <div className="action-orb mx-auto mb-4">
              {getUnifiedIcon('tasks', 'w-6 h-6')}
            </div>
            <p className="text-nexus-text-secondary">該当する履歴が見つかりません</p>
          </div>
        </div>
      )}

      {/* 詳細モーダル */}
              {selectedRecord && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-[10001] p-4 pt-8">
            <div className="intelligence-card global max-w-[800px] w-full max-h-[90vh] overflow-hidden">
              <div className="p-8 border-b border-nexus-border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-display font-bold text-nexus-text-primary">
                      ピッキング完了詳細
                    </h3>
                    <p className="text-nexus-text-secondary">{selectedRecord.orderId}</p>
                  </div>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="action-orb"
                  >
                    {getUnifiedIcon('tasks', 'w-5 h-5')}
                  </button>
                </div>
              </div>

              <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-nexus-text-primary mb-2">基本情報</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-nexus-text-secondary">注文ID：</span>
                        <span className="text-sm font-medium">{selectedRecord.orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-nexus-text-secondary">顧客名：</span>
                        <span className="text-sm font-medium">{selectedRecord.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-nexus-text-secondary">担当者：</span>
                        <span className="text-sm font-medium">{selectedRecord.completedBy}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-nexus-text-primary mb-2">配送情報</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-nexus-text-secondary">配送方法：</span>
                        <span className="text-sm font-medium">{selectedRecord.shippingMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-nexus-text-secondary">商品数：</span>
                        <span className="text-sm font-medium">{selectedRecord.totalItems}個</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-nexus-text-primary mb-2">作業実績</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-nexus-text-secondary">作業時間：</span>
                        <span className="text-sm font-medium">{selectedRecord.totalTime}分</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-nexus-text-secondary">効率：</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${getEfficiencyColor(selectedRecord.efficiency)}`}>
                            {selectedRecord.efficiency}%
                          </span>
                          {getEfficiencyBadge(selectedRecord.efficiency)}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-nexus-text-secondary">開始時刻：</span>
                        <span className="text-sm font-medium">
                          {new Date(selectedRecord.startedAt).toLocaleTimeString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-nexus-text-secondary">完了時刻：</span>
                        <span className="text-sm font-medium">
                          {new Date(selectedRecord.completedAt).toLocaleTimeString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="nexus-button"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 