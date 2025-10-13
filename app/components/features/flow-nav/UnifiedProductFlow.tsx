'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { NexusLoadingSpinner } from '@/app/components/ui';

interface FlowStep {
  id: string;
  name: string;
  shortName: string;
  description: string;
  role: 'seller' | 'staff' | 'system' | 'customer';
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  tasks: {
    id: string;
    name: string;
    count: number;
    avgDays: number;
    status: 'active' | 'waiting' | 'completed';
  
  }[];
}

interface UnifiedProductFlowProps {
  currentStage?: string;
  userType: 'seller' | 'staff';
  compact?: boolean;
  showCounts?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function UnifiedProductFlow({ 
  currentStage, 
  userType,
  compact = false, 
  showCounts = true,
  isCollapsed = false,
  onToggleCollapse
}: UnifiedProductFlowProps) {
  const router = useRouter();
  const [flowData, setFlowData] = useState<FlowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    returns: 0,
    userActiveTasks: 0
  });



  // 洗練されたSVGアイコンセット
  const stepIcons = {
    preparation: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
      </svg>
    ),
    inbound: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    sales: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    shipping: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
    completion: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    returns: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
      </svg>
    )
  };

  // フルフィルメントサービスの6ステップ構造（心理学的・経済学的配色最適化）
  const getFlowSteps = (): FlowStep[] => [
    {
      id: 'preparation',
      name: 'STEP 1: 準備フェーズ',
      shortName: '準備',
      description: 'セラー商品仕入れ・納品プラン作成・倉庫発送',
      role: 'seller',
      color: '#0064D2', // 信頼性・安定性を表すプライマリーブルー（経済学：投資・準備段階）
      bgColor: '#e3f2fd',
      icon: stepIcons.preparation,
      tasks: [
        { id: 'sourcing', name: '商品仕入れ', count: 0, avgDays: 3, status: 'active',  },
        { id: 'plan', name: '納品プラン作成', count: 0, avgDays: 1, status: 'waiting',  },
        { id: 'shipping', name: '倉庫発送', count: 0, avgDays: 2, status: 'waiting',  }
      ]
    },
    {
      id: 'inbound',
      name: 'STEP 2: 入庫フェーズ',
      shortName: '入庫',
      description: 'スタッフ商品受取・検品撮影・在庫登録',
      role: 'staff',
      color: '#7B1FA2', // 集中力・専門性を表すパープル（心理学：検品・品質管理）
      bgColor: '#f3e5f5',
      icon: stepIcons.inbound,
      tasks: [
        { id: 'receive', name: '商品受取', count: 0, avgDays: 1, status: 'active',  },
        { id: 'inspection', name: '検品・撮影', count: 0, avgDays: 2, status: 'waiting',  },
        { id: 'register', name: '在庫登録', count: 0, avgDays: 1, status: 'waiting',  }
      ]
    },
    {
      id: 'sales',
      name: 'STEP 3: 販売フェーズ',
      shortName: '販売',
      description: 'システム自動出品・購入者注文・受注処理',
      role: 'system',
      color: '#86B817', // 成長・収益を表すグリーン（経済学：売上創出・収益化）
      bgColor: '#e8f5e8',
      icon: stepIcons.sales,
      tasks: [
        { id: 'listing', name: 'eBay出品', count: 0, avgDays: 1, status: 'active',  },
        { id: 'order', name: '商品注文', count: 0, avgDays: 0, status: 'waiting',  },
        { id: 'process', name: '受注処理', count: 0, avgDays: 1, status: 'waiting',  }
      ]
    },
    {
      id: 'shipping',
      name: 'STEP 4: 出荷フェーズ',
      shortName: '出荷',
      description: 'スタッフピッキング・梱包発送・購入者受取',
      role: 'staff',
      color: '#00BCD4', // 効率性・スピードを表すシアン（心理学：迅速な配送・顧客満足）
      bgColor: '#e0f7fa',
      icon: stepIcons.shipping,
      tasks: [
        { id: 'picking', name: 'ピッキング', count: 0, avgDays: 1, status: 'active',  },
        { id: 'packing', name: '梱包・発送', count: 0, avgDays: 1, status: 'waiting',  },
        { id: 'delivery', name: '購入者受取', count: 0, avgDays: 3, status: 'waiting',  }
      ]
    },
    {
      id: 'completion',
      name: 'STEP 5: 完了フェーズ',
      shortName: '完了',
      description: 'システム売上計算・セラー精算確認・次回仕入れ',
      role: 'seller',
      color: '#FFCE00', // 達成感・満足感を表すゴールド（経済学：利益確定・成功）
      bgColor: '#fff8e1',
      icon: stepIcons.completion,
      tasks: [
        { id: 'calculation', name: '売上計算', count: 0, avgDays: 1, status: 'active',  },
        { id: 'settlement', name: '精算確認', count: 0, avgDays: 2, status: 'waiting',  },
        { id: 'next', name: '次回仕入れ', count: 0, avgDays: 0, status: 'waiting',  }
      ]
    },
    {
      id: 'returns',
      name: 'STEP 6: 返品フェーズ',
      shortName: '返品',
      description: 'スタッフ返品受付・検品・再出品または廃棄',
      role: 'staff',
      color: '#FF6F00', // 注意喚起だが建設的なオレンジ（心理学：問題解決・改善機会）
      bgColor: '#fff3e0',
      icon: stepIcons.returns,
      tasks: [
        { id: 'return-receive', name: '返品受付', count: 0, avgDays: 1, status: 'active',  },
        { id: 'return-inspect', name: '返品検品', count: 0, avgDays: 2, status: 'waiting',  },
        { id: 'return-process', name: '再出品・廃棄', count: 0, avgDays: 1, status: 'waiting',  }
      ]
    }
  ];

  const loadFlowData = useCallback(async () => {
    try {
      const response = await fetch('/api/inventory/stats', { cache: 'no-store' });
      const data = await response.json();

      const steps = getFlowSteps();
      let userActiveTasks = 0;

      // APIデータを各ステップのタスクにマッピング
      steps.forEach(step => {
        step.tasks.forEach(task => {
          switch (task.id) {
            // 準備フェーズ
            case 'sourcing':
              task.count = 0; // 商品仕入れは機能未実装のため0
              break;
            case 'plan':
              task.count = data.statusStats['納品プラン作成'] || 0;
              break;
            case 'shipping':
              task.count = data.statusStats['倉庫発送'] || 0;
              break;
            // 入庫フェーズ
            case 'receive':
              task.count = (data.statusStats['入庫待ち'] || 0) + (data.statusStats['入庫'] || 0);
              break;
            case 'inspection':
              task.count = data.statusStats['検品'] || 0;
              break;
            case 'register':
              task.count = data.statusStats['保管'] || 0;
              break;
            // 販売フェーズ
            case 'listing':
              task.count = data.statusStats['出品'] || 0;
              break;
            case 'order':
              task.count = data.statusStats['受注'] || 0;
              break;
            case 'process':
              task.count = data.statusStats['受注処理'] || 0;
              break;
            // 出荷フェーズ
            case 'picking':
              task.count = data.statusStats['出荷'] || 0;
              break;
            case 'packing':
              task.count = data.statusStats['梱包・発送'] || 0;
              break;
            case 'delivery':
              task.count = data.statusStats['購入者受取'] || 0;
              break;
            // 完了フェーズ
            case 'calculation':
              task.count = data.statusStats['売約済み'] || 0;
              break;
            case 'settlement':
              task.count = 0; // 精算確認は機能未実装のため0
              break;
            case 'next':
              task.count = 0; // 次回仕入れは機能未実装のため0
              break;
            // 返品フェーズ
            case 'return-receive':
              task.count = data.statusStats['返品受付'] || 0;
              break;
            case 'return-inspect':
              task.count = data.statusStats['返品検品'] || 0;
              break;
            case 'return-process':
              task.count = data.statusStats['再出品・廃棄'] || 0;
              break;
            default:
              task.count = 0;
          }

          // ユーザーの担当タスクをカウント
          if ((userType === 'seller' && step.role === 'seller') || 
              (userType === 'staff' && step.role === 'staff')) {
            userActiveTasks += task.count;
          }
        });
      });

      setFlowData(steps);

      // 統計情報を計算
      const total = Object.values(data.statusStats).reduce((sum: number, count: any) => sum + (count || 0), 0);
      const inProgress = (data.statusStats['入庫'] || 0) + (data.statusStats['検品'] || 0) + (data.statusStats['出荷'] || 0);
      const completed = data.statusStats['売約済み'] || 0;
      const returns = data.statusStats['返品'] || 0;

      setTotalStats({ total, inProgress, completed, returns, userActiveTasks });

    } catch (error) {
      console.error('Flow data loading error:', error);
      setFlowData(getFlowSteps());
    } finally {
      setLoading(false);
    }
  }, [userType]);

  useEffect(() => {
    loadFlowData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadFlowData, 30 * 1000);

    // 外部イベントからの即時再フェッチ（出荷・検品などの更新直後）
    const onRefresh = () => {
      loadFlowData();
    };
    if (typeof window !== 'undefined') {
      (window as any).addEventListener('inventory:refresh', onRefresh as any);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        (window as any).removeEventListener('inventory:refresh', onRefresh as any);
      }
    };
  }, [loadFlowData]);

  const handleStepClick = (stepId: string, taskId?: string) => {
    const baseRoute = userType === 'staff' ? '/staff' : '';
    
    switch (stepId) {
      case 'preparation':
        router.push(userType === 'seller' ? '/delivery' : '/staff/dashboard');
        break;
      case 'inbound':
        if (taskId === 'inspection') {
          router.push('/staff/inspection');
        } else {
          router.push(`${baseRoute}/inventory?filter=inbound`);
        }
        break;
      case 'sales':
        router.push(userType === 'staff' ? '/staff/inventory?filter=listing' : '/sales');
        break;
      case 'shipping':
        if (taskId === 'picking') {
          router.push('/staff/picking');
        } else {
          router.push(userType === 'staff' ? '/staff/shipping' : '/delivery');
        }
        break;
      case 'completion':
        router.push(userType === 'staff' ? '/staff/reports' : '/billing');
        break;
      case 'returns':
        router.push(userType === 'staff' ? '/staff/returns' : '/returns');
        break;
      default:
        router.push(userType === 'staff' ? '/staff/dashboard' : '/dashboard');
    }
  };

  const getCurrentStep = () => {
    if (!currentStage) return null;
    
    // 現在のパスから対応するステップを特定
    if (currentStage.includes('delivery') || currentStage.includes('preparation')) return 'preparation';
    if (currentStage.includes('inbound') || currentStage.includes('inspection')) return 'inbound';
    if (currentStage.includes('listing') || currentStage.includes('sales')) return 'sales';
    if (currentStage.includes('shipping') || currentStage.includes('picking')) return 'shipping';
    if (currentStage.includes('billing') || currentStage.includes('completion')) return 'completion';
    if (currentStage.includes('returns')) return 'returns';
    
    return null;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'seller': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'staff': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'system': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'customer': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
      default: 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };



  if (loading) {
    return (
      <div className={`bg-white border-b border-gray-200 ${compact ? 'py-2' : 'py-4'}`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <NexusLoadingSpinner size="md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isCollapsed ? "bg-white border-b border-gray-200" : "bg-white rounded-xl border border-nexus-border"} data-testid="unified-product-flow">
      <div className={isCollapsed ? "p-3" : "p-4"}>
        <div className="flex flex-col gap-2">


          {/* フローステップ */}
          {!isCollapsed && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {flowData.map((step, index) => {
              const isCurrentStep = getCurrentStep() === step.id;
              const totalStepTasks = step.tasks.reduce((sum, task) => sum + task.count, 0);
              
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  className={`
                    relative p-3 rounded-xl transition-all duration-300 text-left group
                    hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${isCurrentStep ? 'ring-2 ring-blue-400 shadow-lg scale-105' : ''}
                  `}
                  style={{
                    backgroundColor: step.bgColor,
                    borderLeft: `4px solid ${step.color}`
                  }}
                >
                  {/* ステップヘッダー */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: step.color }}
                      >
                        <div className="w-3 h-3">
                          {step.icon}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {step.shortName}
                        </div>

                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {getRoleIcon(step.role)}
                      {isCurrentStep && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>

                  {/* タスクリスト */}
                  <div className="space-y-1">
                    {step.tasks.slice(0, compact ? 2 : 3).map((task) => (
                      <div
                        key={task.id}
                        className="w-full flex items-center justify-between text-xs group-hover:bg-white/50 p-1 rounded transition-colors hover:bg-white/70 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStepClick(step.id, task.id);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            handleStepClick(step.id, task.id);
                          }
                        }}
                        aria-label={`${task.name} - ${task.count}件の作業`}
                        title={`${task.name}をクリックして詳細画面に移動`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700 font-medium">{task.name}</span>

                        </div>
                        {showCounts && task.count > 0 && (
                          <span 
                            className="px-2 py-1 rounded-full font-bold text-[10px] min-w-[20px] text-center text-white shadow-sm"
                            style={{ 
                              backgroundColor: step.color
                            }}
                            aria-label={`${task.count}件`}
                          >
                            {task.count}
                          </span>
                        )}

                      </div>
                    ))}
                  </div>



                  {/* 接続線（デスクトップのみ） */}
                  {index < flowData.length - 1 && (
                    <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                      <div 
                        className="w-8 h-1 rounded-full relative bg-gray-300"
                      >
                        <div 
                          className="absolute -right-1 -top-1 w-2 h-2 rotate-45 transform origin-center rounded-sm bg-gray-300"
                        ></div>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          )}


        </div>
      </div>
    </div>
  );
} 