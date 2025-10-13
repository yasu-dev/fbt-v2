import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Prismaを使用してタスクデータを取得
    const urgentTasks = await prisma.task.findMany({
      where: {
        priority: { in: ['urgent', 'high'] },
        status: { not: 'completed' }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const normalTasks = await prisma.task.findMany({
      where: {
        priority: { in: ['normal', 'low'] },
        status: { not: 'completed' }
      },
      orderBy: { createdAt: 'desc' },
      take: 15
    });

    // 進捗統計を計算
    const totalTasks = await prisma.task.count();
    const completedTasks = await prisma.task.count({
      where: { status: 'completed' }
    });
    const inProgressTasks = await prisma.task.count({
      where: { status: 'in_progress' }
    });
    const pendingTasks = await prisma.task.count({
      where: { status: 'pending' }
    });

    // 最近のアクティビティを取得
    const recentActivities = await prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: true,
        product: true,
        order: true
      }
    });

    const tasksData = {
      urgentTasks: urgentTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        status: task.status,
        assignedTo: task.assignedTo,
        estimatedTime: task.estimatedTime,
        dueDate: task.dueDate?.toISOString(),
        createdAt: task.createdAt.toISOString(),
      })),
      normalTasks: normalTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        status: task.status,
        assignedTo: task.assignedTo,
        estimatedTime: task.estimatedTime,
        dueDate: task.dueDate?.toISOString(),
        createdAt: task.createdAt.toISOString(),
      })),
      progress: {
        completed: completedTasks,
        inProgress: inProgressTasks,
        pending: pendingTasks,
        total: totalTasks,
        percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      },
      quickActions: [
        { id: 'new-inspection', label: '新規検品開始', icon: 'inspection', count: pendingTasks },
        { id: 'photo-session', label: '撮影セッション', icon: 'camera', count: 3 },
        { id: 'listing-review', label: '出品承認', icon: 'listing', count: 7 },
        { id: 'shipping-prep', label: '出荷準備', icon: 'shipping', count: 12 }
      ],
      recentActivity: recentActivities.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        user: activity.user?.username || 'システム',
        timestamp: activity.createdAt.toISOString(),
        productName: activity.product?.name,
        orderNumber: activity.order?.orderNumber,
      }))
    };

    return NextResponse.json(tasksData);
  } catch (error) {
    console.error('Tasks API error:', error);
    
    return NextResponse.json(
      { error: 'タスクデータの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newTask = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        priority: body.priority || 'normal',
        status: 'pending',
        assignedTo: body.assignedTo,
        estimatedTime: body.estimatedTime,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        notes: body.notes,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
      }
    });

    return NextResponse.json({ success: true, task: newTask }, { status: 201 });
  } catch (error) {
    console.error('Task creation error:', error);
    return NextResponse.json(
      { error: 'タスクの作成に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;
    
    if (!id || !status) {
      return NextResponse.json(
        { error: 'タスクIDとステータスが必要です' },
        { status: 400 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status,
        notes: notes || undefined,
        completedAt: status === 'completed' ? new Date() : null,
      }
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error('Task update error:', error);
    return NextResponse.json(
      { error: 'タスク更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'タスクIDが必要です' },
        { status: 400 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: { id: body.id },
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        priority: body.priority,
        status: body.status,
        assignedTo: body.assignedTo,
        estimatedTime: body.estimatedTime,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        notes: body.notes,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
      }
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error('Task update error:', error);
    return NextResponse.json(
      { error: 'タスク更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'タスクIDが必要です' },
        { status: 400 }
      );
    }

    await prisma.task.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'タスクを削除しました',
      deletedTaskId: id 
    });
  } catch (error) {
    console.error('Task deletion error:', error);
    return NextResponse.json(
      { error: 'タスク削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}