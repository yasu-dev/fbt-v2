# The World Door - Fulfillment Business Terminal (FBT v2)

**最終更新日**: 2025年10月5日  
**現在の状況**: 開発環境完成、本番移行準備段階

高級中古品販売のための統合型フルフィルメント管理システム

## 📋 プロジェクト概要

The World Doorは、高級中古品（カメラ・時計等）の入荷から販売までの全プロセスを管理する統合システムです。Next.js 14（App Router）を使用したフルスタックアプリケーションとして構築されています。

## ✅ 実装完了済み機能

### 🔧 コア機能
- **商品管理**: 入荷 → 検品 → 保管 → 出品 → 受注 → ピッキング → 梱包 → ラベル貼付 → 出荷 → 配送までの完全なライフサイクル管理
- **在庫管理**: バーコードスキャンによるロケーション管理（Zone-Row-Shelf形式）
- **階層的検品システム**: カテゴリ別検品チェックリスト、画像・動画記録機能
- **アクティビティログ**: 全操作履歴の記録・追跡
- **リアルタイム通知**: Socket.ioによるステータス変更通知、メール通知

### 🔐 認証・セキュリティ
- **JWT認証システム**: bcryptjsによるパスワードハッシュ化
- **2要素認証**: メールベースの確認コードによるセキュアログイン
- **ロールベースアクセス制御**: seller/staff/admin権限管理

### 📊 管理・分析機能
- **KPIダッシュボード**: リアルタイムの業績表示
- **レポート生成**: PDF帳票、CSV出力対応
- **機能フラグ管理**: 段階的機能展開対応

### 🤖 AI・自動化機能
- **AI品質検査**: 商品画像の自動品質判定
- **バーコード自動生成**: 商品・ロケーション管理用

## 🔄 部分実装・準備中機能

### 📦 外部連携
- **eBay連携**: 基本実装済み、実API連携は準備中
- **FedX配送連携**: モック実装済み、実API連携は準備中
- **出品・販売管理**: テンプレート管理システム実装済み
- **配送・物流管理**: 納品プラン作成、複数配送業者対応準備済み

### 🔔 通知システム
- **基本通知機能**: API・UI実装済み
- **SSE連携**: 準備中（リアルタイム通知強化）

## 🏗️ API エンドポイント

現在**107個のAPIエンドポイント**が実装済み：
- アクティビティログ管理
- AI品質検査
- 分析・統計
- 認証システム
- バーコード処理
- 納品プラン管理
- eBay連携（基本機能）
- 階層的検品システム
- 画像処理・アップロード
- 在庫・ロケーション管理
- 通知システム
- レポート生成
- 配送管理
- その他各種管理機能

## 技術スタック

- **フレームワーク**: Next.js 14.2.5 (App Router)
- **言語**: TypeScript 5
- **スタイリング**: Tailwind CSS 3.4.1
- **データベース**: Prisma 5.7.0 + SQLite (開発環境)
- **認証**: JWT + bcryptjs
- **テスト**: Playwright 1.54.2, Jest 29.7.0
- **リアルタイム通信**: Socket.io 4.7.5
- **ファイルストレージ**: AWS S3 (@aws-sdk/client-s3 3.500.0)
- **メール送信**: SendGrid (@sendgrid/mail 8.1.3)
- **画像処理**: Sharp 0.34.4, Jimp 1.6.0, html2canvas 1.4.1
- **PDF生成**: jsPDF 3.0.1, PDFKit 0.17.1, pdfmake 0.2.20
- **動画処理**: fluent-ffmpeg 2.1.3, Puppeteer 24.12.0

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の変数を設定:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="your-nextauth-secret"
AWS_REGION="ap-northeast-1"
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
S3_BUCKET_NAME="your-bucket-name"
```

### 3. データベースのセットアップ

```bash
# Prismaクライアントの生成
npm run db:generate

# データベーススキーマの適用
npm run db:push

# 初期データの投入
npm run db:seed
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは http://localhost:3002 で起動します。

## 主要なスクリプト

```bash
npm run dev          # 開発サーバー起動 (ポート3002)
npm run build        # プロダクションビルド
npm run start        # プロダクションサーバー起動
npm run test         # E2Eテスト実行
npm run test:unit    # ユニットテスト実行
npm run db:studio    # Prisma Studio起動
```

## ディレクトリ構成

```
.
├── app/                      # Next.js App Router
│   ├── api/                 # API Routes (107エンドポイント)
│   │   ├── activities/      # アクティビティログAPI
│   │   ├── ai/              # AI機能（品質検査）
│   │   ├── analytics/       # 分析・統計API
│   │   ├── auth/            # 認証API
│   │   ├── barcode/         # バーコード処理
│   │   ├── dashboard/       # ダッシュボードデータ
│   │   ├── delivery-plan/   # 納品プラン管理
│   │   ├── delivery-warehouses/ # 配送倉庫管理
│   │   ├── ebay/            # eBay連携
│   │   ├── feature-flags/   # 機能フラグ管理
│   │   ├── hierarchical-inspection/ # 階層的検品
│   │   ├── images/          # 画像処理・アップロード
│   │   ├── inspection/      # 検品API
│   │   ├── inventory/       # 在庫管理
│   │   ├── listing/         # 出品管理
│   │   ├── location/        # ロケーション管理
│   │   ├── master/          # マスタデータ
│   │   ├── notifications/   # 通知システム
│   │   ├── orders/          # 受注管理
│   │   ├── pdf/             # PDF生成
│   │   ├── picking/         # ピッキング処理
│   │   ├── product/         # 商品管理
│   │   ├── products/        # 商品一覧
│   │   ├── reports/         # レポート生成
│   │   ├── returns/         # 返品処理
│   │   ├── sales/           # 販売管理
│   │   ├── seller/          # セラーAPI
│   │   ├── shipping/        # 配送管理
│   │   ├── staff/           # スタッフ管理
│   │   ├── storage/         # ストレージ管理
│   │   ├── tasks/           # タスク管理
│   │   ├── user/            # ユーザー管理
│   │   └── videos/          # 動画記録
│   ├── billing/             # 請求管理ページ
│   ├── dashboard/           # ダッシュボード
│   ├── delivery/            # 配送管理ページ
│   ├── delivery-plan/       # 納品プラン
│   ├── inventory/           # 在庫管理
│   ├── login/               # ログインページ
│   ├── privacy-policy/      # プライバシーポリシー
│   ├── profile/             # プロフィール
│   ├── reports/             # レポート
│   ├── returns/             # 返品管理
│   ├── sales/               # 販売管理
│   ├── settings/            # 設定
│   ├── staff/               # スタッフ用ページ
│   │   ├── dashboard/       # スタッフダッシュボード
│   │   ├── inspection/      # 検品画面
│   │   ├── inventory/       # スタッフ在庫管理
│   │   ├── listing/         # 出品作業
│   │   ├── location/        # ロケーション管理
│   │   ├── packaging/       # 梱包作業
│   │   ├── picking/         # ピッキング作業
│   │   ├── reports/         # スタッフレポート
│   │   ├── returns/         # 返品処理
│   │   ├── shipping/        # 発送作業
│   │   └── tasks/           # タスク一覧
│   ├── components/          # 共通コンポーネント
│   ├── globals.css          # グローバルスタイル
│   └── layout.tsx           # ルートレイアウト
├── components/              # 旧コンポーネント（段階的移行中）
├── lib/                     # ライブラリ・ユーティリティ
│   ├── hooks/               # カスタムフック
│   │   ├── useApi.ts        # API通信フック
│   │   ├── useHierarchicalChecklistFeature.ts
│   │   └── useMasterData.ts # マスタデータ取得
│   ├── repositories/        # データアクセス層
│   │   ├── base.repository.ts
│   │   └── inventory.repository.ts
│   ├── services/            # ビジネスロジック層
│   │   ├── adapters/        # 外部サービスアダプター
│   │   │   ├── ebay.adapter.ts
│   │   │   ├── email.adapter.ts
│   │   │   └── fedex.adapter.ts
│   │   ├── unified/         # 統合サービス
│   │   │   └── inventory.service.ts
│   │   ├── notification.service.ts
│   │   └── two-factor-auth.service.ts
│   ├── utils/               # 汎用ユーティリティ
│   │   ├── activity-recorder.ts
│   │   ├── category.ts
│   │   ├── inspection-checklist-storage.ts
│   │   ├── listing-eligibility.ts
│   │   ├── product-status.ts
│   │   ├── tracking.ts
│   │   └── workflow.ts
│   ├── constants/           # 定数定義
│   │   └── inspection-items.ts
│   ├── templates/           # テンプレート
│   │   └── ebay-listing-templates.ts
│   ├── activity-logger.ts   # アクティビティログ
│   ├── api-config.ts        # API設定
│   ├── auth.ts              # 認証処理
│   ├── database.ts          # データベース接続
│   ├── image-processor.ts   # 画像処理
│   └── pdf-generator.ts     # PDF生成
├── prisma/                  # データベース
│   ├── schema.prisma        # Prismaスキーマ
│   ├── seed.ts              # 初期データ投入
│   └── dev.db               # SQLite開発DB
├── public/                  # 静的ファイル
└── docs/                    # プロジェクトドキュメント
    ├── README.md
    ├── 技術スタック一覧.md
    ├── 開発作業規則.md
    └── UI統一性デザイン指針.md
```

## 📋 現在のプロジェクト状況

### ✅ 完成済み
- **基本フルフィルメント機能**: 商品管理から出荷まで
- **認証・セキュリティ**: JWT + 2要素認証システム
- **データ管理**: 36個のPrismaモデルによる包括的データ管理
- **UI**: 統一されたNexusデザインシステム
- **テスト環境**: Playwright E2Eテスト

### 🔄 進行中
- **外部API連携**: eBay、FedX実装準備完了
- **AI機能強化**: 品質検査システム
- **通知システム**: SSE実装準備中

### 📋 本番移行準備
- **インフラ**: AWS環境への移行計画策定済み
- **データベース**: PostgreSQL移行準備完了
- **監視**: Sentry/Datadog設定準備済み

詳細な移行計画は [引き継ぎメモ.md](./引き継ぎメモ.md) を参照してください。

## 📚 開発ルール

開発作業を行う際は、[開発作業規則](./開発作業規則.md)を必ず確認してください。特に以下の点が重要です：

1. **真実性の確保**: すべてのレポートは事実に基づく
2. **UIテストの必須実施**: Playwrightによる動作確認を必ず実施
3. **ドキュメント同期更新**: コード変更時のドキュメント更新必須

## テスト

### E2Eテスト

```bash
# 全テストの実行
npm run test

# 特定のテストファイルの実行
npm run test <test-file-name>

# UIモードでの実行
npx playwright test --ui
```

### ユニットテスト

```bash
# テストの実行
npm run test:unit

# ウォッチモード
npm run test:unit:watch

# カバレッジレポート
npm run test:unit:coverage
```

## ライセンス

プロプライエタリ - 無断複製・配布を禁じます
