import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // 全データをPrismaから取得
    const [
      totalProducts,
      inspectionProducts,
      listingProducts,
      soldProducts,
      urgentTasks,
      completedTasks,
      recentActivities,
      pickingTasks,
      todayOrders,
      pendingShipments
    ] = await Promise.all([
      // 総商品数
      prisma.product.count(),
      
      // 検品中商品数
      prisma.product.count({
        where: { status: 'inspection' }
      }),
      
      // 出品中商品数
      prisma.product.count({
        where: { status: 'listing' }
      }),
      
      // 売約済み商品数
      prisma.product.count({
        where: { status: 'sold' }
      }),
      
      // 緊急タスク数
      prisma.task.count({
        where: { 
          priority: { in: ['urgent', 'high'] },
          status: { not: 'completed' }
        }
      }),
      
      // 完了済みタスク数
      prisma.task.count({
        where: { status: 'completed' }
      }),
      
      // 最近のアクティビティ
      prisma.activity.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { username: true } },
          product: { select: { name: true } },
          order: { select: { orderNumber: true } }
        }
      }),
      
      // ピッキングタスク
      prisma.pickingTask.findMany({
        where: { status: { in: ['pending', 'in_progress'] } },
        orderBy: { dueDate: 'asc' },
        take: 5,
        include: {
          items: true
        }
      }),
      
      // 今日の注文数
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // 保留中の出荷
      prisma.shipment.count({
        where: { status: { in: ['pending', 'picked', 'packed'] } }
      })
    ]);

    // レスポンスデータ構築
    const dashboardData = {
      overview: {
        totalProducts,
        inspectionProducts,
        listingProducts,
        soldProducts,
        completionRate: totalProducts > 0 ? Math.round((soldProducts / totalProducts) * 100) : 0
      },
      tasks: {
        urgent: urgentTasks,
        completed: completedTasks,
        total: urgentTasks + completedTasks,
        efficiency: (urgentTasks + completedTasks) > 0 ? Math.round((completedTasks / (urgentTasks + completedTasks)) * 100) : 0
      },
      activities: recentActivities.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        user: activity.user?.username || 'システム',
        productName: activity.product?.name,
        orderNumber: activity.order?.orderNumber,
        timestamp: activity.createdAt.toISOString()
      })),
      picking: {
        tasks: pickingTasks.map(task => ({
          id: task.id,
          orderId: task.orderId,
          customer: task.customerName,
          priority: task.priority,
          status: task.status,
          totalItems: task.totalItems,
          pickedItems: task.pickedItems,
          progress: Math.round((task.pickedItems / task.totalItems) * 100),
          dueDate: task.dueDate.toISOString()
        })),
        total: pickingTasks.length
      },
      shipping: {
        todayOrders,
        pendingShipments,
        efficiency: todayOrders > 0 ? Math.round(((todayOrders - pendingShipments) / todayOrders) * 100) : 0
      },
      alerts: [
        ...(urgentTasks > 0 ? [{
          type: 'urgent',
          message: `${urgentTasks}件の緊急タスクがあります`,
          count: urgentTasks
        }] : []),
        ...(pendingShipments > 5 ? [{
          type: 'warning',
          message: `${pendingShipments}件の出荷が保留中です`,
          count: pendingShipments
        }] : [])
      ]
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('[ERROR] Staff dashboard API:', error);
    
    return NextResponse.json(
      { error: 'スタッフダッシュボードデータの取得に失敗しました' },
      { status: 500 }
    );
  }
}