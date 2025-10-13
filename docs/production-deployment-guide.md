# 本番運用に必要な構成要素と対処方法

**最終更新日**: 2025年10月3日
**ステータス**: 📋 計画書（本番環境未構築）

## ⚠️ 重要な注意事項

このドキュメントは本番環境への移行計画書です。現在は開発環境（SQLite + モックサービス）で稼働しており、本番環境への移行は未実施です。

本番環境構築時には、このドキュメントに記載された手順に従って段階的に移行を行ってください。

## 目次
1. [概要](#概要)
2. [現状の開発環境の制限事項](#現状の開発環境の制限事項)
3. [本番環境への移行に必要な構成要素](#本番環境への移行に必要な構成要素)
4. [段階的移行計画](#段階的移行計画)
5. [詳細な対処方法](#詳細な対処方法)
6. [チェックリスト](#チェックリスト)

## 概要

本ドキュメントは、FBT-v1（The World Door）プロジェクトを開発環境から本番環境へ移行するために必要な構成要素と具体的な対処方法を詳細に記載したものです。現在の開発環境では、モックデータとローカルデータベース（SQLite）を使用しており、外部サービスとの連携もすべてモック化されています。本番運用では、これらをすべて実際のサービスに置き換える必要があります。

## 現状の開発環境の制限事項

### 1. データベース層の制限

#### 現在の構成
- **データベース**: SQLite（ファイルベース）
  - ファイルパス: `prisma/dev.db`
  - 同時接続数: 制限あり（デフォルト5接続）
  - トランザクション: 基本的なACIDサポートのみ
  - パフォーマンス: 小規模データには十分だが、大規模運用には不適

#### 制限事項
- 複数サーバーからの同時アクセス不可
- レプリケーション機能なし
- 高度なクエリ最適化機能の欠如
- バックアップ・リストアの制限
- JSON型やArray型などの高度なデータ型のサポート不足

### 2. 外部サービス連携の制限

#### eBay API
- **現状**: モックAPI（`/api/mock/ebay/*`）
- **制限事項**:
  - 固定レスポンスのみ返却
  - 実際の商品出品不可
  - 在庫同期機能なし
  - 注文情報の取得不可

#### 配送サービス（FedEx、ヤマト運輸、佐川急便）
- **現状**: すべてモックAPI
- **制限事項**:
  - 実際のラベル生成不可
  - トラッキング情報の取得不可
  - 料金計算の精度不足
  - 配送ステータスの更新なし

#### メール送信（SendGrid）
- **現状**: コンソール出力のみ
- **制限事項**:
  - 実際のメール送信不可
  - バウンス・苦情処理なし
  - 開封率・クリック率の追跡不可

#### ファイルストレージ
- **現状**: ローカルファイルシステム（`uploads/`ディレクトリ）
- **制限事項**:
  - スケーラビリティの欠如
  - CDN配信不可
  - 冗長性なし
  - アクセス制御の制限

### 3. セキュリティ関連の制限

#### 認証・認可
- **現状**:
  - 固定パスワード（`password123`）
  - 2段階認証無効
  - JWT秘密鍵が固定値（`dev-secret-key`）
- **制限事項**:
  - セキュリティリスクが高い
  - 本番環境での使用は不可

#### セッション管理
- **現状**: インメモリセッション（24時間有効）
- **制限事項**:
  - サーバー再起動でセッション消失
  - 複数サーバー間でのセッション共有不可

### 4. パフォーマンス・スケーラビリティの制限

- **キャッシュ**: なし（本番環境ではRedis使用予定）
- **レート制限**: なし
- **負荷分散**: 非対応
- **監視・ログ**: 基本的なコンソールログのみ

## 本番環境への移行に必要な構成要素

### 1. インフラストラクチャ

#### 1.1 アプリケーションサーバー
- **推奨構成**:
  - AWS EC2 / Google Compute Engine / Azure VM
  - 最小構成: 2vCPU, 4GB RAM × 2インスタンス
  - 推奨構成: 4vCPU, 8GB RAM × 3インスタンス以上
  - Auto Scaling設定

#### 1.2 ロードバランサー
- **選択肢**:
  - AWS Application Load Balancer
  - Google Cloud Load Balancer
  - Azure Load Balancer
- **設定項目**:
  - SSL終端
  - ヘルスチェック（`/api/health`）
  - セッションアフィニティ

#### 1.3 データベースサーバー
- **推奨**: PostgreSQL 14以上
- **最小構成**:
  - AWS RDS db.t3.medium
  - 100GB SSD
  - 自動バックアップ有効
- **推奨構成**:
  - AWS RDS db.m5.large
  - 500GB SSD
  - マルチAZ配置
  - リードレプリカ × 1

#### 1.4 キャッシュサーバー
- **推奨**: Redis 6.2以上
- **構成**:
  - AWS ElastiCache redis.t3.micro（最小）
  - AWS ElastiCache redis.m5.large（推奨）
  - クラスターモード有効

#### 1.5 ファイルストレージ
- **推奨**: AWS S3
- **バケット構成**:
  ```
  fbt-production/
  ├── product-images/
  ├── shipping-labels/
  ├── inspection-videos/
  ├── documents/
  └── temp/
  ```
- **設定**:
  - バージョニング有効
  - ライフサイクルポリシー設定
  - CloudFront CDN連携

### 2. 外部サービス連携

#### 2.1 eBay API統合
- **必要な認証情報**:
  ```
  EBAY_CLIENT_ID=<Production App ID>
  EBAY_CLIENT_SECRET=<Production Cert ID>
  EBAY_OAUTH_REFRESH_TOKEN=<OAuth Refresh Token>
  EBAY_ENVIRONMENT=PRODUCTION
  ```
- **APIスコープ**:
  - sell.inventory
  - sell.fulfillment
  - sell.analytics
  - sell.marketing

#### 2.2 FedEx API統合
- **必要な認証情報**:
  ```
  FEDEX_ACCOUNT_NUMBER=<アカウント番号>
  FEDEX_METER_NUMBER=<メーター番号>
  FEDEX_KEY=<認証キー>
  FEDEX_PASSWORD=<パスワード>
  FEDEX_ENVIRONMENT=production
  ```
- **必要なサービス**:
  - Ship Service
  - Track Service
  - Rate Service

#### 2.3 SendGrid（メール送信）
- **必要な設定**:
  ```
  SENDGRID_API_KEY=<APIキー>
  SENDGRID_FROM_EMAIL=noreply@yourcompany.com
  SENDGRID_FROM_NAME=The World Door
  ```
- **テンプレート設定**:
  - ウェルカムメール
  - パスワードリセット
  - 2段階認証コード
  - 注文確認
  - 配送通知

#### 2.4 AWS S3（ファイルストレージ）
- **必要な設定**:
  ```
  AWS_ACCESS_KEY_ID=<アクセスキー>
  AWS_SECRET_ACCESS_KEY=<シークレットキー>
  AWS_REGION=ap-northeast-1
  AWS_S3_BUCKET=fbt-production
  ```
- **IAMポリシー**:
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ],
        "Resource": [
          "arn:aws:s3:::fbt-production/*",
          "arn:aws:s3:::fbt-production"
        ]
      }
    ]
  }
  ```

#### 2.5 OpenAI API（AI機能）
- **必要な設定**:
  ```
  OPENAI_API_KEY=<APIキー>
  OPENAI_MODEL=gpt-4
  ```

### 3. セキュリティ設定

#### 3.1 SSL/TLS証明書
- **推奨**: Let's Encrypt（無料）またはAWS Certificate Manager
- **設定**:
  - 強制HTTPS
  - HSTS有効化
  - TLS 1.2以上

#### 3.2 環境変数管理
- **推奨ツール**:
  - AWS Secrets Manager
  - HashiCorp Vault
  - Azure Key Vault
- **管理対象**:
  - データベース接続情報
  - API認証情報
  - JWT秘密鍵
  - 暗号化キー

#### 3.3 セキュリティヘッダー
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  }
]
```

### 4. 監視・ログ管理

#### 4.1 アプリケーション監視
- **Sentry（エラー監視）**:
  ```
  SENTRY_DSN=<Sentry DSN>
  SENTRY_ENVIRONMENT=production
  ```
- **設定項目**:
  - エラー通知
  - パフォーマンス監視
  - リリース追跡

#### 4.2 インフラ監視
- **Datadog / CloudWatch / Azure Monitor**:
  - CPU/メモリ使用率
  - ディスク使用率
  - ネットワークトラフィック
  - データベース接続数
  - レスポンスタイム

#### 4.3 ログ管理
- **推奨構成**:
  ```
  アプリケーション → CloudWatch Logs → S3（長期保存）
                    ↓
                Elasticsearch（検索・分析）
  ```
- **ログレベル**: production環境では`info`以上

### 5. バックアップ・災害復旧

#### 5.1 データベースバックアップ
- **自動バックアップ**:
  - 日次フルバックアップ
  - 5分ごとのトランザクションログ
  - 30日間保持
- **手動バックアップ**:
  - リリース前後
  - 大規模データ変更前

#### 5.2 ファイルバックアップ
- **S3設定**:
  - バージョニング有効
  - クロスリージョンレプリケーション
  - Glacier移行（90日以降）

#### 5.3 災害復旧計画
- **RTO（目標復旧時間）**: 4時間
- **RPO（目標復旧時点）**: 1時間
- **復旧手順書の作成**

## 段階的移行計画

### Phase 1: 開発環境の準備（1週間）
1. 本番用環境変数の準備
2. 外部サービスアカウントの作成
3. SSL証明書の取得
4. ドメイン設定

### Phase 2: ステージング環境構築（2週間）
1. インフラ構築（最小構成）
2. データベース移行
3. 外部サービス連携テスト
4. セキュリティ設定

### Phase 3: 本番環境構築（1週間）
1. 本番インフラ構築
2. 負荷テスト
3. セキュリティ監査
4. バックアップ設定

### Phase 4: データ移行（3日間）
1. マスターデータ投入
2. 初期ユーザー作成
3. 権限設定
4. 動作確認

### Phase 5: 切り替え（1日）
1. DNSの切り替え
2. 監視開始
3. 本番稼働

## 詳細な対処方法

### 1. データベース移行手順

#### 1.1 PostgreSQL環境準備
```bash
# 1. PostgreSQLのインストール（ローカル開発用）
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# 2. データベースとユーザーの作成
sudo -u postgres psql
CREATE DATABASE fbt_production;
CREATE USER fbt_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE fbt_production TO fbt_user;
```

#### 1.2 Prismaスキーマの更新
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"  // SQLiteから変更
  url      = env("DATABASE_URL")
}

// PostgreSQL特有の機能を活用
model Product {
  id          String   @id @default(uuid()) // UUIDを使用
  data        Json     // JSON型を活用
  tags        String[] // 配列型を使用
  // ...
}
```

#### 1.3 データ移行スクリプト
```typescript
// scripts/migrate-to-postgres.ts
import { PrismaClient as SqliteClient } from '@prisma/client'
import { PrismaClient as PostgresClient } from './generated/postgres-client'

async function migrateData() {
  const sqlite = new SqliteClient({
    datasources: { db: { url: 'file:./dev.db' } }
  })
  
  const postgres = new PostgresClient({
    datasources: { db: { url: process.env.DATABASE_URL } }
  })

  // トランザクションで移行
  await postgres.$transaction(async (tx) => {
    // Users
    const users = await sqlite.user.findMany()
    await tx.user.createMany({ data: users })
    
    // Products
    const products = await sqlite.product.findMany()
    await tx.product.createMany({ data: products })
    
    // ... 他のテーブルも同様に
  })
}
```

### 2. APIルートの本番対応

#### 2.1 環境による分岐の実装
```typescript
// lib/config/index.ts
export function getConfig() {
  const env = process.env.NODE_ENV || 'development'
  
  if (env === 'production') {
    return productionConfig
  }
  
  return developmentConfig
}

// API routeでの使用例
// app/api/products/route.ts
import { getConfig } from '@/lib/config'

export async function GET() {
  const config = getConfig()
  
  if (config.dataSource === 'prisma') {
    try {
      const products = await prisma.product.findMany()
      return NextResponse.json(products)
    } catch (error) {
      // 本番環境ではエラーをSentryに送信
      captureException(error)
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      )
    }
  }
  
  // 開発環境のみモックデータ
  return NextResponse.json(mockProducts)
}
```

#### 2.2 外部サービスアダプターの本番対応
```typescript
// lib/services/adapters/ebay.adapter.ts
export class EbayAdapter {
  private client: any
  
  constructor() {
    const config = getConfig()
    
    if (config.ebay.useMock) {
      this.client = new MockEbayClient()
    } else {
      this.client = new EbayClient({
        clientId: process.env.EBAY_CLIENT_ID,
        clientSecret: process.env.EBAY_CLIENT_SECRET,
        refreshToken: process.env.EBAY_OAUTH_REFRESH_TOKEN,
        environment: process.env.EBAY_ENVIRONMENT
      })
    }
  }
  
  async createListing(product: Product) {
    try {
      const listing = await this.client.inventory.createOrReplaceInventoryItem({
        sku: product.sku,
        product: {
          title: product.title,
          description: product.description,
          imageUrls: product.images,
          aspects: this.mapProductAspects(product)
        },
        condition: product.condition,
        availability: {
          shipToLocationAvailability: {
            quantity: product.quantity
          }
        }
      })
      
      return listing
    } catch (error) {
      // エラーハンドリング
      throw new EbayApiError('Failed to create listing', error)
    }
  }
}
```

### 3. セキュリティ強化の実装

#### 3.1 JWT認証の強化
```typescript
// lib/auth.ts
import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'

// 本番環境では環境変数から取得
const JWT_SECRET = process.env.JWT_SECRET || generateSecureKey()

function generateSecureKey() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production')
  }
  return randomBytes(64).toString('hex')
}

export async function createToken(userId: string) {
  const config = getConfig()
  
  return jwt.sign(
    { 
      userId,
      iat: Date.now(),
      exp: Date.now() + config.security.sessionExpiry
    },
    JWT_SECRET,
    { algorithm: 'HS512' }
  )
}
```

#### 3.2 2段階認証の実装
```typescript
// lib/services/two-factor-auth.service.ts
import { authenticator } from 'otplib'
import QRCode from 'qrcode'

export class TwoFactorAuthService {
  async generateSecret(user: User) {
    const secret = authenticator.generateSecret()
    const otpauth = authenticator.keyuri(
      user.email,
      'The World Door',
      secret
    )
    
    const qrCode = await QRCode.toDataURL(otpauth)
    
    return { secret, qrCode }
  }
  
  async verifyToken(secret: string, token: string) {
    return authenticator.verify({
      token,
      secret
    })
  }
}
```

#### 3.3 レート制限の実装
```typescript
// middleware/rate-limit.ts
import { Redis } from 'ioredis'
import { NextRequest, NextResponse } from 'next/server'

const redis = new Redis(process.env.REDIS_URL)

export async function rateLimit(req: NextRequest) {
  const ip = req.ip || req.headers.get('x-forwarded-for')
  const key = `rate-limit:${ip}`
  
  const current = await redis.incr(key)
  
  if (current === 1) {
    await redis.expire(key, 900) // 15分
  }
  
  if (current > 100) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }
  
  return NextResponse.next()
}
```

### 4. 監視・ログ設定

#### 4.1 Sentry設定
```typescript
// app/layout.tsx
import * as Sentry from '@sentry/nextjs'

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT,
    tracesSampleRate: 0.1,
    beforeSend(event) {
      // 機密情報のフィルタリング
      if (event.request?.cookies) {
        delete event.request.cookies
      }
      return event
    }
  })
}
```

#### 4.2 構造化ログの実装
```typescript
// lib/logger.ts
import winston from 'winston'
import { CloudWatchTransport } from 'winston-cloudwatch'

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'fbt-api',
    environment: process.env.NODE_ENV
  },
  transports: [
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'info'
    })
  ]
})

if (process.env.NODE_ENV === 'production') {
  logger.add(new CloudWatchTransport({
    logGroupName: '/aws/elasticbeanstalk/fbt-production',
    logStreamName: process.env.HOSTNAME || 'default',
    awsRegion: process.env.AWS_REGION
  }))
}

export { logger }
```

### 5. デプロイメント設定

#### 5.1 Docker設定
```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### 5.2 CI/CDパイプライン（GitHub Actions）
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test
      - run: npm run e2e:headless

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: fbt-production
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
      
      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster fbt-production \
            --service fbt-api \
            --force-new-deployment
```

### 6. 本番環境のnext.config.js
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  images: {
    domains: [
      'fbt-production.s3.amazonaws.com',
      'i.ebayimg.com'
    ],
  },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.API_URL || 'http://localhost:3000/api/:path*',
      },
    ]
  },
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NODE_ENV,
  },
  
  experimental: {
    instrumentationHook: true,
  },
  
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client')
    }
    return config
  },
}

module.exports = nextConfig
```

## チェックリスト

### 事前準備
- [ ] 本番用ドメインの取得
- [ ] SSL証明書の取得
- [ ] AWSアカウントの作成
- [ ] 各種外部サービスアカウントの作成

### インフラ構築
- [ ] VPCとサブネットの構成
- [ ] セキュリティグループの設定
- [ ] EC2インスタンスの起動
- [ ] RDS（PostgreSQL）の構築
- [ ] ElastiCache（Redis）の構築
- [ ] S3バケットの作成
- [ ] CloudFrontの設定
- [ ] Route 53のDNS設定

### アプリケーション設定
- [ ] 環境変数の設定（Secrets Manager）
- [ ] データベースマイグレーション
- [ ] 初期データの投入
- [ ] 管理者アカウントの作成

### 外部サービス連携
- [ ] eBay API認証設定
- [ ] FedEx API認証設定
- [ ] SendGrid設定とテンプレート作成
- [ ] OpenAI API設定

### セキュリティ
- [ ] JWT秘密鍵の生成と設定
- [ ] 2段階認証の有効化
- [ ] レート制限の設定
- [ ] セキュリティヘッダーの確認
- [ ] CORS設定の確認

### 監視・運用
- [ ] Sentryの設定
- [ ] CloudWatchアラームの設定
- [ ] バックアップ設定の確認
- [ ] ログローテーション設定

### テスト
- [ ] ステージング環境での総合テスト
- [ ] 負荷テストの実施
- [ ] セキュリティ監査
- [ ] 災害復旧テスト

### 本番切り替え
- [ ] DNSの切り替え
- [ ] 監視の開始
- [ ] 初期動作確認
- [ ] パフォーマンス確認

### 事後作業
- [ ] 開発環境の無効化
- [ ] ドキュメントの更新
- [ ] 運用手順書の作成
- [ ] 引き継ぎ

## まとめ

本ドキュメントに記載された手順に従って段階的に移行を進めることで、開発環境から本番環境への安全な移行が可能です。特に重要なのは：

1. **データベースの移行**: SQLiteからPostgreSQLへの移行は慎重に行う
2. **外部サービス連携**: 各サービスのAPI認証情報を事前に準備
3. **セキュリティ**: 本番環境では必ず強固なセキュリティ設定を行う
4. **監視体制**: 問題を早期発見できる監視体制を構築
5. **バックアップ**: データ損失に備えた確実なバックアップ体制

移行作業は計画的に進め、各フェーズでの確認を怠らないことが成功の鍵となります。