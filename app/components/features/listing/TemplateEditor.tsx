'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ebayListingTemplates, 
  TemplateFields, 
  defaultTemplateFields,
  applyFieldsToTemplate 
} from '@/lib/templates/ebay-listing-templates';
import NexusInput from '@/app/components/ui/NexusInput';
import NexusTextarea from '@/app/components/ui/NexusTextarea';
import NexusSelect from '@/app/components/ui/NexusSelect';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusCheckbox from '@/app/components/ui/NexusCheckbox';
import { ChevronLeft, ChevronRight, Eye, Edit3, Save, RefreshCw } from 'lucide-react';

interface TemplateEditorProps {
  initialDescription?: string;
  onSave: (html: string) => void;
  onCancel: () => void;
}

export default function TemplateEditor({ 
  initialDescription = '', 
  onSave, 
  onCancel 
}: TemplateEditorProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('template1');
  const [fields, setFields] = useState<TemplateFields>(defaultTemplateFields);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  
  // Optics用のチェックボックス状態
  const [opticsChecks, setOpticsChecks] = useState({
    noFungus: true,
    noHaze: true,
    noScratches: true,
    fewDust: true,
    noProblem: true
  });

  // Optics追加コメント
  const [opticsAdditionalComment, setOpticsAdditionalComment] = useState('');

  // 選択されたテンプレートを取得
  const selectedTemplate = ebayListingTemplates.find(t => t.id === selectedTemplateId);



  // プレビューHTMLを更新
  useEffect(() => {
    if (selectedTemplate) {
      const html = applyFieldsToTemplate(selectedTemplate.html, fields);
      setPreviewHtml(html);
    }
  }, [selectedTemplate, fields]);

  // Opticsフィールドを更新
  useEffect(() => {
    const opticsText = `Beautiful condition.<br>
${opticsChecks.noFungus ? 'There is no fungus.<br>' : ''}
${opticsChecks.noHaze ? 'There is no haze.<br>' : ''}
${opticsChecks.noScratches ? 'There is no scratches.<br>' : ''}
${opticsChecks.fewDust ? 'There is a few dust.<br>' : ''}
${opticsChecks.noProblem ? '<strong>No problem in the shooting.</strong>' : ''}${opticsAdditionalComment ? '<br>' + opticsAdditionalComment.replace(/\n/g, '<br>') : ''}`;
    
    setFields(prev => ({ ...prev, optics: opticsText }));
  }, [opticsChecks, opticsAdditionalComment]);

  // スクロール連動機能
  const handleScroll = (source: 'left' | 'right') => {
    return (e: React.UIEvent<HTMLDivElement>) => {
      const sourceElement = e.target as HTMLDivElement;
      const targetElement = source === 'left' ? rightPanelRef.current : leftPanelRef.current;
      
      if (targetElement && sourceElement) {
        const scrollRatio = sourceElement.scrollTop / (sourceElement.scrollHeight - sourceElement.clientHeight);
        const targetScrollTop = scrollRatio * (targetElement.scrollHeight - targetElement.clientHeight);
        targetElement.scrollTop = targetScrollTop;
      }
    };
  };

  // フィールド変更ハンドラー
  const handleFieldChange = (fieldName: keyof TemplateFields, value: string) => {
    setFields(prev => ({ ...prev, [fieldName]: value }));
  };

  // 保存処理
  const handleSave = () => {
    onSave(previewHtml);
  };

  // リセット処理
  const handleReset = () => {
    setFields(defaultTemplateFields);
    setOpticsChecks({
      noFungus: true,
      noHaze: true,
      noScratches: true,
      fewDust: true,
      noProblem: true
    });
    setOpticsAdditionalComment('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-[#0064D2] to-[#0078FF] text-white p-4 rounded-t-lg">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">eBay出品テンプレート編集</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 text-white"
            >
              {isPreviewMode ? (
                <>
                  <Edit3 className="w-4 h-4" />
                  編集に戻る
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  プレビュー
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* テンプレート選択 */}
      <div className="p-4 bg-gray-50 border-b">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          テンプレート選択
        </label>
        <div className="grid grid-cols-5 gap-2">
          {ebayListingTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => setSelectedTemplateId(template.id)}
              className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                selectedTemplateId === template.id
                  ? 'border-[#0064D2] shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <img
                src={template.coverImage}
                alt={template.name}
                className="w-full h-20 object-cover"
              />
              <div className="p-1 text-xs text-center font-medium">
                {template.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左側：入力フォーム */}
        <div 
          ref={leftPanelRef}
          className={`${isPreviewMode ? 'hidden' : 'flex'} md:flex flex-col w-full md:w-1/2 p-4 overflow-y-auto bg-white border-r`}
          onScroll={handleScroll('left')}
        >
          <div className="space-y-4">
            {/* Item Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Title (商品タイトル)
              </label>
              <NexusInput
                value={fields.itemTitle}
                onChange={(e) => handleFieldChange('itemTitle', e.target.value)}
                placeholder="例: Canon AE-1 Program 35mm Film Camera"
              />
            </div>

            {/* Total Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Condition (全体の状態)
              </label>
              <NexusSelect
                value={fields.totalCondition}
                onChange={(e) => handleFieldChange('totalCondition', e.target.value)}
              >
                <option value="Mint condition">Mint condition (新品同様)</option>
                <option value="Near Mint condition">Near Mint condition (極美品)</option>
                <option value="Excellent condition">Excellent condition (美品)</option>
                <option value="Very Good condition">Very Good condition (良品)</option>
                <option value="Good condition">Good condition (並品)</option>
                <option value="Fair condition">Fair condition (難あり)</option>
              </NexusSelect>
            </div>

            {/* Serial Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serial Number (シリアル番号)
              </label>
              <NexusInput
                value={fields.serialNumber}
                onChange={(e) => handleFieldChange('serialNumber', e.target.value)}
                placeholder="例: 1234567"
              />
            </div>

            {/* Appearance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appearance (外観)
              </label>
              <NexusTextarea
                value={fields.appearance.replace(/<br>/g, '\n')}
                onChange={(e) => handleFieldChange('appearance', e.target.value.replace(/\n/g, '<br>'))}
                rows={4}
                placeholder="外観の状態を詳しく記載"
              />
            </div>

            {/* Optics */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Optics (光学系) - カメラ・レンズ用
              </label>
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                <NexusCheckbox
                  checked={opticsChecks.noFungus}
                  onChange={(e) => setOpticsChecks(prev => ({ ...prev, noFungus: e.target.checked }))}
                  label="No fungus (カビなし)"
                />
                <NexusCheckbox
                  checked={opticsChecks.noHaze}
                  onChange={(e) => setOpticsChecks(prev => ({ ...prev, noHaze: e.target.checked }))}
                  label="No haze (くもりなし)"
                />
                <NexusCheckbox
                  checked={opticsChecks.noScratches}
                  onChange={(e) => setOpticsChecks(prev => ({ ...prev, noScratches: e.target.checked }))}
                  label="No scratches (キズなし)"
                />
                <NexusCheckbox
                  checked={opticsChecks.fewDust}
                  onChange={(e) => setOpticsChecks(prev => ({ ...prev, fewDust: e.target.checked }))}
                  label="Few dust (チリ少量)"
                />
                <NexusCheckbox
                  checked={opticsChecks.noProblem}
                  onChange={(e) => setOpticsChecks(prev => ({ ...prev, noProblem: e.target.checked }))}
                  label="No problem in shooting (撮影に問題なし)"
                />
              </div>
              <NexusTextarea
                value={opticsAdditionalComment}
                onChange={(e) => setOpticsAdditionalComment(e.target.value)}
                rows={2}
                placeholder="追加コメント（オプション）"
                className="mt-2"
              />
            </div>

            {/* Functional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Functional (動作状態)
              </label>
              <NexusSelect
                value={fields.functional}
                onChange={(e) => handleFieldChange('functional', e.target.value)}
              >
                <option value="It works properly.">It works properly (正常動作)</option>
                <option value="It works with minor issues.">It works with minor issues (軽微な問題あり)</option>
                <option value="It has some issues.">It has some issues (問題あり)</option>
                <option value="For parts only.">For parts only (部品取り)</option>
                <option value="Not tested.">Not tested (動作未確認)</option>
              </NexusSelect>
            </div>

            {/* Bundled Items */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bundled Items (付属品)
              </label>
              <NexusTextarea
                value={fields.bundledItems.replace(/<br>/g, '\n')}
                onChange={(e) => handleFieldChange('bundledItems', e.target.value.replace(/\n/g, '<br>'))}
                rows={4}
                placeholder="付属品を記載（例: Camera body, Lens cap, Strap...）"
              />
            </div>
          </div>
        </div>

        {/* 右側：プレビュー */}
        <div 
          ref={rightPanelRef}
          className={`${isPreviewMode ? 'w-full' : 'hidden'} md:block md:w-1/2 p-4 bg-gray-50 overflow-y-auto`}
          onScroll={handleScroll('right')}
        >
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700">プレビュー</h4>
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 bg-white px-2 py-1 rounded border hover:bg-gray-50"
              >
                <RefreshCw className="w-3 h-3" />
                リセット
              </button>
            </div>
            <div className="flex-1 bg-white rounded-lg shadow-inner overflow-auto border">
              {previewHtml ? (
                <div
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                  className="w-full min-h-full"
                  style={{ 
                    fontSize: '12px',
                    lineHeight: '1.4',
                    fontFamily: 'Verdana, sans-serif'
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-40 text-gray-500">
                  プレビューを生成中...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* フッター */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex justify-end gap-2">
          <NexusButton
            variant="secondary"
            onClick={onCancel}
          >
            キャンセル
          </NexusButton>
          <NexusButton
            onClick={handleSave}
            className="bg-gradient-to-r from-[#0064D2] to-[#0078FF] text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            テンプレートを適用
          </NexusButton>
        </div>
      </div>
    </div>
  );
}
