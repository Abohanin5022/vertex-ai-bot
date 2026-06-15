import type { Product } from "@/lib/products";

export type CarrierCode = "spl" | "smsa" | "aramex" | "imile" | "jt" | "redbox";
export type PaymentMethodCode =
  | "cod"
  | "bank_transfer"
  | "moyasar"
  | "hyperpay"
  | "paytabs"
  | "tamara"
  | "tabby";

export type ShippingQuote = {
  carrier: CarrierCode;
  carrierName: string;
  service: string;
  eta: string;
  amount: number;
  cashOnDeliveryFee: number;
  total: number;
  trackingNumber: string;
  liveReady: boolean;
};

export type CheckoutTotals = {
  subtotal: number;
  shipping: number;
  cashOnDeliveryFee: number;
  vat: number;
  total: number;
};

export type FulfillmentStatus =
  | "new"
  | "payment_review"
  | "packing"
  | "ready_to_ship"
  | "shipped"
  | "completed"
  | "issue";

export type CheckoutOrder = {
  orderNumber: string;
  customerName: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  product: Product;
  quantity: number;
  paymentMethod: PaymentMethodCode;
  paymentLabel: string;
  paymentStatus: "pending" | "paid" | "manual_review";
  fulfillmentStatus: FulfillmentStatus;
  shippingQuote: ShippingQuote;
  totals: CheckoutTotals;
  createdAt: string;
};

const majorCities = ["الرياض", "جدة", "مكة", "المدينة", "الدمام", "الخبر"];
const vatRate = 0.15;

export const saudiCities = [
  "الرياض",
  "جدة",
  "مكة",
  "المدينة",
  "الدمام",
  "الخبر",
  "الطائف",
  "بريدة",
  "تبوك",
  "أبها",
  "حائل",
  "جازان",
];

export const paymentMethods: {
  code: PaymentMethodCode;
  label: string;
  description: string;
  immediate: boolean;
}[] = [
  {
    code: "cod",
    label: "دفع عند الاستلام",
    description: "يعمل فورًا مع رسوم تحصيل واضحة على الطلب.",
    immediate: true,
  },
  {
    code: "bank_transfer",
    label: "تحويل بنكي",
    description: "يعرض الطلب بانتظار مراجعة التحويل من فريق التشغيل.",
    immediate: true,
  },
  {
    code: "moyasar",
    label: "مدى / Apple Pay / بطاقة",
    description: "بوابة Moyasar للمدفوعات السعودية عند إضافة مفاتيح البيئة.",
    immediate: false,
  },
  {
    code: "hyperpay",
    label: "HyperPay",
    description: "خيار بوابة دفع للبطاقات والمحافظ بعد اعتماد حساب التاجر.",
    immediate: false,
  },
  {
    code: "paytabs",
    label: "PayTabs",
    description: "مناسب لروابط الدفع والفواتير والدفع الإلكتروني.",
    immediate: false,
  },
  {
    code: "tamara",
    label: "تمارا",
    description: "اشتر الآن وادفع لاحقًا عند تفعيل حساب تمارا.",
    immediate: false,
  },
  {
    code: "tabby",
    label: "تابي",
    description: "خيار تمويل وتقسيط للعميل بعد إضافة مفاتيح Tabby.",
    immediate: false,
  },
];

export const fulfillmentStatuses: {
  code: FulfillmentStatus;
  label: string;
  customerLabel: string;
  detail: string;
}[] = [
  {
    code: "new",
    label: "طلب جديد",
    customerLabel: "تم استلام الطلب",
    detail: "بانتظار مراجعة فريق التاجر.",
  },
  {
    code: "payment_review",
    label: "مراجعة الدفع",
    customerLabel: "الدفع قيد المراجعة",
    detail: "يحتاج تأكيد تحويل أو بوابة دفع.",
  },
  {
    code: "packing",
    label: "قيد التجهيز",
    customerLabel: "يتم تجهيز الطلب",
    detail: "الفريق يجهز المنتجات والفاتورة.",
  },
  {
    code: "ready_to_ship",
    label: "جاهز للشحن",
    customerLabel: "جاهز للتسليم لشركة الشحن",
    detail: "تمت الطباعة والتغليف.",
  },
  {
    code: "shipped",
    label: "تم الشحن",
    customerLabel: "الطلب مع شركة الشحن",
    detail: "يمكن متابعة رقم التتبع.",
  },
  {
    code: "completed",
    label: "مكتمل",
    customerLabel: "تم تسليم الطلب",
    detail: "انتهت دورة الطلب.",
  },
  {
    code: "issue",
    label: "مشكلة",
    customerLabel: "نحتاج مراجعة الطلب",
    detail: "يوجد نقص في البيانات أو المخزون أو الدفع.",
  },
];

export const carriers: {
  code: CarrierCode;
  name: string;
  service: string;
  etaMajor: string;
  etaOther: string;
  baseFee: number;
  extraKgFee: number;
  codFee: number;
  supportsCod: boolean;
  liveReady: boolean;
}[] = [
  {
    code: "spl",
    name: "SPL",
    service: "شحن محلي",
    etaMajor: "1-3 أيام",
    etaOther: "2-5 أيام",
    baseFee: 18,
    extraKgFee: 4,
    codFee: 7,
    supportsCod: true,
    liveReady: true,
  },
  {
    code: "smsa",
    name: "SMSA",
    service: "توصيل سريع",
    etaMajor: "1-2 يوم",
    etaOther: "2-4 أيام",
    baseFee: 24,
    extraKgFee: 5,
    codFee: 9,
    supportsCod: true,
    liveReady: true,
  },
  {
    code: "aramex",
    name: "Aramex",
    service: "شحن سريع",
    etaMajor: "1-3 أيام",
    etaOther: "2-5 أيام",
    baseFee: 26,
    extraKgFee: 5,
    codFee: 10,
    supportsCod: true,
    liveReady: true,
  },
  {
    code: "imile",
    name: "iMile",
    service: "تجارة إلكترونية",
    etaMajor: "1-3 أيام",
    etaOther: "2-5 أيام",
    baseFee: 20,
    extraKgFee: 4,
    codFee: 8,
    supportsCod: true,
    liveReady: false,
  },
  {
    code: "jt",
    name: "J&T",
    service: "اقتصادي",
    etaMajor: "2-4 أيام",
    etaOther: "3-6 أيام",
    baseFee: 17,
    extraKgFee: 4,
    codFee: 8,
    supportsCod: true,
    liveReady: false,
  },
  {
    code: "redbox",
    name: "RedBox",
    service: "استلام من الخزائن",
    etaMajor: "حسب الخزنة",
    etaOther: "غير متاح غالبًا",
    baseFee: 14,
    extraKgFee: 3,
    codFee: 0,
    supportsCod: false,
    liveReady: false,
  },
];

export function getPaymentLabel(paymentMethod: PaymentMethodCode) {
  return paymentMethods.find((method) => method.code === paymentMethod)?.label ?? "غير محدد";
}

export function getFulfillmentStatus(status: FulfillmentStatus) {
  return fulfillmentStatuses.find((item) => item.code === status) ?? fulfillmentStatuses[0];
}

export function initialFulfillmentStatus(paymentMethod: PaymentMethodCode): FulfillmentStatus {
  return paymentMethod === "bank_transfer" ? "payment_review" : "new";
}

export function getCarrierQuotes(params: {
  city: string;
  weightKg: number;
  subtotal: number;
  paymentMethod: PaymentMethodCode;
}): ShippingQuote[] {
  const isMajorCity = majorCities.includes(params.city);
  const chargeableWeight = Math.max(1, Math.ceil(params.weightKg));

  return carriers
    .filter((carrier) => params.paymentMethod !== "cod" || carrier.supportsCod)
    .map((carrier) => {
      const remoteFee = isMajorCity ? 0 : 6;
      const amount = carrier.baseFee + (chargeableWeight - 1) * carrier.extraKgFee + remoteFee;
      const cashOnDeliveryFee = params.paymentMethod === "cod" ? carrier.codFee : 0;

      return {
        carrier: carrier.code,
        carrierName: carrier.name,
        service: carrier.service,
        eta: isMajorCity ? carrier.etaMajor : carrier.etaOther,
        amount,
        cashOnDeliveryFee,
        total: amount + cashOnDeliveryFee,
        trackingNumber: `PK-${carrier.code.toUpperCase()}-${Date.now().toString().slice(-7)}`,
        liveReady: carrier.liveReady,
      };
    });
}

export function calculateTotals(params: {
  product: Product;
  quantity: number;
  shippingQuote: ShippingQuote;
}): CheckoutTotals {
  const subtotal = params.product.price * params.quantity;
  const shipping = params.shippingQuote.amount;
  const cashOnDeliveryFee = params.shippingQuote.cashOnDeliveryFee;
  const vat = Math.round((subtotal + shipping + cashOnDeliveryFee) * vatRate);

  return {
    subtotal,
    shipping,
    cashOnDeliveryFee,
    vat,
    total: subtotal + shipping + cashOnDeliveryFee + vat,
  };
}

export function createOrderNumber() {
  const date = new Date();
  const ymd = date.toISOString().slice(0, 10).replaceAll("-", "");
  return `PKR-${ymd}-${date.getTime().toString().slice(-5)}`;
}
