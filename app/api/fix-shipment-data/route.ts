import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🚚 出荷データ復旧APIを開始...');

    // 現在のshipmentデータ件数を確認
    const existingCount = await prisma.shipment.count();
    console.log(`現在の出荷データ件数: ${existingCount}`);

    // 注文データを取得または作成
    let orders = await prisma.order.findMany({
      include: { customer: true },
      take: 10
    });

    if (orders.length === 0) {
      console.log('注文データが見つかりません。サンプル注文を作成します...');
      
      // サンプルユーザーを取得または作成
      let user = await prisma.user.findFirst({ where: { role: 'customer' } });
      if (!user) {
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash('password123', 12);
        user = await prisma.user.create({
          data: {
            email: 'customer-restore@example.com',
            username: 'サンプル顧客',
            password: hashedPassword,
            role: 'customer',
            fullName: '山田 太郎'
          }
        });
      }

      // サンプル注文を作成
      for (let i = 1; i <= 10; i++) {
        const order = await prisma.order.create({
          data: {
            orderNumber: `ORD-2024-RESTORE-${i.toString().padStart(3, '0')}`,
            customerId: user.id,
            status: 'confirmed',
            totalAmount: Math.floor(Math.random() * 300000) + 50000,
            shippingAddress: `東京都渋谷区${i}-${i}-${i}`,
            paymentMethod: 'credit_card',
            notes: `復旧用サンプル注文 ${i}`,
            orderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          }
        });
        orders.push({ ...order, customer: user });
      }
    }

    console.log(`${orders.length}件の注文データを見つけました`);

    // 既存のshipmentデータをクリア（復旧の場合）
    if (existingCount > 0) {
      await prisma.shipment.deleteMany({});
      console.log('既存の出荷データをクリアしました');
    }

    // 出荷データを作成
    const carriers = ['ヤマト運輸', '佐川急便', 'FedEx', '日本郵便'];
    const methods = ['標準配送', '速達', '翌日配送'];
    const shipmentStatuses = ['pending', 'picked', 'packed', 'shipped', 'delivered'];
    const priorities = ['urgent', 'high', 'normal', 'low'];

    const createdShipments = [];

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const carrier = carriers[Math.floor(Math.random() * carriers.length)];
      const method = methods[Math.floor(Math.random() * methods.length)];
      const status = shipmentStatuses[Math.floor(Math.random() * shipmentStatuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];

      const shipment = await prisma.shipment.create({
        data: {
          orderId: order.id,
          trackingNumber: status !== 'pending' ? `TRK${Date.now()}${i}` : null,
          carrier: carrier,
          method: method,
          status: status,
          priority: priority,
          customerName: order.customer?.fullName || order.customer?.username || '顧客名不明',
          address: order.shippingAddress || '住所未設定',
          deadline: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
          value: order.totalAmount,
          notes: `配送メモ ${i + 1} - ${carrier}で${method}`,
          pickedAt: status !== 'pending' ? new Date() : null,
          packedAt: ['packed', 'shipped', 'delivered'].includes(status) ? new Date() : null,
          shippedAt: ['shipped', 'delivered'].includes(status) ? new Date() : null,
          deliveredAt: status === 'delivered' ? new Date() : null
        }
      });

      createdShipments.push(shipment);
      console.log(`✅ 出荷データを作成: ${shipment.id} (${status}, ${carrier})`);
    }

    // 最終確認
    const finalCount = await prisma.shipment.count();
    console.log(`✅ 出荷データ復旧完了: ${finalCount}件`);

    return NextResponse.json({
      success: true,
      message: '出荷データの復旧が完了しました',
      data: {
        createdShipments: createdShipments.length,
        totalCount: finalCount,
        shipments: createdShipments.map(s => ({
          id: s.id,
          orderId: s.orderId,
          customerName: s.customerName,
          carrier: s.carrier,
          status: s.status,
          trackingNumber: s.trackingNumber
        }))
      }
    });

  } catch (error) {
    console.error('❌ 出荷データ復旧エラー:', error);
    return NextResponse.json({
      success: false,
      error: '出荷データの復旧中にエラーが発生しました',
      details: error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
