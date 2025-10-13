'use client';

import { useState, useEffect, useMemo } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import EbayListingForm from '../EbayListingForm';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import BaseModal from '@/app/components/ui/BaseModal';
import Pagination from '@/app/components/ui/Pagination';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  condition: string;
  status: 'ready' | 'listed' | 'pending' | 'error';
  imageUrl?: string;
  location: string;
  lastUpdated: string;
}

export default function ListingManager() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showListingForm, setShowListingForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBatchConfirmModalOpen, setIsBatchConfirmModalOpen] = useState(false);

  // ページネーション状態
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // APIから実際のデータを取得
      const response = await fetch('/api/inventory?status=storage,listing');
      if (response.ok) {
        const data = await response.json();
        const products: Product[] = data.data.map((item: any) => ({
          id: item.id,
          sku: item.sku,
          name: item.name,
          category: item.category.replace('camera_body', 'カメラ本体')
                                 .replace('camera', 'カメラ')
                                 .replace('lens', 'レンズ')
                                 .replace('watch', '腕時計')
                                 .replace('accessory', 'アクセサリ'),
          price: item.price || 0,
          condition: item.condition.replace('new', 'S')
                                  .replace('like_new', 'A+')
                                  .replace('excellent', 'A')
                                  .replace('very_good', 'A-')
                                  .replace('good', 'B+')
                                  .replace('fair', 'B')
                                  .replace('poor', 'C'),
          status: item.status === 'storage' ? 'ready' : 
                  item.status === 'listing' ? 'listed' : 'pending',
          location: item.location || '未設定',
          lastUpdated: item.updatedAt || new Date().toISOString(),
        }));
        setProducts(products);
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (error) {
      console.error('[ERROR] Fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === paginatedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(paginatedProducts.map(p => p.id));
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBatchList = () => {
    if (selectedProducts.length === 0) {
      showToast({
        type: 'warning',
        title: '選択が必要',
        message: '出品する商品を選択してください'
      });
      return;
    }

    setIsBatchConfirmModalOpen(true);
  };

  const handleConfirmBatchList = async () => {
    setIsBatchConfirmModalOpen(false);
    
    // 一括出品処理（実装時にはAPIを呼び出す）
    showToast({
      type: 'info',
      title: '出品処理開始',
      message: `${selectedProducts.length}件の商品を出品処理中...`
    });
    setSelectedProducts([]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <span className="cert-nano cert-mint">出品可能</span>;
      case 'listed':
        return <span className="cert-nano cert-premium">出品中</span>;
      case 'pending':
        return <span className="cert-nano cert-gold">処理中</span>;
      case 'error':
        return <span className="cert-nano cert-ruby">エラー</span>;
      default:
        return <span className="cert-nano">{status}</span>;
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    const matchesSearch = 
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // ページネーション計算
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-b-2 border-nexus-blue rounded-full"></div>
      </div>
    );
  }

  if (showListingForm && selectedProduct) {
    return (
      <EbayListingForm
        product={selectedProduct}
        onSuccess={(listing) => {
          showToast({
            type: 'success',
            title: '出品完了',
            message: '出品が完了しました'
          });
          setShowListingForm(false);
          setSelectedProduct(null);
          fetchProducts();
        }}
        onCancel={() => {
          setShowListingForm(false);
          setSelectedProduct(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <input
            type="text"
            placeholder="商品ID、商品名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue text-nexus-text-primary"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue text-nexus-text-primary"
          >
            <option value="all">すべて</option>
            <option value="ready">出品可能</option>
            <option value="listed">出品中</option>
            <option value="pending">処理中</option>
            <option value="error">エラー</option>
          </select>
        </div>
        <div className="flex gap-2">
          <NexusButton
            onClick={handleBatchList}
            variant="primary"
            disabled={selectedProducts.length === 0}
          >
            一括出品 ({selectedProducts.length})
          </NexusButton>
        </div>
      </div>

      {/* Product List */}
      <div className="overflow-x-auto">
        <div className="holo-table">
          <table className="w-full">
            <thead className="holo-header">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-nexus-blue rounded border-nexus-border focus:ring-nexus-blue"
                  />
                </th>
                <th className="text-left">商品情報</th>
                <th className="text-center">カテゴリー</th>
                <th className="text-left">価格</th>
                <th className="text-left">コンディション</th>
                <th className="text-center">ステータス</th>
                <th className="text-center">アクション</th>
              </tr>
            </thead>
          <tbody className="holo-body">
            {paginatedProducts.map((product) => (
              <tr key={product.id} className="holo-row">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                    className="w-4 h-4 text-nexus-blue rounded border-nexus-border focus:ring-nexus-blue"
                  />
                </td>
                <td>
                  <div>
                    <p className="font-semibold text-nexus-text-primary">
                      {product.name}
                    </p>
                    <p className="text-sm text-nexus-text-secondary">
                      {product.sku} | {product.location}
                    </p>
                  </div>
                </td>
                <td>
                  <span className="text-sm text-nexus-text-primary">
                    {product.category}
                  </span>
                </td>
                <td>
                  <span className="font-display font-bold text-nexus-text-primary">
                    ¥{product.price.toLocaleString()}
                  </span>
                </td>
                <td>
                  <span className="cert-nano cert-premium">
                    {product.condition}
                  </span>
                </td>
                <td>{getStatusBadge(product.status)}</td>
                <td className="text-right">
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowListingForm(true);
                    }}
                    disabled={product.status !== 'ready'}
                    className={`nexus-button ${product.status === 'ready' ? 'primary' : ''}`}
                  >
                    出品
                  </button>
                </td>
              </tr>
                      ))}
                </tbody>
      </table>
      </div>

      {/* ページネーション */}
      {totalItems > 0 && (
        <div className="mt-6 pt-4 border-t border-nexus-border">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}
      </div>

      {paginatedProducts.length === 0 && filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-nexus-text-secondary">該当する商品が見つかりません</p>
        </div>
      )}

      {/* Batch Listing Confirmation Modal */}
      <BaseModal
        isOpen={isBatchConfirmModalOpen}
        onClose={() => setIsBatchConfirmModalOpen(false)}
        title="一括出品確認"
        size="md"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="text-center space-y-3">
            <h3 className="text-lg font-medium text-nexus-text-primary">
              {selectedProducts.length}件の商品を一括出品しますか？
            </h3>
            <p className="text-nexus-text-secondary">
              この操作により、選択された商品がeBayに出品されます。
            </p>
          </div>
          
          <div className="flex gap-4 justify-end">
            <NexusButton
              onClick={() => setIsBatchConfirmModalOpen(false)}
              variant="default"
            >
              キャンセル
            </NexusButton>
            <NexusButton
              onClick={handleConfirmBatchList}
              variant="primary"
              icon={<ExclamationTriangleIcon className="w-5 h-5" />}
            >
              出品する
            </NexusButton>
          </div>
        </div>
      </BaseModal>
    </div>
  );
} 