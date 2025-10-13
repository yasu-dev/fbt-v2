'use client';

import { useState } from 'react';
import { BaseModal, NexusButton } from '../ui';
import { useToast } from '../features/notifications/ToastProvider';

interface ReturnItem {
  id: string;
  customerName: string;
  productName: string;
  reason: string;
  status: string;
  date: string;
  amount: string;
  orderId: string;
  description?: string;
  images?: string[];
  refundMethod?: string;
  estimatedRefund?: string;
}

interface ReturnDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnItem: ReturnItem | null;
  onStatusUpdate?: (itemId: string, newStatus: string) => void;
}

export default function ReturnDetailModal({ 
  isOpen, 
  onClose, 
  returnItem, 
  onStatusUpdate 
}: ReturnDetailModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  const { showToast } = useToast();

  if (!isOpen || !returnItem) return null;

  const handleStatusUpdate = (newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(returnItem.id, newStatus);
    }
    
    showToast({
      title: 'ステータス更新',
      message: `返品ステータスを「${newStatus}」に更新しました`,
      type: 'success'
    });
  };

  const handlePrintLabel = () => {
    const printContent = `
      返品ラベル
      
      返品ID: ${returnItem.id}
      顧客名: ${returnItem.customerName}
      商品名: ${returnItem.productName}
      注文ID: ${returnItem.orderId}
      返品理由: ${returnItem.reason}
      印刷日時: ${new Date().toLocaleString('ja-JP')}
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>返品ラベル - ${returnItem.id}</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <div style="text-align: center;">
              <h2>返品ラベル</h2>
              <div style="margin: 20px 0; padding: 20px; border: 2px solid #000;">
                <pre style="font-size: 14px; text-align: left;">${printContent}</pre>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    
    showToast({
      title: '印刷開始',
      message: '返品ラベルの印刷を開始しました',
      type: 'success'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-600 text-white';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '承認待ち';
      case 'approved':
        return '承認済み';
      case 'rejected':
        return '却下';
      case 'processing':
        return '処理中';
      case 'completed':
        return '完了';
      default:
        return status;
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`返品詳細 - ${returnItem.id}`}
      size="lg"
      className="max-w-4xl"
    >
      <div className="max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-nexus-border">
          <div className="flex-1">
            <h2 className="text-2xl font-display font-bold text-nexus-text-primary">
              {returnItem.productName}
            </h2>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(returnItem.status)}`}>
                {getStatusLabel(returnItem.status)}
              </span>
              <span className="text-sm text-nexus-text-secondary">
                注文ID: {returnItem.orderId}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-nexus-border">
          {[
            { id: 'details', label: '詳細情報' },
            { id: 'timeline', label: '履歴' }
            // 書類タブは表示しない仕様のため削除
          ].map((tab) => (
            <NexusButton
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-nexus-blue border-b-2 border-nexus-blue'
                  : 'text-nexus-text-secondary hover:text-nexus-text-primary'
              }`}
            >
              {tab.label}
            </NexusButton>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                      顧客名
                    </label>
                    <p className="text-lg text-nexus-text-primary">{returnItem.customerName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                      返品理由
                    </label>
                    <p className="text-nexus-text-primary">{returnItem.reason}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                      返品日
                    </label>
                    <p className="text-lg text-nexus-text-primary">{returnItem.date}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                      返金予定額
                    </label>
                    <p className="text-nexus-text-primary">{returnItem.amount}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                      返金方法
                    </label>
                    <p className="text-nexus-text-primary">{returnItem.refundMethod || 'クレジットカード'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                      処理期間
                    </label>
                    <p className="text-nexus-text-primary">3-5営業日</p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-3">
                  返品詳細
                </label>
                <div className="bg-nexus-bg-secondary rounded-lg p-4 border border-nexus-border">
                  <p className="text-nexus-text-primary">
                    {returnItem.description || '商品に不具合があったため、返品を希望いたします。購入後すぐに問題を発見し、使用しておりません。'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-nexus-text-primary">
                返品処理履歴
              </h3>
              
              <div className="space-y-3">
                {[
                  { date: '2024-07-05 14:30', user: 'システム', action: '返品申請を受付' },
                  { date: '2024-07-05 15:15', user: 'スタッフ', action: '初期確認完了' },
                  { date: '2024-07-05 16:00', user: 'スタッフ', action: '承認済み' },
                  { date: '2024-07-05 16:30', user: 'システム', action: '返品ラベル発行' }
                ].map((event, index) => (
                  <div key={index} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-nexus-blue rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {event.user.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-nexus-bg-primary rounded-lg p-3 border border-nexus-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-nexus-text-primary text-sm">
                            {event.user}
                          </span>
                          <span className="text-xs text-nexus-text-secondary">
                            {event.date}
                          </span>
                        </div>
                        <p className="text-sm text-nexus-text-primary">
                          {event.action}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 書類タブは表示しない仕様のため削除 */}
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t border-nexus-border">
          <div className="flex space-x-3">
            <NexusButton
              onClick={handlePrintLabel}
            >
              返品ラベル印刷
            </NexusButton>
            {returnItem.status === 'pending' && (
              <NexusButton
                onClick={() => handleStatusUpdate('approved')}
                variant="primary"
              >
                承認
              </NexusButton>
            )}
          </div>
          <div className="flex space-x-3">
            <NexusButton
              onClick={onClose}
            >
              閉じる
            </NexusButton>
            {returnItem.status !== 'completed' && (
              <NexusButton
                onClick={() => handleStatusUpdate('processing')}
                variant="primary"
              >
                処理開始
              </NexusButton>
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
}