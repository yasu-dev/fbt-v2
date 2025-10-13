-- CreateTable
CREATE TABLE "inspection_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL,
    "checklist" TEXT,
    "photos" TEXT,
    "notes" TEXT,
    "videoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "inspection_progress_productId_key" ON "inspection_progress"("productId");
