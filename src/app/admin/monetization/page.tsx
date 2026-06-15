import { CommissionSettingsForm } from "@/components/commission-settings-form";
import { Price } from "@/components/price";
import { defaultSubscriptionPlans } from "@/lib/profitability";
import { prisma } from "@/lib/prisma";

export default async function AdminMonetizationPage() {
  const [settings, plans, merchants] = await Promise.all([
    prisma.platformCommissionSetting.findUnique({
      where: { id: "platform" },
    }),
    prisma.subscriptionPlan.findMany({
      orderBy: { productLimit: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "merchant" },
      select: {
        subscriptionPlanKey: true,
      },
    }),
  ]);

  const planCounts = merchants.reduce<Record<string, number>>((acc, user) => {
    acc[user.subscriptionPlanKey] = (acc[user.subscriptionPlanKey] || 0) + 1;
    return acc;
  }, {});
  const visiblePlans = plans.length
    ? plans
    : defaultSubscriptionPlans.map((plan) => ({
        id: plan.key,
        key: plan.key,
        name: plan.name,
        productLimit: plan.productLimit,
        commissionRate: plan.commissionRate,
        features: plan.features,
        isActive: true,
        createdAt: new Date(),
      }));

  return (
    <section>
      <header className="mb-6 border-b border-[var(--packora-border)] pb-6">
        <p className="text-sm text-[#6B7280]">Monetization</p>
        <h1 className="mt-2 text-[36px] font-semibold leading-tight text-[var(--packora-navy)]">
          الربحية والاشتراكات
        </h1>
        <p className="mt-3 text-[#6B7280]">
          تحكم في عمولة المنصة وباقات التجار وحدود المنتجات.
        </p>
      </header>

      <CommissionSettingsForm
        fixedCommission={settings?.fixedCommission || 0}
        percentageCommission={settings?.percentageCommission || 0.05}
        commissionEnabled={settings?.commissionEnabled ?? true}
      />

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visiblePlans.map((plan) => {
          const features = Array.isArray(plan.features)
            ? (plan.features as string[])
            : [];

          return (
            <article
              key={plan.key}
              className="rounded-[28px] border border-[var(--packora-border)] bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-[#6B7280]">باقة</p>
                  <h2 className="mt-1 text-2xl font-semibold text-[var(--packora-navy)]">
                    {plan.name}
                  </h2>
                </div>

                <span className="rounded-full bg-[var(--packora-cyan)] px-3 py-1 text-xs font-semibold text-[var(--packora-blue)]">
                  {planCounts[plan.key] || 0} تاجر
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                <Stat label="حد المنتجات" value={`${plan.productLimit}`} />
                <Stat
                  label="نسبة العمولة"
                  value={`${(plan.commissionRate * 100).toFixed(1)}%`}
                />
              </div>

              <ul className="mt-5 grid gap-2 text-sm leading-6 text-[#6B7280]">
                {features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>

      <section className="mt-6 rounded-[28px] border border-[var(--packora-border)] bg-white p-6">
        <h2 className="text-2xl font-semibold text-[var(--packora-navy)]">
          ملخص الربحية
        </h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          يتم حفظ عمولة كل طلب داخل الطلب نفسه حتى تبقى التقارير ثابتة حتى لو
          تغيرت الباقات لاحقًا.
        </p>
        <div className="mt-5">
          <Price
            amount={settings?.fixedCommission || 0}
            className="text-3xl font-semibold text-[var(--packora-blue)]"
          />
          <span className="mx-2 text-[#6B7280]">عمولة ثابتة حالية</span>
        </div>
      </section>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-[#F8FAFC] p-4">
      <p className="text-xs text-[#6B7280]">{label}</p>
      <strong className="mt-1 block text-xl font-semibold">{value}</strong>
    </div>
  );
}
