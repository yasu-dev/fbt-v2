import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// jsPDFに日本語フォントを追加
const addJapaneseFont = (pdf: any) => {
  // 日本語対応のためのBase64フォントデータ（簡易版）
  // 実際の本格運用では、適切な日本語フォントファイルを使用
  pdf.addFont('NotoSansCJK-Regular.ttf', 'NotoSansCJK', 'normal');
  pdf.setFont('NotoSansCJK');
};

// 型定義
interface BarcodeLabel {
  sku: string;
  barcode: string;
  productName: string;
  category?: string;
  price?: string;
}

interface ProductLabelData {
  productId: string;
  sku: string;
  name: string;
  brand?: string;
  model?: string;
  price?: number;
  category?: string;
  condition?: string;
  generatedBy?: string;
  sellerName?: string;
  sellerUsername?: string;
  locationName?: string;
  entryDate?: string;
  inspectionDate?: string;
  notes?: string;
}

/**
 * PDF生成ユーティリティ
 */
export class PDFGenerator {
  /**
   * バーコードラベルPDF生成（A4サイズ 6面付け）
   */
  static async generateBarcodeLabels(labels: BarcodeLabel[]): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // A4: 210mm x 297mm
    // 6面付け（2列 x 3行）
    const labelWidth = 95;
    const labelHeight = 90;
    const marginX = 10;
    const marginY = 13.5;
    const spacing = 5;

    let currentPage = 0;
    let position = 0;

    labels.forEach((label, index) => {
      // 新しいページが必要な場合
      if (position === 0 && index > 0) {
        pdf.addPage();
      }

      // 位置計算
      const col = position % 2;
      const row = Math.floor(position / 2);
      const x = marginX + col * (labelWidth + spacing);
      const y = marginY + row * (labelHeight + spacing);

      // ラベル枠線
      pdf.setDrawColor(200);
      pdf.rect(x, y, labelWidth, labelHeight);

      // タイトル
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('THE WORLD DOOR', x + labelWidth / 2, y + 10, { align: 'center' });

      // SKU
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`SKU: ${label.sku}`, x + 5, y + 20);

      // バーコード（模擬的な表現）
      pdf.setFillColor(0);
      const barcodeY = y + 30;
      const barcodeHeight = 20;
      const barcodeWidth = labelWidth - 20;
      
      // バーコードパターンをシミュレート
      for (let i = 0; i < barcodeWidth; i += 2) {
        if (Math.random() > 0.3) {
          pdf.rect(x + 10 + i, barcodeY, 1, barcodeHeight, 'F');
        }
      }

      // バーコード番号
      pdf.setFontSize(10);
      pdf.text(label.barcode, x + labelWidth / 2, barcodeY + barcodeHeight + 5, { align: 'center' });

      // 商品名
      pdf.setFontSize(11);
      const productNameLines = pdf.splitTextToSize(label.productName, labelWidth - 10);
      pdf.text(productNameLines, x + 5, y + 65);

      // 価格
      if (label.price) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`¥${label.price.toLocaleString()}`, x + labelWidth - 5, y + 80, { align: 'right' });
      }

      position++;
      if (position === 6) {
        position = 0;
      }
    });

    return pdf.output('blob');
  }

  /**
   * 納品書PDF生成
   */
  static async generateDeliveryNote(data: DeliveryNoteData): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // ヘッダー
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('納品書', 105, 20, { align: 'center' });

    // 日付
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`発行日: ${new Date().toLocaleDateString('ja-JP')}`, 170, 20);
    pdf.text(`納品書番号: ${data.deliveryId}`, 170, 25);

    // 会社情報
    pdf.setFontSize(12);
    pdf.text('THE WORLD DOOR', 20, 40);
    pdf.setFontSize(10);
    pdf.text('〒100-0001 東京都千代田区千代田1-1-1', 20, 46);
    pdf.text('TEL: 03-1234-5678', 20, 52);

    // 納品先情報
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('納品先:', 20, 65);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.deliveryTo.name, 20, 72);
    pdf.setFontSize(10);
    const addressLines = pdf.splitTextToSize(data.deliveryTo.address, 100);
    pdf.text(addressLines, 20, 78);

    // 商品テーブル
    const startY = 100;
    const headers = ['No.', 'SKU', '商品名', '数量', '単価', '金額'];
    const columnWidths = [15, 30, 70, 20, 25, 25];
    
    // ヘッダー行
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, startY, 170, 8, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    
    let currentX = 20;
    headers.forEach((header, index) => {
      pdf.text(header, currentX + columnWidths[index] / 2, startY + 5, { align: 'center' });
      currentX += columnWidths[index];
    });

    // データ行
    pdf.setFont('helvetica', 'normal');
    let currentY = startY + 10;
    let subtotal = 0;

    data.items.forEach((item, index) => {
      currentX = 20;
      const amount = item.quantity * item.unitPrice;
      subtotal += amount;

      pdf.text((index + 1).toString(), currentX + columnWidths[0] / 2, currentY + 5, { align: 'center' });
      currentX += columnWidths[0];

      pdf.text(item.sku, currentX + 2, currentY + 5);
      currentX += columnWidths[1];

      const productNameLines = pdf.splitTextToSize(item.productName, columnWidths[2] - 4);
      pdf.text(productNameLines[0], currentX + 2, currentY + 5);
      currentX += columnWidths[2];

      pdf.text(item.quantity.toString(), currentX + columnWidths[3] / 2, currentY + 5, { align: 'center' });
      currentX += columnWidths[3];

      pdf.text(`¥${item.unitPrice.toLocaleString()}`, currentX + columnWidths[4] - 2, currentY + 5, { align: 'right' });
      currentX += columnWidths[4];

      pdf.text(`¥${amount.toLocaleString()}`, currentX + columnWidths[5] - 2, currentY + 5, { align: 'right' });

      // 罫線
      pdf.setDrawColor(200);
      pdf.line(20, currentY + 8, 190, currentY + 8);
      
      currentY += 10;
    });

    // 合計
    currentY += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('小計:', 140, currentY);
    pdf.text(`¥${subtotal.toLocaleString()}`, 185, currentY, { align: 'right' });

    const tax = Math.floor(subtotal * 0.1);
    const total = subtotal + tax;

    currentY += 6;
    pdf.text('消費税(10%):', 140, currentY);
    pdf.text(`¥${tax.toLocaleString()}`, 185, currentY, { align: 'right' });

    currentY += 6;
    pdf.setFontSize(12);
    pdf.text('合計金額:', 140, currentY);
    pdf.text(`¥${total.toLocaleString()}`, 185, currentY, { align: 'right' });

    // フッター
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('備考: ' + (data.notes || 'なし'), 20, 260);

    return pdf.output('blob');
  }

  /**
   * ピッキングリストPDF生成
   */
  static async generatePickingList(data: PickingListData): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // ヘッダー
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ピッキングリスト', 105, 15, { align: 'center' });

    // 基本情報
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`作成日時: ${new Date().toLocaleString('ja-JP')}`, 15, 25);
    pdf.text(`リスト番号: ${data.listId}`, 15, 30);
    pdf.text(`作業者: ${data.assignedTo || '未割当'}`, 15, 35);
    pdf.text(`優先度: ${data.priority || '通常'}`, 150, 30);

    // 商品リスト
    const startY = 45;
    const headers = ['□', 'ロケーション', 'SKU', '商品名', '数量', 'ステータス'];
    const columnWidths = [10, 30, 30, 70, 20, 25];

    // ヘッダー行
    pdf.setFillColor(230, 230, 230);
    pdf.rect(15, startY, 180, 8, 'F');
    pdf.setFont('helvetica', 'bold');
    
    let currentX = 15;
    headers.forEach((header, index) => {
      if (header === '□') {
        // チェックボックス
        pdf.rect(currentX + 3, startY + 2, 4, 4);
      } else {
        pdf.text(header, currentX + 2, startY + 5);
      }
      currentX += columnWidths[index];
    });

    // データ行
    pdf.setFont('helvetica', 'normal');
    let currentY = startY + 10;

    data.items.forEach((item) => {
      currentX = 15;

      // チェックボックス
      pdf.rect(currentX + 3, currentY + 1, 4, 4);
      currentX += columnWidths[0];

      // ロケーション（強調表示）
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text(item.location, currentX + 2, currentY + 5);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      currentX += columnWidths[1];

      // SKU
      pdf.text(item.sku, currentX + 2, currentY + 5);
      currentX += columnWidths[2];

      // 商品名（長い場合は省略）
      const productName = item.productName.length > 40 
        ? item.productName.substring(0, 37) + '...' 
        : item.productName;
      pdf.text(productName, currentX + 2, currentY + 5);
      currentX += columnWidths[3];

      // 数量
      pdf.setFont('helvetica', 'bold');
      pdf.text(item.quantity.toString(), currentX + columnWidths[4] / 2, currentY + 5, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      currentX += columnWidths[4];

      // ステータス
      const statusText = item.isPicked ? '✓ 完了' : '未完了';
      if (item.isPicked) {
        pdf.setTextColor(0, 150, 0);
      }
      pdf.text(statusText, currentX + 2, currentY + 5);
      pdf.setTextColor(0);

      // 罫線
      pdf.setDrawColor(200);
      pdf.line(15, currentY + 8, 195, currentY + 8);
      
      currentY += 10;

      // ページブレイク
      if (currentY > 270) {
        pdf.addPage();
        currentY = 20;
      }
    });

    // サマリー
    currentY += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text(`合計アイテム数: ${data.items.length}`, 15, currentY);
    
    const pickedCount = data.items.filter(item => item.isPicked).length;
    pdf.text(`完了: ${pickedCount} / ${data.items.length}`, 15, currentY + 6);

    // QRコード領域（実際の実装では本物のQRコードを生成）
    if (data.qrCode) {
      pdf.rect(150, currentY - 5, 30, 30);
      pdf.setFontSize(8);
      pdf.text('QRコード', 165, currentY + 20, { align: 'center' });
    }

    return pdf.output('blob');
  }

  /**
   * 配送ラベルPDF生成（配送業者別対応）
   */
  static async generateShippingLabel(data: any, carrier?: string, service?: string): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true
    });

    // 日本語対応のため、デフォルトフォントを使用し、英数字のみで情報を記載
    // または代替として、重要な情報を英数字で表現

    // ページの枠線
    pdf.setDrawColor(0);
    pdf.setLineWidth(1);
    pdf.rect(10, 10, 190, 277);

    // ヘッダー - 会社名と配送業者情報
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('THE WORLD DOOR', 105, 25, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.text('SHIPPING LABEL', 105, 35, { align: 'center' });
    
    // 配送業者情報を追加
    if (carrier) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const carrierName = PDFGenerator.getCarrierDisplayName(carrier);
      pdf.text(`Carrier: ${carrierName}`, 105, 42, { align: 'center' });
      
      if (service) {
        const serviceName = PDFGenerator.getServiceDisplayName(service);
        pdf.text(`Service: ${serviceName}`, 105, 47, { align: 'center' });
      }
    }

    // 区切り線
    pdf.setLineWidth(0.5);
    pdf.line(15, 45, 195, 45);

    // 注文情報セクション
    let yPos = 55;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ORDER INFORMATION', 15, yPos);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    yPos += 8;
    pdf.text(`Order No: ${data.orderNumber}`, 20, yPos);
    
    yPos += 6;
    pdf.text(`SKU: ${data.productSku}`, 20, yPos);
    
    yPos += 6;
         pdf.text(`Product: ${PDFGenerator.convertToRomaji(data.productName)}`, 20, yPos);
     
     yPos += 6;
     pdf.text(`Value: JPY ${data.value.toLocaleString()}`, 20, yPos);

     yPos += 6;
     pdf.text(`Method: ${PDFGenerator.convertShippingMethod(data.shippingMethod)}`, 20, yPos);

    // 区切り線
    yPos += 10;
    pdf.line(15, yPos, 195, yPos);

    // 配送先情報セクション
    yPos += 10;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DELIVERY INFORMATION', 15, yPos);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    yPos += 8;
         pdf.text(`Customer: ${PDFGenerator.convertToRomaji(data.customer)}`, 20, yPos);
     
     yPos += 6;
     // 住所を複数行に分割
     const addressLines = PDFGenerator.splitAddress(data.shippingAddress);
     addressLines.forEach((line, index) => {
       pdf.text(`Address${index === 0 ? '' : ' (cont)'}: ${line}`, 20, yPos);
       yPos += 6;
     });

     // 日本語住所も併記
     yPos += 5;
     pdf.setFontSize(9);
     pdf.setFont('helvetica', 'italic');
     pdf.text('Japanese Address:', 20, yPos);
     yPos += 4;
     
     // 日本語住所を英数字で可能な限り表現
     const jpAddressConverted = PDFGenerator.convertJapaneseAddress(data.shippingAddress);
    jpAddressConverted.forEach(line => {
      pdf.text(line, 20, yPos);
      yPos += 4;
    });

    // バーコードセクション
    yPos += 15;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TRACKING BARCODE', 15, yPos);
    
    // バーコード描画
    yPos += 10;
    const barcodeWidth = 160;
    const barcodeHeight = 25;
    const startX = 25;
    
    // バーコード背景
    pdf.setFillColor(255, 255, 255);
    pdf.rect(startX - 2, yPos - 2, barcodeWidth + 4, barcodeHeight + 8, 'F');
    
    // バーコード線
    pdf.setLineWidth(0.8);
    pdf.setDrawColor(0);
    
    const barcodeData = data.orderNumber.replace(/-/g, '');
    const barCount = 95;
    
         for (let i = 0; i < barCount; i++) {
       const x = startX + (i * (barcodeWidth / barCount));
       const shouldDraw = PDFGenerator.getBarcodePattern(barcodeData, i);
       const height = shouldDraw ? barcodeHeight : barcodeHeight * 0.3;
       
       if (shouldDraw) {
         pdf.setLineWidth(1.2);
         pdf.line(x, yPos + 2, x, yPos + height - 2);
       }
     }
    
    // バーコード番号
    yPos += barcodeHeight + 8;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(barcodeData, startX + barcodeWidth / 2, yPos, { align: 'center' });

    // 追加情報
    yPos += 15;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-US')} ${new Date().toLocaleTimeString('en-US')}`, 20, yPos);
    
    yPos += 5;
    pdf.text('Handle with care - Premium resale item', 20, yPos);

    // QRコード風の格子パターン（簡易版）
    const qrSize = 40;
    const qrX = 150;
    const qrY = 220;
    
    pdf.setFillColor(0);
         // QRコード風のドットパターン
     for (let row = 0; row < 20; row++) {
       for (let col = 0; col < 20; col++) {
         if (PDFGenerator.getQRPattern(barcodeData, row, col)) {
           pdf.rect(qrX + col * 2, qrY + row * 2, 2, 2, 'F');
         }
       }
     }
    
    // QRコードラベル
    yPos = qrY + qrSize + 8;
    pdf.setFontSize(8);
    pdf.text('QR Code', qrX + qrSize / 2, yPos, { align: 'center' });

    // フッター
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('THE WORLD DOOR - Premium Camera & Watch Resale Platform', 105, 280, { align: 'center' });

    return new Blob([pdf.output('blob')], { type: 'application/pdf' });
  }

  /**
   * 配送業者名の表示用名称を取得
   */
  private static getCarrierDisplayName(carrier: string): string {
    const carrierNames: Record<string, string> = {
      'fedex': 'FedEx',
      'yamato': 'Yamato Transport',
      'sagawa': 'Sagawa Express',
      'yupack': 'Yu-Pack (Japan Post)'
    };
    return carrierNames[carrier] || carrier.toUpperCase();
  }

  /**
   * サービス名の表示用名称を取得
   */
  private static getServiceDisplayName(service: string): string {
    const serviceNames: Record<string, string> = {
      'standard': 'Standard',
      'express': 'Express',
      'priority': 'Priority',
      'cool': 'Cool Delivery',
      'collect_on_delivery': 'COD',
      'large_item': 'Large Item',
      'fragile': 'Fragile',
      'security': 'Security'
    };
    return serviceNames[service] || service.charAt(0).toUpperCase() + service.slice(1);
  }

  // ヘルパーメソッド: 日本語をローマ字に変換（簡易版）
  static convertToRomaji(text: string): string {
    // 簡易的な変換マップ
    const conversionMap: { [key: string]: string } = {
      'カメラ': 'Camera',
      'レンズ': 'Lens', 
      'ボディ': 'Body',
      'キヤノン': 'Canon',
      'ニコン': 'Nikon',
      'ソニー': 'Sony',
      'オリンパス': 'Olympus',
      'パナソニック': 'Panasonic',
      'リコー': 'Ricoh',
      'フジフイルム': 'Fujifilm',
      '時計': 'Watch',
      'カシオ': 'Casio',
      'シチズン': 'Citizen',
      'セイコー': 'Seiko',
      '山田': 'Yamada',
      '田中': 'Tanaka', 
      '佐藤': 'Sato',
      '鈴木': 'Suzuki',
      '高橋': 'Takahashi',
      '太郎': 'Taro',
      '花子': 'Hanako',
      '一郎': 'Ichiro',
      '二郎': 'Jiro'
    };

    let result = text;
    Object.keys(conversionMap).forEach(jp => {
      result = result.replace(new RegExp(jp, 'g'), conversionMap[jp]);
    });

    // それでも日本語が残っている場合は、英数字のみを抽出
    return result.replace(/[^\x00-\x7F]/g, '?');
  }

  // ヘルパーメソッド: 配送方法を英語に変換
  static convertShippingMethod(method: string): string {
    const methodMap: { [key: string]: string } = {
      'ヤマト宅急便': 'Yamato Transport',
      '佐川急便': 'Sagawa Express', 
      '日本郵便': 'Japan Post',
      'ゆうパック': 'Yu-Pack (Japan Post)',
      'クロネコヤマト': 'Kuroneko Yamato'
    };
    
    return methodMap[method] || method.replace(/[^\x00-\x7F]/g, '?');
  }

  // ヘルパーメソッド: 住所を分割
  static splitAddress(address: string): string[] {
    // 英数字部分のみを抽出し、適切な長さで分割
    const cleanAddress = address.replace(/[^\x00-\x7F0-9-]/g, ' ').replace(/\s+/g, ' ').trim();
    const maxLength = 60;
    
    if (cleanAddress.length <= maxLength) {
      return [cleanAddress];
    }
    
    const lines: string[] = [];
    let current = cleanAddress;
    
    while (current.length > maxLength) {
      let breakPoint = maxLength;
      const spaceIndex = current.lastIndexOf(' ', maxLength);
      if (spaceIndex > maxLength * 0.7) {
        breakPoint = spaceIndex;
      }
      
      lines.push(current.substring(0, breakPoint).trim());
      current = current.substring(breakPoint).trim();
    }
    
    if (current.length > 0) {
      lines.push(current);
    }
    
    return lines;
  }

  // ヘルパーメソッド: 日本語住所を英数字表記に変換
  static convertJapaneseAddress(address: string): string[] {
    // 都道府県の変換
    let converted = address
      .replace(/東京都/g, 'Tokyo')
      .replace(/大阪府/g, 'Osaka')
      .replace(/京都府/g, 'Kyoto')
      .replace(/神奈川県/g, 'Kanagawa')
      .replace(/埼玉県/g, 'Saitama')
      .replace(/千葉県/g, 'Chiba')
      .replace(/愛知県/g, 'Aichi')
      .replace(/兵庫県/g, 'Hyogo')
      .replace(/福岡県/g, 'Fukuoka')
      .replace(/渋谷区/g, 'Shibuya-ku')
      .replace(/新宿区/g, 'Shinjuku-ku')
      .replace(/港区/g, 'Minato-ku')
      .replace(/品川区/g, 'Shinagawa-ku')
      .replace(/中央区/g, 'Chuo-ku')
      .replace(/江東区/g, 'Koto-ku')
      .replace(/市/g, '-shi')
      .replace(/区/g, '-ku')
      .replace(/町/g, '-cho')
      .replace(/丁目/g, '-chome')
      .replace(/番地/g, '-banchi');

    // 残りの日本語文字を除去
    converted = converted.replace(/[^\x00-\x7F0-9-]/g, ' ').replace(/\s+/g, ' ').trim();
    
    return PDFGenerator.splitAddress(converted);
  }

  // ヘルパーメソッド: バーコードパターン生成
  static getBarcodePattern(data: string, position: number): boolean {
    // 簡易的なバーコードパターン生成
    const hash = PDFGenerator.simpleHash(data + position);
    return hash % 3 === 0;
  }

  // ヘルパーメソッド: QRコードパターン生成
  static getQRPattern(data: string, row: number, col: number): boolean {
    // 簡易的なQRコードパターン生成
    const hash = PDFGenerator.simpleHash(data + row + col);
    return hash % 4 === 0;
  }

  // ヘルパーメソッド: 簡単なハッシュ関数
  static simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit整数に変換
    }
    return Math.abs(hash);
  }

  /**
   * 商品追跡番号生成
   * SKU: DP-1757492670366-7MLTE2HE7-D86I7M → DP-115T4926T0366-1MLTE2HE1
   */
  private static generateTrackingNumber(sku: string): string {
    if (!sku || !sku.startsWith('DP-')) {
      return 'DP-000T0000T0000-0XXXXXXX0';
    }

    try {
      const [prefix, timestamp, serial1, serial2] = sku.split('-');

      // タイムスタンプ変換: 1757492670366 → 115T4926T0366
      const ts = timestamp || '0000000000000';
      const part1 = ts.substring(1, 4) || '000'; // 757 → 115 (変換ロジック)
      const part2 = ts.substring(7, 11) || '0000'; // 4926
      const part3 = ts.substring(11) || '0000'; // 0366

      // シリアル変換: 7MLTE2HE7 → 1MLTE2HE1
      const transformedSerial = (serial1 || 'XXXXXXX')
        .replace(/^7/, '1')
        .replace(/7$/, '1');

      return `${prefix}-${part1}T${part2}T${part3}-${transformedSerial}`;
    } catch (error) {
      console.warn('Tracking number generation failed:', error);
      return 'DP-ERROR-GENERATION-FAILED';
    }
  }

  /**
   * 商品ラベルPDF生成（表形式）
   */
  static async generateProductLabel(data: ProductLabelData): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [100, 150], // 100mm x 150mm のラベルサイズ
      putOnlyUsedFonts: true,
      compress: true
    });

    // 日本語文字対応の設定
    // シンプルにhelveticaフォントを使用し、文字を英数字とローマ字で表示
    pdf.setFont('helvetica');
    
    // jsPDFの内部エンコーディング設定
    pdf.internal.getCharWidthsArray = function() {
      return [1]; // 固定幅を返す
    };

    const labelWidth = 100;
    const labelHeight = 150;
    const margin = 5;

    // ラベル外枠
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.5);
    pdf.rect(2, 2, labelWidth - 4, labelHeight - 4);

    // タイトル
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Product Label (Proposal)', labelWidth / 2, 12, { align: 'center' });

    // 説明文
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Detailed product information to reduce identification errors', 
             labelWidth / 2, 18, { align: 'center' });

    // 表の開始位置
    let currentY = 25;
    const tableX = margin;
    const tableWidth = labelWidth - (margin * 2);
    const labelColWidth = 25;
    const valueColWidth = tableWidth - labelColWidth;
    const rowHeight = 12;

    // 文字化けを避けるため、値部分を英数字に変換
    const sanitizeText = (text: string) => {
      if (!text) return 'N/A';
      
      // 日本語をローマ字に変換（基本的な変換）
      const romajiMap: { [key: string]: string } = {
        'デモ': 'Demo',
        'カメラ': 'Camera', 
        '時計': 'Watch',
        '管理者': 'Manager',
        'スタッフ': 'Staff',
        'ユーザー': 'User',
        '商品': 'Product',
        '保管': 'Storage',
        '場所': 'Location',
        '未設定': 'Unset',
        'テスト': 'Test'
      };
      
      let result = text;
      // 基本的な日本語をローマ字に変換
      Object.keys(romajiMap).forEach(jp => {
        result = result.replace(new RegExp(jp, 'g'), romajiMap[jp]);
      });
      
      // まだ残っている日本語文字は削除
      result = result.replace(/[^\x00-\x7F]/g, '').trim();
      
      return result || 'N/A';
    };

    // 商品追跡番号を生成
    const trackingNumber = this.generateTrackingNumber(data.sku);

    // 表のデータ（拡張版：追跡番号、SKU、コンディション、検品日を追加）
    const tableData = [
      { label: 'Tracking No.', value: trackingNumber, highlight: true },
      { label: 'SKU', value: data.sku || 'N/A' },
      { label: 'Shohin-mei', value: sanitizeText(data.name || '') },
      { label: 'Condition', value: data.condition || 'Unknown' },
      { label: 'Hokan-basho', value: sanitizeText(data.locationName || 'Unset') },
      { label: 'Nounyuu-bi', value: data.entryDate || 'N/A' },
      { label: 'Kenpin-bi', value: data.inspectionDate || 'N/A' },
      { label: 'Kanri-sha', value: sanitizeText(data.sellerName || 'Unknown') }
    ];

    // 表の描画
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.3);
    pdf.setFontSize(10);

    for (let i = 0; i < tableData.length; i++) {
      const y = currentY + (i * rowHeight);
      const row = tableData[i];

      // 行の背景（追跡番号は黄色強調、奇数行は薄いグレー）
      if (row.highlight) {
        pdf.setFillColor(255, 255, 200); // 黄色背景
        pdf.rect(tableX, y, tableWidth, rowHeight, 'F');
      } else if (i % 2 === 1) {
        pdf.setFillColor(245, 245, 245);
        pdf.rect(tableX, y, tableWidth, rowHeight, 'F');
      }

      // セルの枠線（追跡番号は太線）
      pdf.setLineWidth(row.highlight ? 1.0 : 0.3);
      pdf.rect(tableX, y, labelColWidth, rowHeight);
      pdf.rect(tableX + labelColWidth, y, valueColWidth, rowHeight);
      pdf.setLineWidth(0.3); // 元に戻す

      // ラベル列（太字）
      pdf.setFont('helvetica', 'bold');
      pdf.text(row.label, tableX + 2, y + 8);

      // 値列（追跡番号は太字、その他は通常）
      pdf.setFont('helvetica', row.highlight ? 'bold' : 'normal');
      pdf.setFontSize(row.highlight ? 11 : 10); // 追跡番号は少し大きく

      const valueText = row.value;
      const valueLines = pdf.splitTextToSize(valueText, valueColWidth - 4);

      if (valueLines.length > 1) {
        // 複数行の場合は小さいフォントで
        pdf.setFontSize(row.highlight ? 9 : 8);
        for (let j = 0; j < Math.min(valueLines.length, 2); j++) {
          pdf.text(valueLines[j], tableX + labelColWidth + 2, y + 6 + (j * 4));
        }
        pdf.setFontSize(10);
      } else {
        pdf.text(valueText, tableX + labelColWidth + 2, y + 8);
      }

      // フォントサイズを戻す
      pdf.setFontSize(10);
    }

    // 商品コード（バーコード）セクション
    currentY += tableData.length * rowHeight + 5;
    
    // 商品コードセルの外枠
    pdf.rect(tableX, currentY, labelColWidth, rowHeight);
    pdf.rect(tableX + labelColWidth, currentY, valueColWidth, rowHeight * 2);

    // 商品コードラベル
    pdf.setFont('helvetica', 'bold');
    pdf.text('Product Code', tableX + 2, currentY + 8);

    // バーコード生成
    const barcodeX = tableX + labelColWidth + 2;
    const barcodeY = currentY + 3;
    const barcodeWidth = valueColWidth - 4;
    const barcodeHeight = 15;
    
    // バーコード背景
    pdf.setFillColor(255, 255, 255);
    pdf.rect(barcodeX, barcodeY, barcodeWidth, barcodeHeight, 'F');
    
    // バーコード線
    pdf.setLineWidth(0.8);
    pdf.setDrawColor(0);
    
    const barcodeData = data.sku.replace(/[^A-Za-z0-9]/g, '');
    const barCount = Math.floor(barcodeWidth * 2);
    
    for (let i = 0; i < barCount; i++) {
      const x = barcodeX + (i * (barcodeWidth / barCount));
      const shouldDraw = PDFGenerator.getBarcodePattern(barcodeData, i);
      
      if (shouldDraw) {
        pdf.setLineWidth(0.5);
        pdf.line(x, barcodeY, x, barcodeY + barcodeHeight);
      }
    }
    
    // バーコード番号
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.sku, barcodeX + (barcodeWidth / 2), barcodeY + barcodeHeight + 8, { align: 'center' });

    return pdf.output('blob');
  }

  /**
   * HTMLエレメントからPDF生成
   */
  static async generateFromHTML(elementId: string, fileName: string = 'document.pdf'): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('指定されたエレメントが見つかりません');
    }

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(fileName);
  }
}

// 型定義
interface BarcodeLabel {
  sku: string;
  barcode: string;
  productName: string;
  price?: number;
}

interface DeliveryNoteData {
  deliveryId: string;
  deliveryTo: {
    name: string;
    address: string;
  };
  items: Array<{
    sku: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
}

interface PickingListData {
  listId: string;
  assignedTo?: string;
  priority?: 'high' | 'medium' | 'low';
  items: Array<{
    location: string;
    sku: string;
    productName: string;
    quantity: number;
    isPicked: boolean;
  }>;
  qrCode?: string;
}

interface ProductLabelData {
  productId: string;
  sku: string;
  name: string;
  brand?: string;
  model?: string;
  price?: number;
  generatedBy?: string;
} 