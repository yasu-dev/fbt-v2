import { test, expect } from '@playwright/test';

test('納品プラン確認画面で「仕入詳細」に枠が表示される', async ({ page }) => {
  // ログイン（セラー）
  await page.goto('/login');
  await page.fill('input[name="email"]', 'seller@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // 納品プラン作成フローを開く
  await page.goto('/delivery-plan');

  // 1: 基本情報 -> 次へ
  await page.getByRole('button', { name: '次へ進む' }).click();

  // 2: 商品登録 - 必須最小入力
  const nameInput = page.getByTestId('product-name-input').first();
  await nameInput.waitFor({ state: 'visible', timeout: 10000 });
  await nameInput.fill('テスト商品');
  const priceInput = page.locator('input[type="number"]').first();
  await priceInput.fill('1000');

  // 「通常撮影（10枚）」を選択（必須）
  await page.getByText('通常撮影（10枚）', { exact: false }).first().click();

  // 「仕入れ詳細」に任意のテキストを入力
  const supplierDetails = 'テスト仕入れ詳細: UI枠の表示を確認します';
  await page.fill('textarea:below(label:has-text("仕入れ詳細"))', supplierDetails);

  // 次へ（確認・出力）
  await page.getByRole('button', { name: '次へ進む' }).click();

  // 「仕入詳細」枠の存在とテキスト
  const box = page.getByTestId('supplier-details-box').first();
  await expect(box).toBeVisible();
  await expect(box).toContainText('テスト仕入れ詳細');

  // 視覚的には「枠」= 背景 or 枠線の有無を簡易検証（クラス由来のstyle検証）
  const className = await box.getAttribute('class');
  expect(className).toBeTruthy();
  expect(className!).toMatch(/border/);
});


