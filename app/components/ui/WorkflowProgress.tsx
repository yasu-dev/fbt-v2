'use client';

import React from 'react';
import { getUnifiedIcon, IconType } from './icons';

interface WorkflowStep {
  id: string;
  label: string;
  icon: string;
  status: 'completed' | 'active' | 'pending';
}

interface WorkflowProgressProps {
  steps: WorkflowStep[];
  className?: string;
}

export default function WorkflowProgress({ steps, className = '' }: WorkflowProgressProps) {
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  // アイコンをレンダリングするヘルパー関数
  const renderStepIcon = (step: WorkflowStep) => {
    if (step.status === 'completed') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    
    // 統一アイコンを使用
    try {
      return getUnifiedIcon(step.icon as IconType, "w-5 h-5");
    } catch (error) {
      // フォールバックとして番号を表示
      const stepNumber = steps.findIndex(s => s.id === step.id) + 1;
      return <span className="text-xs font-bold">{stepNumber}</span>;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-nexus-bg-secondary rounded-full h-2">
          <div 
            className="bg-nexus-blue h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-nexus-text-secondary mt-1">
          <span>{completedSteps}/{totalSteps} 完了</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center space-y-2">
              {/* Step Circle */}
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 relative
                ${step.status === 'completed' 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : step.status === 'active'
                  ? 'bg-orange-500 text-white border-4 border-orange-300 shadow-xl animate-pulse'
                  : 'bg-gray-400 text-white'
                }
              `}>
                {renderStepIcon(step)}
                
                {/* 現在ステップの強調表示 - 統一デザインに修正 */}
                {step.status === 'active' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                    <span className="text-[8px] text-white font-bold">!</span>
                  </div>
                )}
              </div>
              
              {/* Step Label - 統一デザインパターンで修正 */}
              <div className={`
                text-xs font-medium text-center max-w-[80px] transition-all duration-300
                ${step.status === 'active' 
                  ? 'text-orange-600 font-bold' 
                  : step.status === 'completed'
                  ? 'text-green-600 font-semibold'
                  : 'text-gray-600'
                }
              `}>
                {step.label}
                {step.status === 'active' && (
                  <div className="text-[10px] text-orange-600 font-bold mt-1 bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
                    ← 現在はここ
                  </div>
                )}
                {step.status === 'completed' && (
                  <div className="text-[10px] text-green-600 font-medium mt-1 bg-green-50 px-2 py-1 rounded-full">
                    完了
                  </div>
                )}
                {step.status === 'pending' && (
                  <div className="text-[10px] text-gray-500 font-medium mt-1">
                    待機中
                  </div>
                )}
              </div>
            </div>
            
            {/* Connector Line - 統一デザインパターンで修正 */}
            {index < steps.length - 1 && (
              <div className={`
                flex-1 h-1 mx-3 rounded-full transition-all duration-300 shadow-sm
                ${step.status === 'completed'
                  ? 'bg-green-500'
                  : step.status === 'active'
                  ? 'bg-gradient-to-r from-orange-400 to-gray-300'
                  : 'bg-gray-300'
                }
              `}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}