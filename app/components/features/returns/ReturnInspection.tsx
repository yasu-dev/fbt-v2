'use client'

import React, { useState, useEffect } from 'react'
import { Camera, CheckCircle, XCircle, AlertTriangle, Upload } from 'lucide-react'
import { ContentCard } from '@/app/components/ui'
import BaseModal from '@/app/components/ui/BaseModal'
import NexusButton from '@/app/components/ui/NexusButton'

interface InspectionItem {
  id: string
  name: string
  checked: boolean
  status: 'pass' | 'fail' | 'warning' | null
  comment?: string
}

interface ReturnProduct {
  id: string
  name: string
  sku: string
  returnReason: string
  originalCondition: string
  images: string[]
}

export function ReturnInspection() {
  const [product] = useState<ReturnProduct>({
    id: '1',
    name: 'レア・ヴィンテージ時計',
    sku: 'WTH-001',
    returnReason: '商品説明と異なる',
    originalCondition: '新品同様',
    images: []
  })

  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([
    { id: '1', name: '外観確認', checked: false, status: null },
    { id: '2', name: '動作確認', checked: false, status: null },
    { id: '3', name: '付属品確認', checked: false, status: null },
    { id: '4', name: '真贋確認', checked: false, status: null },
    { id: '5', name: '清掃状態', checked: false, status: null }
  ])

  const [photos, setPhotos] = useState<string[]>([])
  const [overallStatus, setOverallStatus] = useState<'pass' | 'fail' | 'pending'>('pending')
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  const handleItemCheck = (itemId: string, status: 'pass' | 'fail' | 'warning') => {
    setInspectionItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, checked: true, status } : item
      )
    )
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file))
      setPhotos(prev => [...prev, ...newPhotos])
    }
  }

  useEffect(() => {
    const allChecked = inspectionItems.every(item => item.checked)
    const hasFail = inspectionItems.some(item => item.status === 'fail')
    
    if (allChecked) {
      setOverallStatus(hasFail ? 'fail' : 'pass')
    }
  }, [inspectionItems])

  return (
    <div className="space-y-6">
      <div className="intelligence-card global">
        <div className="p-8">
          <h2 className="text-2xl font-display font-bold text-nexus-text-primary mb-6">返品検品</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="intelligence-card asia">
              <div className="p-8">
                <h3 className="font-semibold mb-4 text-nexus-text-primary">商品情報</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-nexus-text-secondary">商品名:</span>
                    <span className="text-nexus-text-primary font-medium">{product.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-nexus-text-secondary">SKU:</span>
                    <span className="text-nexus-text-primary font-mono">{product.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-nexus-text-secondary">返品理由:</span>
                    <span className="text-nexus-text-primary">{product.returnReason}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-nexus-text-secondary">入庫時状態:</span>
                    <span className="text-nexus-text-primary">{product.originalCondition}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="intelligence-card europe">
              <div className="p-8">
                <h3 className="font-semibold mb-4 text-nexus-text-primary">検品ステータス</h3>
                <div className={`p-8 rounded-lg ${
                  overallStatus === 'pass' ? 'bg-green-50 border border-green-200' :
                  overallStatus === 'fail' ? 'bg-red-50 border border-red-200' :
                  'bg-nexus-bg-secondary border border-nexus-border'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`action-orb ${
                      overallStatus === 'pass' ? 'green' :
                      overallStatus === 'fail' ? 'red' :
                      'blue'
                    }`}>
                      {overallStatus === 'pass' ? <CheckCircle className="w-4 h-4" /> :
                       overallStatus === 'fail' ? <XCircle className="w-4 h-4" /> :
                       <AlertTriangle className="w-4 h-4" />}
                    </div>
                    <span className={`font-semibold ${
                      overallStatus === 'pass' ? 'text-green-600' :
                      overallStatus === 'fail' ? 'text-red-600' :
                      'text-nexus-text-primary'
                    }`}>
                      {overallStatus === 'pass' ? '検品合格' :
                       overallStatus === 'fail' ? '検品不合格' :
                       '保管作業中'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold mb-4 text-nexus-text-primary">検品項目</h3>
            <div className="space-y-3">
              {inspectionItems.map(item => (
                <div key={item.id} className="intelligence-card americas">
                  <div className="p-8">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-nexus-text-primary">{item.name}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleItemCheck(item.id, 'pass')}
                          className={`p-2 rounded-lg transition-colors ${
                            item.status === 'pass' ? 'bg-green-500 text-white' : 'bg-nexus-bg-secondary text-nexus-text-secondary hover:bg-green-100'
                          }`}
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleItemCheck(item.id, 'warning')}
                          className={`p-2 rounded-lg transition-colors ${
                            item.status === 'warning' ? 'bg-yellow-500 text-white' : 'bg-nexus-bg-secondary text-nexus-text-secondary hover:bg-yellow-100'
                          }`}
                        >
                          <AlertTriangle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleItemCheck(item.id, 'fail')}
                          className={`p-2 rounded-lg transition-colors ${
                            item.status === 'fail' ? 'bg-red-500 text-white' : 'bg-nexus-bg-secondary text-nexus-text-secondary hover:bg-red-100'
                          }`}
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold mb-4 text-nexus-text-primary">写真撮影</h3>
            <div className="intelligence-card oceania">
              <div className="p-8">
                <div className="grid grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`検品写真 ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-nexus-border"
                    />
                  ))}
                  <label className="w-full h-32 bg-nexus-bg-secondary rounded-lg flex items-center justify-center cursor-pointer hover:bg-nexus-bg-tertiary transition-colors border border-nexus-border">
                    <div className="text-center">
                      <Camera className="w-6 h-6 text-nexus-text-secondary mx-auto mb-2" />
                      <span className="text-sm text-nexus-text-secondary">写真を追加</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <NexusButton
              onClick={() => setIsCancelModalOpen(true)}
              variant="default"
            >
              キャンセル
            </NexusButton>
            <NexusButton
              onClick={() => {
                if (overallStatus === 'pending') return;
                
                // 検品完了処理
                const inspectionResult = {
                  inspectionId: `INSPECT_${Date.now()}`,
                  completedAt: new Date().toISOString(),
                  status: overallStatus,
                  inspector: 'current_user', // 実際は現在のユーザーID
                  notes: '検品完了'
                };
                
                // 検品結果をローカルストレージに保存
                const existingResults = JSON.parse(localStorage.getItem('inspectionResults') || '[]');
                existingResults.push(inspectionResult);
                localStorage.setItem('inspectionResults', JSON.stringify(existingResults));
                
                alert('検品が完了しました。結果が保存されました。');
                
                // 実際の実装では親コンポーネントのコールバックを呼び出し
                // onInspectionComplete(inspectionResult);
              }}
              variant="primary"
              disabled={overallStatus === 'pending'}
            >
              検品完了
            </NexusButton>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <BaseModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="検品キャンセルの確認"
        size="md"
      >
        <div>
          <p className="text-nexus-text-primary mb-4">
            検品をキャンセルしますか？
          </p>
          <p className="text-nexus-text-secondary text-sm mb-6">
            入力内容は破棄されます。
          </p>
          <div className="flex justify-end gap-3">
            <NexusButton
              onClick={() => setIsCancelModalOpen(false)}
              variant="default"
            >
              キャンセル
            </NexusButton>
            <NexusButton
              onClick={() => {
                // 検品データをリセット
                setInspectionItems(prev => prev.map(item => ({ ...item, checked: false, status: null })));
                setPhotos([]);
                setOverallStatus('pending');
                setIsCancelModalOpen(false);
                
                // 実際の実装では親コンポーネントのコールバックを呼び出し
                if (typeof window !== 'undefined') {
                  window.history.back();
                }
              }}
              variant="danger"
            >
              破棄する
            </NexusButton>
          </div>
        </div>
      </BaseModal>
    </div>
  )
} 