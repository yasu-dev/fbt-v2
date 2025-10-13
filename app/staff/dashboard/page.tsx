'use client';

import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import UnifiedPageHeader from '@/app/components/ui/UnifiedPageHeader';
import TaskCreationModal from '@/app/components/modals/TaskCreationModal';
import TaskDetailModal from '@/app/components/TaskDetailModal';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  DocumentTextIcon,
  PlusIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

import NexusButton from '@/app/components/ui/NexusButton';
import NexusSelect from '@/app/components/ui/NexusSelect';
import NexusInput from '@/app/components/ui/NexusInput';
import { BusinessStatusIndicator } from '@/app/components/ui/StatusIndicator';
import { NexusLoadingSpinner } from '@/app/components/ui';

interface StaffTask {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignee: string;
  dueDate: string;
  type: 'inspection' | 'photography' | 'shipping' | 'returns';
  location?: string;
  estimatedDuration?: string;
  category?: string;
  value?: string;
  itemCount?: number;
  progress?: number;
  batchId?: string;
  productId?: string;
}

// TaskDetailModal用のTask型定義
interface Task {
  id: string;
  title: string;
  category: string;
  assignee: string;
  dueDate: string;
  status: string;

  description?: string;
}

interface StaffData {
  staffTasks: {
  
    normalTasks: StaffTask[];
  };
  staffStats: {
    daily: {
      tasksCompleted: number;
      inspectionsCompleted: number;
      shipmentsProcessed: number;
      returnsProcessed: number;
      totalRevenue: string;
    };
    weekly: {
      efficiency: number;
      qualityScore: number;
      customerSatisfaction: number;
    };
  };
}

export default function StaffDashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [staffData, setStaffData] = useState<any>(null);
  const [tasks, setTasks] = useState<StaffTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<StaffTask | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // マウント状態の管理
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchStaffData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/staff/dashboard');
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setStaffData(data);
        
        // 新しいAPIレスポンス構造に対応
        // data.picking.tasks を使用してタスクデータを設定
        const tasksFromAPI = data.picking?.tasks || [];
        setTasks(tasksFromAPI);
      } catch (err) {
        console.error('Staff dashboard data fetch error:', err);
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
        
        // フォールバック用のモックデータ
        const mockStaffData = {
          staffTasks: {
            normalTasks: [
              {
                id: 'task-001',
                title: 'Canon EOS R5 検品',
                description: '高優先度の検品タスク',
        
                status: 'pending',
                assignee: 'スタッフ',
                dueDate: '2024-06-27',
                type: 'inspection',
                location: 'A-01',
                estimatedDuration: '2時間',
                category: 'カメラ',
                value: '¥2,800,000'
              }
            ]
          },
          staffStats: {
            daily: {
              tasksCompleted: 5,
              inspectionsCompleted: 3,
              shipmentsProcessed: 8,
              returnsProcessed: 2,
              totalRevenue: '¥3,200,000'
            }
          }
        };
        setStaffData(mockStaffData);
        setTasks(mockStaffData.staffTasks.normalTasks);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffData();
  }, [mounted]);

  const getAllTasks = (): StaffTask[] => {
    if (!staffData || !staffData.picking?.tasks) return [];
    // 新しいAPIレスポンスからタスクデータを取得
    return staffData.picking.tasks.map((task: any) => ({
      id: task.id,
      title: `注文 ${task.orderId} - ${task.customer}`,
      description: `${task.totalItems}個のアイテム（${task.pickedItems}個完了）`,
      status: task.status === 'pending' ? 'pending' : 'in_progress',
      assignee: 'スタッフ',
      dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString('ja-JP') : '未設定',
      type: 'picking',
      location: 'ピッキングエリア',
      estimatedDuration: '1時間',
      category: 'ピッキング',
      value: '¥0',
      priority: task.priority || 'normal',
      progress: task.progress || 0
    }));
  };

  const getFilteredTasks = (): StaffTask[] => {
    const allTasks = getAllTasks();
    let filtered = allTasks;

    // フィルター処理を先入れ先出しに変更

    // Apply type filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.type === filterStatus);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };



  // ステータス表示は BusinessStatusIndicator で統一

  const typeIcons = {
    inspection: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    photography: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    shipping: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
    returns: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
      </svg>
    ),
  };

  const typeLabels = {
    inspection: '検品',
    photography: '撮影',
    shipping: '出荷',
    returns: '返品',
  };

  const updateTaskStatus = (taskId: string, newStatus: StaffTask['status']) => {
    if (!staffData) return;
    
    const newStaffData = { ...staffData };
    
    // 先入れ先出しでタスク更新
    
    // Update in normal tasks
    const normalIndex = newStaffData.staffTasks.normalTasks.findIndex(t => t.id === taskId);
    if (normalIndex !== -1) {
      newStaffData.staffTasks.normalTasks[normalIndex].status = newStatus;
    }
    
    setStaffData(newStaffData);
  };

  const allTasks = getAllTasks();
  const stats = {
    total: allTasks.length,
    pending: allTasks.filter(t => t.status === 'pending').length,
    inProgress: allTasks.filter(t => t.status === 'in_progress').length,
    completed: allTasks.filter(t => t.status === 'completed').length,
    // 新しいAPIレスポンスから追加統計データを取得
    totalProducts: staffData?.overview?.totalProducts || 0,
    inspectionProducts: staffData?.overview?.inspectionProducts || 0,
    urgentTasks: staffData?.tasks?.urgent || 0,
    efficiency: staffData?.tasks?.efficiency || 0
  };



  const taskCategorySettings = {
    inspection: '',
    photography: '',
    shipping: '',
    returns: '',
  };

  const taskCategories = [
    { key: 'inspection', label: '検品', icon: '' },
    { key: 'photography', label: '撮影', icon: '' },
    { key: 'shipping', label: '出荷', icon: '' },
    { key: 'returns', label: '返品', icon: '' },
  ];

  const handleCreateTask = () => {
    setShowCreateModal(true);
  };

  const handleEditTask = (task: StaffTask) => {
    // StaffTaskをTask型に変換
    const taskData: Task = {
      id: task.id,
      title: task.title,
      category: task.type || 'inspection',
      assignee: task.assignee,
      dueDate: task.dueDate,
      status: task.status,

      description: task.description
    };
    setSelectedTask(taskData);
    setIsEditModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleSaveTaskEdit = (updatedTask: any) => {
    if (!staffData || !selectedTask) return;
    
    const newStaffData = { ...staffData };
    
    // 先入れ先出しでタスク更新
    const normalIndex = newStaffData.staffTasks.normalTasks.findIndex(t => t.id === selectedTask.id);
    if (normalIndex !== -1) {
      newStaffData.staffTasks.normalTasks[normalIndex] = { ...selectedTask, ...updatedTask };
    }
    
    setStaffData(newStaffData);
    setIsEditModalOpen(false);
    setSelectedTask(null);
    
    showToast({
      title: 'タスク更新',
      message: 'タスク情報を更新しました',
      type: 'success'
    });
  };

  const handleTaskCreation = async (taskData: any) => {
    try {
      // デモ版: 実際のAPIが存在しなくても動作するモック実装
      // TaskCreationModalが既に成功メッセージを表示するので、ここでは重複を避ける
      
      // 新しいタスクを既存のタスクリストに追加
      if (staffData) {
        const newTask: StaffTask = {
          id: taskData.id,
          title: taskData.title,
          description: taskData.description,
    
          status: 'pending',
          assignee: taskData.assignedToName || '未割り当て',
          dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
          type: taskData.category,
          estimatedDuration: taskData.estimatedTime ? `${taskData.estimatedTime}分` : undefined,
          progress: 0
        };

        const updatedStaffData = {
          ...staffData,
          staffTasks: {
            ...staffData.staffTasks,
            normalTasks: [...staffData.staffTasks.normalTasks, newTask]
          }
        };

        setStaffData(updatedStaffData);
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('タスク作成エラー:', error);
      showToast({
        title: 'エラー',
        message: 'タスクの作成に失敗しました',
        type: 'error'
      });
    }
  };

  const handleTaskDetail = (task: StaffTask) => {
    // StaffTaskをTaskDetailModalで使用するTask形式に変換
    // 添付ファイルとコメントは表示しない仕様
    const taskDetailData = {
      id: task.id,
      title: task.title,
      category: task.type || 'inspection', // typeがundefinedの場合のデフォルト値
      assignee: task.assignee,
      dueDate: task.dueDate,
      status: task.status,
      priority: task.priority || 'medium',
      description: task.description
      // attachments, commentsは意図的に除外
    };
    setSelectedTask(taskDetailData);
    setIsDetailModalOpen(true);
  };

  if (!mounted) {
    return (
      <DashboardLayout userType="staff">
        <div className="space-y-6">
          <UnifiedPageHeader
            title="ダッシュボード"
            subtitle="業務遂行状況の統合管理"
            userType="staff"
            iconType="dashboard"
          />
          <div className="flex items-center justify-center min-h-[400px]">
            <NexusLoadingSpinner size="lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout userType="staff">
        <div className="space-y-6">
          <UnifiedPageHeader
            title="ダッシュボード"
            subtitle="業務遂行状況の統合管理"
            userType="staff"
          />
          <div className="flex items-center justify-center min-h-[400px]">
            <NexusLoadingSpinner size="lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userType="staff">
        <div className="space-y-6">
          <UnifiedPageHeader
            title="ダッシュボード"
            subtitle="業務遂行状況の統合管理"
            userType="staff"
            iconType="dashboard"
          />
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <ExclamationCircleIcon className="w-16 h-16 text-nexus-red mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-nexus-text-primary mb-2">
                データの取得に失敗しました
              </h3>
              <p className="text-nexus-text-secondary mb-4">{error}</p>
              <NexusButton
                onClick={() => window.location.reload()}
                variant="primary"
              >
                再試行
              </NexusButton>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const headerActions = (
    <NexusButton
      onClick={handleCreateTask}
      variant="primary"
      icon={<PlusIcon className="w-5 h-5" />}
    >
      <span className="hidden sm:inline">新規タスク作成</span>
      <span className="sm:hidden">新規作成</span>
    </NexusButton>
  );

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* 統一ヘッダー */}
        <UnifiedPageHeader
          title="ダッシュボード"
          subtitle="業務遂行状況の統合管理"
          userType="staff"
          iconType="dashboard"
          actions={headerActions}
        />

        {/* Task Creation Modal */}
        <TaskCreationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleTaskCreation}
        />

        {/* Stats Cards */}
        <div className="intelligence-metrics">
          <div className="unified-grid-4">
            <div className="intelligence-card global">
              <div className="p-8">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="status-badge info text-[10px] sm:text-xs">総計</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {stats.total}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  総タスク数
                </div>
              </div>
            </div>

            <div className="intelligence-card americas">
              <div className="p-8">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb green w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge success text-[10px] sm:text-xs">完了</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {stats.completed}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  完了済み
                </div>
              </div>
            </div>

            <div className="intelligence-card europe">
              <div className="p-8">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge text-[10px] sm:text-xs">待機</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {stats.pending}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  待機中
                </div>
              </div>
            </div>

            <div className="intelligence-card asia">
              <div className="p-8">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb blue w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="status-badge info text-[10px] sm:text-xs">実行中</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {stats.inProgress}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  作業中
                </div>
              </div>
            </div>

            <div className="intelligence-card africa">
              <div className="p-8">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb green w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="status-badge info text-[10px] sm:text-xs">商品</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {stats.totalProducts}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  総商品数
                </div>
              </div>
            </div>

            <div className="intelligence-card oceania">
              <div className="p-8">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="status-badge success text-[10px] sm:text-xs">本日</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {stats.efficiency}%
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  効率スコア
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 業務遂行状況俯瞰 */}
        <div className="intelligence-metrics">
          <div className="intelligence-card global">
            <div className="p-8">
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-6">業務遂行状況</h2>
              
              {/* タイムライン表示 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* 作業フロー進捗 */}
                <div className="bg-nexus-bg-secondary rounded-lg p-6">
                  <h3 className="text-lg font-medium text-nexus-text-primary mb-4">本日の作業フロー</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-nexus-text-secondary">入庫待ち</span>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-nexus-text-primary mr-2">{staffData.overview?.inspectionProducts || 0} / {(staffData.overview?.totalProducts || 0)}</span>
                        <div className="w-24 bg-nexus-bg-tertiary rounded-full h-2">
                          <div 
                            className="bg-nexus-blue h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${staffData.overview?.totalProducts > 0 ? ((staffData.overview?.inspectionProducts || 0) / staffData.overview.totalProducts) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-nexus-text-secondary">撮影待ち</span>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-nexus-text-primary mr-2">12 / 15</span>
                        <div className="w-24 bg-nexus-bg-tertiary rounded-full h-2">
                          <div className="bg-nexus-green h-2 rounded-full" style={{ width: '80%' }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-nexus-text-secondary">出荷準備</span>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-nexus-text-primary mr-2">{staffData.shipping?.todayOrders || 0} / {(staffData.shipping?.todayOrders || 0) + (staffData.shipping?.pendingShipments || 0)}</span>
                        <div className="w-24 bg-nexus-bg-tertiary rounded-full h-2">
                          <div 
                            className="bg-nexus-purple h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${staffData.shipping?.efficiency || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* リアルタイム業務指標 */}
                <div className="bg-nexus-bg-secondary rounded-lg p-6">
                  <h3 className="text-lg font-medium text-nexus-text-primary mb-4">リアルタイム指標</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-nexus-text-primary">{staffData.tasks?.efficiency || 0}%</div>
                      <div className="text-xs text-nexus-text-secondary">作業効率</div>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-nexus-green">+5%</span>
                        <svg className="w-3 h-3 text-nexus-green ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-nexus-text-primary">¥{(staffData.overview?.soldProducts * 50000 || 0).toLocaleString()}</div>
                      <div className="text-xs text-nexus-text-secondary">処理金額</div>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-nexus-text-secondary">目標: ¥5,000,000</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-nexus-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-nexus-text-secondary">稼働率</span>
                      <span className="text-sm font-medium text-nexus-text-primary">87%</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-nexus-text-secondary">品質スコア</span>
                      <span className="text-sm font-medium text-nexus-text-primary">{staffData.overview?.completionRate || 95}%</span>
                    </div>
                  </div>
                </div>

                {/* 作業状況サマリー */}
                <div className="bg-nexus-bg-secondary rounded-lg p-6">
                  <h3 className="text-lg font-medium text-nexus-text-primary mb-4">作業状況サマリー</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-nexus-yellow/10 rounded-lg">
                      <svg className="w-5 h-5 text-nexus-yellow flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <div className="text-sm font-medium text-nexus-text-primary">締切接近 3件</div>
                        <div className="text-xs text-nexus-text-secondary mt-1">本日17:00までに完了必要</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-nexus-border">
                    <div className="text-sm text-nexus-text-secondary">次回ピークタイム</div>
                    <div className="text-lg font-medium text-nexus-text-primary mt-1">15:00 - 17:00</div>
                    <div className="text-xs text-nexus-text-secondary mt-1">出荷準備作業集中</div>
                  </div>
                </div>
              </div>

              {/* 作業種別サマリー */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-nexus-bg-secondary rounded-lg p-4 text-center">
                  <div className="action-orb blue w-12 h-12 mx-auto mb-2">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-nexus-text-primary">{staffData.overview?.inspectionProducts || 0}</div>
                  <div className="text-xs text-nexus-text-secondary">検品完了</div>
                </div>
                <div className="bg-nexus-bg-secondary rounded-lg p-4 text-center">
                  <div className="action-orb green w-12 h-12 mx-auto mb-2">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-nexus-text-primary">12</div>
                  <div className="text-xs text-nexus-text-secondary">撮影完了</div>
                </div>
                <div className="bg-nexus-bg-secondary rounded-lg p-4 text-center">
                  <div className="action-orb purple w-12 h-12 mx-auto mb-2">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-nexus-text-primary">{staffData.shipping?.todayOrders || 0}</div>
                  <div className="text-xs text-nexus-text-secondary">出荷完了</div>
                </div>
                <div className="bg-nexus-bg-secondary rounded-lg p-4 text-center">
                  <div className="action-orb red w-12 h-12 mx-auto mb-2">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-nexus-text-primary">{staffData.tasks?.completed || 0}</div>
                  <div className="text-xs text-nexus-text-secondary">返品処理</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">


              {/* Type Filter */}
              <div>
                <NexusSelect
                  label="作業種別フィルター"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  options={[
                    { value: 'all', label: 'すべて' },
                    { value: 'inspection', label: '検品' },
                    { value: 'photography', label: '撮影' },
                    { value: 'shipping', label: '出荷' },
                    { value: 'returns', label: '返品' }
                  ]}
                />
              </div>

              {/* Search */}
              <div>
                <NexusInput
                  type="text"
                  label="検索"
                  placeholder="タスク名・担当者で検索"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="holo-table">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-nexus-border">
                    <th className="text-left p-4 font-medium text-nexus-text-secondary w-[35%]">タスク情報</th>
                    <th className="text-left p-4 font-medium text-nexus-text-secondary w-[20%]">担当者/期限</th>
                    <th className="text-center p-4 font-medium text-nexus-text-secondary w-[20%]">ステータス</th>
                    <th className="text-center p-4 font-medium text-nexus-text-secondary w-[25%]">アクション</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredTasks().length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center p-8 text-nexus-text-secondary">
                        該当するタスクがありません。フィルター条件を変更してください。
                      </td>
                    </tr>
                  ) : (
                    getFilteredTasks().map((row) => (
                      <tr key={row.id} className="border-b border-nexus-border hover:bg-nexus-bg-tertiary">
                        <td className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 text-nexus-text-secondary">{typeIcons[row.type as keyof typeof typeIcons]}</div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-nexus-text-primary">
                                  {row.title}
                                </h3>
                                {row.productId && (
                                  <span className="cert-nano cert-premium">
                                    {row.productId}
                                  </span>
                                )}
                                {row.value && (
                                  <span className="cert-nano cert-mint">
                                    {row.value}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-nexus-text-secondary">
                                {row.description}
                              </p>
                              {row.progress !== undefined && (
                                <div className="mt-2 max-w-[1600px]">
                                  <div className="flex justify-between text-xs text-nexus-text-secondary mb-1">
                                    <span>進捗</span>
                                    <span>{row.progress}%</span>
                                  </div>
                                  <div className="w-full bg-nexus-bg-secondary rounded-full h-2">
                                    <div 
                                      className="bg-nexus-blue h-2 rounded-full transition-all duration-300" 
                                      style={{ width: `${row.progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="text-sm text-nexus-text-primary">
                              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {row.assignee}
                            </div>
                            <div className="text-sm text-nexus-text-primary">
                              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {row.dueDate}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <BusinessStatusIndicator status={row.status} />
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end space-x-2">
                            {row.status === 'pending' && (
                              <NexusButton
                                onClick={() => updateTaskStatus(row.id, 'in_progress')}
                                variant="primary"
                                size="sm"
                              >
                                開始
                              </NexusButton>
                            )}
                            {row.status === 'in_progress' && (
                              <NexusButton
                                onClick={() => updateTaskStatus(row.id, 'completed')}
                                variant="primary"
                                size="sm"
                              >
                                完了
                              </NexusButton>
                            )}
                            <NexusButton 
                              onClick={() => handleTaskDetail(row as StaffTask)}
                              size="sm"
                            >
                              詳細
                            </NexusButton>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* TaskDetailModal */}
      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onEdit={(task: Task) => {
          // Task型からStaffTask型への変換が必要な場合のハンドラー
          // 現在はTask型のみを扱うため、直接処理
          setSelectedTask(task);
          setIsEditModalOpen(true);
          setIsDetailModalOpen(false);
        }}
      />

      {/* Task Edit Modal */}
      <TaskCreationModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleSaveTaskEdit}
      />
    </DashboardLayout>
  );
}