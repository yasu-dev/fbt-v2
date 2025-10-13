import { test, expect } from '@playwright/test';

test.describe('セラー販売管理：出荷準備中ステータスのラベルボタン非表示', () => {
  test.beforeEach(async ({ page }) => {
    // セラーでログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    // 成功後のリダイレクトは環境で異なるため、目的ページへ直接遷移
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
  });

  test('出荷準備中ステータスの商品でラベルボタンが表示されない', async ({ page }) => {
    console.log('🧪 セラー販売管理：出荷準備中商品のラベルボタン非表示テスト開始');
    
    // 出荷準備中商品を探す
    const processingProducts = page.locator('tr').filter({ 
      has: page.locator('[data-status="processing"], .status-badge:has-text("出荷準備中")') 
    });
    
    const processingCount = await processingProducts.count();
    console.log('出荷準備中商品数:', processingCount);
    
    if (processingCount > 0) {
      // 最初の出荷準備中商品の行を取得
      const firstProcessingRow = processingProducts.first();
      
      // 操作列でラベルボタンが表示されないことを確認
      const labelButton = firstProcessingRow.locator('button:has-text("ラベル")');
      await expect(labelButton).not.toBeVisible();
      
      // 詳細ボタンは表示されることを確認（他のボタンは正常に動作）
      const detailButton = firstProcessingRow.locator('button:has-text("詳細")');
      await expect(detailButton).toBeVisible();
      
      console.log('✅ 出荷準備中商品でラベルボタンが正しく非表示になっている');
    } else {
      console.log('出荷準備中商品がありません。データを確認してください。');
      test.skip();
    }
  });

  test('梱包済み商品ではラベルボタンが表示される（回帰テスト）', async ({ page }) => {
    console.log('🧪 回帰テスト：梱包済み商品のラベルボタン表示確認');
    
    // 梱包済み商品を探す
    const packedProducts = page.locator('tr').filter({ 
      has: page.locator('[data-status="packed"], .status-badge:has-text("梱包済み")') 
    });
    
    const packedCount = await packedProducts.count();
    console.log('梱包済み商品数:', packedCount);
    
    if (packedCount > 0) {
      // 最初の梱包済み商品の行を取得
      const firstPackedRow = packedProducts.first();
      
      // 操作列でラベルボタンが表示されることを確認
      const labelButton = firstPackedRow.locator('button:has-text("ラベル")');
      await expect(labelButton).toBeVisible();
      
      console.log('✅ 梱包済み商品でラベルボタンが正しく表示されている');
    } else {
      console.log('梱包済み商品がありません。テストをスキップします。');
      test.skip();
    }
  });

  test('完了済み商品ではラベルボタンが表示される（回帰テスト）', async ({ page }) => {
    console.log('🧪 回帰テスト：完了済み商品のラベルボタン表示確認');
    
    // 完了済み商品を探す
    const completedProducts = page.locator('tr').filter({ 
      has: page.locator('[data-status="completed"], .status-badge:has-text("完了")') 
    });
    
    const completedCount = await completedProducts.count();
    console.log('完了済み商品数:', completedCount);
    
    if (completedCount > 0) {
      // 最初の完了済み商品の行を取得
      const firstCompletedRow = completedProducts.first();
      
      // 操作列でラベルボタンが表示されることを確認
      const labelButton = firstCompletedRow.locator('button:has-text("ラベル")');
      await expect(labelButton).toBeVisible();
      
      console.log('✅ 完了済み商品でラベルボタンが正しく表示されている');
    } else {
      console.log('完了済み商品がありません。テストをスキップします。');
      test.skip();
    }
  });

  test('ステータス別ラベルボタン表示パターン確認', async ({ page }) => {
    console.log('🧪 統合テスト：すべてのステータスでのラベルボタン表示パターン確認');
    
    // すべての商品行を取得
    const allRows = page.locator('tbody tr');
    const rowCount = await allRows.count();
    console.log('総商品数:', rowCount);
    
    if (rowCount > 0) {
      for (let i = 0; i < Math.min(rowCount, 5); i++) { // 最初の5件をテスト
        const row = allRows.nth(i);
        
        // ステータスを取得
        const statusElement = row.locator('.status-badge, [data-status]');
        const statusText = await statusElement.textContent() || '';
        
        // ラベルボタンの存在を確認
        const labelButton = row.locator('button:has-text("ラベル")');
        const isLabelVisible = await labelButton.isVisible();
        
        console.log(`Row ${i + 1}: Status="${statusText}", Label Button Visible=${isLabelVisible}`);
        
        // ステータスに応じた表示/非表示の検証
        if (statusText.includes('出荷準備中') || statusText.includes('processing')) {
          await expect(labelButton).not.toBeVisible();
          console.log(`✅ 出荷準備中商品でラベルボタンが非表示: Row ${i + 1}`);
        } else if (statusText.includes('梱包済み') || statusText.includes('完了') || statusText.includes('packed') || statusText.includes('completed')) {
          await expect(labelButton).toBeVisible();
          console.log(`✅ ${statusText}商品でラベルボタンが表示: Row ${i + 1}`);
        }
      }
    } else {
      console.log('商品がありません。データを確認してください。');
      test.skip();
    }
  });
});

// ドキュメントの存在検証（引き継ぎ資料の嘘検知対策）
test('docs/index.html が表示できる', async ({ page }) => {
  await page.goto('/docs/index.html');
  await expect(page.locator('header h1, h1')).toContainText('THE WORLD DOOR');
  await expect(page.locator('text=プロジェクト概要')).toBeVisible();
});












