/**
 * 配送業者の追跡URL生成ユーティリティ
 */

export interface CarrierInfo {
  id: string;
  name: string;
  trackingUrl: string;
  trackingUrlTemplate: string;
}

// 配送業者の追跡URL設定
export const CARRIERS: Record<string, CarrierInfo> = {
  fedex: {
    id: 'fedex', 
    name: 'FedEx',
    trackingUrl: 'https://www.fedex.com/apps/fedextrack/',
    trackingUrlTemplate: 'https://www.fedex.com/apps/fedextrack/?tracknumbers={trackingNumber}'
  },
  yamato: {
    id: 'yamato',
    name: 'ヤマト運輸',
    trackingUrl: 'https://toi.kuronekoyamato.co.jp/cgi-bin/tneko',
    trackingUrlTemplate: 'https://toi.kuronekoyamato.co.jp/cgi-bin/tneko?number01={trackingNumber}'
  },
  sagawa: {
    id: 'sagawa',
    name: '佐川急便',
    trackingUrl: 'https://k2k.sagawa-exp.co.jp/p/sagawa/web/okurijoinput.jsp',
    trackingUrlTemplate: 'https://k2k.sagawa-exp.co.jp/p/sagawa/web/okurijoinput.jsp?okurijoNo={trackingNumber}'
  },
  yupack: {
    id: 'yupack',
    name: 'ゆうパック',
    trackingUrl: 'https://trackings.post.japanpost.jp/services/srv/search/',
    trackingUrlTemplate: 'https://trackings.post.japanpost.jp/services/srv/search/?requestNo1={trackingNumber}'
  },
  japanpost: {
    id: 'japanpost',
    name: '日本郵便',
    trackingUrl: 'https://trackings.post.japanpost.jp/services/srv/search/',
    trackingUrlTemplate: 'https://trackings.post.japanpost.jp/services/srv/search/?requestNo1={trackingNumber}'
  }
};

/**
 * 配送業者IDから追跡URLを生成
 */
export function generateTrackingUrl(carrierId: string, trackingNumber: string): string {
  if (!trackingNumber) {
    return '#';
  }

  // キャリアIDを正規化（小文字化、スペース除去）
  const normalizedCarrierId = carrierId.toLowerCase().replace(/\s+/g, '');
  
  // 配送業者名からIDを推測
  let carrierInfo = CARRIERS[normalizedCarrierId];
  
  if (!carrierInfo) {
    // 配送業者名に基づく推測
    if (normalizedCarrierId.includes('fedx') || normalizedCarrierId.includes('fedex')) {
      carrierInfo = CARRIERS.fedex;
    } else if (normalizedCarrierId.includes('yamato') || normalizedCarrierId.includes('クロネコ')) {
      carrierInfo = CARRIERS.yamato;
    } else if (normalizedCarrierId.includes('sagawa') || normalizedCarrierId.includes('佐川')) {
      carrierInfo = CARRIERS.sagawa;
    } else if (normalizedCarrierId.includes('yupack') || normalizedCarrierId.includes('ゆうパック') || normalizedCarrierId.includes('郵便')) {
      carrierInfo = CARRIERS.yupack;
    }
  }

  if (!carrierInfo) {
    // デフォルトでGoogle検索
    return `https://www.google.com/search?q=${encodeURIComponent(`${carrierId} 追跡番号 ${trackingNumber}`)}`;
  }

  return carrierInfo.trackingUrlTemplate.replace('{trackingNumber}', encodeURIComponent(trackingNumber));
}

/**
 * 配送業者名を正規化
 */
export function normalizeCarrierName(carrierId: string): string {
  const normalizedId = carrierId.toLowerCase().replace(/\s+/g, '');
  const carrier = CARRIERS[normalizedId];
  return carrier ? carrier.name : carrierId;
}

/**
 * 追跡番号が有効かチェック
 */
export function isValidTrackingNumber(trackingNumber: string, carrierId?: string): boolean {
  if (!trackingNumber || trackingNumber.trim().length === 0) {
    return false;
  }

  const normalizedNumber = trackingNumber.trim();
  
  // 基本的な長さチェック（最小3文字、最大50文字）
  if (normalizedNumber.length < 3 || normalizedNumber.length > 50) {
    return false;
  }

  // 配送業者別のバリデーション
  if (carrierId) {
    const normalizedCarrierId = carrierId.toLowerCase();
    
    switch (normalizedCarrierId) {
      case 'fedex':
        // FedExは通常10-14桁の英数字
        return /^[0-9A-Z]{8,20}$/i.test(normalizedNumber);
      
      case 'yamato':
        // ヤマト運輸は12桁の数字（ハイフンあり・なし両方対応）
        return /^[0-9]{4}-?[0-9]{4}-?[0-9]{4}$/.test(normalizedNumber);
      
      case 'sagawa':
        // 佐川急便は12桁の数字
        return /^[0-9]{12}$/.test(normalizedNumber.replace(/-/g, ''));
      
      case 'yupack':
      case 'japanpost':
        // 郵便は12桁または13桁の数字とアルファベット組み合わせ
        return /^[0-9A-Z]{12,13}$/i.test(normalizedNumber);
      
      default:
        // その他の場合は英数字とハイフンを許可
        return /^[0-9A-Z\-]{3,50}$/i.test(normalizedNumber);
    }
  }

  // キャリアIDが不明な場合は英数字とハイフンの組み合わせをチェック
  return /^[0-9A-Z\-]{3,50}$/i.test(normalizedNumber);
}

/**
 * 追跡番号をフォーマット（表示用）
 */
export function formatTrackingNumber(trackingNumber: string, carrierId?: string): string {
  if (!trackingNumber) return '';
  
  const normalizedNumber = trackingNumber.trim().toUpperCase();
  
  if (carrierId) {
    const normalizedCarrierId = carrierId.toLowerCase();
    
    switch (normalizedCarrierId) {
      case 'yamato':
        // ヤマト運輸は4-4-4のハイフン区切りでフォーマット
        if (normalizedNumber.length === 12 && /^[0-9]{12}$/.test(normalizedNumber)) {
          return `${normalizedNumber.slice(0, 4)}-${normalizedNumber.slice(4, 8)}-${normalizedNumber.slice(8, 12)}`;
        }
        break;
      
      case 'sagawa':
        // 佐川急便も4-4-4のハイフン区切り
        if (normalizedNumber.length === 12 && /^[0-9]{12}$/.test(normalizedNumber)) {
          return `${normalizedNumber.slice(0, 4)}-${normalizedNumber.slice(4, 8)}-${normalizedNumber.slice(8, 12)}`;
        }
        break;
    }
  }
  
  return normalizedNumber;
}

