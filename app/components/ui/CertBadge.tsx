'use client';

import React from 'react';

type CertificationType = 'elite' | 'premium' | 'global' | 'verified' | 'compliance';

interface CertBadgeProps {
  type: CertificationType;
  label: string;
  className?: string;
}

export default function CertBadge({
  type,
  label,
  className = ''
}: CertBadgeProps) {

  const certConfig = {
    elite: {
      bg: 'bg-blue-800',
      text: 'text-white',
      border: 'border-blue-800'
    },
    premium: {
      bg: 'bg-yellow-700',
      text: 'text-white',
      border: 'border-yellow-700'
    },
    global: {
      bg: 'bg-green-800',
      text: 'text-white',
      border: 'border-green-800'
    },
    verified: {
      bg: 'bg-cyan-800',
      text: 'text-white',
      border: 'border-cyan-800'
    },
    compliance: {
      bg: 'bg-purple-800',
      text: 'text-white',
      border: 'border-purple-800'
    }
  };

  const config = certConfig[type];

  return (
    <span className={`
      cert-nano
      inline-flex items-center
      px-3 py-1.5
      rounded-lg
      border-2
      font-black font-display
      text-xs
      uppercase
      tracking-widest
      transition-all duration-300
      hover:scale-105
      ${config.bg}
      ${config.text}
      ${config.border}
      ${className}
    `}>
      {label}
    </span>
  );
}