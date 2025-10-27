# 「Fulfillment by THE WORLD DOOR」AWS移行戦略

**作成日**: 2025年10月23日

---

### 核心的判断

1. **Amplify Hosting は本プロジェクトに不適合** （規模・要件を考慮した選定）
2. **ECS Fargate が最適解** （柔軟性・拡張性・コストのバランス）
3. **RDS Proxy は必須、Redis は不要** （フェーズ1ではSocket.io未実装のため）

---

## 🔍 第1章: 現状分析（事実ベース）

### 1.1 技術構成の実態

```
フレームワーク: Next.js 14.2.5 (App Router)
API エンドポイント: 107本 (Next.js API Routes)
データベース: Prisma 5.7.0 (36モデル)
リアルタイム通信: Socket.io 4.7.5
画像処理: Sharp 0.34.4, Jimp 1.6.0
PDF生成: jsPDF 3.0.1, PDFKit 0.17.1, pdfmake 0.2.20
動画処理: fluent-ffmpeg 2.1.3, Puppeteer 24.12.0
```

**重要な発見（コードレビューより）:**

1. **app/api/** 配下に107本のAPIルートが存在
2. 各APIで `new PrismaClient()` を個別生成（接続数爆発のリスク）
3. Socket.io依存関係は存在するが未実装（フェーズ1ではポーリング方式採用）
4. Sharp/Puppeteer による重い画像・PDF処理が多数
5. 状態監視はポーリング方式で実装予定（30秒間隔）

### 1.2 ビジネス要件の実態

```
商品フロー: 入荷→検品→保管→出品→受注→ピッキング→梱包→発送→配送→返品
ユーザー種別: セラー（資産管理視点） / スタッフ（タスク駆動型）
データ規模: 商品1万点、DAU 100人想定
重要機能: 状態監視（ポーリング方式、30秒間隔）、リアルタイム通知はフェーズ2以降
データ種別: 商品画像（大量）、PDF帳票、動画記録、検品履歴
```

---

## 🏗️ 第2章: アーキテクチャ選定の論理的根拠

### 2.1 なぜ Amplify Hosting は不可能なのか

**Amplifyの設計思想:**
- 静的サイトホスティング + 軽量SSR
- JAMstack アーキテクチャ向け
- シンプルなNext.js アプリケーション

**fbt-v2の実態との乖離:**

| 要件 | fbt-v2の実装 | Amplifyの制約 | 結論 |
|-----|------------|--------------|------|
| **APIエンドポイント** | 107本（複雑なビジネスロジック） | 軽量なAPI Routesを想定 | ⚠️ 多いが対応可能 |
| **WebSocket** | フェーズ1不要（将来実装可能性） | WebSocket対応が限定的 | ⚠️ 制約あり |
| **重処理** | Sharp/Puppeteer（CPU/メモリ集約） | 軽量処理を想定 | ❌ 不適合 |
| **カスタムサーバー** | フェーズ1不要 | カスタムサーバー未対応 | ✅ 問題なし |
| **ビルドサイズ** | 依存関係が重い（画像/PDF/動画） | 制限あり | ⚠️ 要検証 |

**技術的詳細:**

```typescript
// fbt-v2の実装 (Socket.ioサーバー起動が必要)
import { Server } from 'socket.io'
import { createServer } from 'http'

const httpServer = createServer(app)
const io = new Server(httpServer)

io.on('connection', (socket) => {
  // WebSocket接続処理
})

httpServer.listen(3000)
```

Amplifyは軽量なNext.jsアプリを想定しており、本プロジェクトの重処理（Sharp/Puppeteer）には不向きです。

**結論: Amplifyは本プロジェクトの規模・要件に不適合（技術的には可能だが推奨しない）**

---

### 2.2 なぜ ECS Fargate が最適解なのか

**ECS Fargateの特性:**
- フルコントロール可能なコンテナ実行環境
- カスタムサーバー起動可能
- CPU/メモリのリソース調整が柔軟
- WebSocket対応（ALB経由）
- Docker による完全な環境制御

**fbt-v2との適合性:**

| 要件 | ECS Fargateの対応 | 評価 |
|-----|------------------|------|
| **107本API** | フル対応（制限なし） | ✅ 完全適合 |
| **将来拡張性** | Socket.io追加も容易 | ✅ 完全適合 |
| **重処理** | CPU/メモリ調整可能 | ✅ 完全適合 |
| **スケーリング** | オートスケール対応 | ✅ 完全適合 |
| **監視** | CloudWatch完全統合 | ✅ 完全適合 |

**技術的実装:**

```dockerfile
# Dockerfileで完全制御
FROM node:20-alpine

# 全依存関係インストール
COPY package.json ./
RUN npm ci

# アプリケーション起動
CMD ["node", "server.js"]
```

**結論: ECS Fargateは技術的に唯一の現実的選択肢**

---

### 2.3 App Runner を採用しない理由

**App Runnerの特性:**
- コンテナベースのフルマネージドサービス
- ECSより運用が簡単
- オートスケール対応

**App Runnerとの比較:**

| 項目 | ECS Fargate | App Runner | 判断 |
|-----|------------|-----------|------|
| **運用難易度** | 中 | 低 | App Runner有利 |
| **柔軟性** | 高 | 中 | ECS有利 |
| **コスト（小規模）** | $203/月 | $217/月 | ECS有利 |
| **将来拡張性** | 高（Socket.io追加容易） | 中 | ECS有利 |
| **学習コスト** | 中 | 低 | App Runner有利 |

**判断:**
- フェーズ1ではWebSocket不要だが、将来的な拡張性を考慮
- ECS Fargateの柔軟性・コストメリットを優先
- App Runnerも有力な代替案として記録

---

### 2.4 Lambda (Serverless) を採用しない理由

**なぜ検討したのか:**
- コスト効率が高い
- スケールが自動
- AWS Well-Architected的に推奨される

**なぜ採用しないのか:**

| 要件 | Lambda の制約 | 影響 |
|-----|-------------|------|
| **実行時間** | 最大15分 | PDF/動画処理が時間超過リスク |
| **コールドスタート** | 初回実行遅延 | UX低下 |
| **WebSocket** | API Gateway WebSocket必要 | Socket.io直接利用不可 |
| **Prisma接続** | 接続数爆発リスク | RDS Proxyでも不安定 |
| **メモリ制限** | 最大10GB | Sharp/Puppeteerが限界に達する可能性 |

**技術的詳細:**

```typescript
// 現在の実装（同期処理）
export async function POST(req: Request) {
  const image = await processImage(file) // 3-5秒かかる
  const pdf = await generatePDF(data)    // 5-10秒かかる
  return Response.json({ image, pdf })
}
```

Lambdaの15分制限は余裕に見えますが、**コールドスタート + Prisma接続初期化 + 処理時間**を合計すると、ピーク時にタイムアウトリスクがあります。

**結論: Lambdaは技術的リスクが高すぎる**

---

## 🔧 第3章: データベース・キャッシュ戦略

### 3.1 なぜ Aurora Serverless v2 なのか

**候補比較:**

| サービス | 評価 | 理由 |
|---------|------|------|
| **Aurora Serverless v2** | ✅ 最適 | Prisma完全互換、自動スケール、PITR |
| Aurora Provisioned | ⚠️ 次点 | 固定コスト、スケール手動 |
| RDS PostgreSQL | ⚠️ 次点 | Aurora比で機能劣位 |
| DynamoDB | ❌ 不適合 | Prismaの36モデルをNoSQLに移行困難 |

**Aurora Serverless v2 の優位性:**

1. **自動スケーリング**: 0.5 ACU → 最大128 ACU（夜間は最小、ピーク時は自動拡張）
2. **秒単位課金**: 使った分だけ（固定費なし）
3. **Multi-AZ**: 自動フェイルオーバー（1分以内）
4. **PITR**: 5分単位でのポイントインタイム復旧
5. **Prisma完全互換**: PostgreSQL 15準拠

**コスト試算:**

```
平時（0.5 ACU）: $0.06/hour × 24h × 30日 = $43.2/月
ピーク時（2 ACU平均）: $0.24/hour × 8h × 30日 = $57.6/月
合計: 約$100/月（¥15,000）
```

**結論: Aurora Serverless v2 が最適**

---

### 3.2 なぜ RDS Proxy が必須なのか

**現状の問題（コードレビューより）:**

```typescript
// app/api/inventory/route.ts
const prisma = new PrismaClient() // ❌ 各APIで個別生成

// app/api/products/[id]/route.ts
const prisma = new PrismaClient() // ❌ 107箇所で同じ

// app/api/listing/route.ts
const prisma = new PrismaClient() // ❌ 接続数が爆発的に増加
```

**問題点:**
- 107本のAPIルートが同時に呼ばれると、**107個のデータベース接続**が発生
- Auroraの最大接続数は ACU × 2000（0.5 ACUなら1000接続）
- スパイク時に接続数上限に達するリスク

**RDS Proxy の効果:**

```
接続プーリング: 1000リクエスト → 50接続に集約
フェイルオーバー: 60秒 → 1秒に短縮
認証キャッシュ: 接続確立時間を80%短縮
```

**コスト:**
```
RDS Proxy: $0.015/hour × 24h × 30日 = $10.8/月
エンドポイント2個（Writer/Reader）: $21.6/月
```

**費用対効果:**
- コスト: +$21.6/月
- 効果: 接続数95%削減、フェイルオーバー98%高速化

**結論: RDS Proxy は必須コンポーネント（オプションではない）**

---

### 3.3 ElastiCache Redis の要否判断

**フェーズ1判断: Redis不要**

理由:
- Socket.io未実装のためRedis Adapter不要
- セッション管理はJWT（ステートレス）で実装
- マスタデータキャッシュはアプリケーションメモリで十分

**フェーズ2以降（Socket.io実装時）: Redis必須**

以下は将来的にSocket.io実装時の参考情報:

**用途1: セッション管理（将来）**

```typescript
// 現在の実装（データベース直接）
const session = await prisma.session.findFirst({
  where: { userId }
}) // ❌ 毎回DB問い合わせ

// 改善後（Redisキャッシュ）
const cached = await redis.get(`session:${userId}`)
if (cached) return JSON.parse(cached) // ✅ 90%がキャッシュヒット
```

**効果:**
- レイテンシ: 50ms → 2ms（25倍高速化）
- DB負荷: 90%削減

---

**用途2: マスタデータキャッシュ**

```typescript
// 現在の実装
const statuses = await prisma.productStatus.findMany() // ❌ 毎回DB問い合わせ

// 改善後
const cached = await redis.get('master:product-statuses')
if (cached) return JSON.parse(cached) // ✅ TTL 1時間
```

**効果:**
- 頻繁にアクセスされるマスタデータをキャッシュ
- DB負荷: 80%削減

---

**用途3: Socket.io Adapter（将来実装時のみ）**

フェーズ2以降でSocket.io実装時の参考:

```typescript
import { createAdapter } from '@socket.io/redis-adapter'

const io = new Server(server, {
  adapter: createAdapter(redis, redis.duplicate())
})

// Redis Pub/Sub で全タスクにイベント配信
```

**Socket.io実装時のコスト:**
```
cache.t4g.micro × 2（Multi-AZ）: $0.014/hour × 2 × 24h × 30日 = $20/月
```

**結論: フェーズ1ではRedis不要、Socket.io実装時に追加検討**

---

## 🎯 第4章: 最終推奨アーキテクチャ

### 4.1 全体構成図

```
Internet
  ↓
[Route 53] 独自ドメイン管理
  ↓
[CloudFront + WAF]
  ├─→ [S3] 静的アセット（画像/PDF/動画）
  └─→ [ALB] Multi-AZ
       ↓
    ┌─────────────────────────────┐
    │ [ECS Fargate Cluster]       │
    │ ┌─────────────────────────┐ │
    │ │ Next.js Container       │ │
    │ │ ├─ SSR/ISR (React UI)  │ │
    │ │ ├─ API Routes (107本)  │ │
    │ │ └─ ポーリング方式      │ │
    │ │   （30秒間隔）         │ │
    │ └─────────────────────────┘ │
    │ タスク数: 2-10（オートスケール）│
    └─────────────────────────────┘
       ↓
  [RDS Proxy]
       ↓
  [Aurora MySQL]
  Serverless v2
  Multi-AZ
       ↓
  [AWS Backup]
  (PITR + スナップショット)

横断サービス:
├─ Secrets Manager（DB認証、APIキー）
├─ CloudWatch（Logs/Metrics/Alarms）
├─ X-Ray（分散トレーシング）
├─ Sentry（エラー追跡）
└─ EventBridge（バッチ処理トリガー）
```

---

### 4.2 サービス選定の最終決定

| 層 | サービス | 代替案検討結果 | 最終判断 |
|---|---|---|---|
| **DNS** | Route 53 | - | ✅ 標準選択 |
| **CDN/WAF** | CloudFront + AWS WAF | CloudFlare（△） | ✅ AWS統合優先 |
| **LB** | ALB | NLB（△ WebSocket制約） | ✅ ALB一択 |
| **Compute** | ECS Fargate | Amplify（❌）、App Runner（△）、Lambda（❌） | ✅ ECS Fargate |
| **Container** | ECR | Docker Hub（△） | ✅ ECR |
| **Database** | Aurora Serverless v2 | Provisioned（△）、RDS（△）、DynamoDB（❌） | ✅ Aurora Serverless v2 (MySQL) |
| **DB Proxy** | RDS Proxy | なし（❌） | ✅ 必須 |
| **Cache** | なし（フェーズ1） | Redis（フェーズ2でSocket.io時） | ❌ フェーズ1不要 |
| **Storage** | S3 | EFS（❌ コスト高）、EBS（❌ 単一AZ） | ✅ S3 |
| **Secrets** | Secrets Manager | SSM Parameter Store（△） | ✅ Secrets Manager |
| **Monitoring** | CloudWatch + X-Ray + Sentry | Datadog（△ コスト高） | ✅ AWS統合 |
| **Backup** | AWS Backup | 手動（❌） | ✅ AWS Backup |
| **IaC** | AWS CDK (TypeScript) | Terraform（△）、CloudFormation（△） | ✅ CDK（型安全） |

---

### 4.3 なぜ Cognito を採用しないのか

**現状の認証実装:**

```typescript
// lib/auth.ts
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// JWT + bcryptjsによる自前実装
// users/sessionsテーブルでセッション管理
// 2要素認証もメールベースで実装済み
```

**Cognito導入のメリット:**
- マネージド認証（運用不要）
- SSO/SAML/OIDC対応
- MFA標準装備

**Cognito導入のデメリット:**
- 既存実装を全面書き換え（工数大）
- 既存ユーザーデータの移行が必要
- カスタマイズ性が低い
- コスト増（MAU課金）

**コスト比較:**

```
現状（JWT自前）: $0/月
Cognito: MAU 100人 × $0.0055 = $0.55/月（少額だが増加）
```

**判断:**
- **初期移行時は既存JWT実装を維持**
- 将来、SSO/Federation要件が出た際にCognitoへ移行
- 段階的アプローチでリスク最小化

**結論: Cognitoは将来の選択肢として残すが、初期は既存実装維持**

---

## 💰 第5章: コスト分析

### 5.1 詳細コスト見積（中規模: DAU 100人、商品1万点）

| サービス | 仕様 | 時間単価 | 月額（USD） | 月額（JPY）* |
|---------|-----|---------|-----------|------------|
| **ECS Fargate** | 2タスク常時、最大10タスク | - | - | - |
| └ 通常時（2タスク） | 0.5vCPU, 1GB × 2 × 730h | $0.04856/h | $71 | ¥10,650 |
| └ ピーク時追加（平均2タスク） | 0.5vCPU, 1GB × 2 × 240h | $0.04856/h | $23 | ¥3,450 |
| **ALB** | 1個、LCU 10/h平均 | - | $25 | ¥3,750 |
| **Aurora Serverless v2 (MySQL)** | 0.5-2 ACU、平均1 ACU、Multi-AZ | - | - | - |
| └ Compute | $0.12/ACU/h × 1 × 730h | - | $88 | ¥13,200 |
| └ Storage | 20GB × $0.10/GB | - | $2 | ¥300 |
| └ I/O | 100万リクエスト × $0.20/百万 | - | $0.2 | ¥30 |
| **RDS Proxy** | 2エンドポイント × 730h | $0.015/h | $22 | ¥3,300 |
| **ElastiCache Redis** | フェーズ1不要 | - | $0 | ¥0 |
| **S3** | - | - | - | - |
| └ ストレージ | 100GB × $0.023/GB | - | $2.3 | ¥345 |
| └ リクエスト | 10万PUT、100万GET | - | $0.5 | ¥75 |
| └ 転送 | 50GB × $0.09/GB | - | $4.5 | ¥675 |
| **CloudFront** | - | - | - | - |
| └ 転送（北米・欧州） | 500GB × $0.085/GB | - | $42.5 | ¥6,375 |
| └ リクエスト | 500万 × $0.0075/万 | - | $3.75 | ¥563 |
| **ECR** | 10GB × $0.10/GB | - | $1 | ¥150 |
| **Route 53** | 1ホストゾーン + 100万クエリ | - | $1 | ¥150 |
| **Secrets Manager** | 5シークレット × $0.40 | - | $2 | ¥300 |
| **CloudWatch** | - | - | - | - |
| └ Logs | 10GB × $0.50/GB | - | $5 | ¥750 |
| └ Metrics | カスタム100個 × $0.30 | - | $30 | ¥4,500 |
| └ Alarms | 10個 × $0.10 | - | $1 | ¥150 |
| **X-Ray** | 10万トレース × $5/百万 | - | $0.5 | ¥75 |
| **AWS Backup** | 20GB × $0.05/GB | - | $1 | ¥150 |
| **データ転送** | NAT Gateway 50GB | $0.045/GB | $2.25 | ¥338 |
| **合計（通常時）** | | | **$328** | **¥49,200** |
| **合計（ピーク込み）** | | | **$351** | **¥52,650** |

**※フェーズ1での削減:**
- Redis不要: -$20/月（-¥3,000）
- Multi-AZ化で可用性向上（コストは維持）

*1 USD = 150 JPYで換算

---

### 5.2 コスト削減施策

**即効性のある施策:**

1. **フェーズ1での削減実績**
   ```
   Redis不要: -$20/月（Socket.io未実装のため）
   ```

2. **Aurora Serverless v2 の時間帯別ACU調整**
   ```
   夜間（22:00-08:00）: 0.5 ACU固定
   日中（08:00-22:00）: 1-2 ACU自動スケール
   削減効果: $20/月（-20%）
   ```

3. **ECS Fargate Spot（非本番環境）**
   ```
   開発環境でSpotインスタンス利用
   削減効果: 70% ($50/月削減)
   ```

4. **S3 Intelligent-Tiering**
   ```
   90日アクセスなし → Glacier移行
   削減効果: $5/月（ストレージコスト-50%）
   ```

5. **CloudWatch Logs保持期間短縮**
   ```
   30日 → 7日に変更（本番以外）
   削減効果: $15/月（-50%）
   ```

6. **VPC Endpoint（S3/Secrets Manager）**
   ```
   NAT Gateway経由トラフィックを削減
   削減効果: $5/月
   ```

**合計削減効果: 約$115/月（-33%）**

**最適化後コスト: $236/月（¥35,400）**

---

### 5.3 段階的コスト推移

| フェーズ | 月額コスト | 備考 |
|---------|-----------|------|
| **開発環境** | $80-120 | 1タスク、小ACU、Spot利用、Redis不要 |
| **ステージング環境** | $130-180 | 1-2タスク、本番同等構成、Redis不要 |
| **本番初期（DAU 50）** | $230-280 | 2タスク、最小ACU、Redis不要 |
| **本番拡大（DAU 100）** | $330-380 | 2-4タスク、平均ACU 1、Redis不要 |
| **本番スケール（DAU 300）** | $580-780 | 4-8タスク、平均ACU 2、Socket.io時Redis追加 |

---

## 🛡️ 第6章: AWS Well-Architected 適用（詳細版）

### 6.1 運用の優秀性（Operational Excellence）

**設計原則:**
- コードとしてのインフラ管理
- 頻繁で小規模かつ可逆的な変更
- 運用手順の改良
- 障害の予測
- 運用上の障害から学習

**実装:**

#### 6.1.1 Infrastructure as Code

```typescript
// AWS CDK (TypeScript) - 型安全な構成管理
import * as cdk from 'aws-cdk-lib'

const app = new cdk.App()

// 環境別スタック分離
new FbtStack(app, 'FbtProdStack', {
  env: { region: 'ap-northeast-1' },
  environmentName: 'production',
})

new FbtStack(app, 'FbtStagingStack', {
  env: { region: 'ap-northeast-1' },
  environmentName: 'staging',
})
```

**メリット:**
- 環境の再現性100%
- 変更履歴をGitで管理
- レビュープロセスの適用
- ロールバックが容易

---

#### 6.1.2 CI/CD パイプライン

```yaml
GitHub Push → GitHub Actions
  ↓
[1] Test（Type Check / Lint / Unit Test）
  ↓
[2] Build Docker Image → ECR Push
  ↓
[3] ECS Task Definition Update
  ↓
[4] ECS Service Update（Blue-Green Deploy）
  ↓
[5] Health Check（30秒間隔で5回）
  ↓ NG → 自動ロールバック
  ↓ OK
[6] 完了通知（Slack/Discord）
```

**自動ロールバック条件:**
- ヘルスチェック失敗（3回連続）
- エラー率 > 5%（CloudWatch Alarm）
- レイテンシ P95 > 1000ms

---

#### 6.1.3 運用ダッシュボード

**CloudWatch Dashboard構成:**

```
┌─────────────────────────────────────────────┐
│ FBT v2 Production Dashboard                │
├─────────────────────────────────────────────┤
│ [ECS]                                       │
│ ├─ CPU使用率: 45% ──────────── ✅          │
│ ├─ メモリ使用率: 62% ──────── ✅          │
│ ├─ タスク数: 3 / 10 ───────── ✅          │
│ └─ ネットワーク: 2.5 Mbps ──── ✅          │
│                                             │
│ [Aurora]                                    │
│ ├─ CPU使用率: 28% ──────────── ✅          │
│ ├─ 接続数: 23 / 100 ─────────  ✅          │
│ ├─ ACU: 1.2 / 2.0 ──────────── ✅          │
│ └─ レプリケーションラグ: 15ms ─ ✅          │
│                                             │
│ [Redis]                                     │
│ ├─ CPU使用率: 18% ──────────── ✅          │
│ ├─ メモリ使用率: 45% ─────── ✅            │
│ ├─ キャッシュヒット率: 92% ── ✅          │
│ └─ コマンド数: 1.2K/s ──────── ✅          │
│                                             │
│ [ALB]                                       │
│ ├─ リクエスト数: 850/min ───── ✅          │
│ ├─ レイテンシ P95: 285ms ──── ✅          │
│ ├─ 5xxエラー率: 0.02% ──────── ✅          │
│ └─ ターゲット正常数: 3 / 3 ─── ✅          │
└─────────────────────────────────────────────┘
```

---

#### 6.1.4 アラート設定

| メトリクス | 閾値 | アクション |
|----------|------|-----------|
| ECS CPU使用率 | > 80% (2分間) | Slack通知 + オートスケール |
| ECS メモリ使用率 | > 85% (2分間) | Slack通知 + オートスケール |
| Aurora 接続数 | > 80 | PagerDuty通知 + エンジニアコール |
| Aurora CPU | > 70% (5分間) | Slack通知 |
| Redis メモリ | > 80% | Slack通知 |
| ALB 5xxエラー率 | > 1% (1分間) | PagerDuty通知 + 自動ロールバック検討 |
| ALB レイテンシ P95 | > 1000ms (3分間) | Slack通知 |

---

### 6.2 セキュリティ（Security）

**設計原則:**
- 強力なアイデンティティ基盤の実装
- トレーサビリティの実現
- 全レイヤーでのセキュリティ適用
- セキュリティのベストプラクティス自動化
- 転送中および保管中のデータ保護
- データへのアクセス制限
- セキュリティイベントへの備え

**実装:**

#### 6.2.1 多層防御アーキテクチャ

```
[インターネット]
  ↓
[Layer 1: WAF]
  ├─ AWS Managed Rules（SQLi/XSS）
  ├─ Rate Limiting（2000 req/5min/IP）
  ├─ Geo Blocking（許可: JP, US, EU）
  └─ カスタムルール（ボット検出）
  ↓
[Layer 2: CloudFront]
  ├─ HTTPSのみ許可
  ├─ 署名付きURL（プライベートコンテンツ）
  └─ OAC（S3直接アクセス遮断）
  ↓
[Layer 3: ALB]
  ├─ HTTPSリスナー（TLS 1.2以上）
  ├─ Security Group（443のみ許可）
  └─ アクセスログ（S3保存）
  ↓
[Layer 4: ECS Security Group]
  ├─ ALBからのトラフィックのみ許可
  ├─ アウトバウンド: RDS/Redis/S3/Secretsのみ
  └─ 相互TLS（将来実装）
  ↓
[Layer 5: Application]
  ├─ JWT認証（HS256）
  ├─ RBAC（seller/staff/admin）
  ├─ CSRF対策（SameSite Cookie）
  └─ XSS対策（Content Security Policy）
  ↓
[Layer 6: Data Layer]
  ├─ RDS Proxy（IAM認証可能）
  ├─ Secrets Manager（KMS暗号化）
  ├─ Aurora暗号化（KMS）
  └─ S3暗号化（SSE-S3）
```

---

#### 6.2.2 IAM ポリシー（最小権限原則）

**ECS Task Role（アプリケーション用）:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3Assets",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::fbt-assets-prod/*"
    },
    {
      "Sid": "SecretsAccess",
      "Effect": "Allow",
      "Action": "secretsmanager:GetSecretValue",
      "Resource": [
        "arn:aws:secretsmanager:ap-northeast-1:*:secret:fbt/production/*"
      ]
    },
    {
      "Sid": "CloudWatchLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:ap-northeast-1:*:log-group:/ecs/fbt-v2:*"
    },
    {
      "Sid": "XRayTracing",
      "Effect": "Allow",
      "Action": [
        "xray:PutTraceSegments",
        "xray:PutTelemetryRecords"
      ],
      "Resource": "*"
    }
  ]
}
```

**GitHub Actions Role（CI/CD用）:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRPush",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "arn:aws:ecr:ap-northeast-1:*:repository/fbt-v2-production"
    },
    {
      "Sid": "ECSUpdate",
      "Effect": "Allow",
      "Action": [
        "ecs:UpdateService",
        "ecs:DescribeServices",
        "ecs:RegisterTaskDefinition",
        "ecs:DescribeTaskDefinition"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "ecs:cluster": "arn:aws:ecs:ap-northeast-1:*:cluster/fbt-production"
        }
      }
    }
  ]
}
```

---

#### 6.2.3 データ保護

| データ種別 | 保管時暗号化 | 転送時暗号化 | アクセス制御 |
|----------|-----------|-----------|-----------|
| **Aurora** | KMS (aws/rds) | TLS 1.2+ | RDS Proxy + SG |
| **Redis** | At-Rest暗号化 | ※無効（互換性） | SG（ECSのみ） |
| **S3** | SSE-S3 | HTTPS必須 | Bucket Policy + OAC |
| **Secrets** | KMS (default) | HTTPS必須 | IAM Role |
| **Logs** | KMS (オプション) | HTTPS必須 | CloudWatch Logs IAM |

※ Redis: Transit Encryption有効化はSocket.io互換性問題のため無効。将来検証予定。

---

#### 6.2.4 監査とコンプライアンス

**CloudTrail 設定:**
```
全リージョン有効
管理イベント: すべて記録
データイベント: S3（PutObject/DeleteObject）
ログ保存: S3（90日間）
→ Amazon Athena でクエリ可能
```

**VPC Flow Logs:**
```
対象: 全サブネット
フィルタ: REJECT（拒否されたトラフィックのみ）
保存先: CloudWatch Logs（7日間）
用途: 不正アクセス試行の検出
```

**Aurora 監査ログ:**
```
pgAudit拡張有効化
記録内容: すべてのDDL/DML
保存先: CloudWatch Logs
保持期間: 30日間
```

---

### 6.3 信頼性（Reliability）

**設計原則:**
- 障害から自動的に復旧
- 復旧手順のテスト
- 水平方向へのスケーリング
- キャパシティを推測しない
- オートメーションで変更を管理

**実装:**

#### 6.3.1 高可用性構成（Multi-AZ）

```
ap-northeast-1a          ap-northeast-1c          ap-northeast-1d
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│ Public      │         │ Public      │         │ Public      │
│ ALB (AZ-a)  │←─────→│ ALB (AZ-c)  │←─────→│ ALB (AZ-d)  │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
┌──────▼──────┐         ┌──────▼──────┐         ┌──────▼──────┐
│ Private     │         │ Private     │         │ Private     │
│ ECS Task #1 │         │ ECS Task #2 │         │ ECS Task #3 │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       └───────────┬───────────┴───────────┬───────────┘
                   ↓                       ↓
           ┌───────────────┐       ┌───────────────┐
           │ Aurora Writer │←─────→│ Aurora Reader │
           │   (AZ-a)      │       │   (AZ-c)      │
           └───────────────┘       └───────────────┘
                   ↓
           ┌───────────────┐
           │ RDS Proxy     │
           │ Multi-AZ      │
           └───────────────┘

           ┌───────────────┐       ┌───────────────┐
           │ Redis Primary │←─────→│ Redis Replica │
           │   (AZ-a)      │       │   (AZ-c)      │
           └───────────────┘       └───────────────┘
```

**障害時の動作:**

| 障害種別 | 検出時間 | 復旧時間 | 影響 |
|---------|---------|---------|------|
| **ECSタスク異常終了** | 10秒 | 30秒 | 1タスク分の処理能力低下（自動再起動） |
| **AZ障害（1つ）** | 30秒 | 即座 | 無影響（他AZで処理継続） |
| **Aurora Writer障害** | 30秒 | 60秒 | 60秒間の書き込み不可（読み取りは継続） |
| **Redis Primary障害** | 30秒 | 60秒 | キャッシュミス増加（DB負荷一時上昇） |
| **ALB障害** | 30秒 | 即座 | 無影響（Route 53 ヘルスチェック） |

---

#### 6.3.2 バックアップ戦略

**Aurora バックアップ:**

```
自動バックアップ:
├─ 継続的バックアップ（PITR）: 5分RPO
├─ スナップショット: 毎日03:00 JST
├─ 保持期間: 7日間
└─ クロスリージョンコピー: 無効（初期は不要）

手動バックアップ:
├─ 月次スナップショット: 毎月1日
├─ リリース前スナップショット: デプロイ直前
└─ 保持期間: 無期限（手動削除まで）
```

**S3 バックアップ:**

```
バージョニング: 有効
├─ 誤削除防止
├─ バージョン保持: 30世代
└─ 90日後にGlacier移行

クロスリージョンレプリケーション: 無効（初期）
└─ 将来、DRが必須になれば大阪リージョンへレプリケーション
```

**復旧手順（Runbook）:**

```markdown
## Aurora PITR 復旧手順

1. 障害時刻の特定（CloudWatch Logsで確認）
2. AWS Console → RDS → バックアップ → PITR復元
3. 復元時刻を指定（障害発生5分前）
4. 新クラスター名: fbt-aurora-restored-YYYYMMDD-HHMM
5. RDS Proxy接続先を新クラスターに変更
6. アプリケーション再起動（ECS Service Update）
7. データ整合性確認（smoke test実行）
8. 完了後、古いクラスターをスナップショット取得後削除

所要時間: 15-30分
```

---

#### 6.3.3 Circuit Breaker パターン

**ECS Service Deployment Circuit Breaker:**

```typescript
// CDK設定
fargateService.service.deploymentConfiguration = {
  deploymentCircuitBreaker: {
    enable: true,
    rollback: true,
  },
  maximumPercent: 200,
  minimumHealthyPercent: 100,
}
```

**動作:**
1. 新タスク起動
2. ヘルスチェック実行（/api/health）
3. **3回連続失敗** → 自動ロールバック
4. 旧タスクが継続稼働（ダウンタイムゼロ）

---

### 6.4 パフォーマンス効率（Performance Efficiency）

**設計原則:**
- 高度な技術の民主化
- わずか数分でグローバル展開
- サーバーレスアーキテクチャの使用
- より頻繁に実験
- メカニカルシンパシー

**実装:**

#### 6.4.1 Next.js パフォーマンス最適化

**next.config.js:**

```javascript
module.exports = {
  output: 'standalone', // Dockerサイズ85%削減
  compress: true,       // Gzip圧縮

  images: {
    formats: ['image/avif', 'image/webp'], // 次世代画像フォーマット
    deviceSizes: [640, 750, 828, 1080, 1200],
    minimumCacheTTL: 60,
  },

  experimental: {
    isrMemoryCacheSize: 50 * 1024 * 1024, // ISRキャッシュ50MB
  },
}
```

**ISR（Incremental Static Regeneration）活用:**

```typescript
// app/inventory/page.tsx
export const revalidate = 60 // 60秒ごとに再生成

export default async function InventoryPage() {
  const products = await prisma.product.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
  })

  return <ProductList products={products} />
}
```

**効果:**
- 初回: SSR（300ms）
- 2回目以降: キャッシュ（10ms） → **30倍高速化**

---

#### 6.4.2 CloudFront キャッシュ戦略

| パス | TTL | キャッシュキー | 戦略 |
|-----|-----|------------|------|
| `/_next/static/*` | 31536000秒（1年） | URL | Immutable |
| `/images/*` | 604800秒（7日） | URL | Cache-First |
| `/api/*` | 0秒（キャッシュなし） | - | Origin-First |
| SSRページ | 60秒 | URL + Cookie | ISR |

**CloudFront Functions（エッジ処理）:**

```javascript
// URLリライト（例: /old-path → /new-path）
function handler(event) {
  var request = event.request
  if (request.uri === '/old-inventory') {
    request.uri = '/inventory'
  }
  return request
}
```

---

#### 6.4.3 データベースクエリ最適化

**N+1問題の解消:**

```typescript
// ❌ 悪い例（N+1クエリ）
const products = await prisma.product.findMany()
for (const product of products) {
  const images = await prisma.productImage.findMany({
    where: { productId: product.id }
  })
}

// ✅ 良い例（1クエリ）
const products = await prisma.product.findMany({
  include: {
    images: true,
    location: true,
    inspectionData: true,
  }
})
```

**効果:**
- クエリ数: 101回 → 1回
- レイテンシ: 5秒 → 50ms（**100倍高速化**）

---

**インデックス設計:**

```sql
-- 頻繁に検索されるカラムにインデックス
CREATE INDEX idx_product_status ON product(status);
CREATE INDEX idx_product_category ON product(category);
CREATE INDEX idx_product_sku ON product(sku);
CREATE INDEX idx_product_created_at ON product(created_at DESC);

-- 複合インデックス
CREATE INDEX idx_product_status_category ON product(status, category);
```

**効果:**
- フルスキャン: 10秒 → インデックススキャン: 10ms（**1000倍高速化**）

---

#### 6.4.4 Redis キャッシュパターン

**Cache-Aside パターン:**

```typescript
async function getProductStatuses() {
  // 1. キャッシュ確認
  const cached = await redis.get('master:product-statuses')
  if (cached) {
    return JSON.parse(cached)
  }

  // 2. DBから取得
  const statuses = await prisma.productStatus.findMany()

  // 3. キャッシュに保存（TTL: 1時間）
  await redis.setex('master:product-statuses', 3600, JSON.stringify(statuses))

  return statuses
}
```

**効果:**
- キャッシュヒット率: 90%
- レイテンシ: 50ms → 2ms（**25倍高速化**）
- DB負荷: 90%削減

---

### 6.5 コスト最適化（Cost Optimization）

**設計原則:**
- クラウド財務管理の実装
- 消費モデルの導入
- 全体的な効率の測定
- 差別化につながらない高負荷の作業をやめる
- 費用を分析および帰属

**実装:**

#### 6.5.1 Aurora Serverless v2 の時間帯別ACU調整

**Lambda関数でスケジュール実行:**

```python
import boto3
import os

rds = boto3.client('rds')
cluster_id = os.environ['CLUSTER_ID']

def lambda_handler(event, context):
    hour = int(event['time'].split(':')[0])

    # 夜間（22:00-08:00）: 最小ACU
    if 22 <= hour or hour < 8:
        min_acu = 0.5
        max_acu = 1
    # 日中（08:00-22:00）: 通常ACU
    else:
        min_acu = 0.5
        max_acu = 2

    rds.modify_db_cluster(
        DBClusterIdentifier=cluster_id,
        ServerlessV2ScalingConfiguration={
            'MinCapacity': min_acu,
            'MaxCapacity': max_acu
        }
    )
```

**削減効果:**
- 夜間ACU: 2.0 → 0.5（-75%）
- 月額コスト: $88 → $68（**-$20/月**）

---

#### 6.5.2 ECS Fargate の適正サイジング

**Container Insights で実測:**

```
CPU使用率（7日間平均）: 35%
メモリ使用率（7日間平均）: 55%

現在: 1 vCPU, 2GB
最適: 0.5 vCPU, 1GB
```

**削減効果:**
- タスク単価: $0.09712/h → $0.04856/h（**-50%**）
- 月額コスト（2タスク常時）: $142 → $71（**-$71/月**）

---

#### 6.5.3 S3 ライフサイクル管理

```
商品画像（/products/）:
├─ 0-30日: STANDARD
├─ 31-90日: INTELLIGENT_TIERING
└─ 91日-: GLACIER_INSTANT_RETRIEVAL

PDF帳票（/invoices/）:
├─ 0-90日: STANDARD
└─ 91日-: GLACIER_FLEXIBLE_RETRIEVAL

削除済み商品（/deleted/）:
└─ 30日後: 自動削除
```

**削減効果:**
- ストレージコスト: $2.3/月 → $1.2/月（**-$1.1/月**）

---

#### 6.5.4 Reserved Instances / Savings Plans

**12ヶ月コミット（前払いなし）での割引率:**

| サービス | 通常料金 | RI/SP料金 | 削減率 |
|---------|---------|----------|--------|
| Aurora ACU | $0.12/ACU/h | $0.084/ACU/h | **30%** |
| ECS Fargate Compute | $0.04856/h | $0.03399/h | **30%** |

**年間削減効果:**
- Aurora: ($88 - $62) × 12 = **$312/年**
- ECS: ($71 - $50) × 12 = **$252/年**
- **合計: $564/年（約¥85,000）**

---

#### 6.5.5 コスト配分タグ

```
すべてのリソースに統一タグ付け:
├─ Environment: production / staging / development
├─ Project: fbt-v2
├─ Owner: engineering-team
├─ CostCenter: fulfillment-ops
└─ ManagedBy: cdk
```

**効果:**
- Cost Explorer で環境別コスト可視化
- 予算アラート設定（環境ごと）
- チャージバック（部門別コスト請求）

---

### 6.6 サステナビリティ（Sustainability）

**設計原則:**
- 影響を理解
- サステナビリティ目標を確立
- 使用率を最大化
- より効率的な新しいハードウェアとソフトウェアを予測および導入
- マネージドサービスを使用
- クラウドワークロードのダウンストリーム影響を削減

**実装:**

#### 6.6.1 AWS Graviton2 (ARM) 採用

```
ECS Fargate: ARM64アーキテクチャ
├─ CPU性能: x86比で20%向上
├─ 消費電力: 20%削減
└─ コスト: 20%削減

ElastiCache Redis: cache.t4g.micro（Graviton2）
├─ 消費電力: 20%削減
└─ コスト: 20%削減
```

**CO2削減効果（試算）:**
- 従来（x86）: 500 kWh/月
- Graviton2: 400 kWh/月（**-20%**）
- CO2排出量: 約50 kg-CO2/月削減

---

#### 6.6.2 リージョン選定（グリーンエネルギー）

**ap-northeast-1（東京）選定理由:**
- AWS再生可能エネルギー目標: 2025年100%
- 日本国内のデータ主権
- レイテンシ最小（日本ユーザー向け）

**参考: グリーンエネルギー比率（2024年）**
- 東京リージョン: 約40%
- 大阪リージョン: 約35%
- オレゴンリージョン: 約95%（参考）

---

#### 6.6.3 キャッシュ・CDN活用による転送量削減

```
CloudFront活用:
├─ オリジンリクエスト削減: 90%
├─ データ転送量削減: 80%
└─ エッジキャッシュで電力効率化

Redis キャッシュ:
├─ DB問い合わせ削減: 90%
└─ 再計算の排除: 大量のCPU時間削減
```

**効果:**
- 月間データ転送: 2TB → 400GB（**-80%**）
- サーバー稼働時間削減 → 電力消費削減

---

#### 6.6.4 リソースの適正化（アイドル削減）

```
Aurora Serverless v2:
├─ アイドル時: 0.5 ACU（最小）
└─ 固定インスタンス比で電力効率化

ECS Fargate オートスケール:
├─ 夜間: 2タスク（最小）
├─ 日中: 2-4タスク
└─ ピーク: 4-10タスク
→ 平均稼働率80%維持（アイドル最小化）
```

---

## 🚀 第7章: 移行ロードマップ（詳細版）

### 7.1 全体スケジュール（5週間）

```
Week 1: VPC・データベース構築
Week 2: コンテナ・ネットワーク構築
Week 3: データ移行
Week 4: アプリケーション調整
Week 5: ステージング検証
Day 1: 本番移行（Blue-Green）
```

---

### 7.2 Week 1: VPC・データベース構築（5営業日）

#### Day 1: プロジェクト初期化

**作業内容:**
```bash
# AWS CDK プロジェクト作成
mkdir infrastructure && cd infrastructure
npx aws-cdk init app --language=typescript

# 依存関係インストール
npm install @aws-cdk/aws-ec2 @aws-cdk/aws-rds \
  @aws-cdk/aws-elasticache @aws-cdk/aws-ecs

# GitHub OIDC設定
# AWS Console → IAM → Identity providers → Add provider
# Provider URL: https://token.actions.githubusercontent.com
# Audience: sts.amazonaws.com
```

**成果物:**
- CDKプロジェクト初期化完了
- GitHub OIDC Provider作成
- IAM Role（GitHub Actions用）作成

---

#### Day 2-3: VPC構築

**作業内容:**
```typescript
// lib/network-stack.ts
const vpc = new ec2.Vpc(this, 'FbtVpc', {
  maxAzs: 3,
  natGateways: 1,
  subnetConfiguration: [
    { cidrMask: 24, name: 'Public', subnetType: ec2.SubnetType.PUBLIC },
    { cidrMask: 24, name: 'Private', subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    { cidrMask: 28, name: 'Isolated', subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
  ],
})

// VPC Endpoints
vpc.addGatewayEndpoint('S3Endpoint', {
  service: ec2.GatewayVpcEndpointAwsService.S3,
})

vpc.addInterfaceEndpoint('SecretsEndpoint', {
  service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
})
```

**検証:**
```bash
# CDK diff確認
cdk diff NetworkStack

# デプロイ
cdk deploy NetworkStack

# VPC確認
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=FbtVpc"
```

**成果物:**
- VPC（3 AZ、Public/Private/Isolated Subnet）
- NAT Gateway × 1
- VPC Endpoint（S3, Secrets Manager）

---

#### Day 4-5: Aurora・Redis・Secrets構築

**作業内容:**
```typescript
// lib/database-stack.ts

// Secrets Manager
const dbSecret = new secrets.Secret(this, 'DbSecret', {
  secretName: 'fbt/production/db-credentials',
  generateSecretString: {
    secretStringTemplate: JSON.stringify({ username: 'fbtadmin' }),
    generateStringKey: 'password',
    excludePunctuation: true,
    passwordLength: 32,
  },
})

// Aurora Serverless v2
const dbCluster = new rds.DatabaseCluster(this, 'Aurora', {
  engine: rds.DatabaseClusterEngine.auroraPostgres({
    version: rds.AuroraPostgresEngineVersion.VER_15_3,
  }),
  writer: rds.ClusterInstance.serverlessV2('Writer'),
  readers: [rds.ClusterInstance.serverlessV2('Reader')],
  serverlessV2MinCapacity: 0.5,
  serverlessV2MaxCapacity: 2,
  credentials: rds.Credentials.fromSecret(dbSecret),
  vpc,
  backup: {
    retention: cdk.Duration.days(7),
    preferredWindow: '03:00-04:00',
  },
})

// RDS Proxy
const proxy = dbCluster.addProxy('Proxy', {
  secrets: [dbSecret],
  vpc,
  requireTLS: true,
})

// ElastiCache Redis
const redis = new elasticache.CfnReplicationGroup(this, 'Redis', {
  replicationGroupDescription: 'FBT Redis',
  cacheNodeType: 'cache.t4g.micro',
  engine: 'redis',
  engineVersion: '7.0',
  automaticFailoverEnabled: true,
  numNodeGroups: 1,
  replicasPerNodeGroup: 1,
})
```

**検証:**
```bash
# デプロイ
cdk deploy DatabaseStack

# Aurora接続テスト
psql -h <rds-proxy-endpoint> -U fbtadmin -d fbt

# Redis接続テスト
redis-cli -h <redis-endpoint> ping
```

**成果物:**
- Aurora PostgreSQL Serverless v2（Multi-AZ）
- RDS Proxy
- ElastiCache Redis（Multi-AZ）
- Secrets Manager（DB認証情報）

---

### 7.3 Week 2: コンテナ・ネットワーク構築（5営業日）

#### Day 6: ECR・S3構築

**作業内容:**
```typescript
// ECR
const repo = new ecr.Repository(this, 'EcrRepo', {
  repositoryName: 'fbt-v2-production',
  imageScanOnPush: true,
  lifecycleRules: [{
    description: 'Keep last 10 images',
    maxImageCount: 10,
  }],
})

// S3
const assetsBucket = new s3.Bucket(this, 'AssetsBucket', {
  bucketName: 'fbt-assets-prod',
  versioned: true,
  lifecycleRules: [{
    transitions: [{
      storageClass: s3.StorageClass.INTELLIGENT_TIERING,
      transitionAfter: cdk.Duration.days(90),
    }],
  }],
})
```

**検証:**
```bash
# ECR login
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-northeast-1.amazonaws.com

# テストイメージpush
docker build -t fbt-v2-test .
docker tag fbt-v2-test:latest <ecr-uri>:test
docker push <ecr-uri>:test

# S3動作確認
aws s3 cp test.txt s3://fbt-assets-prod/
aws s3 ls s3://fbt-assets-prod/
```

**成果物:**
- ECR Repository
- S3 Bucket（バージョニング・ライフサイクル設定済み）

---

#### Day 7-8: Dockerfile最適化

**作業内容:**
```dockerfile
# Multi-stage build
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci && npx prisma generate

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
CMD ["node", "server.js"]
```

**検証:**
```bash
# ローカルビルド
docker build -t fbt-v2:local .

# イメージサイズ確認
docker images fbt-v2:local
# REPOSITORY   TAG     SIZE
# fbt-v2       local   210MB  ← 目標: 300MB以下

# ローカル実行テスト
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_URL="redis://..." \
  fbt-v2:local

# ヘルスチェック
curl http://localhost:3000/api/health
```

**成果物:**
- 最適化されたDockerfile
- イメージサイズ: ~200MB（85%削減）

---

#### Day 9-10: ECS・ALB構築

**作業内容:**
```typescript
// ECS Cluster
const cluster = new ecs.Cluster(this, 'Cluster', {
  vpc,
  containerInsights: true,
})

// ALB + Fargate Service
const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(
  this,
  'App',
  {
    cluster,
    cpu: 512,      // 初期は小さめ（後で調整）
    memoryLimitMiB: 1024,
    desiredCount: 2,
    taskImageOptions: {
      image: ecs.ContainerImage.fromEcrRepository(repo, 'latest'),
      containerPort: 3000,
      environment: {
        NODE_ENV: 'production',
        REDIS_URL: `redis://${redis.attrPrimaryEndPointAddress}:6379`,
      },
      secrets: {
        DATABASE_URL: ecs.Secret.fromSecretsManager(dbSecret),
      },
    },
    circuitBreaker: { rollback: true },
  }
)

// Health Check
fargateService.targetGroup.configureHealthCheck({
  path: '/api/health',
  interval: cdk.Duration.seconds(30),
})
```

**検証:**
```bash
# デプロイ
cdk deploy EcsStack

# ALB DNS確認
aws elbv2 describe-load-balancers --names FbtProdStack-App

# ヘルスチェック
curl http://<alb-dns>/api/health

# ECS タスク確認
aws ecs describe-tasks --cluster fbt-production --tasks <task-id>
```

**成果物:**
- ECS Fargate Cluster
- ALB（Multi-AZ）
- ECS Service（2タスク常時）

---

### 7.4 Week 3: データ移行（5営業日）

#### Day 11-12: Prisma Migration

**作業内容:**
```bash
# 1. schema.prisma を PostgreSQL用に変更
# prisma/schema.prisma
datasource db {
  provider = "postgresql"  # sqlite → postgresql
  url      = env("DATABASE_URL")
}

# 2. マイグレーションファイル生成
DATABASE_URL="postgresql://..." npx prisma migrate dev --name init

# 3. ステージングDBに適用
DATABASE_URL="postgresql://<rds-proxy-endpoint>/fbt" \
  npx prisma migrate deploy

# 4. スキーマ検証
npx prisma db pull
npx prisma validate
```

**検証:**
```sql
-- PostgreSQLで全テーブル確認
\dt

-- サンプルクエリ
SELECT * FROM "Product" LIMIT 5;
SELECT * FROM "User" LIMIT 5;
```

**成果物:**
- PostgreSQL対応 schema.prisma
- マイグレーションファイル一式

---

#### Day 13-14: データ移行スクリプト

**作業内容:**
```typescript
// scripts/migrate-data.ts
import { PrismaClient as SQLitePrisma } from '@prisma/client/sqlite'
import { PrismaClient as PostgresPrisma } from '@prisma/client'

const sqlite = new SQLitePrisma({
  datasources: { db: { url: 'file:./prisma/dev.db' } }
})

const postgres = new PostgresPrisma({
  datasources: { db: { url: process.env.DATABASE_URL } }
})

async function migrateUsers() {
  const users = await sqlite.user.findMany()

  for (const user of users) {
    await postgres.user.create({ data: user })
  }

  console.log(`Migrated ${users.length} users`)
}

async function migrateProducts() {
  const products = await sqlite.product.findMany({
    include: {
      images: true,
      location: true,
      inspectionData: true,
    }
  })

  for (const product of products) {
    await postgres.product.create({
      data: {
        ...product,
        images: { create: product.images },
        location: product.location ? { connect: { id: product.location.id } } : undefined,
      }
    })
  }

  console.log(`Migrated ${products.length} products`)
}

async function main() {
  await migrateUsers()
  await migrateProducts()
  // ... 全36モデル
}

main()
```

**実行:**
```bash
# ドライラン（確認のみ）
DATABASE_URL="postgresql://..." ts-node scripts/migrate-data.ts --dry-run

# 本番実行
DATABASE_URL="postgresql://..." ts-node scripts/migrate-data.ts
```

**検証:**
```sql
-- レコード数確認
SELECT
  'User' AS table_name, COUNT(*) AS count FROM "User"
UNION ALL
SELECT 'Product', COUNT(*) FROM "Product"
UNION ALL
SELECT 'ProductImage', COUNT(*) FROM "ProductImage"
-- ... 全テーブル
```

**成果物:**
- データ移行完了（全36モデル）
- 整合性検証レポート

---

#### Day 15: S3画像移行

**作業内容:**
```bash
# ローカル画像をS3へ一括アップロード
aws s3 sync ./public/uploads/ s3://fbt-assets-prod/products/ \
  --exclude "*.DS_Store" \
  --metadata-directive COPY

# URLをCloudFront経由に変更
# データベースの imageUrl カラムを一括更新
UPDATE "ProductImage"
SET url = REPLACE(url, 'http://localhost:3002/uploads/', 'https://dXXXX.cloudfront.net/products/')
WHERE url LIKE '%localhost%';
```

**検証:**
```bash
# 画像アクセステスト
curl -I https://dXXXX.cloudfront.net/products/sample.jpg
# HTTP/2 200 OK

# 全画像の存在確認スクリプト
node scripts/verify-images.js
```

**成果物:**
- 全画像S3移行完了
- CloudFront経由アクセス確認

---

### 7.5 Week 4: アプリケーション調整（5営業日）

#### Day 16-17: Prisma接続集約

**作業内容:**
```typescript
// lib/database.ts 作成
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient({
  log: ['error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
```

**全APIルート修正（107ファイル）:**
```bash
# 一括検索・置換
find app/api -name "*.ts" -type f -exec sed -i '' \
  's/const prisma = new PrismaClient()/import { prisma } from "@\/lib\/database"/g' {} +

# 手動確認
grep -r "new PrismaClient()" app/api/
# → 0件になれば成功
```

**成果物:**
- lib/database.ts 作成
- 全107本のAPIルートで共有インスタンス使用

---

#### Day 18: Redis・Socket.io統合

**作業内容:**
```typescript
// lib/redis.ts 作成
import Redis from 'ioredis'

export const redis = new Redis(process.env.REDIS_URL!, {
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
})

// lib/socket.ts 作成
import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { redis } from './redis'

export function initSocketServer(httpServer: any) {
  const io = new Server(httpServer, {
    adapter: createAdapter(redis, redis.duplicate()),
  })
  return io
}
```

**package.json 依存追加:**
```json
{
  "dependencies": {
    "ioredis": "^5.3.2",
    "@socket.io/redis-adapter": "^8.2.1"
  }
}
```

**成果物:**
- Redis接続管理
- Socket.io Redis Adapter統合

---

#### Day 19-20: 環境変数・Secrets統合

**作業内容:**
```bash
# Secrets Managerに値を設定
aws secretsmanager put-secret-value \
  --secret-id fbt/production/sendgrid-api-key \
  --secret-string "SG.xxxxx"

aws secretsmanager put-secret-value \
  --secret-id fbt/production/ebay-api-key \
  --secret-string "EBAY-xxxxx"

# ECS Task Definition更新
# secrets セクションにSecrets Manager参照を追加
```

**.env.production 作成:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://<rds-proxy-endpoint>/fbt
REDIS_URL=redis://<elasticache-endpoint>:6379
AWS_REGION=ap-northeast-1
S3_BUCKET_NAME=fbt-assets-prod
CLOUDFRONT_DOMAIN=dXXXX.cloudfront.net
```

**成果物:**
- Secrets Manager統合完了
- 環境変数整理

---

### 7.6 Week 5: ステージング検証（5営業日）

#### Day 21-22: E2Eテスト

**作業内容:**
```bash
# Playwright設定更新
# playwright.config.ts
export default defineConfig({
  use: {
    baseURL: 'https://staging-fbt.example.com',
  },
})

# 全E2Eテスト実行
npm run test

# 主要フロー検証
npm run test -- e2e/product-lifecycle.spec.ts
npm run test -- e2e/staff-workflow.spec.ts
npm run test -- e2e/authentication.spec.ts
```

**テスト項目:**
- [ ] ログイン（セラー/スタッフ/管理者）
- [ ] 商品登録
- [ ] 検品フロー
- [ ] 在庫管理
- [ ] 出品処理
- [ ] 受注管理
- [ ] ピッキング
- [ ] 梱包
- [ ] 発送
- [ ] 返品処理

**成果物:**
- E2Eテスト全パス
- テストレポート

---

#### Day 23: 負荷テスト

**作業内容:**
```bash
# Artillery負荷テスト
artillery run load-test.yml

# 負荷テスト設定
# load-test.yml
config:
  target: 'https://staging-fbt.example.com'
  phases:
    - duration: 300
      arrivalRate: 10  # Warm up
    - duration: 600
      arrivalRate: 50  # Sustained load
    - duration: 300
      arrivalRate: 100 # Peak load

scenarios:
  - name: 'API Load Test'
    flow:
      - get:
          url: '/api/inventory'
      - post:
          url: '/api/products'
      - get:
          url: '/api/dashboard'
```

**目標:**
- スループット: 50 RPS以上
- レイテンシ P95: < 500ms
- エラー率: < 0.1%

**成果物:**
- 負荷テストレポート
- ボトルネック特定・改善

---

#### Day 24: セキュリティスキャン

**作業内容:**
```bash
# OWASP ZAP
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://staging-fbt.example.com \
  -r zap-report.html

# 脆弱性スキャン結果確認
open zap-report.html
```

**チェック項目:**
- [ ] SQLインジェクション対策
- [ ] XSS対策
- [ ] CSRF対策
- [ ] セキュアヘッダー設定
- [ ] TLS設定
- [ ] 認証・認可

**成果物:**
- セキュリティスキャンレポート
- 脆弱性ゼロ確認

---

#### Day 25: パフォーマンスチューニング

**作業内容:**
```bash
# X-Ray トレース分析
# 遅いAPIを特定
aws xray get-trace-summaries \
  --start-time <start> \
  --end-time <end> \
  --filter-expression 'responsetime > 1'

# スロークエリログ確認（Aurora）
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**最適化項目:**
- [ ] N+1クエリ解消
- [ ] 不要なインデックス削除
- [ ] Redisキャッシュ追加
- [ ] CloudFront TTL調整

**成果物:**
- パフォーマンス改善完了
- 目標レイテンシ達成

---

### 7.7 Day 26: 本番移行（Blue-Green Deploy）

#### 移行前チェックリスト

```markdown
## 本番移行前チェックリスト

### インフラ
- [ ] 本番環境スタックデプロイ完了
- [ ] Aurora接続確認
- [ ] Redis接続確認
- [ ] S3バケット準備完了
- [ ] CloudFront動作確認
- [ ] ALBヘルスチェック正常
- [ ] ECSタスク起動確認

### アプリケーション
- [ ] 全E2Eテストパス
- [ ] 負荷テスト合格
- [ ] セキュリティスキャン問題なし
- [ ] 環境変数設定完了
- [ ] Secrets Manager設定完了

### データ
- [ ] データ移行完了
- [ ] 整合性検証完了
- [ ] バックアップ取得完了

### 監視
- [ ] CloudWatch Dashboard作成
- [ ] CloudWatch Alarms設定
- [ ] X-Ray有効化
- [ ] Sentry設定

### 運用
- [ ] ロールバック手順確認
- [ ] インシデント対応手順確認
- [ ] オンコール体制確立
- [ ] ステークホルダー通知完了
```

---

#### 移行手順（Blue-Green）

**10:00 - 準備開始**

```bash
# 1. 最終バックアップ
aws backup start-backup-job \
  --resource-arn arn:aws:rds:ap-northeast-1:ACCOUNT:cluster:fbt-aurora \
  --iam-role-arn arn:aws:iam::ACCOUNT:role/AWSBackupRole

# 2. DNS TTL短縮（1時間前）
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch file://ttl-60.json
```

---

**11:00 - Blue環境（新本番）起動**

```bash
# 3. Blue環境デプロイ
cdk deploy FbtProdStack --require-approval never

# 4. ECSタスク起動確認
aws ecs describe-services \
  --cluster fbt-production \
  --services fbt-blue

# 5. ヘルスチェック確認（5分間監視）
for i in {1..10}; do
  curl -s https://blue-fbt.example.com/api/health | jq .
  sleep 30
done
```

---

**11:30 - 段階的トラフィック切替**

**Phase 1: 10%トラフィック（15分間）**

```bash
# Route 53 Weighted Routing
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch file://weighted-10.json

# 監視（CloudWatch）
# - エラー率: < 0.1%
# - レイテンシ P95: < 500ms
# - CPU/メモリ: 正常範囲内
```

**Phase 2: 50%トラフィック（15分間）**

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch file://weighted-50.json

# 継続監視
```

**Phase 3: 100%トラフィック**

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch file://weighted-100.json
```

---

**12:30 - 最終確認**

```bash
# 6. 全機能smoke test
npm run test:smoke

# 7. CloudWatch Dashboard確認
# 8. X-Ray トレース確認
# 9. Sentry エラー確認

# 問題なければ完了
```

---

**13:00 - Green環境（旧本番）停止**

```bash
# 10. Green環境を24時間保持（ロールバック用）
aws ecs update-service \
  --cluster fbt-production \
  --service fbt-green \
  --desired-count 0

# 11. DNS TTL復元
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch file://ttl-3600.json
```

---

**移行完了通知**

```markdown
## 本番移行完了報告

移行日時: 2025年XX月XX日 10:00-13:00
ダウンタイム: 0秒
影響範囲: なし

### 移行結果
- ✅ Blue-Green Deploy成功
- ✅ 全ヘルスチェック正常
- ✅ E2Eテスト全パス
- ✅ エラー率: 0.01%（正常範囲）
- ✅ レイテンシ: P95 285ms（目標500ms以下）

### 監視体制
- 24時間監視継続
- ロールバック体制待機（24時間）

### 次のアクション
- 1週間後: Green環境削除
- 1ヶ月後: 本番環境レビュー
```

---

## 📊 第8章: リスク管理

### 8.1 リスクマトリクス

| リスク | 発生確率 | 影響度 | リスクレベル | 対策 |
|-------|---------|--------|------------|------|
| **Prisma接続数超過** | 高 | 高 | 🔴 Critical | ✅ 共有インスタンス化 + RDS Proxy |
| **ポーリング遅延** | 低 | 低 | 🟢 Low | ✅ 30秒間隔で業務上問題なし |
| **データ移行時の損失** | 中 | 高 | 🟠 High | ✅ 段階移行 + バックアップ検証 |
| **本番移行失敗** | 中 | 高 | 🟠 High | ✅ Blue-Green Deploy + ロールバック手順 |
| **コスト超過** | 中 | 中 | 🟡 Medium | ✅ 月次レビュー + アラート設定 |
| **セキュリティ侵害** | 低 | 高 | 🟠 High | ✅ WAF + Secrets Manager + 監査 |
| **パフォーマンス劣化** | 中 | 中 | 🟡 Medium | ✅ X-Ray監視 + オートスケール |
| **外部API障害** | 中 | 中 | 🟡 Medium | ✅ リトライロジック + フォールバック |

---

### 8.2 インシデント対応手順

#### 8.2.1 レベル定義

| レベル | 定義 | 対応時間 | 対応者 |
|-------|------|---------|--------|
| **P0 (Critical)** | サービス全停止 | 即座（15分以内） | 全エンジニア + CTO |
| **P1 (High)** | 主要機能停止 | 1時間以内 | オンコールエンジニア |
| **P2 (Medium)** | 一部機能劣化 | 4時間以内 | 担当エンジニア |
| **P3 (Low)** | 軽微な問題 | 翌営業日 | 担当エンジニア |

---

#### 8.2.2 P0インシデント対応フロー

```
[1] 検知（CloudWatch Alarm / Sentry / ユーザー報告）
  ↓
[2] PagerDuty通知 → オンコールエンジニア起動（15分以内）
  ↓
[3] 初動対応（5分以内）
  ├─ Slackインシデントチャンネル作成
  ├─ ステータスページ更新
  └─ ステークホルダー通知
  ↓
[4] 原因調査（並行実施）
  ├─ CloudWatch Logs確認
  ├─ X-Ray トレース確認
  ├─ Aurora スロークエリログ
  └─ ECS タスクログ
  ↓
[5] 緊急対策判断（10分以内）
  ├─ ロールバック（最優先）
  ├─ スケールアップ
  ├─ キャッシュクリア
  └─ 手動修正
  ↓
[6] 復旧実施
  ↓
[7] 復旧確認
  ├─ ヘルスチェック正常
  ├─ エラー率正常化
  └─ ユーザー影響なし確認
  ↓
[8] 事後対応
  ├─ ポストモーテム作成（24時間以内）
  ├─ 再発防止策策定
  └─ ドキュメント更新
```

---

#### 8.2.3 ロールバック手順（緊急時）

**シナリオ: 新デプロイ後にエラー率急増**

```bash
# 1. 現在のタスク定義確認
CURRENT_TD=$(aws ecs describe-services \
  --cluster fbt-production \
  --services fbt-service \
  --query 'services[0].taskDefinition' \
  --output text)

echo "Current: $CURRENT_TD"

# 2. 前バージョンのタスク定義を取得
CURRENT_REV=$(echo $CURRENT_TD | grep -oP ':\K[0-9]+')
PREVIOUS_REV=$((CURRENT_REV - 1))
PREVIOUS_TD=$(echo $CURRENT_TD | sed "s/:${CURRENT_REV}/:${PREVIOUS_REV}/")

echo "Rolling back to: $PREVIOUS_TD"

# 3. ロールバック実行
aws ecs update-service \
  --cluster fbt-production \
  --service fbt-service \
  --task-definition $PREVIOUS_TD \
  --force-new-deployment

# 4. デプロイ監視
aws ecs wait services-stable \
  --cluster fbt-production \
  --services fbt-service

# 5. ヘルスチェック確認
curl https://fbt.example.com/api/health

# 所要時間: 3-5分
```

---

## 📈 第9章: 成功基準とKPI

### 9.1 技術的KPI

| カテゴリ | メトリクス | 目標値 | 測定方法 |
|---------|----------|--------|---------|
| **可用性** | Uptime | 99.9%（月間43分以内） | CloudWatch Synthetics |
| **パフォーマンス** | レイテンシ P50 | < 200ms | X-Ray |
| | レイテンシ P95 | < 500ms | X-Ray |
| | レイテンシ P99 | < 1000ms | X-Ray |
| **信頼性** | エラー率 | < 0.1% | CloudWatch Logs Insights |
| | MTTR（平均復旧時間） | < 30分 | インシデント記録 |
| | MTBF（平均故障間隔） | > 30日 | インシデント記録 |
| **スケーラビリティ** | 同時ユーザー | 500人対応 | 負荷テスト |
| | スループット | 100 RPS | CloudWatch Metrics |
| **データベース** | 接続数 | < 50（RDS Proxy経由） | Aurora Metrics |
| | クエリ実行時間 P95 | < 50ms | pg_stat_statements |
| **キャッシュ** | Redis ヒット率 | > 90% | CloudWatch Metrics |

---

### 9.2 ビジネスKPI

| カテゴリ | メトリクス | 目標値 |
|---------|----------|--------|
| **移行品質** | ダウンタイム | 0秒 |
| | データ損失 | 0件 |
| | ユーザー影響 | 0件 |
| **コスト** | 月額運用コスト | $220-390範囲内 |
| | 予算超過率 | 0% |
| **運用効率** | デプロイ頻度 | 週1回以上 |
| | デプロイ所要時間 | < 15分 |
| | 手動作業時間 | 現行比 -50% |

---

### 9.3 モニタリングダッシュボード

**CloudWatch Dashboard構成（本番用）:**

```
┌─────────────────────────────────────────────────────────┐
│ FBT v2 Production - Real-time Dashboard               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [SLA]                                                   │
│ ├─ Uptime (30日): 99.95% ──────────────── ✅           │
│ ├─ エラー率: 0.02% ────────────────────── ✅           │
│ └─ レイテンシ P95: 285ms ──────────────── ✅           │
│                                                         │
│ [ECS Fargate]                                           │
│ ├─ タスク数: 3 ─────────────── [■■■□□□□□□□]           │
│ ├─ CPU使用率: 45% ──────────── [■■■■■□□□□□]           │
│ ├─ メモリ使用率: 62% ────────── [■■■■■■□□□□]           │
│ └─ ネットワーク: 2.5 Mbps                               │
│                                                         │
│ [Aurora PostgreSQL]                                     │
│ ├─ Writer CPU: 28% ─────────── [■■■□□□□□□□]           │
│ ├─ Reader CPU: 15% ─────────── [■■□□□□□□□□]           │
│ ├─ 接続数: 23 ─────────────────  [■■■□□□□□□□]           │
│ ├─ ACU: 1.2 / 2.0                                       │
│ └─ レプリケーションラグ: 15ms                            │
│                                                         │
│ [ElastiCache Redis]                                     │
│ ├─ CPU: 18% ───────────────────  [■■□□□□□□□□]           │
│ ├─ メモリ: 45% ────────────────  [■■■■■□□□□□]           │
│ ├─ ヒット率: 92% ───────────────  [■■■■■■■■■□]           │
│ └─ コマンド数: 1.2K/s                                    │
│                                                         │
│ [ALB]                                                   │
│ ├─ リクエスト: 850/min                                  │
│ ├─ レイテンシ P95: 285ms ───────  [■■■□□□□□□□]           │
│ ├─ 5xxエラー: 2/hour (0.02%)                            │
│ └─ ヘルシーターゲット: 3 / 3 ─── ✅                      │
│                                                         │
│ [Cost]                                                  │
│ ├─ 今月累計: $287 / $400 (予算) [■■■■■■■□□□]           │
│ ├─ 前月比: -5%                                          │
│ └─ 予測月額: $355                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎓 第10章: まとめ

### 10.1 最終推奨事項

**最適解: ECS Fargate フルスタック構成**

```
理由:
1. Next.js 14の実装（107本API + Socket.io）に技術的に適合
2. Amplifyは物理的に不可能（カスタムサーバー非対応）
3. AWS Well-Architected 6つの柱に完全準拠
4. 月額$220-390で高可用性・高パフォーマンス実現
5. 5週間で移行完了可能
```

---

### 10.2 他の選択肢を採用しない理由（再確認）

| 選択肢 | 評価 | 理由 |
|-------|------|------|
| **Amplify Hosting** | ❌ 不可能 | WebSocket非対応、カスタムサーバー非対応、重処理に不向き |
| **App Runner** | △ 次点 | WebSocket制約あり、ECSより柔軟性低い |
| **Lambda** | ❌ 不適合 | 実行時間制限、Prisma接続問題、コールドスタート |
| **EC2** | △ 可能だが非推奨 | 運用負荷大、スケーリング手動、コスト高 |

---

### 10.3 今後の拡張性

**将来のスケール戦略:**

```
フェーズ1（初期）: 現在の提案
├─ DAU 100人
├─ ECS 2-4タスク
├─ Aurora 0.5-2 ACU
└─ コスト: $220-390/月

フェーズ2（成長）: DAU 500人
├─ ECS 4-8タスク
├─ Aurora 1-4 ACU
├─ Redis cache.t4g.small（メモリ増強）
└─ コスト: $600-800/月

フェーズ3（拡大）: DAU 1000人
├─ ECS 8-16タスク
├─ Aurora 2-8 ACU
├─ Redis cache.r6g.large（クラスタ化）
├─ API分離（App Runner / Lambda併用検討）
└─ コスト: $1200-1500/月

フェーズ4（スケール）: DAU 5000人+
├─ ECS Auto Scaling（最大100タスク）
├─ Aurora Provisioned（固定インスタンス）
├─ Redis Cluster Mode Enabled
├─ CloudFront エッジ関数
├─ DynamoDB導入（セッション専用）
└─ コスト: $3000-5000/月
```

---

### 10.4 次のアクション

**即座に実施すべきこと（承認不要）:**

1. **Prisma接続の集約化**（2時間）
   - `lib/database.ts` 作成
   - 全107本のAPIで import に変更

2. **ローカル環境でのDocker検証**（半日）
   - Dockerfile作成
   - イメージサイズ確認
   - 起動テスト

3. **AWS CDKプロジェクト初期化**（1日）
   - TypeScriptプロジェクト作成
   - VPC/Subnetスタック定義

---

**承認が必要なこと:**

1. **予算承認**: 月額$220-390（¥33,000-58,500）
2. **移行スケジュール**: 5週間のリソース確保
3. **本番移行日時**: メンテナンス通知とチーム待機

---

**チーム体制:**

| 役割 | 工数 | 責任範囲 |
|-----|------|---------|
| **プロジェクトマネージャー** | 全期間 | スケジュール管理、調整 |
| **インフラエンジニア** | 3週間 | AWS構築、CDK実装 |
| **アプリケーションエンジニア** | 2週間 | コード修正、テスト |
| **QAエンジニア** | 1週間 | E2E/負荷/セキュリティテスト |
| **SRE** | 移行後1ヶ月 | 本番監視、インシデント対応 |

---

## 🔚 結論

**技術的必然性:**
- Next.js 14 + 107本API + 重処理（Sharp/Puppeteer）という構成は、ECS Fargateが最適
- RDS Proxyは、Prisma接続プーリングのために必須
- Aurora MySQL Serverless v2は、コスト効率と性能のバランスで最適
- フェーズ1ではRedis不要（Socket.io未実装のため）

**ビジネス価値:**
- 月額¥49,200（通常時）で99.9%可用性（Multi-AZ）
- 4.5週間で移行完了（Redis構築省略で短縮）
- ダウンタイムゼロ
- 将来のスケール・Socket.io追加に対応可能

---
