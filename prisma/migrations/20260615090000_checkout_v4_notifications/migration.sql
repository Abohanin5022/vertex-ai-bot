-- Add checkout V4 order fields
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "couponCode" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "finalTotal" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Persist merchant notifications generated from orders and operational events
CREATE TABLE IF NOT EXISTS "MerchantNotification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "orderId" TEXT,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MerchantNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "MerchantNotification_userId_createdAt_idx" ON "MerchantNotification"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "MerchantNotification_orderId_idx" ON "MerchantNotification"("orderId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'MerchantNotification_userId_fkey'
  ) THEN
    ALTER TABLE "MerchantNotification"
      ADD CONSTRAINT "MerchantNotification_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'MerchantNotification_orderId_fkey'
  ) THEN
    ALTER TABLE "MerchantNotification"
      ADD CONSTRAINT "MerchantNotification_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
