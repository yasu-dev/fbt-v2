-- 商品履歴パフォーマンス改善用インデックス
-- 実行前にバックアップを取ることを推奨

-- 1. Activityテーブルのインデックス
-- 商品IDと作成日時の複合インデックス（最も重要）
CREATE INDEX IF NOT EXISTS idx_activities_product_created 
ON activities(productId, createdAt DESC);

-- ユーザーIDでの検索用
CREATE INDEX IF NOT EXISTS idx_activities_user_created 
ON activities(userId, createdAt DESC);

-- 注文IDでの検索用
CREATE INDEX IF NOT EXISTS idx_activities_order_created 
ON activities(orderId, createdAt DESC);

-- アクティビティタイプでの検索用
CREATE INDEX IF NOT EXISTS idx_activities_type_created 
ON activities(type, createdAt DESC);

-- 2. InventoryMovementテーブルのインデックス
-- 商品IDと作成日時の複合インデックス
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_created 
ON inventory_movements(productId, createdAt DESC);

-- 移動元・移動先ロケーション用
CREATE INDEX IF NOT EXISTS idx_inventory_movements_from_location 
ON inventory_movements(fromLocationId, createdAt DESC);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_to_location 
ON inventory_movements(toLocationId, createdAt DESC);

-- 3. OrderItemテーブルのインデックス
-- 商品IDでの検索用
CREATE INDEX IF NOT EXISTS idx_order_items_product 
ON order_items(productId);

-- 注文IDでの検索用（既存のリレーションを強化）
CREATE INDEX IF NOT EXISTS idx_order_items_order 
ON order_items(orderId);

-- 4. Listingテーブルのインデックス
-- 商品IDと作成日時の複合インデックス
CREATE INDEX IF NOT EXISTS idx_listings_product_created 
ON listings(productId, createdAt DESC);

-- ステータスと作成日時
CREATE INDEX IF NOT EXISTS idx_listings_status_created 
ON listings(status, createdAt DESC);

-- プラットフォーム別検索用
CREATE INDEX IF NOT EXISTS idx_listings_platform_created 
ON listings(platform, createdAt DESC);

-- 5. Shipmentテーブルのインデックス
-- 注文ID用（OrderとShipmentのJOIN最適化）
CREATE INDEX IF NOT EXISTS idx_shipments_order 
ON shipments(orderId);

-- ステータスと作成日時
CREATE INDEX IF NOT EXISTS idx_shipments_status_created 
ON shipments(status, createdAt DESC);

-- 配送業者と作成日時
CREATE INDEX IF NOT EXISTS idx_shipments_carrier_created 
ON shipments(carrier, createdAt DESC);

-- 6. Productテーブルの関連インデックス
-- セラーIDと作成日時（商品一覧最適化）
CREATE INDEX IF NOT EXISTS idx_products_seller_created 
ON products(sellerId, createdAt DESC);

-- ステータスと作成日時
CREATE INDEX IF NOT EXISTS idx_products_status_created 
ON products(status, createdAt DESC);

-- カテゴリと作成日時
CREATE INDEX IF NOT EXISTS idx_products_category_created 
ON products(category, createdAt DESC);

-- SKUでの検索用（UNIQUE制約があるが、検索性能向上のため）
CREATE INDEX IF NOT EXISTS idx_products_sku 
ON products(sku);

-- 7. Orderテーブルの関連インデックス
-- 顧客IDと注文日時
CREATE INDEX IF NOT EXISTS idx_orders_customer_date 
ON orders(customerId, orderDate DESC);

-- ステータスと注文日時
CREATE INDEX IF NOT EXISTS idx_orders_status_date 
ON orders(status, orderDate DESC);

-- 注文番号での検索用（UNIQUE制約があるが、検索性能向上のため）
CREATE INDEX IF NOT EXISTS idx_orders_order_number 
ON orders(orderNumber);

-- 8. Userテーブルの関連インデックス
-- ロール別検索用
CREATE INDEX IF NOT EXISTS idx_users_role_created 
ON users(role, createdAt DESC);

-- メールアドレス（UNIQUE制約があるが、ログイン性能向上のため）
CREATE INDEX IF NOT EXISTS idx_users_email 
ON users(email);

-- 9. 複合検索用の特殊インデックス
-- 商品の履歴取得で最も使用される複合インデックス
CREATE INDEX IF NOT EXISTS idx_activities_product_type_created 
ON activities(productId, type, createdAt DESC);

-- 在庫移動の範囲検索用
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_date_range 
ON inventory_movements(productId, createdAt);

-- パフォーマンステスト用インデックス状況確認クエリ
-- SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='activities';

-- インデックス使用状況確認用（EXPLAIN QUERY PLANで確認）
-- EXPLAIN QUERY PLAN 
-- SELECT * FROM activities 
-- WHERE productId = 'test-id' 
-- ORDER BY createdAt DESC 
-- LIMIT 50;