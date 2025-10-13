-- AlterTable
ALTER TABLE "delivery_plans" ADD COLUMN "draftData" TEXT;
ALTER TABLE "delivery_plans" ADD COLUMN "shippedAt" DATETIME;
ALTER TABLE "delivery_plans" ADD COLUMN "shippingTrackingNumber" TEXT;

-- CreateTable
CREATE TABLE "delivery_plan_product_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deliveryPlanProductId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "filename" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "delivery_plan_product_images_deliveryPlanProductId_fkey" FOREIGN KEY ("deliveryPlanProductId") REFERENCES "delivery_plan_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
