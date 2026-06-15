ALTER TABLE "Order"
ADD COLUMN "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "merchantNet" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "platformRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0;

UPDATE "Order"
SET "subtotal" = "total",
    "merchantNet" = "total"
WHERE "subtotal" = 0 AND "merchantNet" = 0;

CREATE TABLE "PlatformCommissionSetting" (
    "id" TEXT NOT NULL DEFAULT 'platform',
    "fixedCommission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentageCommission" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "commissionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformCommissionSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productLimit" INTEGER NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "features" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SubscriptionPlan_key_key" ON "SubscriptionPlan"("key");

INSERT INTO "PlatformCommissionSetting" (
    "id",
    "fixedCommission",
    "percentageCommission",
    "commissionEnabled"
) VALUES (
    'platform',
    0,
    0.05,
    true
) ON CONFLICT ("id") DO NOTHING;

INSERT INTO "SubscriptionPlan" (
    "id",
    "key",
    "name",
    "productLimit",
    "commissionRate",
    "features"
) VALUES
    ('plan_free', 'free', 'مجاني', 20, 0.08, '["متجر مستقل", "إدارة منتجات أساسية", "عمولة أعلى"]'::jsonb),
    ('plan_basic', 'basic', 'أساسي', 80, 0.06, '["منتجات أكثر", "كوبونات", "تقارير أساسية"]'::jsonb),
    ('plan_pro', 'pro', 'احترافي', 250, 0.04, '["تحليلات متقدمة", "أولوية في الظهور", "دعم أسرع"]'::jsonb),
    ('plan_enterprise', 'enterprise', 'مؤسسي', 1000, 0.025, '["حد منتجات مرتفع", "دعم مخصص", "عمولة مخفضة"]'::jsonb)
ON CONFLICT ("key") DO NOTHING;

ALTER TABLE "User"
ADD COLUMN "subscriptionPlanKey" TEXT NOT NULL DEFAULT 'free',
ADD COLUMN "subscriptionStatus" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN "productLimit" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.08;

ALTER TABLE "User"
ADD CONSTRAINT "User_subscriptionPlanKey_fkey"
FOREIGN KEY ("subscriptionPlanKey") REFERENCES "SubscriptionPlan"("key")
ON DELETE RESTRICT ON UPDATE CASCADE;
