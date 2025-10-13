'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { BaseModal, NexusButton } from './ui';
import {
  PlayIcon,
  CheckIcon,
  CheckCircleIcon,
  TrashIcon,
  PencilIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Task {
  id: string;
  title: string;
  category: string;
  assignee: string;
  dueDate: string;
  status: string;
  priority: string;
  description?: string;
  notes?: string;
  type?: string; // StaffTask互換性のため追加
  // 添付ファイルは表示しない仕様のためコメントアウト
  // attachments?: string[];
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit?: (task: Task) => void;
  onStatusChange?: (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => void;
  onDelete?: (taskId: string) => void;
}

export default function TaskDetailModal({ isOpen, onClose, task, onEdit, onStatusChange, onDelete }: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(task?.status || 'pending');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { showToast } = useToast();

  // タスクが変更されたときにステータスを同期
  useEffect(() => {
    if (task) {
      setCurrentStatus(task.status);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleStatusChange = async (newStatus: 'pending' | 'in_progress' | 'completed') => {
    setIsUpdating(true);
    
    try {
      // 即座にUIを更新
      setCurrentStatus(newStatus);
      
      if (onStatusChange) {
        await onStatusChange(task.id, newStatus);
      }
      
      // 成功のフィードバック
      const statusLabels = {
        'pending': '待機中',
        'in_progress': '作業中', 
        'completed': '完了'
      };
      
      showToast({
        title: 'ステータス更新完了',
        message: `タスクのステータスを「${statusLabels[newStatus]}」に変更しました`,
        type: 'success'
      });
      
    } catch (error) {
      // エラー時は元のステータスに戻す
      setCurrentStatus(task.status);
      showToast({
        title: 'エラー',
        message: 'ステータスの更新に失敗しました',
        type: 'error'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (onDelete && task) {
      onDelete(task.id);
      setIsDeleteModalOpen(false);
      onClose();
      showToast({
        title: 'タスク削除',
        message: 'タスクを削除しました',
        type: 'info'
      });
    }
  };

  return (
    <>
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={task.title}
      size="lg"
    >
      <div className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              担当者
            </label>
            <p className="text-lg text-gray-900">{task.assignee}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリー
            </label>
            <p className="text-gray-900">{task.category}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              期限
            </label>
            <p className="text-lg text-gray-900">{task.dueDate}</p>
          </div>
          
          <div>
              <label className="block text-sm font-medium text-nexus-text-secondary mb-3">
              ステータス
            </label>
              {/* ステータス進行バー */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex space-x-4">
                    <div className={`flex items-center space-x-2 ${currentStatus === 'pending' ? 'text-yellow-600' : currentStatus === 'in_progress' || currentStatus === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-3 h-3 rounded-full ${currentStatus === 'pending' ? 'bg-yellow-500' : currentStatus === 'in_progress' || currentStatus === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm font-medium">待機中</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${currentStatus === 'in_progress' ? 'text-blue-600' : currentStatus === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-3 h-3 rounded-full ${currentStatus === 'in_progress' ? 'bg-blue-500' : currentStatus === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm font-medium">作業中</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${currentStatus === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-3 h-3 rounded-full ${currentStatus === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm font-medium">完了</span>
                    </div>
                  </div>
                </div>
                {/* プログレスバー */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ease-in-out ${
                      currentStatus === 'pending' ? 'w-1/3 bg-yellow-500' :
                      currentStatus === 'in_progress' ? 'w-2/3 bg-blue-500' :
                      currentStatus === 'completed' ? 'w-full bg-green-500' : 'w-0'
                    }`}
                  ></div>
                </div>
              </div>
              {/* 現在のステータス表示 */}
              <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                currentStatus === 'pending' ? 'bg-orange-600 text-white' :
                currentStatus === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                currentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {currentStatus === 'pending' ? (
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    待機中
                  </span>
                ) : currentStatus === 'in_progress' ? (
                  <span className="flex items-center gap-1">
                    <ArrowPathIcon className="h-4 w-4" />
                    作業中
                  </span>
                ) : currentStatus === 'completed' ? (
                  <span className="flex items-center gap-1">
                    <CheckCircleIcon className="h-4 w-4" />
                    完了
                  </span>
                ) : currentStatus}
              </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              優先度
            </label>
            <p className="text-gray-900">{task.priority}</p>
          </div>
          
          {task.description && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                詳細
              </label>
              <p className="text-gray-900">{task.description}</p>
            </div>
          )}
          
          {task.notes && (
            <div>
              <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                備考
              </label>
              <div className="p-3 bg-nexus-bg-secondary rounded-lg">
                <div
                  className="text-nexus-text-primary"
                  dangerouslySetInnerHTML={{ __html: task.notes }}
                />
              </div>
            </div>
          )}
        </div>
        
          {/* ステータス変更アクション */}
          <div className="mt-6 p-4 bg-nexus-bg-secondary rounded-lg">
            <h4 className="text-sm font-medium text-nexus-text-secondary mb-3">アクション</h4>
            <div className="flex space-x-3">
              {currentStatus === 'pending' && onStatusChange && (
                <NexusButton
                  onClick={() => handleStatusChange('in_progress')}
                  variant="primary"
                  disabled={isUpdating}
                  className="transition-colors duration-200 hover:bg-blue-700"
                >
                  {isUpdating ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>開始中...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <PlayIcon className="w-4 h-4" />
                      <span>タスク開始</span>
                    </div>
                  )}
                </NexusButton>
              )}
              {currentStatus === 'in_progress' && onStatusChange && (
                <NexusButton
                  onClick={() => handleStatusChange('completed')}
                  variant="primary"
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700 transition-colors duration-200"
                >
                  {isUpdating ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>完了中...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CheckIcon className="w-4 h-4" />
                      <span>タスク完了</span>
                    </div>
                  )}
                </NexusButton>
              )}
              {currentStatus === 'completed' && (
                <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span className="font-medium">タスク完了済み</span>
                </div>
              )}
            </div>
          </div>

          {/* その他のアクション */}
          <div className="flex justify-between mt-6">
            <div className="flex space-x-3">
              {onDelete && (
                <NexusButton
                  onClick={() => setIsDeleteModalOpen(true)}
                  variant="danger"
                  className="hover:bg-red-700 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <TrashIcon className="w-4 h-4" />
                    <span>削除</span>
                  </div>
                </NexusButton>
              )}
            </div>
            
            <div className="flex space-x-3">
              <NexusButton 
                onClick={onClose}
                className="hover:bg-gray-100 transition-colors duration-200"
              >
            閉じる
          </NexusButton>
              {onEdit && (
          <NexusButton
            onClick={() => {
                onEdit(task);
              showToast({
                title: 'タスク編集',
                message: 'タスク編集機能を開きます',
                type: 'info'
              });
            }}
            variant="primary"
                  className="hover:bg-blue-700 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <PencilIcon className="w-4 h-4" />
                    <span>編集</span>
                  </div>
                </NexusButton>
              )}
            </div>
          </div>
        </div>
      </BaseModal>

      {/* 削除確認モーダル */}
      <BaseModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="タスク削除の確認"
        size="md"
      >
        <div>
          <p className="text-nexus-text-primary mb-4">
            このタスクを削除しますか？
          </p>
          <p className="text-nexus-text-secondary text-sm mb-6">
            この操作は元に戻せません。
          </p>
          <div className="flex justify-end gap-3">
            <NexusButton
              onClick={() => setIsDeleteModalOpen(false)}
              variant="default"
            >
              キャンセル
            </NexusButton>
            <NexusButton
              onClick={handleDeleteConfirm}
              variant="danger"
            >
              削除する
          </NexusButton>
        </div>
      </div>
    </BaseModal>
    </>
  );
} 