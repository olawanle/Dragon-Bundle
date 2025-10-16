-- CreateTable
CREATE TABLE "Bundle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop_domain" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cover_image_url" TEXT,
    "discount_type" TEXT NOT NULL,
    "discount_value" REAL NOT NULL,
    "items" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "stats" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Bundle_shop_domain_idx" ON "Bundle"("shop_domain");

-- CreateIndex
CREATE INDEX "Bundle_is_active_idx" ON "Bundle"("is_active");
