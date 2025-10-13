import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { PDFGenerator } from '@/lib/pdf-generator';

export async function POST(request: NextRequest) {
  try {
    // ユーザー認証（デモ環境では省略可能）
    let user = null;
    try {
      user = await AuthService.getUserFromRequest(request);
    } catch (authError) {
      console.log('Auth bypass for demo environment:', authError);
      user = { 
        id: 'demo-user', 
        role: 'staff', 
        username: 'デモスタッフ',
        email: 'demo@example.com'
      };
    }
    
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, data, carrier, service } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: 'PDFタイプとデータが必要です' },
        { status: 400 }
      );
    }

    let pdfBlob: Blob;
    let fileName: string;

    switch (type) {
      case 'barcode-labels':
        // バーコードラベルの生成
        pdfBlob = await PDFGenerator.generateBarcodeLabels(data);
        fileName = `barcode_labels_${Date.now()}.pdf`;
        break;

      case 'shipping-label':
        // 配送ラベルの生成（配送業者対応）
        pdfBlob = await PDFGenerator.generateShippingLabel(data, carrier, service);
        fileName = `shipping_label_${data.orderNumber || Date.now()}_${carrier || 'generic'}.pdf`;
        break;

      case 'delivery-note':
        // 納品書の生成
        pdfBlob = await PDFGenerator.generateDeliveryNote(data);
        fileName = `delivery_note_${data.deliveryId || Date.now()}.pdf`;
        break;

      case 'picking-list':
        // ピッキングリストの生成
        pdfBlob = await PDFGenerator.generatePickingList(data);
        fileName = `picking_list_${data.listId || Date.now()}.pdf`;
        break;

      case 'product_label':
        // 商品ラベルの生成
        pdfBlob = await PDFGenerator.generateProductLabel(data);
        fileName = `product_label_${data.productId || Date.now()}.pdf`;
        break;

      default:
        return NextResponse.json(
          { error: 'サポートされていないPDFタイプです' },
          { status: 400 }
        );
    }

    // PDFをBase64エンコード
    const buffer = await pdfBlob.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    // 実際の実装では、生成したPDFをS3等にアップロードして
    // ダウンロードURLを返すことも可能
    return NextResponse.json({
      success: true,
      fileName,
      fileSize: pdfBlob.size,
      base64Data: base64,
      downloadUrl: `/api/pdf/download/${fileName}`, // 仮のURL
      message: 'PDFが正常に生成されました'
    });
  } catch (error) {
    console.error('[ERROR] PDF Generation:', error);
    return NextResponse.json(
      { error: 'PDF生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// PDFプレビュー用のGETエンドポイント
export async function GET(request: NextRequest) {
  try {
    let user = null;
    try {
      user = await AuthService.getUserFromRequest(request);
    } catch (authError) {
      console.log('Auth bypass for demo environment:', authError);
      user = { 
        id: 'demo-user', 
        role: 'staff', 
        username: 'デモスタッフ',
        email: 'demo@example.com'
      };
    }
    
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    // サンプルデータでプレビュー生成
    let sampleData: any;
    switch (type) {
      case 'barcode-labels':
        sampleData = [
          {
            sku: 'TWD-2024-001',
            barcode: '1234567890123',
            productName: 'Canon EOS R5 ボディ',
            price: 450000
          },
          {
            sku: 'TWD-2024-002',
            barcode: '1234567890124',
            productName: 'Nikon Z9 ボディ',
            price: 620000
          },
          {
            sku: 'TWD-2024-003',
            barcode: '1234567890125',
            productName: 'Sony α7R V ボディ',
            price: 480000
          }
        ];
        break;

      case 'delivery-note':
        sampleData = {
          deliveryId: 'DN-2024-0001',
          deliveryTo: {
            name: '山田太郎 様',
            address: '〒100-0001 東京都千代田区千代田1-1-1 千代田ビル5F'
          },
          items: [
            {
              sku: 'TWD-2024-001',
              productName: 'Canon EOS R5 ボディ',
              quantity: 1,
              unitPrice: 450000
            },
            {
              sku: 'TWD-2024-004',
              productName: 'Canon RF24-70mm F2.8 L IS USM',
              quantity: 1,
              unitPrice: 280000
            }
          ],
          notes: 'お買い上げありがとうございます。'
        };
        break;

      case 'picking-list':
        sampleData = {
          listId: 'PL-2024-0001',
          assignedTo: '田中一郎',
          priority: 'high',
          items: [
            {
              location: 'A-01-03',
              sku: 'TWD-2024-001',
              productName: 'Canon EOS R5 ボディ',
              quantity: 1,
              isPicked: false
            },
            {
              location: 'B-02-15',
              sku: 'TWD-2024-004',
              productName: 'Canon RF24-70mm F2.8 L IS USM',
              quantity: 1,
              isPicked: false
            },
            {
              location: 'C-03-08',
              sku: 'TWD-2024-010',
              productName: 'SanDisk Extreme PRO 128GB',
              quantity: 2,
              isPicked: true
            }
          ],
          qrCode: 'sample-qr-code'
        };
        break;

      case 'product_label':
        const productId = searchParams.get('productId') || 'DEMO-001';
        sampleData = {
          productId,
          sku: `DEMO-${productId}`,
          name: `デモ商品 ${productId}`,
          brand: 'デモブランド',
          model: `モデル${productId}`,
          price: 100000,
          generatedBy: 'デモスタッフ'
        };
        break;

      default:
        return NextResponse.json(
          { error: 'プレビュータイプを指定してください' },
          { status: 400 }
        );
    }

    // プレビューデータを返す
    return NextResponse.json({
      success: true,
      type,
      sampleData,
      message: 'プレビュー用のサンプルデータです'
    });
  } catch (error) {
    console.error('[ERROR] PDF Preview:', error);
    return NextResponse.json(
      { error: 'プレビューの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 