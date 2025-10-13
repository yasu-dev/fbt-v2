'use client';

import React, { forwardRef } from 'react';

interface NexusInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  variant?: 'default' | 'nexus' | 'enterprise';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
}

const NexusInput = forwardRef<HTMLInputElement, NexusInputProps>(({
  label,
  error,
  variant = 'nexus',
  size = 'md',
  icon,
  rightIcon,
  required,
  className = '',
  disabled,
  ...props
}, ref) => {
  
  const baseClasses = `
    w-full
    border rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const getVariantClasses = (hasError: boolean) => ({
    default: hasError ? `
      border-red-300 bg-white text-gray-900
      focus:ring-red-500 focus:border-red-500
      placeholder-gray-500
    ` : `
      border-gray-300 bg-white text-gray-900
      focus:ring-blue-500 focus:border-blue-500
      placeholder-gray-500
    `,
    nexus: hasError ? `
      bg-nexus-bg-secondary border-red-300 text-nexus-text-primary
      focus:ring-red-500 focus:border-red-500
      placeholder-nexus-text-secondary
    ` : `
      bg-nexus-bg-secondary border-gray-300 text-nexus-text-primary
      focus:ring-[#0064D2] focus:border-[#0064D2]
      hover:border-gray-400
      placeholder-nexus-text-secondary
    `,
    enterprise: hasError ? `
      border-red-300 bg-white text-nexus-text-primary
      focus:ring-red-500 focus:border-red-500
      placeholder-nexus-text-muted
    ` : `
      border-nexus-border bg-white text-nexus-text-primary
      focus:ring-primary-blue focus:border-transparent
      placeholder-nexus-text-muted
      hover:border-primary-blue/30
    `
  });

  const sizeClasses = {
    sm: 'px-2 py-1.5 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  };

  const iconSizeClasses = {
    sm: 'pl-8',
    md: 'pl-10',
    lg: 'pl-12'
  };

  const variantClasses = getVariantClasses(!!error);
  
  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${icon ? iconSizeClasses[size] : ''}
    ${rightIcon ? 'pr-10' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400">
              {icon}
            </div>
          </div>
        )}
        <input
          ref={ref}
          className={combinedClasses}
          disabled={disabled}
          required={required}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="text-gray-400">
              {rightIcon}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

NexusInput.displayName = 'NexusInput';

export default NexusInput;