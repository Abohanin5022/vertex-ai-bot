import Link from "next/link";
import { Crown, Package, Percent } from "lucide-react";

const planLabels: Record<string, string> = {
  free: "مجاني",
  basic: "أساسي",
  pro: "احترافي",
  enterprise: "مؤسسي",
};

export function MerchantSubscriptionSummary({
  planKey,
  status,
  productLimit,
  commissionRate,
  productCount,
}: {
  planKey: string;
  status: string;
  productLimit: number;
  commissionRate: number;
  productCount: number;
}) {
  const usagePercentage =
    productLimit > 0 ? Math.min((productCount / productLimit) * 100, 100) : 0;

  return (
    <section className="mt-5 rounded-[30px] border border-[var(--packora-border)] bg-white p-5 shadow-[0_18px_45px_rgba(7,11,42,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--packora-cyan)] text-[var(--packora-blue)]">
            <Crown size={25} />
          </div>

          <div>
            <p className="text-sm font-semibold text-[var(--packora-blue)]">
              باقتك الحالية
            </p>
            <h2 className="mt-1 text-2xl font-black text-[var(--packora-navy)]">
              {planLabels[planKey] || planKey}
            </h2>
            <p className="mt-1 text-sm text-[var(--packora-muted)]">
              حالة الاشتراك: {status === "active" ? "نشط" : status}
            </p>
          </div>
        </div>

        <Link
          href="/packora-2/settings"
          className="rounded-full bg-[var(--packora-navy)] px-5 py-3 text-sm font-semibold text-white"
        >
          ترقية الباقة
        </Link>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-[22px] border border-[var(--packora-border)] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#6B7280]">
            <Package size={18} />
            المنتجات المستخدمة
          </div>
          <strong className="mt-2 block text-2xl font-black text-[var(--packora-navy)]">
            {productCount} / {productLimit}
          </strong>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
            <div
              className="h-full rounded-full bg-[var(--packora-blue)]"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>

        <div className="rounded-[22px] border border-[var(--packora-border)] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#6B7280]">
            <Percent size={18} />
            نسبة العمولة
          </div>
          <strong className="mt-2 block text-2xl font-black text-[var(--packora-navy)]">
            {(commissionRate * 100).toFixed(1)}%
          </strong>
          <p className="mt-2 text-sm text-[var(--packora-muted)]">
            يتم حسابها تلقائيًا عند إنشاء الطلب.
          </p>
        </div>
      </div>
    </section>
  );
}
