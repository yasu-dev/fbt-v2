'use client';

import { useState } from 'react';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusSelect from '@/app/components/ui/NexusSelect';

interface LocationCreateFormProps {
  onCreateComplete?: () => void;
}

export default function LocationCreateForm({ onCreateComplete }: LocationCreateFormProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    zone: 'A',
    capacity: '50'
  });
  const [loading, setLoading] = useState(false);

  const zoneOptions = [
    { value: 'A', label: '標準棚' },
    { value: 'B', label: '標準棚' },
    { value: 'C', label: '標準棚' },
    { value: 'H', label: '防湿庫' },
    { value: 'T', label: '温度管理庫' },
    { value: 'V', label: '金庫室' },
    { value: 'P', label: '作業エリア' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim() || !formData.name.trim()) {
      showToast({
        type: 'error',
        title: 'エラー',
        message: 'ロケーションコードと名前は必須です',
        duration: 4000
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code.toUpperCase().trim(),
          name: formData.name.trim(),
          zone: formData.zone,
          capacity: parseInt(formData.capacity)
        })
      });

      if (response.ok) {
        showToast({
          type: 'success',
          title: 'ロケーション作成完了',
          message: `${formData.name}を作成しました`,
          duration: 3000
        });

        // フォームリセット
        setFormData({
          code: '',
          name: '',
          zone: 'A',
          capacity: '50'
        });

        if (onCreateComplete) {
          onCreateComplete();
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'ロケーション作成に失敗しました');
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'エラー',
        message: error instanceof Error ? error.message : 'ロケーション作成中にエラーが発生しました',
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="intelligence-card oceania">
      <div className="p-8">
        <h2 className="text-xl font-display font-bold text-nexus-text-primary mb-6">
          新しいロケーションを追加
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-nexus-text-primary mb-2">
                ロケーションコード *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:outline-none focus:border-nexus-yellow focus:ring-2 focus:ring-nexus-yellow/20 text-nexus-text-primary font-mono"
                placeholder="例: STD-A-01, HUM-01"
                required
                disabled={loading}
              />
              <p className="text-xs text-nexus-text-secondary mt-1">
                英数字とハイフンのみ使用可能
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-nexus-text-primary mb-2">
                ロケーション名 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:outline-none focus:border-nexus-yellow focus:ring-2 focus:ring-nexus-yellow/20 text-nexus-text-primary"
                placeholder="例: 標準棚A-01"
                required
                disabled={loading}
              />
            </div>

            <div>
              <NexusSelect
                label="タイプ *"
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                options={zoneOptions}
                variant="nexus"
                useCustomDropdown={true}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-nexus-text-primary mb-2">
                容量
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:outline-none focus:border-nexus-yellow focus:ring-2 focus:ring-nexus-yellow/20 text-nexus-text-primary"
                placeholder="50"
                min="1"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <NexusButton
              type="button"
              onClick={() => {
                setFormData({
                  code: '',
                  name: '',
                  zone: 'A',
                  capacity: '50'
                });
              }}
              variant="default"
              disabled={loading}
            >
              リセット
            </NexusButton>
            <NexusButton
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? '作成中...' : '作成する'}
            </NexusButton>
          </div>
        </form>
      </div>
    </div>
  );
}