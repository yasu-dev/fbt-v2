/*
  Warnings:

  - You are about to drop the `activities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `barcode_scanners` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `carriers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `delivery_plan_product_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `delivery_plans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `external_services` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inspection_checklists` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inspection_progress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inventory_movements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `kpi_metrics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `listing_templates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `listings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `locations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `picking_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `picking_tasks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_conditions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_statuses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `returns` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shipments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `system_settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tasks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `two_factor_auth` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `video_records` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `warehouses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workflow_steps` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `deliveryPlanId` on the `delivery_plan_products` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `delivery_plan_products` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedValue` on the `delivery_plan_products` table. All the data in the column will be lost.
  - You are about to drop the column `condition` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `currentLocationId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `entryDate` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `inspectedAt` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `inspectedBy` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `inspectionNotes` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `sellerId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `notificationSettings` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "carriers_key_key";

-- DropIndex
DROP INDEX "categories_key_key";

-- DropIndex
DROP INDEX "delivery_plans_planNumber_key";

-- DropIndex
DROP INDEX "inspection_checklists_deliveryPlanProductId_key";

-- DropIndex
DROP INDEX "inspection_checklists_productId_key";

-- DropIndex
DROP INDEX "inspection_progress_productId_key";

-- DropIndex
DROP INDEX "locations_code_key";

-- DropIndex
DROP INDEX "orders_orderNumber_key";

-- DropIndex
DROP INDEX "picking_tasks_orderId_key";

-- DropIndex
DROP INDEX "product_conditions_key_key";

-- DropIndex
DROP INDEX "product_statuses_key_key";

-- DropIndex
DROP INDEX "sessions_token_key";

-- DropIndex
DROP INDEX "system_settings_key_key";

-- DropIndex
DROP INDEX "workflow_steps_workflowType_key_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "activities";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "barcode_scanners";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "carriers";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "categories";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "delivery_plan_product_images";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "delivery_plans";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "external_services";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "inspection_checklists";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "inspection_progress";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "inventory_movements";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "kpi_metrics";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "listing_templates";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "listings";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "locations";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "order_items";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "orders";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "picking_items";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "picking_tasks";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "product_conditions";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "product_images";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "product_statuses";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "returns";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "sessions";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "shipments";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "system_settings";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "tasks";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "two_factor_auth";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "video_records";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "warehouses";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "workflow_steps";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "hierarchical_inspection_checklists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT,
    "deliveryPlanProductId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedBy" TEXT,
    "verifiedAt" DATETIME,
    "updatedBy" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "notes" TEXT,
    CONSTRAINT "hierarchical_inspection_checklists_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "hierarchical_inspection_checklists_deliveryPlanProductId_fkey" FOREIGN KEY ("deliveryPlanProductId") REFERENCES "delivery_plan_products" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "hierarchical_inspection_checklists_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "hierarchical_inspection_responses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checklistId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "booleanValue" BOOLEAN,
    "textValue" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hierarchical_inspection_responses_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "hierarchical_inspection_checklists" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_delivery_plan_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_delivery_plan_products" ("category", "createdAt", "id", "name", "updatedAt") SELECT "category", "createdAt", "id", "name", "updatedAt" FROM "delivery_plan_products";
DROP TABLE "delivery_plan_products";
ALTER TABLE "new_delivery_plan_products" RENAME TO "delivery_plan_products";
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'inbound',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_products" ("category", "createdAt", "id", "name", "sku", "status", "updatedAt") SELECT "category", "createdAt", "id", "name", "sku", "status", "updatedAt" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'seller',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("createdAt", "email", "fullName", "id", "role", "updatedAt", "username") SELECT "createdAt", "email", "fullName", "id", "role", "updatedAt", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "hierarchical_inspection_checklists_productId_key" ON "hierarchical_inspection_checklists"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "hierarchical_inspection_checklists_deliveryPlanProductId_key" ON "hierarchical_inspection_checklists"("deliveryPlanProductId");

-- CreateIndex
CREATE UNIQUE INDEX "hierarchical_inspection_responses_checklistId_categoryId_itemId_key" ON "hierarchical_inspection_responses"("checklistId", "categoryId", "itemId");
