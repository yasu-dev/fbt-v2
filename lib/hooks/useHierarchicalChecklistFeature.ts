'use client';

import { useState, useEffect } from 'react';

/**
 * 階層型検品チェックリストのフィーチャーフラグ管理フック
 * 既存システムと新システムの切り替えを安全に制御
 */

interface FeatureFlagData {
  enabled: boolean;
  key: string;
  description: string;
  lastUpdated: string;
}

interface UseHierarchicalChecklistFeatureReturn {
  isEnabled: boolean;
  loading: boolean;
  error: string | null;
  toggle: (enabled: boolean) => Promise<boolean>;
  refresh: () => void;
}

export function useHierarchicalChecklistFeature(): UseHierarchicalChecklistFeatureReturn {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // フィーチャーフラグの状態取得
  const fetchFlag = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/feature-flags/hierarchical-checklist');
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'フィーチャーフラグの取得に失敗しました');
      }

      const flagData: FeatureFlagData = result.data;
      setIsEnabled(flagData.enabled);
      console.log(`[HOOK] 階層型検品チェックリスト: ${flagData.enabled ? '有効' : '無効'}`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setError(errorMessage);
      console.error('[HOOK ERROR] フィーチャーフラグ取得エラー:', errorMessage);
      
      // エラー時は安全のため既存システムを使用（false）
      setIsEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  // フィーチャーフラグの切り替え
  const toggle = async (enabled: boolean): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log(`[HOOK] 階層型検品チェックリストを${enabled ? '有効化' : '無効化'}中...`);

      const response = await fetch('/api/feature-flags/hierarchical-checklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'フィーチャーフラグの切り替えに失敗しました');
      }

      const flagData: FeatureFlagData = result.data;
      setIsEnabled(flagData.enabled);

      console.log(`[HOOK] 階層型検品チェックリスト: ${flagData.enabled ? '有効化完了' : '無効化完了'}`);
      
      return flagData.enabled;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setError(errorMessage);
      console.error('[HOOK ERROR] フィーチャーフラグ切り替えエラー:', errorMessage);
      
      // エラー時は変更せず現在の状態を維持
      return isEnabled;
    } finally {
      setLoading(false);
    }
  };

  // 状態の再取得
  const refresh = () => {
    fetchFlag();
  };

  // 初回ロード時にフラグを取得
  useEffect(() => {
    fetchFlag();
  }, []);

  return {
    isEnabled,
    loading,
    error,
    toggle,
    refresh
  };
}

// ヘルパー関数：フィーチャーフラグの状態のみを取得
export function useIsHierarchicalChecklistEnabled(): boolean {
  const { isEnabled } = useHierarchicalChecklistFeature();
  return isEnabled;
}
