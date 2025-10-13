'use client';

import { useState, useRef } from 'react';
import { BaseModal, NexusButton } from '../ui';
import { useToast } from '../features/notifications/ToastProvider';
import { 
  VideoCameraIcon,
  PlayIcon,
  StopIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import TimestampVideoRecorder from '../features/video/TimestampVideoRecorder';

interface PackingVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  onComplete?: () => void;
}

export default function PackingVideoModal({
  isOpen,
  onClose,
  productId,
  productName,
  onComplete
}: PackingVideoModalProps) {
  const { showToast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);

  const handleRecordingComplete = (timestamps: any[]) => {
    setRecordingComplete(true);
    showToast({
      title: '動画記録完了',
      message: '梱包作業の動画記録が完了しました',
      type: 'success'
    });
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
    onClose();
  };

  const handleSkip = () => {
    showToast({
      title: '動画記録をスキップしました',
      message: '梱包作業を続行してください',
      type: 'info'
    });
    if (onComplete) {
      onComplete();
    }
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="梱包作業動画記録（任意）"
      size="lg"
    >
      <div className="space-y-6">
        {/* 説明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <VideoCameraIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-blue-900 font-medium">
                梱包作業の動画記録について
              </p>
              <p className="text-blue-700 text-sm mt-1">
                この機能は任意です。品質管理や作業記録のために、梱包作業を動画で記録できます。
                記録しない場合は「スキップ」をクリックしてください。
              </p>
            </div>
          </div>
        </div>

        {/* 商品情報 */}
        <div className="bg-nexus-bg-secondary rounded-lg p-4">
          <h3 className="font-semibold text-nexus-text-primary mb-2">
            梱包対象商品
          </h3>
          <p className="text-nexus-text-primary">{productName}</p>
          <p className="text-sm text-nexus-text-secondary">ID: {productId}</p>
        </div>

        {/* 動画記録コンポーネント */}
        <div className="border-2 border-nexus-border rounded-lg p-6">
          <TimestampVideoRecorder
            productId={productId}
            phase="phase4"
            type="packing"
            onRecordingComplete={handleRecordingComplete}
          />
        </div>

        {/* 記録完了メッセージ */}
        {recordingComplete && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-green-900 font-medium">
                  動画記録が完了しました
                </p>
                <p className="text-green-700 text-sm mt-1">
                  梱包作業の記録が保存されました。作業を続行してください。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex justify-between pt-4 border-t border-nexus-border">
          <NexusButton
            onClick={handleSkip}
            variant="secondary"
            icon={<XMarkIcon className="w-5 h-5" />}
          >
            スキップ
          </NexusButton>
          
          <div className="flex gap-3">
            <NexusButton
              onClick={onClose}
              variant="secondary"
            >
              キャンセル
            </NexusButton>
            
            {recordingComplete && (
              <NexusButton
                onClick={handleComplete}
                variant="primary"
                icon={<CheckCircleIcon className="w-5 h-5" />}
              >
                完了
              </NexusButton>
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
} 