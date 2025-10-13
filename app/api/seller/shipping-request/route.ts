import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // セラー/スタッフのみ許可（セッションで認証）
    const user = await AuthService.requireRole(request, ['seller', 'staff', 'admin']);
    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, shippingInfo } = body || {};
    if (!productId || !shippingInfo) {
      return NextResponse.json({ error: '必須パラメータが不足しています' }, { status: 400 });
    }

    // 既存の /api/shipping に委譲（仕様を統一）
    const base = new URL(request.url);
    const delegateUrl = `${base.origin}/api/shipping`;
    const res = await fetch(delegateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: `AUTO-${productId}-${Date.now()}`,
        carrier: shippingInfo.carrier,
        method: shippingInfo.service,
        customerName: user.fullName || user.username || user.email,
        address: shippingInfo.shippingAddress,
        value: 0,
        notes: `seller_shipping_request: productId=${productId}`
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err.error || '出荷指示に失敗しました' }, { status: 500 });
    }

    const created = await res.json();
    return NextResponse.json({ success: true, message: '出荷指示を受け付けました', shipment: created });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'エラーが発生しました' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    console.log('[Seller Shipping Request] 出荷指示リクエスト受信');
    
    const data = await request.json();
    const { productId, shippingInfo } = data;
    
    console.log('[Seller Shipping Request] リクエストデータ:', {
      productId,
      carrier: shippingInfo?.carrier?.name,
      service: shippingInfo?.service
    });

    // 商品情報を取得
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        currentLocation: true
      }
    });

    if (!product) {
      console.error('[Seller Shipping Request] 商品が見つかりません:', productId);
      return NextResponse.json(
        { success: false, error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // ステータスを更新（保管中 → 出荷準備中）
    await prisma.product.update({
      where: { id: productId },
      data: {
        status: 'ordered',
        updatedAt: new Date()
      }
    });

    // 出荷タスクを作成（スタッフへの通知）
    await prisma.task.create({
      data: {
        category: 'shipping',
        status: 'pending',
        priority: 'high',
        title: `出荷指示: ${product.name}`,
        description: `セラーからの出荷指示\n配送業者: ${shippingInfo.carrier.name}\nサービス: ${shippingInfo.service}\n商品ID: ${productId}`,
        assignedTo: null, // スタッフが自分でピックアップ
        metadata: JSON.stringify({
          productId,
          shippingInfo,
          requestedBy: 'seller',
          requestedAt: new Date().toISOString()
        })
      }
    });

    console.log('[Seller Shipping Request] 出荷指示処理完了');

    return NextResponse.json({
      success: true,
      message: '出荷指示を正常に送信しました。スタッフがピッキング作業を開始します。',
      data: {
        productId,
        newStatus: 'ordered',
        carrier: shippingInfo.carrier.name,
        service: shippingInfo.service
      }
    });

  } catch (error) {
    console.error('[Seller Shipping Request] エラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '出荷指示の処理中にエラーが発生しました' 
      },
      { status: 500 }
    );
  }
}