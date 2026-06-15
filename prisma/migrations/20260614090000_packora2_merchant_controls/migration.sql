-- Packora 2 merchant control center settings and richer product management.
ALTER TABLE "User"
ADD COLUMN "merchantServices" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN "merchantBankAccount" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN "merchantShippingMethods" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN "merchantInstallments" JSONB NOT NULL DEFAULT '{}';

ALTER TABLE "Product"
ADD COLUMN "compareAtPrice" DOUBLE PRECISION,
ADD COLUMN "minOrderQuantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "weight" DOUBLE PRECISION,
ADD COLUMN "dimensions" TEXT,
ADD COLUMN "deletedAt" TIMESTAMP(3);
