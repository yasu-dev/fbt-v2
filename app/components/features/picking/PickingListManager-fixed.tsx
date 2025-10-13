'use client';

import { useState, useEffect, useMemo } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import Pagination from '@/app/components/ui/Pagination';
import BaseModal from '@/app/components/ui/BaseModal';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

// eBay注文に基づく商品データ構造
interface EbayProduct {
  id: string;
  productName: string;
  sku: string;
  location: string;
  locationName?: string; // ロケーション名を追加
  quantity: number;
  pickedQuantity: number;
  status: 'pending' | 'ready_for_packing' | 'completed';
  // eBay購入に関する情報
  ebayOrderId: string;
  ebayItemId: string;
  buyerName: string;
  buyerUserId: string;
  purchaseDate: string;
  // 梱包判断用情報
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  // 同梱情報
  canCombineWith?: string[]; // 同梱可能な他の商品ID
  combineGroup?: string; // 同梱グループID
}

// 同梱グループ
interface CombineGroup {
  id: string;
  buyerName: string;
  buyerUserId: string;
  purchaseDate: string;
  productIds: string[];
  combinedPackage?: boolean;
}

// ロケーションコードのソート関数
const sortLocationCode = (a: string, b: string): number => {
  // A-1-1, A-1-2, ..., B-1-6 の順序でソート
  const parseLocationCode = (code: string) => {
    const match = code.match(/^([A-Z])-(\d+)-(\d+)$/);
    if (match) {
      return [match[1], parseInt(match[2]), parseInt(match[3])];
    }
    return [code, 0, 0]; // フォールバック
  };

  const [aZone, aRow, aCol] = parseLocationCode(a);
  const [bZone, bRow, bCol] = parseLocationCode(b);

  // まずゾーン（A, B, C）でソート
  if (aZone !== bZone) {
    return aZone.localeCompare(bZone);
  }

  // 次に行（1, 2, 3）でソート
  if (aRow !== bRow) {
    return aRow - bRow;
  }

  // 最後に列（1, 2, 3）でソート
  return aCol - bCol;
};

export default function PickingListManager() {
  const [products, setProducts] = useState<EbayProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [combineGroups, setCombineGroups] = useState<CombineGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isPickingModalOpen, setIsPickingModalOpen] = useState(false);
  const [isCombineModalOpen, setIsCombineModalOpen] = useState(false);
  const [productsToProcess, setProductsToProcess] = useState<EbayProduct[]>([]);

  // ページング状態
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { showToast } = useToast();

  useEffect(() => {
    fetchEbayProducts();
  }, []);

  const fetchEbayProducts = async () => {
    setLoading(true);
    try {
      // 実際のAPIからデータを取得
      const response = await fetch('/api/picking');
      const result = await response.json();

      if (result.success) {
        // APIは{tasks: [...], statistics: {...}}構造を返すため、tasksを取得し商品配列に変換
        const tasks = result.data?.tasks || result.tasks || [];
        const flatProducts = tasks.flatMap(task =>
          (task.items || []).map(item => ({
            id: item.id,
            productName: item.productName || '',
            sku: item.sku || '',
            location: item.location || '',
            locationName: item.locationName || '', // APIから取得したロケーション名
            quantity: item.quantity || 1,
            pickedQuantity: item.pickedQuantity || 0,
            status: item.status || 'pending',
            // ピッキング管理に必要な追加情報
            ebayOrderId: task.orderId || '',
            ebayItemId: task.id || '',
            buyerName: task.customerName || task.customer || '',
            buyerUserId: task.customer || '',
            purchaseDate: new Date(task.dueDate || Date.now()).toISOString().split('T')[0],
            shippingAddress: {
              name: task.customerName || task.customer || '',
              address: '',
              city: '',
              postalCode: '',
              country: '日本'
            }
          }))
        );

        // ロケーションコード順にソート
        const sortedProducts = flatProducts.sort((a, b) =>
          sortLocationCode(a.location, b.location)
        );

        setProducts(sortedProducts);

        // APIから同梱グループを取得
        const groups = result.combineGroups || [];
        setCombineGroups(groups);
      } else {
        console.error('Failed to fetch eBay products:', result.error);
      }
    } catch (error) {
      console.error('Error fetching eBay products:', error);
      showToast('商品データの取得に失敗しました', 'error');
    } finally {
      setLoading(false);
    }
  };

  // フィルタリングとソート
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // ステータスフィルター
    if (filterStatus !== 'all') {
      filtered = filtered.filter(product => product.status === filterStatus);
    }

    // 検索フィルター
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.buyerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // ロケーションコード順でソート
    return filtered.sort((a, b) => sortLocationCode(a.location, b.location));
  }, [products, filterStatus, searchQuery]);

  // ページング計算
  const { paginatedData: paginatedProducts, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return {
      paginatedData: filteredProducts.slice(startIndex, endIndex),
      totalPages: Math.ceil(filteredProducts.length / itemsPerPage)
    };
  }, [filteredProducts, currentPage, itemsPerPage]);

  // ロケーション表示フォーマット関数
  const formatLocationDisplay = (location: string, locationName?: string): string => {
    if (locationName) {
      return `${location}（${locationName}）`;
    }
    return location;
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === paginatedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(paginatedProducts.map(p => p.id));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { label: 'ピッキング待ち', className: 'bg-nexus-warning text-nexus-warning-foreground' },
      'ready_for_packing': { label: '梱包準備中', className: 'bg-nexus-primary text-nexus-primary-foreground' },
      'completed': { label: '完了', className: 'bg-nexus-success text-nexus-success-foreground' }
    };

    const config = statusConfig[status] || { label: status, className: 'bg-nexus-muted text-nexus-muted-foreground' };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const handleProcessSelected = () => {
    const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));
    setProductsToProcess(selectedProductsData);
    setIsPickingModalOpen(true);
  };

  const handleCombineSelected = () => {
    const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));
    setProductsToProcess(selectedProductsData);
    setIsCombineModalOpen(true);
  };

  const handleConfirmPicking = async () => {
    try {
      // ここでピッキング処理のAPIを呼び出す
      showToast('ピッキング処理が完了しました', 'success');
      setIsPickingModalOpen(false);
      setProductsToProcess([]);
      setSelectedProducts([]);

      // データを再取得
      fetchEbayProducts();
    } catch (error) {
      showToast('ピッキング処理に失敗しました', 'error');
    }
  };

  const handleConfirmCombine = async () => {
    try {
      // ここで同梱処理のAPIを呼び出す
      showToast('同梱処理が完了しました', 'success');
      setIsCombineModalOpen(false);
      setProductsToProcess([]);
      setSelectedProducts([]);

      // データを再取得
      fetchEbayProducts();
    } catch (error) {
      showToast('同梱処理に失敗しました', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー部分 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-2xl font-bold text-nexus-text-primary">ピッキングリスト管理</h1>

        <div className="flex flex-col sm:flex-row gap-2">
          <NexusButton
            onClick={handleProcessSelected}
            disabled={selectedProducts.length === 0}
            className="w-full sm:w-auto"
          >
            選択商品をピッキング ({selectedProducts.length})
          </NexusButton>

          <NexusButton
            variant="outline"
            onClick={handleCombineSelected}
            disabled={selectedProducts.length < 2}
            className="w-full sm:w-auto"
          >
            選択商品を同梱 ({selectedProducts.length})
          </NexusButton>
        </div>
      </div>

      {/* フィルター部分 */}
      <NexusCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="商品名、SKU、ロケーション、購入者名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-nexus-border rounded-md focus:ring-2 focus:ring-nexus-primary focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-nexus-border rounded-md focus:ring-2 focus:ring-nexus-primary"
            >
              <option value="all">全ステータス</option>
              <option value="pending">ピッキング待ち</option>
              <option value="ready_for_packing">梱包準備中</option>
              <option value="completed">完了</option>
            </select>

            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-nexus-border rounded-md focus:ring-2 focus:ring-nexus-primary"
            >
              <option value={10}>10件</option>
              <option value={20}>20件</option>
              <option value={50}>50件</option>
              <option value={100}>100件</option>
            </select>
          </div>
        </div>
      </NexusCard>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <NexusCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-nexus-primary">{products.length}</div>
            <div className="text-sm text-nexus-text-secondary">総商品数</div>
          </div>
        </NexusCard>

        <NexusCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-nexus-warning">{products.filter(p => p.status === 'pending').length}</div>
            <div className="text-sm text-nexus-text-secondary">ピッキング待ち</div>
          </div>
        </NexusCard>

        <NexusCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-nexus-primary">{products.filter(p => p.status === 'ready_for_packing').length}</div>
            <div className="text-sm text-nexus-text-secondary">梱包準備中</div>
          </div>
        </NexusCard>

        <NexusCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-nexus-success">{products.filter(p => p.status === 'completed').length}</div>
            <div className="text-sm text-nexus-text-secondary">完了</div>
          </div>
        </NexusCard>
      </div>

      {/* 商品リスト */}
      <NexusCard>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-nexus-border">
            <thead className="bg-nexus-bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-nexus-border focus:ring-nexus-primary"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider">
                  商品名
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider">
                  購入者
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider">
                  購入日
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider">
                  ロケーション
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-nexus-text-secondary uppercase tracking-wider">
                  数量
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-nexus-text-secondary uppercase tracking-wider">
                  ステータス
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-nexus-border">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-nexus-bg-secondary/50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                      className="rounded border-nexus-border focus:ring-nexus-primary"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm font-medium text-nexus-text-primary">{product.productName}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-nexus-text-primary">{product.sku}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-nexus-text-primary">{product.buyerName}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-nexus-text-primary">{product.purchaseDate}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm bg-nexus-bg-secondary px-2 py-1 rounded">
                      {formatLocationDisplay(product.location, product.locationName)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold">{product.quantity}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(product.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paginatedProducts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-nexus-text-secondary">条件に一致する商品がありません。</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </NexusCard>

      {/* ピッキング確認モーダル */}
      <BaseModal
        isOpen={isPickingModalOpen}
        onClose={() => setIsPickingModalOpen(false)}
        title="ピッキング処理確認"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-nexus-text-primary">
            以下の商品のピッキング処理を実行しますか？
          </p>
          <div className="max-h-60 overflow-y-auto">
            {productsToProcess.map((product) => (
              <div key={product.id} className="flex justify-between items-center py-2 border-b border-nexus-border last:border-b-0">
                <div>
                  <p className="font-medium text-nexus-text-primary">{product.productName}</p>
                  <p className="text-sm text-nexus-text-secondary">
                    📍 {formatLocationDisplay(product.location, product.locationName)} | {product.buyerName} | {product.purchaseDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3">
            <NexusButton
              onClick={() => {
                setIsPickingModalOpen(false);
                setProductsToProcess([]);
              }}
              variant="outline"
            >
              キャンセル
            </NexusButton>
            <NexusButton onClick={handleConfirmPicking}>
              ピッキング実行
            </NexusButton>
          </div>
        </div>
      </BaseModal>

      {/* 同梱確認モーダル */}
      <BaseModal
        isOpen={isCombineModalOpen}
        onClose={() => setIsCombineModalOpen(false)}
        title="同梱処理確認"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-nexus-text-primary">
            以下の商品を同梱処理しますか？
          </p>
          <div className="space-y-2">
            {productsToProcess.map((product) => (
              <div key={product.id} className="flex justify-between items-center py-2 bg-nexus-bg-primary rounded px-3">
                <span className="text-nexus-text-primary">{product.productName}</span>
                <span className="text-sm text-nexus-text-secondary">{formatLocationDisplay(product.location, product.locationName)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3">
            <NexusButton
              onClick={() => {
                setIsCombineModalOpen(false);
                setProductsToProcess([]);
              }}
              variant="outline"
            >
              キャンセル
            </NexusButton>
            <NexusButton onClick={handleConfirmCombine}>
              同梱実行
            </NexusButton>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}