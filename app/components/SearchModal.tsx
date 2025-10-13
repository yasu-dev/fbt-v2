'use client';

import { useState, useEffect } from 'react';
import { BaseModal } from './ui';

interface SearchResult {
  id: string;
  title: string;
  type: 'product' | 'task' | 'customer';
  description: string;
  url: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
}

export default function SearchModal({ isOpen, onClose, query }: SearchModalProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query && query.length > 2) {
      setLoading(true);
      // デモ検索結果
      setTimeout(() => {
        const demoResults: SearchResult[] = [
          {
            id: '1',
            title: 'Canon EOS R5',
            type: 'product' as const,
            description: 'カメラ本体 - SKU: CAM-001',
            url: '/inventory',
          },

          {
            id: '3',
            title: '顧客',
            type: 'customer' as const,
            description: '顧客 - 注文: ORD-2024-001',
            url: '/dashboard',
          },
        ].filter(item => 
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
        );
        
        setResults(demoResults);
        setLoading(false);
      }, 500);
    } else {
      setResults([]);
    }
  }, [query]);

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'task':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case 'customer':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'product':
        return '商品';
      case 'task':
        return 'タスク';
      case 'customer':
        return '顧客';
      default:
        return 'カテゴリ未設定';
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`検索結果: "${query}"`}
      size="lg"
    >
      <div className="p-6">

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-nexus-blue" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((result) => (
                <a
                  key={result.id}
                  href={result.url}
                  onClick={() => onClose()}
                  className="block p-4 rounded-lg border border-nexus-border hover:bg-nexus-bg-secondary transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 text-nexus-text-secondary">{getTypeIcon(result.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-nexus-text-primary">
                          {result.title}
                        </h4>
                        <span className="px-2 py-1 bg-nexus-blue/10 text-nexus-blue text-xs rounded-full">
                          {getTypeLabel(result.type)}
                        </span>
                      </div>
                      <p className="text-sm text-nexus-text-secondary">
                        {result.description}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-nexus-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          ) : query.length > 2 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-nexus-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-nexus-text-primary">検索結果がありません</h3>
              <p className="mt-1 text-sm text-nexus-text-secondary">
                別のキーワードで検索してみてください
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-nexus-text-secondary">
                3文字以上入力して検索してください
              </p>
            </div>
          )}
      </div>
    </BaseModal>
  );
}