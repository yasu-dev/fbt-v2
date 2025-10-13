# システム分離性・データ源・モック挙動 徹底調査レポート (fbt-v2)

最終更新: 2025-10-05

## 結論（事実のみ）
- フロントエンドは `Next.js App Router` のクライアント/サーバー構成で、データ取得は API 経由（例: `/api/inventory`, `/api/products/[id]` ほか）で行われる。フロントから Prisma 直参照は確認できない。
- バックエンド API は多数のルートで Prisma を使用して DB にアクセスしている（例: `app/api/inventory/route.ts`、`app/api/products/[id]/route.ts`、`app/api/listing/route.ts`）。API ルート実体は 107 本（`app/api/**/*.ts`）。
- DB は Prisma の `datasource` が `sqlite` で `file:./dev.db` を指している（`prisma/schema.prisma`）。
- マスターデータ（商品ステータス/カテゴリ/商品状態等）は DB テーブル（`product_statuses`/`categories`/`product_conditions`）に保持され、API (`/api/master/...`) で提供され、フロントは `lib/hooks/useMasterData.ts` のフックで取得している。
- 認証は DB ベースのセッション（`users`/`sessions`）実装あり（`lib/auth.ts`）。ただしフォールバックの固定認証が環境変数 `ALLOW_FIXED_AUTH` で有効化可能（`app/api/auth/login/route.ts`）。
- 開発用/デモ用の挙動（認証スキップ・デモユーザー・モックレスポンス・フォールバック）が複数 API で実装されている（例: `app/api/inventory/route.ts` の認証簡略化、`app/api/returns/route.ts` の固定認証、`app/api/shipping/label/get/route.ts` のデモラベル）。
- 外部サービスは開発環境ではモックエンドポイントを使う設定（`config/environments/development.ts`、`lib/services/config.ts`）。本番設定は `production.ts` で実サービス URL/API キー参照に切り替え可能。`config/index.ts` の `getConfig()` で `NODE_ENV` により `dataSource` を `mock`/`prisma` に分岐。
- リポジトリパターン（`lib/repositories/*.ts`）と `RepositoryFactory` によりデータソースを `prisma/mock/api` で切替可能。ただし在庫 UI 実装は直接 `/api/inventory` を呼んでおり、現状この抽象化は主にサービス層（`InventoryService`）側に存在。

## データ源の実態
- ユーザー/セッション/商品/出品/在庫移動/返品 等は Prisma 経由で SQLite に保存（`prisma/schema.prisma` および各 API ルートの `prisma.<model>` 操作）。
- 商品ステータス/カテゴリ/商品状態は DB マスタ（`/api/master/*` 各ルートは Prisma で `findMany`/`create`/`update` を実装）。
- シードにより demo/test データ投入あり（`prisma/seed-with-images.ts`、`prisma/comprehensive-seed.ts`、`prisma/seed.ts`、`prisma/seed-master-data.ts`）。

### Prisma モデル一覧（36 モデル）
`prisma/schema.prisma` の `model` 定義一覧（登場順）：
- User / Session / Product / Location / InventoryMovement / Order / OrderItem / Activity / VideoRecord / TwoFactorAuth / ExternalService / BarcodeScanner / PickingTask / PickingItem / DeliveryPlan / DeliveryPlanProduct / DeliveryPlanProductImage / InspectionProgress / InspectionChecklist / Warehouse / ListingTemplate / Listing / Shipment / Task / KPIMetric / Return / ProductImage / Category / ProductStatus / ProductCondition / Carrier / WorkflowStep / SystemSetting / HierarchicalInspectionChecklist / HierarchicalInspectionResponse / Notification

各モデルの全カラムは `prisma/schema.prisma` に記載（例: `ProductImage` は `url, thumbnailUrl, filename, size, mimeType, category, description, sortOrder, createdAt, updatedAt` など）。

## フロントのハードコード/モック依存の有無
- フロントで DB データをバイパスするハードコード商品/ユーザーの直埋め込みは確認できない。
- ただし UI コンポーネント内に「API失敗時のモックフォールバック」や「デモ表示用データ」が点在（例: `app/staff/returns/page.tsx` の `mockReturnsData`、`app/components/features/location/LocationList.tsx` のモックロケーション、`app/staff/listing/page.tsx` のモックテンプレート、`app/components/modals/ListingFormModal.tsx` の `MOCK-...` ID 生成、`app/api/products/[id]/history/mock/route.ts` のモック履歴、`app/api/shipping/label/get/route.ts` のデモ PDF 返却など）。
- これらは「API失敗時や未実装機能の代替表示」であり、通常パスは API 由来の DB データ。

## 認証・認可
- ベース実装: `lib/auth.ts`（`bcryptjs` と `jwt`、`sessions` テーブル）。
- ログイン API: `app/api/auth/login/route.ts` は DB 認証を試行し、失敗時かつ `ALLOW_FIXED_AUTH==='true'` のとき限定で固定認証（メール: `seller@example.com`/`staff@example.com`/`admin@example.com` 等、PW: `password123` ほか）。
- 一部 API は「デモ環境として認証をスキップ/デモユーザー使用」の分岐あり（例: `app/api/products/[id]/route.ts`, `app/api/inventory/route.ts`, `app/api/returns/route.ts`, `app/api/products/storage/route.ts`）。

## 外部サービス連携と切替
- 開発: `config/environments/development.ts` で `services.useMock: true`、`/api/mock/...` を参照。
- 本番: `config/environments/production.ts` で `services.useMock: false`、実URLと API キー環境変数を参照。
- `lib/services/config.ts` でも `serviceConfig.useMockServices: true`（開発前提）かつ `getApiEndpoint()` でモック/実サービス切替ロジック。`config/environments/production.ts` には SendGrid/S3/Redis/Sentry/Datadog 等の本番向け設定キーが明記されている。

## システム分離（フロント/バック/DB）
- `docs/system-architecture.drawio` 上の層構成と実装が概ね一致。
- フロントエンドは API を fetch し、バックエンドは Prisma 経由で DB 操作。フロントから DB 直参照は確認されず、分離は保たれている。

## 商品ステータスフローの整合
- `docs/product-status-flow.drawio` の英語ステータスと API/DB の実装は一致（`inbound`→`inspection`→`storage`→`listing`→`ordered`→`picking/packed/label_attached/shipped/delivered`、`returned` 分岐など）。
- 実装側のマッピング: `app/api/inventory/route.ts` 等で日本語→英語のマップ実装が確認できる。出荷側は配送ワークフロー（Shipment）で管理され、`docs/product-status-flow.drawio` に注釈追加済み。

## デモ/モック/フォールバックの代表例（網羅）
- 認証スキップ・固定ユーザー代入: `app/api/inventory/route.ts`, `app/api/products/[id]/route.ts`, `app/api/products/storage/route.ts`, `app/api/returns/route.ts`
- 固定認証（ALLOW_FIXED_AUTH）: `app/api/auth/login/route.ts`, `lib/auth.ts`（固定トークン対応）
- ラベルのデモ PDF 返却: `app/api/shipping/label/get/route.ts`
- 履歴モック API: `app/api/products/[id]/history/mock/route.ts`
- eBay連携モック: `app/api/ebay/listing/route.ts`（動作はDB更新中心）、`app/api/mock/ebay/listing/route.ts`
- FedExモック生成/フォールバック: `app/api/shipping/fedx/route.ts`
- フロントのモックフォールバック/デモ表示: `app/staff/returns/page.tsx`, `app/components/features/location/LocationList.tsx`, `app/staff/listing/page.tsx`, `app/components/modals/ListingFormModal.tsx`, `app/components/SearchModal.tsx`, `app/components/modals/ShippingDetailModal.tsx`, `app/components/features/picking/PickingHistory.tsx`

## 環境切替
- `config/index.ts` と `config/environments/*` にて `dataSource` とサービス設定を切替。
- Prisma の `datasource db` は `sqlite` 固定だが、本番 `production.ts` は `database.provider: 'postgresql'` を想定（現行 Prisma スキーマは sqlite 指定）。本番で Postgres を使うには `schema.prisma`/`DATABASE_URL` 切替が別途必要（コード上の事実: production 設定は Postgres を前提、schema は sqlite 指定）。`package.json` の `scripts.dev` は `next dev -p 3002` を指定（e2e は `3001`）。

## 例外条件（外部連携未実装）
- eBay/FedEx 等は開発・モック想定で、`services.useMock` によりモック経路を使用。実装は未完了部分あり（API アダプター準備中の記述やモック応答の存在）。

## リスク/注意点（事実ベース）
- `ALLOW_FIXED_AUTH` による固定認証が有効な場合、テスト用メール/PWでログイン可能。
- 複数 API で「デモ環境」分岐があり、認証やデータ取得を簡略化しているため、本番運用時には適切なガードが必要。
- 一部 API で `new PrismaClient()` の個別生成が多用されており、`lib/database.ts` の共有インスタンスを未使用（SQLite ロックや接続数の観点で注意が必要）。API ファイル例: `app/api/.../route.ts` 多数が `const prisma = new PrismaClient()` を宣言。
- 本番設定は Postgres だが、`schema.prisma` は sqlite 指定のまま。実 DB 切替には移行対応が必要。

## 参考コード（該当ファイル抜粋）

```1:20:prisma/schema.prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

```1:60:app/api/inventory/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
...
// 認証チェック - デモ環境では簡素化
...
const [products, totalCount] = await Promise.all([
  prisma.product.findMany({ ... }),
  prisma.product.count({ where })
]);
```

```1:40:app/api/auth/login/route.ts
// フォールバック: 固定認証（環境フラグで制御）
const allowFixed = process.env.ALLOW_FIXED_AUTH === 'true';
const allowedEmails = ['seller@example.com', 'staff@example.com', 'admin@example.com', 'seller@test.com', 'staff@test.com'];
const allowedPasswords = ['password123', 'password'];
```

```1:23:app/api/products/[id]/route.ts
// デモ環境: 認証をスキップしてデモユーザーを使用
const user = { id: 'demo-seller', username: 'デモセラー', role: 'seller' };
// Prisma 検索と deliveryPlanInfo 付与処理あり
```

```1:40:app/api/shipping/label/get/route.ts
// フォールバックShipmentは見つかったがラベルが無い場合、デモラベルを返す
return NextResponse.json({ url: "/labels/bundle_undefined_1757591226945.pdf", isDemo: true, ... });
```

```1:40:lib/services/config.ts
export const serviceConfig = { useMockServices: true, ebay: { apiUrl: '/api/ebay/mock', ... }, ... }
export const getApiEndpoint = (service, endpoint) => serviceConfig.useMockServices ? `/api/mock/${service}${endpoint}` : ...
```

```1:40:lib/hooks/useMasterData.ts
// 商品ステータス取得
const response = await fetch(`/api/master/product-statuses?${params}`);
```

```1:30:config/environments/development.ts
export const developmentConfig = {
  dataSource: 'mock' as const,
  services: { useMock: true, ebay: { apiUrl: '/api/mock/ebay' }, ... }
}
```

```1:30:config/environments/production.ts
export const productionConfig = {
  dataSource: 'prisma' as const,
  database: { provider: 'postgresql', url: process.env.DATABASE_URL! },
  services: { useMock: false, ebay: { apiUrl: 'https://api.ebay.com', ... } }
}
```

```1:30:lib/repositories/inventory.repository.ts
// RepositoryFactory を用いたデータソース切替 (prisma/mock/api)
export const inventoryRepository = RepositoryFactory.create<InventoryItem>(
  'inventory', PrismaInventoryRepository, MockInventoryRepository, ApiInventoryRepository
);
```

