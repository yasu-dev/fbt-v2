-- CreateTable
CREATE TABLE "inspection_checklists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT,
    "deliveryPlanProductId" TEXT,
    "hasScratches" BOOLEAN NOT NULL DEFAULT false,
    "hasDents" BOOLEAN NOT NULL DEFAULT false,
    "hasDiscoloration" BOOLEAN NOT NULL DEFAULT false,
    "hasDust" BOOLEAN NOT NULL DEFAULT false,
    "powerOn" BOOLEAN NOT NULL DEFAULT false,
    "allButtonsWork" BOOLEAN NOT NULL DEFAULT false,
    "screenDisplay" BOOLEAN NOT NULL DEFAULT false,
    "connectivity" BOOLEAN NOT NULL DEFAULT false,
    "lensClarity" BOOLEAN NOT NULL DEFAULT false,
    "aperture" BOOLEAN NOT NULL DEFAULT false,
    "focusAccuracy" BOOLEAN NOT NULL DEFAULT false,
    "stabilization" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedBy" TEXT,
    "verifiedAt" DATETIME,
    "updatedBy" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "notes" TEXT,
    CONSTRAINT "inspection_checklists_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "inspection_checklists_deliveryPlanProductId_fkey" FOREIGN KEY ("deliveryPlanProductId") REFERENCES "delivery_plan_products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "inspection_checklists_productId_key" ON "inspection_checklists"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "inspection_checklists_deliveryPlanProductId_key" ON "inspection_checklists"("deliveryPlanProductId");
