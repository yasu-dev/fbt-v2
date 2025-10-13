import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    console.log(`[LABEL/GET] リクエスト受信: orderId=${orderId}`);
    
    if (!orderId) {
      return NextResponse.json({ error: 'orderId は必須です' }, { status: 400 });
    }

    // 注文を検索（id または orderNumber）
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId }
        ]
      },
      include: {
        activities: true,
        shipments: true,
      }
    });

    console.log(`[LABEL/GET] Order検索結果: ${order ? `見つかった (${order.id})` : '見つからない'}`);

    if (!order) {
      // フォールバック: orderId が実オーダーでない場合でも、関連する Shipment や Product から解決を試みる
      console.log(`[LABEL/GET] フォールバック開始: orderId=${orderId}`);
      
      const fallbackShipment = await prisma.shipment.findFirst({
        where: {
          OR: [
            { id: orderId }, // Shipment ID の可能性
            { order: { orderNumber: orderId } }, // 注文番号として保持されている可能性（PICK- / AUTO-* など）
            { productId: orderId } // プロダクトIDが渡ってきたケース
          ]
        },
        include: { order: true }
      });

      console.log(`[LABEL/GET] Shipmentフォールバック検索結果: ${fallbackShipment ? `見つかった (${fallbackShipment.id})` : '見つからない'}`);

      if (fallbackShipment) {
        // 1) アクティビティからラベル解決（orderId / productId 双方で検索）
        try {
          const activities = await prisma.activity.findMany({
            where: {
              OR: [
                { orderId: fallbackShipment.orderId },
                { productId: fallbackShipment.productId }
              ],
              type: { in: ['label_generated', 'label_uploaded'] }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          });

          for (const act of activities) {
            try {
              const meta = act.metadata ? JSON.parse(act.metadata) : {};
              const fileName = meta.fileName || meta.labelFileName;
              const carrier = (meta.carrier || fallbackShipment.carrier || 'other').toLowerCase();
              if (fileName) {
                const url = fileName.startsWith('http') || fileName.startsWith('/')
                  ? (fileName.startsWith('/labels/') ? fileName : `/labels/${fileName.replace(/^\/?labels\//, '')}`)
                  : `/labels/${fileName}`;
                const provider = act.type === 'label_uploaded' ? 'seller' : 'seller';
                return NextResponse.json({ url, fileName, provider, carrier });
              }
            } catch {}
          }
        } catch {}

        // 2) shipment.notes に保存されたラベルURLを探索
        try {
          if (fallbackShipment.notes) {
            const notes = typeof fallbackShipment.notes === 'string' ? JSON.parse(fallbackShipment.notes) : fallbackShipment.notes;
            if (notes && (notes.labelFileUrl || notes.fileUrl)) {
              const fileUrl = (notes.labelFileUrl || notes.fileUrl) as string;
              const fileName = (notes.fileName as string) || fileUrl.split('/').pop();
              const carrier = (fallbackShipment.carrier || 'other').toLowerCase();
              return NextResponse.json({ url: fileUrl, fileName, provider: 'seller', carrier });
            }
          }
        } catch {}

        // フォールバックShipmentは見つかったがラベルが無い場合、デモラベルを返す
        console.log(`[LABEL/GET] フォールバックShipment発見だがラベルなし。デモラベル返却: ${fallbackShipment.id}`);
        return NextResponse.json({
          url: `/labels/bundle_undefined_1757591226945.pdf`, // 既存のデモPDFを使用
          fileName: `demo-label-${orderId}.pdf`,
          provider: 'seller',
          carrier: fallbackShipment.carrier || 'pending',
          isDemo: true,
          message: 'デモラベルを表示しています（本番ではセラーがアップロードしたラベルが表示されます）'
        });
      }

      console.log(`[LABEL/GET] フォールバックShipmentも見つからず: orderId=${orderId}`);
      return NextResponse.json({ error: '対象の注文が見つかりません' }, { status: 404 });
    }

    // 1) activities から最新のラベルイベントを探索
    const labelActivities = (order.activities || []).filter(a =>
      a.type === 'label_generated' || a.type === 'label_uploaded'
    );
    labelActivities.sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

    for (const act of labelActivities) {
      try {
        const meta = act.metadata ? JSON.parse(act.metadata) : {};
        const fileName = meta.fileName;
        const carrier = meta.carrier || (act.type === 'label_generated' ? 'fedex' : (meta.carrier || 'other'));
        if (fileName) {
          // public/labels 直配信が基本。download 経由URLも将来考慮
          const url = fileName.startsWith('http') || fileName.startsWith('/')
            ? (fileName.startsWith('/labels/') ? fileName.replace('/labels/', '/labels/') : `/labels/${fileName}`)
            : `/labels/${fileName}`;
          const provider = act.type === 'label_uploaded' ? 'seller' : 'seller';
          return NextResponse.json({ url, fileName, provider, carrier });
        }
      } catch {}
    }

    // 2) shipments.notes から保管された labelFileUrl を探索（同梱ケース等）
    const shipments = order.shipments || [];
    shipments.sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    for (const s of shipments) {
      try {
        if (s.notes) {
          const notes = JSON.parse(s.notes);
          if (notes && notes.labelFileUrl) {
            const fileUrl = notes.labelFileUrl as string;
            const fileName = (notes.fileName as string) || fileUrl.split('/').pop();
            const carrier = (s.carrier || 'other').toLowerCase();
            return NextResponse.json({ url: fileUrl, fileName, provider: 'seller', carrier });
          }
        }
      } catch {}
    }

    // Order は見つかったがラベルが無い場合もデモラベルを返す（開発環境用）
    console.log(`[LABEL/GET] Order発見だがラベル無し。デモラベル返却: ${order.id}, orderNumber: ${order.orderNumber}`);
    return NextResponse.json({
      url: `/labels/bundle_undefined_1757591226945.pdf`, // 既存のデモPDFを使用
      fileName: `demo-label-${order.orderNumber}.pdf`,
      provider: 'seller',
      carrier: 'pending',
      isDemo: true,
      message: 'デモラベルを表示しています（本番ではセラーがアップロードしたラベルが表示されます）'
    });
  } catch (error) {
    console.error('[ERROR] label/get:', error);
    return NextResponse.json({ error: 'ラベル取得中にエラーが発生しました' }, { status: 500 });
  }
}









