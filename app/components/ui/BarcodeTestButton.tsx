'use client';

import { useState } from 'react';
import NexusButton from './NexusButton';
import { CameraIcon, WrenchScrewdriverIcon, BeakerIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

interface BarcodeTestItem {
  label: string;
  code: string;
  description?: string;
}

interface BarcodeTestButtonProps {
  className?: string;
}

export default function BarcodeTestButton({ className = '' }: BarcodeTestButtonProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { showToast } = useToast();

  // バーコードスキャンをシミュレートする関数
  const simulateBarcodeScanner = async (barcode: string) => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    
    try {
      console.log(`[バーコードシミュレーター] シミュレーション開始: ${barcode}`);
      
      // 高速キー入力をシミュレート
      for (let i = 0; i < barcode.length; i++) {
        const keyEvent = new KeyboardEvent('keypress', {
          key: barcode[i],
          code: `Key${barcode[i].toUpperCase()}`,
          which: barcode.charCodeAt(i),
          keyCode: barcode.charCodeAt(i),
          bubbles: true,
          cancelable: true
        });
        
        window.dispatchEvent(keyEvent);
        
        // バーコードリーダーの高速入力を再現（短い間隔）
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Enterキーを送信
      const enterEvent = new KeyboardEvent('keypress', {
        key: 'Enter',
        code: 'Enter',
        which: 13,
        keyCode: 13,
        bubbles: true,
        cancelable: true
      });
      
      window.dispatchEvent(enterEvent);
      
      console.log(`[バーコードシミュレーター] シミュレーション完了: ${barcode}`);
    } catch (error) {
      console.error('[バーコードシミュレーター] エラー:', error);
    } finally {
      setTimeout(() => setIsSimulating(false), 500);
    }
  };

  const testBarcodes = [
    // === 自動判断テストケース ===
    { 
      label: '【テスト1】倉庫納品直後', 
      code: 'CAM-NIKON-Z8-004',
      description: '検品項目タブが開くはず (status: inbound)'
    },
    { 
      label: '【テスト2】検品完了済み', 
      code: 'CAM-CANON-R6M2-003',
      description: '棚保管タブが開くはず (status: storage, 検品済み)'
    },
    
    // === その他のテスト商品 ===
    { label: 'Sony A7II', code: 'CAM-SONY-A7II-002' },
    { label: 'Nikon ZF', code: 'CAM-NIKON-ZF-009' },
    { label: 'Fujifilm XT5', code: 'CAM-FUJIFILM-XT5-005' },
  ];

  // 最小化時の表示
  if (!isExpanded) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 border-2 border-blue-500 hover:scale-105"
          title="バーコードテスターを展開"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 6h-1m-6 6v1m-6-6h1m6-6l-3 3m0 6l3-3m-6-3l3 3m6 0l-3-3" />
          </svg>
        </button>
      </div>
    );
  }

  // 展開時の表示
  return (
    <div className={`fixed bottom-4 right-4 z-50 bg-white shadow-xl rounded-lg border-2 border-dashed border-blue-300 transition-all duration-300 transform ${className}`}>
      {/* ヘッダー部分（折り畳みボタン付き） */}
      <div className="bg-blue-50 p-3 rounded-t-lg border-b border-blue-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WrenchScrewdriverIcon className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-blue-800">バーコードテスター</h3>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-1 rounded transition-colors"
          title="最小化"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {/* コンテンツ部分 */}
      <div className="p-4">
        <p className="text-xs text-gray-600 mb-3">バーコードリーダーの代替ツール</p>
      
      <div className="space-y-2">
        {testBarcodes.map((item, index) => (
          <NexusButton
            key={index}
            onClick={() => simulateBarcodeScanner(item.code)}
            disabled={isSimulating}
            size="sm"
            variant={item.label.includes('【テスト') ? 'primary' : 'outline'}
            className={`w-full text-left justify-start text-xs ${
              item.label.includes('【テスト') ? 'bg-green-600 hover:bg-green-700 text-white' : ''
            }`}
          >
            <CameraIcon className={`w-4 h-4 mr-2 ${
              item.label.includes('【テスト') ? 'text-white' : 'text-gray-600'
            }`} />
            <div className="flex-1 text-left">
              <div>{item.label}</div>
              {item.description && (
                <div className={`text-xs ${
                  item.label.includes('【テスト') ? 'text-green-200' : 'text-gray-400'
                }`}>
                  {item.description}
                </div>
              )}
            </div>
            <span className={`text-xs ml-2 ${
              item.label.includes('【テスト') ? 'text-green-200' : 'text-gray-400'
            }`}>
              {item.code}
            </span>
          </NexusButton>
        ))}
        
        <div className="border-t pt-2 mt-2">
          <NexusButton
            onClick={() => simulateBarcodeScanner('CUSTOM-TEST-001')}
            disabled={isSimulating}
            size="sm"
            variant="secondary"
            className="w-full text-xs"
          >
            <BeakerIcon className="w-4 h-4 mr-2 text-gray-600" />
            カスタムテスト
          </NexusButton>
        </div>
      </div>
      
              {isSimulating && (
          <div className="mt-3 text-xs text-blue-600 flex items-center justify-center bg-blue-50 p-2 rounded">
            <div className="animate-spin h-3 w-3 border border-blue-600 rounded-full border-t-transparent mr-2"></div>
            スキャン中...
          </div>
        )}
      </div>
    </div>
  );
}


