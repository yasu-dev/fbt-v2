'use client';

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface NexusSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  variant?: 'default' | 'nexus' | 'enterprise';
  size?: 'sm' | 'md' | 'lg';
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  required?: boolean;
  useCustomDropdown?: boolean;
}

const NexusSelect = forwardRef<HTMLSelectElement, NexusSelectProps>(({
  label,
  error,
  variant = 'nexus',
  size = 'md',
  options,
  children,
  required,
  className = '',
  disabled,
  useCustomDropdown = false,
  value,
  onChange,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectButtonRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 外側クリックでドロップダウンを閉じる
  useEffect(() => {
    if (!useCustomDropdown || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isClickOnButton = selectButtonRef.current?.contains(target);
      const isClickOnMenu = menuRef.current?.contains(target);

      if (!isClickOnButton && !isClickOnMenu) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [useCustomDropdown, isOpen]);

  // value propの変更を追跡
  useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  // ドロップダウンの位置を計算
  const calculateDropdownPosition = () => {
    if (!selectButtonRef.current) return;

    const rect = selectButtonRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    setDropdownPosition({
      top: rect.bottom + scrollTop + 2,
      left: rect.left + scrollLeft,
      width: rect.width
    });
  };

  const handleDropdownToggle = () => {
    if (!isOpen) {
      calculateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    setIsOpen(false);

    // 元のonChangeイベントを呼び出す
    if (onChange) {
      const syntheticEvent = {
        target: { value: optionValue }
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }
  };

  const getSelectedLabel = () => {
    if (!options) return selectedValue;
    const selectedOption = options.find(opt => opt.value === selectedValue);
    return selectedOption ? selectedOption.label : selectedValue;
  };
  
  const baseClasses = `
    w-full
    border rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2
    disabled:opacity-50 disabled:cursor-not-allowed
    appearance-none
    cursor-pointer
  `;

  const getVariantClasses = (hasError: boolean) => ({
    default: hasError ? `
      border-red-300 bg-white text-gray-900
      focus:ring-red-500 focus:border-red-500
    ` : `
      border-gray-300 bg-white text-gray-900
      focus:ring-blue-500 focus:border-blue-500
    `,
    nexus: hasError ? `
      bg-nexus-bg-secondary border-red-300 text-nexus-text-primary
      focus:ring-red-500 focus:border-red-500
    ` : `
      bg-nexus-bg-secondary border-gray-300 text-nexus-text-primary
      focus:ring-[#0064D2] focus:border-[#0064D2]
      hover:border-gray-400
    `,
    enterprise: hasError ? `
      border-red-300 bg-white text-nexus-text-primary
      focus:ring-red-500 focus:border-red-500
    ` : `
      border-nexus-border bg-white text-nexus-text-primary
      focus:ring-primary-blue focus:border-transparent
      hover:border-primary-blue/30
    `
  });

  const sizeClasses = {
    sm: 'px-2 py-1.5 text-sm pr-8',
    md: 'px-3 py-2 text-base pr-10',
    lg: 'px-4 py-3 text-lg pr-12'
  };

  const variantClasses = getVariantClasses(!!error);
  
  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  // カスタムドロップダウンを使用する場合
  if (useCustomDropdown && options) {
    return (
      <div className="w-full" ref={dropdownRef}>
        {label && (
          <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative" ref={selectButtonRef}>
          <button
            type="button"
            className={combinedClasses}
            disabled={disabled}
            onClick={() => !disabled && handleDropdownToggle()}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span className="block truncate text-left">{getSelectedLabel()}</span>
          </button>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDownIcon
              className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>

        {/* カスタムドロップダウンメニュー - Portal使用 */}
        {isOpen && typeof window !== 'undefined' && createPortal(
          <div
            ref={menuRef}
            className="fixed z-[10002] bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`
            }}
          >
              {options.map((option, index) => (
                <div
                  key={option.value}
                  className={`
                    relative px-4 py-3 cursor-pointer transition-all duration-150
                    ${option.disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:bg-blue-50'}
                    ${selectedValue === option.value
                      ? 'bg-blue-100 text-blue-900 font-medium border-l-4 border-l-blue-500'
                      : 'text-gray-700 hover:text-blue-800'
                    }
                    ${index === 0 ? 'rounded-t-lg' : ''}
                    ${index === options.length - 1 ? 'rounded-b-lg' : 'border-b border-gray-100'}
                    ${!option.value ? 'text-gray-500 italic' : ''}
                  `}
                  onClick={() => !option.disabled && handleOptionSelect(option.value)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{option.label}</span>
                    {selectedValue === option.value && (
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
          </div>,
          document.body
        )}
        {error && (
          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }

  // 標準のselectを使用する場合
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={combinedClasses}
          disabled={disabled}
          required={required}
          value={selectedValue}
          onChange={onChange}
          {...props}
        >
          {options ? (
            options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))
          ) : (
            children
          )}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

NexusSelect.displayName = 'NexusSelect';

export default NexusSelect;