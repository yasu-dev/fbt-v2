/*
  Warnings:

  - You are about to drop the column `brand` on the `delivery_plan_products` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `delivery_plan_products` table. All the data in the column will be lost.
  - You are about to drop the column `serialNumber` on the `delivery_plan_products` table. All the data in the column will be lost.
  - You are about to drop the column `draftData` on the `delivery_plans` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "listing_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'JPY',
    "condition" TEXT NOT NULL,
    "shippingMethod" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "appliedCount" INTEGER NOT NULL DEFAULT 0,
    "fields" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "templateId" TEXT,
    "platform" TEXT NOT NULL,
    "listingId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "listedAt" DATETIME,
    "soldAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "listings_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "trackingNumber" TEXT,
    "carrier" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "customerName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "deadline" DATETIME,
    "value" INTEGER NOT NULL,
    "notes" TEXT,
    "pickedAt" DATETIME,
    "packedAt" DATETIME,
    "shippedAt" DATETIME,
    "deliveredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "assignedTo" TEXT,
    "estimatedTime" TEXT,
    "dueDate" DATETIME,
    "completedAt" DATETIME,
    "notes" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "kpi_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "unit" TEXT,
    "period" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "returns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "customerNote" TEXT,
    "staffNote" TEXT,
    "refundAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "processedBy" TEXT,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_delivery_plan_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deliveryPlanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "estimatedValue" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "delivery_plan_products_deliveryPlanId_fkey" FOREIGN KEY ("deliveryPlanId") REFERENCES "delivery_plans" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_delivery_plan_products" ("category", "createdAt", "deliveryPlanId", "description", "estimatedValue", "id", "name", "updatedAt") SELECT "category", "createdAt", "deliveryPlanId", "description", "estimatedValue", "id", "name", "updatedAt" FROM "delivery_plan_products";
DROP TABLE "delivery_plan_products";
ALTER TABLE "new_delivery_plan_products" RENAME TO "delivery_plan_products";
CREATE TABLE "new_delivery_plans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planNumber" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "sellerName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "notes" TEXT,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "totalValue" INTEGER NOT NULL DEFAULT 0,
    "shippingTrackingNumber" TEXT,
    "shippedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "delivery_plans_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_delivery_plans" ("contactEmail", "createdAt", "deliveryAddress", "id", "notes", "phoneNumber", "planNumber", "sellerId", "sellerName", "shippedAt", "shippingTrackingNumber", "status", "totalItems", "totalValue", "updatedAt") SELECT "contactEmail", "createdAt", "deliveryAddress", "id", "notes", "phoneNumber", "planNumber", "sellerId", "sellerName", "shippedAt", "shippingTrackingNumber", "status", "totalItems", "totalValue", "updatedAt" FROM "delivery_plans";
DROP TABLE "delivery_plans";
ALTER TABLE "new_delivery_plans" RENAME TO "delivery_plans";
CREATE UNIQUE INDEX "delivery_plans_planNumber_key" ON "delivery_plans"("planNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
