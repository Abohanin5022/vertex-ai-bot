-- Add the vendor owner column safely for existing products.
ALTER TABLE "Product" ADD COLUMN "userId" TEXT;

DO $$
DECLARE
  first_user_id TEXT;
BEGIN
  SELECT "id" INTO first_user_id
  FROM "User"
  ORDER BY "createdAt" ASC
  LIMIT 1;

  IF first_user_id IS NULL AND EXISTS (SELECT 1 FROM "Product") THEN
    RAISE EXCEPTION 'Cannot enable multi-vendor: create at least one user before migrating existing products.';
  END IF;

  UPDATE "Product"
  SET "userId" = first_user_id
  WHERE "userId" IS NULL;
END $$;

ALTER TABLE "Product" ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "Product"
ADD CONSTRAINT "Product_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
