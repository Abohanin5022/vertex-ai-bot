"use client";

import Link from "next/link";
import { CreditCard, X } from "lucide-react";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import { Price } from "@/components/price";
import { useCartStore } from "@/store/cart-store";

type PaymentMethod =
  | "apple_pay"
  | "mada"
  | "visa"
  | "mastercard"
  | "cod"
  | "bank_transfer"
  | "tabby"
  | "tamara";

type PaymentStatus = "available" | "disabled" | "soon";

type CheckoutForm = {
  customer: string;
  phone: string;
  city: string;
  address: string;
};

type PaymentOption = {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: string;
  status: PaymentStatus;
  dark?: boolean;
};

type ShippingMethod = {
  key: string;
  label: string;
  enabled: boolean;
  cost: number;
  eta?: string;
  notes?: string;
};

type CheckoutSettings = {
  merchant: {
    id: string;
    name: string;
  } | null;
  services: Partial<Record<string, boolean>>;
  rawServices?: Partial<Record<string, boolean>>;
  bankAccount: {
    beneficiaryName: string;
    bankName: string;
    iban: string;
    accountNumber: string;
    transferNotes?: string;
  } | null;
  bankTransferAvailable: boolean;
  bankTransferEnabledWithoutAccount: boolean;
  shippingMethods: ShippingMethod[];
  multipleMerchants: boolean;
};

type OrderPayload = ReturnType<typeof buildOrderPayload>;

declare global {
  interface Window {
    Moyasar?: {
      init: (config: Record<string, unknown>) => void;
    };
  }
}

const pendingCheckoutKey = "packora-pending-checkout";
const checkoutFormStorageKey = "packora-checkout-form";
const moyasarScriptId = "moyasar-payment-form-script";
const moyasarStyleId = "moyasar-payment-form-style";
const publishableKey = process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY || "";
const moyasarPaymentMethods: PaymentMethod[] = [
  "apple_pay",
  "mada",
  "visa",
  "mastercard",
];

const cities = [
  "الرياض",
  "جدة",
  "مكة المكرمة",
  "المدينة المنورة",
  "الدمام",
  "الخبر",
  "الطائف",
  "أبها",
];

function readSavedCheckoutForm(): CheckoutForm {
  const emptyForm = {
    customer: "",
    phone: "",
    city: "",
    address: "",
  };

  if (typeof window === "undefined") {
    return emptyForm;
  }

  try {
    const saved = window.localStorage.getItem(checkoutFormStorageKey);

    if (!saved) {
      return emptyForm;
    }

    const parsed = JSON.parse(saved) as Partial<CheckoutForm>;

    return {
      customer: typeof parsed.customer === "string" ? parsed.customer : "",
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
      city: typeof parsed.city === "string" ? parsed.city : "",
      address: typeof parsed.address === "string" ? parsed.address : "",
    };
  } catch {
    return emptyForm;
  }
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutFallback />}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState<CheckoutSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [selectedShippingKey, setSelectedShippingKey] = useState("");
  const [bankTransferReceipt, setBankTransferReceipt] = useState("");
  const [bankTransferReceiptName, setBankTransferReceiptName] = useState("");
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [form, setForm] = useState<CheckoutForm>(() => readSavedCheckoutForm());

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const formRef = useRef(form);
  const itemsRef = useRef(items);
  const couponCodeRef = useRef(couponCode);
  const couponDiscountRef = useRef(0);
  const subtotalRef = useRef(0);
  const selectedShippingRef = useRef<ShippingMethod | null>(null);
  const verifyingRef = useRef(false);

  const productIds = useMemo(
    () => Array.from(new Set(items.map((item) => item.id))).sort().join(","),
    [items]
  );
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );
  const couponDiscount = Math.min(discount, subtotal);
  const selectedShipping = useMemo(
    () =>
      settings?.shippingMethods.find(
        (method) => method.key === selectedShippingKey
      ) || null,
    [selectedShippingKey, settings]
  );
  const shippingCost = selectedShipping?.cost || 0;
  const total = Math.max(subtotal - couponDiscount, 0) + shippingCost;
  const paymentMethods = useMemo(
    () => buildPaymentMethods(settings),
    [settings]
  );
  const availablePaymentMethods = paymentMethods.filter(
    (method) => method.status === "available"
  );
  const isMoyasarSelected =
    paymentMethod !== "" && isMoyasarMethod(paymentMethod);
  const noPaymentMethods =
    !settingsLoading && Boolean(settings) && availablePaymentMethods.length === 0;
  const noShippingMethods =
    !settingsLoading && Boolean(settings) && settings?.shippingMethods.length === 0;

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  useEffect(() => {
    window.localStorage.setItem(checkoutFormStorageKey, JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    couponCodeRef.current = couponCode;
  }, [couponCode]);

  useEffect(() => {
    couponDiscountRef.current = couponDiscount;
  }, [couponDiscount]);

  useEffect(() => {
    subtotalRef.current = subtotal;
  }, [subtotal]);

  useEffect(() => {
    selectedShippingRef.current = selectedShipping;
  }, [selectedShipping]);

  useEffect(() => {
    let cancelled = false;

    if (!productIds) {
      window.setTimeout(() => {
        if (cancelled) return;

        setSettings(null);
        setPaymentMethod("");
        setSelectedShippingKey("");
      }, 0);
      return;
    }

    async function loadCheckoutSettings() {
      setSettingsLoading(true);
      setMessage("");

      try {
        const response = await fetch(
          `/api/checkout/settings?productIds=${encodeURIComponent(productIds)}`,
          {
            cache: "no-store",
          }
        );
        const data = (await response.json()) as CheckoutSettings & {
          error?: string;
        };

        if (!response.ok && data.error) {
          throw new Error(data.error);
        }

        if (!response.ok) {
          throw new Error("تعذر تحميل إعدادات الدفع والشحن");
        }

        if (cancelled) return;

        setSettings(data);
        setSelectedShippingKey(data.shippingMethods[0]?.key || "");

        const firstPayment = buildPaymentMethods(data).find(
          (method) => method.status === "available"
        );
        setPaymentMethod(firstPayment?.value || "");
      } catch (error) {
        if (cancelled) return;

        setSettings(null);
        setPaymentMethod("");
        setSelectedShippingKey("");
        setMessage(
          error instanceof Error
            ? error.message
            : "تعذر تحميل إعدادات checkout"
        );
      } finally {
        if (!cancelled) {
          setSettingsLoading(false);
        }
      }
    }

    void loadCheckoutSettings();

    return () => {
      cancelled = true;
    };
  }, [productIds]);

  useEffect(() => {
    const paymentId = searchParams.get("id") || searchParams.get("payment_id");

    if (!paymentId || verifyingRef.current) {
      return;
    }

    verifyingRef.current = true;

    async function verifyReturnedPayment() {
      setVerifying(true);
      setMessage("جاري التحقق من عملية الدفع...");

      const pendingCheckout = window.localStorage.getItem(pendingCheckoutKey);

      if (!pendingCheckout) {
        setVerifying(false);
        setMessage("لم نجد بيانات الطلب المرتبطة بعملية الدفع.");
        return;
      }

      try {
        const response = await fetch("/api/payments/moyasar/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentId,
            order: JSON.parse(pendingCheckout),
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "فشل التحقق من الدفع");
        }

        window.localStorage.removeItem(pendingCheckoutKey);
        clearCart();
        window.location.href = `/packora-1/track/${data.order.id}`;
      } catch (error) {
        setVerifying(false);
        setMessage(
          error instanceof Error
            ? error.message
            : "فشل الدفع، لم يتم إنشاء الطلب."
        );
      }
    }

    void verifyReturnedPayment();
  }, [clearCart, searchParams]);

  useEffect(() => {
    if (!isMoyasarSelected || total <= 0 || !publishableKey) {
      return;
    }

    let cancelled = false;

    loadMoyasarAssets()
      .then(() => {
        if (cancelled || !window.Moyasar) {
          return;
        }

        const formElement = document.querySelector(".mysr-form");

        if (formElement) {
          formElement.innerHTML = "";
        }

        const moyasarOptions = getMoyasarOptions(paymentMethod);

        window.Moyasar.init({
          element: ".mysr-form",
          amount: Math.round(total * 100),
          currency: "SAR",
          description: `Packora order - ${paymentMethod}`,
          publishable_api_key: publishableKey,
          callback_url: `${window.location.origin}/packora-1/checkout?gateway=moyasar`,
          supported_networks: moyasarOptions.supportedNetworks,
          methods: moyasarOptions.methods,
          language: "ar",
          fixed_width: false,
          on_initiating: async () => {
            const orderPayload = buildOrderPayload(
              formRef.current,
              itemsRef.current,
              total,
              selectedShippingRef.current,
              {
                couponCode: couponCodeRef.current,
                discountAmount: couponDiscountRef.current,
                subtotal: subtotalRef.current,
              }
            );
            const validationError = validateOrderPayload(orderPayload);

            if (validationError) {
              setMessage(validationError);
              return false;
            }

            window.localStorage.setItem(
              pendingCheckoutKey,
              JSON.stringify({
                ...orderPayload,
                paymentMethod,
              })
            );
            setMessage("");
            return true;
          },
          on_failure: (error: string) => {
            setMessage(error || "فشلت عملية الدفع. حاول مرة أخرى.");
          },
        });
      })
      .catch(() => {
        setMessage(
          "تعذر تحميل نموذج Moyasar. تحقق من الاتصال أو مفاتيح الدفع."
        );
      });

    return () => {
      cancelled = true;
    };
  }, [isMoyasarSelected, paymentMethod, total]);

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (settings?.multipleMerchants) {
      setMessage("السلة تحتوي منتجات من أكثر من متجر. أكمل طلب كل متجر بشكل منفصل.");
      return;
    }

    if (!paymentMethod) {
      setMessage("لا توجد طرق دفع متاحة لهذا المتجر حاليًا.");
      return;
    }

    if (!selectedShipping) {
      setMessage("لا توجد طرق شحن متاحة لهذا المتجر حاليًا.");
      return;
    }

    const orderPayload = buildOrderPayload(form, items, total, selectedShipping, {
      couponCode,
      discountAmount: couponDiscount,
      subtotal,
    });
    const validationError = validateOrderPayload(orderPayload);

    if (validationError) {
      setMessage(validationError);
      return;
    }

    if (isMoyasarSelected) {
      if (!publishableKey) {
        setMessage("طريقة الدفع الإلكترونية غير مفعلة حاليًا.");
        return;
      }

      window.localStorage.setItem(
        pendingCheckoutKey,
        JSON.stringify({
          ...orderPayload,
          paymentMethod,
        })
      );
      setMessage(
        "أكمل الدفع من نموذج Moyasar أعلاه. لن يتم إنشاء الطلب إلا بعد نجاح الدفع."
      );
      return;
    }

    if (paymentMethod === "tabby" || paymentMethod === "tamara") {
      setMessage("طريقة الدفع هذه ستكون متاحة قريبًا.");
      return;
    }

    if (paymentMethod === "bank_transfer" && !bankTransferReceipt) {
      setMessage("ارفع إيصال التحويل البنكي قبل إتمام الطلب.");
      return;
    }

    setLoading(true);
    setMessage("");

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...orderPayload,
        paymentMethod,
        paymentStatus:
          paymentMethod === "bank_transfer" ? "manual_review" : "unpaid",
        status:
          paymentMethod === "bank_transfer" ? "bank_transfer_review" : "pending",
        bankTransferReceipt:
          paymentMethod === "bank_transfer" ? bankTransferReceipt : undefined,
        paymentProofStatus:
          paymentMethod === "bank_transfer" ? "pending" : undefined,
      }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setMessage(
        data?.error ||
          "تعذر إنشاء الطلب. تحقق من البيانات وحاول مرة أخرى."
      );
      return;
    }

    const order = await response.json();
    clearCart();
    window.location.href = `/packora-1/track/${order.id}`;
  }

  function updateField(field: keyof CheckoutForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function applyCoupon() {
    const code = couponCode.trim();

    if (!code) {
      setDiscount(0);
      setCouponMessage("أدخل كود الخصم أولاً.");
      return;
    }

    setApplyingCoupon(true);
    setCouponMessage("");

    try {
      const response = await fetch(
        `/api/coupons/check?code=${encodeURIComponent(code)}`,
        {
          cache: "no-store",
        }
      );
      const data = (await response.json()) as {
        valid?: boolean;
        discount?: number;
      };

      if (!response.ok || !data.valid) {
        setDiscount(0);
        setCouponMessage("كود الخصم غير صالح.");
        return;
      }

      setDiscount(Math.max(Number(data.discount) || 0, 0));
      setCouponMessage("تم تطبيق كود الخصم.");
    } catch {
      setDiscount(0);
      setCouponMessage("تعذر التحقق من كود الخصم.");
    } finally {
      setApplyingCoupon(false);
    }
  }

  async function uploadBankTransferReceipt(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadingReceipt(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload-payment-proof", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "تعذر رفع إيصال التحويل.");
      }

      setBankTransferReceipt(data.url);
      setBankTransferReceiptName(file.name);
    } catch (error) {
      setBankTransferReceipt("");
      setBankTransferReceiptName("");
      setMessage(
        error instanceof Error ? error.message : "تعذر رفع إيصال التحويل."
      );
    } finally {
      setUploadingReceipt(false);
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[var(--packora-soft-pink)] pb-52 text-[var(--packora-navy)]">
      <section className="mx-auto min-h-screen max-w-md bg-white shadow-[0_20px_60px_rgba(236,72,153,0.08)]">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--packora-border)] bg-[linear-gradient(135deg,#FCE7F3,#FDF2F8)] px-6 py-5">
          <Link
            href="/packora-1/cart"
            aria-label="الرجوع للسلة"
            className="grid h-11 w-11 place-items-center rounded-full border border-[var(--packora-border)] bg-white"
          >
            <X size={21} />
          </Link>

          <h1 className="text-xl font-semibold">إتمام الطلب</h1>

          <CreditCard size={24} />
        </header>

        <form id="checkout-form" onSubmit={submitOrder} className="px-6 py-6">
          {message ? (
            <div className="mb-5 rounded-[22px] border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-7 text-amber-800">
              {message}
            </div>
          ) : null}

          {settingsLoading ? (
            <div className="mb-5 rounded-[22px] border border-sky-200 bg-sky-50 p-4 text-sm font-semibold text-sky-800">
              جاري تحميل طرق الدفع والشحن الخاصة بالمتجر...
            </div>
          ) : null}

          {settings?.multipleMerchants ? (
            <div className="mb-5 rounded-[22px] border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-7 text-red-700">
              السلة تحتوي منتجات من أكثر من متجر. أكمل طلب كل متجر بشكل منفصل.
            </div>
          ) : null}

          {verifying ? (
            <div className="mb-5 rounded-[22px] border border-sky-200 bg-sky-50 p-4 text-sm font-semibold text-sky-800">
              لا تغلق الصفحة حتى يكتمل التحقق من الدفع.
            </div>
          ) : null}

          {settings?.merchant ? (
            <div className="mb-5 rounded-[22px] border border-[var(--packora-border)] bg-[var(--packora-soft-pink)] p-4 text-sm font-semibold text-[var(--packora-navy)]">
              الطلب من متجر: {settings.merchant.name}
            </div>
          ) : null}

          <section>
            <h2 className="text-2xl font-semibold">بيانات العميل</h2>

            <div className="mt-5 grid gap-4">
              <Field
                label="الاسم الكامل"
                value={form.customer}
                onChange={(value) => updateField("customer", value)}
              />
              <Field
                label="رقم الجوال"
                inputMode="tel"
                value={form.phone}
                onChange={(value) => updateField("phone", value)}
              />

              <label className="grid gap-2">
                <span className="text-sm text-[#6B7280]">المدينة</span>
                <select
                  required
                  value={form.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  className="rounded-[22px] border border-[var(--packora-border)] bg-white px-5 py-4 text-lg outline-none focus:border-[var(--packora-blue)]"
                >
                  <option value="" disabled>
                    اختر المدينة
                  </option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-[#6B7280]">العنوان السعودي</span>
                <textarea
                  required
                  value={form.address}
                  onChange={(event) => updateField("address", event.target.value)}
                  placeholder="الحي، الشارع، رقم المبنى، الرمز البريدي"
                  className="min-h-[132px] rounded-[22px] border border-[var(--packora-border)] bg-white px-5 py-4 text-lg leading-8 outline-none placeholder:text-[#9CA3AF] focus:border-[var(--packora-blue)]"
                />
              </label>
            </div>
          </section>

          <section className="mt-9 border-t border-[var(--packora-border)] pt-6">
            <h2 className="text-2xl font-semibold">طريقة الاستلام / الشحن</h2>

            {noShippingMethods ? (
              <p className="mt-5 rounded-[22px] border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-7 text-red-700">
                لا توجد طرق شحن متاحة لهذا المتجر حاليًا.
              </p>
            ) : (
              <div className="mt-5 grid gap-3">
                {settings?.shippingMethods.map((method) => (
                  <ShippingMethodCard
                    key={method.key}
                    method={method}
                    selected={selectedShippingKey === method.key}
                    onSelect={() => setSelectedShippingKey(method.key)}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="mt-9 border-t border-[var(--packora-border)] pt-6">
            <h2 className="text-2xl font-semibold">طريقة الدفع</h2>

            {noPaymentMethods ? (
              <p className="mt-5 rounded-[22px] border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-7 text-red-700">
                لا توجد طرق دفع متاحة لهذا المتجر حاليًا.
              </p>
            ) : (
              <div className="mt-5 grid gap-3">
                {paymentMethods.map((method) => (
                  <PaymentMethodCard
                    key={method.value}
                    method={method}
                    selected={paymentMethod === method.value}
                    onSelect={() => {
                      if (method.status !== "available") {
                        return;
                      }

                      setPaymentMethod(method.value);
                      setMessage("");
                    }}
                  />
                ))}
              </div>
            )}

            {isMoyasarSelected ? (
              <div className="mt-5 rounded-[26px] border border-[var(--packora-border)] p-4">
                {!publishableKey ? (
                  <p className="rounded-[20px] bg-rose-50 p-4 text-sm font-semibold leading-7 text-rose-700">
                    الدفع الإلكتروني غير مفعل حاليًا.
                  </p>
                ) : (
                  <>
                    <p className="mb-4 text-sm leading-7 text-[#6B7280]">
                      أدخل بيانات العميل والشحن أولًا، ثم أكمل الدفع من نموذج
                      Moyasar. لن يتم إنشاء الطلب إلا بعد نجاح الدفع.
                    </p>
                    <div className="mysr-form" />
                  </>
                )}
              </div>
            ) : null}

            {settings?.bankTransferEnabledWithoutAccount ? (
              <div className="mt-5 rounded-[22px] border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-7 text-amber-800">
                التحويل البنكي غير متاح لهذا المتجر لأن بيانات الحساب البنكي
                غير مكتملة.
              </div>
            ) : null}

            {paymentMethod === "bank_transfer" ? (
              <div className="mt-5 rounded-[26px] border border-[var(--packora-border)] bg-[var(--packora-soft-pink)] p-4">
                {settings?.bankAccount ? (
                  <div className="rounded-[22px] border border-[var(--packora-border)] bg-white p-4">
                    <p className="text-sm font-semibold text-[#111827]">
                      بيانات التحويل
                    </p>
                    <div className="mt-3 grid gap-2 text-sm leading-7 text-[#6B7280]">
                      <p>اسم المستفيد: {settings.bankAccount.beneficiaryName}</p>
                      <p>البنك: {settings.bankAccount.bankName}</p>
                      <p>الآيبان: {settings.bankAccount.iban}</p>
                      <p>رقم الحساب: {settings.bankAccount.accountNumber}</p>
                      {settings.bankAccount.transferNotes ? (
                        <p>ملاحظات: {settings.bankAccount.transferNotes}</p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <label className="mt-4 block">
                  <span className="block text-sm font-semibold text-[#111827]">
                    رفع إيصال التحويل
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-[#6B7280]">
                    ارفع صورة أو ملف PDF. لا يمكن إتمام طلب التحويل البنكي بدون
                    إيصال.
                  </span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={uploadBankTransferReceipt}
                    disabled={uploadingReceipt}
                    className="mt-4 block w-full rounded-2xl border border-[var(--packora-border)] bg-white p-3 text-sm"
                  />
                </label>

                {uploadingReceipt ? (
                  <p className="mt-3 rounded-2xl bg-sky-50 p-3 text-sm font-semibold text-sky-700">
                    جاري رفع الإيصال...
                  </p>
                ) : null}

                {bankTransferReceipt ? (
                  <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                    تم رفع الإيصال:{" "}
                    {bankTransferReceiptName || "ملف التحويل"}
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className="mt-9 border-t border-[var(--packora-border)] pt-6">
            <h2 className="text-2xl font-semibold">ملخص الطلب</h2>

            <div className="mt-5 grid gap-4">
              {items.length === 0 ? (
                <p className="rounded-[22px] bg-[var(--packora-soft-pink)] p-5 text-center text-[var(--packora-muted)]">
                  لا توجد منتجات في السلة.
                </p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 border-b border-[var(--packora-border)] pb-4"
                  >
                    <div>
                      <h3 className="text-base font-semibold">{item.name}</h3>
                      <p className="mt-1 text-sm text-[#6B7280]">
                        الكمية: {item.quantity}
                      </p>
                    </div>

                    <Price
                      amount={item.price * item.quantity}
                      className="text-base font-semibold text-[#111827]"
                    />
                  </div>
                ))
              )}

              <div className="rounded-[22px] border border-[var(--packora-border)] bg-[var(--packora-soft-pink)] p-4">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[#111827]">
                    كود الخصم
                  </span>
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={(event) => {
                        setCouponCode(event.target.value);
                        setCouponMessage("");
                      }}
                      placeholder="أدخل كود الخصم"
                      className="min-w-0 flex-1 rounded-2xl border border-[var(--packora-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--packora-blue)]"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={applyingCoupon}
                      className="rounded-2xl bg-[var(--packora-blue)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--packora-blue-dark)] disabled:bg-[#D1D5DB]"
                    >
                      {applyingCoupon ? "..." : "تطبيق"}
                    </button>
                  </div>
                </label>

                {couponMessage ? (
                  <p className="mt-3 text-sm font-semibold text-[#6B7280]">
                    {couponMessage}
                  </p>
                ) : null}
              </div>

              <SummaryRow label="المجموع الفرعي" amount={subtotal} />
              {couponDiscount > 0 ? (
                <SummaryRow label="الخصم" amount={-couponDiscount} />
              ) : null}
              <SummaryRow label="الشحن" amount={shippingCost} />
            </div>
          </section>
        </form>

        <section className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-[var(--packora-border)] bg-white px-6 py-5 shadow-[0_-16px_40px_rgba(236,72,153,0.10)]">
          <div className="flex items-center justify-between">
            <span className="text-base text-[#6B7280]">الإجمالي</span>
            <Price
              amount={total}
              className="text-3xl font-semibold text-[#111827]"
            />
          </div>

          <button
            form="checkout-form"
            disabled={
              loading ||
              verifying ||
              settingsLoading ||
              uploadingReceipt ||
              items.length === 0 ||
              Boolean(settings?.multipleMerchants) ||
              !paymentMethod ||
              !selectedShipping ||
              noPaymentMethods ||
              noShippingMethods ||
              (paymentMethod === "bank_transfer" && !bankTransferReceipt) ||
              paymentMethod === "tabby" ||
              paymentMethod === "tamara" ||
              (isMoyasarSelected && !publishableKey)
            }
            className="mt-5 w-full rounded-full bg-[var(--packora-blue)] py-4 text-center text-lg font-semibold text-white transition hover:bg-[var(--packora-blue-dark)] disabled:bg-[#D1D5DB]"
          >
            {loading
              ? "جاري تأكيد الطلب..."
              : isMoyasarSelected
                ? "أكمل الدفع الإلكتروني"
                : "تأكيد الطلب"}
          </button>
        </section>
      </section>
    </main>
  );
}

function buildPaymentMethods(settings: CheckoutSettings | null) {
  if (!settings) {
    return [];
  }

  const methods: PaymentOption[] = [];
  const services = settings.services;
  const raw = settings.rawServices || {};

  if (services.applePay || raw.applePay) {
    methods.push({
      value: "apple_pay",
      label: "Apple Pay",
      description: services.applePay
        ? "الدفع السريع عبر Apple Pay"
        : "غير مفعل حاليًا",
      icon: "Pay",
      status: services.applePay ? "available" : "disabled",
      dark: true,
    });
  }

  if (services.mada || raw.mada) {
    methods.push({
      value: "mada",
      label: "مدى",
      description: services.mada ? "الدفع عبر بطاقة مدى" : "غير مفعل حاليًا",
      icon: "مدى",
      status: services.mada ? "available" : "disabled",
    });
  }

  if (services.cards || raw.cards) {
    methods.push(
      {
        value: "visa",
        label: "Visa",
        description: services.cards ? "الدفع ببطاقة Visa" : "غير مفعل حاليًا",
        icon: "VISA",
        status: services.cards ? "available" : "disabled",
      },
      {
        value: "mastercard",
        label: "Mastercard",
        description: services.cards
          ? "الدفع ببطاقة Mastercard"
          : "غير مفعل حاليًا",
        icon: "MC",
        status: services.cards ? "available" : "disabled",
      }
    );
  }

  if (services.cod) {
    methods.push({
      value: "cod",
      label: "الدفع عند الاستلام",
      description: "ينشأ الطلب كغير مدفوع حتى الاستلام",
      icon: "COD",
      status: "available",
    });
  }

  if (settings.bankTransferAvailable || settings.bankTransferEnabledWithoutAccount) {
    methods.push({
      value: "bank_transfer",
      label: "تحويل بنكي",
      description: settings.bankTransferAvailable
        ? "ارفع إيصال التحويل لمراجعة الطلب"
        : "التحويل البنكي غير متاح لهذا المتجر",
      icon: "بنك",
      status: settings.bankTransferAvailable ? "available" : "disabled",
    });
  }

  if (raw.tabby || services.tabby) {
    methods.push({
      value: "tabby",
      label: "Tabby",
      description: "قسمها على دفعات",
      icon: "Tabby",
      status: "soon",
    });
  }

  if (raw.tamara || services.tamara) {
    methods.push({
      value: "tamara",
      label: "Tamara",
      description: "ادفعها على دفعات",
      icon: "Tamara",
      status: "soon",
    });
  }

  return methods;
}

function PaymentMethodCard({
  method,
  selected,
  onSelect,
}: {
  method: PaymentOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const disabled = method.status !== "available";
  const isApplePay = method.value === "apple_pay";

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`flex w-full items-center gap-4 rounded-[24px] border p-4 text-right transition ${
        isApplePay
          ? "border-[var(--packora-blue)] bg-[var(--packora-blue)] text-white"
          : selected
            ? "border-[var(--packora-blue)] bg-[var(--packora-light-pink)] text-[var(--packora-navy)]"
            : "border-[var(--packora-border)] bg-white text-[var(--packora-navy)]"
      } ${disabled ? "cursor-not-allowed opacity-55" : "hover:border-[var(--packora-blue)]"}`}
    >
      <span
        className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-sm font-black ${
          isApplePay
            ? "bg-white text-[var(--packora-blue)]"
            : "bg-[var(--packora-light-pink)] text-[var(--packora-navy)]"
        }`}
      >
        {method.icon}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block text-base font-semibold ${
            isApplePay ? "text-white" : "text-[#111827]"
          }`}
        >
          {method.label}
        </span>
        <span
          className={`mt-1 block text-sm leading-6 ${
            isApplePay ? "text-white/70" : "text-[#6B7280]"
          }`}
        >
          {method.description}
        </span>
      </span>

      <span
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
          method.status === "available"
            ? isApplePay
              ? "bg-white/15 text-white"
              : "bg-emerald-50 text-emerald-700"
            : method.status === "soon"
              ? "bg-amber-50 text-amber-700"
              : isApplePay
                ? "bg-white/15 text-white"
                : "bg-slate-100 text-slate-500"
        }`}
      >
        {getStatusLabel(method.status)}
      </span>
    </button>
  );
}

function ShippingMethodCard({
  method,
  selected,
  onSelect,
}: {
  method: ShippingMethod;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-[24px] border p-4 text-right transition ${
        selected
          ? "border-[var(--packora-blue)] bg-[var(--packora-light-pink)]"
          : "border-[var(--packora-border)] bg-white hover:border-[var(--packora-blue)]"
      }`}
    >
      <span className="flex items-start justify-between gap-4">
        <span>
          <span className="block text-base font-semibold text-[#111827]">
            {method.label}
          </span>
          {method.eta ? (
            <span className="mt-1 block text-sm text-[#6B7280]">
              مدة التوصيل: {method.eta}
            </span>
          ) : null}
          {method.notes ? (
            <span className="mt-1 block text-sm leading-6 text-[#6B7280]">
              {method.notes}
            </span>
          ) : null}
        </span>

        <Price
          amount={method.cost}
          className="shrink-0 text-base font-semibold text-[#111827]"
        />
      </span>
    </button>
  );
}

function SummaryRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#6B7280]">{label}</span>
      <Price amount={amount} className="font-semibold text-[#111827]" />
    </div>
  );
}

function CheckoutFallback() {
  return (
    <main dir="rtl" className="grid min-h-screen place-items-center bg-[var(--packora-soft-pink)] p-6">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-[var(--packora-light-pink)]" />
        <p className="mt-4 font-semibold text-[#6B7280]">
          جاري تجهيز الدفع...
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputMode?: "text" | "tel";
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm text-[#6B7280]">{label}</span>
      <input
        required
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        className="rounded-[22px] border border-[var(--packora-border)] bg-white px-5 py-4 text-lg outline-none placeholder:text-[#9CA3AF] focus:border-[var(--packora-blue)]"
      />
    </label>
  );
}

function normalizeSaudiPhone(phone: string) {
  return phone.replace(/[\s-]/g, "");
}

function isValidSaudiPhone(phone: string) {
  const normalized = normalizeSaudiPhone(phone);

  return /^05\d{8}$/.test(normalized) || /^9665\d{8}$/.test(normalized);
}

function buildOrderPayload(
  form: CheckoutForm,
  items: ReturnType<typeof useCartStore.getState>["items"],
  total: number,
  shippingMethod: ShippingMethod | null,
  totals?: {
    couponCode?: string;
    discountAmount?: number;
    subtotal?: number;
  }
) {
  const discountAmount = Math.max(Number(totals?.discountAmount || 0), 0);
  const subtotal = Math.max(
    Number(
      totals?.subtotal ??
        items.reduce(
          (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
          0
        )
    ),
    0
  );

  return {
    customer: form.customer.trim(),
    phone: normalizeSaudiPhone(form.phone.trim()),
    city: form.city.trim(),
    address: form.address.trim(),
    total,
    finalTotal: total,
    subtotal,
    couponCode: discountAmount > 0 ? totals?.couponCode?.trim() || null : null,
    discountAmount,
    shippingMethod: shippingMethod?.key || "",
    shippingProvider: shippingMethod?.label || "",
    shippingCost: shippingMethod?.cost || 0,
    shippingEta: shippingMethod?.eta || "",
    shippingNotes: shippingMethod?.notes || "",
    items: items.map((item) => ({
      id: item.id,
      productId: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
  };
}

function validateOrderPayload(payload: OrderPayload) {
  if (payload.items.length === 0) {
    return "السلة فارغة";
  }

  if (!payload.customer || !payload.phone || !payload.city || !payload.address) {
    return "أكمل بيانات العميل والعنوان قبل الدفع.";
  }

  if (!isValidSaudiPhone(payload.phone)) {
    return "رقم الجوال غير صحيح";
  }

  if (!payload.shippingMethod || !payload.shippingProvider) {
    return "اختر طريقة الشحن أو الاستلام.";
  }

  if (payload.total <= 0) {
    return "إجمالي الطلب غير صحيح.";
  }

  return "";
}

function isMoyasarMethod(method: PaymentMethod) {
  return moyasarPaymentMethods.includes(method);
}

function getMoyasarOptions(method: PaymentMethod) {
  if (method === "apple_pay") {
    return {
      methods: ["applepay"],
      supportedNetworks: ["mada", "visa", "mastercard"],
    };
  }

  if (method === "mada") {
    return {
      methods: ["creditcard"],
      supportedNetworks: ["mada"],
    };
  }

  if (method === "visa") {
    return {
      methods: ["creditcard"],
      supportedNetworks: ["visa"],
    };
  }

  if (method === "mastercard") {
    return {
      methods: ["creditcard"],
      supportedNetworks: ["mastercard"],
    };
  }

  return {
    methods: ["creditcard", "applepay"],
    supportedNetworks: ["mada", "visa", "mastercard"],
  };
}

function getStatusLabel(status: PaymentStatus) {
  if (status === "available") {
    return "متاح";
  }

  if (status === "soon") {
    return "قريبًا";
  }

  return "غير متاح";
}

function loadMoyasarAssets() {
  return new Promise<void>((resolve, reject) => {
    if (window.Moyasar) {
      resolve();
      return;
    }

    if (!document.getElementById(moyasarStyleId)) {
      const link = document.createElement("link");
      link.id = moyasarStyleId;
      link.rel = "stylesheet";
      link.href = "https://cdn.moyasar.com/mpf/1.7.3/moyasar.css";
      document.head.appendChild(link);
    }

    const existingScript = document.getElementById(
      moyasarScriptId
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = moyasarScriptId;
    script.src = "https://cdn.moyasar.com/mpf/1.7.3/moyasar.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.body.appendChild(script);
  });
}
