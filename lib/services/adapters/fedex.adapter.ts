interface FedExConfig {
  apiKey: string;
  secretKey: string;
  accountNumber: string;
  meterNumber: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
}

interface FedExAddress {
  streetLines: string[];
  city: string;
  stateOrProvinceCode: string;
  postalCode: string;
  countryCode: string;
  residential?: boolean;
}

interface FedExShipmentRequest {
  accountNumber: string;
  serviceType: string;
  packagingType: string;
  shipper: {
    contact: {
      personName: string;
      emailAddress: string;
      phoneNumber: string;
    };
    address: FedExAddress;
  };
  recipients: Array<{
    contact: {
      personName: string;
      emailAddress?: string;
      phoneNumber?: string;
    };
    address: FedExAddress;
  }>;
  pickupType: string;
  rateRequestType: string[];
  shipmentSpecialServices?: {
    specialServiceTypes: string[];
  };
  requestedPackageLineItems: Array<{
    sequenceNumber: number;
    groupNumber: number;
    groupPackageCount: number;
    variableHandlingChargeDetail?: {
      rateType: string;
      percentValue: number;
      rateLevelType: string;
      fixedValue: {
        amount: number;
        currency: string;
      };
    };
    insuredValue: {
      amount: number;
      currency: string;
    };
    weight: {
      units: string;
      value: number;
    };
    dimensions: {
      length: number;
      width: number;
      height: number;
      units: string;
    };
  }>;
  labelSpecification: {
    imageType: string;
    labelStockType: string;
    labelPrintingOrientation: string;
    labelOrder: string;
  };
}

interface FedExShipmentResponse {
  transactionId: string;
  output?: {
    transactionShipments: Array<{
      serviceType: string;
      shipmentDocuments: Array<{
        contentKey: string;
        copiesToPrint: number;
        contentType: string;
        trackingNumber: string;
        docType: string;
        alerts: any[];
        encodedLabel: string; // Base64エンコードされたラベル
      }>;
      completedShipmentDetail: {
        usDomestic: boolean;
        carrierCode: string;
        masterId: string;
        serviceDescription: {
          serviceId: string;
          serviceType: string;
          code: string;
          names: Array<{
            type: string;
            encoding: string;
            value: string;
          }>;
          serviceCategory: string;
          description: string;
          astraDescription: string;
        };
        packagingDescription: string;
        operationalDetail: {
          originLocationIds: string[];
          commitDays: string[];
          serviceCode: string;
          airportId: string;
          scac: string;
        };
        trackingIds: Array<{
          trackingIdType: string;
          formId: string;
          trackingNumber: string;
        }>;
        dateAndTimeDetails: Array<{
          type: string;
          dateTime: string;
        }>;
        accessDetail: {
          accessorDetails: Array<{
            role: string;
            userId: string;
          }>;
        };
        completedPackageDetails: Array<{
          sequenceNumber: number;
          trackingIds: Array<{
            trackingIdType: string;
            trackingNumber: string;
          }>;
          groupNumber: number;
          packageRating: {
            effectiveNetDiscount: {
              amount: number;
              currency: string;
            };
            actualRateType: string;
            packageRateDetails: Array<{
              rateType: string;
              ratedWeightMethod: string;
              baseCharge: {
                amount: number;
                currency: string;
              };
              netFreight: {
                amount: number;
                currency: string;
              };
              totalSurcharges: {
                amount: number;
                currency: string;
              };
              netFedExCharge: {
                amount: number;
                currency: string;
              };
              totalTaxes: {
                amount: number;
                currency: string;
              };
              netCharge: {
                amount: number;
                currency: string;
              };
              totalRebates: {
                amount: number;
                currency: string;
              };
              billingWeight: {
                units: string;
                value: number;
              };
              totalBase: {
                amount: number;
                currency: string;
              };
              freightDiscounts: Array<{
                amount: {
                  amount: number;
                  currency: string;
                };
                name: string;
                description: string;
                type: string;
              }>;
              surCharges: any[];
            }>;
          };
          operationalDetail: {
            barcodes: {
              binaryBarcodes: Array<{
                type: string;
                value: string;
              }>;
              stringBarcodes: Array<{
                type: string;
                value: string;
              }>;
            };
            astraHandlingText: string;
            operationalInstructions: Array<{
              number: number;
              content: string;
            }>;
          };
          signatureOption: string;
          hazardousPackageDetail: {
            regulation: string;
            accessibility: string;
            cargoAircraftOnly: boolean;
            options: string[];
            packageInformation: string;
          };
        }>;
        exportComplianceStatement: string;
        shipmentRating: {
          actualRateType: string;
          effectiveNetDiscount: {
            amount: number;
            currency: string;
          };
          shipmentRateDetails: Array<{
            rateType: string;
            rateScale: string;
            rateZone: string;
            pricingCode: string;
            ratedWeightMethod: string;
            currency: string;
            dimDivisor: number;
            fuelSurchargePercent: number;
            totalBillingWeight: {
              units: string;
              value: number;
            };
            totalBaseCharge: {
              amount: number;
              currency: string;
            };
            totalFreightDiscounts: {
              amount: number;
              currency: string;
            };
            totalNetFreight: {
              amount: number;
              currency: string;
            };
            totalSurcharges: {
              amount: number;
              currency: string;
            };
            totalNetFedExCharge: {
              amount: number;
              currency: string;
            };
            totalTaxes: {
              amount: number;
              currency: string;
            };
            totalNetCharge: {
              amount: number;
              currency: string;
            };
            totalRebates: {
              amount: number;
              currency: string;
            };
            totalDutiesAndTaxes: {
              amount: number;
              currency: string;
            };
            totalAncillaryFeesAndTaxes: {
              amount: number;
              currency: string;
            };
            totalDutiesTaxesAndFees: {
              amount: number;
              currency: string;
            };
            totalNetChargeWithDutiesAndTaxes: {
              amount: number;
              currency: string;
            };
            shipmentLegRateDetails: any[];
            freightDiscounts: any[];
            surCharges: any[];
          }>;
        };
      };
      alerts?: Array<{
        code: string;
        alertType: string;
        message: string;
      }>;
    }>;
  };
  errors?: Array<{
    code: string;
    message: string;
  }>;
}

export class FedExAdapter {
  private config: FedExConfig;
  private authToken?: string;
  private tokenExpiry?: Date;

  constructor() {
    this.config = {
      apiKey: process.env.FEDEX_API_KEY || '',
      secretKey: process.env.FEDEX_SECRET_KEY || '',
      accountNumber: process.env.FEDEX_ACCOUNT_NUMBER || '',
      meterNumber: process.env.FEDEX_METER_NUMBER || '',
      baseUrl: process.env.FEDEX_BASE_URL || 'https://apis-sandbox.fedex.com',
      environment: (process.env.FEDEX_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    };
  }

  /**
   * FedEx APIの認証トークンを取得
   */
  private async authenticate(): Promise<string> {
    // トークンが有効な場合は再利用
    if (this.authToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.authToken;
    }

    const authUrl = `${this.config.baseUrl}/oauth/token`;
    
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.apiKey,
        client_secret: this.config.secretKey
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FedEx認証エラー: ${response.status} - ${errorText}`);
    }

    const authResult = await response.json();
    this.authToken = authResult.access_token;
    // トークンの有効期限を設定（通常1時間）
    this.tokenExpiry = new Date();
    this.tokenExpiry.setSeconds(this.tokenExpiry.getSeconds() + authResult.expires_in - 60); // 1分のマージンを設ける

    return this.authToken || '';
  }

  /**
   * 商品情報からFedEx配送ラベルを生成
   */
  async generateShippingLabel(item: any, service: string = 'standard'): Promise<{
    trackingNumber: string;
    labelData: string; // Base64エンコードされたPDFデータ
    cost: number;
    currency: string;
    estimatedDelivery?: string;
  }> {
    try {
      const token = await this.authenticate();

      // サービスタイプのマッピング
      const serviceTypeMap: Record<string, string> = {
        standard: 'FEDEX_GROUND',
        express: 'FEDEX_EXPRESS_SAVER',
        priority: 'PRIORITY_OVERNIGHT'
      };

      // 配送先住所の解析
      const shippingAddress = this.parseAddress(item.shippingAddress);
      
      const shipmentRequest: FedExShipmentRequest = {
        accountNumber: this.config.accountNumber,
        serviceType: serviceTypeMap[service] || 'FEDEX_GROUND',
        packagingType: 'YOUR_PACKAGING',
        shipper: {
          contact: {
            personName: 'THE WORLD DOOR',
            emailAddress: 'shipping@theworlddoor.com',
            phoneNumber: '+81-3-1234-5678'
          },
          address: {
            streetLines: ['東京都渋谷区神南1-1-1'],
            city: '渋谷区',
            stateOrProvinceCode: '13', // Tokyo
            postalCode: '150-0041',
            countryCode: 'JP',
            residential: false
          }
        },
                 recipients: [{
           contact: {
             personName: item.customer || 'Customer',
             emailAddress: item.customerEmail || undefined,
             phoneNumber: item.customerPhone || undefined
           },
                     address: {
             streetLines: [shippingAddress.street],
             city: shippingAddress.city,
             stateOrProvinceCode: shippingAddress.state,
             postalCode: shippingAddress.postalCode || '',
             countryCode: shippingAddress.countryCode || 'JP',
             residential: true
           }
        }],
        pickupType: 'USE_SCHEDULED_PICKUP',
        rateRequestType: ['ACCOUNT', 'LIST'],
        requestedPackageLineItems: [{
          sequenceNumber: 1,
          groupNumber: 1,
          groupPackageCount: 1,
          insuredValue: {
            amount: item.value || 10000,
            currency: 'JPY'
          },
          weight: {
            units: 'KG',
            value: this.estimateWeight(item)
          },
          dimensions: {
            length: 25,
            width: 20,
            height: 10,
            units: 'CM'
          }
        }],
        labelSpecification: {
          imageType: 'PDF',
          labelStockType: 'PAPER_4X6',
          labelPrintingOrientation: 'TOP_EDGE_OF_TEXT_FIRST',
          labelOrder: 'SHIPPING_LABEL_FIRST'
        }
      };

      const response = await fetch(`${this.config.baseUrl}/ship/v1/shipments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-locale': 'ja_JP'
        },
        body: JSON.stringify(shipmentRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`FedEx配送ラベル生成エラー: ${response.status} - ${errorText}`);
      }

      const result: FedExShipmentResponse = await response.json();

      if (result.errors?.length) {
        throw new Error(`FedEx APIエラー: ${result.errors.map(e => e.message).join(', ')}`);
      }

      const shipment = result.output?.transactionShipments?.[0];
      if (!shipment) {
        throw new Error('配送ラベルの生成に失敗しました');
      }

      const document = shipment.shipmentDocuments?.[0];
      const trackingId = shipment.completedShipmentDetail?.trackingIds?.[0];
      const rateDetail = shipment.completedShipmentDetail?.shipmentRating?.shipmentRateDetails?.[0];

      return {
        trackingNumber: trackingId?.trackingNumber || '',
        labelData: document?.encodedLabel || '',
        cost: rateDetail?.totalNetCharge?.amount || 0,
        currency: rateDetail?.totalNetCharge?.currency || 'JPY',
        estimatedDelivery: this.calculateEstimatedDelivery(service)
      };

    } catch (error) {
      console.error('FedEx配送ラベル生成エラー:', error);
      throw error;
    }
  }

  /**
   * 住所文字列を解析してFedExAddress形式に変換
   */
  private parseAddress(addressString: string): {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
  } {
    // 簡易的な住所解析（実際の実装では住所パーサーライブラリを使用することを推奨）
    const lines = addressString.split('\n').filter(line => line.trim());
    
    return {
      street: lines[0] || '',
      city: lines[1] || '',
      state: '13', // デフォルトで東京都
      postalCode: this.extractPostalCode(addressString) || '',
      countryCode: 'JP'
    };
  }

  /**
   * 郵便番号を抽出
   */
  private extractPostalCode(address: string): string | null {
    const postalCodeRegex = /〒?(\d{3}-?\d{4})/;
    const match = address.match(postalCodeRegex);
    return match ? match[1].replace('-', '') : null;
  }

  /**
   * 商品タイプから推定重量を算出
   */
  private estimateWeight(item: any): number {
    // 商品カテゴリに基づく重量推定
    const categoryWeights: Record<string, number> = {
      'camera': 1.5,
      'lens': 0.8,
      'watch': 0.3,
      'electronics': 1.0,
      'default': 0.5
    };

    const category = item.category?.toLowerCase() || 'default';
    return categoryWeights[category] || categoryWeights.default;
  }

  /**
   * サービスタイプから配送予定日を計算
   */
  private calculateEstimatedDelivery(service: string): string {
    const now = new Date();
    let deliveryDays: number;

    switch (service) {
      case 'priority':
        deliveryDays = 1;
        break;
      case 'express':
        deliveryDays = 2;
        break;
      case 'standard':
      default:
        deliveryDays = 3;
        break;
    }

    const deliveryDate = new Date(now);
    deliveryDate.setDate(now.getDate() + deliveryDays);
    
    return deliveryDate.toISOString().split('T')[0]; // YYYY-MM-DD形式
  }

  /**
   * 追跡情報を取得
   */
  async trackShipment(trackingNumber: string): Promise<any> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${this.config.baseUrl}/track/v1/trackingnumbers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-locale': 'ja_JP'
        },
        body: JSON.stringify({
          includeDetailedScans: true,
          trackingInfo: [{
            trackingNumberInfo: {
              trackingNumber: trackingNumber
            }
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`追跡情報取得エラー: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('FedEx追跡エラー:', error);
      throw error;
    }
  }
} 