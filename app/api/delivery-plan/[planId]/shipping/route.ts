import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    // 認証チェック（セラーのみ）
    let user;
    try {
      user = await AuthService.requireRole(request, ['seller']);
    } catch (authError) {
      console.error('[ERROR] 認証エラー:', authError);
      return NextResponse.json(
        { error: 'ログインが必要です。再度ログインしてください。' },
        { status: 401 }
      );
    }

    const { planId } = params;
    const { status, trackingNumber } = await request.json();

    console.log('[DEBUG] 発送更新リクエスト:', {
      planId,
      status,
      trackingNumber,
      sellerId: user.id
    });

    // 納品プランの存在確認と所有者チェック
    const existingPlan = await prisma.deliveryPlan.findFirst({
      where: {
        id: planId,
        sellerId: user.id
      }
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: '納品プランが見つからないか、アクセス権限がありません。' },
        { status: 404 }
      );
    }

    // 発送待ちステータス（Pending）からのみ発送済みに変更可能
    if (existingPlan.status !== 'Pending') {
      return NextResponse.json(
        { error: '発送待ちステータスのプランのみ発送処理が可能です。' },
        { status: 400 }
      );
    }

    // ステータスを発送済みに更新
    const updatedPlan = await prisma.deliveryPlan.update({
      where: { id: planId },
      data: {
        status: 'Shipped',
        shippingTrackingNumber: trackingNumber || null,
        shippedAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('[INFO] 発送更新成功:', {
      planId: updatedPlan.id,
      status: updatedPlan.status,
      trackingNumber: updatedPlan.shippingTrackingNumber,
      shippedAt: updatedPlan.shippedAt
    });

    return NextResponse.json({
      success: true,
      message: '納品プランを発送済みに更新しました',
      plan: {
        id: updatedPlan.id,
        status: updatedPlan.status,
        shippingTrackingNumber: updatedPlan.shippingTrackingNumber,
        shippedAt: updatedPlan.shippedAt,
        updatedAt: updatedPlan.updatedAt
      }
    });

  } catch (error) {
    console.error('[ERROR] 発送更新エラー:', error);
    
    let errorMessage = '発送処理に失敗しました';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('[ERROR] 詳細:', error.stack);
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
