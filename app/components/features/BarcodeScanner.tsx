'use client';

import { useState, useRef, useEffect } from 'react';
import { QrCode, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { NexusCard } from '@/app/components/ui';

interface BarcodeScannerProps {
  onScan: (barcode: string, productData?: any) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  scanType?: 'product' | 'location';
  enableDatabaseLookup?: boolean;
}

interface ProductData {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  location: string;
  status: string;
}

export default function BarcodeScanner({
  onScan,
  placeholder = 'バーコードをスキャンしてください',
  className = '',
  autoFocus = true,
  scanType = 'product',
  enableDatabaseLookup = true
}: BarcodeScannerProps) {
  const [value, setValue] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastScanned, setLastScanned] = useState<string>('');
  const [lastProductData, setLastProductData] = useState<ProductData | null>(null);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout>();
  const { showToast } = useToast();

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // バーコードスキャナーの入力を検知
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setIsScanning(true);

    // 既存のタイムアウトをクリア
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    // 短時間で入力が完了した場合はスキャナーからの入力と判定
    scanTimeoutRef.current = setTimeout(() => {
      const minLength = scanType === 'location' ? 4 : 8; // ロケーションは短いコードもあり得る
      if (newValue.length >= minLength) {
        handleScan(newValue);
      }
      setIsScanning(false);
    }, 100); // スキャナーは高速入力するため短いタイムアウト
  };

  // Enter キーでも確定
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value) {
      e.preventDefault();
      handleScan(value);
    }
  };

  const handleScan = async (barcode: string) => {
    // バーコード形式の検証
    if (!validateBarcode(barcode, scanType)) {
      setScanResult('error');
      showToast({
        type: 'error',
        title: 'バーコード形式エラー',
        message: `無効なバーコード形式です: ${barcode}`,
        duration: 3000
      });
      
      // エラーフィードバック
      if (inputRef.current) {
        inputRef.current.classList.add('ring-2', 'ring-red-500');
        setTimeout(() => {
          inputRef.current?.classList.remove('ring-2', 'ring-red-500');
          setValue(''); // エラー時も入力をクリア
          setScanResult(null);
        }, 1000);
      }
      return;
    }

    setLastScanned(barcode);
    setScanResult('success');
    
    try {
      let productData: ProductData | null = null;
      
      // データベース検索が有効な場合
      if (enableDatabaseLookup && scanType === 'product') {
        setIsLoading(true);
        productData = await lookupProduct(barcode);
        
        if (productData) {
          setLastProductData(productData);
          showToast({
            type: 'success',
            title: '商品情報取得成功',
            message: `${productData.name} (${productData.sku})`,
            duration: 3000
          });
        } else {
          showToast({
            type: 'warning',
            title: '商品が見つかりません',
            message: `バーコード: ${barcode}`,
            duration: 3000
          });
        }
      }
      
      // 親コンポーネントに通知
      onScan(barcode, productData);
      setValue(''); // 入力をクリア
      
      // 成功フィードバック
      if (inputRef.current) {
        inputRef.current.classList.add('ring-2', 'ring-green-500');
        setTimeout(() => {
          inputRef.current?.classList.remove('ring-2', 'ring-green-500');
          setScanResult(null);
        }, 1000);
      }
      
    } catch (error) {
      console.error('商品検索エラー:', error);
      setScanResult('error');
      showToast({
        type: 'error',
        title: '商品検索エラー',
        message: '商品情報の取得に失敗しました',
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 商品データベース検索
  const lookupProduct = async (barcode: string): Promise<ProductData | null> => {
    try {
      const response = await fetch(`/api/products/barcode/${encodeURIComponent(barcode)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // 商品が見つからない場合
        }
        throw new Error(`API エラー: ${response.status}`);
      }

      const data = await response.json();
      return data.product || null;
      
    } catch (error) {
      console.error('商品検索API エラー:', error);
      throw error;
    }
  };

  // バーコード形式の検証
  const validateBarcode = (barcode: string, type: string): boolean => {
    if (!barcode || barcode.length < 8) return false;

    if (type === 'product') {
      // 商品バーコード: JAN/EAN/UPC形式など
      return /^[0-9]{8,13}$/.test(barcode) || /^TWD-\d{8}-\d{5}$/.test(barcode);
    } else if (type === 'location') {
      // ロケーションバーコード: 独自形式（短縮/長形式の両方を許容）
      // 例: A-01, A01, A-01-001
      return /^[A-Z]-\d{2}$/.test(barcode)
        || /^[A-Z]\d{2}$/.test(barcode)
        || /^[A-Z]-\d{2}-\d{3}$/.test(barcode);
    }
    
    return true;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <QrCode className={`h-5 w-5 ${isScanning ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
            ${isScanning ? 'bg-blue-50' : 'bg-white'}
          `}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        {(isScanning || isLoading) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          </div>
        )}
        {scanResult === 'success' && !isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
        )}
        {scanResult === 'error' && !isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
        )}
      </div>
      
      {lastScanned && (
        <div className="text-sm text-gray-600">
          最後にスキャン: <span className="font-mono font-semibold">{lastScanned}</span>
        </div>
      )}
      
      {lastProductData && (
        <NexusCard className="mt-3 p-3 border-green-200 bg-nexus-bg-tertiary">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-green-600">{lastProductData.name}</h4>
              <p className="text-sm text-nexus-text-secondary">
                SKU: {lastProductData.sku} | 価格: ¥{lastProductData.price.toLocaleString()}
              </p>
              <p className="text-sm text-nexus-text-secondary">
                在庫: {lastProductData.stock}個 | 保管場所: {lastProductData.location}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                lastProductData.status === 'ready_for_listing' ? 'bg-green-100 text-green-800' :
                lastProductData.status === 'storage' ? 'bg-blue-100 text-blue-800' :
                                  lastProductData.status === 'needs_review' ? 'bg-orange-600 text-white' :
                'bg-nexus-bg-secondary text-nexus-text-secondary'
              }`}>
                {lastProductData.status === 'ready_for_listing' ? '出品準備完了' :
                 lastProductData.status === 'storage' ? '保管中' :
                 lastProductData.status === 'needs_review' ? '要確認' :
                 lastProductData.status}
              </span>
            </div>
          </div>
        </NexusCard>
      )}
      
      <div className="text-xs text-gray-500">
        {scanType === 'product' ? 
          'バーコードスキャナーで商品バーコードをスキャンするか、手入力してEnterキーを押してください' :
          'ロケーションバーコード（例: A-01）をスキャンしてください'
        }
      </div>
    </div>
  );
} 