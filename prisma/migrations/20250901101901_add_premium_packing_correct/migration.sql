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
    "photographyRequests" TEXT,
    "premiumPacking" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "delivery_plan_products_deliveryPlanId_fkey" FOREIGN KEY ("deliveryPlanId") REFERENCES "delivery_plans" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_delivery_plan_products" ("category", "createdAt", "deliveryPlanId", "description", "estimatedValue", "id", "name", "photographyRequests", "updatedAt") SELECT "category", "createdAt", "deliveryPlanId", "description", "estimatedValue", "id", "name", "photographyRequests", "updatedAt" FROM "delivery_plan_products";
DROP TABLE "delivery_plan_products";
ALTER TABLE "new_delivery_plan_products" RENAME TO "delivery_plan_products";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
