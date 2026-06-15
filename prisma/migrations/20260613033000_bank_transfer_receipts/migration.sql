-- Add bank transfer proof fields to orders.
ALTER TABLE "Order" ADD COLUMN "bankTransferReceipt" TEXT;
ALTER TABLE "Order" ADD COLUMN "paymentProofStatus" TEXT;
