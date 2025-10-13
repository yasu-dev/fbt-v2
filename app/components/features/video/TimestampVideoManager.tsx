'use client';

import { useState, useEffect } from 'react';
import { Video, Play, Calendar, User, Clock, MapPin, FileText, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { NexusButton, NexusCard } from '@/app/components/ui';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

interface VideoTimestamp {
  id: string;
  timestamp: string;
  description: string;
  s3VideoPath: string;
  isPlaying?: boolean;
}

interface VideoRecord {
  id: string;
  productId?: string;
  orderId?: string;
  type: 'inspection' | 'packing' | 'shipping' | 'other';
  sessionId?: string;
  timestamps: VideoTimestamp[];
  s3VideoPath?: string;
  staffId: string;
  staffName?: string;
  notes?: string;
  createdAt: string;
}

interface TimestampVideoManagerProps {
  productId?: string;
  orderId?: string;
  className?: string;
}

export default function TimestampVideoManager({
  productId,
  orderId,
  className = ''
}: TimestampVideoManagerProps) {
  const { showToast } = useToast();
  const [records, setRecords] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [videoPlayer, setVideoPlayer] = useState<string>('');

  useEffect(() => {
    fetchVideoRecords();
  }, [productId, orderId]);

  const fetchVideoRecords = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (productId) params.append('productId', productId);
      if (orderId) params.append('orderId', orderId);

      const response = await fetch(`/api/videos/timestamps?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
      }
    } catch (error) {
      console.error('Failed to fetch video records:', error);
      showToast({
        title: 'エラー',
        message: '動画記録の取得に失敗しました',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const playVideoFromTimestamp = async (timestamp: VideoTimestamp) => {
    try {
      const response = await fetch('/api/videos/s3-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          s3Path: timestamp.s3VideoPath,
          timestamp: timestamp.timestamp
        })
      });

      if (!response.ok) {
        throw new Error('動画の取得に失敗しました');
      }

      const { signedUrl, seekTime } = await response.json();
      
      // 動画プレーヤーを設定
      setVideoPlayer(signedUrl);
      
      // 少し待ってからシーク
      setTimeout(() => {
        const videoElement = document.getElementById('video-player') as HTMLVideoElement;
        if (videoElement) {
          videoElement.currentTime = seekTime;
          videoElement.play();
        }
      }, 1000);

      showToast({
        title: '動画再生開始',
        message: `${formatTimestamp(new Date(timestamp.timestamp))} から再生`,
        type: 'info'
      });
    } catch (error) {
      console.error('Video playback error:', error);
      showToast({
        title: '動画再生エラー',
        message: '動画の再生に失敗しました',
        type: 'error'
      });
    }
  };

  const recordingTypes = {
    inspection: { 
      label: '検品', 
      color: 'text-blue-600 bg-blue-50 border-blue-200', 
      icon: <Video className="w-4 h-4" />
    },
    packing: { 
      label: '梱包', 
      color: 'text-green-600 bg-green-50 border-green-200', 
      icon: <FileText className="w-4 h-4" />
    },
    shipping: { 
      label: '出荷', 
      color: 'text-purple-600 bg-purple-50 border-purple-200', 
      icon: <MapPin className="w-4 h-4" />
    },
    other: { 
      label: 'その他', 
      color: 'text-gray-600 bg-gray-50 border-gray-200', 
      icon: <Clock className="w-4 h-4" />
    }
  };

  const filteredRecords = selectedType === 'all' 
    ? records 
    : records.filter(r => r.type === selectedType);

  const formatTimestamp = (date: Date): string => {
    return format(date, 'yyyy/MM/dd HH:mm:ss', { locale: ja });
  };

  const toggleExpanded = (recordId: string) => {
    setExpandedRecord(expandedRecord === recordId ? null : recordId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">タイムスタンプ動画記録</h3>
          <span className="text-sm text-gray-500">({records.length}件)</span>
        </div>
        
        {/* タイプフィルター */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1 rounded-full text-sm transition ${
              selectedType === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            すべて
          </button>
          {Object.entries(recordingTypes).map(([type, config]) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-full text-sm transition flex items-center gap-1 ${
                selectedType === type 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {config.icon}
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* 動画プレーヤー */}
      {videoPlayer && (
        <NexusCard className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">動画再生</h4>
              <button
                onClick={() => setVideoPlayer('')}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-black rounded-lg overflow-hidden">
              <video
                id="video-player"
                src={videoPlayer}
                controls
                className="w-full aspect-video"
                onLoadedMetadata={(e) => {
                  console.log('Video loaded:', e.currentTarget.duration);
                }}
              />
            </div>
          </div>
        </NexusCard>
      )}

      {/* 動画記録リスト */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <NexusCard className="p-8 text-center">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">該当する動画記録がありません</p>
          </NexusCard>
        ) : (
          filteredRecords.map((record) => {
            const config = recordingTypes[record.type as keyof typeof recordingTypes];
            const isExpanded = expandedRecord === record.id;
            
            return (
              <NexusCard key={record.id} className="p-4">
                <div className="space-y-3">
                  {/* 記録ヘッダー */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${config.color}`}>
                        {config.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${config.color}`}>
                            {config.label}
                          </span>
                          <span className="text-sm text-gray-500">
                            セッション: {record.sessionId || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(record.createdAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {record.staffName || `Staff ${record.staffId}`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {record.timestamps.length} タイムスタンプ
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleExpanded(record.id)}
                      className="p-2 rounded-full hover:bg-gray-100 transition"
                    >
                      <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  </div>

                  {/* 展開されたタイムスタンプ */}
                  {isExpanded && (
                    <div className="border-t pt-3">
                      {record.timestamps.length === 0 ? (
                        <p className="text-gray-500 text-sm">タイムスタンプがありません</p>
                      ) : (
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm">記録されたタイムスタンプ</h5>
                          {record.timestamps.map((timestamp, index) => (
                            <div
                              key={timestamp.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="text-sm text-gray-500">
                                  {formatTimestamp(new Date(timestamp.timestamp))}
                                </div>
                                <div className="font-medium text-sm">
                                  {timestamp.description}
                                </div>
                              </div>
                              <NexusButton
                                onClick={() => playVideoFromTimestamp(timestamp)}
                                variant="secondary"
                                size="sm"
                                icon={<Play className="w-3 h-3" />}
                              >
                                再生
                              </NexusButton>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </NexusCard>
            );
          })
        )}
      </div>
    </div>
  );
} 