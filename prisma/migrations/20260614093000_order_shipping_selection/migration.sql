-- Store the shipping / pickup choice selected by the customer at checkout.
ALTER TABLE "Order"
ADD COLUMN "shippingMethod" TEXT,
ADD COLUMN "shippingProvider" TEXT,
ADD COLUMN "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "shippingEta" TEXT,
ADD COLUMN "shippingNotes" TEXT;
