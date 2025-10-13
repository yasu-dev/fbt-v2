# Next.js フルスタックアプリ開発フロー

**最終更新日**: 2025年10月3日

本プロジェクトは Next.js 14 App Router を使用したフルスタックアプリケーションとして開発されています。

## 開発アーキテクチャ

- **フレームワーク**: Next.js 14.2.5 (App Router)
- **言語**: TypeScript 5
- **データベース**: Prisma 5.7.0 + SQLite (開発)
- **認証**: カスタムJWT認証 + 2要素認証（メールベース）
- **スタイリング**: Tailwind CSS 3.4.1
- **テスト**: Playwright 1.54.2 (E2E) + Jest 29.7.0 (ユニット)

## 開発フロー

### 1. 要件分析・設計フェーズ

#### 1.1 要件定義の更新
- `docs/要件定義書.md` の内容を最新の実装状況に合わせて更新
- 新機能や変更要件を文書化

#### 1.2 技術仕様の確認
- `docs/技術スタック一覧.md` で使用技術とバージョンを確認
- 新しい依存関係や技術変更を検討

#### 1.3 環境設定の確認
- `docs/環境切り替え対応.md` で開発・本番環境の差異を確認
- 必要に応じて環境変数や設定を更新

### 2. 開発環境セットアップ

```bash
# 1. 依存関係のインストール
npm install

# 2. 環境変数の設定
cp .env.example .env.local
# .env.localを編集して開発用設定を適用

# 3. データベースのセットアップ
npm run db:generate  # Prismaクライアント生成
npm run db:push      # スキーマ適用
npm run db:seed      # 初期データ投入

# 4. 開発サーバー起動
npm run dev  # http://localhost:3002で起動
```

### 3. 機能開発フェーズ

#### 3.1 フィーチャーブランチ作成
```bash
git checkout -b feature/機能名
```

#### 3.2 Prismaスキーマ設計（必要に応じて）
```bash
# スキーマ変更後
npm run db:push
npm run db:generate
```

#### 3.3 API Routes実装
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';

export const GET = withAuth(async (request: NextRequest) => {
  // API実装
  return NextResponse.json({ success: true });
});
```

#### 3.4 ページコンポーネント実装
```typescript
// app/example/page.tsx
export default function ExamplePage() {
  return (
    <PageWrapper>
      <PageHeader title="機能名" />
      {/* ページ内容 */}
    </PageWrapper>
  );
}
```

#### 3.5 UIコンポーネント実装
- `app/components/ui/` : 基本UIコンポーネント（Nexusデザインシステム準拠）
- `app/components/features/` : 機能固有のコンポーネント
- `app/components/modals/` : モーダルコンポーネント

#### 3.6 サービス層実装
```typescript
// lib/services/example.service.ts
export class ExampleService {
  async getData() {
    // ビジネスロジック実装
  }
}
```

### 4. テスト実装

#### 4.1 ユニットテスト
```bash
npm run test:unit        # 単発実行
npm run test:unit:watch  # ウォッチモード
npm run test:unit:coverage # カバレッジ付き
```

#### 4.2 E2Eテスト実装
```typescript
// e2e/feature-name.spec.ts
import { test, expect } from '@playwright/test';

test('機能のテスト', async ({ page }) => {
  await page.goto('/example');
  
  // UI動作テスト（必須）
  await page.click('[data-testid="example-button"]');
  await expect(page.locator('.result')).toBeVisible();
  
  // Playwrightによる実際のUI操作確認
});
```

#### 4.3 テスト実行
```bash
npm run test             # 全E2Eテスト実行
npx playwright test --ui # UIモードでのテスト実行
```

### 5. 品質管理フェーズ

#### 5.1 静的解析・リント
```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript型チェック
```

#### 5.2 UI統一性チェック
- `docs/UI統一性デザイン指針.md` に従ってデザインシステム準拠を確認
- Nexusデザインシステムのコンポーネント使用を徹底

#### 5.3 真実性確保チェック
- `docs/開発作業規則.md` の規則に従い、虚偽のないレポート作成
- 実装内容と仕様書の整合性を確認

### 6. デプロイメントフェーズ

#### 6.1 ビルド確認
```bash
npm run build  # プロダクションビルド
npm run start  # ビルド結果の動作確認
```

#### 6.2 本番環境設定
- 環境変数の本番用設定
- データベース移行（SQLite → PostgreSQL）
- 外部サービス設定（AWS S3、メール、eBay API等）

#### 6.3 デプロイ
- Vercelへの自動デプロイ（mainブランチマージ時）
- CI/CDパイプラインによる自動テスト実行

## 開発規則

### 必須ルール

1. **真実性の確保**
   - 実装内容と仕様書の不一致を放置しない
   - 動作確認結果を正確に記録する

2. **UIテストの必須実施**
   - 全てのUI変更にPlaywrightテストを作成
   - 実際のユーザー操作をテストで再現する

### 推奨プラクティス

1. **コンポーネント設計**
   - 単一責任の原則を守る
   - Nexusデザインシステムのコンポーネントを優先使用

2. **API設計**
   - RESTful APIパターンに従う
   - エラーハンドリングを適切に実装

3. **状態管理**
   - サーバー状態はuseApiフックで管理
   - クライアント状態は最小限に抑える

## プロジェクト構造

```
.
├── app/
│   ├── api/               # API Routes (40エンドポイント)
│   ├── billing/           # 請求管理
│   ├── dashboard/         # ダッシュボード
│   ├── delivery/          # 配送管理
│   ├── delivery-plan/     # 納品プラン
│   ├── inventory/         # 在庫管理
│   ├── login/             # ログイン
│   ├── profile/           # プロフィール
│   ├── reports/           # レポート
│   ├── returns/           # 返品管理
│   ├── sales/             # 販売管理
│   ├── settings/          # 設定
│   ├── staff/             # スタッフ用ページ
│   ├── components/        # 共通コンポーネント
│   └── globals.css        # グローバルスタイル
├── components/            # 旧コンポーネント（移行中）
├── lib/
│   ├── hooks/             # カスタムフック
│   ├── repositories/      # データアクセス層
│   ├── services/          # ビジネスロジック層
│   ├── utils/             # ユーティリティ
│   ├── constants/         # 定数
│   └── templates/         # テンプレート
├── prisma/                # データベーススキーマ
├── public/                # 静的ファイル
└── docs/                  # プロジェクトドキュメント
```

## 関連ドキュメント

- [開発作業規則](./開発作業規則.md) - ClaudeCode/Cursor使用時の必須ルール
- [技術スタック一覧](./技術スタック一覧.md) - 使用技術の詳細
- [環境切り替え対応](./環境切り替え対応.md) - 環境間の差異管理
- [UI統一性デザイン指針](./UI統一性デザイン指針.md) - デザインシステム規則

## トラブルシューティング

### よくある問題

1. **データベース接続エラー**
   ```bash
   npm run db:push
   npm run db:generate
   ```

2. **型エラー**
   ```bash
   npm run typecheck
   ```

3. **E2Eテスト失敗**
   - ローカルサーバーが起動していることを確認
   - テストデータが正しく投入されていることを確認

### 開発環境リセット

```bash
# データベースリセット
rm prisma/dev.db
npm run db:push
npm run db:seed

# 依存関係リセット
rm -rf node_modules package-lock.json
npm install
```

---

このフローに従って開発することで、高品質で保守性の高いフルスタックアプリケーションを構築できます。