ALTER TABLE "Order"
  ADD COLUMN "paymentMethod" TEXT NOT NULL DEFAULT 'cod',
  ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
  ADD COLUMN "paymentId" TEXT,
  ADD COLUMN "paidAt" TIMESTAMP(3);

CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "orderId" TEXT,
  "provider" TEXT NOT NULL DEFAULT 'moyasar',
  "paymentId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'SAR',
  "status" TEXT NOT NULL,
  "raw" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Payment_paymentId_key" ON "Payment"("paymentId");
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
