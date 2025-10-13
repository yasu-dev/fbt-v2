'use client';

import { useState, useEffect } from 'react';
import { ebayAdapter } from '@/lib/services/adapters/ebay.adapter';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  condition: string;
  description?: string;
  imageUrl?: string;
}

interface EbayListingFormProps {
  product: Product;
  onSuccess?: (listing: any) => void;
  onCancel?: () => void;
}

interface Template {
  id: string;
  name: string;
  template: {
    title: string;
    description: string;
  };
}

export default function EbayListingForm({ product, onSuccess, onCancel }: EbayListingFormProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState(Math.floor(product.price * 0.8));
  const [buyItNowPrice, setBuyItNowPrice] = useState(product.price);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/ebay/listing');
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data.templates);
      if (data.templates.length > 0) {
        setSelectedTemplate(data.templates[0].id);
      }
    } catch (err) {
      setError('テンプレートの取得に失敗しました');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) {
        throw new Error('テンプレートが選択されていません');
      }

      const title = customTitle || template.template.title
        .replace('{name}', product.name)
        .replace('{sku}', product.sku);
        
      const description = customDescription || template.template.description
        .replace(/{name}/g, product.name)
        .replace(/{sku}/g, product.sku)
        .replace(/{condition}/g, product.condition)
        .replace(/{description}/g, product.description || '詳細は画像をご確認ください');

      // eBayアダプターを使用して出品
      const result = await ebayAdapter.createListing({
        title,
        description,
        price: buyItNowPrice,
        currency: 'JPY',
        categoryId: getCategoryId(product.category),
        condition: product.condition,
        images: product.imageUrl ? [product.imageUrl] : [],
        duration: 10, // 10日間
        shippingOptions: [
          {
            service: 'FedEx International',
            cost: 0, // Free shipping
            type: 'Flat'
          }
        ]
      });

      if (!result.success) {
        throw new Error(result.error || 'eBay出品に失敗しました');
      }

      // 出品成功後、ローカルデータベースに記録
      const response = await fetch('/api/ebay/listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          ebayListingId: result.listingId,
          ebayUrl: result.url,
          template: selectedTemplate,
          title,
          description,
          startingPrice,
          buyItNowPrice
        }),
      });

      if (!response.ok) {
        console.error('Failed to save listing to database');
      }

      if (onSuccess) {
        onSuccess({
          ...result,
          productId: product.id,
          title,
          price: buyItNowPrice
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'eBay出品中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryId = (category: string): string => {
    // カテゴリーマッピング（実際のeBayカテゴリーIDに変更する必要があります）
    const categoryMap: Record<string, string> = {
      'camera_body': '625', // Cameras & Photo > Digital Cameras
      'lens': '3323', // Lenses & Filters
      'watch': '14324', // Watches
      'accessory': '15200' // Camera Accessories
    };
    return categoryMap[category] || '625';
  };

  const getPreviewData = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return { title: '', description: '' };

    const title = customTitle || template.template.title
      .replace('{name}', product.name)
      .replace('{sku}', product.sku);
      
    const description = customDescription || template.template.description
      .replace(/{name}/g, product.name)
      .replace(/{sku}/g, product.sku)
      .replace(/{condition}/g, product.condition)
      .replace(/{description}/g, product.description || '詳細は画像をご確認ください');

    return { title, description };
  };

  return (
    <div className="intelligence-card global">
      <div className="p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-display font-bold text-nexus-text-primary">
            eBay出品設定
          </h3>
          <p className="text-nexus-text-secondary mt-1">
            商品: {product.name} (SKU: {product.sku})
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          </div>
        )}

        {/* Template Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
            出品テンプレート
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`
                  p-3 rounded-lg border-2 transition-all duration-200
                  ${selectedTemplate === template.id 
                                    ? 'border-primary-blue bg-primary-blue/5'
                : 'border-nexus-border hover:border-primary-blue/50'
                  }
                `}
              >
                <div className="text-sm font-medium text-nexus-text-primary">
                  {template.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Price Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
              開始価格
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-nexus-text-secondary">
                $
              </span>
              <input
                type="number"
                value={startingPrice}
                onChange={(e) => setStartingPrice(parseInt(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-[#0064D2] text-nexus-text-primary"
              />
            </div>
            <p className="text-xs text-nexus-text-muted mt-1">
              推奨: ${Math.floor(product.price * 0.8).toLocaleString()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
              即決価格
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-nexus-text-secondary">
                $
              </span>
              <input
                type="number"
                value={buyItNowPrice}
                onChange={(e) => setBuyItNowPrice(parseInt(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-[#0064D2] text-nexus-text-primary"
              />
            </div>
            <p className="text-xs text-nexus-text-muted mt-1">
              定価: ${product.price.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Custom Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
            カスタムタイトル（オプション）
          </label>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="テンプレートのタイトルを使用"
            className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-[#0064D2] text-nexus-text-primary"
          />
        </div>

        {/* Custom Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
            カスタム説明（オプション）
          </label>
          <textarea
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            placeholder="テンプレートの説明文を使用"
            rows={4}
            className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-[#0064D2] text-nexus-text-primary"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="nexus-button secondary"
          >
            キャンセル
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="nexus-button primary"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                出品中...
              </>
            ) : (
              'eBayに出品'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}