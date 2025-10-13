'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { MapPinIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

interface ProductStorageDetailsProps {
  productId: string;
  status: string;
}

interface StorageLocation {
  id: string;
  code: string;
  name: string;
  zone: string;
  capacity: number;
  currentCount: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface StorageData {
  currentLocation?: StorageLocation;
  storageHistory: StorageMovement[];
  storageCompleted: boolean;
  storageDate?: string;
  storageBy?: string;
}

interface StorageMovement {
  id: string;
  fromLocationId?: string;
  toLocationId: string;
  fromLocation?: StorageLocation;
  toLocation: StorageLocation;
  reason: string;
  notes?: string;
  movedBy: string;
  movedAt: string;
}

export default function ProductStorageDetails({ productId, status }: ProductStorageDetailsProps) {
  const [storageData, setStorageData] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStorageData();
  }, [productId]);

  const fetchStorageData = async () => {
    try {
      setLoading(true);
      
      // 商品情報と在庫移動履歴を取得
      const [productResponse, movementsResponse] = await Promise.all([
        fetch(`/api/products/${productId}`),
        fetch(`/api/products/${productId}/movements`)
      ]);

      let currentLocation: StorageLocation | undefined;
      let storageHistory: StorageMovement[] = [];
      let storageCompleted = false;
      let storageDate: string | undefined;
      let storageBy: string | undefined;

      // 商品の現在の保管場所を取得
      if (productResponse.ok) {
        const productData = await productResponse.json();
        
        if (productData.currentLocationId) {
          // 現在の保管場所詳細を取得
          try {
            const locationResponse = await fetch(`/api/locations/${productData.currentLocationId}`);
            if (locationResponse.ok) {
              currentLocation = await locationResponse.json();
              storageCompleted = true;
              
              // 保管完了日を取得（最新の移動記録から）
              if (productData.updatedAt) {
                storageDate = productData.updatedAt;
              }
            }
          } catch (locationError) {
            console.warn('保管場所の詳細取得に失敗:', locationError);
          }
        }

        // メタデータから保管情報を取得
        if (productData.metadata) {
          try {
            const metadata = typeof productData.metadata === 'string' 
              ? JSON.parse(productData.metadata)
              : productData.metadata;
            
            if (metadata.storageCompleted) {
              storageCompleted = metadata.storageCompleted;
            }
            if (metadata.storageDate) {
              storageDate = metadata.storageDate;
            }
            if (metadata.storageBy) {
              storageBy = metadata.storageBy;
            }
          } catch (metadataError) {
            console.warn('メタデータの解析に失敗:', metadataError);
          }
        }
      }

      // 在庫移動履歴を取得
      if (movementsResponse.ok) {
        const movementsData = await movementsResponse.json();
        if (movementsData.movements && Array.isArray(movementsData.movements)) {
          storageHistory = movementsData.movements.map((movement: any) => ({
            id: movement.id,
            fromLocationId: movement.fromLocationId,
            toLocationId: movement.toLocationId,
            fromLocation: movement.fromLocation,
            toLocation: movement.toLocation,
            reason: movement.reason || '保管場所変更',
            notes: movement.notes,
            movedBy: movement.movedBy || '不明',
            movedAt: movement.movedAt || movement.createdAt,
          }));
        }
      }

      setStorageData({
        currentLocation,
        storageHistory,
        storageCompleted,
        storageDate,
        storageBy,
      });

    } catch (error) {
      console.error('保管データ取得エラー:', error);
      setError('保管データの取得に失敗しました');
      
      // エラー時は空のデータを設定
      setStorageData({
        storageHistory: [],
        storageCompleted: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBasedMessage = () => {
    if (status === 'inbound' || status === 'pending_inspection') {
      return '検品前のため、まだ保管されていません';
    }
    if (status === 'inspecting') {
      return '検品中のため、保管が完了していない可能性があります';
    }
    if (status === 'completed' || status === 'storage') {
      return '保管完了済み';
    }
    return '保管状況を確認中';
  };



  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>保管先情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>保管先情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>保管先情報</CardTitle>
          {/* 保管先情報が表示されていない場合のみステータスを表示 */}
          {!storageData?.currentLocation && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {getStatusBasedMessage()}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 現在の保管場所 */}
        {storageData?.currentLocation ? (
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-3 border-b pb-1">
              現在の保管場所
            </h4>
            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ArchiveBoxIcon className="w-5 h-5 text-blue-600" />
                    <h5 className="font-semibold text-gray-900">
                      {storageData.currentLocation.name}
                    </h5>
                  </div>
                </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">棚番号:</span>
                  <span className="font-mono font-medium">{storageData.currentLocation.code}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">ゾーン:</span>
                  <span className="font-medium">{storageData.currentLocation.zone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">更新日:</span>
                  <span className="font-medium">
                    {new Date(storageData.currentLocation.updatedAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>

              {storageData.currentLocation.description && (
                <div className="mt-3 text-sm">
                  <span className="text-gray-600">説明:</span>
                  <p className="text-gray-700 mt-1">{storageData.currentLocation.description}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPinIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">保管場所が設定されていません</p>
            <p className="text-xs text-gray-400 mt-2">{getStatusBasedMessage()}</p>
          </div>
        )}



        {/* 保管完了情報 */}
        {storageData?.storageCompleted && storageData.storageBy && (
          <div className="text-xs text-gray-500 border-t pt-3">
            保管者: {storageData.storageBy}
            {storageData.storageDate && (
              <span> | 保管日: {new Date(storageData.storageDate).toLocaleDateString('ja-JP')}</span>
            )}
          </div>
        )}

        {/* 保管場所が存在しない場合 */}
        {!storageData?.currentLocation && (
          <div className="text-center py-8 text-gray-500">
            <p>保管情報がありません</p>
            <p className="text-xs text-gray-400 mt-1">
              ステータス: {status}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
