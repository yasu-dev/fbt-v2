'use client';

import { useState, useEffect } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';

interface ListingRecord {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  listingDate: string;
  soldDate?: string;
  listingPrice: number;
  soldPrice?: number;
  status: 'active' | 'sold' | 'cancelled' | 'expired';
  platform: 'ebay' | 'yahoo' | 'mercari';
  viewCount: number;
  watchCount: number;
}

export default function ListingHistory() {
  const [records, setRecords] = useState<ListingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('30days');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, [filterPeriod, filterStatus, filterPlatform]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // モックデータ
      const mockRecords: ListingRecord[] = [
        {
          id: '1',
          productId: 'TWD-CAM-001',
          productName: 'Canon EOS R5',
          sku: 'TWD-CAM-001',
          listingDate: '2024-06-15T10:00:00',
          soldDate: '2024-06-20T14:30:00',
          listingPrice: 405000,
          soldPrice: 420000,
          status: 'sold',
          platform: 'ebay',
          viewCount: 1250,
          watchCount: 45,
        },
        {
          id: '2',
          productId: 'TWD-LEN-005',
          productName: 'Canon RF 24-70mm F2.8',
          sku: 'TWD-LEN-005',
          listingDate: '2024-06-18T09:00:00',
          listingPrice: 168300,
          status: 'active',
          platform: 'ebay',
          viewCount: 890,
          watchCount: 23,
        },
        {
          id: '3',
          productId: 'TWD-WAT-007',
          productName: 'Rolex GMT Master',
          sku: 'TWD-WAT-007',
          listingDate: '2024-06-10T11:00:00',
          soldDate: '2024-06-25T16:00:00',
          listingPrice: 2100000,
          soldPrice: 2150000,
          status: 'sold',
          platform: 'yahoo',
          viewCount: 3500,
          watchCount: 120,
        },
        {
          id: '4',
          productId: 'TWD-CAM-012',
          productName: 'Sony α7R V',
          sku: 'TWD-CAM-012',
          listingDate: '2024-06-22T14:00:00',
          listingPrice: 272000,
          status: 'active',
          platform: 'mercari',
          viewCount: 450,
          watchCount: 15,
        },
        {
          id: '5',
          productId: 'TWD-ACC-003',
          productName: 'Peak Design Everyday Backpack',
          sku: 'TWD-ACC-003',
          listingDate: '2024-06-05T10:00:00',
          listingPrice: 32000,
          status: 'expired',
          platform: 'ebay',
          viewCount: 200,
          watchCount: 5,
        },
      ];
      setRecords(mockRecords);
    } catch (error) {
      console.error('[ERROR] Fetching listing history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="cert-nano cert-mint">出品中</span>;
      case 'sold':
        return <span className="cert-nano cert-premium">売却済</span>;
      case 'cancelled':
        return <span className="cert-nano cert-ruby">キャンセル</span>;
      case 'expired':
        return <span className="cert-nano">終了</span>;
      default:
        return <span className="cert-nano">{status}</span>;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ebay':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
          </svg>
        );
      case 'yahoo':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'mercari':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
    }
  };

  const calculateStats = () => {
    const soldRecords = records.filter(r => r.status === 'sold');
    const totalSold = soldRecords.length;
    const totalRevenue = soldRecords.reduce((sum, r) => sum + (r.soldPrice || 0), 0);
    const avgSoldPrice = totalRevenue / (totalSold || 1);
    const totalViews = records.reduce((sum, r) => sum + r.viewCount, 0);

    return {
      totalSold,
      totalRevenue,
      avgSoldPrice,
      totalViews,
    };
  };

  const stats = calculateStats();

  const filteredRecords = records.filter(record => {
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    const matchesPlatform = filterPlatform === 'all' || record.platform === filterPlatform;
    return matchesStatus && matchesPlatform;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-b-2 border-nexus-blue rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <NexusCard className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-nexus-text-secondary">販売数</div>
          <div className="text-xl sm:text-2xl font-display font-bold text-nexus-text-primary">
            {stats.totalSold}
          </div>
        </NexusCard>
        <NexusCard className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-nexus-text-secondary">総売上</div>
          <div className="text-xl sm:text-2xl font-display font-bold text-nexus-text-primary">
            ¥{stats.totalRevenue.toLocaleString()}
          </div>
        </NexusCard>
        <NexusCard className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-nexus-text-secondary">平均販売価格</div>
          <div className="text-xl sm:text-2xl font-display font-bold text-nexus-text-primary">
            ¥{Math.floor(stats.avgSoldPrice).toLocaleString()}
          </div>
        </NexusCard>
        <NexusCard className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-nexus-text-secondary">総閲覧数</div>
          <div className="text-xl sm:text-2xl font-display font-bold text-nexus-text-primary">
            {stats.totalViews.toLocaleString()}
          </div>
        </NexusCard>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
        <select
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
          className="px-3 sm:px-4 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue text-nexus-text-primary text-sm"
        >
          <option value="7days">過去7日間</option>
          <option value="30days">過去30日間</option>
          <option value="90days">過去90日間</option>
          <option value="all">すべて</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 sm:px-4 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue text-nexus-text-primary text-sm"
        >
          <option value="all">すべてのステータス</option>
          <option value="active">出品中</option>
          <option value="sold">売却済</option>
          <option value="cancelled">キャンセル</option>
          <option value="expired">終了</option>
        </select>

        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          className="px-3 sm:px-4 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue text-nexus-text-primary text-sm"
        >
          <option value="all">すべてのプラットフォーム</option>
          <option value="ebay">eBay</option>
          <option value="yahoo">ヤフオク</option>
          <option value="mercari">メルカリ</option>
        </select>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto">
        <div className="holo-table min-w-full">
          <table className="w-full">
            <thead className="holo-header">
              <tr>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">商品情報</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">プラットフォーム</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">出品日</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">販売価格</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">閲覧/ウォッチ</th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">ステータス</th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">アクション</th>
              </tr>
            </thead>
            <tbody className="holo-body">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="holo-row">
                  <td className="py-2 sm:py-4 px-2 sm:px-4">
                    <div>
                      <p className="font-semibold text-nexus-text-primary text-xs sm:text-sm">
                        {record.productName}
                      </p>
                      <p className="text-xs text-nexus-text-secondary">
                        {record.sku}
                      </p>
                    </div>
                  </td>
                  <td className="py-2 sm:py-4 px-2 sm:px-4">
                    <div className="flex items-center gap-2">
                      <div className="text-blue-600">
                        {getPlatformIcon(record.platform)}
                      </div>
                      <span className="text-xs sm:text-sm text-nexus-text-primary">
                        {record.platform.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 sm:py-4 px-2 sm:px-4">
                    <div>
                      <p className="text-xs sm:text-sm text-nexus-text-primary">
                        {new Date(record.listingDate).toLocaleDateString('ja-JP')}
                      </p>
                      {record.soldDate && (
                        <p className="text-xs text-nexus-text-secondary">
                          売却: {new Date(record.soldDate).toLocaleDateString('ja-JP')}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-2 sm:py-4 px-2 sm:px-4">
                    <div>
                      <p className="font-display font-bold text-nexus-text-primary text-xs sm:text-sm">
                        ¥{record.listingPrice.toLocaleString()}
                      </p>
                      {record.soldPrice && (
                        <p className="text-xs text-green-600">
                          売却: ¥{record.soldPrice.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-2 sm:py-4 px-2 sm:px-4">
                    <div className="text-xs sm:text-sm">
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-nexus-text-primary">
                          {record.viewCount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <svg className="w-3 h-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <span className="text-nexus-text-secondary">
                          {record.watchCount}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 sm:py-4 px-2 sm:px-4">{getStatusBadge(record.status)}</td>
                  <td className="text-right py-2 sm:py-4 px-2 sm:px-4">
                    <button className="nexus-button text-xs px-2 py-1">
                      詳細
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <p className="text-nexus-text-secondary text-sm">該当する履歴が見つかりません</p>
        </div>
      )}
    </div>
  );
} 