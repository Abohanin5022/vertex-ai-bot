import {
  type CheckoutOrder,
  type FulfillmentStatus,
  type ShippingQuote,
} from "@/lib/checkout";
import { normalizeProductInput, type ProductInput } from "@/lib/products";

export type StoredOrder = CheckoutOrder & {
  persisted?: boolean;
};

const fulfillmentStatusSet = new Set<FulfillmentStatus>([
  "new",
  "payment_review",
  "packing",
  "ready_to_ship",
  "shipped",
  "completed",
  "issue",
]);

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function isFulfillmentStatus(value: unknown): value is FulfillmentStatus {
  return typeof value === "string" && fulfillmentStatusSet.has(value as FulfillmentStatus);
}

export function normalizeStoredOrder(order: unknown): StoredOrder | null {
  if (!order || typeof order !== "object") {
    return null;
  }

  const candidate = order as Partial<StoredOrder>;

  if (!candidate.orderNumber || !candidate.product || !candidate.totals) {
    return null;
  }

  return {
    ...candidate,
    orderNumber: String(candidate.orderNumber),
    customerName: String(candidate.customerName ?? "عميل باكورة"),
    phone: String(candidate.phone ?? "05xxxxxxxx"),
    city: String(candidate.city ?? "الرياض"),
    district: String(candidate.district ?? "غير محدد"),
    address: String(candidate.address ?? "عنوان غير محدد"),
    product: normalizeProductInput(candidate.product as Partial<ProductInput>),
    quantity: Math.max(1, Math.round(numberValue(candidate.quantity, 1))),
    paymentMethod: candidate.paymentMethod ?? "cod",
    paymentLabel: String(candidate.paymentLabel ?? "دفع عند الاستلام"),
    paymentStatus: candidate.paymentStatus ?? "pending",
    fulfillmentStatus: isFulfillmentStatus(candidate.fulfillmentStatus)
      ? candidate.fulfillmentStatus
      : "new",
    shippingQuote: candidate.shippingQuote as ShippingQuote,
    totals: candidate.totals,
    createdAt: String(candidate.createdAt ?? new Date().toISOString()),
    persisted: Boolean(candidate.persisted),
  };
}

export function orderFromDatabaseRow(row: Record<string, unknown>): StoredOrder {
  const payload =
    row.payload && typeof row.payload === "object"
      ? (row.payload as Partial<StoredOrder>)
      : {};
  const quantity = Math.max(1, Math.round(numberValue(row.quantity, payload.quantity ?? 1)));
  const product = normalizeProductInput(
    (payload.product as Partial<ProductInput> | undefined) ?? {
      id: stringValue(row.product_id, "database-product"),
      name: stringValue(row.product_name, "منتج باكورة"),
      price: numberValue(row.subtotal) / quantity,
      stock: 1,
    },
  );
  const shippingQuote: ShippingQuote =
    payload.shippingQuote ?? {
      carrier: "spl",
      carrierName: stringValue(row.carrier, "SPL"),
      service: "شحن محلي",
      eta: "1-3 أيام",
      amount: numberValue(row.shipping_amount),
      cashOnDeliveryFee: numberValue(row.cod_fee),
      total: numberValue(row.shipping_amount) + numberValue(row.cod_fee),
      trackingNumber: stringValue(row.tracking_number, "PK-TRACK"),
      liveReady: true,
    };
  const fulfillmentStatus = isFulfillmentStatus(row.fulfillment_status)
    ? row.fulfillment_status
    : isFulfillmentStatus(payload.fulfillmentStatus)
      ? payload.fulfillmentStatus
      : "new";

  return {
    orderNumber: stringValue(row.order_number, String(payload.orderNumber ?? "")),
    customerName: stringValue(row.customer_name, payload.customerName ?? "عميل باكورة"),
    phone: stringValue(row.phone, payload.phone ?? "05xxxxxxxx"),
    city: stringValue(row.city, payload.city ?? "الرياض"),
    district: stringValue(row.district, payload.district ?? "غير محدد"),
    address: stringValue(row.address, payload.address ?? "عنوان غير محدد"),
    product,
    quantity,
    paymentMethod: payload.paymentMethod ?? "cod",
    paymentLabel: payload.paymentLabel ?? stringValue(row.payment_method, "دفع عند الاستلام"),
    paymentStatus: payload.paymentStatus ?? "pending",
    fulfillmentStatus,
    shippingQuote,
    totals: payload.totals ?? {
      subtotal: numberValue(row.subtotal),
      shipping: numberValue(row.shipping_amount),
      cashOnDeliveryFee: numberValue(row.cod_fee),
      vat: numberValue(row.vat_amount),
      total: numberValue(row.total),
    },
    createdAt: stringValue(row.created_at, payload.createdAt ?? new Date().toISOString()),
    persisted: true,
  };
}
