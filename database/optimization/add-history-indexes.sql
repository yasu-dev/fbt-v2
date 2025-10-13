-- 商品履歴API最適化のためのインデックス追加
-- 実行日: 2024年

-- 1. Activityテーブルの最適化
-- 商品IDで検索する際のインデックス
CREATE INDEX IF NOT EXISTS idx_activities_product_id_created_at 
ON activities(productId, createdAt DESC);

-- ユーザーIDで検索する際のインデックス
CREATE INDEX IF NOT EXISTS idx_activities_user_id_created_at 
ON activities(userId, createdAt DESC);

-- 注文IDで検索する際のインデックス
CREATE INDEX IF NOT EXISTS idx_activities_order_id_created_at 
ON activities(orderId, createdAt DESC);

-- タイプ別検索のインデックス
CREATE INDEX IF NOT EXISTS idx_activities_type_created_at 
ON activities(type, createdAt DESC);

-- 2. InventoryMovementテーブルの最適化
-- 商品IDで検索する際のインデックス
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id_created_at 
ON inventory_movements(productId, createdAt DESC);

-- ロケーション移動検索のインデックス
CREATE INDEX IF NOT EXISTS idx_inventory_movements_locations_created_at 
ON inventory_movements(fromLocationId, toLocationId, createdAt DESC);

-- 3. OrderItemテーブルの最適化
-- 商品IDで注文情報を検索するインデックス
CREATE INDEX IF NOT EXISTS idx_order_items_product_id 
ON order_items(productId);

-- 4. Orderテーブルの最適化
-- 配送日時での検索最適化
CREATE INDEX IF NOT EXISTS idx_orders_shipped_at 
ON orders(shippedAt DESC) WHERE shippedAt IS NOT NULL;

-- 配送完了日時での検索最適化
CREATE INDEX IF NOT EXISTS idx_orders_delivered_at 
ON orders(deliveredAt DESC) WHERE deliveredAt IS NOT NULL;

-- 5. Productテーブルの最適化
-- 更新日時での検索最適化（最近更新された商品の検索）
CREATE INDEX IF NOT EXISTS idx_products_updated_at 
ON products(updatedAt DESC);

-- セラーIDと更新日時の複合インデックス
CREATE INDEX IF NOT EXISTS idx_products_seller_id_updated_at 
ON products(sellerId, updatedAt DESC);

-- ステータスと更新日時の複合インデックス
CREATE INDEX IF NOT EXISTS idx_products_status_updated_at 
ON products(status, updatedAt DESC);

-- 6. 全文検索の最適化（SQLiteのFTS5を使用）
-- 商品名とSKUでの高速検索
CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
  id UNINDEXED,
  name,
  sku,
  description,
  content='products',
  content_rowid='rowid'
);

-- FTSテーブルのトリガー設定
CREATE TRIGGER IF NOT EXISTS products_fts_insert AFTER INSERT ON products BEGIN
  INSERT INTO products_fts(rowid, id, name, sku, description) 
  VALUES (new.rowid, new.id, new.name, new.sku, new.description);
END;

CREATE TRIGGER IF NOT EXISTS products_fts_delete AFTER DELETE ON products BEGIN
  INSERT INTO products_fts(products_fts, rowid, id, name, sku, description) 
  VALUES('delete', old.rowid, old.id, old.name, old.sku, old.description);
END;

CREATE TRIGGER IF NOT EXISTS products_fts_update AFTER UPDATE ON products BEGIN
  INSERT INTO products_fts(products_fts, rowid, id, name, sku, description) 
  VALUES('delete', old.rowid, old.id, old.name, old.sku, old.description);
  INSERT INTO products_fts(rowid, id, name, sku, description) 
  VALUES (new.rowid, new.id, new.name, new.sku, new.description);
END;

-- インデックス統計の更新
ANALYZE;

-- 作成されたインデックスの確認用クエリ
-- SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name IN ('activities', 'inventory_movements', 'order_items', 'orders', 'products');