import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // 実際のピッキングタスクを取得
    const pickingTasks = await prisma.pickingTask.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // ピッキングタスクをタスク形式に変換
    const tasks = pickingTasks.map(task => ({
      id: task.id,
      title: `ピッキング作業 - ${task.customerName}`,
      description: `注文 ${task.orderId} のピッキング（${task.totalItems}点）`,
      status: task.status,
      assignedTo: task.assignee || 'スタッフ',
      dueDate: task.dueDate.toISOString(),
      category: 'shipping',
      productSku: task.items[0]?.product?.sku || '',
      productName: task.items.length > 1 
        ? `${task.items[0]?.product?.name || '商品'}他${task.items.length - 1}点`
        : task.items[0]?.product?.name || '商品',
      estimatedTime: task.totalItems * 5, // 1商品5分と仮定
      notes: `出荷方法: ${task.shippingMethod}, 進捗: ${task.pickedItems}/${task.totalItems}`
    }));

    const staffTasksData = {
      summary: {
        total: tasks.length,
        urgent: tasks.filter(task => task.status === 'urgent').length,
        completed: tasks.filter(task => task.status === 'completed').length,
        pending: tasks.filter(task => task.status === 'pending').length,
        inProgress: tasks.filter(task => task.status === 'in_progress').length
      },
      tasks: tasks
    };

    return NextResponse.json(staffTasksData);
  } catch (error) {
    console.error('[ERROR] Staff tasks API:', error);
    
    return NextResponse.json(
      { error: 'スタッフタスクデータの取得に失敗しました' },
      { status: 500 }
    );
  }
}