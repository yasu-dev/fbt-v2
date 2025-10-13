import { serviceConfig, getApiEndpoint } from '../config';

export interface EbayListingData {
  title: string;
  description: string;
  price: number;
  currency: string;
  categoryId: string;
  condition: string;
  images: string[];
  duration: number; // 出品期間（日数）
  shippingOptions: any[];
}

export interface EbayListingResponse {
  success: boolean;
  listingId?: string;
  url?: string;
  error?: string;
}

/**
 * eBay APIアダプター
 * モック環境と本番環境を透過的に切り替え
 */
export class EbayAdapter {
  private headers: HeadersInit;
  
  constructor() {
    this.headers = {
      'Content-Type': 'application/json',
    };
    
    // 本番環境の場合はeBay認証ヘッダーを追加
    if (!serviceConfig.useMockServices && serviceConfig.ebay.appId) {
      this.headers = {
        ...this.headers,
        'X-EBAY-APP-ID': serviceConfig.ebay.appId,
        'X-EBAY-DEV-ID': serviceConfig.ebay.devId,
        'X-EBAY-CERT-ID': serviceConfig.ebay.certId,
      };
    }
  }
  
  /**
   * 商品を出品
   */
  async createListing(data: EbayListingData): Promise<EbayListingResponse> {
    try {
      const endpoint = getApiEndpoint('ebay', '/listing');
      console.log('🔍 eBay Adapter - Using endpoint:', endpoint);
      console.log('🔍 eBay Adapter - useMockServices:', serviceConfig.useMockServices);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create listing: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('eBay listing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * 出品を更新
   */
  async updateListing(listingId: string, data: Partial<EbayListingData>): Promise<EbayListingResponse> {
    try {
      const endpoint = getApiEndpoint('ebay', `/listing/${listingId}`);
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update listing: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('eBay update error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * 出品を終了
   */
  async endListing(listingId: string): Promise<EbayListingResponse> {
    try {
      const endpoint = getApiEndpoint('ebay', `/listing/${listingId}/end`);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to end listing: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('eBay end listing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * 出品ステータスを取得
   */
  async getListingStatus(listingId: string): Promise<any> {
    try {
      const endpoint = getApiEndpoint('ebay', `/listing/${listingId}/status`);
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: this.headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get listing status: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('eBay status error:', error);
      return null;
    }
  }
}

// シングルトンインスタンス
export const ebayAdapter = new EbayAdapter(); 