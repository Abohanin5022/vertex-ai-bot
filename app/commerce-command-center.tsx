"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  calculateTotals,
  carriers,
  createOrderNumber,
  getCarrierQuotes,
  getFulfillmentStatus,
  getPaymentLabel,
  initialFulfillmentStatus,
  paymentMethods,
  saudiCities,
  type CarrierCode,
  type CheckoutOrder,
  type FulfillmentStatus,
  type PaymentMethodCode,
} from "@/lib/checkout";
import type { IntegrationType } from "@/lib/integrations";
import { normalizeStoredOrder, type StoredOrder } from "@/lib/orders";
import type { Product } from "@/lib/products";
import type { SetupProviderStatus } from "@/lib/setup-status";
import { localOrdersKey, localProductsKey } from "@/lib/storage-keys";

const formatter = {
  format(value: number) {
    return `${new Intl.NumberFormat("ar-SA", {
      maximumFractionDigits: 0,
    }).format(value)} ﷼`;
  },
};

type CommandView = "command" | "catalog" | "product" | "order" | "fulfillment" | "setup";
type StockFilter = "all" | "available" | "low";

type CommerceCommandCenterProps = {
  products: Product[];
  setupStatus: SetupProviderStatus[];
};

type ProductDraft = {
  name: string;
  sku: string;
  category: string;
  description: string;
  price: string;
  stock: string;
  weightKg: string;
  shippingProfile: string;
  imageUrl: string;
};

type CheckoutDraft = {
  customerName: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  quantity: string;
};

const commandViews: { label: string; value: CommandView }[] = [
  { label: "مركز القيادة", value: "command" },
  { label: "الكتالوج", value: "catalog" },
  { label: "منتج جديد", value: "product" },
  { label: "طلب ودفع", value: "order" },
  { label: "الشحن", value: "fulfillment" },
  { label: "الإطلاق", value: "setup" },
];

const categoryOptions = [
  "البلاستيكيات",
  "مستلزمات الشحن",
  "علب ورقية",
  "القهوة والمشروبات",
  "الأكياس",
  "الهدايا والتوزيعات",
  "الملصقات والطباعة",
  "المطبخ والألمنيوم",
  "منتجات عامة",
];

const shippingProfiles = ["خفيف", "شحن عادي", "قابل للكسر", "كبير الحجم"];

const stockFilters: { label: string; value: StockFilter }[] = [
  { label: "الكل", value: "all" },
  { label: "متوفر", value: "available" },
  { label: "منخفض", value: "low" },
];

const integrationTypeLabels: Record<IntegrationType, string> = {
  database: "بيانات",
  payment: "دفع",
  finance: "تمويل",
  shipping: "شحن",
  control: "تسليم",
};

const pipelineColors: Record<FulfillmentStatus, string> = {
  new: "bg-sky-600",
  payment_review: "bg-indigo-600",
  packing: "bg-amber-600",
  ready_to_ship: "bg-emerald-600",
  shipped: "bg-cyan-600",
  completed: "bg-slate-600",
  issue: "bg-rose-600",
};

const visiblePipelineStatuses: FulfillmentStatus[] = [
  "new",
  "payment_review",
  "packing",
  "ready_to_ship",
  "shipped",
  "issue",
];

const defaultDraft: ProductDraft = {
  name: "",
  sku: "",
  category: categoryOptions[0],
  description: "",
  price: "",
  stock: "",
  weightKg: "0.25",
  shippingProfile: "شحن عادي",
  imageUrl: "/products/shipping-box.svg",
};

const defaultCheckout: CheckoutDraft = {
  customerName: "عميل باكورة",
  phone: "05",
  city: "الرياض",
  district: "",
  address: "",
  quantity: "1",
};

const productTemplates: ProductDraft[] = [
  {
    name: "كرتون شحن متاجر",
    sku: "PK-SHP-",
    category: "مستلزمات الشحن",
    description: "كرتون مموج للطلبات اليومية مع مساحة ملصق شحن واضحة.",
    price: "12",
    stock: "50",
    weightKg: "0.35",
    shippingProfile: "شحن عادي",
    imageUrl: "/products/shipping-box.svg",
  },
  {
    name: "باقة أكياس ورقية",
    sku: "PK-BAG-",
    category: "الأكياس",
    description: "أكياس حمل قابلة للطباعة للمتاجر والهدايا.",
    price: "9",
    stock: "80",
    weightKg: "0.16",
    shippingProfile: "خفيف",
    imageUrl: "/products/paper-bag.svg",
  },
  {
    name: "عبوات بلاستيكية شفافة",
    sku: "PK-PLS-",
    category: "البلاستيكيات",
    description: "عبوات خفيفة للمتاجر والأسر المنتجة مع غطاء محكم.",
    price: "13",
    stock: "70",
    weightKg: "0.22",
    shippingProfile: "خفيف",
    imageUrl: "/products/gift-box.svg",
  },
  {
    name: "علب تقديم موسمية",
    sku: "PK-BOX-",
    category: "علب ورقية",
    description: "علب تقديم للطلبات الموسمية والمطاعم والأسر المنتجة.",
    price: "18",
    stock: "40",
    weightKg: "0.2",
    shippingProfile: "قابل للكسر",
    imageUrl: "/products/paper-box.svg",
  },
];

function toNumber(value: string, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function readStoredArray<T>(key: string): T[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredArray<T>(key: string, value: T[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function isProduct(product: unknown): product is Product {
  if (!product || typeof product !== "object") {
    return false;
  }

  const candidate = product as Partial<Product>;
  return Boolean(candidate.name && candidate.sku && candidate.category);
}

function mergeProducts(serverProducts: Product[], localProducts: Product[]) {
  const seen = new Set<string>();

  return [...localProducts, ...serverProducts].filter((product) => {
    const key = String(product.id);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return Boolean(product.name);
  });
}

function mergeOrders(currentOrders: StoredOrder[], incomingOrders: StoredOrder[]) {
  const seen = new Set<string>();

  return [...incomingOrders, ...currentOrders]
    .filter((order) => {
      if (seen.has(order.orderNumber)) {
        return false;
      }

      seen.add(order.orderNumber);
      return true;
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 80);
}

function escapeCsvValue(value: string | number) {
  const text = String(value);

  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function downloadCsv(products: Product[]) {
  const header = ["المنتج", "SKU", "التصنيف", "الوصف", "السعر", "المخزون", "الوزن", "الشحن"];
  const rows = products.map((product) => [
    product.name,
    product.sku,
    product.category,
    product.description,
    product.price,
    product.stock,
    product.weightKg,
    product.shippingProfile,
  ]);
  const csv = [header, ...rows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "packora-command-catalog.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function paymentStatusFor(paymentMethod: PaymentMethodCode): CheckoutOrder["paymentStatus"] {
  return paymentMethod === "bank_transfer" ? "manual_review" : "pending";
}

export function CommerceCommandCenter({ products, setupStatus }: CommerceCommandCenterProps) {
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(products);
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [view, setView] = useState<CommandView>("command");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("الكل");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [draft, setDraft] = useState<ProductDraft>(defaultDraft);
  const [checkoutDraft, setCheckoutDraft] = useState<CheckoutDraft>(defaultCheckout);
  const [selectedProductId, setSelectedProductId] = useState(String(products[0]?.id ?? ""));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodCode>("cod");
  const [carrier, setCarrier] = useState<CarrierCode>("spl");
  const [productStatus, setProductStatus] = useState("");
  const [checkoutStatus, setCheckoutStatus] = useState("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  useEffect(() => {
    let isActive = true;
    const timer = window.setTimeout(() => {
      const storedProducts = readStoredArray<Product>(localProductsKey).filter(isProduct);
      const mergedProducts = mergeProducts(products, storedProducts);
      const storedOrders = readStoredArray<unknown>(localOrdersKey)
        .map(normalizeStoredOrder)
        .filter((order): order is StoredOrder => Boolean(order));

      setCatalogProducts(mergedProducts);
      setOrders(storedOrders);
      setSelectedProductId((current) => current || String(mergedProducts[0]?.id ?? ""));

      fetch("/api/orders")
        .then((response) => response.json())
        .then((result: { orders?: unknown[] }) => {
          if (!isActive || !Array.isArray(result.orders)) {
            return;
          }

          const remoteOrders = result.orders
            .map(normalizeStoredOrder)
            .filter((order): order is StoredOrder => Boolean(order));

          setOrders((current) => mergeOrders(current, remoteOrders));
        })
        .catch(() => undefined);
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [products]);

  const configuredIntegrations = setupStatus.filter((provider) => provider.isConfigured).length;
  const setupProgress = Math.round((configuredIntegrations / Math.max(1, setupStatus.length)) * 100);
  const categories = useMemo(() => {
    return ["الكل", ...Array.from(new Set(catalogProducts.map((product) => product.category)))];
  }, [catalogProducts]);
  const selectedProduct = useMemo(() => {
    return catalogProducts.find((product) => String(product.id) === selectedProductId) ?? catalogProducts[0];
  }, [catalogProducts, selectedProductId]);
  const quantity = Math.max(1, Math.round(toNumber(checkoutDraft.quantity, 1)));
  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ar-SA");

    return catalogProducts.filter((product) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [product.name, product.description, product.sku, product.category]
          .join(" ")
          .toLocaleLowerCase("ar-SA")
          .includes(normalizedQuery);
      const matchesCategory = categoryFilter === "الكل" || product.category === categoryFilter;
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "available" && product.stock > 20) ||
        (stockFilter === "low" && product.stock <= 20);

      return matchesQuery && matchesCategory && matchesStock;
    });
  }, [catalogProducts, categoryFilter, query, stockFilter]);
  const totalStock = catalogProducts.reduce((sum, product) => sum + product.stock, 0);
  const inventoryValue = catalogProducts.reduce(
    (sum, product) => sum + product.stock * product.price,
    0,
  );
  const lowStock = catalogProducts.filter((product) => product.stock <= 20);
  const dealProducts = useMemo(() => {
    return catalogProducts.slice(0, 4).map((product, index) => ({
      product,
      quantity: [10, 25, 50, 100][index] ?? 10,
      tag: ["صفقة بداية", "طلب مطعم", "تجهيز متجر", "توريد شهري"][index] ?? "صفقة",
    }));
  }, [catalogProducts]);
  const orderPipeline = useMemo(() => {
    return visiblePipelineStatuses.map((status) => {
      const statusConfig = getFulfillmentStatus(status);

      return {
        label: statusConfig.label,
        value: String(orders.filter((order) => order.fulfillmentStatus === status).length),
        color: pipelineColors[status],
      };
    });
  }, [orders]);
  const shippingQuotes = useMemo(() => {
    if (!selectedProduct) {
      return [];
    }

    return getCarrierQuotes({
      city: checkoutDraft.city,
      weightKg: selectedProduct.weightKg * quantity,
      subtotal: selectedProduct.price * quantity,
      paymentMethod,
    });
  }, [checkoutDraft.city, paymentMethod, quantity, selectedProduct]);
  const selectedQuote = useMemo(() => {
    return shippingQuotes.find((quote) => quote.carrier === carrier) ?? shippingQuotes[0];
  }, [carrier, shippingQuotes]);
  const totals =
    selectedProduct && selectedQuote
      ? calculateTotals({ product: selectedProduct, quantity, shippingQuote: selectedQuote })
      : null;

  function updateDraft(field: keyof ProductDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function updateCheckout(field: keyof CheckoutDraft, value: string) {
    setCheckoutDraft((current) => ({ ...current, [field]: value }));
  }

  function uploadProductImage(file: File | undefined) {
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateDraft("imageUrl", reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function applyTemplate(template: ProductDraft) {
    setDraft({
      ...template,
      sku: `${template.sku}${String(catalogProducts.length + 1).padStart(3, "0")}`,
    });
    setView("product");
  }

  function storeProduct(product: Product) {
    const storedProducts = readStoredArray<Product>(localProductsKey).filter(isProduct);
    const nextProducts = mergeProducts([], [product, ...storedProducts]).slice(0, 200);

    writeStoredArray(localProductsKey, nextProducts);
    setCatalogProducts((current) => mergeProducts(current, [product]));
    setSelectedProductId(String(product.id));
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingProduct(true);
    setProductStatus("جاري حفظ المنتج...");

    const nextProduct: Product = {
      id: `local-${Date.now()}`,
      name: draft.name.trim() || "منتج جديد",
      sku: draft.sku.trim() || `PK-${Date.now().toString().slice(-5)}`,
      category: draft.category,
      description: draft.description.trim() || "وصف مختصر للمنتج.",
      price: Math.max(0, toNumber(draft.price)),
      stock: Math.max(0, Math.round(toNumber(draft.stock))),
      weightKg: Math.max(0.01, toNumber(draft.weightKg, 0.25)),
      shippingProfile: draft.shippingProfile,
      imageUrl: draft.imageUrl,
    };

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextProduct),
      });
      const result = (await response.json()) as { product?: Product; persisted?: boolean };
      const savedProduct = result.product ?? nextProduct;

      storeProduct(savedProduct);
      setProductStatus(result.persisted ? "تم الحفظ في قاعدة البيانات." : "تم الحفظ محليًا.");
    } catch {
      storeProduct(nextProduct);
      setProductStatus("تم الحفظ محليًا.");
    } finally {
      setDraft(defaultDraft);
      setIsSavingProduct(false);
      setView("catalog");
    }
  }

  function buildLocalOrder(): StoredOrder | null {
    if (!selectedProduct || !selectedQuote) {
      return null;
    }

    return {
      orderNumber: createOrderNumber(),
      customerName: checkoutDraft.customerName.trim() || "عميل باكورة",
      phone: checkoutDraft.phone.trim() || "05xxxxxxxx",
      city: checkoutDraft.city,
      district: checkoutDraft.district.trim() || "غير محدد",
      address: checkoutDraft.address.trim() || "عنوان غير محدد",
      product: selectedProduct,
      quantity,
      paymentMethod,
      paymentLabel: getPaymentLabel(paymentMethod),
      paymentStatus: paymentStatusFor(paymentMethod),
      fulfillmentStatus: initialFulfillmentStatus(paymentMethod),
      shippingQuote: selectedQuote,
      totals: calculateTotals({ product: selectedProduct, quantity, shippingQuote: selectedQuote }),
      createdAt: new Date().toISOString(),
      persisted: false,
    };
  }

  function storeOrder(order: StoredOrder) {
    const nextOrders = mergeOrders(orders, [order]).slice(0, 50);

    setOrders(nextOrders);
    writeStoredArray(localOrdersKey, nextOrders);
  }

  function updateOrderStatus(orderNumber: string, fulfillmentStatus: FulfillmentStatus) {
    setOrders((current) => {
      const nextOrders = current.map((order) =>
        order.orderNumber === orderNumber
          ? { ...order, fulfillmentStatus }
          : order,
      );

      writeStoredArray(localOrdersKey, nextOrders);
      return nextOrders;
    });

    fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, fulfillmentStatus }),
    }).catch(() => undefined);
  }

  async function createOrder() {
    if (!selectedProduct || !selectedQuote) {
      setCheckoutStatus("اختر منتجًا وشركة شحن.");
      return;
    }

    setIsCreatingOrder(true);
    setCheckoutStatus("جاري إنشاء الطلب...");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...checkoutDraft,
          quantity,
          product: selectedProduct,
          paymentMethod,
          carrier: selectedQuote.carrier,
        }),
      });
      const result = (await response.json()) as {
        order?: StoredOrder;
        persisted?: boolean;
        message?: string;
      };

      if (!response.ok || !result.order) {
        throw new Error(result.message ?? "checkout_failed");
      }

      storeOrder({ ...result.order, persisted: result.persisted });
      setCheckoutStatus(result.persisted ? "تم إنشاء الطلب وحفظه." : "تم إنشاء الطلب محليًا.");
    } catch {
      const localOrder = buildLocalOrder();

      if (localOrder) {
        storeOrder(localOrder);
        setCheckoutStatus("تم إنشاء الطلب محليًا.");
      } else {
        setCheckoutStatus("تعذر إنشاء الطلب.");
      }
    } finally {
      setIsCreatingOrder(false);
      setView("order");
    }
  }

  return (
    <section className="mt-6 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="min-w-0 space-y-5">
        <div className="rounded-lg border border-emerald-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold text-emerald-700">Packora Merchant Console</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">لوحة التاجر المستقلة</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setView("product")}
                className="h-10 rounded-md bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800"
              >
                منتج جديد
              </button>
              <Link
                href="/customer"
                className="flex h-10 items-center justify-center rounded-md border border-sky-200 bg-sky-50 px-4 text-sm font-bold text-sky-900 transition hover:bg-sky-100"
              >
                واجهة العميل
              </Link>
              <Link
                href="/track"
                className="flex h-10 items-center justify-center rounded-md border border-emerald-200 bg-white px-4 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50"
              >
                التتبع
              </Link>
            </div>
          </div>

          <div className="grid gap-2 p-2 text-sm md:grid-cols-6" role="tablist" aria-label="مركز القيادة">
            {commandViews.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={view === item.value}
                onClick={() => setView(item.value)}
                className={`h-11 rounded-md px-3 font-bold transition ${
                  view === item.value
                    ? "bg-emerald-700 text-white"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {view === "command" ? (
          <>
            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "قيمة المخزون", value: formatter.format(inventoryValue), tone: "border-sky-500" },
                { label: "إجمالي الوحدات", value: String(totalStock), tone: "border-indigo-500" },
                { label: "تنبيهات مخزون", value: String(lowStock.length), tone: "border-rose-500" },
                { label: "جاهزية الإطلاق", value: `${setupProgress}%`, tone: "border-emerald-500" },
              ].map((metric) => (
                <article key={metric.label} className={`rounded-lg border bg-white p-4 ${metric.tone}`}>
                  <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
                  <p className="mt-3 text-3xl font-black text-slate-950">{metric.value}</p>
                </article>
              ))}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-950">مسار الطلبات</h3>
                  <p className="mt-1 text-sm text-slate-500">من الدفع حتى بوليصة الشحن</p>
                </div>
                <span className="rounded-md bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                  {orders.length} طلب محفوظ في الجلسة
                </span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-5">
                {orderPipeline.map((step) => (
                  <article key={step.label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <span className={`block h-1.5 rounded-full ${step.color}`} />
                    <p className="mt-3 text-sm font-semibold text-slate-500">{step.label}</p>
                    <p className="mt-2 text-2xl font-black text-slate-950">{step.value}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-950">صفقات جاهزة للبيع</h3>
                  <p className="mt-1 text-sm text-slate-500">باقات كمية قابلة للتحويل مباشرة إلى طلب</p>
                </div>
                <button
                  type="button"
                  onClick={() => setView("catalog")}
                  className="h-10 rounded-md border border-slate-300 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  فتح الكتالوج
                </button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
                {dealProducts.map((deal) => (
                  <article key={deal.product.id} className="rounded-lg border border-emerald-100 bg-[#fbfdf9] p-4">
                    <ProductVisual product={deal.product} className="h-36" />
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-indigo-700">{deal.tag}</p>
                        <h4 className="mt-2 font-black text-slate-950">{deal.product.name}</h4>
                      </div>
                      <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900">
                        {deal.quantity} قطعة
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{deal.product.category}</p>
                    <p className="mt-4 text-2xl font-black text-slate-950">
                      {formatter.format(deal.product.price * deal.quantity)}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProductId(String(deal.product.id));
                        setCheckoutDraft((current) => ({ ...current, quantity: String(deal.quantity) }));
                        setView("order");
                      }}
                      className="mt-4 h-10 w-full rounded-md bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800"
                    >
                      تجهيز الطلب
                    </button>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {view === "catalog" ? (
          <section className="rounded-lg border border-slate-200 bg-white">
            <div className="grid gap-3 border-b border-slate-200 p-4 xl:grid-cols-[1fr_auto] xl:items-center">
              <div>
                <h3 className="text-lg font-black text-slate-950">إدارة الكتالوج</h3>
                <p className="mt-1 text-sm text-slate-500">{filteredProducts.length} من {catalogProducts.length}</p>
              </div>
              <div className="grid gap-2 md:grid-cols-[minmax(180px,1fr)_180px_130px_auto]">
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="بحث باسم المنتج أو SKU"
                  className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={stockFilter}
                  onChange={(event) => setStockFilter(event.target.value as StockFilter)}
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  {stockFilters.map((filter) => (
                    <option key={filter.value} value={filter.value}>{filter.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => downloadCsv(filteredProducts)}
                className="h-10 rounded-md bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800"
                >
                  CSV
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setSelectedProductId(String(product.id))}
                  className={`grid w-full gap-3 px-4 py-3 text-right transition lg:grid-cols-[72px_1.2fr_120px_120px_120px] lg:items-center ${
                    String(product.id) === String(selectedProduct?.id)
                      ? "bg-emerald-50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <ProductVisual product={product} className="h-16" />
                  <span>
                    <span className="block font-black text-slate-950">{product.name}</span>
                    <span className="mt-1 block text-sm text-slate-500">{product.sku} / {product.category}</span>
                  </span>
                  <span className="text-sm font-bold text-slate-700">{formatter.format(product.price)}</span>
                  <span className={`text-sm font-bold ${product.stock <= 20 ? "text-rose-700" : "text-emerald-700"}`}>
                    {product.stock} وحدة
                  </span>
                  <span className="text-sm text-slate-500">{product.shippingProfile}</span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {view === "product" ? (
          <section className="grid gap-5 rounded-lg border border-slate-200 bg-white p-4 xl:grid-cols-[minmax(0,1fr)_280px]">
            <form onSubmit={saveProduct} className="grid gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-950">إدخال منتج تجاري</h3>
                <p className="mt-1 text-sm text-slate-500">{productStatus || "جاهز للحفظ المحلي أو السحابي"}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-1 text-sm font-bold text-slate-700">
                  اسم المنتج
                  <input
                    value={draft.name}
                    onChange={(event) => updateDraft("name", event.target.value)}
                    className="h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    placeholder="كرتون شحن مقاس صغير"
                  />
                </label>
                <label className="grid gap-1 text-sm font-bold text-slate-700">
                  SKU
                  <input
                    value={draft.sku}
                    onChange={(event) => updateDraft("sku", event.target.value)}
                    className="h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    placeholder="PK-SHP-001"
                  />
                </label>
                <label className="grid gap-1 text-sm font-bold text-slate-700">
                  التصنيف
                  <select
                    value={draft.category}
                    onChange={(event) => updateDraft("category", event.target.value)}
                    className="h-11 rounded-md border border-slate-300 bg-white px-3 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  >
                    {categoryOptions.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-bold text-slate-700">
                  نوع الشحن
                  <select
                    value={draft.shippingProfile}
                    onChange={(event) => updateDraft("shippingProfile", event.target.value)}
                    className="h-11 rounded-md border border-slate-300 bg-white px-3 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {shippingProfiles.map((profile) => (
                      <option key={profile}>{profile}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-bold text-slate-700">
                  السعر
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={draft.price}
                    onChange={(event) => updateDraft("price", event.target.value)}
                    className="h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
                <label className="grid gap-1 text-sm font-bold text-slate-700">
                  المخزون
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={draft.stock}
                    onChange={(event) => updateDraft("stock", event.target.value)}
                    className="h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
              </div>
              <div className="grid gap-3 lg:grid-cols-[1fr_160px]">
                <label className="grid gap-1 text-sm font-bold text-slate-700">
                  وصف المنتج
                  <textarea
                    value={draft.description}
                    onChange={(event) => updateDraft("description", event.target.value)}
                    className="min-h-24 rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
                <label className="grid gap-1 text-sm font-bold text-slate-700">
                  الوزن
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    value={draft.weightKg}
                    onChange={(event) => updateDraft("weightKg", event.target.value)}
                    className="h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
              </div>
              <div className="grid gap-3 lg:grid-cols-[220px_1fr] lg:items-end">
                <ProductVisual
                  product={{
                    id: "preview",
                    name: draft.name || "معاينة المنتج",
                    description: draft.description,
                    category: draft.category,
                    sku: draft.sku,
                    price: toNumber(draft.price),
                    stock: toNumber(draft.stock),
                    weightKg: toNumber(draft.weightKg, 0.25),
                    shippingProfile: draft.shippingProfile,
                    imageUrl: draft.imageUrl,
                  }}
                  className="h-40"
                />
                <div className="grid gap-3">
                  <label className="grid gap-1 text-sm font-bold text-slate-700">
                    صورة المنتج من الجهاز
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => uploadProductImage(event.target.files?.[0])}
                      className="h-11 rounded-md border border-slate-300 bg-white px-3 py-2 font-normal outline-none file:ml-3 file:rounded-md file:border-0 file:bg-emerald-700 file:px-3 file:py-1 file:text-sm file:font-bold file:text-white"
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-bold text-slate-700">
                    أو رابط صورة
                    <input
                      value={draft.imageUrl}
                      onChange={(event) => updateDraft("imageUrl", event.target.value)}
                      className="h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="https://..."
                    />
                  </label>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="h-11 rounded-md bg-indigo-700 px-5 text-sm font-bold text-white transition hover:bg-indigo-800 disabled:bg-slate-300"
                >
                  {isSavingProduct ? "جاري الحفظ..." : "حفظ المنتج"}
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(defaultDraft)}
                  className="h-11 rounded-md border border-slate-300 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  تفريغ
                </button>
              </div>
            </form>

            <aside className="space-y-3">
              <h4 className="text-sm font-black text-slate-700">قوالب تشغيل</h4>
              {productTemplates.map((template) => (
                <button
                  key={template.name}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-right text-sm transition hover:border-indigo-300 hover:bg-indigo-50"
                >
                  <span className="block font-black text-slate-950">{template.name}</span>
                  <span className="mt-1 block text-slate-500">{template.category}</span>
                </button>
              ))}
            </aside>
          </section>
        ) : null}

        {view === "order" ? (
          <section className="grid gap-5 rounded-lg border border-slate-200 bg-white p-4 xl:grid-cols-[minmax(0,1fr)_330px]">
            <div className="grid gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-950">محطة الطلب والدفع</h3>
                <p className="mt-1 text-sm text-slate-500">{checkoutStatus || "الطلب يحسب السعر والشحن والضريبة فورًا"}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-1 text-sm font-bold text-slate-700">
                  المنتج
                  <select
                    value={String(selectedProduct?.id ?? "")}
                    onChange={(event) => setSelectedProductId(event.target.value)}
                    className="h-11 rounded-md border border-slate-300 bg-white px-3 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {catalogProducts.map((product) => (
                      <option key={product.id} value={String(product.id)}>
                        {product.name} - {formatter.format(product.price)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-bold text-slate-700">
                  الكمية
                  <input
                    type="number"
                    min="1"
                    value={checkoutDraft.quantity}
                    onChange={(event) => updateCheckout("quantity", event.target.value)}
                    className="h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
                <label className="grid gap-1 text-sm font-bold text-slate-700">
                  اسم العميل
                  <input
                    value={checkoutDraft.customerName}
                    onChange={(event) => updateCheckout("customerName", event.target.value)}
                    className="h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
                <label className="grid gap-1 text-sm font-bold text-slate-700">
                  الجوال
                  <input
                    value={checkoutDraft.phone}
                    onChange={(event) => updateCheckout("phone", event.target.value)}
                    className="h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="05xxxxxxxx"
                  />
                </label>
                <label className="grid gap-1 text-sm font-bold text-slate-700">
                  المدينة
                  <select
                    value={checkoutDraft.city}
                    onChange={(event) => updateCheckout("city", event.target.value)}
                    className="h-11 rounded-md border border-slate-300 bg-white px-3 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {saudiCities.map((city) => (
                      <option key={city}>{city}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-bold text-slate-700">
                  الحي
                  <input
                    value={checkoutDraft.district}
                    onChange={(event) => updateCheckout("district", event.target.value)}
                    className="h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
              </div>
              <label className="grid gap-1 text-sm font-bold text-slate-700">
                العنوان
                <textarea
                  value={checkoutDraft.address}
                  onChange={(event) => updateCheckout("address", event.target.value)}
                  className="min-h-20 rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              <div>
                <p className="text-sm font-black text-slate-700">طريقة الدفع</p>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.code}
                      type="button"
                      onClick={() => setPaymentMethod(method.code)}
                      className={`rounded-lg border px-3 py-3 text-right text-sm transition ${
                        paymentMethod === method.code
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300"
                      }`}
                    >
                      <span className="block font-black">{method.label}</span>
                      <span className="mt-1 block text-xs">{method.immediate ? "جاهز" : "يتطلب ربط"}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-black text-slate-700">شركة الشحن</p>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {shippingQuotes.map((quote) => (
                    <button
                      key={quote.carrier}
                      type="button"
                      onClick={() => setCarrier(quote.carrier)}
                      className={`rounded-lg border px-3 py-3 text-right text-sm transition ${
                        selectedQuote?.carrier === quote.carrier
                          ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300"
                      }`}
                    >
                      <span className="block font-black">{quote.carrierName}</span>
                      <span className="mt-1 block text-xs">{quote.eta}</span>
                      <span className="mt-2 block font-bold">{formatter.format(quote.total)}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={createOrder}
                disabled={isCreatingOrder || !selectedProduct}
                className="h-12 rounded-md bg-emerald-700 px-5 text-sm font-black text-white transition hover:bg-emerald-800 disabled:bg-slate-300"
              >
                {isCreatingOrder ? "جاري إنشاء الطلب..." : "إنشاء الطلب"}
              </button>
            </div>

            <OrderSummary
              selectedProduct={selectedProduct}
              selectedQuote={selectedQuote}
              quantity={quantity}
              paymentMethod={paymentMethod}
              totals={totals}
            />
          </section>
        ) : null}

        {view === "fulfillment" ? (
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-950">الشحن والتجهيز</h3>
                <p className="mt-1 text-sm text-slate-500">تسعير فوري وبوليصة حية عند إضافة المفاتيح</p>
              </div>
              <span className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900">
                الوزن المحاسبي يبدأ من 1 كجم
              </span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {carriers.map((shippingCarrier) => (
                <article key={shippingCarrier.code} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-black text-slate-950">{shippingCarrier.name}</h4>
                      <p className="mt-1 text-sm text-slate-500">{shippingCarrier.service}</p>
                    </div>
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-bold ${
                        shippingCarrier.liveReady
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {shippingCarrier.liveReady ? "جاهز للربط" : "قابل للتفعيل"}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                    <span className="rounded-md bg-white p-2">
                      <span className="block text-slate-500">المدن</span>
                      <strong>{shippingCarrier.etaMajor}</strong>
                    </span>
                    <span className="rounded-md bg-white p-2">
                      <span className="block text-slate-500">رسوم</span>
                      <strong>{formatter.format(shippingCarrier.baseFee)}</strong>
                    </span>
                    <span className="rounded-md bg-white p-2">
                      <span className="block text-slate-500">تحصيل</span>
                      <strong>{shippingCarrier.supportsCod ? "نعم" : "لا"}</strong>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {view === "setup" ? (
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-950">إطلاق التطبيق</h3>
                <p className="mt-1 text-sm text-slate-500">قاعدة البيانات، الدفع، التمويل، والشحن</p>
              </div>
              <span className="rounded-md bg-slate-100 px-3 py-2 text-sm font-black text-slate-800">
                {setupProgress}% مكتمل
              </span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {setupStatus.map((provider) => (
                <article key={provider.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-indigo-700">
                        {integrationTypeLabels[provider.type]}
                      </p>
                      <h4 className="mt-1 font-black text-slate-950">{provider.name}</h4>
                    </div>
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-black ${
                        provider.isConfigured
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {provider.isConfigured
                        ? "مكتمل"
                        : `${provider.configuredKeys}/${provider.envKeys.length}`}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{provider.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {provider.envKeys.map((key) => (
                      <span key={key} className="rounded-md bg-white px-2 py-1 text-xs font-bold text-slate-600">
                        {key}
                      </span>
                    ))}
                  </div>
                  <a
                    href={provider.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex h-9 items-center rounded-md bg-slate-950 px-3 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    {provider.actionLabel}
                  </a>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <aside className="space-y-5">
        <OrderSummary
          selectedProduct={selectedProduct}
          selectedQuote={selectedQuote}
          quantity={quantity}
          paymentMethod={paymentMethod}
          totals={totals}
        />

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-black text-slate-950">آخر الطلبات</h3>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
              {orders.length}
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {orders.length > 0 ? (
              orders.slice(0, 4).map((order) => (
                <article key={order.orderNumber} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-slate-950">{order.orderNumber}</strong>
                    <span className="text-xs text-slate-500">{order.persisted ? "سحابي" : "محلي"}</span>
                  </div>
                  <span className="mt-2 inline-flex rounded-md bg-white px-2 py-1 text-xs font-black text-emerald-900">
                    {getFulfillmentStatus(order.fulfillmentStatus).label}
                  </span>
                  <p className="mt-2 text-slate-600">{order.customerName}</p>
                  <p className="mt-1 font-black text-slate-950">{formatter.format(order.totals.total)}</p>
                  <div className="mt-3 grid grid-cols-3 gap-1">
                    {(["packing", "shipped", "completed"] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => updateOrderStatus(order.orderNumber, status)}
                        className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-800"
                      >
                        {getFulfillmentStatus(status).label}
                      </button>
                    ))}
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">لا توجد طلبات بعد.</p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="font-black text-slate-950">تنبيهات المخزون</h3>
          <div className="mt-4 space-y-2">
            {lowStock.length > 0 ? (
              lowStock.slice(0, 5).map((product) => (
                <article key={product.id} className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">
                  <strong>{product.name}</strong>: {product.stock} وحدة
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">المخزون مستقر.</p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="font-black text-slate-950">إضافة سريعة</h3>
          <div className="mt-4 grid gap-2">
            {productTemplates.map((template) => (
              <button
                key={template.name}
                type="button"
                onClick={() => applyTemplate(template)}
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-right text-sm font-bold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                {template.name}
              </button>
            ))}
          </div>
        </section>
      </aside>
    </section>
  );
}

function ProductVisual({ product, className }: { product: Product; className: string }) {
  return (
    <div
      role="img"
      aria-label={product.name}
      className={`${className} mb-3 rounded-lg border border-slate-200 bg-slate-100 bg-cover bg-center`}
      style={{ backgroundImage: `url("${product.imageUrl || "/products/shipping-box.svg"}")` }}
    />
  );
}

function OrderSummary({
  selectedProduct,
  selectedQuote,
  quantity,
  paymentMethod,
  totals,
}: {
  selectedProduct?: Product;
  selectedQuote?: ReturnType<typeof getCarrierQuotes>[number];
  quantity: number;
  paymentMethod: PaymentMethodCode;
  totals: ReturnType<typeof calculateTotals> | null;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      {selectedProduct ? <ProductVisual product={selectedProduct} className="h-44" /> : null}
      <p className="text-sm font-bold text-slate-500">ملخص الطلب المباشر</p>
      <h3 className="mt-2 text-xl font-black text-slate-950">
        {selectedProduct?.name ?? "اختر منتجًا"}
      </h3>
      <div className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">الكمية</span>
          <strong>{quantity}</strong>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">الدفع</span>
          <strong>{getPaymentLabel(paymentMethod)}</strong>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">الشحن</span>
          <strong>{selectedQuote?.carrierName ?? "-"}</strong>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">المنتجات</span>
            <strong>{formatter.format(totals?.subtotal ?? 0)}</strong>
          </div>
          <div className="mt-2 flex justify-between gap-4">
            <span className="text-slate-500">الشحن والتحصيل</span>
            <strong>
              {formatter.format((totals?.shipping ?? 0) + (totals?.cashOnDeliveryFee ?? 0))}
            </strong>
          </div>
          <div className="mt-2 flex justify-between gap-4">
            <span className="text-slate-500">VAT</span>
            <strong>{formatter.format(totals?.vat ?? 0)}</strong>
          </div>
          <div className="mt-3 flex justify-between gap-4 border-t border-slate-200 pt-3 text-base">
            <span className="font-bold text-slate-600">الإجمالي</span>
            <strong className="text-slate-950">{formatter.format(totals?.total ?? 0)}</strong>
          </div>
        </div>
        {selectedQuote ? (
          <p className="rounded-md bg-emerald-50 px-3 py-2 font-bold text-emerald-900">
            {selectedQuote.eta} / {selectedQuote.trackingNumber}
          </p>
        ) : null}
      </div>
    </section>
  );
}
