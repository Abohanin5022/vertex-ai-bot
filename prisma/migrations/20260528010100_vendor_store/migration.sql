ALTER TABLE "User" ADD COLUMN "storeName" TEXT;
ALTER TABLE "User" ADD COLUMN "storeSlug" TEXT;

WITH ranked_users AS (
  SELECT
    "id",
    row_number() OVER (ORDER BY "createdAt" ASC) AS row_number
  FROM "User"
)
UPDATE "User" AS user_row
SET
  "storeName" = CASE
    WHEN ranked_users.row_number = 1 THEN 'Packora'
    ELSE COALESCE(NULLIF(user_row."name", ''), split_part(user_row."email", '@', 1), 'متجر')
  END,
  "storeSlug" = CASE
    WHEN ranked_users.row_number = 1 THEN 'packora'
    ELSE concat('store-', substr(user_row."id", 1, 8))
  END
FROM ranked_users
WHERE user_row."id" = ranked_users."id"
  AND user_row."storeSlug" IS NULL;

CREATE UNIQUE INDEX "User_storeSlug_key" ON "User"("storeSlug");
