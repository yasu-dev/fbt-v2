import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // セラー向けダッシュボードデータをPrismaから取得
    const [
      totalProducts,
      inboundProducts,
      inspectionProducts,
      storageProducts,
      listedProducts,
      soldProducts,
      recentActivities,
      deliveryPlans,
      notifications
    ] = await Promise.all([
      // 総商品数
      prisma.product.count(),
      
      // 入荷待ち商品数
      prisma.product.count({
        where: { status: 'inbound' }
      }),
      
      // 検品中商品数
      prisma.product.count({
        where: { status: 'inspection' }
      }),
      
      // 保管中商品数
      prisma.product.count({
        where: { status: 'storage' }
      }),
      
      // 出品中商品数
      prisma.product.count({
        where: { status: 'listing' }
      }),
      
      // 売約済み商品数
      prisma.product.count({
        where: { status: 'sold' }
      }),
      
      // 最近のアクティビティ
      prisma.activity.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          user: { select: { username: true } },
          product: { select: { name: true } },
          order: { select: { orderNumber: true } }
        }
      }),
      
      // 納品プラン
      prisma.deliveryPlan.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          products: true,
          seller: { select: { username: true } }
        }
      }),
      
      // 通知（アクティビティベース）
      prisma.activity.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24時間以内
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // セラー向けダッシュボードデータ構築
    const dashboardData = {
      overview: {
        totalProducts,
        inboundProducts,
        inspectionProducts,
        storageProducts,
        listedProducts,
        soldProducts,
        conversionRate: totalProducts > 0 ? Math.round((soldProducts / totalProducts) * 100) : 0
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
      deliveryPlans: deliveryPlans.map(plan => ({
        id: plan.id,
        planNumber: plan.planNumber,
        status: plan.status,
        totalItems: plan.totalItems,
        totalValue: plan.totalValue,
        seller: plan.seller.username,
        createdAt: plan.createdAt.toISOString()
      })),
      notifications: notifications.map(notification => ({
        id: notification.id,
        type: notification.type,
        message: notification.description,
        timestamp: notification.createdAt.toISOString(),
        read: false // デフォルト未読
      })),
      quickActions: [
        { id: 'create-delivery-plan', label: '新規納品プラン作成', icon: 'plus', enabled: true },
        { id: 'view-inventory', label: '在庫確認', icon: 'inventory', count: storageProducts },
        { id: 'check-sales', label: '売上確認', icon: 'sales', count: soldProducts },
        { id: 'view-reports', label: 'レポート確認', icon: 'reports', enabled: true }
      ]
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('[ERROR] Dashboard API:', error);
    
    return NextResponse.json(
      { error: 'ダッシュボードデータの取得に失敗しました' },
      { status: 500 }
    );
  }
}