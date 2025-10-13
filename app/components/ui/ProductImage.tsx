'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface ProductImageProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-20 h-20'
};

export default function ProductImage({
  src,
  alt = '商品画像',
  size = 'md',
  className = ''
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // 画像がない場合やエラーの場合のプレースホルダー
  if (!src || imageError) {
    return (
      <div className={`${sizeClasses[size]} ${className} bg-nexus-bg-tertiary border border-nexus-border rounded-md flex items-center justify-center`}>
        <PhotoIcon className="h-6 w-6 text-nexus-text-tertiary" />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative rounded-md overflow-hidden border border-nexus-border`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-nexus-bg-tertiary animate-pulse"></div>
      )}
      <Image
        src={src.startsWith('/api/images/') ? src + '?v=skip-opt' : src}
        alt={alt}
        fill
        sizes="80px"
        className="object-cover"
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
      />
    </div>
  );
}