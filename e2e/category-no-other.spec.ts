import { test, expect } from '@playwright/test';

test('商品登録のカテゴリに「その他」が表示されない', async ({ page }) => {
  // ログイン（セラー）
  await page.goto('/login');
  await page.fill('input[name="email"]', 'seller@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // 納品プラン作成へ
  await page.goto('/delivery-plan');

  // 1: 基本情報 -> 次へ
  await page.getByRole('button', { name: '次へ進む' }).click();

  // 2: 商品登録 - 最小入力
  const nameInput = page.getByTestId('product-name-input').first();
  await nameInput.waitFor({ state: 'visible', timeout: 10000 });
  await nameInput.fill('テスト商品');

  // カテゴリーのドロップダウン（選択中ラベル=カメラ）を開く
  await page.getByRole('button', { name: 'カメラ' }).first().click();

  // カスタムドロップダウン（Portal）内で「その他」が存在しないこと
  const menu = page.locator('.z-\\[10002\\]');
  await expect(menu).toBeVisible();
  await expect(menu.getByText('その他')).toHaveCount(0);
});


