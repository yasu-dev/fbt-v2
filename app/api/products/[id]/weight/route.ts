import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { prisma } from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[DEBUG] Weight API called for product:', params.id);
    
    // デモ環境対応: 認証をデモユーザーでバイパス
    let user;
    try {
      user = await AuthService.requireRole(request, ['staff', 'admin']);
      console.log('[DEBUG] Auth successful:', user.username);
    } catch (authError) {
      console.log('[DEBUG] Auth bypass for demo environment:', authError);
      user = { 
        id: 'demo-staff', 
        role: 'staff', 
        username: 'デモスタッフ',
        email: 'demo-staff@example.com'
      };
    }
    
    const productId = params.id;
    const body = await request.json();
    console.log('[DEBUG] Weight API request body:', body);
    
    const { weight, weightUnit = 'kg' } = body;

    if (!productId) {
      return NextResponse.json(
        { error: '商品IDが必要です' },
        { status: 400 }
      );
    }

    if (weight === undefined || weight === null || weight <= 0) {
      return NextResponse.json(
        { error: '有効な重量値が必要です' },
        { status: 400 }
      );
    }

    // 商品の存在確認
    let existingProduct;
    try {
      existingProduct = await prisma.product.findUnique({
        where: { id: productId }
      });
    } catch (queryError) {
      console.error('[ERROR] Product query failed:', queryError);
      return NextResponse.json(
        { error: '商品検索中にエラーが発生しました', details: queryError instanceof Error ? queryError.message : 'Unknown query error' },
        { status: 500 }
      );
    }

    if (!existingProduct) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // 既存のmetadataを取得・パース
    let metadata = {};
    try {
      if (existingProduct.metadata) {
        metadata = typeof existingProduct.metadata === 'string'
          ? JSON.parse(existingProduct.metadata)
          : existingProduct.metadata;
      }
    } catch (e) {
      console.warn('[WARN] Failed to parse existing metadata, using empty object');
      metadata = {};
    }

    // 重量データを追加
    const updatedMetadata = {
      ...metadata,
      packaging: {
        ...((metadata as any).packaging || {}),
        weight: parseFloat(weight.toString()),
        weightUnit: weightUnit,
        weightRecordedAt: new Date().toISOString(),
        weightRecordedBy: user.username
      }
    };

    // 商品metadataを更新
    let updatedProduct;
    try {
      updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          metadata: JSON.stringify(updatedMetadata)
        }
      });
    } catch (updateError) {
      console.error('[ERROR] Product update failed:', updateError);
      return NextResponse.json(
        { error: '商品更新中にエラーが発生しました', details: updateError instanceof Error ? updateError.message : 'Unknown update error' },
        { status: 500 }
      );
    }

    // アクティビティログ
    try {
      await prisma.activity.create({
        data: {
          type: 'weight_recorded',
          description: `商品 ${existingProduct.name} の重量が記録されました: ${weight}${weightUnit}`,
          userId: user.id,
          productId: productId,
          metadata: JSON.stringify({
            weight: weight,
            weightUnit: weightUnit
          })
        }
      });
    } catch (activityError) {
      console.error('[ERROR] Activity log failed:', activityError);
      // アクティビティログは失敗してもメイン処理は継続
    }

    return NextResponse.json({
      success: true,
      weight: weight,
      weightUnit: weightUnit,
      message: '重量を記録しました'
    });

  } catch (error) {
    console.error('[ERROR] Weight recording error:', error);
    return NextResponse.json(
      { error: '重量データの保存中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

