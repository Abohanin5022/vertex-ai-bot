import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { PackoraLogo } from "@/components/packora-logo";
import { getMerchantUser } from "@/lib/merchant-auth";

export default async function MerchantProfilePage() {
  const user = await getMerchantUser();

  if (!user) {
    redirect("/packora-2/login");
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F7FBFF] p-5 text-[#070B2A]"
    >
      <section className="mx-auto max-w-3xl">
        <header className="rounded-[32px] bg-[#070B2A] p-6 text-white">
          <PackoraLogo href="/packora-2" size="desktop" />
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-[#4FE7C5]">
            Packora 2
          </p>
          <h1 className="mt-2 text-4xl font-black">ملف التاجر</h1>
          <p className="mt-3 text-sm leading-7 text-white/70">
            بيانات المتجر وحالة الحساب والجلسة المستقلة الخاصة بالتاجر.
          </p>
        </header>

        <section className="mt-5 rounded-[30px] border border-[#DCEBFF] bg-white p-6 shadow-[0_18px_48px_rgba(7,11,42,0.05)]">
          <div className="flex flex-wrap items-center gap-5">
            <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-[28px] border border-[#DCEBFF] bg-[#F7FBFF]">
              {user.storeLogo ? (
                <Image
                  src={user.storeLogo}
                  alt={user.storeName || user.name || "Packora 2"}
                  width={120}
                  height={120}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-4xl">P</span>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-[#1766E8]">
                {user.isActive ? "حساب نشط" : "حساب معطل"}
              </p>
              <h2 className="mt-1 text-3xl font-black">
                {user.storeName || user.name || "متجر Packora"}
              </h2>
              <p className="mt-2 text-sm text-[#64748B]">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Info
              label="معاينة المتجر للعميل"
              value={user.storeSlug ? `/store/${user.storeSlug}` : "غير محدد"}
            />
            <Info label="المدينة" value={user.storeCity || "غير محددة"} />
            <Info
              label="باقة الاشتراك"
              value={user.subscriptionPlanKey || "free"}
            />
            <Info
              label="نسبة العمولة"
              value={`${Math.round((user.commissionRate || 0) * 100)}%`}
            />
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/packora-2/settings"
              className="rounded-full bg-[#1766E8] px-6 py-3 font-black text-white"
            >
              تعديل إعدادات المتجر
            </Link>
            <Link
              href="/packora-2"
              className="rounded-full border border-[#DCEBFF] px-6 py-3 font-black"
            >
              الرجوع للوحة التاجر
            </Link>
          </div>

          <div className="mt-5 max-w-xs">
            <LogoutButton redirectTo="/packora-2/login" />
          </div>
        </section>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[#DCEBFF] bg-[#F7FBFF] p-4">
      <p className="text-xs font-semibold text-[#64748B]">{label}</p>
      <strong className="mt-1 block text-lg font-black text-[#070B2A]">
        {value}
      </strong>
    </div>
  );
}
