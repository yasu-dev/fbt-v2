import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { AuthService } from '@/lib/auth';
import { ActivityLogger } from '@/lib/activity-logger';
import { ActivityRecorder } from '@/lib/utils/activity-recorder';

// 共有Prismaインスタンスを使用（SQLiteのロック回避と接続管理の一元化）

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // デモ環境: 認証をスキップしてデモユーザーを使用
    const user = {
      id: 'demo-seller',
      username: 'デモセラー',
      role: 'seller'
    };
    
    console.log('[API] セラー商品API - デモ環境: 認証スキップ');

    const productId = params.id;

    // productIdまたはSKUで商品を検索（deliveryPlanInfo含む）
    let product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        currentLocation: true,
      },
    });

    // IDで見つからない場合、SKUで検索を試行
    if (!product) {
      product = await prisma.product.findUnique({
        where: { sku: productId },
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          currentLocation: true,
        },
      });
    }

    // それでも見つからない場合、SKUの末尾で検索（例：006 -> CAM-*-006）
    if (!product) {
      product = await prisma.product.findFirst({
        where: { 
          sku: { 
            endsWith: `-${productId}` 
          } 
        },
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          currentLocation: true,
        },
      });
    }

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // 商品のメタデータから納品プラン情報を取得
    let enrichedProduct = { ...product };
    
    if (product.metadata) {
      try {
        const metadata = JSON.parse(product.metadata);
        
        // 納品プラン関連の情報がある場合
        if (metadata.deliveryPlanId && metadata.deliveryPlanProductId) {
          // DeliveryPlanProductから撮影要望データを取得
          const deliveryPlanProduct = await prisma.deliveryPlanProduct.findUnique({
            where: { id: metadata.deliveryPlanProductId },
            include: {
              images: true,
            },
          });

          if (deliveryPlanProduct) {
            // photographyRequestsをパースして追加
            let photographyRequests = null;
            console.log('[DEBUG] deliveryPlanProduct.photographyRequests raw:', deliveryPlanProduct.photographyRequests);
            if (deliveryPlanProduct.photographyRequests) {
              try {
                photographyRequests = JSON.parse(deliveryPlanProduct.photographyRequests);
                console.log('[DEBUG] Parsed photographyRequests:', JSON.stringify(photographyRequests, null, 2));
              } catch (e) {
                console.warn('Photography requests parse error:', e);
              }
            } else {
              console.log('[DEBUG] No photographyRequests found in deliveryPlanProduct');
            }

            // 🔍 既存システムの検品チェックリストデータを取得
            let existingInspectionChecklist = null;
            try {
              existingInspectionChecklist = await prisma.inspectionChecklist.findUnique({
                where: { deliveryPlanProductId: metadata.deliveryPlanProductId },
              });
              console.log('[DEBUG] 既存検品チェックリスト取得:', existingInspectionChecklist ? '見つかった' : '見つからない');
            } catch (error) {
              console.warn('[DEBUG] 既存検品チェックリスト取得エラー:', error);
            }

            // 🆕 階層型検品チェックリストデータを取得
            let hierarchicalInspectionChecklist = null;
            try {
              hierarchicalInspectionChecklist = await prisma.hierarchicalInspectionChecklist.findUnique({
                where: { deliveryPlanProductId: metadata.deliveryPlanProductId },
                include: { 
                  responses: true
                }
              });
              console.log('[DEBUG] 階層型検品チェックリスト取得:', hierarchicalInspectionChecklist ? '見つかった' : '見つからない');
            } catch (error) {
              console.warn('[DEBUG] 階層型検品チェックリスト取得エラー:', error);
            }

            // deliveryPlanInfoを構築（購入価格はセラー入力値を厳密に優先）
            const originalPurchasePriceFromDP = (() => {
              try {
                if (deliveryPlanProduct.description) {
                  const desc = JSON.parse(deliveryPlanProduct.description);
                  const v = desc?.originalPurchasePrice;
                  return typeof v === 'number' ? v : undefined;
                }
              } catch (e) {}
              return undefined;
            })();

            const normalizedPurchasePrice = (() => {
              if (typeof metadata.purchasePrice === 'number') return metadata.purchasePrice;
              if (originalPurchasePriceFromDP !== undefined) return originalPurchasePriceFromDP;
              return 0; // フォールバックで販売価格等は使用しない
            })();

            enrichedProduct.deliveryPlanInfo = {
              deliveryPlanId: metadata.deliveryPlanId,
              deliveryPlanProductId: metadata.deliveryPlanProductId,
              condition: product.condition, // 常に商品テーブルの正確なコンディションを使用
              purchasePrice: normalizedPurchasePrice,
              purchaseDate: metadata.purchaseDate,
              supplier: metadata.supplier,
              supplierDetails: metadata.supplierDetails,
              photographyRequests: photographyRequests,
              images: deliveryPlanProduct.images || [],
              
              // 🆕 プレミアム梱包リクエストを追加
              premiumPacking: deliveryPlanProduct.premiumPacking || false,
              
              // 🆕 既存システムの検品チェックリストデータを追加
              inspectionChecklist: existingInspectionChecklist,
              
              // 🆕 階層型検品チェックリストデータを追加
              hierarchicalInspectionChecklist: hierarchicalInspectionChecklist,
            };
            
            console.log('[DEBUG] Final enrichedProduct.deliveryPlanInfo:', JSON.stringify(enrichedProduct.deliveryPlanInfo, null, 2));
          }
        }

        // 🆕 互換性のため、トップレベルにもシリアルナンバーを露出（UI側の取得を簡易化）
        try {
          const md = typeof product.metadata === 'string' ? JSON.parse(product.metadata) : (product.metadata as any);
          if (md?.serialNumber && typeof md.serialNumber === 'string') {
            (enrichedProduct as any).serialNumber = md.serialNumber;
          }
        } catch {}
      } catch (e) {
        console.warn('Product metadata parse error:', e);
        // メタデータのパースエラーは無視して続行
      }
    }

    return NextResponse.json(enrichedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: '商品情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin', 'seller']);
    const productId = params.id;
    const body = await request.json();

    // 商品の存在確認
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // セラーは自分の商品のみ更新可能
    if (user.role === 'seller' && existingProduct.sellerId !== user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    // 変更内容を記録するため、変更前の値を保存
    const oldValues: any = {};
    const newValues: any = {};
    const changedFields: string[] = [];

    // 変更される各フィールドをチェック
    const fieldsToCheck = ['name', 'category', 'price', 'condition', 'description', 'imageUrl', 'status', 'currentLocationId', 'metadata'];
    
    for (const field of fieldsToCheck) {
      if (body[field] !== undefined && body[field] !== existingProduct[field as keyof typeof existingProduct]) {
        oldValues[field] = existingProduct[field as keyof typeof existingProduct];
        newValues[field] = body[field];
        changedFields.push(field);
      }
    }

    // 商品情報を更新
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: body.name ?? existingProduct.name,
        category: body.category ?? existingProduct.category,
        price: body.price ?? existingProduct.price,
        condition: body.condition ?? existingProduct.condition,
        description: body.description ?? existingProduct.description,
        imageUrl: body.imageUrl ?? existingProduct.imageUrl,
        status: body.status ?? existingProduct.status,
        currentLocationId: body.currentLocationId ?? existingProduct.currentLocationId,
        metadata: body.metadata ?? existingProduct.metadata,
      },
    });

    // 詳細な変更履歴を記録
    const metadata = ActivityLogger.extractMetadataFromRequest(request);
    
    // 個別の変更内容を記録（新しいActivityRecorderを併用）
    for (const field of changedFields) {
      if (field === 'price') {
        await ActivityLogger.logProductPriceChange(
          productId,
          oldValues[field],
          newValues[field],
          user.id,
          { ...metadata, updatedBy: user.username }
        );
        // 新しいActivity記録も作成
        await ActivityRecorder.recordPriceUpdated(
          productId,
          user.id,
          oldValues[field],
          newValues[field],
          { updatedBy: user.username }
        );
      } else if (field === 'status') {
        await ActivityLogger.logProductStatusChange(
          productId,
          oldValues[field],
          newValues[field],
          user.id,
          { ...metadata, updatedBy: user.username }
        );
        // 新しいActivity記録も作成
        await ActivityRecorder.recordStatusUpdated(
          productId,
          user.id,
          oldValues[field],
          newValues[field],
          { updatedBy: user.username }
        );
      } else {
        await ActivityLogger.logDataChange(
          'product',
          'update',
          productId,
          user.id,
          { oldValue: { [field]: oldValues[field] }, newValue: { [field]: newValues[field] } },
          { ...metadata, field, updatedBy: user.username }
        );
      }
    }

    // 全体的な更新ログも記録
    if (changedFields.length > 0) {
      await ActivityLogger.log({
        type: 'product_update',
        description: `商品 ${updatedProduct.name} が更新されました (変更項目: ${changedFields.join(', ')})`,
        userId: user.id,
        productId: updatedProduct.id,
        metadata: {
          ...metadata,
          changedFields,
          oldValues,
          newValues,
          updatedBy: user.username,
        },
      });
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: '商品情報を更新しました',
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: '商品情報の更新に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // デモ環境: 認証をスキップしてデモユーザーを使用
    const user = {
      id: 'demo-staff',
      username: 'デモスタッフ',
      role: 'staff'
    };

    const productId = params.id;
    const body = await request.json();

    console.log(`[API] 商品移動 PATCH: ${productId}`, body);

    // 商品の存在確認
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // 移動先ロケーション確認
    let newLocationId = null;
    if (body.location) {
      const location = await prisma.location.findUnique({
        where: { code: body.location }
      });

      if (!location) {
        return NextResponse.json(
          { error: `移動先ロケーション ${body.location} が見つかりません` },
          { status: 400 }
        );
      }
      newLocationId = location.id;
    }

    // 商品情報を部分更新
    const updateData: any = {};
    if (body.location && newLocationId) {
      updateData.currentLocationId = newLocationId;
    }
    if (body.lastModified) {
      updateData.updatedAt = new Date(body.lastModified);
    }
    // 検品備考の更新をサポート
    if (body.inspectionNotes !== undefined) {
      updateData.inspectionNotes = body.inspectionNotes;
      console.log(`[API] 検品備考を更新: "${body.inspectionNotes}"`);
    }
    // 価格の更新をサポート
    if (body.price !== undefined) {
      updateData.price = body.price;
      console.log(`[API] 価格を更新: ${existingProduct.price} → ${body.price}`);
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        currentLocation: true,
      },
    });

    // 移動ログを記録
    if (body.location && newLocationId) {
      const metadata = ActivityLogger.extractMetadataFromRequest(request);
      await ActivityLogger.logInventoryMovement(
        productId,
        existingProduct.currentLocationId,
        newLocationId,
        user.id,
        {
          ...metadata,
          fromLocationCode: existingProduct.currentLocation?.code || null,
          toLocationCode: body.location,
          moveReason: body.moveReason || '場所移動',
          movedBy: user.username,
        }
      );
    }

    // 検品備考の変更ログを記録
    if (body.inspectionNotes !== undefined && body.inspectionNotes !== existingProduct.inspectionNotes) {
      const metadata = ActivityLogger.extractMetadataFromRequest(request);
      await ActivityLogger.logDataChange(
        'product',
        'update',
        productId,
        user.id,
        {
          oldValue: { inspectionNotes: existingProduct.inspectionNotes },
          newValue: { inspectionNotes: body.inspectionNotes },
        },
        {
          ...metadata,
          field: 'inspectionNotes',
          updatedBy: user.username,
        }
      );
    }

    // 価格の変更ログを記録
    if (body.price !== undefined && body.price !== existingProduct.price) {
      try {
        console.log(`[API] 価格変更ログ記録開始: ${existingProduct.price} → ${body.price}`);

        const metadata = ActivityLogger.extractMetadataFromRequest(request);
        await ActivityLogger.logProductPriceChange(
          productId,
          existingProduct.price,
          body.price,
          user.id,
          { ...metadata, updatedBy: user.username }
        );

        // 直接activityテーブルにも記録
        const activityResult = await prisma.activity.create({
          data: {
            type: 'product_price_update',
            description: `商品 ${existingProduct.name} の価格が変更されました (¥${existingProduct.price} → ¥${body.price})`,
            userId: user.id === 'demo-staff' ? null : user.id,
            productId: productId,
            metadata: JSON.stringify({
              oldPrice: existingProduct.price,
              newPrice: body.price,
              updatedBy: user.username,
              userRole: 'staff'
            })
          }
        });

        console.log(`[API] Activity作成成功: ${activityResult.id}`);

        // キャッシュクリアのため強制的に履歴APIを一度呼び出し
        try {
          const historyResponse = await fetch(`http://localhost:3002/api/products/${productId}/history?t=${Date.now()}`);
          console.log(`[API] 履歴キャッシュクリア: ${historyResponse.status}`);
        } catch (cacheError) {
          console.warn('[API] 履歴キャッシュクリアエラー:', cacheError);
        }

        console.log(`[API] 価格変更ログ記録完了: ${existingProduct.price} → ${body.price}`);
      } catch (logError) {
        console.error(`[API] 価格変更ログ記録エラー:`, logError);
      }
    }

    console.log(`[API] 商品移動完了: ${updatedProduct.name} → ${body.location}`);

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: '商品の移動が完了しました',
    });
  } catch (error: any) {
    console.error('Error moving product:', error);
    return NextResponse.json(
      { 
        error: '商品の移動に失敗しました',
        details: error?.message || String(error),
        ...(process.env.NODE_ENV !== 'production' && { stack: error?.stack })
      },
      { status: 500 }
    );
  }
}