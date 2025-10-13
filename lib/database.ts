import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Database health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
}

// Initialize database with default data
export async function initializeDatabase() {
  try {
    // データベースの初期化はseed.tsで行うため、この関数は削除
    console.log('データベースの初期化はseed.tsで行います');
  } catch (error) {
    // Silently fail in production
    if (process.env.NODE_ENV !== 'production') {
      throw error;
    }
  }
}

export class DatabaseService {
  static async cleanupExpiredSessions() {
    try {
      const result = await prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      return result.count;
    } catch (error) {
      // Silently fail
      return 0;
    }
  }

  static async getActivitySummary(userId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [products, orders, activities] = await Promise.all([
        prisma.product.count({
          where: {
            sellerId: userId,
            createdAt: { gte: startDate },
          },
        }),
        prisma.order.count({
          where: {
            customerId: userId,
            createdAt: { gte: startDate },
          },
        }),
        prisma.activity.count({
          where: {
            userId,
            createdAt: { gte: startDate },
          },
        }),
      ]);

      return { products, orders, activities };
    } catch (error) {
      return { products: 0, orders: 0, activities: 0 };
    }
  }

  static async getInventorySummary(userId?: string) {
    try {
      const whereClause = userId ? { sellerId: userId } : {};

      const [total, lowStock, outOfStock, categories] = await Promise.all([
        prisma.product.count({ where: whereClause }),
        prisma.product.count({
          where: {
            ...whereClause,
            price: { gt: 0, lte: 10000 },
          },
        }),
        prisma.product.count({
          where: {
            ...whereClause,
            status: 'sold',
          },
        }),
        prisma.product.groupBy({
          by: ['category'],
          where: whereClause,
          _count: true,
        }),
      ]);

      return {
        total,
        lowStock,
        outOfStock,
        byCategory: categories.length,
      };
    } catch (error) {
      return {
        total: 0,
        lowStock: 0,
        outOfStock: 0,
        byCategory: 0,
      };
    }
  }
}