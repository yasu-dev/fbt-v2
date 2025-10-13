'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

interface EnhancedImageUploaderProps {
  maxFiles?: number;
  maxSize?: number;
  acceptedFormats?: string[];
  onUpload?: (files: File[]) => Promise<void>;
  enableEdit?: boolean;
  enableWatermark?: boolean;
  autoUpload?: boolean; // 画像選択時に自動アップロード
}

export default function EnhancedImageUploader({
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  onUpload,
  enableEdit = true,
  enableWatermark = false,
  autoUpload = false
}: EnhancedImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewModalRef = useRef<HTMLDivElement>(null);

  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 画像プレビューモーダルのスクロール位置リセット
  useEffect(() => {
    if (selectedImage) {
      // ページ全体を最上部にスクロール - 正しいスクロールコンテナを対象
      const scrollContainer = document.querySelector('.page-scroll-container');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      } else {
        window.scrollTo(0, 0);
      }
      
      if (previewModalRef.current) {
        previewModalRef.current.scrollTop = 0;
      }
    }
  }, [selectedImage]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    
    const acceptedFiles = Array.from(files).filter(file => {
      const isAcceptedFormat = acceptedFormats.some(format => file.type === format);
      const isAcceptedSize = file.size <= maxSize;
      return isAcceptedFormat && isAcceptedSize;
    });

    const newImages = acceptedFiles.slice(0, maxFiles - images.length).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: autoUpload ? 'uploading' as const : 'pending' as const
    }));
    
    setImages(prev => [...prev, ...newImages].slice(0, maxFiles));
    
    // 自動アップロードが有効な場合、即座にアップロードを実行
    if (autoUpload && onUpload && newImages.length > 0) {
      setIsUploading(true);
      
      for (const image of newImages) {
        try {
          // プログレスバーのアニメーション
          for (let progress = 0; progress <= 100; progress += 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            setImages(prev => prev.map(img => 
              img.id === image.id 
                ? { ...img, progress } 
                : img
            ));
          }

          // 実際のアップロード実行
          await onUpload([image.file]);

          setImages(prev => prev.map(img => 
            img.id === image.id 
              ? { ...img, status: 'completed', progress: 100 } 
              : img
          ));
        } catch (error) {
          console.error('[ERROR] 画像自動アップロードエラー:', error);
          
          let errorMessage = 'アップロードに失敗しました';
          
          if (error instanceof Error) {
            if (error.message.includes('404')) {
              errorMessage = 'アップロードサーバーが見つかりません';
            } else if (error.message.includes('fetch')) {
              errorMessage = 'ネットワークエラー';
            } else {
              errorMessage = error.message;
            }
          }
          
          setImages(prev => prev.map(img => 
            img.id === image.id 
              ? { 
                  ...img, 
                  status: 'error', 
                  error: errorMessage
                } 
              : img
          ));
        }
      }
      
      setIsUploading(false);
    }
  }, [maxFiles, maxSize, acceptedFormats, images.length, autoUpload, onUpload]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const uploadImages = async () => {
    if (!onUpload || images.length === 0) return;

    setIsUploading(true);
    const pendingImages = images.filter(img => img.status === 'pending');

    for (const image of pendingImages) {
      setImages(prev => prev.map(img => 
        img.id === image.id 
          ? { ...img, status: 'uploading', progress: 0 } 
          : img
      ));

      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setImages(prev => prev.map(img => 
            img.id === image.id 
              ? { ...img, progress } 
              : img
          ));
        }

        // Call the actual upload function
        await onUpload([image.file]);

        setImages(prev => prev.map(img => 
          img.id === image.id 
            ? { ...img, status: 'completed', progress: 100 } 
            : img
        ));
      } catch (error) {
        console.error('[ERROR] 画像手動アップロードエラー:', error);
        
        let errorMessage = 'アップロードに失敗しました';
        
        if (error instanceof Error) {
          if (error.message.includes('404')) {
            errorMessage = 'アップロードサーバーが見つかりません';
          } else if (error.message.includes('fetch')) {
            errorMessage = 'ネットワークエラー';
          } else if (error.message.includes('size')) {
            errorMessage = 'ファイルサイズが大きすぎます';
          } else {
            errorMessage = error.message;
          }
        }
        
        setImages(prev => prev.map(img => 
          img.id === image.id 
            ? { ...img, status: 'error', error: errorMessage } 
            : img
        ));
      }
    }

    setIsUploading(false);
  };

  const applyFilter = (imageId: string, filter: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.filter = filter;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const newFile = new File([blob], image.file.name, { type: image.file.type });
          const newPreview = URL.createObjectURL(blob);
          
          setImages(prev => prev.map(img => 
            img.id === imageId 
              ? { ...img, file: newFile, preview: newPreview } 
              : img
          ));
          
          URL.revokeObjectURL(image.preview);
        }
      });
    };
    img.src = image.preview;
  };

  const cropImage = (imageId: string, cropData: { x: number; y: number; width: number; height: number }) => {
    const image = images.find(img => img.id === imageId);
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = cropData.width;
      canvas.height = cropData.height;
      ctx.drawImage(
        img, 
        cropData.x, cropData.y, cropData.width, cropData.height,
        0, 0, cropData.width, cropData.height
      );

      canvas.toBlob((blob) => {
        if (blob) {
          const newFile = new File([blob], image.file.name, { type: image.file.type });
          const newPreview = URL.createObjectURL(blob);
          
          setImages(prev => prev.map(img => 
            img.id === imageId 
              ? { ...img, file: newFile, preview: newPreview } 
              : img
          ));
          
          URL.revokeObjectURL(image.preview);
        }
      });
    };
    img.src = image.preview;
  };

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        `}
      >
        <input 
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-lg font-medium mb-2">
          {isDragActive 
            ? 'ドロップしてアップロード' 
            : autoUpload 
              ? 'クリックまたはドラッグ＆ドロップ（自動アップロード）'
              : 'クリックまたはドラッグ＆ドロップ'
          }
        </p>
        <p className="text-sm text-gray-500">
          {acceptedFormats.join(', ')} • 最大{maxSize / 1024 / 1024}MB • 最大{maxFiles}枚
          {autoUpload && <span className="block text-blue-600 mt-1">画像を選択すると自動でアップロードされます</span>}
        </p>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <NexusCard key={image.id} className="relative group overflow-hidden">
              <img
                src={image.preview}
                alt="Preview"
                className="w-full h-48 object-cover cursor-pointer"
                onClick={() => setSelectedImage(image.id)}
              />
              
              {/* Status Overlay */}
              {image.status === 'uploading' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2">
                      <svg className="animate-spin h-full w-full text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <span className="text-white text-sm">{image.progress}%</span>
                  </div>
                </div>
              )}
              
              {image.status === 'completed' && (
                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              
              {image.status === 'error' && (
                <div className="absolute inset-x-0 bottom-0 bg-red-500 text-white p-2 text-xs">
                  {image.error}
                </div>
              )}
              
              {/* Actions */}
              <div className="absolute top-2 right-2 flex gap-2">
                {enableEdit && !autoUpload && image.status === 'pending' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      applyFilter(image.id, 'brightness(1.2) contrast(1.1)');
                    }}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 shadow-md"
                    title="フィルター適用"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </button>
                )}
                
                {/* 自動アップロード時は削除ボタンを表示しない（アップロード完了後は削除可能） */}
                {(!autoUpload || image.status === 'completed' || image.status === 'error') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(image.id);
                    }}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md"
                    title="削除"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </NexusCard>
          ))}
        </div>
      )}

      {/* Upload Button（自動アップロード時は表示しない） */}
      {!autoUpload && images.length > 0 && images.some(img => img.status === 'pending') && (
        <div className="flex justify-center">
          <NexusButton
            onClick={uploadImages}
            disabled={isUploading}
            variant="primary"
            className="px-8"
          >
            {isUploading ? 'アップロード中...' : `${images.filter(img => img.status === 'pending').length}枚をアップロード`}
          </NexusButton>
        </div>
      )}

      {/* Hidden Canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          ref={previewModalRef}
          className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={images.find(img => img.id === selectedImage)?.preview}
              alt="Full preview"
              className="max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}


    </div>
  );
} 