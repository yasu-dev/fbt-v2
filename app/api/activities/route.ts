import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { AuthService } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');
    const orderId = searchParams.get('orderId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const skip = (page - 1) * limit;
    
    // フィルター条件を構築
    const where: any = {};
    
    if (type) {
      where.type = type;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    if (productId) {
      where.productId = productId;
    }
    
    if (orderId) {
      where.orderId = orderId;
    }
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.createdAt = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      where.createdAt = {
        lte: new Date(endDate),
      };
    }
    
    // 活動履歴を取得
    const [activities, totalCount] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.activity.count({ where }),
    ]);
    
    // メタデータをパース
    const enrichedActivities = activities.map(activity => {
      let parsedMetadata = null;
      if (activity.metadata) {
        try {
          parsedMetadata = JSON.parse(activity.metadata);
        } catch (error) {
          console.warn('Failed to parse activity metadata:', error);
        }
      }
      
      return {
        ...activity,
        metadata: parsedMetadata,
      };
    });
    
    return NextResponse.json({
      success: true,
      data: enrichedActivities,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { success: false, error: '活動履歴の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 活動ログの統計情報を取得
export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    const body = await request.json();
    const { type = 'summary', startDate, endDate } = body;
    
    const where: any = {};
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    
    if (type === 'summary') {
      // 活動タイプ別の統計
      const activityStats = await prisma.activity.groupBy({
        by: ['type'],
        where,
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      });
      
      // 最近の活動（上位10件）
      const recentActivities = await prisma.activity.findMany({
        where,
        include: {
          user: {
            select: { username: true, role: true },
          },
          product: {
            select: { name: true, sku: true },
          },
          order: {
            select: { orderNumber: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      
      // ユーザー別の活動統計
      const userStats = await prisma.activity.groupBy({
        by: ['userId'],
        where: {
          ...where,
          userId: { not: null },
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 10,
      });
      
      // ユーザー情報を取得
      const userIds = userStats.map(stat => stat.userId).filter(Boolean) as string[];
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, username: true, role: true },
      });
      
      const enrichedUserStats = userStats.map(stat => ({
        ...stat,
        user: users.find(u => u.id === stat.userId),
      }));
      
      return NextResponse.json({
        success: true,
        data: {
          activityStats: activityStats.map(stat => ({
            type: stat.type,
            count: stat._count.id,
          })),
          recentActivities: recentActivities.map(activity => {
            let parsedMetadata = null;
            if (activity.metadata) {
              try {
                parsedMetadata = JSON.parse(activity.metadata);
              } catch (error) {
                console.warn('Failed to parse metadata:', error);
              }
            }
            return { ...activity, metadata: parsedMetadata };
          }),
          userStats: enrichedUserStats,
          totalActivities: await prisma.activity.count({ where }),
        },
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'サポートされていない統計タイプです',
    }, { status: 400 });
    
  } catch (error) {
    console.error('Error fetching activity statistics:', error);
    return NextResponse.json(
      { success: false, error: '活動統計の取得に失敗しました' },
      { status: 500 }
    );
  }
}