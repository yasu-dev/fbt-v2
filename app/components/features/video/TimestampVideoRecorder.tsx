'use client';

import { useState } from 'react';
import { Clock, Video, Play, Calendar, Trash2 } from 'lucide-react';
import { NexusButton, NexusCard, NexusInput } from '@/app/components/ui';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { useAlert } from '@/app/components/ui/AlertProvider';

interface VideoTimestamp {
  id: string;
  timestamp: string; // ISO datetime string
  description: string;
  s3VideoPath: string;
  isPlaying?: boolean;
}

interface TimestampVideoRecorderProps {
  productId: string;
  phase: 'phase2' | 'phase4';
  type: 'inspection' | 'packing';
  onRecordingComplete?: (timestamps: VideoTimestamp[]) => void;
}

export default function TimestampVideoRecorder({
  productId,
  phase,
  type,
  onRecordingComplete
}: TimestampVideoRecorderProps) {
  const { showToast } = useToast();
  const { showAlert } = useAlert();
  const [timestamps, setTimestamps] = useState<VideoTimestamp[]>([]);
  const [currentDescription, setCurrentDescription] = useState('');
  const [selectedVideoPath, setSelectedVideoPath] = useState<string>('');
  const [videoPlayer, setVideoPlayer] = useState<HTMLVideoElement | null>(null);

  // タイムスタンプ記録（作業内容と同時に実行）
  const recordTimestampWithDescription = (description: string) => {
    if (timestamps.length >= 5) {
      showToast({
        title: 'タイムスタンプ数の上限',
        message: 'タイムスタンプは最大5個まで記録できます',
        type: 'warning'
      });
      return;
    }

    const now = new Date();
    const newTimestamp: VideoTimestamp = {
      id: `${productId}-${now.getTime()}`,
      timestamp: now.toISOString(),
      description: description.trim(),
      s3VideoPath: generateS3VideoPath(now),
      isPlaying: false
    };

    setTimestamps(prev => [...prev, newTimestamp]);
    
    // 親コンポーネントに通知
    const updatedTimestamps = [...timestamps, newTimestamp];
    onRecordingComplete?.(updatedTimestamps);
    
    showToast({
      title: 'タイムスタンプを記録しました',
      message: `${formatTimestamp(now)} - ${newTimestamp.description}`,
      type: 'success'
    });
  };

  // S3動画パス生成（日付ベース）
  const generateS3VideoPath = (timestamp: Date): string => {
    const year = timestamp.getFullYear();
    const month = String(timestamp.getMonth() + 1).padStart(2, '0');
    const day = String(timestamp.getDate()).padStart(2, '0');
    const hour = String(timestamp.getHours()).padStart(2, '0');
    
    return `security-camera/${year}/${month}/${day}/${hour}/camera-${type}-${productId}.mp4`;
  };

  // タイムスタンプ削除
  const deleteTimestamp = (timestampId: string) => {
    const targetTimestamp = timestamps.find(ts => ts.id === timestampId);
    if (!targetTimestamp) return;

    showAlert({
      type: 'warning',
      title: 'タイムスタンプを削除しますか？',
      message: `時刻: ${formatTimestamp(new Date(targetTimestamp.timestamp))}\n内容: ${targetTimestamp.description}\n\nこの操作は取り消せません。`,
      actions: [
        {
          label: '削除',
          action: () => {
            const updatedTimestamps = timestamps.filter(ts => ts.id !== timestampId);
            setTimestamps(updatedTimestamps);
            onRecordingComplete?.(updatedTimestamps);
            
            showToast({
              title: 'タイムスタンプを削除しました',
              message: '記録済みタイムスタンプを削除しました',
              type: 'info'
            });
          },
          variant: 'danger'
        },
        {
          label: 'キャンセル',
          action: () => {},
          variant: 'secondary'
        }
      ]
    });
  };

  // 動画再生
  const playVideoAtTimestamp = async (timestamp: VideoTimestamp) => {
    try {
      // S3から動画URLを取得
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
      
      // 動画プレーヤーを開く
      setSelectedVideoPath(signedUrl);
      setTimestamps(prev => prev.map(t => 
        t.id === timestamp.id ? { ...t, isPlaying: true } : { ...t, isPlaying: false }
      ));
      
      // 指定時刻にシーク
      if (videoPlayer) {
        videoPlayer.currentTime = seekTime;
        videoPlayer.play();
      }

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

  // 時刻フォーマット
  const formatTimestamp = (date: Date): string => {
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const quickDescriptions = [
    `${type === 'inspection' ? '検品開始' : '梱包作業開始'}`
  ];

  return (
    <NexusCard className="p-4">
      <div className="space-y-4">
        {/* ヘッダー */}
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Video className="w-5 h-5" />
            {type === 'inspection' ? '検品作業' : '梱包作業'}のタイムスタンプ記録
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {phase === 'phase2' ? 'フェーズ2: 入庫検品' : 'フェーズ4: 出荷梱包'}
          </p>
        </div>

        {/* 説明テキスト */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-medium text-blue-900 text-sm mb-1">タイムスタンプ記録について</h4>
          <ul className="text-xs text-blue-800 space-y-0.5">
            <li>• 作業開始ボタンを押すと同時に開始時刻が記録されます</li>
            <li>• 記録した時刻から外部録画動画を呼び出して再生できます</li>
            <li>• タイムスタンプは0～5個まで任意で記録できます</li>
            <li>• ワンクリックで簡単に作業時刻を記録できます</li>
          </ul>
        </div>

        {/* タイムスタンプ記録エリア */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            作業開始時刻を記録
          </h4>
          
          <div className="space-y-2">
            {timestamps.length >= 5 ? (
              <p className="text-sm text-orange-600 text-center py-2">
                タイムスタンプの上限（5個）に達しました
              </p>
            ) : (
              <p className="text-xs text-gray-600 mb-3">
                ボタンを押すと同時にタイムスタンプが記録されます
              </p>
            )}
            
            {/* 作業開始ボタン（ワンクリックで記録） */}
            <div className="flex justify-center">
              {quickDescriptions.map((desc) => (
                <NexusButton
                  key={desc}
                  onClick={() => recordTimestampWithDescription(desc)}
                  variant="primary"
                  size="md"
                  disabled={timestamps.length >= 5}
                  icon={<Calendar className="w-4 h-4" />}
                  className="flex items-center gap-2 px-6 py-2"
                >
                  {desc}
                </NexusButton>
              ))}
            </div>
          </div>
        </div>

        {/* 記録済みタイムスタンプ */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">記録済みタイムスタンプ</h4>
          </div>
          
          {timestamps.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">
              タイムスタンプはまだ記録されていません
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {timestamps.map((timestamp) => (
                <div
                  key={timestamp.id}
                  className="flex items-center justify-between p-2 bg-white border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatTimestamp(new Date(timestamp.timestamp))}
                    </div>
                    <p className="font-medium text-sm text-gray-900 mt-0.5">
                      {timestamp.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <NexusButton
                      onClick={() => playVideoAtTimestamp(timestamp)}
                      variant="secondary"
                      size="sm"
                      icon={<Play className="w-3 h-3" />}
                      className="text-xs"
                    >
                      再生
                    </NexusButton>
                    <NexusButton
                      onClick={() => deleteTimestamp(timestamp.id)}
                      variant="default"
                      size="sm"
                      icon={<Trash2 className="w-3 h-3" />}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      削除
                    </NexusButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 動画プレーヤー */}
        {selectedVideoPath && (
          <div className="bg-black rounded-lg overflow-hidden">
            <video
              ref={setVideoPlayer}
              src={selectedVideoPath}
              controls
              className="w-full aspect-video"
              onLoadedMetadata={(e) => {
                console.log('Video loaded:', e.currentTarget.duration);
              }}
            />
          </div>
        )}
      </div>
    </NexusCard>
  );
}