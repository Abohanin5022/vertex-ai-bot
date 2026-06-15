"use client";

import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { StoreLogoUploader } from "@/components/store-logo-uploader";

type ServiceKey =
  | "cod"
  | "bankTransfer"
  | "electronicPayment"
  | "applePay"
  | "mada"
  | "cards"
  | "tabby"
  | "tamara";

type ShippingKey =
  | "localDelivery"
  | "storePickup"
  | "smsa"
  | "aramex"
  | "spl"
  | "naqel";

type AvailableServices = Record<ServiceKey, boolean>;

type User = {
  id: string;
  name?: string | null;
  storeName?: string | null;
  storeSlug?: string | null;
  storeDescription?: string | null;
  storeLogo?: string | null;
  storeBanner?: string | null;
  storeWhatsapp?: string | null;
  storeCity?: string | null;
  storeHours?: string | null;
  merchantServices?: unknown;
  merchantBankAccount?: unknown;
  merchantShippingMethods?: unknown;
  merchantInstallments?: unknown;
};

const serviceOptions: Array<{
  key: ServiceKey;
  label: string;
  description: string;
}> = [
  {
    key: "cod",
    label: "الدفع عند الاستلام",
    description: "السماح للعميل بإنشاء طلب غير مدفوع.",
  },
  {
    key: "bankTransfer",
    label: "التحويل البنكي",
    description: "إظهار بيانات حسابك البنكي وطلب رفع إيصال.",
  },
  {
    key: "electronicPayment",
    label: "الدفع الإلكتروني",
    description: "تفعيل الدفع عبر بوابة الدفع عند توفر مفاتيحها.",
  },
  {
    key: "applePay",
    label: "Apple Pay",
    description: "يتطلب تفعيل بوابة الدفع الداعمة.",
  },
  {
    key: "mada",
    label: "مدى",
    description: "الدفع عبر بطاقة مدى عند توفر الربط.",
  },
  {
    key: "cards",
    label: "Visa / Mastercard",
    description: "الدفع بالبطاقات البنكية عند توفر الربط.",
  },
  {
    key: "tabby",
    label: "Tabby",
    description: "تظهر كخدمة تقسيط عند ربطها لاحقًا.",
  },
  {
    key: "tamara",
    label: "Tamara",
    description: "تظهر كخدمة تقسيط عند ربطها لاحقًا.",
  },
];

const shippingOptions: Array<{ key: ShippingKey; label: string }> = [
  { key: "localDelivery", label: "توصيل محلي" },
  { key: "storePickup", label: "استلام من المتجر" },
  { key: "smsa", label: "سمسا" },
  { key: "aramex", label: "أرامكس" },
  { key: "spl", label: "SPL" },
  { key: "naqel", label: "ناقل" },
];

function asRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function textValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function boolValue(value: unknown) {
  return typeof value === "boolean" ? value : false;
}

function nestedRecord(value: unknown, key: string) {
  return asRecord(asRecord(value)[key]);
}

export function StoreSettingsForm({
  user,
  availableServices,
}: {
  user: User | null;
  availableServices: AvailableServices;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [slug, setSlug] = useState(user?.storeSlug || "");

  const services = useMemo(() => asRecord(user?.merchantServices), [user]);
  const bankAccount = useMemo(
    () => asRecord(user?.merchantBankAccount),
    [user]
  );
  const shippingMethods = useMemo(
    () => asRecord(user?.merchantShippingMethods),
    [user]
  );
  const installments = useMemo(
    () => asRecord(user?.merchantInstallments),
    [user]
  );

  async function updateSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const merchantServices = Object.fromEntries(
      serviceOptions.map((service) => [
        service.key,
        availableServices[service.key] &&
          formData.get(`service_${service.key}`) === "on",
      ])
    );
    const merchantShippingMethods = Object.fromEntries(
      shippingOptions.map((shipping) => [
        shipping.key,
        {
          enabled: formData.get(`shipping_${shipping.key}_enabled`) === "on",
          cost: Number(formData.get(`shipping_${shipping.key}_cost`) || 0),
          eta: formData.get(`shipping_${shipping.key}_eta`),
          notes: formData.get(`shipping_${shipping.key}_notes`),
        },
      ])
    );
    const merchantInstallments = {
      tabby: {
        enabled:
          availableServices.tabby && formData.get("installment_tabby") === "on",
        status: availableServices.tabby
          ? formData.get("installment_tabby_status")
          : "غير متاح",
      },
      tamara: {
        enabled:
          availableServices.tamara &&
          formData.get("installment_tamara") === "on",
        status: availableServices.tamara
          ? formData.get("installment_tamara_status")
          : "غير متاح",
      },
    };

    const response = await fetch("/api/merchant/settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        storeName: formData.get("storeName"),
        storeSlug: formData.get("storeSlug"),
        storeDescription: formData.get("storeDescription"),
        storeLogo: formData.get("storeLogo"),
        storeBanner: formData.get("storeBanner"),
        storeWhatsapp: formData.get("storeWhatsapp"),
        storeCity: formData.get("storeCity"),
        storeHours: formData.get("storeHours"),
        merchantServices,
        merchantBankAccount: {
          beneficiaryName: formData.get("bank_beneficiaryName"),
          bankName: formData.get("bank_bankName"),
          iban: formData.get("bank_iban"),
          accountNumber: formData.get("bank_accountNumber"),
          transferNotes: formData.get("bank_transferNotes"),
        },
        merchantShippingMethods,
        merchantInstallments,
      }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setMessage(data?.error || "تعذر حفظ إعدادات Packora 2");
      return;
    }

    setMessage("تم حفظ إعدادات Packora 2 بنجاح");
  }

  return (
    <form onSubmit={updateSettings} className="grid gap-6">
      <Section
        eyebrow="Store Identity"
        title="بيانات المتجر"
        description="هذه البيانات تظهر في معاينة المتجر للعميل وتستخدم داخل لوحة Packora 2."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            name="storeName"
            label="اسم المتجر"
            defaultValue={user?.storeName || user?.name || ""}
            placeholder="مثال: متجر Packora"
          />

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[var(--packora-navy)]">
              رابط المتجر
            </span>

            <input
              name="storeSlug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="packora"
              className="rounded-full border border-[var(--packora-border)] px-5 py-4 text-sm outline-none focus:border-[var(--packora-blue)]"
            />
          </label>
        </div>

        <TextArea
          name="storeDescription"
          label="وصف المتجر"
          defaultValue={user?.storeDescription || ""}
          placeholder="اكتب وصفًا مختصرًا عن منتجاتك وخدمة التوصيل."
        />

        <StoreLogoUploader defaultValue={user?.storeLogo} />

        <Field
          name="storeBanner"
          label="رابط بانر المتجر"
          defaultValue={user?.storeBanner || ""}
          placeholder="https://example.com/banner.jpg"
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Field
            name="storeWhatsapp"
            label="رقم واتساب المتجر"
            defaultValue={user?.storeWhatsapp || ""}
            placeholder="9665xxxxxxxx"
          />
          <Field
            name="storeCity"
            label="المدينة"
            defaultValue={user?.storeCity || ""}
            placeholder="الرياض"
          />
          <Field
            name="storeHours"
            label="أوقات العمل"
            defaultValue={user?.storeHours || ""}
            placeholder="9 صباحًا - 9 مساءً"
          />
        </div>
      </Section>

      <Section
        eyebrow="Services"
        title="الخدمات المتاحة"
        description="فعّل الخدمات التي تريد إظهارها لعملائك. الخدمات غير المربوطة من النظام تظهر غير متاحة حاليًا."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {serviceOptions.map((service) => {
            const available = availableServices[service.key];
            const enabled = available && boolValue(services[service.key]);

            return (
              <label
                key={service.key}
                className={`rounded-[24px] border p-4 ${
                  available
                    ? "border-[var(--packora-border)] bg-white"
                    : "border-slate-200 bg-slate-50 opacity-75"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--packora-navy)]">
                      {service.label}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[#64748B]">
                      {service.description}
                    </p>
                  </div>

                  <input
                    name={`service_${service.key}`}
                    type="checkbox"
                    disabled={!available}
                    defaultChecked={enabled}
                    className="mt-1 h-5 w-5 accent-[var(--packora-blue)]"
                  />
                </div>

                <span
                  className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    available
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {available ? "متاحة" : "غير متاحة حاليًا"}
                </span>
              </label>
            );
          })}
        </div>
      </Section>

      <Section
        eyebrow="Bank Account"
        title="الحساب البنكي"
        description="تظهر هذه البيانات للعميل عند اختيار التحويل البنكي."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            name="bank_beneficiaryName"
            label="اسم المستفيد"
            defaultValue={textValue(bankAccount.beneficiaryName)}
            placeholder="اسم المستفيد"
          />
          <Field
            name="bank_bankName"
            label="اسم البنك"
            defaultValue={textValue(bankAccount.bankName)}
            placeholder="اسم البنك"
          />
          <Field
            name="bank_iban"
            label="الآيبان"
            defaultValue={textValue(bankAccount.iban)}
            placeholder="SA00 0000 0000 0000 0000 0000"
          />
          <Field
            name="bank_accountNumber"
            label="رقم الحساب"
            defaultValue={textValue(bankAccount.accountNumber)}
            placeholder="رقم الحساب"
          />
        </div>

        <TextArea
          name="bank_transferNotes"
          label="ملاحظات التحويل"
          defaultValue={textValue(bankAccount.transferNotes)}
          placeholder="اكتب أي ملاحظات يحتاجها العميل بعد التحويل."
        />
      </Section>

      <Section
        eyebrow="Shipping"
        title="شركات النقل"
        description="حدد خيارات الشحن التي يدعمها متجرك وتكلفتها ومدة التوصيل المتوقعة."
      >
        <div className="grid gap-4">
          {shippingOptions.map((shipping) => {
            const value = nestedRecord(shippingMethods, shipping.key);

            return (
              <div
                key={shipping.key}
                className="rounded-[24px] border border-[var(--packora-border)] p-4"
              >
                <label className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[var(--packora-navy)]">
                      {shipping.label}
                    </p>
                    <p className="mt-1 text-sm text-[#64748B]">
                      حالة التفعيل والتكلفة والمدة والملاحظات.
                    </p>
                  </div>

                  <input
                    name={`shipping_${shipping.key}_enabled`}
                    type="checkbox"
                    defaultChecked={boolValue(value.enabled)}
                    className="h-5 w-5 accent-[var(--packora-blue)]"
                  />
                </label>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <Field
                    name={`shipping_${shipping.key}_cost`}
                    label="تكلفة الشحن"
                    type="number"
                    step="0.01"
                    defaultValue={String(value.cost ?? "")}
                    placeholder="0"
                  />
                  <Field
                    name={`shipping_${shipping.key}_eta`}
                    label="مدة التوصيل"
                    defaultValue={textValue(value.eta)}
                    placeholder="1-3 أيام"
                  />
                  <Field
                    name={`shipping_${shipping.key}_notes`}
                    label="ملاحظات"
                    defaultValue={textValue(value.notes)}
                    placeholder="ملاحظات اختيارية"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section
        eyebrow="Installments"
        title="خدمات التقسيط"
        description="يمكنك تجهيز حالة Tabby وTamara الآن، ولن يتم إنشاء طلبات تقسيط حقيقية قبل الربط الرسمي."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <InstallmentCard
            name="Tabby"
            fieldPrefix="tabby"
            available={availableServices.tabby}
            value={nestedRecord(installments, "tabby")}
          />
          <InstallmentCard
            name="Tamara"
            fieldPrefix="tamara"
            available={availableServices.tamara}
            value={nestedRecord(installments, "tamara")}
          />
        </div>
      </Section>

      {message ? (
        <p className="rounded-[20px] border border-[var(--packora-border)] bg-white p-4 text-sm font-semibold text-[var(--packora-navy)]">
          {message}
        </p>
      ) : null}

      <button
        disabled={loading}
        className="rounded-full bg-[var(--packora-blue)] py-4 font-semibold text-white disabled:opacity-60"
      >
        {loading ? "جاري الحفظ..." : "حفظ إعدادات Packora 2"}
      </button>
    </form>
  );
}

function Section({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-[var(--packora-border)] bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--packora-blue)]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-black text-[var(--packora-navy)]">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-7 text-[#64748B]">{description}</p>

      <div className="mt-5 grid gap-5">{children}</div>
    </section>
  );
}

function InstallmentCard({
  name,
  fieldPrefix,
  available,
  value,
}: {
  name: string;
  fieldPrefix: "tabby" | "tamara";
  available: boolean;
  value: Record<string, unknown>;
}) {
  return (
    <div className="rounded-[24px] border border-[var(--packora-border)] p-4">
      <label className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-[var(--packora-navy)]">{name}</p>
          <p className="mt-1 text-sm text-[#64748B]">
            {available ? "يمكن تفعيل الخدمة بعد الربط." : "غير متاحة حاليًا"}
          </p>
        </div>

        <input
          name={`installment_${fieldPrefix}`}
          type="checkbox"
          disabled={!available}
          defaultChecked={available && boolValue(value.enabled)}
          className="h-5 w-5 accent-[var(--packora-blue)]"
        />
      </label>

      <select
        name={`installment_${fieldPrefix}_status`}
        disabled={!available}
        defaultValue={textValue(value.status) || (available ? "بانتظار الربط" : "غير متاح")}
        className="mt-4 w-full rounded-full border border-[var(--packora-border)] px-5 py-4 text-sm outline-none focus:border-[var(--packora-blue)] disabled:bg-slate-50"
      >
        <option>بانتظار الربط</option>
        <option>مفعّل</option>
        <option>غير متاح</option>
      </select>
    </div>
  );
}

function Field({
  name,
  label,
  defaultValue,
  placeholder,
  type = "text",
  step,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  step?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-[var(--packora-navy)]">
        {label}
      </span>

      <input
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="rounded-full border border-[var(--packora-border)] px-5 py-4 text-sm outline-none focus:border-[var(--packora-blue)]"
      />
    </label>
  );
}

function TextArea({
  name,
  label,
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-[var(--packora-navy)]">
        {label}
      </span>

      <textarea
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="min-h-[120px] rounded-[24px] border border-[var(--packora-border)] px-5 py-4 text-sm leading-7 outline-none focus:border-[var(--packora-blue)]"
      />
    </label>
  );
}
