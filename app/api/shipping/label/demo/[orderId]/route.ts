import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    console.log('📦 Demo PDF generation called for:', params.orderId);

    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json(
        { error: '注文IDが必要です' },
        { status: 400 }
      );
    }

    // 簡単なPDFコンテンツを生成（デモ用）
    const labelData = generateDemoLabelData(orderId);
    
    // 最小限のPDFコンテンツを作成
    const pdfContent = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources 5 0 R
>>
endobj

4 0 obj
<<
/Length 120
>>
stream
BT
/F1 12 Tf
50 700 Td
(Demo Shipping Label) Tj
0 -20 Td
(Order: ${orderId}) Tj
0 -20 Td
(Customer: ${labelData.customer}) Tj
0 -20 Td
(Tracking: ${labelData.trackingNumber}) Tj
ET
endstream
endobj

5 0 obj
<<
/Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >>
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000226 00000 n 
0000000439 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
538
%%EOF`;

    console.log(`📦 デモ配送ラベルPDF生成完了: ${orderId}`);

    // PDFファイルとしてレスポンス
    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${orderId}.pdf"`,
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('Demo label generation error:', error);
    return NextResponse.json(
      { error: 'デモラベル生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

function generateDemoLabelData(orderId: string) {
  // デモ注文IDに対応したラベル情報をPDFGeneratorの形式に変換
  const labelInfoMap: Record<string, any> = {
    'DEMO-SHIP-001': {
      orderNumber: 'DEMO-SHIP-001',
      productSku: 'SKU-CAN-5D4-001',
      productName: 'Canon EOS 5D Mark IV ボディ',
      customer: '田中太郎',
      shippingAddress: '東京都渋谷区代官山1-2-3',
      shippingMethod: 'FedEx International Priority',
      value: 350000,
      carrier: 'fedex',
      service: 'priority',
      trackingNumber: 'FX123456789JP'
    },
    'DEMO-SHIP-002': {
      orderNumber: 'DEMO-SHIP-002',
      productSku: 'SKU-NIK-D850-002',
      productName: 'Nikon D850 ボディ',
      customer: '佐藤花子',
      shippingAddress: '大阪府大阪市北区梅田2-4-5',
      shippingMethod: 'DHL Express Worldwide',
      value: 320000,
      carrier: 'dhl',
      service: 'express',
      trackingNumber: 'DHL987654321JP'
    },
    'DEMO-SHIP-003': {
      orderNumber: 'DEMO-SHIP-003',
      productSku: 'SKU-ROL-SUB-003',
      productName: 'Rolex Submariner Date',
      customer: '山田次郎',
      shippingAddress: '神奈川県横浜市中区元町3-6-7',
      shippingMethod: 'ヤマト宅急便',
      value: 1200000,
      carrier: 'yamato',
      service: 'standard',
      trackingNumber: 'YMT456789012JP'
    },
    'DEMO-SHIP-004': {
      orderNumber: 'DEMO-SHIP-004',
      productSku: 'SKU-SON-A7R5-004',
      productName: 'Sony α7R V ボディ',
      customer: '鈴木一郎',
      shippingAddress: '愛知県名古屋市中区錦1-8-9',
      shippingMethod: 'FedEx Priority Overnight',
      value: 450000,
      carrier: 'fedex',
      service: 'priority',
      trackingNumber: 'FX789123456JP'
    },
    // 注文番号（ORD-）ベースのデータ
    'ORD-20240101-001': {
      orderNumber: 'ORD-20240101-001',
      productSku: 'SKU-CAN-5D4-001',
      productName: 'Canon EOS 5D Mark IV ボディ',
      customer: '田中太郎',
      shippingAddress: '東京都渋谷区代官山1-2-3',
      shippingMethod: 'FedEx International Priority',
      value: 350000,
      carrier: 'fedex',
      service: 'priority',
      trackingNumber: 'FX123456789JP'
    },
    'ORD-20240101-002': {
      orderNumber: 'ORD-20240101-002',
      productSku: 'SKU-NIK-D850-002',
      productName: 'Nikon D850 ボディ',
      customer: '佐藤花子',
      shippingAddress: '大阪府大阪市北区梅田2-4-5',
      shippingMethod: 'DHL Express Worldwide',
      value: 320000,
      carrier: 'dhl',
      service: 'express',
      trackingNumber: 'DHL987654321JP'
    },
    'ORD-20240102-001': {
      orderNumber: 'ORD-20240102-001',
      productSku: 'SKU-ROL-SUB-003',
      productName: 'Rolex Submariner Date',
      customer: '山田次郎',
      shippingAddress: '神奈川県横浜市中区元町3-6-7',
      shippingMethod: 'ヤマト宅急便',
      value: 1200000,
      carrier: 'yamato',
      service: 'standard',
      trackingNumber: 'YMT456789012JP'
    },
    'ORD-20240102-002': {
      orderNumber: 'ORD-20240102-002',
      productSku: 'SKU-SON-A7R5-004',
      productName: 'Sony α7R V ボディ',
      customer: '鈴木一郎',
      shippingAddress: '愛知県名古屋市中区錦1-8-9',
      shippingMethod: 'FedEx Priority Overnight',
      value: 450000,
      carrier: 'fedex',
      service: 'priority',
      trackingNumber: 'FX789123456JP'
    }
  };

  // 指定された注文IDのデータがあればそれを返す、なければ汎用データを生成
  return labelInfoMap[orderId] || {
    orderNumber: orderId,
    productSku: `SKU-${orderId}`,
    productName: `デモ商品 (${orderId})`,
    customer: 'デモ顧客',
    shippingAddress: '東京都新宿区西新宿1-1-1',
    shippingMethod: 'FedEx Standard',
    value: 100000,
    carrier: 'fedex',
    service: 'standard',
    trackingNumber: `TRK${Date.now().toString().slice(-9)}`
  };
}


