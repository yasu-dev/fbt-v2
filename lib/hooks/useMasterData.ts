import { useState, useEffect } from 'react';

// 型定義
export interface MasterDataItem {
  id: string;
  key: string;
  nameJa: string;
  nameEn: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Carrier extends MasterDataItem {
  name: string;
  defaultRate: number;
  trackingUrl?: string;
  supportedServices: string[];
}

export interface WorkflowStep extends MasterDataItem {
  workflowType: string;
  order: number;
}

export interface LocationMaster {
  code: string;
  name: string;
  zone: string;
  productCount?: number;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  parsedValue: any;
  description?: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// カスタムフック: カテゴリー
export function useCategories(includeInactive = false) {
  const [categories, setCategories] = useState<MasterDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (includeInactive) {
          params.append('includeInactive', 'true');
        }

        const response = await fetch(`/api/master/categories?${params}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'カテゴリーの取得に失敗しました');
        }

        setCategories(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [includeInactive]);

  return { categories, loading, error, refetch: () => setLoading(true) };
}

// カスタムフック: 商品ステータス
export function useProductStatuses(includeInactive = false) {
  const [statuses, setStatuses] = useState<MasterDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (includeInactive) {
          params.append('includeInactive', 'true');
        }

        const response = await fetch(`/api/master/product-statuses?${params}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || '商品ステータスの取得に失敗しました');
        }

        setStatuses(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
  }, [includeInactive]);

  return { statuses, loading, error, refetch: () => setLoading(true) };
}

// カスタムフック: 商品状態
export function useProductConditions(includeInactive = false) {
  const [conditions, setConditions] = useState<MasterDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConditions = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (includeInactive) {
          params.append('includeInactive', 'true');
        }

        const response = await fetch(`/api/master/product-conditions?${params}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || '商品状態の取得に失敗しました');
        }

        setConditions(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchConditions();
  }, [includeInactive]);

  return { conditions, loading, error, refetch: () => setLoading(true) };
}

// カスタムフック: 配送業者
export function useCarriers(includeInactive = false) {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarriers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (includeInactive) {
          params.append('includeInactive', 'true');
        }

        const response = await fetch(`/api/master/carriers?${params}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || '配送業者の取得に失敗しました');
        }

        setCarriers(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchCarriers();
  }, [includeInactive]);

  return { carriers, loading, error, refetch: () => setLoading(true) };
}

// カスタムフック: ワークフローステップ
export function useWorkflowSteps(workflowType?: string, includeInactive = false) {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSteps = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (workflowType) {
          params.append('workflowType', workflowType);
        }
        if (includeInactive) {
          params.append('includeInactive', 'true');
        }

        const response = await fetch(`/api/master/workflow-steps?${params}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'ワークフローステップの取得に失敗しました');
        }

        setSteps(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchSteps();
  }, [workflowType, includeInactive]);

  return { steps, loading, error, refetch: () => setLoading(true) };
}

// カスタムフック: システム設定
export function useSystemSetting(key: string) {
  const [setting, setSetting] = useState<SystemSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSetting = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/master/system-settings?key=${encodeURIComponent(key)}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'システム設定の取得に失敗しました');
        }

        setSetting(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    if (key) {
      fetchSetting();
    }
  }, [key]);

  return { setting, loading, error, refetch: () => setLoading(true) };
}

// カスタムフック: 複数のシステム設定
export function useSystemSettings(type?: string, includeInactive = false) {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (type) {
          params.append('type', type);
        }
        if (includeInactive) {
          params.append('includeInactive', 'true');
        }

        const response = await fetch(`/api/master/system-settings?${params}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'システム設定の取得に失敗しました');
        }

        setSettings(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [type, includeInactive]);

  return { settings, loading, error, refetch: () => setLoading(true) };
}

export function useLocations(includeInactive = false) {
  const [locations, setLocations] = useState<LocationMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (includeInactive) {
          params.append('includeInactive', 'true');
        }

        const query = params.toString();
        const response = await fetch(`/api/locations${query ? `?${query}` : ''}`);
        if (!response.ok) {
          throw new Error('ロケーションの取得に失敗しました');
        }

        const data = await response.json();
        const mapped: LocationMaster[] = Array.isArray(data)
          ? data.map((location: any) => ({
              code: location.code,
              name: location.name,
              zone: location.zone,
              productCount: location._count?.products,
            }))
          : [];

        setLocations(mapped);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [includeInactive]);

  return {
    locations,
    loading,
    error,
    refetch: () => setLoading(true),
  };
}

// ユーティリティ関数: マスタデータから選択肢を生成
export function createSelectOptions(items: MasterDataItem[], useEnglish = false) {
  return items.map(item => ({
    value: item.key,
    label: useEnglish ? item.nameEn : item.nameJa,
  }));
}

// ユーティリティ関数: キーから名前を取得
export function getNameByKey(items: MasterDataItem[], key: string, useEnglish = false) {
  const item = items.find(item => item.key === key);
  if (!item) return key;
  return useEnglish ? item.nameEn : item.nameJa;
}

// ユーティリティ関数: 英語から日本語への変換
export function translateStatusToJapanese(items: MasterDataItem[], englishKey: string) {
  const item = items.find(item => item.nameEn.toLowerCase() === englishKey.toLowerCase() || item.key === englishKey);
  return item ? item.nameJa : englishKey;
}

// ユーティリティ関数: 日本語から英語への変換
export function translateStatusToEnglish(items: MasterDataItem[], japaneseKey: string) {
  const item = items.find(item => item.nameJa === japaneseKey || item.key === japaneseKey);
  return item ? item.nameEn : japaneseKey;
}