import { StoreSettingsForm } from "@/components/store-settings-form";
import { getMerchantUser } from "@/lib/merchant-auth";

function paymentAvailability() {
  const moyasarEnabled = Boolean(
    process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY &&
      process.env.MOYASAR_SECRET_KEY
  );

  return {
    cod: true,
    bankTransfer: true,
    electronicPayment: moyasarEnabled,
    applePay: moyasarEnabled,
    mada: moyasarEnabled,
    cards: moyasarEnabled,
    tabby: Boolean(process.env.TABBY_SECRET_KEY && process.env.TABBY_MERCHANT_CODE),
    tamara: Boolean(process.env.TAMARA_API_TOKEN),
  };
}

export default async function StoreSettingsPage() {
  const user = await getMerchantUser();

  return (
    <main dir="rtl" className="min-h-screen bg-[#F8FAFC] p-4">
      <section className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-[28px] border border-[#E5E7EB] bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
            Store Settings
          </p>

          <h1 className="mt-3 text-4xl font-semibold text-[#111827]">
            إعدادات المتجر
          </h1>

          <p className="mt-2 text-sm text-[#6B7280]">
            عدّل اسم المتجر ورابطه وبياناته الأساسية.
          </p>
        </header>

        <StoreSettingsForm
          user={user}
          availableServices={paymentAvailability()}
        />
      </section>
    </main>
  );
}
