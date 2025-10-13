/**
 * 外部サービス設定
 * 環境変数に基づいてモックサービスと実サービスを切り替え
 */

export const serviceConfig = {
  // 開発環境でモックサービスを使用するかどうか
  useMockServices: true, // 開発環境では常にモックを使用
  
  // eBay設定
  ebay: {
    apiUrl: process.env.EBAY_API_URL || '/api/ebay/mock',
    appId: process.env.EBAY_APP_ID || '',
    devId: process.env.EBAY_DEV_ID || '',
    certId: process.env.EBAY_CERT_ID || '',
  },
  
  // 配送業者設定
  shipping: {
    yamato: {
      apiUrl: process.env.YAMATO_API_URL || '/api/shipping/yamato/mock',
      apiKey: process.env.YAMATO_API_KEY || '',
    },
    sagawa: {
      apiUrl: process.env.SAGAWA_API_URL || '/api/shipping/sagawa/mock',
      apiKey: process.env.SAGAWA_API_KEY || '',
    },
  },
  
  // Stripe設定
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  
  // AWS S3設定
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'ap-northeast-1',
    bucketName: process.env.S3_BUCKET_NAME || 'twd-dev-bucket',
  },
  
  // SendGrid設定
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@theworlddoor.com',
  },
  
  // 2段階認証設定
  twoFactorAuth: {
    enabled: process.env.TWO_FACTOR_AUTH_ENABLED === 'true',
    codeExpiry: parseInt(process.env.TWO_FACTOR_CODE_EXPIRY || '300'), // デフォルト5分
  },
};

/**
 * APIエンドポイントを取得（モック/実サービス切り替え）
 */
export const getApiEndpoint = (service: string, endpoint: string): string => {
  if (serviceConfig.useMockServices) {
    return `/api/mock/${service}${endpoint}`;
  }
  
  switch (service) {
    case 'ebay':
      return `${serviceConfig.ebay.apiUrl}${endpoint}`;
    case 'yamato':
      return `${serviceConfig.shipping.yamato.apiUrl}${endpoint}`;
    case 'sagawa':
      return `${serviceConfig.shipping.sagawa.apiUrl}${endpoint}`;
    default:
      return `/api/${service}${endpoint}`;
  }
}; 