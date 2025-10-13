'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import UnifiedPageHeader from '../../components/ui/UnifiedPageHeader';
import { NexusButton, NexusSelect, NexusInput } from '../../components/ui';
import Pagination from '../../components/ui/Pagination';
import ListingTemplateEditor from '../../components/features/listing/ListingTemplateEditor';
import ListingManager from '../../components/features/listing/ListingManager';
import { 
  DocumentTextIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowPathIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface ListingTemplate {
  id: string;
  name: string;
  category: string;
  platform: string;
  basePrice: number;
  currency: string;
  condition: string;
  shippingMethod: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  appliedCount: number;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  condition: string;
  status: string;
  location: string;
  lastUpdated: string;
}

type SortField = 'name' | 'category' | 'price' | 'condition' | 'status' | 'lastUpdated';
type SortDirection = 'asc' | 'desc';

export default function ListingPage() {
  const router = useRouter();
  
  // 直接アクセスを防ぐ
  useEffect(() => {
    // 業務フローから遷移したかチェック
    const isFromValidFlow = sessionStorage.getItem('fromInventoryFlow');
    
    if (!isFromValidFlow) {
      // 直接アクセスの場合はダッシュボードへリダイレクト
      router.push('/staff/dashboard');
    } else {
      // 一度使用したら削除
      sessionStorage.removeItem('fromInventoryFlow');
    }
  }, [router]);

  const [templates, setTemplates] = useState<ListingTemplate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<'templates' | 'products'>('products');
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'ebay' | 'amazon' | 'mercari' | 'yahoo'>('all');

  // フィルター・ソート・ページング状態
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // APIからデータを取得
      const response = await fetch('/api/listing');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
        setProducts(data.products || []);
        setStats(data.stats || {
          totalActive: 0,
          pendingListing: 0,
          soldThisMonth: 0,
          averagePrice: 0,
          platforms: { ebay: 0, amazon: 0, mercari: 0, yahoo: 0 }
        });
        return;
      }
      
      // フォールバック用のモックデータ
      const mockTemplates: ListingTemplate[] = [
        {
          id: 'TPL-001',
          name: 'カメラボディ標準テンプレート',
          category: 'camera_body',
          platform: 'ebay',
          basePrice: 100000,
          currency: 'JPY',
          condition: 'Used - Excellent',
          shippingMethod: 'FedEx International',
          isActive: true,
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20',
          appliedCount: 45,
        },
        {
          id: 'TPL-002',
          name: 'レンズ出品テンプレート',
          category: 'lens',
          platform: 'amazon',
          basePrice: 50000,
          currency: 'JPY',
          condition: 'Used - Very Good',
          shippingMethod: 'DHL Express',
          isActive: true,
          createdAt: '2024-01-10',
          updatedAt: '2024-01-18',
          appliedCount: 32,
        },
        {
          id: 'TPL-003',
          name: '腕時計出品テンプレート',
          category: 'watch',
          platform: 'ebay',
          basePrice: 150000,
          currency: 'JPY',
          condition: 'Used - Good',
          shippingMethod: 'EMS',
          isActive: false,
          createdAt: '2024-01-08',
          updatedAt: '2024-01-15',
          appliedCount: 18,
        },
        {
          id: 'TPL-004',
          name: 'アクセサリー出品テンプレート',
          category: 'accessory',
          platform: 'mercari',
          basePrice: 25000,
          currency: 'JPY',
          condition: 'Used - Fair',
          shippingMethod: 'Japan Post',
          isActive: true,
          createdAt: '2024-01-05',
          updatedAt: '2024-01-12',
          appliedCount: 12,
        },
      ];

      const mockProducts: Product[] = [
        {
          id: '1',
          sku: 'TWD-CAM-001',
          name: 'Canon EOS R5',
          category: 'カメラ本体',
          price: 450000,
          condition: 'A',
          status: 'ready',
          location: 'A-01',
          lastUpdated: '2024-06-28T10:00:00',
        },
        {
          id: '2',
          sku: 'TWD-LEN-005',
          name: 'Canon RF 24-70mm F2.8',
          category: 'レンズ',
          price: 198000,
          condition: 'A+',
          status: 'listed',
          location: 'A-15',
          lastUpdated: '2024-06-27T14:30:00',
        },
        {
          id: '3',
          sku: 'TWD-WAT-007',
          name: 'Rolex GMT Master',
          category: '腕時計',
          price: 2100000,
          condition: 'S',
          status: 'pending',
          location: 'V-03',
          lastUpdated: '2024-06-27T09:00:00',
        },
        {
          id: '4',
          sku: 'TWD-CAM-012',
          name: 'Sony α7R V',
          category: 'カメラ本体',
          price: 320000,
          condition: 'B+',
          status: 'ready',
          location: 'H2-08',
          lastUpdated: '2024-06-25T16:00:00',
        },
        {
          id: '5',
          sku: 'TWD-LEN-008',
          name: 'Nikon NIKKOR Z 50mm f/1.2',
          category: 'レンズ',
          price: 245000,
          condition: 'A',
          status: 'error',
          location: 'A-22',
          lastUpdated: '2024-06-24T11:20:00',
        },
        {
          id: '6',
          sku: 'TWD-WAT-015',
          name: 'Omega Speedmaster',
          category: '腕時計',
          price: 850000,
          condition: 'A-',
          status: 'listed',
          location: 'V-07',
          lastUpdated: '2024-06-23T15:45:00',
        },
        {
          id: '7',
          sku: 'TWD-CAM-018',
          name: 'Fujifilm X-T5',
          category: 'カメラ本体',
          price: 180000,
          condition: 'B',
          status: 'ready',
          location: 'H2-12',
          lastUpdated: '2024-06-22T09:30:00',
        },
        {
          id: '8',
          sku: 'TWD-LEN-021',
          name: 'Sony FE 85mm f/1.4 GM',
          category: 'レンズ',
          price: 155000,
          condition: 'A',
          status: 'pending',
          location: 'A-35',
          lastUpdated: '2024-06-21T13:10:00',
        },
        {
          id: '9',
          sku: 'TWD-WAT-025',
          name: 'Seiko Prospex',
          category: '腕時計',
          price: 65000,
          condition: 'B+',
          status: 'ready',
          location: 'V-12',
          lastUpdated: '2024-06-20T16:00:00',
        },
        {
          id: '10',
          sku: 'TWD-CAM-030',
          name: 'Leica Q2',
          category: 'カメラ本体',
          price: 750000,
          condition: 'A+',
          status: 'listed',
          location: 'H2-18',
          lastUpdated: '2024-06-19T10:45:00',
        },
        {
          id: '11',
          sku: 'TWD-LEN-033',
          name: 'Canon EF 70-200mm f/2.8L',
          category: 'レンズ',
          price: 125000,
          condition: 'B',
          status: 'error',
          location: 'A-45',
          lastUpdated: '2024-06-18T14:20:00',
        },
        {
          id: '12',
          sku: 'TWD-WAT-038',
          name: 'Casio G-Shock',
          category: '腕時計',
          price: 35000,
          condition: 'B-',
          status: 'ready',
          location: 'V-20',
          lastUpdated: '2024-06-17T11:15:00',
        },
        {
          id: '13',
          sku: 'TWD-CAM-042',
          name: 'Panasonic GH6',
          category: 'カメラ本体',
          price: 220000,
          condition: 'A-',
          status: 'pending',
          location: 'H2-25',
          lastUpdated: '2024-06-16T08:50:00',
        },
        {
          id: '14',
          sku: 'TWD-LEN-046',
          name: 'Sigma 24-70mm f/2.8 DG DN',
          category: 'レンズ',
          price: 95000,
          condition: 'A',
          status: 'listed',
          location: 'A-52',
          lastUpdated: '2024-06-15T12:30:00',
        },
        {
          id: '15',
          sku: 'TWD-WAT-050',
          name: 'Citizen Eco-Drive',
          category: '腕時計',
          price: 42000,
          condition: 'B+',
          status: 'ready',
          location: 'V-28',
          lastUpdated: '2024-06-14T17:05:00',
        },
      ];

      setTemplates(mockTemplates);
      setProducts(mockProducts);
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // カテゴリー一覧を取得
  const categoryOptions = useMemo(() => {
    const categories = Array.from(new Set(products.map(product => product.category)));
    return [
      { value: 'all', label: 'すべてのカテゴリー' },
      ...categories.map(category => ({ value: category, label: category }))
    ];
  }, [products]);

  // フィルタリング
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // プラットフォームフィルター（テンプレート用）
    if (selectedPlatform !== 'all') {
      // プロダクト表示の場合は無視
    }

    // カテゴリーフィルター
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // ステータスフィルター
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(product => product.status === selectedStatus);
    }

    // コンディションフィルター
    if (selectedCondition !== 'all') {
      filtered = filtered.filter(product => product.condition === selectedCondition);
    }

    // 検索フィルター
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, selectedPlatform, selectedCategory, selectedStatus, selectedCondition, searchQuery]);

  // ソート
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'condition':
          aValue = a.condition;
          bValue = b.condition;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'lastUpdated':
          aValue = new Date(a.lastUpdated);
          bValue = new Date(b.lastUpdated);
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredProducts, sortField, sortDirection]);

  // ページネーション
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedProducts.slice(startIndex, endIndex);
  }, [sortedProducts, currentPage, itemsPerPage]);

  // フィルター変更時はページを1に戻す
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedStatus, selectedCondition, searchQuery]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4" />
    ) : (
      <ChevronDownIcon className="w-4 h-4" />
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'listed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-600 text-white';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ready': return '出品可能';
      case 'listed': return '出品中';
      case 'pending': return '処理中';
      case 'error': return 'エラー';
      default: return status;
    }
  };

  const headerActions = (
    <div className="flex gap-2">
      <NexusButton
        onClick={() => setViewMode('templates')}
        variant={viewMode === 'templates' ? 'primary' : 'default'}
        size="sm"
      >
        テンプレート
      </NexusButton>
      <NexusButton
        onClick={() => setViewMode('products')}
        variant={viewMode === 'products' ? 'primary' : 'default'}
        size="sm"
      >
        商品一覧
      </NexusButton>
    </div>
  );

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        <UnifiedPageHeader
          title="出品管理"
          subtitle="商品の出品・テンプレート管理"
          userType="staff"
          iconType="listing"
          actions={headerActions}
        />

        {viewMode === 'templates' ? (
          <div className="space-y-6">
            {/* テンプレート用フィルター */}
            <div className="bg-white rounded-xl border border-nexus-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <FunnelIcon className="w-5 h-5 text-nexus-text-secondary" />
                <h3 className="text-lg font-medium text-nexus-text-primary">テンプレートフィルター</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NexusSelect
                  label="プラットフォーム"
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value as any)}
                  options={[
                    { value: 'all', label: 'すべてのプラットフォーム' },
                    { value: 'ebay', label: 'eBay' },
                    { value: 'amazon', label: 'Amazon' },
                    { value: 'mercari', label: 'メルカリ' },
                    { value: 'yahoo', label: 'Yahoo!オークション' }
                  ]}
                />
                
                <NexusInput
                  type="text"
                  label="検索"
                  placeholder="テンプレート名で検索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <ListingTemplateEditor />
          </div>
        ) : (
          <div className="space-y-6">
            {/* 商品用フィルター */}
            <div className="bg-white rounded-xl border border-nexus-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <FunnelIcon className="w-5 h-5 text-nexus-text-secondary" />
                <h3 className="text-lg font-medium text-nexus-text-primary">商品フィルター・検索</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <NexusSelect
                  label="カテゴリー"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  options={categoryOptions}
                />

                <NexusSelect
                  label="ステータス"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  options={[
                    { value: 'all', label: 'すべてのステータス' },
                    { value: 'ready', label: '出品可能' },
                    { value: 'listed', label: '出品中' },
                    { value: 'pending', label: '処理中' },
                    { value: 'error', label: 'エラー' }
                  ]}
                />

                <NexusSelect
                  label="コンディション"
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  options={[
                    { value: 'all', label: 'すべてのコンディション' },
                    { value: 'S', label: 'S (新品同様)' },
                    { value: 'A+', label: 'A+ (極美品)' },
                    { value: 'A', label: 'A (美品)' },
                    { value: 'A-', label: 'A- (良品)' },
                    { value: 'B+', label: 'B+ (やや難あり)' },
                    { value: 'B', label: 'B (難あり)' },
                    { value: 'B-', label: 'B- (ジャンク)' }
                  ]}
                />

                <NexusInput
                  type="text"
                  label="検索"
                  placeholder="商品名・SKU・カテゴリーで検索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* 商品一覧テーブル */}
            <div className="bg-white rounded-xl border border-nexus-border p-6">

              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-nexus-border">
                      <th className="text-left p-4 font-medium text-nexus-text-secondary">SKU</th>
                      <th 
                        className="text-left p-4 font-medium text-nexus-text-secondary cursor-pointer hover:bg-nexus-bg-tertiary"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          商品
                          {getSortIcon('name')}
                        </div>
                      </th>
                      <th 
                        className="text-left p-4 font-medium text-nexus-text-secondary cursor-pointer hover:bg-nexus-bg-tertiary"
                        onClick={() => handleSort('category')}
                      >
                        <div className="flex items-center gap-1">
                          カテゴリー
                          {getSortIcon('category')}
                        </div>
                      </th>
                      <th 
                        className="text-right p-4 font-medium text-nexus-text-secondary cursor-pointer hover:bg-nexus-bg-tertiary"
                        onClick={() => handleSort('price')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          価格
                          {getSortIcon('price')}
                        </div>
                      </th>
                      <th 
                        className="text-center p-4 font-medium text-nexus-text-secondary cursor-pointer hover:bg-nexus-bg-tertiary"
                        onClick={() => handleSort('condition')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          コンディション
                          {getSortIcon('condition')}
                        </div>
                      </th>
                      <th 
                        className="text-center p-4 font-medium text-nexus-text-secondary cursor-pointer hover:bg-nexus-bg-tertiary"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          ステータス
                          {getSortIcon('status')}
                        </div>
                      </th>
                      <th 
                        className="text-center p-4 font-medium text-nexus-text-secondary cursor-pointer hover:bg-nexus-bg-tertiary"
                        onClick={() => handleSort('lastUpdated')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          最終更新
                          {getSortIcon('lastUpdated')}
                        </div>
                      </th>
                      <th className="text-center p-4 font-medium text-nexus-text-secondary">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map((product) => (
                      <tr key={product.id} className="border-b border-nexus-border hover:bg-nexus-bg-tertiary">
                        <td className="p-4">
                          <span className="font-mono text-sm text-nexus-text-primary">{product.sku}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-nexus-text-primary">{product.name}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-nexus-text-primary">{product.category}</span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="font-bold text-nexus-text-primary">${product.price.toLocaleString()}</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-medium">
                            {product.condition}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                            {getStatusLabel(product.status)}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-sm text-nexus-text-secondary">
                            {new Date(product.lastUpdated).toLocaleDateString('ja-JP')}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <NexusButton
                              size="sm"
                              variant="default"
                              icon={<EyeIcon className="w-4 h-4" />}
                            >
                              詳細
                            </NexusButton>
                            <NexusButton
                              size="sm"
                              variant="primary"
                              icon={<ArrowPathIcon className="w-4 h-4" />}
                              disabled={product.status === 'listed'}
                            >
                              出品
                            </NexusButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginatedProducts.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-nexus-text-secondary">
                          {filteredProducts.length === 0 ? 
                            (searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedCondition !== 'all'
                              ? '検索条件に一致する商品がありません' 
                              : '出品可能な商品がありません'
                            ) : '表示するデータがありません'
                          }
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ページネーション */}
              {filteredProducts.length > 0 && (
                <div className="mt-6 pt-4 border-t border-nexus-border">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredProducts.length / itemsPerPage)}
                    totalItems={filteredProducts.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 