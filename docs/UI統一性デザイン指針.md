# UI/UX統一性デザイン指針

## 概要
FBT-v1アプリケーションにおけるUI/UX統一性を確保するためのデザイン指針と実装ガイドライン

## 🎯 統一性の原則

### 1. コンポーネント優先原則
- **CSS クラス直接使用 → React コンポーネント使用**
- 再利用性と保守性を重視
- TypeScript による型安全性確保

### 2. レスポンシブファースト
- モバイル・タブレット・デスクトップ対応
- タッチターゲット最小44px
- 適切な余白とフォントサイズ

### 3. アクセシビリティ準拠
- ARIA属性の適切な使用
- キーボードナビゲーション対応
- 色覚障害者への配慮

## 📋 統一ルール

### ページヘッダー
```tsx
// ✅ 正しい実装
<PageHeader
  title="ページタイトル"
  subtitle="サブタイトル（任意）"
  icon={<IconComponent />}
  actions={<>アクションボタン</>}
  region="global" // americas, europe, asia, africa, oceania
/>

// ❌ 避けるべき実装
<div className="intelligence-card global">
  <div className="p-8">
    <h1>ページタイトル</h1>
  </div>
</div>
```

### ボタンコンポーネント
```tsx
// ✅ 正しい実装
<NexusButton
  variant="primary" // default, primary, secondary, danger
  size="md" // sm, md, lg
  onClick={handleClick}
  icon={<IconComponent />}
>
  ボタンテキスト
</NexusButton>

// ❌ 避けるべき実装
<button className="nexus-button primary">
  ボタンテキスト
</button>
```

### カードコンポーネント
```tsx
// ✅ 正しい実装
<NexusCard
  region="global" // americas, europe, asia, africa, oceania
  title="カードタイトル"
  subtitle="サブタイトル"
  gradient={true}
>
  <div>カードコンテンツ</div>
</NexusCard>

// ❌ 避けるべき実装
<div className="intelligence-card global">
  <div className="p-6">
    <h3>カードタイトル</h3>
    <div>カードコンテンツ</div>
  </div>
</div>
```

### モーダルコンポーネント
```tsx
// ✅ 正しい実装
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  title="モーダルタイトル"
  size="md" // sm, md, lg, xl, full
>
  <div className="p-6">
    モーダルコンテンツ
  </div>
</BaseModal>

// ❌ 避けるべき実装
<div className="fixed inset-0 bg-gray-500 bg-opacity-30 z-50">
  <div className="bg-white p-6 rounded-2xl">
    独自モーダル実装
  </div>
</div>
```

## 🎨 カラーパレット

### 地域別カラーリング
- **Global**: `#7B1FA2` (Purple)
- **Americas**: `#0064D2` (Blue)
- **Europe**: `#E53238` (Red)
- **Asia**: `#FFCE00` (Yellow)
- **Africa**: `#86B817` (Green)
- **Oceania**: `#00BCD4` (Cyan)

### ステータスカラー
- **Success**: `#86B817`
- **Warning**: `#FFCE00`
- **Error**: `#E53238`
- **Info**: `#00BCD4`

### ニュートラルカラー
- **Primary Text**: `#1A1A1A`
- **Secondary Text**: `#666666`
- **Muted Text**: `#999999`
- **Background**: `#F8FAFE`
- **Surface**: `rgba(255, 255, 255, 0.97)`

## 📱 レスポンシブ対応

### ブレークポイント
- **Mobile**: `< 768px`
- **Tablet**: `768px - 1024px`
- **Laptop**: `1024px - 1440px`
- **Desktop**: `> 1440px`

### タッチターゲット
- **最小サイズ**: 44px × 44px
- **推奨サイズ**: 48px × 48px
- **間隔**: 8px以上

### フォントサイズ
- **Mobile**: 基本14px、見出し16px
- **Tablet**: 基本15px、見出し18px
- **Desktop**: 基本16px、見出し20px

## 🔧 実装チェックリスト

### ページレベル
- [ ] PageHeaderコンポーネント使用
- [ ] NexusButtonコンポーネント使用
- [ ] NexusCardコンポーネント使用
- [ ] BaseModalコンポーネント使用
- [ ] レスポンシブ対応完了
- [ ] アクセシビリティ対応完了

### コンポーネントレベル
- [ ] TypeScript型定義
- [ ] props validation
- [ ] デフォルト値設定
- [ ] エラーハンドリング
- [ ] ローディング状態対応

### スタイリングレベル
- [ ] 地域別カラーリング適用
- [ ] ホバーエフェクト実装
- [ ] トランジション効果
- [ ] シャドウ効果
- [ ] グラデーション効果

## 🚀 移行計画

### Phase 1: コアコンポーネント統一
1. 全ページでPageHeaderコンポーネント使用
2. ボタンをNexusButtonに統一
3. カードをNexusCardに統一
4. モーダルをBaseModalに統一

### Phase 2: 詳細調整
1. レスポンシブ対応の完全実装
2. アクセシビリティ改善
3. アニメーション効果統一
4. エラーハンドリング統一

### Phase 3: 品質保証
1. E2Eテスト実装
2. ユーザビリティテスト
3. パフォーマンス最適化
4. ドキュメント整備

## 📊 品質指標

### 統一性指標
- コンポーネント使用率: 95%以上
- CSS直接使用率: 5%以下
- レスポンシブ対応率: 100%
- アクセシビリティスコア: A級

### パフォーマンス指標
- ページ読み込み時間: 2秒以下
- インタラクション遅延: 100ms以下
- CLS (Cumulative Layout Shift): 0.1以下
- FCP (First Contentful Paint): 1.5秒以下

## 🔍 検証方法

### 自動検証
```bash
# ESLint + Prettier
npm run lint

# TypeScript型チェック
npm run type-check

# E2Eテスト
npm run test:e2e

# アクセシビリティテスト
npm run test:a11y
```

### 手動検証
1. 各ブレークポイントでのレイアウト確認
2. タッチデバイスでの操作確認
3. キーボードナビゲーション確認
4. スクリーンリーダー対応確認

## 📚 参考資料

- [Material Design Guidelines](https://material.io/design)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Component Design Patterns](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/best-practices)

---

**最終更新**: 2025年10月3日
**バージョン**: 2.0.0
**責任者**: Development Team

## 📝 重要な変更点（v2.0）

### 実装状況の反映
- 現在、本プロジェクトではNexusデザインシステムは**部分的に実装**されています
- カスタムコンポーネントは `app/components/` に配置されています
- Tailwind CSSを直接使用する箇所も多く存在します

### 実際の実装パターン
```tsx
// 現在の主な実装パターン
import { Button } from '@/app/components/ui/Button';

// Tailwind CSS直接使用も許容されています
<div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-xl font-bold mb-4">タイトル</h2>
  <Button variant="primary">アクション</Button>
</div>
```

### 移行中の状態
このドキュメントは理想的なデザインガイドラインを示していますが、実際の実装は段階的に移行中です。新規機能開発時は可能な限りこのガイドラインに従うことを推奨します。 