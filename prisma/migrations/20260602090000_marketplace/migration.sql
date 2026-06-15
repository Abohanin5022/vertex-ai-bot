ALTER TABLE "Product"
ADD COLUMN "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "ratingCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "User"
ADD COLUMN "storeBanner" TEXT,
ADD COLUMN "storeWhatsapp" TEXT,
ADD COLUMN "storeCity" TEXT,
ADD COLUMN "storeHours" TEXT,
ADD COLUMN "storeRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "storeRatingCount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "ProductRating" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "orderId" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductRating_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StoreRating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreRating_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProductRating_productId_idx" ON "ProductRating"("productId");
CREATE INDEX "ProductRating_orderId_idx" ON "ProductRating"("orderId");
CREATE INDEX "StoreRating_userId_idx" ON "StoreRating"("userId");
CREATE INDEX "StoreRating_orderId_idx" ON "StoreRating"("orderId");

ALTER TABLE "ProductRating"
ADD CONSTRAINT "ProductRating_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ProductRating"
ADD CONSTRAINT "ProductRating_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "StoreRating"
ADD CONSTRAINT "StoreRating_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StoreRating"
ADD CONSTRAINT "StoreRating_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
