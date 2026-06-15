import {
  calculateTotals,
  createOrderNumber,
  getCarrierQuotes,
  getPaymentLabel,
  initialFulfillmentStatus,
  type CarrierCode,
  type CheckoutOrder,
  type PaymentMethodCode,
} from "@/lib/checkout";
import { normalizeProductInput, type ProductInput } from "@/lib/products";
import {
  createSupabaseAdminClient,
  createSupabaseClient,
  hasSupabaseAdminConfig,
  hasSupabaseConfig,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

type CheckoutPayload = {
  customerName?: string;
  phone?: string;
  city?: string;
  district?: string;
  address?: string;
  product?: Record<string, unknown>;
  quantity?: number;
  paymentMethod?: PaymentMethodCode;
  carrier?: CarrierCode;
};

async function persistOrder(order: CheckoutOrder) {
  if (!hasSupabaseConfig()) {
    return false;
  }

  const supabase = hasSupabaseAdminConfig()
    ? createSupabaseAdminClient()
    : createSupabaseClient();

  try {
    const { error } = await supabase.from("orders").insert({
      order_number: order.orderNumber,
      customer_name: order.customerName,
      phone: order.phone,
      city: order.city,
      district: order.district,
      address: order.address,
      product_id: String(order.product.id),
      product_name: order.product.name,
      quantity: order.quantity,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      fulfillment_status: order.fulfillmentStatus,
      carrier: order.shippingQuote.carrierName,
      tracking_number: order.shippingQuote.trackingNumber,
      subtotal: order.totals.subtotal,
      shipping_amount: order.totals.shipping,
      cod_fee: order.totals.cashOnDeliveryFee,
      vat_amount: order.totals.vat,
      total: order.totals.total,
      payload: order,
    });

    return !error;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CheckoutPayload;
    const product = normalizeProductInput((payload.product ?? {}) as Partial<ProductInput>);
    const quantity = Math.max(1, Math.round(Number(payload.quantity ?? 1)));
    const paymentMethod = payload.paymentMethod ?? "cod";
    const city = payload.city?.trim() || "الرياض";
    const quotes = getCarrierQuotes({
      city,
      weightKg: product.weightKg * quantity,
      subtotal: product.price * quantity,
      paymentMethod,
    });
    const shippingQuote =
      quotes.find((quote) => quote.carrier === payload.carrier) ?? quotes[0];

    if (!shippingQuote) {
      return Response.json(
        { ok: false, message: "لا توجد شركة شحن مناسبة لطريقة الدفع المحددة." },
        { status: 400 },
      );
    }

    const order: CheckoutOrder = {
      orderNumber: createOrderNumber(),
      customerName: payload.customerName?.trim() || "عميل باكورة",
      phone: payload.phone?.trim() || "05xxxxxxxx",
      city,
      district: payload.district?.trim() || "غير محدد",
      address: payload.address?.trim() || "عنوان غير محدد",
      product,
      quantity,
      paymentMethod,
      paymentLabel: getPaymentLabel(paymentMethod),
      paymentStatus: paymentMethod === "bank_transfer" ? "manual_review" : "pending",
      fulfillmentStatus: initialFulfillmentStatus(paymentMethod),
      shippingQuote,
      totals: calculateTotals({ product, quantity, shippingQuote }),
      createdAt: new Date().toISOString(),
    };

    const persisted = await persistOrder(order);
    const paymentConfigured = {
      cod: true,
      bank_transfer: true,
      moyasar: Boolean(
        process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY && process.env.MOYASAR_SECRET_KEY,
      ),
      hyperpay: Boolean(process.env.HYPERPAY_ENTITY_ID && process.env.HYPERPAY_ACCESS_TOKEN),
      paytabs: Boolean(process.env.PAYTABS_PROFILE_ID && process.env.PAYTABS_SERVER_KEY),
      tamara: Boolean(process.env.TAMARA_API_TOKEN),
      tabby: Boolean(process.env.TABBY_SECRET_KEY && process.env.TABBY_MERCHANT_CODE),
    };

    return Response.json({
      ok: true,
      order,
      persisted,
      payment: {
        method: paymentMethod,
        label: order.paymentLabel,
        configured: paymentConfigured[paymentMethod],
        gateways: paymentConfigured,
        bankName: process.env.BANK_NAME ?? "حساب باكورة البنكي",
        bankIban: process.env.BANK_IBAN ?? "أضف IBAN في ملف البيئة",
      },
    });
  } catch {
    return Response.json(
      { ok: false, message: "تعذر إنشاء الطلب. تحقق من بيانات العميل والمنتج." },
      { status: 400 },
    );
  }
}
